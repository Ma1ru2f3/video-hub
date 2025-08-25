const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const baseApiUrl = "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json";

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ytb/search', async (req, res) => {
    const keyWord = req.query.q;
    if (!keyWord) {
        return res.status(400).json({ error: 'Search query (q) is required' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const maxResults = 6;
        const result = (await axios.get(`${apiBase}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`)).data.slice(0, maxResults);

        if (result.length === 0) {
            return res.status(404).json({ error: 'No search results match the keyword.' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred during search: ' + err.message });
    }
});

app.get('/ytb/download', async (req, res) => {
    const videoID = req.query.id;
    const format = req.query.format;

    if (!videoID || !format) {
        return res.status(400).json({ error: 'Video ID and format are required.' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const { data } = await axios.get(`${apiBase}/ytDl3?link=${videoID}&format=${format}&quality=3`);

        if (!data.downloadLink) {
            return res.status(500).json({ error: 'Download link not found.' });
        }

        res.json({
            title: data.title,
            quality: data.quality,
            url: data.downloadLink
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to download the file. Please try again later.' });
    }
});

// নতুন এন্ডপয়েন্ট ভিডিও স্ট্রিম করার জন্য
app.get('/ytb/stream', async (req, res) => {
    const videoID = req.query.id;
    if (!videoID) {
        return res.status(400).json({ error: 'Video ID is required.' });
    }

    try {
        const apiBase = (await axios.get(baseApiUrl)).data.api;
        const { data } = await axios.get(`${apiBase}/ytDl3?link=${videoID}&format=mp4&quality=3`);

        if (!data.downloadLink) {
            return res.status(500).json({ error: 'Video stream link not found.' });
        }
        
        // ব্রাউজারকে সরাসরি ভিডিও ফাইল দেখানোর জন্য রিডাইরেক্ট করা
        res.setHeader('Content-Type', 'video/mp4');
        res.redirect(data.downloadLink);
    } catch (e) {
        res.status(500).json({ error: 'Failed to get video stream. Please try again later.' });
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});