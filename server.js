const express = require('express');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).send({ error: 'Search query is required.' });
    }
    
    try {
        const filters = await ytsr.getFilters(query);
        const videoFilter = filters.get('Type').find(o => o.name === 'Video');
        if (!videoFilter) {
             return res.send([]);
        }
        const searchResults = await ytsr(videoFilter.url, { limit: 10 });
        const filteredResults = searchResults.items.filter(item => {
            if (item.type === 'video') {
                const totalSeconds = parseDuration(item.duration);
                return totalSeconds < 600;
            }
            return false;
        }).map(item => ({
            title: item.title,
            url: item.url,
            thumbnail: item.bestThumbnail.url,
            channelTitle: item.author ? item.author.name : 'Unknown',
            timestamp: item.duration,
        }));
        res.send(filteredResults);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send({ error: 'An error occurred during search.' });
    }
});

app.get('/play', async (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send({ error: 'Video URL is required.' });
    }
    
    try {
        if (!ytdl.validateURL(url)) {
            return res.status(400).send({ error: 'Invalid YouTube URL.' });
        }
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly' });
        if (!format) {
            return res.status(404).send({ error: 'No audio format found.' });
        }
        res.header('Content-Type', 'audio/mpeg');
        ytdl(url, { format: format }).pipe(res);
    } catch (error) {
        console.error('Play error:', error);
        res.status(500).send({ error: 'An error occurred during playback.' });
    }
});

function parseDuration(timestamp) {
    if (!timestamp) return 0;
    const parts = timestamp.split(':').map(part => parseInt(part));
    let seconds = 0;
    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    }
    return seconds;
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
