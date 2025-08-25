const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// External API URL
const baseApiUrl = "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json";

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the watch.html file
app.get('/watch.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'watch.html'));
});

// API endpoint for searching YouTube videos
app.get('/ytb/search', async (req, res) => {
    const keyWord = req.query.q;
    if (!keyWord) {
        return res.status(400).json({ error: 'Search query (q) is required' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const result = (await axios.get(`${apiBase}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data;

        // Filter out shorts (videos with time <= 60 seconds)
        const longVideos = result.filter(video => {
            if (video.time) {
                const timeParts = video.time.split(':').map(Number);
                let totalSeconds;
                if (timeParts.length === 3) {
                    totalSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
                } else if (timeParts.length === 2) {
                    totalSeconds = timeParts[0] * 60 + timeParts[1];
                }
                return totalSeconds > 60;
            }
            return false;
        });
        
        // Show only the first 6 long videos
        const limitedResults = longVideos.slice(0, 6);

        if (limitedResults.length === 0) {
            return res.status(404).json({ error: 'No long videos found for the keyword.' });
        }
        res.json(limitedResults);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred during search: ' + err.message });
    }
});

// New endpoint for streaming video
app.get('/ytb/stream', async (req, res) => {
    const videoID = req.query.id;
    const format = req.query.format || 'mp4';
    if (!videoID) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const { data } = await axios.get(`${apiBase}/ytDl3?link=${videoID}&format=${format}&quality=3`);
        
        if (!data.downloadLink) {
            return res.status(500).json({ error: 'Video stream link not found.' });
        }
        
        res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');
        res.redirect(data.downloadLink);
    } catch (e) {
        res.status(500).json({ error: 'Failed to get video stream. Please try again later.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});