const express = require('express');
const axios = require('axios');
const cors = require('cors'); // To allow requests from your frontend

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Function to get the base API URL
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
  );
  return base.data.api;
};

// Endpoint for random songs
app.get('/api/random-songs', async (req, res) => {
  try {
    const base = await baseApiUrl();
    const keywords = ['latest songs', 'trending songs', 'top hits', 'chill beats', 'rock ballads']; // Some random keywords
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const response = await axios.get(`${base}/ytFullSearch?songName=${encodeURIComponent(randomKeyword)}`);
    const randomSongs = response.data.slice(0, 15);
    res.json(randomSongs);
  } catch (error) {
    console.error('Error fetching random songs:', error);
    res.status(500).json({ error: 'Failed to fetch random songs.' });
  }
});

// Endpoint for search functionality
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required.' });
  }
  try {
    const base = await baseApiUrl();
    const response = await axios.get(`${base}/ytFullSearch?songName=${encodeURIComponent(query)}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Failed to fetch search results.' });
  }
});

// Endpoint to get audio URL
app.get('/api/audio', async (req, res) => {
  const { videoId } = req.query;
  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required.' });
  }
  try {
    const base = await baseApiUrl();
    const { data } = await axios.get(`${base}/ytDl3?link=${videoId}&format=mp3&quality=3`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching audio link:', error);
    res.status(500).json({ error: 'Failed to retrieve audio.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});