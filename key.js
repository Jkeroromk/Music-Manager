// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client secret
// a46a3ac979964d9d8f3cb3152e3a1cbe client id 

// Spotify API Credentials
const clientId = 'a46a3ac979964d9d8f3cb3152e3a1cbe';
const clientSecret = '961849266f2f41bd94c05f31fc67c01c';
let allSongs = []; // This will store all fetched songs
let currentPage = 1;
const limit = 10;

document.addEventListener('DOMContentLoaded', function() {
    // Functions to handle API interactions
    async function getAccessToken() {
        const credentials = btoa(`${clientId}:${clientSecret}`);
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) throw new Error('Failed to fetch access token');
        return (await response.json()).access_token;
    }

    async function fetchSongs(accessToken, userInput) {
        const offset = (currentPage - 1) * limit;
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(userInput)}&type=track&limit=${limit}&offset=${offset}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch songs');
        const data = await response.json();
        allSongs = data.tracks.items; // Store the fetched songs
        return allSongs;
    }

    function calculateLimit() {
        const screenWidth = window.innerWidth;

        if (screenWidth > 1200) {
            return 30; // Large screens, show more songs
        } else if (screenWidth > 768) {
            return 20; // Medium screens, show fewer songs
        } else {
            return 10; // Small screens, show even fewer songs
        }
    }

    // Recalculate limit when the window is resized
    window.addEventListener('resize', () => {
        limit = calculateLimit(); // Recalculate the limit on resize
        searchSongs(); 
    });

    async function fetchTopHits(accessToken) {
        const response = await fetch("https://api.spotify.com/v1/browse/featured-playlists?limit=1", {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch featured playlist');

        const data = await response.json();
        const playlistId = data.playlists.items[0].id;

        const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!tracksResponse.ok) throw new Error('Failed to fetch top hits');

        const tracksData = await tracksResponse.json();
        allSongs = tracksData.items.map(item => item.track); // Store the featured songs
        return allSongs;
    }

    // Function to render song results
    function renderSongs(songs, isFeatured = false) {
        const SongsWrapper = document.querySelector('.results-row');
        SongsWrapper.innerHTML = ''; // Clear previous content

        if (!songs || songs.length === 0) {
            SongsWrapper.innerHTML = '<p>No songs to display.</p>'; // Handle no results
            return;
        }

        const fragment = document.createDocumentFragment();

        songs.forEach((song) => {
            const songElement = document.createElement('div');
            songElement.classList.add('results-lists');
            songElement.innerHTML = `
                <div class="results-lists-wrapper">
                    <img src="${song.album.images[0].url}" alt="${song.name} cover" class="songs-img">
                </div>
                <div class="column-info column-title">
                    <a href="${song.external_urls.spotify}" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${song.name}</a>
                </div>
                <div class="column-info column-artist">
                    <a href="${song.artists[0].external_urls.spotify}" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${song.artists[0].name}</a>
                </div>
                <div class="column-info column-album">
                    <a href="${song.album.external_urls.spotify}" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${song.album.name}</a>
                </div>
                <div class="column-info column-duration">${formatDuration(song.duration_ms)}</div>
            `;
            fragment.appendChild(songElement);
        });

        SongsWrapper.appendChild(fragment);
    }

    // Format song duration from milliseconds to mm:ss
    function formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    }

    // Function to filter songs
    function filterSongs(event) {
        const sortBy = event.target.value;
        if (!allSongs.length) {
            console.error("No songs available for filtering.");
            return;
        }

        const sortedSongs = [...allSongs]; // Create a copy of allSongs

        switch (sortBy) {
            case 'ArtistName':
                sortedSongs.sort((a, b) => a.artists[0].name.localeCompare(b.artists[0].name));
                break;
            case 'AlbumName':
                sortedSongs.sort((a, b) => a.album.name.localeCompare(b.album.name));
                break;
            case 'Duration':
                sortedSongs.sort((a, b) => a.duration_ms - b.duration_ms);
                break;
            case 'Popularity':
                sortedSongs.sort((a, b) => b.popularity - a.popularity); // Higher popularity comes first
                break;
            default:
                return;
        }

        renderSongs(sortedSongs); // Render the sorted songs
    }

    // Spinner Control Functions
    function showSpinner() {
        const spinner = document.getElementById('songs-loading');
        if (spinner) {
            spinner.style.display = '';
        }
    }

    function hideSpinner() {
        const spinner = document.getElementById('songs-loading');
        if (spinner) {
            spinner.style.display = 'none';
        }
    }

    // Search Handling
    const searchForm = document.getElementById('searchForm');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const findSongLink = document.getElementById('findsonglink');
    const featured = urlParams.get('featured');

    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const userInput = document.getElementById('searchInput').value;
            if (!userInput) {
                alert('Please enter a keyword');
                return;
            }
            const queryString = encodeURIComponent(userInput);
            window.location.href = `./song.html?query=${queryString}`;
        });
    }

    if (findSongLink) {
        findSongLink.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = './song.html?featured=true';
        });
    }

    if (featured === 'true') {
        showSpinner();
        getAccessToken()
            .then(accessToken => fetchTopHits(accessToken))
            .then(hits => {
                setTimeout(() => {
                    hideSpinner();
                    renderSongs(hits, true);
                }, 1000);
            })
            .catch(error => {
                console.error(error);
                hideSpinner();
                alert('An error occurred while fetching featured songs.');
            });
    } else if (query) {
        showSpinner();
        getAccessToken()
            .then(accessToken => fetchSongs(accessToken, query))
            .then(songs => {
                setTimeout(() => {
                    hideSpinner();
                    renderSongs(songs);
                }, 1000); // Delay before rendering results
            })
            .catch(error => {
                console.error(error);
                hideSpinner();
                alert('An error occurred while fetching songs.');
            });
    }

    if (!query && featured !== 'true') {
        showSpinner();
        getAccessToken()
            .then(accessToken => fetchTopHits(accessToken))
            .then(hits => {
                setTimeout(() => {
                    hideSpinner();
                    renderSongs(hits, true); 
                }, 1000);
            })
            .catch(error => {
                console.error(error);
                hideSpinner();
                alert('An error occurred while fetching top hits.');
            });
    }

    async function searchSongs() {
        const userInput = new URLSearchParams(window.location.search).get('query');
        const accessToken = await getAccessToken();
        const songs = await fetchSongs(accessToken, userInput);
        renderSongs(songs);
    }

    // Pagination Buttons
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentPage++;
            searchSongs();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                searchSongs();
            }
        });
    }

    // Filter songs when the dropdown value changes
    const filterOptions = document.getElementById('filterOptions');
    if (filterOptions) {
        filterOptions.addEventListener('change', filterSongs);
    }

    setTimeout(() => {
        const searchQuerySpan = document.getElementById('search-query');
        const query = urlParams.get('query');
        if (searchQuerySpan && query) {
            searchQuerySpan.textContent = decodeURIComponent(query);
        }
    }, 1000);
});

