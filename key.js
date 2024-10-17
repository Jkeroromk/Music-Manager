// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client secret
// a46a3ac979964d9d8f3cb3152e3a1cbe client id 

const clientId = 'a46a3ac979964d9d8f3cb3152e3a1cbe';
const clientSecret = '961849266f2f41bd94c05f31fc67c01c';
let currentPage = 1;
const limit = 10;

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

    const data = await response.json();
    return data.access_token;
}

async function fetchSongs(accessToken, query, page) {
    const offset = (page - 1) * limit;
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) throw new Error('Failed to fetch songs');

    const data = await response.json();
    return data.tracks.items;
}

function renderSongs(songs) {
    const songsWrapper = document.querySelector('.results-row');
    songsWrapper.innerHTML = songs.map((song, index) => `
        <div class="results-lists">
            <span class="column-info column-number">${index + 1}</span>
            <span class="column-info column-img">
                <img src="${song.album.images[0].url}" alt="${song.name} cover" style="width: 100px; height: 100px;">
            </span>
            <span class="column-info column-title">${song.name}</span>
            <span class="column-info column-artist">${song.artists[0].name}</span>
            <span class="column-info column-album">${song.album.name}</span>
            <span class="column-info column-duration">${new Date(song.duration_ms).toISOString().slice(14, 19)}</span>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
    const searchForm = document.getElementById('searchForm');
    const nextButton = document.getElementById('nextButton');
    const prevButton = document.getElementById('prevButton');
    const query = new URLSearchParams(window.location.search).get('query');

    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            const userInput = document.getElementById('searchInput').value;
            if (userInput) {
                window.location.href = `./song.html?query=${encodeURIComponent(userInput)}`;
            } else {
                alert('Please enter a keyword');
            }
        });
    }

    if (query) {
        const accessToken = await getAccessToken();
        let songs = await fetchSongs(accessToken, query, currentPage);
        renderSongs(songs);

        nextButton.addEventListener('click', async () => {
            currentPage++;
            songs = await fetchSongs(accessToken, query, currentPage);
            renderSongs(songs);
        });

        prevButton.addEventListener('click', async () => {
            if (currentPage > 1) {
                currentPage--;
                songs = await fetchSongs(accessToken, query, currentPage);
                renderSongs(songs);
            }
        });
    }
});



setTimeout(() => {
    const searchQuerySpan = document.getElementById('search-query');
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (searchQuerySpan && query) {
        searchQuerySpan.textContent = decodeURIComponent(query);
        console.log('Search query set after timeout');
    }
}, 100);