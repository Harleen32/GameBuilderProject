// ===============================
// Preview Page Script
// ===============================

// Elements
const reloadBtn = document.getElementById("reloadBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const gameFrame = document.getElementById("gameFrame");
const previewMsg = document.getElementById("previewMsg");

const editBtn = document.getElementById("editBtn");
const publishBtn = document.getElementById("publishBtn");
const downloadBtn = document.getElementById("downloadBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

// Game Meta Elements
const gameTitle = document.getElementById("gameTitle");          // top nav
const gameTitleMeta = document.getElementById("gameTitleMeta");  // info section
const gameDesc = document.getElementById("gameDesc");
const gameType = document.getElementById("gameType");
const gameLevels = document.getElementById("gameLevels");
const gameEnemies = document.getElementById("gameEnemies");
const gameThumb = document.getElementById("gameThumb");

// ===============================
// Load Game Data from localStorage
// ===============================
function loadGame() {
  const gameData = JSON.parse(localStorage.getItem("latestGame")); 

  if (!gameData || !gameData.gameUrl) {
    previewMsg.textContent = "⚠️ No game data found. Please generate a game first.";
    previewMsg.style.color = "#ef4444"; // red
    gameFrame.style.display = "none";
    return;
  }

  // Show the game in preview
  gameFrame.style.display = "block";
  gameFrame.src = gameData.gameUrl;

  // Status
  previewMsg.textContent = "✅ Game loaded successfully!";
  previewMsg.style.color = "#22c55e"; // green

  // Update Meta Info
  gameTitle.textContent = gameData.prompt || "Untitled Game";
  gameTitleMeta.textContent = gameData.prompt || "Untitled Game";
  gameDesc.textContent = gameData.desc || "No description provided.";
  gameType.textContent = gameData.type || "–";
  gameLevels.textContent = gameData.levels || "–";
  gameEnemies.textContent = gameData.enemies || "–";

  // Thumbnail
  gameThumb.src = gameData.thumb || "assets/placeholder.png";
}

// ===============================
// Controls
// ===============================

// 🔄 Reload Game
reloadBtn?.addEventListener("click", () => {
  if (gameFrame.src) {
    gameFrame.src = gameFrame.src; // reload iframe
    previewMsg.textContent = "🔄 Game restarted.";
    previewMsg.style.color = "#facc15"; // yellow
  }
});

// ⛶ Fullscreen
fullscreenBtn?.addEventListener("click", () => {
  if (gameFrame.requestFullscreen) {
    gameFrame.requestFullscreen();
  } else if (gameFrame.webkitRequestFullscreen) {
    gameFrame.webkitRequestFullscreen(); // Safari
  } else {
    alert("Fullscreen not supported in this browser.");
  }
});

// 🌙/☀️ Theme Toggle
themeToggleBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");

  if (document.body.classList.contains("dark")) {
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
});

// 🎨 Edit Game → redirect to editor.html
editBtn?.addEventListener("click", () => {
  const gameData = JSON.parse(localStorage.getItem("latestGame"));
  if (!gameData) {
    alert("⚠️ No game data found to edit.");
    return;
  }

  // Flag editing mode
  localStorage.setItem("editingGame", JSON.stringify(gameData));

  // Redirect to editor page
  window.location.href = "editor.html";
});

// 🚀 Publish Game → mock publish
publishBtn?.addEventListener("click", () => {
  const gameData = JSON.parse(localStorage.getItem("latestGame"));
  if (!gameData) {
    alert("⚠️ No game data found to publish.");
    return;
  }

  alert(`🚀 Game "${gameData.prompt}" has been published successfully!`);
});

// ⬇️ Download Game → open ZIP if available
downloadBtn?.addEventListener("click", () => {
  const gameData = JSON.parse(localStorage.getItem("latestGame"));
  if (!gameData || !gameData.zip) {
    alert("⚠️ No downloadable package available.");
    return;
  }
  window.open(gameData.zip, "_blank");
});

// ❌ Cancel Edit → back to use-ai.html
cancelEditBtn?.addEventListener("click", () => {
  if (confirm("Are you sure you want to cancel editing and go back?")) {
    window.location.href = "use-ai.html"; 
  }
});

// ===============================
// Initialize on Page Load
// ===============================
document.addEventListener("DOMContentLoaded", loadGame);
