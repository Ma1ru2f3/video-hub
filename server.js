
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Hub</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background-color: #f4f4f4; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; padding-bottom: 80px; }
        .header { background-color: #ff0000; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .header a { color: white; text-decoration: none; }
        .search-form { text-align: center; margin-bottom: 30px; }
        .search-input { width: 70%; max-width: 500px; padding: 12px; border: 2px solid #ddd; border-radius: 25px; font-size: 16px; }
        .search-button { padding: 12px 25px; background-color: #007bff; color: white; border: none; border-radius: 25px; cursor: pointer; font-size: 16px; margin-left: 10px; }
        .search-button:hover { background-color: #0056b3; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .video-card { 
            background-color: white; 
            border-radius: 10px; 
            overflow: hidden; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            transition: transform 0.2s;
            position: relative;
        }
        .video-card:hover { transform: translateY(-5px); }
        .video-thumbnail { width: 100%; height: 180px; object-fit: cover; }
        .video-info { padding: 15px; }
        .video-title { font-size: 1.1em; font-weight: bold; margin: 0 0 5px; }
        .info-button { display: block; text-align: center; padding: 10px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .info-button:hover { background-color: #218838; }
        .error-message { color: red; text-align: center; margin-top: 20px; }
        .bottom-nav {
            position: fixed;
            bottom: 0;
            width: 100%;
            display: flex;
            justify-content: space-around;
            background-color: #fff;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            padding: 10px 0;
            z-index: 1000;
        }
        .nav-item {
            text-align: center;
            flex-grow: 1;
        }
        .nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: #555;
            font-size: 14px;
            font-weight: bold;
        }
        .nav-link:hover {
            color: #ff0000;
        }
        .nav-icon {
            font-size: 24px;
            margin-bottom: 5px;
        }
        #page-title { text-align: center; color: #ff0000; }
        .hidden { display: none; }
        .video-player-container {
            position: relative;
            padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
            height: 0;
            overflow: hidden;
            max-width: 100%;
            background: #000;
        }
        .video-iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        }
        .video-title-display {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 10px;
            text-align: center;
        }
        .duration-badge {
            position: absolute;
            bottom: 80px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 0.8em;
            z-index: 2;
        }

        /* NEW: Music Player Bar Styles */
        #music-player-bar {
            position: fixed;
            bottom: 65px; /* Adjust based on bottom-nav height */
            left: 0;
            width: 100%;
            background-color: #333;
            color: white;
            display: flex;
            align-items: center;
            padding: 10px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
            z-index: 999;
            transition: transform 0.3s ease-in-out;
            transform: translateY(100%);
        }
        #music-player-bar.active {
            transform: translateY(0);
        }
        #music-player-bar .album-art {
            width: 50px;
            height: 50px;
            border-radius: 5px;
            margin-right: 15px;
        }
        #music-player-bar .song-info {
            flex-grow: 1;
        }
        #music-player-bar .song-title {
            font-size: 1em;
            font-weight: bold;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #music-player-bar .song-artist {
            font-size: 0.8em;
            color: #ccc;
            margin: 0;
        }
        #music-player-bar .controls {
            display: flex;
            align-items: center;
        }
        #music-player-bar .play-button {
            font-size: 2em;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin-left: 10px;
        }
        #music-player-bar .progress-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: #555;
        }
        #music-player-bar .progress-fill {
            height: 100%;
            width: 0%;
            background-color: #ff0000;
            transition: width 0.1s linear;
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="search-section">
            <div class="header">
                <a href="#" onclick="showSearchSection();"><h1>🎥 Video Hub</h1></a>
            </div>
            <div class="search-form">
                <form id="search-form">
                    <input type="text" class="search-input" id="search-input" name="q" placeholder="Search YouTube videos...">
                    <button type="submit" class="search-button">Search</button>
                </form>
            </div>
            <h2 id="page-title">Trending Videos</h2>
            <div id="error-message" class="error-message"></div>
            <div id="video-grid" class="video-grid"></div>
        </div>

        <div id="video-player-section" class="hidden">
            <a href="#" class="back-button" onclick="showSearchSection();">Back to Search</a>
            <div class="video-player-container">
                <video id="video-player" controls class="video-iframe"></video>
            </div>
            <div id="video-title-display" class="video-title-display"></div>

            <h3 id="related-videos-title" class="hidden">Related Videos</h3>
            <div id="related-videos-grid" class="video-grid"></div>
        </div>

        <div id="music-section" class="hidden">
            <div class="header">
                <a href="#" onclick="showMusicSection();"><h1>🎧 Music Hub</h1></a>
            </div>
            <div class="search-form">
                <form id="music-search-form">
                    <input type="text" class="search-input" id="music-search-input" name="q" placeholder="Search for a song...">
                    <button type="submit" class="search-button">Search</button>
                </form>
            </div>
            <h2 id="music-page-title" class="page-title">Search for Music</h2>
            <div id="music-error-message" class="error-message"></div>
            <div id="music-video-grid" class="video-grid"></div>
        </div>
    </div>

    <div id="music-player-bar" class="hidden">
        <div class="progress-bar"><div id="progress-fill" class="progress-fill"></div></div>
        <img id="bar-album-art" class="album-art" src="" alt="Album Art">
        <div class="song-info">
            <div id="bar-song-title" class="song-title"></div>
            <div id="bar-song-artist" class="song-artist"></div>
        </div>
        <div class="controls">
            <audio id="bar-audio-player" style="display:none;"></audio>
            <button id="bar-play-pause" class="play-button">▶</button>
        </div>
    </div>

    <div class="bottom-nav">
        <div class="nav-item">
            <a href="#" class="nav-link" id="home-link">
                <span class="nav-icon">🏠</span>
                Home
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" id="music-link">
                <span class="nav-icon">🎶</span>
                Music
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" onclick="document.getElementById('search-input').focus();">
                <span class="nav-icon">🔍</span>
                Search
            </a>
        </div>
        <div class="nav-item">
            <a href="#" class="nav-link" onclick="alert('History functionality is not yet available in this version.');">
                <span class="nav-icon">⏳</span>
                History
            </a>
        </div>
    </div>

    <script>
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const videoGrid = document.getElementById('video-grid');
        const errorMessage = document.getElementById('error-message');
        const pageTitle = document.getElementById('page-title');
        const homeLink = document.getElementById('home-link');
        const searchSection = document.getElementById('search-section');
        const videoPlayerSection = document.getElementById('video-player-section');
        const videoPlayer = document.getElementById('video-player');
        const videoTitleDisplay = document.getElementById('video-title-display');
        const relatedVideosGrid = document.getElementById('related-videos-grid');
        const relatedVideosTitle = document.getElementById('related-videos-title');

        // NEW: Selectors for the music section
        const musicLink = document.getElementById('music-link');
        const musicSection = document.getElementById('music-section');
        const musicSearchForm = document.getElementById('music-search-form');
        const musicSearchInput = document.getElementById('music-search-input');
        const musicVideoGrid = document.getElementById('music-video-grid');
        const musicErrorMessage = document.getElementById('music-error-message');
        const musicPageTitle = document.getElementById('music-page-title');

        // NEW: Selectors for the persistent music bar
        const musicPlayerBar = document.getElementById('music-player-bar');
        const barAlbumArt = document.getElementById('bar-album-art');
        const barSongTitle = document.getElementById('bar-song-title');
        const barSongArtist = document.getElementById('bar-song-artist');
        const barPlayPause = document.getElementById('bar-play-pause');
        const barAudioPlayer = document.getElementById('bar-audio-player');
        const progressFill = document.getElementById('progress-fill');

        // Functions to toggle sections
        function showSearchSection() {
            searchSection.classList.remove('hidden');
            videoPlayerSection.classList.add('hidden');
            musicSection.classList.add('hidden');
            videoPlayer.src = '';
        }

        // NEW: Function to toggle to the music section
        function showMusicSection() {
            searchSection.classList.add('hidden');
            videoPlayerSection.classList.add('hidden');
            musicSection.classList.remove('hidden');
            musicVideoGrid.innerHTML = '';
            musicPageTitle.textContent = 'Search for Music';
        }

        // NEW: Function to play audio
        async function playAudio(videoId, videoTitle, videoThumbnail, videoAuthor) {
            musicPlayerBar.classList.add('active');
            barSongTitle.textContent = videoTitle;
            barSongArtist.textContent = videoAuthor;
            barAlbumArt.src = videoThumbnail;
            barPlayPause.textContent = '⏸';

            try {
                const response = await fetch(`/audio-link-api?id=${videoId}`);
                const data = await response.json();

                if (response.ok && data.audioUrl) {
                    barAudioPlayer.src = data.audioUrl;
                    barAudioPlayer.play();
                } else {
                    console.error('Failed to load audio:', data.error);
                    barPlayPause.textContent = '▶';
                    alert('Error: Failed to load audio.');
                }
            } catch (err) {
                console.error(err);
                barPlayPause.textContent = '▶';
                alert('Error: An error occurred while loading the audio.');
            }
        }
        
        // NEW: Function to toggle play/pause from the music bar
        barPlayPause.addEventListener('click', () => {
            if (barAudioPlayer.paused) {
                barAudioPlayer.play();
                barPlayPause.textContent = '⏸';
            } else {
                barAudioPlayer.pause();
                barPlayPause.textContent = '▶';
            }
        });

        // NEW: Update progress bar
        barAudioPlayer.addEventListener('timeupdate', () => {
            const progress = (barAudioPlayer.currentTime / barAudioPlayer.duration) * 100;
            progressFill.style.width = `${progress}%`;
        });

        // NEW: Reset player state when song ends
        barAudioPlayer.addEventListener('ended', () => {
            barPlayPause.textContent = '▶';
            progressFill.style.width = '0%';
        });


        // NEW: Function to fetch and display music search results
        async function fetchMusicResults(query) {
            musicVideoGrid.innerHTML = 'Loading...';
            musicErrorMessage.innerHTML = '';
            musicPageTitle.textContent = `Music Search Results for "${query}"`;
            
            try {
                const response = await fetch(`/search-api?q=${encodeURIComponent(query)}`);
                const videos = await response.json();

                if (response.ok) {
                    if (videos.length === 0) {
                        musicVideoGrid.innerHTML = `<p style="text-align: center;">No music results found.</p>`;
                    } else {
                        musicVideoGrid.innerHTML = '';
                        videos.forEach(video => {
                            const card = document.createElement('div');
                            card.className = 'video-card';
                            card.innerHTML = `
                                <a href="#" onclick="playAudio('${video.id}', '${video.title.replace(/'/g, "\\'")}', '${video.thumbnail}', '${video.author.name}');">
                                    <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                </a>
                                <div class="video-info">
                                    <h3 class="video-title">${video.title}</h3>
                                    <button onclick="playAudio('${video.id}', '${video.title.replace(/'/g, "\\'")}', '${video.thumbnail}', '${video.author.name}');" class="info-button">Play Music</button>
                                </div>
                            `;
                            musicVideoGrid.appendChild(card);
                        });
                    }
                } else {
                    musicErrorMessage.innerHTML = videos.error || 'Failed to fetch music videos.';
                    musicVideoGrid.innerHTML = '';
                }
            } catch (err) {
                musicErrorMessage.innerHTML = 'An error occurred. Please try again later.';
                musicVideoGrid.innerHTML = '';
            }
        }

        // Function to show the video player by fetching a direct video link
        async function showVideoPlayerSection(videoId, videoTitle) {
            searchSection.classList.add('hidden');
            videoPlayerSection.classList.remove('hidden');
            musicSection.classList.add('hidden');

            videoTitleDisplay.textContent = 'Loading video...';
            videoPlayer.src = '';
            relatedVideosGrid.innerHTML = '';
            relatedVideosTitle.classList.add('hidden');

            try {
                const response = await fetch(`/video-link-api?id=${videoId}`);
                const data = await response.json();

                if (response.ok && data.videoUrl) {
                    videoPlayer.src = data.videoUrl;
                    videoPlayer.load();
                    videoPlayer.play();
                    videoTitleDisplay.textContent = videoTitle;

                    // NEW: Fetch and display related videos
                    fetchRelatedVideos(videoId);
                } else {
                    videoTitleDisplay.textContent = 'Error: Failed to load video.';
                }
            } catch (err) {
                console.error(err);
                videoTitleDisplay.textContent = 'Error: An error occurred while loading the video.';
            }
        }

        // NEW: Function to fetch and display related videos
        async function fetchRelatedVideos(videoId) {
            relatedVideosTitle.classList.remove('hidden');
            relatedVideosGrid.innerHTML = 'Loading related videos...';

            try {
                const response = await fetch(`/related-videos-api?id=${videoId}`);
                const videos = await response.json();

                if (response.ok && videos.length > 0) {
                    relatedVideosGrid.innerHTML = '';
                    videos.forEach(video => {
                        const card = document.createElement('div');
                        card.className = 'video-card';
                        card.innerHTML = `
                            <a href="#" onclick="showVideoPlayerSection('${video.id}', '${video.title.replace(/'/g, "\\'")}');">
                                <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                <span class="duration-badge hidden"></span>
                            </a>
                            <div class="video-info">
                                <h3 class="video-title">${video.title}</h3>
                            </div>
                        `;
                        relatedVideosGrid.appendChild(card);

                        // Fetch duration for each related video
                        fetchAndDisplayDuration(video.id, card);
                    });
                } else {
                    relatedVideosGrid.innerHTML = '<p>No related videos found.</p>';
                }
            } catch (err) {
                console.error("Failed to fetch related videos:", err);
                relatedVideosGrid.innerHTML = '<p>Failed to load related videos.</p>';
            }
        }

        // Function to convert seconds to HH:MM:SS format
        function formatDuration(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;

            let formatted = '';
            if (h > 0) formatted += `${h}:`;
            formatted += `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            return formatted;
        }

        // Function to fetch and display video duration
        async function fetchAndDisplayDuration(videoId, cardElement) {
            try {
                const response = await fetch(`/video-info-api?id=${videoId}`);
                if (response.ok) {
                    const videoInfo = await response.json();
                    if (videoInfo && videoInfo.duration) {
                        const durationBadge = cardElement.querySelector('.duration-badge');
                        durationBadge.textContent = formatDuration(videoInfo.duration);
                        durationBadge.classList.remove('hidden');
                    }
                }
            } catch (err) {
                console.error("Failed to fetch video duration:", err);
            }
        }

        // Function to fetch and display videos
        async function fetchVideos(url, title) {
            videoGrid.innerHTML = 'Loading...';
            errorMessage.innerHTML = '';
            pageTitle.textContent = title;

            try {
                const response = await fetch(url);
                const videos = await response.json();

                if (response.ok) {
                    if (videos.length === 0) {
                        videoGrid.innerHTML = `<p style="text-align: center;">No results found.</p>`;
                    } else {
                        videoGrid.innerHTML = '';
                        videos.forEach(video => {
                            const card = document.createElement('div');
                            card.className = 'video-card';
                            card.innerHTML = `
                                <a href="#" onclick="showVideoPlayerSection('${video.id}', '${video.title.replace(/'/g, "\\'")}');">
                                    <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail">
                                    <span class="duration-badge hidden"></span>
                                </a>
                                <div class="video-info">
                                    <h3 class="video-title">${video.title}</h3>
                                </div>
                            `;
                            videoGrid.appendChild(card);

                            // Fetch duration for each video card
                            fetchAndDisplayDuration(video.id, card);
                        });
                    }
                } else {
                    errorMessage.innerHTML = videos.error || 'Failed to fetch videos.';
                    videoGrid.innerHTML = '';
                }
            } catch (err) {
                errorMessage.innerHTML = 'An error occurred. Please try again later.';
                videoGrid.innerHTML = '';
            }
        }

        // Load trending videos on page load
        document.addEventListener('DOMContentLoaded', () => {
            fetchVideos('/home-api', 'Trending Videos');
        });

        // Handle search form submission
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value;
            if (query) {
                fetchVideos(`/search-api?q=${encodeURIComponent(query)}`, `Search Results for "${query}"`);
            }
        });

        // Handle home button click
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSearchSection();
            fetchVideos('/home-api', 'Trending Videos');
        });

        // NEW: Event listener for music search form
        musicSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = musicSearchInput.value;
            if (query) {
                fetchMusicResults(query);
            }
        });

        // NEW: Event listener for the music button in the bottom nav
        musicLink.addEventListener('click', (e) => {
            e.preventDefault();
            showMusicSection();
        });
    </script>
</body>
</html>