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

// API endpoint for search
app.get('/search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Search query is required.' });

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const searchResults = (await axios.get(`${apiBase}/ytFullSearch?songName=${query}`)).data.slice(0, 6);
            res.json(searchResults);
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while searching. Please try again later.' });
    }
});

// API endpoint for video info
app.get('/info-api', async (req, res) => {
    const videoID = req.query.v;
    if (!videoID) return res.status(400).json({ error: 'Video ID is required.' });

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            const { data } = await axios.get(`${apiBase}/ytfullinfo?videoID=${videoID}`);
            const videoInfo = {
                title: data.title,
                duration: (data.duration / 60).toFixed(2),
                view_count: data.view_count,
                like_count: data.like_count,
                comment_count: data.comment_count,
                thumbnail: data.thumbnail
            };
            res.json(videoInfo);
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to retrieve video info. Please check the video ID.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
