const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Warning: Hardcoding API keys and sensitive data is not a secure practice.
// For production, use environment variables.
const YOUTUBE_API_KEY = 'AIzaSyAPyj8OiXR5Int5qtNwsIsBEOcD-Isxqa8';

// Hardcoded user data to simulate a database.
// This data will be lost on server restart.
let users = {
    'mymaruf94@gmail.com': { password: 'admin_password', status: 'active', role: 'admin' },
    'user1@example.com': { password: 'user1_password', status: 'active', role: 'user' },
    'blocked@example.com': { password: 'user_password', status: 'blocked', role: 'user' }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    // For this mock implementation, we'll check against a hardcoded admin email
    const authHeader = req.headers['authorization'];
    const email = authHeader && authHeader.split(' ')[1]; // Assuming 'Bearer <email>'

    if (email !== 'mymaruf94@gmail.com') {
        return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Serve the index.html file from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Authentication API Endpoints ---
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

// --- Music API Endpoints ---
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
    const adminUser = users[email];
    if (adminUser && adminUser.role === 'admin' && adminUser.password === password) {
        res.json({ success: true, message: 'Login successful', role: 'admin' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Get user list (Admin only)
app.get('/admin/users', isAdmin, (req, res) => {
    const userList = Object.keys(users).map(email => ({
        email: email,
        status: users[email].status,
        role: users[email].role
    }));
    res.json({ success: true, users: userList });
});

// Block/Unblock user (Admin only)
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