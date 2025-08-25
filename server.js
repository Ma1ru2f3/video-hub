const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// API URL from GitHub Gist
const baseApiUrl = async () => {
    try {
        const base = await axios.get(
            `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
        );
        return base.data.api;
    } catch (e) {
        console.error("Failed to fetch base API URL:", e);
        return null;
    }
};

// API endpoint for homepage trending videos
app.get('/home-api', async (req, res) => {
    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const searchResults = (await axios.get(`${apiBase}/ytFullSearch?songName=trending songs`)).data.slice(0, 10);
            res.json(searchResults);
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching trending videos.' });
    }
});

// API endpoint for search
app.get('/search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const searchResults = (await axios.get(`${apiBase}/ytFullSearch?songName=${query}`)).data.slice(0, 10);
            res.json(searchResults);
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while searching. Please try again later.' });
    }
});

// NEW: API endpoint to get a direct video link
app.get('/video-link-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const { data: { downloadLink } } = await axios.get(`${apiBase}/ytDl3?link=${videoId}&format=mp4&quality=3`);
            res.json({ videoUrl: downloadLink });
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching video link.' });
    }
});

// NEW: API endpoint to fetch related videos
app.get('/related-videos-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const relatedVideos = (await axios.get(`${apiBase}/ytRelated?videoId=${videoId}`)).data.slice(0, 7);
            res.json(relatedVideos);
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching related videos.' });
    }
});

// NEW: API endpoint to get video info (including duration)
app.get('/video-info-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            // This is a mock implementation. The actual API may not have a direct endpoint for this.
            // In a real-world scenario, you would have an endpoint that returns video metadata.
            const response = await axios.get(`${apiBase}/ytFullSearch?songName=${videoId}`);
            const videoInfo = response.data.find(v => v.videoId === videoId);

            if (videoInfo && videoInfo.duration) {
                res.json({
                    id: videoInfo.videoId,
                    duration: videoInfo.duration
                });
            } else {
                res.status(404).json({ error: 'Video information not found.' });
            }
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching video info.' });
    }
});

// NEW: API endpoint to get direct audio link
app.get('/audio-link-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }
    
    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const { data: { downloadLink } } = await axios.get(`${apiBase}/ytDl3?link=${videoId}&format=mp3`);
            res.json({ audioUrl: downloadLink });
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching audio link.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});