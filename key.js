// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client secret
// a46a3ac979964d9d8f3cb3152e3a1cbe client id 

// Spotify API Credentials
const clientId = 'a46a3ac979964d9d8f3cb3152e3a1cbe';
const clientSecret = '961849266f2f41bd94c05f31fc67c01c';
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
    return (await response.json()).tracks.items;
}

// Function to render song results
function renderSongs(songs, isFeatured = false) {
    const SongsWrapper = document.querySelector('.results-row');
    const headingElement = document.createElement('h2');
    headingElement.textContent = isFeatured ? 'Featured Songs' : 'Search Results';
    SongsWrapper.innerHTML = '';
    SongsWrapper.appendChild(headingElement);

    SongsWrapper.innerHTML += songs.map((song, index) => `
        <div class="results-lists">
            <span class="column-info column-number">${index + 1}</span>
            <span class="column-info column-img">
                <img src="${song.album.images[0].url}" alt="${song.name} cover" style="width: 100px; height: 100px;">
            </span>
            <span class="column-info column-title">
                <a href="${song.external_urls.spotify}" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${song.name}</a>
            </span>
            <span class="column-info column-artist">
                <a href="${song.artists[0].external_urls.spotify}" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${song.artists[0].name}</a>
            </span>
            <span class="column-info column-album">
                <a href="${song.album.external_urls.spotify}" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${song.album.name}</a>
            </span>
            <span class="column-info column-duration">${(song.duration_ms / 1000 / 60).toFixed(2)} min</span>
        </div>
    `).join('');
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
    }
    else if (query) {
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
              renderSongs(hits, true); // This should now work with the new data structure
            }, 1000);
          })
          .catch(error => {
            console.error(error);
            hideSpinner();
            alert('An error occurred while fetching top hits.');
          });
    }
      async function fetchTopHits(accessToken) {
        const response = await fetch("https://api.spotify.com/v1/browse/featured-playlists?limit=1", { 
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    
        if (!response.ok) throw new Error('Failed to fetch featured playlist');
        
        const data = await response.json();
        const playlistId = data.playlists.items[0].id;
    
        const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
    
        if (!tracksResponse.ok) throw new Error('Failed to fetch top hits');
        
        const tracksData = await tracksResponse.json();
        return tracksData.items.map(item => item.track);
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

    setTimeout(() => {
        const searchQuerySpan = document.getElementById('search-query');
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query');
        if (searchQuerySpan && query) {
            searchQuerySpan.textContent = decodeURIComponent(query);
        }
    }, 1000);
});
