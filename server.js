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

// নতুন: মিউজিক খোঁজার জন্য API endpoint
app.get('/music-search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        // যদি কোনো query না দেওয়া হয়, তাহলে trending songs-এর একটি ডিফল্ট তালিকা আনুন
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
            res.status(500).json({ error: 'An error occurred while fetching trending songs.' });
        }
    } else {
        // যদি একটি query দেওয়া হয়, তাহলে নির্দিষ্ট গানগুলি খুঁজুন
        try {
            const apiBase = await baseApiUrl();
            if (apiBase) {
                const searchResults = (await axios.get(`${apiBase}/ytFullSearch?songName=${query} audio`)).data.slice(0, 10);
                res.json(searchResults);
            } else {
                res.status(500).json({ error: 'Failed to get API URL.' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while searching for music. Please try again later.' });
        }
    }
});

// নতুন: গানের সরাসরি লিঙ্ক পাওয়ার জন্য API endpoint
app.get('/song-link-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            // গানের অডিওর জন্য সরাসরি MP3 ডাউনলোড লিঙ্ক পেতে এক্সটার্নাল API ব্যবহার করুন
            const { data: { downloadLink } } = await axios.get(`${apiBase}/ytDl3?link=${videoId}&format=mp3&quality=1`);
            res.json({ audioUrl: downloadLink });
        } else {
            res.status(500).json({ error: 'Failed to get API URL.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching song link.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});