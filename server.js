const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Asynchronous function to fetch the base API URL from a GitHub Gist
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
            // Fetch trending videos and limit to 10 results
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

// API endpoint for general video search
app.get('/search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            // Search for videos based on the user's query and limit to 10 results
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

// API endpoint to get a direct video link
app.get('/video-link-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            // Use the external API to get a direct MP4 download link for the video
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

// API endpoint to fetch related videos
app.get('/related-videos-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            // Fetch related videos from the external API and limit to 7 results
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

// NEW: API endpoint for music search
app.get('/music-search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        // If no query is provided, fetch a default list of trending songs
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
        // If a query is provided, search for specific songs
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

// NEW: API endpoint to get a direct song link
app.get('/song-link-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = await baseApiUrl();
        if (apiBase) {
            // Use the external API to get a direct MP3 download link for the song's audio
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