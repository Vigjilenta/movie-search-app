const movieContainer = document.querySelector(".movies");
const searchInput = document.querySelector(".search");
const details = document.querySelector(".details");
const detailsBody = document.querySelector(".details-body");
const closeDetails = document.querySelector(".close-details");

const toggleBtn = document.querySelector(".toggle-theme");
const showAllBtn = document.querySelector(".show-all");
const favBtn = document.querySelector(".show-favorites");

let allMovies = [];
let currentView = "all";

const setDark = (isDark) => {
  if (isDark) {
    document.body.classList.add("dark");
    toggleBtn.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark");
    toggleBtn.textContent = "🌙 Dark Mode";
  }
};

if (localStorage.getItem("theme") === "dark") setDark(true);

toggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  setDark(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

const getFavorites = () => JSON.parse(localStorage.getItem("favorites")) || [];

window.toggleFavorite = (id) => {
  let favorites = getFavorites();
  const exists = favorites.find((m) => m.id === id);

  if (exists) {
    favorites = favorites.filter((m) => m.id !== id);
  } else {
    const movie = allMovies.find((m) => m.id === id);
    if (movie) favorites.push(movie);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));

  if (currentView === "favorites") {
    showMovies(getFavorites());
  } else {
    showMovies(allMovies);
  }
};

const showMovies = (movies) => {
  movieContainer.innerHTML = "";
  if (movies.length === 0) {
    movieContainer.innerHTML = "<h3>No results found.</h3>";
    return;
  }

  movies.forEach((movie) => {
    const isSaved = getFavorites().some((m) => m.id === movie.id);
    const html = `
      <div class="movie">
        <img src="${movie.image}" />
        <div class="movie-header">
          <h3>${movie.title}</h3>
          <span>${movie.release_date}</span>
        </div>
        <button class="fav-btn" onclick="toggleFavorite('${movie.id}')">
          ${isSaved ? "⭐ Saved" : "☆ Save"}
        </button>
        <p>${movie.description.slice(0, 100)}...</p>
        <button class="details-btn" onclick="openDetails('${movie.id}')">
          View Details
        </button>
      </div>
    `;
    movieContainer.insertAdjacentHTML("beforeend", html);
  });
};

const getMovies = () => {
  movieContainer.innerHTML = "<p>Loading movies...</p>";
  fetch("https://ghibliapi.vercel.app/films")
    .then((res) => res.json())
    .then((data) => {
      allMovies = data;
      showMovies(allMovies);
    });
};

showAllBtn.addEventListener("click", () => {
  currentView = "all";
  searchInput.value = "";
  showMovies(allMovies);
});

favBtn.addEventListener("click", () => {
  currentView = "favorites";
  showMovies(getFavorites());
});

searchInput.addEventListener("input", () => {
  const text = searchInput.value.toLowerCase();
  const filtered = allMovies.filter(
    (m) =>
      m.title.toLowerCase().includes(text) ||
      m.director.toLowerCase().includes(text),
  );
  showMovies(filtered);
});

window.openDetails = (id) => {
  const movie = allMovies.find((m) => String(m.id) === String(id));
  if (!movie) return;

  detailsBody.innerHTML = `
    <img src="${movie.image}" />
    <h2>${movie.title}</h2>
    <p><strong>Year:</strong> ${movie.release_date} | <strong>Score:</strong> 🍅 ${movie.rt_score}%</p>
    <p><strong>Director:</strong> ${movie.director} | <strong>Producer:</strong> ${movie.producer}</p>
    <hr style="opacity: 0.1; margin: 15px 0;">
    <p style="line-height: 1.6;">${movie.description}</p>
  `;

  details.classList.remove("hidden");
  document.querySelector(".details-content").scrollTop = 0;
};

closeDetails.addEventListener("click", () => details.classList.add("hidden"));
details.addEventListener("click", (e) => {
  if (e.target === details) details.classList.add("hidden");
});

getMovies();
