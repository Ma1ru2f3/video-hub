
// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Added for cross-origin requests
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// The base URL for the external YouTube API
// NOTE: Ensure this URL is correct and the API is active.
const baseApiUrl = 'https://yt-api-dipto.onrender.com';

// Endpoint to handle song search
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    try {
        const response = await axios.get(`${baseApiUrl}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        // The API returns a direct array, we send it directly
        res.json(response.data);
    } catch (error) {
        console.error('Error during search:', error.message);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

// Endpoint to handle audio streaming
app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
    }
    try {
        const apiResponse = await axios.get(`${baseApiUrl}/ytDl3?link=${videoId}&format=mp3&quality=3`);
        const downloadLink = apiResponse.data.downloadLink;

        if (!downloadLink) {
            return res.status(404).json({ error: 'Download link not found for the video.' });
        }

        // Stream the audio directly to the client
        const streamResponse = await axios({
            method: 'get',
            url: downloadLink,
            responseType: 'stream',
        });

        // Set content type and pipe the stream
        res.setHeader('Content-Type', 'audio/mpeg');
        streamResponse.data.pipe(res);
    } catch (error) {
        console.error('Error during streaming:', error.message);
        res.status(500).json({ error: 'Failed to stream audio' });
    }
});

// A route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});