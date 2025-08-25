import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Replace with your actual Spotify Client ID
const clientId = '5f58987fa12448b48fe797c32c76dad9';
// Development redirect URI
const redirectUri = 'http://localhost:3000'; 
const authUrl =
  'https://developer.spotify.com/documentation/embeds7' +
  '?response_type=code' +
  '&client_id=' +
  clientId +
  '&redirect_uri=' +
  encodeURIComponent(redirectUri) +
  '&scope=' + encodeURIComponent('user-read-private user-read-email');

function useAuth(code) {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [expiresIn, setExpiresIn] = useState();

  useEffect(() => {
    if (!code) return;
    // এখানে URL পরিবর্তন করা হয়েছে
    axios.post('https://video-hub-1-jp08.onrender.com/api/login', { code })
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
      // এখানেও URL পরিবর্তন করা হয়েছে
      axios.post('https://video-hub-1-jp08.onrender.com/api/refresh', { refreshToken })
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

const code = new URLSearchParams(window.location.search).get('code');

function App() {
  const accessToken = useAuth(code);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Hub</h1>
        {accessToken ? (
          <p>Logged in successfully!</p>
        ) : (
          <a href={authUrl}>Login with Spotify</a>
        )}
      </header>
    </div>
  );
}

export default App;