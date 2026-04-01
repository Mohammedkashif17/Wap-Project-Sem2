const API_KEY = '7ea3bc1a';

const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const searchResults = document.getElementById('search-results');
const watchlistResults = document.getElementById('watchlist-results');
const searchMsg = document.getElementById('search-msg');
const watchlistMsg = document.getElementById('watchlist-msg');
const wlCount = document.getElementById('wl-count');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

function updateWatchlistCount() {
    wlCount.textContent = watchlist.length ? `(${watchlist.length})` : '';
}

function saveWatchlist() {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
}

function isInWatchlist(imdbID) {
    return watchlist.some(item => item.imdbID === imdbID);
}

function addToWatchlist(movie) {
    if (!isInWatchlist(movie.imdbID)) {
        watchlist.push(movie);
        saveWatchlist();
        alert(`${movie.Title} added to watchlist!`);
    } else {
        alert('Already in your watchlist');
    }
}

function removeFromWatchlist(imdbID) {
    watchlist = watchlist.filter(item => item.imdbID !== imdbID);
    saveWatchlist();
    renderWatchlist();
}

function createMovieCard(movie, isWatchlist = false) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const poster = movie.Poster !== 'N/A' 
        ? movie.Poster 
        : 'https://via.placeholder.com/300x450?text=No+Poster';

    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}" class="poster">
        <div class="info">
            <h3>${movie.Title}</h3>
            <p>${movie.Year} • ${movie.Type}</p>
            ${isWatchlist ? 
                `<button class="remove-btn" onclick="removeFromWatchlist('${movie.imdbID}')">Remove</button>` :
                `<button class="add-btn" onclick="addToWatchlistFromSearch('${movie.imdbID}')">Add to Watchlist</button>`
            }
        </div>
    `;

    return card;
}

async function search() {
    const query = searchInput.value.trim();
    if (!query) {
        searchMsg.textContent = 'Please enter a movie or series name';
        return;
    }

    searchResults.innerHTML = '';
    searchMsg.textContent = 'Searching...';

    try {
        const type = typeFilter.value;
        let url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        
        if (type) url += `&type=${type}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.Response === 'True') {
            searchMsg.textContent = `Found ${data.totalResults} results`;
            
            data.Search.forEach(movie => {
                const card = createMovieCard(movie);
                searchResults.appendChild(card);
            });
        } else {
            searchMsg.textContent = data.Error || 'No results found';
        }
    } catch (err) {
        searchMsg.textContent = 'Error connecting to OMDB API';
        console.error(err);
    }
}

window.addToWatchlistFromSearch = async (imdbID) => {
    try {
        const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
        const movie = await res.json();

        if (movie.Response === 'True') {
            addToWatchlist(movie);
        }
    } catch (err) {
        console.error('Failed to fetch full movie details', err);
    }
};

function renderWatchlist() {
    watchlistResults.innerHTML = '';

    if (watchlist.length === 0) {
        watchlistMsg.textContent = 'Your watchlist is empty';
        return;
    }

    watchlistMsg.textContent = '';
    
    watchlist.forEach(movie => {
        const card = createMovieCard(movie, true);
        watchlistResults.appendChild(card);
    });
}

window.showTab = (tabName, btn) => {

    document.querySelectorAll('.tab').forEach(tab => tab.classList.add('hidden'));
    
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (tabName === 'watchlist') {
        renderWatchlist();
    }
};


searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});

updateWatchlistCount();