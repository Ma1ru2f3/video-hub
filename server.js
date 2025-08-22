const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// YouTube ভিডিওর সময়কাল পার্স করার জন্য একটি ফাংশন
const parseDuration = (timestamp) => {
  const parts = timestamp.split(':').map(part => parseInt(part));
  let seconds = 0;
  if (parts.length === 3) {
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    seconds = parts[0] * 60 + parts[1];
  }
  return seconds;
};

// Search API Endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Search query (q) is required' });
  }

  try {
    const searchResponse = await axios.get(`https://www.x-noobs-apis.42web.io/mostakim/ytSearch?search=${encodeURIComponent(query)}`);
    const filteredVideos = searchResponse.data.filter(video => {
      try {
        const totalSeconds = parseDuration(video.timestamp);
        return totalSeconds < 600; // 10 মিনিটের নিচে
      } catch {
        return false;
      }
    });

    if (filteredVideos.length === 0) {
      return res.status(404).json({ error: 'No videos under 10 minutes found.' });
    }

    res.json(filteredVideos);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while searching.' });
  }
});

// Play (Download) API Endpoint
app.get('/play', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL (url) is required' });
  }

  try {
    const apiResponse = await axios.get(`https://www.x-noobs-apis.42web.io/m/sing?url=${encodeURIComponent(videoUrl)}`);

    if (!apiResponse.data.url) {
      throw new Error('No audio URL found in response');
    }
    
    // সরাসরি অডিও URL রিডাইরেক্ট করা হচ্ছে
    res.redirect(apiResponse.data.url);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while getting the audio file.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});