const API_URL = "https://api.jikan.moe/v4";

const homeContent = document.getElementById("homeContent");
const searchSection = document.getElementById("searchResultsSection");
const resultsGrid = document.getElementById("searchResultsGrid");
const searchInput = document.getElementById("searchInput");

document.addEventListener("DOMContentLoaded", () => {
  loadCategory("trending-row", "/top/anime");
  loadCategory("new-row", "/seasons/upcoming");
  loadHero();
});

// Busca e Alternância de Telas
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  const query = e.target.value;
  clearTimeout(searchTimeout);

  if (query.length > 2) {
    searchTimeout = setTimeout(() => performSearch(query), 500);
  } else if (query.length === 0) {
    resetHome();
  }
});

async function performSearch(query) {
  homeContent.classList.add("hidden");
  searchSection.classList.remove("hidden");
  resultsGrid.innerHTML = "<p>Buscando...</p>";

  try {
    const response = await fetch(`${API_URL}/anime?q=${query}&limit=20`);
    const { data } = await response.json();

    if (data.length === 0) {
      resultsGrid.innerHTML = "<p>Nenhum anime encontrado.</p>";
      return;
    }

    resultsGrid.innerHTML = data
      .map(
        (anime) => `
            <div class="anime-card" onclick="openModal(${anime.mal_id})">
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                <p style="margin-top:8px; font-size:0.9rem; text-align:center">${anime.title}</p>
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

function resetHome() {
  searchInput.value = "";
  homeContent.classList.remove("hidden");
  searchSection.classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadCategory(containerId, endpoint) {
  const container = document.getElementById(containerId);
  try {
    const response = await fetch(`${API_URL}${endpoint}?limit=15`);
    const { data } = await response.json();
    container.innerHTML = data
      .map(
        (anime) => `
            <div class="anime-card" onclick="openModal(${anime.mal_id})">
                <img src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

async function loadHero() {
  const response = await fetch(`${API_URL}/top/anime?limit=1`);
  const { data } = await response.json();
  const anime = data[0];
  const hero = document.getElementById("hero");

  hero.style.backgroundImage = `linear-gradient(to right, #141414, transparent), url(${anime.images.jpg.large_image_url})`;
  document.getElementById("heroContent").innerHTML = `
        <h1>${anime.title}</h1>
        <p>${anime.synopsis.substring(0, 180)}...</p>
        <button class="handle" style="position:static; width:auto; padding:12px 35px; margin-top:20px; font-size:1.1rem; border-radius:4px; font-weight:bold" onclick="openModal(${anime.mal_id})">
            <i class="fas fa-play"></i> Trailer
        </button>
    `;
}

function moveSlider(button, direction) {
  const container = button.parentElement.querySelector(".container");
  const scrollAmount = container.clientWidth;
  container.scrollBy({ left: scrollAmount * direction, behavior: "smooth" });
}

async function openModal(id) {
  const modal = document.getElementById("animeModal");
  const trailerDiv = document.getElementById("trailerContainer");
  modal.style.display = "block";
  document.body.style.overflow = "hidden";

  const response = await fetch(`${API_URL}/anime/${id}`);
  const { data } = await response.json();

  document.getElementById("modalTitle").innerText = data.title;
  document.getElementById("modalScore").innerText =
    `Avaliação: ${data.score || "N/A"}`;
  document.getElementById("modalSynopsis").innerText =
    data.synopsis || "Sinopse indisponível.";

  if (data.trailer.embed_url) {
    trailerDiv.innerHTML = `<iframe width="100%" height="450" src="${data.trailer.embed_url}" allowfullscreen></iframe>`;
  } else {
    trailerDiv.innerHTML = `<img src="${data.images.jpg.large_image_url}" style="width:100%; height:450px; object-fit:cover">`;
  }
}

function closeModal() {
  const modal = document.getElementById("animeModal");
  const trailerDiv = document.getElementById("trailerContainer");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  trailerDiv.innerHTML = ""; // MATA O ÁUDIO
}

window.onclick = (e) => {
  if (e.target == document.getElementById("animeModal")) closeModal();
};

window.onscroll = () => {
  const header = document.getElementById("header");
  if (window.scrollY > 80) header.classList.add("black");
  else header.classList.remove("black");
};
