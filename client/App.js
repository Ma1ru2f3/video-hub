import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import axios from 'axios';

const clientId = '5f58987fa12448b48fe797c32c76dad9';
const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
const discovery = AuthSession.useAutoDiscovery('https://developer.spotify.com/documentation/embeds4');

const authUrl =
  'https://developer.spotify.com/documentation/embeds5' +
  '?response_type=code' +
  '&client_id=' +
  clientId +
  (redirectUri ? '&redirect_uri=' + encodeURIComponent(redirectUri) : '') +
  '&scope=' + encodeURIComponent('user-read-private user-read-email');

function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    if (!code) return;
    axios.post('http://localhost:5000/api/login', { code })
      .then(res => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setExpiresIn(res.data.expiresIn);
      })
      .catch((err) => {
        console.error('Login error:', err);
      });
  }, [code]);

  useEffect(() => {
    if (!refreshToken || !expiresIn) return;

    const interval = setInterval(() => {
      axios.post('http://localhost:5000/api/refresh', { refreshToken })
        .then(res => {
          setAccessToken(res.data.accessToken);
          setExpiresIn(res.data.expiresIn);
        })
        .catch((err) => {
          console.error('Refresh token error:', err);
        });
    }, (expiresIn - 60) * 1000);

    return () => clearInterval(interval);
  }, [refreshToken, expiresIn]);

  return accessToken;
}

export default function App() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId,
      scopes: ['user-read-private', 'user-read-email', 'playlist-read-private'],
      redirectUri: redirectUri,
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      console.log('Authorization code:', code);
    }
  }, [response]);

  const handleLogin = async () => {
    const result = await promptAsync();
    if (result.type !== 'success') {
      console.log('Authentication failed.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Hub</Text>
      <Button
        title="Login with Spotify"
        onPress={handleLogin}
      />
      <Text style={styles.subtext}>
        {response?.type === 'success' ? 'Logged in successfully!' : 'Please log in to continue.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  subtext: {
    color: '#b3b3b3',
    marginTop: 10,
  },
});
