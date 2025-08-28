// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Your external API endpoint
const baseApiUrl = 'https://yt-api-dipto.onrender.com';

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    try {
        const response = await axios.get(`${baseApiUrl}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error during search:', error.message);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

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

        const streamResponse = await axios({
            method: 'get',
            url: downloadLink,
            responseType: 'stream',
        });

        res.setHeader('Content-Type', 'audio/mpeg');
        streamResponse.data.pipe(res);
    } catch (error) {
        console.error('Error during streaming:', error.message);
        res.status(500).json({ error: 'Failed to stream audio' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});