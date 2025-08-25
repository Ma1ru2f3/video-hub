const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // যদি আপনার index.html public ফোল্ডারে থাকে

// Search API Endpoint (গান খোঁজার জন্য)
app.get('/search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const results = await ytdl.search(query, { limit: 10 });
        const videos = results.map(video => ({
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnails[0].url,
            author: { name: video.author.name }
        }));
        res.json(videos);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

// Audio Link API Endpoint (গানের অডিও URL পাওয়ার জন্য)
app.get('/audio-link-api', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) {
        return res.status(400).json({ error: 'Video ID parameter "id" is required' });
    }

    try {
        const info = await ytdl.getInfo(videoId);
        const audioFormat = ytdl.chooseFormat(info.formats, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });

        if (audioFormat) {
            res.json({ audioUrl: audioFormat.url });
        } else {
            res.status(404).json({ error: 'Audio not found' });
        }
    } catch (error) {
        console.error('Audio link error:', error);
        res.status(500).json({ error: 'Failed to get audio link' });
    }
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});