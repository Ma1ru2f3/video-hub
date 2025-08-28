const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Hardcoded user data to simulate a database.
let users = {
    'mymaruf94@gmail.com': { password: 'admin_password', status: 'active', role: 'admin' },
    'user1@example.com': { password: 'user1_password', status: 'active', role: 'user' },
    'blocked@example.com': { password: 'user_password', status: 'blocked', role: 'user' }
};

const isAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const email = authHeader && authHeader.split(' ')[1];
    if (email !== 'mymaruf94@gmail.com') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    next();
};

app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    if (users[email]) {
        return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
    users[email] = { password, status: 'active', role: 'user' };
    console.log(`New user registered: ${email}`);
    res.json({ success: true, message: 'Registration successful. Please log in.' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users[email];
    if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (user.status === 'blocked') {
        return res.status(403).json({ success: false, message: 'Your account has been blocked.' });
    }
    res.json({ success: true, message: 'Login successful', user: { email: user.email, status: user.status } });
});

// New search endpoint using yt-search
app.get('/api/songs/search', async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required.' });
    }
    try {
        const r = await yts(query);
        const videos = r.videos;
        if (!videos || videos.length === 0) {
            return res.status(404).json({ success: false, message: 'No songs found.' });
        }
        const songs = videos.map(video => ({
            id: video.videoId,
            title: video.title,
            thumbnail: video.image,
            channel: video.author.name
        }));
        res.json({ success: true, data: songs.slice(0, 30) });
    } catch (error) {
        console.error('YouTube search error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to search for songs.' });
    }
});

// New download endpoint using ytdl-core
app.get('/api/songs/download', async (req, res) => {
    const { link } = req.query;
    if (!link) {
        return res.status(400).json({ success: false, message: 'Video ID (link) is required.' });
    }
    try {
        if (!ytdl.validateID(link)) {
            return res.status(400).json({ success: false, message: 'Invalid video ID.' });
        }
        const videoInfo = await ytdl.getInfo(link);
        const title = videoInfo.videoDetails.title.replace(/[|/:*?"<>]/g, '');
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        ytdl(link, { quality: 'lowestaudio', filter: 'audioonly' }).pipe(res);
    } catch (error) {
        console.error('Download stream error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to download audio.' });
    }
});

app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    const adminUser = users[email];
    if (adminUser && adminUser.role === 'admin' && adminUser.password === password) {
        res.json({ success: true, message: 'Login successful', role: 'admin' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/admin/users', isAdmin, (req, res) => {
    const userList = Object.keys(users).map(email => ({
        email: email,
        status: users[email].status,
        role: users[email].role
    }));
    res.json({ success: true, users: userList });
});

app.post('/admin/user/status', isAdmin, (req, res) => {
    const { email, status } = req.body;
    if (!users[email]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    users[email].status = status;
    res.json({ success: true, message: `User ${email} status changed to ${status}.` });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});