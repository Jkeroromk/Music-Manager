// f5eb93d5379d4b3b9dcbd6ea3d8d4a31 client secret
// a46a3ac979964d9d8f3cb3152e3a1cbe client id

const clientId = "a46a3ac979964d9d8f3cb3152e3a1cbe";
const clientSecret = "961849266f2f41bd94c05f31fc67c01c";
let allSongs = [];
let currentPage = 1;
let limit = 10;
let currentSortOption = null;
let totalPages = 10; // starting limit for total pages

document.addEventListener("DOMContentLoaded", function () {
  const headline = document.getElementById("result-type");
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get("query");
  const featured = urlParams.get("featured");
  const SongsWrapper = document.querySelector('.results-row'); 
  const prevButton = document.getElementById("prevButton");
  const nextButton = document.getElementById("nextButton");
  const currentPageDisplay = document.getElementById("currentPageDisplay");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  function updateTotalPages(totalTracks) {
    totalPages = Math.ceil(totalTracks / limit); // Calculate total pages
}

function updatePageDisplay() {
    if (currentPageDisplay) {
        currentPageDisplay.textContent = `Page ${currentPage} of ${totalPages}`; // Ensure this is set correctly
    }
}


if (nextButton) {
    nextButton.addEventListener('click', async function () {
        if (currentPage < totalPages) {
            showSpinner();
            SongsWrapper.style.display = 'none';

            setTimeout(async () => {
                currentPage++;
                await fetchAndRenderSongs(query || '', (currentPage - 1) * limit); // Pass the new offset
                hideSpinner();
                SongsWrapper.style.display = '';
            }, 1500);
        }
    });
}

if (prevButton) {
    prevButton.addEventListener('click', async function () {
        if (currentPage > 1) {
            showSpinner();
            SongsWrapper.style.display = 'none';

            setTimeout(async () => {
                currentPage--;
                await fetchAndRenderSongs(query || '', (currentPage - 1) * limit); // Pass the new offset
                hideSpinner();
                SongsWrapper.style.display = '';
            }, 1000);
        }
    });
}


  if (featured === "true" && headline) {
    headline.innerHTML = "Top Featured Songs";
  } else if (query && headline) {
    headline.innerHTML = `Here's your Search Results for <span id="search-query">${decodeURIComponent(
      query
    )}</span>`;
  }

  limit = calculateLimit();
  showSpinner();

  const filterOptions = document.getElementById("filterOptions");
  if (filterOptions) {
    filterOptions.addEventListener("change", (event) => {
      currentSortOption = event.target.value;
      const sortedSongs = sortSongs(allSongs, currentSortOption);
      renderSongs(sortedSongs);
    });
  }

  async function getAccessToken(retries = 3) {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      if (!response.ok) throw new Error("Failed to fetch access token");
      return (await response.json()).access_token;
    } catch (error) {
      console.error(error);
      if (retries > 0) {
        console.log(
          `Retrying to fetch access token... (${retries} retries left)`
        );
        return getAccessToken(retries - 1);
      } else {
        alert("Unable to obtain access token after several attempts.");
      }
    }
  }

  async function fetchSongs(accessToken, userInput) {
    const offset = (currentPage - 1) * limit;
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(userInput)}&type=track&limit=${limit}&offset=${offset}`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );

        if (!response.ok) throw new Error("Failed to fetch songs");

        const data = await response.json();

        // Correctly extract totalTracks from the API response
        const totalTracks = data.tracks.total; // Should be 901


        allSongs = data.tracks.items; // All song items from the response

        if (!allSongs.length) {
            updatePageDisplay(); // Update if no songs found
            return [];
        }

        return { songs: allSongs, total: totalTracks }; // Return both songs and total
    } catch (error) {
        console.error("Error fetching songs:", error);
        alert("An error occurred while fetching songs. Please try again.");
        return [];
    }
}




  async function fetchTopHits(accessToken, offset = 0) {
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/browse/featured-playlists?limit=1`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        if (!response.ok) throw new Error("Failed to fetch featured playlist");
        const data = await response.json();
        const playlistId = data.playlists.items[0].id;

        const tracksResponse = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` },
            }
        );
        if (!tracksResponse.ok) throw new Error("Failed to fetch top hits");
        const tracksData = await tracksResponse.json();
        const allTracks = tracksData.items.map((item) => item.track);
        const totalTracks = tracksData.total; // Get the total number of tracks available

        if (!allTracks.length) throw new Error("No songs retrieved");
        return { songs: allTracks, total: totalTracks }; // Return both songs and total
    } catch (error) {
        console.error("Error fetching top hits:", error);
        alert("An error occurred while fetching featured songs.");
        return { songs: [], total: 0 }; // Return an empty array and zero total
    }
}

  function calculateLimit() {
    const screenWidth = window.innerWidth;
    return screenWidth > 1200 ? 25 : screenWidth > 768 ? 20 : 10;
  }

  function sortSongs(songs, sortOption) {
    return songs.slice().sort((a, b) => {
      switch (sortOption) {
        case "ArtistName":
          return a.artists[0].name.localeCompare(b.artists[0].name);
        case "AlbumName":
          return a.album.name.localeCompare(b.album.name);
        case "Duration":
          return a.duration_ms - b.duration_ms;
        case "Popularity":
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });
  }

  function renderSongs(songs) {
    const SongsWrapper = document.querySelector(".results-row");
    if (!SongsWrapper) return;
    SongsWrapper.innerHTML = "";

    if (!songs || songs.length === 0) {
      SongsWrapper.innerHTML = "<p>No songs to display.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    songs.forEach((song) => {
      const songElement = document.createElement("div");
      songElement.classList.add("results-lists");
      const previewUrl = song.preview_url;
      let audio = null;

      if (previewUrl) {
        audio = new Audio(previewUrl);
        audio.volume = 0.3;
      }

      songElement.innerHTML = `
                <div class="results-lists-wrapper">
                    <img src="${song.album.images[0].url}" alt="${
        song.name
      } cover" class="songs-img">
                </div>
                <div class="column-info column-title">
                    <a href="${
                      song.external_urls.spotify
                    }" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${
        song.name
      }</a>
                </div>
                <div class="column-info column-artist">
                    <a href="${
                      song.artists[0].external_urls.spotify
                    }" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${
        song.artists[0].name
      }</a>
                </div>
                <div class="column-info column-album">
                    <a href="${
                      song.album.external_urls.spotify
                    }" class="link-hover-effect link-hover-effect-black link-hover-effect--white" target="_blank">${
        song.album.name
      }</a>
                </div>
                <div class="column-info column-duration">${formatDuration(
                  song.duration_ms
                )}</div>
            `;
      const imageElement = songElement.querySelector(".songs-img");
      if (audio) {
        imageElement.addEventListener("mouseover", () => {
          if (audio.paused) {
            audio.currentTime = 0;
            audio.play().catch((error) => {
              console.warn("Audio playback interrupted:", error);
            });
          }
        });
        imageElement.addEventListener("mouseout", () => {
          if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
          }
        });
      }
      fragment.appendChild(songElement);
    });
    SongsWrapper.appendChild(fragment);
  }

  function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  }

  function showSpinner() {
    const spinner = document.getElementById("songs-loading");
    if (spinner) spinner.style.display = "";
    if (SongsWrapper) SongsWrapper.style.display = "none"; // Hide song list
  }

  function hideSpinner() {
    const spinner = document.getElementById("songs-loading");
    if (spinner) spinner.style.display = "none";
    if (SongsWrapper) SongsWrapper.style.display = ""; // Show song list after loading
  }

  async function fetchAndRenderSongs(userInput, offset = 0) {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
        console.error("Failed to retrieve access token.");
        return; // Stop execution if we can't get a token
    }

    let songs = [];
    let totalTracks = 0; // Initialize totalTracks
    try {
        if (userInput) {
            const result = await fetchSongs(accessToken, userInput);
            songs = result.songs; // Access songs from the returned object
            totalTracks = result.total; // Get total tracks for search results
        } else {
            const result = await fetchTopHits(accessToken, offset); // Get both songs and total
            songs = result.songs; // Access songs from the returned object
            totalTracks = result.total; // Get the total tracks for featured songs
        }

        if (!Array.isArray(songs)) { // Check if songs is an array
            console.error("Songs is not an array:", songs);
            return; // Stop execution if it's not an array
        }

        if (songs.length === 0) {
            console.warn("No songs found.");
            return;
        }

        renderSongs(songs);
        updateTotalPages(totalTracks); // Update total pages based on fetched total
        updatePageDisplay();
    } catch (error) {
        console.error("Error during fetching/rendering songs:", error);
    } finally {
        hideSpinner();
    }
}


  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault(); // Prevent the default form submission
      const searchInputValue = searchInput.value.trim();
      if (searchInputValue) {
        // Redirect to song.html with the query parameter
        window.location.href = `song.html?query=${encodeURIComponent(
          searchInputValue
        )}`;
      } else {
        console.warn("Search input is empty.");
      }
    });
  }

  // Initial fetch
  fetchAndRenderSongs(query || "");
});
