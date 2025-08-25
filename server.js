const express = require('express');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Use CORS to allow requests from your front-end
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Search for videos
app.get('/ytb/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "q" is required.' });
        }

        const filters = await ytsr.getFilters(query);
        const filter = filters.get('Type').get('Video');
        const searchResults = await ytsr(filter.url, { limit: 20 });

        const videos = searchResults.items.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.thumbnails[0].url,
            channel: { name: item.author.name },
            time: item.duration
        }));

        res.json(videos);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to fetch search results.' });
    }
});

// Stream video or audio
app.get('/ytb/stream', async (req, res) => {
    const videoId = req.query.id;
    const format = req.query.format || 'mp4'; // Default to mp4

    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        let stream;
        let options = { quality: 'highest' };

        if (format === 'mp3') {
            options.filter = 'audioonly';
            res.header('Content-Disposition', `attachment; filename="${videoId}.mp3"`);
            res.header('Content-Type', 'audio/mpeg');
        } else {
            options.filter = 'videoandaudio';
            res.header('Content-Type', 'video/mp4');
        }

        stream = ytdl(videoId, options);
        stream.pipe(res);
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).send('Failed to stream video.');
    }
});

// Get real trending videos
app.get('/ytb/trending', async (req, res) => {
    try {
        const filters = await ytsr.getFilters('trending');
        const filter = filters.get('Type').get('Video');
        const searchResults = await ytsr(filter.url, { limit: 20 });

        const videos = searchResults.items.map(item => ({
            id: item.id,
            title: item.title,
            thumbnail: item.thumbnails[0].url,
            channel: { name: item.author.name },
            time: item.duration
        }));

        res.json(videos);
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending videos.' });
    }
});

// Get related videos based on video ID
app.get('/ytb/related', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const info = await ytdl.getInfo(videoId);
        const relatedVideos = info.related_videos.slice(0, 6).map(video => ({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnails[0].url,
            channel: { name: video.author.name }
        }));

        res.json(relatedVideos);
    } catch (error) {
        console.error('Related videos error:', error);
        res.status(500).json({ error: 'Failed to fetch related videos.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});