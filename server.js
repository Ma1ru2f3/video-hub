const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Helper function to get the base API URL
const baseApiUrl = async () => {
    try {
        const response = await axios.get(
            `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
        );
        return response.data.api;
    } catch (err) {
        console.error('Error fetching base API URL:', err.message);
        throw new Error('Failed to connect to the API server.');
    }
};

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Search endpoint
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const maxResults = 10;
        const apiUrl = await baseApiUrl();
        const results = (await axios.get(`${apiUrl}/ytFullSearch?songName=${encodeURIComponent(query)}`)).data.slice(0, maxResults);

        if (results.length === 0) {
            return res.status(404).json({ message: `No results found for "${query}".` });
        }

        const formattedResults = results.map(video => ({
            id: video.id,
            title: video.title,
            duration: video.time,
            channel: video.channel.name,
            thumbnail: video.thumbnail
        }));

        res.json(formattedResults);
    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({ error: 'An error occurred during search. Please try again later.' });
    }
});

// Info endpoint
app.get('/api/info', async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiUrl = await baseApiUrl();
        const { data } = await axios.get(`${apiUrl}/ytfullinfo?videoID=${id}`);
        
        const formattedInfo = {
            title: data.title,
            duration: data.duration,
            viewCount: data.view_count,
            likes: data.like_count,
            channel: data.channel,
            subscribers: data.channel_follower_count,
            thumbnail: data.thumbnail
        };

        res.json(formattedInfo);
    } catch (error) {
        console.error('Info error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve video info.' });
    }
});

// Download endpoint
app.get('/api/download', async (req, res) => {
    const { id, format } = req.query;
    if (!id || !format || !['mp4', 'mp3'].includes(format)) {
        return res.status(400).json({ error: 'Video ID and a valid format (mp4/mp3) are required.' });
    }

    try {
        const apiUrl = await baseApiUrl();
        const { data: { title, downloadLink } } = await axios.get(`${apiUrl}/ytDl3?link=${id}&format=${format}&quality=3`);
        
        const response = await axios({
            method: 'get',
            url: downloadLink,
            responseType: 'stream'
        });
        
        const filename = `${title.replace(/[\\/:"*?<>|]/g, '').slice(0, 50)}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);

    } catch (error) {
        console.error('Download error:', error.message);
        res.status(500).json({ error: 'Failed to download the file. The video might be restricted or unavailable.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});