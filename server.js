const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Warning: Hardcoding API keys is not a secure practice.
// For production, use environment variables as shown in a previous response.
const YOUTUBE_API_KEY = 'AIzaSyAPyj8OiXR5Int5qtNwsIsBEOcD-Isxqa8';

// Hardcoded admin and user data
// In a real application, this should be stored in a database
let users = [
    { email: 'mymaruf94@gmail.com', status: 'active', role: 'admin' },
    { email: 'user1@example.com', status: 'active', role: 'user' },
    { email: 'blocked@example.com', status: 'blocked', role: 'user' }
];

// Admin login check
const isAdmin = (req, res, next) => {
    const { email } = req.body;
    const user = users.find(u => u.email === email && u.role === 'admin');
    if (!user) {
        return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    req.user = user;
    next();
};

// Serve the index.html file from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API to get random songs
app.get('/api/songs/random', async (req, res) => {
    try {
        const youtube = google.youtube({
            version: 'v3',
            auth: YOUTUBE_API_KEY,
        });

        const queryTerms = ['Bangladeshi music', 'Indian pop songs', 'New Bangla songs', 'English songs'];
        const randomQuery = queryTerms[Math.floor(Math.random() * queryTerms.length)];

        const response = await youtube.search.list({
            part: 'snippet',
            q: randomQuery,
            type: 'video',
            maxResults: 30,
            videoCategoryId: '10', // Music category
            order: 'viewCount'
        });

        const songs = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channel: item.snippet.channelTitle
        }));

        res.json({ success: true, data: songs });
    } catch (error) {
        console.error('YouTube API Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// API to search for songs
app.get('/api/songs/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ success: false, message: 'Search query is required.' });
    }

    try {
        const youtube = google.youtube({
            version: 'v3',
            auth: YOUTUBE_API_KEY,
        });

        const response = await youtube.search.list({
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 30,
            videoCategoryId: '10' // Music category
        });

        const songs = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channel: item.snippet.channelTitle
        }));

        res.json({ success: true, data: songs });
    } catch (error) {
        console.error('YouTube API Error:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// --- Admin Dashboard API Routes ---

// Admin login
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'mymaruf94@gmail.com' && password === 'admin_password') { // Use a secure password
        res.json({ success: true, message: 'Login successful', role: 'admin' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get user list (Admin only)
app.get('/admin/users', isAdmin, (req, res) => {
    res.json({ success: true, users });
});

// Block/Unblock user (Admin only)
app.post('/admin/user/status', isAdmin, (req, res) => {
    const { email, status } = req.body;
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    users[userIndex].status = status;
    res.json({ success: true, message: `User ${email} status changed to ${status}.` });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});