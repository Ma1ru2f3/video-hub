const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const baseApiUrl = 'https://yt-api-dipto.onrender.com'; // Replace with your actual base API URL

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
    }
    try {
        const response = await axios.get(`${baseApiUrl}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
    }
    try {
        const response = await axios.get(`${baseApiUrl}/ytDl3?link=${videoId}&format=mp3&quality=3`);
        const downloadLink = response.data.downloadLink;
        const streamResponse = await axios.get(downloadLink, { responseType: 'stream' });
        streamResponse.data.pipe(res);
    } catch (error) {
        console.error('Error during streaming:', error);
        res.status(500).json({ error: 'Failed to stream audio' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});