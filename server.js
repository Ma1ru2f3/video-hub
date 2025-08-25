const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.static(".")); // index.html serve করবে

let accessToken = "";

// Spotify access token আনতে ফাংশন
async function getAccessToken() {
  const resp = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
          ).toString("base64"),
      },
    }
  );
  accessToken = resp.data.access_token;
  console.log("✅ Spotify Access Token Updated!");
}
getAccessToken();
setInterval(getAccessToken, 3600 * 1000); // প্রতি ১ ঘন্টায় নতুন টোকেন

// নতুন গান আনার API
app.get("/api/new-releases", async (req, res) => {
  try {
    const result = await axios.get(
      "https://api.spotify.com/v1/browse/new-releases?limit=10",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    res.json(result.data.albums.items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));
