const express = require('express');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Use CORS to allow requests from your front-end
app.use(cors());

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
error('Stream error:', error);
        res.status(500).send('Failed to stream video.');
    }
});

// Get trending videos (Placeholder)
app.get('/ytb/trending', async (req, res) => {
    try {
        // This is a placeholder for fetching trending videos.
        // A real implementation would use a service like YouTube's official API.
        const trendingVideos = [
            {
                id: 'dQw4w9WgXcQ',
                title: 'Never Gonna Give You Up',
                thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
                channel: { name: 'Rick Astley' },
                time: '3:33'
            },
            {
                id: 'mCdq_B_z1dM',
                title: 'PSY - GANGNAM STYLE',
                thumbnail: 'https://i.ytimg.com/vi/mCdq_B_z1dM/hqdefault.jpg',
                channel: { name: 'officialpsy' },
                time: '4:12'
            },
            {
                id: 'v_zL29c5L3o',
                title: 'Baby Shark Dance',
                thumbnail: 'https://i.ytimg.com/vi/v_zL29c5L3o/hqdefault.jpg',
                channel: { name: 'Pinkfong Baby Shark' },
                time: '2:16'
            },
            // Add more trending videos here
        ];
        res.json(trendingVideos);
    } catch (error) {
        console.error('Trending error:', error);
        res.status(500).json({ error: 'Failed to fetch trending videos.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});