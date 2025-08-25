const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public')); // যদি আপনার index.html public ফোল্ডারে থাকে

app.get('/search-api', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const results = await ytdl.getInfo(query);
        const videos = results.related_videos;
        res.json(videos.filter(v => v.type === 'video')); // Only return video results
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});