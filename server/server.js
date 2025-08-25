const express = require('express');
const cors = require('cors');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000'
});

app.post('/api/login', async (req, res) => {
  const code = req.body.code;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    res.json({
      accessToken: data.body.access_token,
      refreshToken: data.body.refresh_token,
      expiresIn: data.body.expires_in
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/api/refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken;
  spotifyApi.setRefreshToken(refreshToken);
  try {
    const data = await spotifyApi.refreshAccessToken();
    res.json({
      accessToken: data.body.access_token,
      expiresIn: data.body.expires_in
    });
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});