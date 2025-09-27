const templates = [
  // --- 2D Arcade & Platformers ---
  { id: 'space-shooter', title: '2D Space Shooter', image: 'assets/space-shooter1.png', description: 'Classic arcade-style space shooter with enemies and power-ups.', tags: ['2d','shooter'] },
  { id: 'platformer', title: '2D Platformer', image: 'assets/platformer.jpeg', description: 'Jump across platforms, avoid traps, and collect items.', tags: ['2d','platformer'] },
  { id: 'runner', title: 'Endless Runner', image: 'assets/runner.jpeg', description: 'Avoid obstacles and collect rewards in an endless running world.', tags: ['2d','runner'] },
  { id: 'metroidvania', title: 'Metroidvania', image: 'assets/metroidvania.jpeg', description: 'Exploration-driven platformer with unlockable abilities and maps.', tags: ['2d','platformer'] },
  { id: 'side-scroller', title: 'Side Scroller', image: 'assets/sidescroller.jpeg', description: 'Classic side-scrolling adventure template.', tags: ['2d','platformer'] },

  // --- Puzzle Games ---
  { id: 'match3', title: 'Match-3 Puzzle', image: 'assets/match3.jpeg', description: 'A match-3 puzzle game with color-based block matching.', tags: ['2d','puzzle'] },
  { id: 'sokoban', title: 'Sokoban Puzzle', image: 'assets/sokoban.jpeg', description: 'Push crates to reach goals in challenging puzzle maps.', tags: ['2d','puzzle'] },
  { id: 'word-game', title: 'Word Game', image: 'assets/word-game.jpeg', description: 'Create words and solve challenges with letter tiles.', tags: ['2d','puzzle'] },
  { id: 'sudoku', title: 'Sudoku', image: 'assets/sudoku.jpeg', description: 'Classic Sudoku puzzle with multiple difficulty levels.', tags: ['puzzle'] },
  { id: 'jigsaw', title: 'Jigsaw Puzzle', image: 'assets/jigsaw.jpeg', description: 'Solve images by putting pieces together.', tags: ['puzzle'] },

  // --- Shooters ---
  { id: 'topdown-shooter', title: '2D Top-down Shooter', image: 'assets/topdown.jpeg', description: 'Battle enemies from a top-down view with weapons and upgrades.', tags: ['2d','shooter'] },
  { id: 'bullet-hell', title: 'Bullet Hell', image: 'assets/bullethell.jpeg', description: 'Survive waves of enemies in a screen-filling bullet hell.', tags: ['2d','shooter'] },
  { id: 'fps-arena', title: '3D FPS Arena', image: 'assets/fps.jpeg', description: 'A first-person shooter template set in a 3D combat arena.', tags: ['3d','fps'] },
  { id: 'battle_royale', title: '3D Battle Royale', image: 'assets/battle.jpeg', description: 'Large survival map with multiplayer mechanics.', tags: ['3d','shooter'] },
  { id: 'stealth', title: 'Stealth Action', image: 'assets/stealth.jpeg', description: 'Sneak past guards and complete missions unnoticed.', tags: ['3d','stealth'] },

  // --- Racing & Sports ---
  { id: 'racing-3d', title: '3D Racing Game', image: 'assets/racing.jpeg', description: 'High-speed racing game with 3D tracks and cars.', tags: ['3d','racing'] },
  { id: 'kart-racing', title: 'Kart Racing', image: 'assets/kart.jpeg', description: 'Fun cartoon-style racing with power-ups.', tags: ['3d','racing'] },
  { id: 'bike-racing', title: 'Bike Racing', image: 'assets/bike.jpeg', description: 'Race motorcycles with stunts and tricks.', tags: ['2d','racing'] },
  { id: 'soccer', title: 'Soccer Game', image: 'assets/soccer.jpeg', description: 'Multiplayer soccer/football simulation.', tags: ['sports'] },
  { id: 'basketball', title: 'Basketball Game', image: 'assets/basketball.jpeg', description: 'Street-style basketball matches.', tags: ['sports'] },

  // --- Strategy / Builder ---
  { id: 'base_builder', title: 'Base Builder', image: 'assets/build.jpg', description: 'Build and upgrade your base to defend against enemies.', tags: ['strategy','builder'] },
  { id: 'tower_defense', title: 'Tower Defense', image: 'assets/tower.jpeg', description: 'Place towers to defend your path from waves of enemies.', tags: ['strategy','tower'] },
  { id: 'city-builder', title: 'City Builder', image: 'assets/city.jpeg', description: 'Plan, grow, and manage your dream city.', tags: ['strategy','sim'] },
  { id: 'farming-sim', title: 'Farming Simulator', image: 'assets/farming.jpeg', description: 'Plant, harvest, and build a thriving farm economy.', tags: ['sim','management'] },
  { id: 'colony', title: 'Colony Survival', image: 'assets/colony.jpeg', description: 'Manage colonists and resources to survive.', tags: ['strategy','sim'] },

  // --- RPG & Adventure ---
  { id: 'rpg', title: '2D RPG Adventure', image: 'assets/rpg.jpeg', description: 'Quest, battle, and level up in a 2D fantasy world.', tags: ['2d','rpg'] },
  { id: 'roguelike', title: 'Roguelike Dungeon', image: 'assets/roguelike.jpeg', description: 'Procedural dungeons with permadeath mechanics.', tags: ['2d','roguelike'] },
  { id: 'open-world', title: '3D Open World', image: 'assets/openworld.jpeg', description: 'Explore a massive 3D environment with quests and AI.', tags: ['3d','adventure'] },
  { id: 'isometric-rpg', title: 'Isometric RPG', image: 'assets/isometric.jpeg', description: 'Tactical isometric RPG with party combat.', tags: ['rpg','strategy'] },
  { id: 'dungeon-crawler', title: 'Dungeon Crawler', image: 'assets/dungeon.jpeg', description: 'Fight monsters and loot dungeons in a top-down view.', tags: ['rpg','adventure'] },

  // --- Casual & Mini Games ---
  { id: 'flappy', title: 'Flappy Clone', image: 'assets/flappy.jpeg', description: 'Tap to fly through pipes in a simple endless game.', tags: ['2d','casual'] },
  { id: 'snake', title: 'Snake Classic', image: 'assets/snake.jpeg', description: 'Eat food and grow longer while avoiding walls.', tags: ['2d','casual'] },
  { id: 'brick-breaker', title: 'Brick Breaker', image: 'assets/brickbreaker.jpeg', description: 'Break all the bricks using a bouncing ball.', tags: ['2d','casual'] },
  { id: 'tic-tac-toe', title: 'Tic-Tac-Toe', image: 'assets/tictactoe.jpeg', description: 'Classic tic-tac-toe with single and multiplayer.', tags: ['casual'] },
  { id: 'memory', title: 'Memory Match', image: 'assets/memory.jpeg', description: 'Flip cards and find pairs in a memory game.', tags: ['casual','puzzle'] },

  // --- Creative & Narrative ---
  { id: 'visual-novel', title: 'Visual Novel', image: 'assets/novel.jpeg', description: 'Interactive storytelling with branching dialogue.', tags: ['story','visual'] },
  { id: 'story-builder', title: 'Story Builder', image: 'assets/story.jpeg', description: 'Drag-and-drop tool to build interactive stories.', tags: ['story','creative'] },
  { id: 'music-game', title: 'Music Rhythm', image: 'assets/music.jpeg', description: 'Hit beats in sync with music tracks.', tags: ['casual','music'] },
  { id: 'art-sandbox', title: 'Art Sandbox', image: 'assets/art.jpeg', description: 'Create drawings, animations, and interactive art.', tags: ['creative'] },
  { id: 'quiz', title: 'Quiz Game', image: 'assets/quiz.jpeg', description: 'Customizable quiz with multiple-choice questions.', tags: ['casual','educational'] },
  // --- NEW 3D ADDITIONS ---
  { id: '3d-rpg', title: '3D RPG Adventure', image: 'assets/3d-rpg.jpeg', description: 'Open world RPG starter with quests, inventory, and dialogue.', type: '3d', tags: ['rpg','adventure'] },
  { id: '3d-platformer', title: '3D Platformer', image: 'assets/3d-platformer.jpeg', description: 'Jump, climb, and explore a 3D world full of challenges.', type: '3d', tags: ['platformer','exploration'] },
  { id: '3d-city-builder', title: '3D City Builder', image: 'assets/3d-city-builder.jpeg', description: 'Manage resources and expand your 3D city with buildings and zones.', type: '3d', tags: ['city','strategy'] },
  { id: '3d-sports', title: '3D Sports Game', image: 'assets/3d-sports.jpeg', description: 'Customizable sports template (soccer, basketball, or more).', type: '3d', tags: ['sports','multiplayer'] },
  { id: '3d-racing-offroad', title: '3D Off-Road Racing', image: 'assets/3d-offroad.jpeg', description: 'Racing on rugged terrains with physics-based controls.', type: 'racing', tags: ['offroad','3d'] },
  { id: '3d-flight', title: '3D Flight Simulator', image: 'assets/3d-flight.jpeg', description: 'Fly customizable aircraft with realistic physics.', type: '3d', tags: ['simulation','flight'] },
  { id: '3d-arena-brawler', title: '3D Arena Brawler', image: 'assets/3d-brawler.jpeg', description: 'Fast-paced melee combat in 3D arenas.', type: '3d', tags: ['fighting','arena'] },
  { id: '3d-survival-horror', title: '3D Survival Horror', image: 'assets/3d-horror.jpeg', description: 'Dark environments, puzzles, and horror survival gameplay.', type: '3d', tags: ['horror','survival'] },
  { id: '3d-space-explorer', title: '3D Space Explorer', image: 'assets/3d-space.jpeg', description: 'Explore planets, collect resources, and survive in space.', type: '3d', tags: ['exploration','sci-fi'] },
  { id: '3d-sandbox', title: '3D Sandbox World', image: 'assets/3d-sandbox.jpeg', description: 'Creative 3D sandbox with terrain editing and building.', type: '3d', tags: ['sandbox','creative'] }
];
// editor.js — robust template loader (run at top of your editor init)
async function getTemplateForEditor() {
  // 1) Try full object from localStorage
  try {
    const raw = localStorage.getItem('selectedTemplateData');
    if (raw) {
      const obj = JSON.parse(raw);
      console.log('Loaded template from selectedTemplateData', obj.id);
      return obj;
    }
  } catch (e) {
    console.warn('Failed to parse selectedTemplateData', e);
  }

  // 2) Try query param id
  const params = new URLSearchParams(location.search);
  const idFromQuery = params.get('template') || localStorage.getItem('selectedTemplate');
  if (idFromQuery) {
    console.log('Template id from query/localStorage:', idFromQuery);
    // Try to find it in a /templates/index.json (recommended) OR fetch by convention /templates/<id>.json
    try {
      // try index.json first
      const idxResp = await fetch('/templates/index.json', {cache: 'no-store'});
      if (idxResp.ok) {
        const idx = await idxResp.json();
        const found = idx.find(t => t.id === idFromQuery);
        if (found) {
          // if found has `file` property, fetch the full file; else return found
          if (found.file) {
            const fResp = await fetch(found.file);
            if (fResp.ok) return await fResp.json();
          }
          return found;
        }
      }
    } catch (e) {
      console.warn('index.json fetch failed', e);
    }

    // fallback: try conventions
    try {
      const resp = await fetch(`/templates/${idFromQuery}.json`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn('fallback templates/<id>.json fetch failed', e);
    }
  }

  // 3) nothing found
  console.warn('No template found for editor (tried localStorage, query param, index.json and fallback)');
  return null;
}

// Usage:
(async () => {
  const template = await getTemplateForEditor();
  if (!template) {
    // show user message and avoid trying to draw with undefined data
    console.error('Editor: no template loaded');
    // show helpful UI message or keep a default blank canvas
  } else {
    initCanvasWithTemplate(template);
  }
})();

// DOM refs (guarded)
const grid = document.getElementById('templateGrid');
const searchBar = document.getElementById('searchBar');
const typeFilter = document.getElementById('typeFilter');
const clearBtn = document.getElementById('clearSearch');

const previewModal = document.getElementById('previewModal');
const previewImg = document.getElementById('previewImg');
const previewTitle = document.getElementById('previewTitle');
const previewDescription = document.getElementById('previewDescription');
const openEditorBtn = document.getElementById('openEditorBtn');
const modalClose = document.querySelector('.modal-close');

// Safety: require grid
if (!grid) throw new Error('templateGrid element not found');

function saveAndOpenEditor(templateId) {
  const t = templates.find(x => x.id === templateId);
  if (!t) {
    console.warn('Template not found for editor open:', templateId);
    // still navigate with id so editor can try to fetch it
    window.location.href = `editor.html?template=${encodeURIComponent(templateId)}`;
    return;
  }
  // store both: id (legacy) and full object (preferred)
  try {
    localStorage.setItem('selectedTemplate', templateId); // legacy
    localStorage.setItem('selectedTemplateData', JSON.stringify(t)); // full object
  } catch (err) {
    console.warn('localStorage failed', err);
  }
  // navigate with query param too (editor can use either)
  window.location.href = `editor.html?template=${encodeURIComponent(templateId)}`;
}


function renderCards(list){
  grid.innerHTML = '';
  list.forEach(t => {
    const card = document.createElement('article');
    card.className = 'template-card';
    // ensure tags array exists
    const tags = Array.isArray(t.tags) ? t.tags : [];
    const firstBadge = tags[0] || 'template';
    const restBadges = tags.slice(1).map(tt => `<span class="badge">${tt}</span>`).join('');

    card.innerHTML = `
      <img loading="lazy" decoding="async" class="thumb" src="${t.image}" alt="${t.title}">
      <div class="meta">
        <div class="tag-row">
          <span class="badge">${firstBadge}</span>
          ${restBadges}
        </div>
        <h4 class="template-title">${t.title}</h4>
        <p class="template-description">${t.description}</p>
      </div>
      <div class="actions">
        <button class="btn primary btn-edit" data-id="${t.id}">Edit</button>
        <button class="btn ghost btn-preview" data-id="${t.id}">Preview</button>
      </div>

      <div class="card-overlay" aria-hidden="true">
        <div class="overlay-actions">
          <button class="btn primary btn-preview-ov" data-id="${t.id}">Preview</button>
          <button class="btn ghost btn-edit-ov" data-id="${t.id}">Edit</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
// attach button listeners (delegation would be more performant; kept simple)
  document.querySelectorAll('.btn-preview, .btn-preview-ov').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      if (id) openPreview(id);
    });
  });
document.querySelectorAll('.btn-edit, .btn-edit-ov').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      if (id) saveAndOpenEditor(id);
    });
  });
}
// preview modal logic
function openPreview(id){
  const t = templates.find(x => x.id === id);
  if(!t || !previewModal) return;
  if (previewImg) previewImg.src = t.image || '';
  if (previewTitle) previewTitle.textContent = t.title || '';
  if (previewDescription) previewDescription.textContent = t.description || '';
  // open editor button uses the same localStorage flow
  if (openEditorBtn) {
    openEditorBtn.onclick = (ev) => {
      ev?.preventDefault();
      saveAndOpenEditor(t.id);
    };
  }
previewModal.setAttribute('aria-hidden','false');
  // move focus into modal for accessibility
  previewModal.focus?.();
}

function closePreview(){
  if (!previewModal) return;
  previewModal.setAttribute('aria-hidden','true');
  if (previewImg) previewImg.src = '';
  // cleanup openEditorBtn handler to avoid leaks
  if (openEditorBtn) openEditorBtn.onclick = null;
}

// search + filter
function getFiltered(){
  const q = (searchBar?.value || '').trim().toLowerCase();
  const type = (typeFilter?.value || '').toLowerCase();
  return templates.filter(t => {
    const title = (t.title || '').toLowerCase();
    const desc = (t.description || '').toLowerCase();
    const tags = (t.tags || []).join(' ').toLowerCase();
    const matchesQ = !q || title.includes(q) || desc.includes(q) || tags.includes(q);
    const matchesType = !type || tags.includes(type) || (t.type && (t.type.toLowerCase() === type));
    return matchesQ && matchesType;
  });
}

clearBtn?.addEventListener('click', ()=>{
  if (searchBar) searchBar.value = '';
  if (typeFilter) typeFilter.value = '';
  renderCards(templates);
});


searchBar?.addEventListener('input', () => renderCards(getFiltered()));
typeFilter?.addEventListener('change', () => renderCards(getFiltered()));

// modal close handlers (guards)
modalClose?.addEventListener('click', closePreview);
previewModal?.addEventListener('click', (e)=>{
  if(e.target === previewModal) closePreview();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closePreview();
});

// initial render (all templates)
renderCards(templates);
