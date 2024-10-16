// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client secret
// a46a3ac979964d9d8f3cb3152e3a1cbe client id 

const clientId = 'a46a3ac979964d9d8f3cb3152e3a1cbe';
const clientSecret = '961849266f2f41bd94c05f31fc67c01c';

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

    if (!response.ok) {
        throw new Error('Failed to fetch access token');
    }

    const data = await response.json();
    return data.access_token;
}

async function fetchSongs(accessToken, userInput) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(userInput)}&type=track&limit=10`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch songs');
    }

    const data = await response.json();
    return data.tracks.items; 
}

function renderSongs(songs) {
    const SongsWrapper = document.querySelector('.results-row');
    SongsWrapper.innerHTML = '';

    songs.forEach((song, index) => {
        const songHtml = `
            <div class="results-lists">
                <span class="column-info column-number">${index + 1}</span>
                <span class="column-info column-img">
                    <img src="${song.album.images[0].url}" alt="${song.name} cover" style="width: 100px; height: 100px;">
                </span>
                <span class="column-info column-title">${song.name}</span>
                <span class="column-info column-album">${song.album.name}</span>
                <span class="column-info column-duration">${(song.duration_ms / 1000 / 60).toFixed(2)} min</span>
            </div>`;
        SongsWrapper.innerHTML += songHtml;
    });
}

document.getElementById('searchButton').addEventListener('click', async () => {
    const userInput = document.getElementById('searchInput').value; 
    if (!userInput) {
        alert('Please enter the keyword');
        return;
    }

    try {
        const accessToken = await getAccessToken();
        const songs = await fetchSongs(accessToken, userInput);
        renderSongs(songs);
    } catch (error) {
        console.error(error);
    }
});
