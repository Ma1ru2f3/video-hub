const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// This is the base URL for the external API that handles YouTube data.
const baseApiUrl = "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json";

// Serves the HTML file for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serves the watch.html file for watching videos
app.get('/watch.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'watch.html'));
});

// API endpoint for searching YouTube videos
app.get('/ytb/search', async (req, res) => {
    const keyWord = req.query.q;
    if (!keyWord) {
        return res.status(400).json({ error: 'Search query (q) is required' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const maxResults = 6;
        const result = (await axios.get(`${apiBase}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, maxResults);

        if (result.length === 0) {
            return res.status(404).json({ error: 'No search results match the keyword.' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred during search: ' + err.message });
    }
});

// New endpoint for streaming video
app.get('/ytb/stream', async (req, res) => {
    const videoID = req.query.id;
    const format = req.query.format || 'mp4'; // Default to mp4 if not specified
    if (!videoID) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const { data } = await axios.get(`${apiBase}/ytDl3?link=${videoID}&format=${format}&quality=3`);
        
        if (!data.downloadLink) {
            return res.status(500).json({ error: 'Video stream link not found.' });
        }
        
        // Redirect the browser to the direct video link for streaming
        res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
        res.redirect(data.downloadLink);
    } catch (e) {
        res.status(500).json({ error: 'Failed to get video stream. Please try again later.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});