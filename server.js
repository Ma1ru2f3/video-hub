const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to get the base API URL
const baseApiUrl = async () => {
    try {
        const response = await axios.get(
            `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
        );
        return response.data.api;
    } catch (error) {
        console.error('Error fetching base API URL:', error);
        throw new Error('Failed to get base API URL.');
    }
};

// Endpoint for random songs
app.get('/api/random-songs', async (req, res) => {
    try {
        const base = await baseApiUrl();
        const keywords = ['latest songs', 'trending songs', 'top hits', 'bangla songs', 'hindi songs', 'english pop']; 
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

// Handle 404 errors (optional but good practice)
app.use((req, res) => {
    res.status(404).send('404: Not Found');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});