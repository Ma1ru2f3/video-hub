const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
const getBaseApiUrl = async () => {
    try {
        const response = await axios.get(
            `https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json`
        );
        return response.data.api;
    } catch (error) {
        console.error('CRITICAL ERROR: Could not fetch base API URL from GitHub. Check internet connection or URL.', error.message);
        throw new Error('Failed to retrieve base API URL. Service unavailable.');
    }
};
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke on the server!');
});
app.get('/api/random-songs', async (req, res) => {
    try {
        const base = await getBaseApiUrl();
        const keywords = ['latest bangla songs', 'trending hits 2024', 'top english pop', 'hindi bollywood hits', 'new rock music', 'hip hop playlist']; 
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const response = await axios.get(`${base}/ytFullSearch?songName=${encodeURIComponent(randomKeyword)}`);
        const randomSongs = Array.isArray(response.data) ? response.data.slice(0, 15) : [];
        if (randomSongs.length === 0) {
            console.warn(`No random songs found for keyword: ${randomKeyword}`);
            return res.status(404).json({ message: 'No random songs found. Try again with different keywords.' });
        }
        res.json(randomSongs);
    } catch (error) {
        console.error('Error in /api/random-songs:', error.message);
        res.status(500).json({ error: 'Failed to fetch random songs.', details: error.message });
    }
});
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Search query parameter is required.' });
    }
    try {
        const base = await getBaseApiUrl();
        const response = await axios.get(`${base}/ytFullSearch?songName=${encodeURIComponent(query)}`);
        const searchResults = Array.isArray(response.data) ? response.data : [];
        if (searchResults.length === 0) {
            return res.status(404).json({ message: `No songs found for query: ${query}` });
        }
        res.json(searchResults);
    } catch (error) {
        console.error(`Error in /api/search for query "${query}":`, error.message);
        res.status(500).json({ error: 'Failed to fetch search results.', details: error.message });
    }
});
app.get('/api/audio', async (req, res) => {
    const { videoId } = req.query;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID parameter is required.' });
    }
    try {
        const base = await getBaseApiUrl();
        const { data } = await axios.get(`${base}/ytDl3?link=${videoId}&format=mp3&quality=3`);
        if (!data || !data.downloadLink) {
            console.warn(`No download link found for videoId: ${videoId}`);
            return res.status(404).json({ message: 'Audio download link not found for this video.' });
        }
        res.json(data);
    } catch (error) {
        console.error(`Error in /api/audio for videoId "${videoId}":`, error.message);
        res.status(500).json({ error: 'Failed to retrieve audio.', details: error.message });
    }
});
app.get('/api/channel-logo', async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) {
        return res.status(400).json({ error: 'Channel ID parameter is required.' });
    }
    try {
        const base = await getBaseApiUrl();
        const response = await axios.get(`${base}/ytChannel?id=${channelId}`);
        if (response.data && response.data.logo && response.data.name) {
            res.json({ 
                logoUrl: response.data.logo,
                channelName: response.data.name
            });
        } else {
            console.warn(`Logo or name not found for channelId: ${channelId}`, response.data);
            res.status(404).json({ message: 'Channel logo or name not found for this ID.' });
        }
    } catch (error) {
        console.error(`Error in /api/channel-logo for channelId "${channelId}":`, error.message);
        res.status(500).json({ error: 'Failed to retrieve channel logo.', details: error.message });
    }
});
app.get('/api/channel-videos', async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) {
        return res.status(400).json({ error: 'Channel ID parameter is required.' });
    }
    try {
        const base = await getBaseApiUrl();
        const response = await axios.get(`${base}/ytChannel?id=${channelId}`);
        const channelVideos = Array.isArray(response.data.videos) ? response.data.videos.slice(0, 20) : [];
        const channelName = response.data.name || 'Unknown Channel';
        if (channelVideos.length === 0) {
            console.warn(`No videos found for channelId: ${channelId}`);
            return res.status(404).json({ message: `No videos found for channel: ${channelName}.` });
        }
        res.json({ channelName, videos: channelVideos });
    } catch (error) {
        console.error(`Error in /api/channel-videos for channelId "${channelId}":`, error.message);
        res.status(500).json({ error: 'Failed to fetch channel videos.', details: error.message });
    }
});
app.use((req, res) => {
    res.status(404).send('404: The requested resource was not found.');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});