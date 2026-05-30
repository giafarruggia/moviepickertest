const CACHE_KEY = "movies_cache";
const TIME_KEY = "movies_cache_time";
const ONE_HOUR = 1000 * 60 * 60;

function setCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(TIME_KEY, Date.now());
}

function getCache() {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
}

function isStale() {
    const last = Number(localStorage.getItem(TIME_KEY));
    return !last || (Date.now() - last > ONE_HOUR);
}

let movies = [];

function loadMoviesFromCSV() {
    return async function loadMovies() {
    const cached = getCache();

    if (cached) {
        movies = cached;
        populateMediums();
        populateVibes();
    }

    if (isStale() || !cached) {
        const fresh = await loadMoviesFromCSV();

        movies = fresh;
        populateMediums();
        populateVibes();
    }
}

function populateMediums() {
    const mediums = [...new Set(movies.map(m => m.medium))].sort();
    const select = document.getElementById("medium");

    mediums.forEach(medium => {
        const option = document.createElement("option");
        option.value = medium;
        option.textContent = medium;
        document.getElementById("medium").appendChild(option);
        select.appendChild(option);
    });
}

function populateVibes() {
    const allVibes = [...new Set(
        movies.flatMap(movie => movie.vibes)
    )].sort();

    const container = document.getElementById("vibesContainer");

    allVibes.forEach(vibe => {
        const label = document.createElement("label");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = vibe;
        checkbox.className = "vibe-checkbox";

        label.appendChild(checkbox);
        label.append(" " + vibe);

        container.appendChild(label);
    });
}

document.getElementById("pickMovie").addEventListener("click", () => {

    const medium = document.getElementById("medium").value;
    const maxLength = parseInt(document.getElementById("length").value);

    const selectedVibes = [...document.querySelectorAll(".vibe-checkbox:checked")]
        .map(cb => cb.value);

    const filtered = movies.filter(movie => {

        const mediumMatch =
            !medium || movie.medium === medium;

    const lengthMatch =
            movie.length <= maxLength;

        const vibesMatch =
            selectedVibes.every(vibe =>
                movie.vibes.includes(vibe)
            );

        return mediumMatch && lengthMatch && vibesMatch;
    });

    const result = document.getElementById("result");

    if (filtered.length === 0) {
        result.textContent = "change your search and try again.";
        return;
    }

    const movie =
        filtered[Math.floor(Math.random() * filtered.length)];

    result.textContent =
        movie.year
            ? `${movie.title} (${movie.year})`
            : movie.title;
});
loadMovies();
