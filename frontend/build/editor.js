document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas) {
    console.error("editorCanvas not found in DOM.");
    return;
  }
  const ctx = canvas.getContext("2d");
  const canvasObjects = [];
  let selectedObject = null;
  let offsetX = 0, offsetY = 0;
  let isDragging = false, isResizing = false, isRotating = false;
  let currentHandle = null;
  // Utility: safe get
  const $ = (id) => document.getElementById(id);

// ===== Canvas sizing =====
  function resizeCanvasToParent() {
    // keep devicePixelRatio in mind for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement || document.body;
    const w = parent.clientWidth;
    const h = parent.clientHeight || 600;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing operations
    drawCanvas();
  }
  resizeCanvasToParent();
  window.addEventListener("resize", resizeCanvasToParent);

  
 const sidebarData = window.sidebarData || {   
   "Players & Characters": [
      {name: "Main Player",img: "assets/player.png"},
      {name:"Enemy (Patrolling)",img: "assets/enemy.png"},
      {name: "Flying Enemy", img: "assets/enemy_flying.png" },
      {name: "NPC", img: "assets/npc.png" },
      {name: "Boss Character", img: "assets/boss.png" },
      {name:"Rideable Animal", img :"assets/Animal"},
      {name:"Summoner Enemy", img: "assets/Enemy"},
      {name:"Invisible Enemy",img: "assets/invisible" }],
"Terrain & Structures": [
    { name: "Ground", img: "assets/placeholder.png" },
    { name: "Platforms", img: "assets/placeholder.png" },
    { name: "Walls", img: "assets/placeholder.png" },
    { name: "Ladders", img: "assets/placeholder.png" },
    { name: "Moving Platform", img: "assets/placeholder.png" },
    { name: "Breakable Platform", img: "assets/placeholder.png" },
    { name: "Rotating Platform", img: "assets/placeholder.png" },
    { name: "Slope", img: "assets/placeholder.png" },
    { name: "Conveyor Belt", img: "assets/placeholder.png" },
    { name: "Different Platform Types", img: "assets/placeholder.png" },
    { name: "Fragile Ice Block", img: "assets/placeholder.png" },
    { name: "Bouncy Platform", img: "assets/placeholder.png" },
    { name: "Low Gravity Zone", img: "assets/placeholder.png" },
    { name: "Gravity Flip Zone", img: "assets/placeholder.png" },
    { name: "Falling Bridge", img: "assets/placeholder.png" }
  ],
 "Hazards": [
    { name: "Spikes", img: "assets/placeholder.png" },
    { name: "Lava", img: "assets/placeholder.png" },
    { name: "Fire Trap", img: "assets/placeholder.png" },
    { name: "Falling Rock", img: "assets/placeholder.png" },
    { name: "Poison Gas", img: "assets/placeholder.png" },
    { name: "Water", img: "assets/placeholder.png" },
    { name: "Spinning Blade", img: "assets/placeholder.png" },
    { name: "Electric Field", img: "assets/placeholder.png" },
    { name: "Quicksand", img: "assets/placeholder.png" },
    { name: "Mine", img: "assets/placeholder.png" },
    { name: "Auto Turret", img: "assets/placeholder.png" },
    { name: "Remote Bomb", img: "assets/placeholder.png" },
    { name: "Fire Pit", img: "assets/placeholder.png" },
    { name: "Spike Ball Chain", img: "assets/placeholder.png" }
  ],
"Items & Collectibles": [
    { name: "Coins", img: "assets/placeholder.png" },
    { name: "Power-Ups", img: "assets/placeholder.png" },
    { name: "Health Packs", img: "assets/placeholder.png" },
    { name: "Keys", img: "assets/placeholder.png" },
    { name: "Treasure Chest", img: "assets/placeholder.png" },
    { name: "Gem", img: "assets/placeholder.png" },
    { name: "Time Bonus", img: "assets/placeholder.png" },
    { name: "Extra Life", img: "assets/placeholder.png" },
    { name: "Magnet Power-Up", img: "assets/placeholder.png" },
    { name: "Double Jump Upgrade", img: "assets/placeholder.png" },
    { name: "Shrink Power", img: "assets/placeholder.png" },
    { name: "Invincibility Shield", img: "assets/placeholder.png" }
  ],
    "Interactive Objects": [
    { name: "Doors", img: "assets/placeholder.png" },
    { name: "Switches", img: "assets/placeholder.png" },
    { name: "Levers", img: "assets/placeholder.png" },
    { name: "Teleporters", img: "assets/placeholder.png" },
    { name: "Moving Bridge", img: "assets/placeholder.png" },
    { name: "Crate/Box", img: "assets/placeholder.png" },
    { name: "Spring/Trampoline", img: "assets/placeholder.png" },
    { name: "Checkpoint Flag", img: "assets/placeholder.png" },
    { name: "Elevator/Lift", img: "assets/placeholder.png" },
    { name: "Cannon/Turret", img: "assets/placeholder.png" },
    { name: "Teleport Portal", img: "assets/placeholder.png" },
    { name: "Push Button", img: "assets/placeholder.png" },
    { name: "Piston/Crusher", img: "assets/placeholder.png" },
    { name: "Seesaw Platform", img: "assets/placeholder.png" },
    { name: "Climbing Ladder", img: "assets/placeholder.png" }
  ],
   "Environment": [
    { name: "Background", img: "assets/placeholder.png" },
    { name: "Clouds", img: "assets/placeholder.png" },
    { name: "Mountains", img: "assets/placeholder.png" },
    { name: "Water", img: "assets/placeholder.png" },
    { name: "Trees", img: "assets/placeholder.png" },
    { name: "Lighting Source", img: "assets/placeholder.png" },
    { name: "Weather Effect", img: "assets/placeholder.png" },
    { name: "Wind Zone", img: "assets/placeholder.png" },
    { name: "Fog Area", img: "assets/placeholder.png" },
    { name: "Decorative Particles", img: "assets/placeholder.png" },
    { name: "Day/Night Cycle", img: "assets/placeholder.png" },
    { name: "Lightning Strike Zone", img: "assets/placeholder.png" },
    { name: "Tornado/Wind Vortex", img: "assets/placeholder.png" }
  ],
 "Triggers & Logic": [
    { name: "Checkpoints", img: "assets/placeholder.png" },
    { name: "Level End Trigger", img: "assets/placeholder.png" },
    { name: "Timed Trigger", img: "assets/placeholder.png" },
    { name: "Conditional Event", img: "assets/placeholder.png" },
    { name: "Pressure Plate", img: "assets/placeholder.png" },
    { name: "Proximity Trigger", img: "assets/placeholder.png" },
    { name: "Timed Switch", img: "assets/placeholder.png" },
    { name: "Enemy Spawn Zone", img: "assets/placeholder.png" },
    { name: "Checkpoint Zone", img: "assets/placeholder.png" },
    { name: "Music Change Zone", img: "assets/placeholder.png" },
    { name: "Dialog Trigger", img: "assets/placeholder.png" }
  ],
   "UI/Gameplay Systems": [
    { name: "Score Display", img: "assets/placeholder.png" },
    { name: "Health Bar", img: "assets/placeholder.png" },
    { name: "Timer", img: "assets/placeholder.png" },
    { name: "Inventory Panel", img: "assets/placeholder.png" },
    { name: "Mini Map", img: "assets/placeholder.png" },
    { name: "Level Timer Display", img: "assets/placeholder.png" },
    { name: "Score Display Object", img: "assets/placeholder.png" },
    { name: "Health Bar Object", img: "assets/placeholder.png" },
    { name: "Inventory Display Object", img: "assets/placeholder.png" },
    { name: "Crafting Table", img: "assets/placeholder.png" },
    { name: "Save Point", img: "assets/placeholder.png" },
    { name: "Dynamic Camera Zone", img: "assets/placeholder.png" }
  ],
"RPG / Adventure Elements": [
    { name: "Quest Giver", img: "assets/placeholder.png" },
    { name: "Dialogue Box", img: "assets/placeholder.png" },
    { name: "Inventory", img: "assets/placeholder.png" },
    { name: "Level-Up System", img: "assets/placeholder.png" },
    { name: "NPC Merchant", img: "assets/placeholder.png" },
    { name: "Quest Board", img: "assets/placeholder.png" },
    { name: "Treasure Chest", img: "assets/placeholder.png" },
    { name: "Skill Tree Upgrade Node", img: "assets/placeholder.png" },
    { name: "Dialogue Choice System", img: "assets/placeholder.png" },
    { name: "Party Member Follower", img: "assets/placeholder.png" },
    { name: "Mount/Dismount Point", img: "assets/placeholder.png" }
  ],
     "Strategy / Base Building": [
    { name: "Resource Node", img: "assets/placeholder.png" },
    { name: "Defensive Tower", img: "assets/placeholder.png" },
    { name: "Unit Spawner", img: "assets/placeholder.png" },
    { name: "Barracks", img: "assets/placeholder.png" },
    { name: "Resource Drop-off Point", img: "assets/placeholder.png" },
    { name: "Wall Segment", img: "assets/placeholder.png" },
    { name: "Gate/Door with HP", img: "assets/placeholder.png" },
    { name: "Turret with Upgrade Path", img: "assets/placeholder.png" },
    { name: "Trap Placement Spot", img: "assets/placeholder.png" }
  ],
   "Puzzle Mechanics": [
    { name: "Pressure Plate", img: "assets/placeholder.png" },
    { name: "Movable Block", img: "assets/placeholder.png" },
    { name: "Laser Puzzle", img: "assets/placeholder.png" },
    { name: "Key & Lock", img: "assets/placeholder.png" },
    { name: "Rotating Platform Puzzle", img: "assets/placeholder.png" },
    { name: "Mirror for Laser Reflection", img: "assets/placeholder.png" },
    { name: "Color Beam Splitter", img: "assets/placeholder.png" },
    { name: "Sliding Block Puzzle", img: "assets/placeholder.png" },
    { name: "Portal Pair", img: "assets/placeholder.png" },
    { name: "Timed Switch Puzzle", img: "assets/placeholder.png" }
  ],
   "Audio & Visual FX": [
    { name: "Background Music", img: "assets/placeholder.png" },
    { name: "Explosion FX", img: "assets/placeholder.png" },
    { name: "Lighting FX", img: "assets/placeholder.png" },
    { name: "Particle System", img: "assets/placeholder.png" },
    { name: "Ambient Sound Zone", img: "assets/placeholder.png" },
    { name: "Magic Spell FX", img: "assets/placeholder.png" },
    { name: "Weather FX", img: "assets/placeholder.png" },
    { name: "Dynamic Shadows", img: "assets/placeholder.png" },
    { name: "Screen Shake Trigger", img: "assets/placeholder.png" },
    { name: "Particle Emitters", img: "assets/placeholder.png" }
  ],
    "Multiplayer / Online": [
    { name: "Chat Box", img: "assets/placeholder.png" },
    { name: "Player Lobby", img: "assets/placeholder.png" },
    { name: "Matchmaking", img: "assets/placeholder.png" },
    { name: "Leaderboard", img: "assets/placeholder.png" },
    { name: "Player Spawn Point", img: "assets/placeholder.png" },
    { name: "Spectator Camera", img: "assets/placeholder.png" },
    { name: "Team Base Spawn", img: "assets/placeholder.png" },
    { name: "Flag / Capture Point", img: "assets/placeholder.png" },
    { name: "Respawn Timer Zone", img: "assets/placeholder.png" }
  ],
   "Sandbox / Creative": [
    { name: "Block Placer", img: "assets/placeholder.png" },
    { name: "Terrain Editor", img: "assets/placeholder.png" },
    { name: "Custom Object Tool", img: "assets/placeholder.png" },
    { name: "Paint Tool", img: "assets/placeholder.png" },
    { name: "Terrain Raise/Lower Tool", img: "assets/placeholder.png" },
    { name: "Road Builder", img: "assets/placeholder.png" },
    { name: "Structure Snap Grid", img: "assets/placeholder.png" },
    { name: "Decorative Prop", img: "assets/placeholder.png" },
    { name: "Scripting Node", img: "assets/placeholder.png" }
  ],
"Narrative / Story": [
    { name: "Cutscene Trigger", img: "assets/placeholder.png" },
    { name: "Dialogue System", img: "assets/placeholder.png" },
    { name: "Story Branch", img: "assets/placeholder.png" },
    { name: "Camera Path", img: "assets/placeholder.png" },
    { name: "Choice Consequence Tracker", img: "assets/placeholder.png" },
    { name: "Flashback Effect Trigger", img: "assets/placeholder.png" },
    { name: "Chapter/Scene Title Card", img: "assets/placeholder.png" }
  ],

  "Horror / Atmosphere": [
    { name: "Creepy Sound", img: "assets/placeholder.png" },
    { name: "Fog Effect", img: "assets/placeholder.png" },
    { name: "Jump Scare Trigger", img: "assets/placeholder.png" },
    { name: "Light Flicker Trigger", img: "assets/placeholder.png" },
    { name: "Shadow NPC", img: "assets/placeholder.png" },
    { name: "Ambient Sound Cues", img: "assets/placeholder.png" },
    { name: "Lockable Door with Key", img: "assets/placeholder.png" },
    { name: "Hideable Spot", img: "assets/placeholder.png" }
  ],
    "Sports Games": [
    { name: "Football Goal", img: "assets/placeholder.png" },
    { name: "Basketball Hoop", img: "assets/placeholder.png" },
    { name: "Tennis Net", img: "assets/placeholder.png" },
    { name: "Goal Post / Hoop / Net", img: "assets/placeholder.png" },
    { name: "Scoreboard", img: "assets/placeholder.png" },
    { name: "Referee NPC", img: "assets/placeholder.png" },
    { name: "Team Bench", img: "assets/placeholder.png" },
    { name: "Ball Spawner", img: "assets/placeholder.png" },
    { name: "Penalty Zone", img: "assets/placeholder.png" },
    { name: "Audience Seats", img: "assets/placeholder.png" }
  ],

  "Sci-Fi / Cyberpunk": [
    { name: "Laser Gun", img: "assets/placeholder.png" },
    { name: "Futuristic Car", img: "assets/placeholder.png" },
    { name: "Hologram NPC", img: "assets/placeholder.png" },
    { name: "Spaceship", img: "assets/placeholder.png" },
    { name: "Space Station Dock", img: "assets/placeholder.png" },
    { name: "Asteroid Field", img: "assets/placeholder.png" },
    { name: "Warp Gate", img: "assets/placeholder.png" },
    { name: "Oxygen Supply Meter", img: "assets/placeholder.png" },
    { name: "Gravity Zone", img: "assets/placeholder.png" },
    { name: "Laser Turret", img: "assets/placeholder.png" }
  ],

  "Racing / Vehicles": [
    { name: "Nitro Boost Pad", img: "assets/placeholder.png" },
    { name: "Lap Counter", img: "assets/placeholder.png" },
    { name: "Pit Stop Zone", img: "assets/placeholder.png" },
    { name: "Oil Spill Hazard", img: "assets/placeholder.png" },
    { name: "Vehicle Upgrade Station", img: "assets/placeholder.png" },
    { name: "Checkpoint Gate", img: "assets/placeholder.png" }
  ],

  "Educational / Learning Games": [
    { name: "Quiz Panel", img: "assets/placeholder.png" },
    { name: "Answer Zone", img: "assets/placeholder.png" },
    { name: "Hint Popup Trigger", img: "assets/placeholder.png" },
    { name: "Progress Tracker", img: "assets/placeholder.png" },
    { name: "Lesson Complete Badge", img: "assets/placeholder.png" },
    { name: "Interactive Diagram", img: "assets/placeholder.png" }
  ]
};
// Populate sidebar if left-sidebar exists (your original code)
  (function populateSidebar() {
    const leftSidebar = document.querySelector(".left-sidebar");
    if (!leftSidebar) return; // nothing to do
    // Find menu items (expected HTML structure)
    document.querySelectorAll(".left-sidebar .menu-item").forEach(item => {
      const categoryKey = item.dataset.category?.trim();
      const submenu = item.nextElementSibling;
      if (submenu && categoryKey && sidebarData[categoryKey]) {
        submenu.innerHTML = "";
        sidebarData[categoryKey].forEach(entry => {
          const li = document.createElement("li");
          li.draggable = true;
          li.dataset.type = entry.name;
          li.dataset.img = entry.img;
          li.title = `Add ${entry.name} to scene`;
          li.className = "sidebar-entry";

          const img = document.createElement("img");
          img.src = entry.img;
          img.alt = entry.name;
          img.width = 24;
          img.height = 24;
          img.style.marginRight = "8px";
          img.style.verticalAlign = "middle";

          const span = document.createElement("span");
          span.textContent = entry.name;

          li.appendChild(img);
          li.appendChild(span);

          li.addEventListener("dragstart", e => {
            try { e.dataTransfer.setData("text/plain", JSON.stringify(entry)); }
            catch (err) { console.warn("dragstart error", err); }
          });

          submenu.appendChild(li);
        });
        submenu.style.display = "none"; // collapsed default
      }
    });

 document.querySelectorAll(".left-sidebar .menu-item").forEach(item => {
    const categoryKey = item.dataset.category?.trim();
    const submenu = item.nextElementSibling;
    if (submenu && categoryKey && sidebarData[categoryKey]) {
      submenu.innerHTML = "";
      sidebarData[categoryKey].forEach(entry => {
        const li = document.createElement("li");
        li.draggable = true;
        li.dataset.type = entry.name;
        li.dataset.img = entry.img;
        li.title = `Add ${entry.name} to scene`;

        // Thumbnail + label
        const img = document.createElement("img");
        img.src = entry.img;
        img.alt = entry.name;
        img.width = 24;
        img.height = 24;
        img.style.marginRight = "8px";
        img.style.verticalAlign = "middle";

        const span = document.createElement("span");
        span.textContent = entry.name;

        li.appendChild(img);
        li.appendChild(span);

        li.addEventListener("dragstart", e => {
          e.dataTransfer.setData("text/plain", JSON.stringify(entry));
        });

        submenu.appendChild(li);
      });
      submenu.style.display = "none"; // collapsed by default
    }
  });

  // Expand/collapse logic (guarded)
    document.querySelectorAll(".left-sidebar .menu-item").forEach(item => {
      item.addEventListener("click", () => {
        const submenu = item.nextElementSibling;
        const arrow = item.querySelector(".arrow");
        if (!submenu) return;
        const isOpen = submenu.classList.contains("open");
        if (isOpen) {
          submenu.classList.remove("open");
          submenu.style.display = "none";
          if (arrow) arrow.textContent = "▸";
        } else {
          submenu.classList.add("open");
          submenu.style.display = "block";
          if (arrow) arrow.textContent = "▾";
        }
      });
    });
  })();
// ===== Search in sidebar (your improved search + highlight) =====
  (function wireSidebarSearch() {
    const searchBar = document.getElementById("searchBar");
    if (!searchBar) return;

    // "No results" element
    let noResultsMsg = document.getElementById("noResultsMsg");
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("div");
      noResultsMsg.id = "noResultsMsg";
      noResultsMsg.textContent = "No results found ❌";
      noResultsMsg.style.display = "none";
      noResultsMsg.style.padding = "8px";
      noResultsMsg.style.textAlign = "center";
      noResultsMsg.style.color = "#ff6b6b";
      const leftSidebar = document.querySelector(".left-sidebar");
      leftSidebar?.appendChild(noResultsMsg);
    }

    searchBar.addEventListener("input", (e) => {
      const query = (e.target.value || "").trim().toLowerCase();
      let anyVisible = false;
      // For each category element (li that contains submenu)
      document.querySelectorAll(".left-sidebar li").forEach(category => {
        const submenu = category.querySelector("ul.submenu");
        const menuItem = category.querySelector(".menu-item");
        if (!submenu || !menuItem) return;

        let hasVisibleItems = false;
        submenu.querySelectorAll("li.sidebar-entry").forEach(li => {
          const text = li.dataset.type || li.textContent || "";
          const itemName = text.toLowerCase();
          if (query && itemName.includes(query)) {
            li.style.display = "flex";
            const span = li.querySelector("span");
            if (span) {
              const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), "gi");
              span.innerHTML = text.replace(regex, match => `<span class="highlight">${match}</span>`);
            }
            hasVisibleItems = true;
            anyVisible = true;
          } else if (query.length === 0) {
            li.style.display = "flex";
            const span = li.querySelector("span");
            if (span) span.textContent = text;
          } else {
            li.style.display = "none";
          }
        });

        if (query.length > 0) {
          if (hasVisibleItems) {
            submenu.style.display = "block";
            submenu.classList.add("open");
            const arrow = menuItem.querySelector(".arrow");
            if (arrow) arrow.textContent = "▾";
            category.style.display = "block";
          } else {
            category.style.display = "none";
          }
        } else {
          submenu.style.display = submenu.classList.contains("open") ? "block" : "none";
          const arrow = menuItem.querySelector(".arrow");
          if (arrow) arrow.textContent = submenu.classList.contains("open") ? "▾" : "▸";
          category.style.display = "block";
        }
      });

      noResultsMsg.style.display = (query.length > 0 && !anyVisible) ? "block" : "none";
    });
  })();

  // ===== Export / Save buttons (defensive) =====
  const saveBtn = $("saveBtn");
  const exportBtn = $("exportBtn");

  function exportLevel() {
    const levelData = canvasObjects.map(obj => ({
      type: obj.type,
      x: Math.round(obj.x),
      y: Math.round(obj.y),
      width: Math.round(obj.width),
      height: Math.round(obj.height),
      rotation: obj.rotation,
      img: obj.img?.src || null,
      properties: obj.properties || {}
    }));

    const blob = new Blob([JSON.stringify(levelData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "level.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      // Use canvasObjects as the "level" payload
      const payload = {
        objects: canvasObjects.map(o => ({
          type: o.type,
          x: o.x,
          y: o.y,
          width: o.width,
          height: o.height,
          rotation: o.rotation,
          img: o.img?.src || null,
          properties: o.properties || {}
        })),
        // Add any settings your UI exposes (guarded read)
        settings: {
          gravity: (document.getElementById("gravity")?.value) || null,
          bgColor: (document.getElementById("bgColor")?.value) || null
        }
      };

      fetch("/save-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to save");
        return res.text();
      })
      .then(msg => {
        alert("✅ Game saved successfully!");
        console.log("Server:", msg);
      })
      .catch(err => {
        alert("❌ Save failed!");
        console.error(err);
      });
    });
  }

  if (exportBtn) exportBtn.addEventListener("click", exportLevel);

  // If there are no Save/Export DOM elements but you still want a toolbar, create one
  if (!saveBtn && !exportBtn) {
    const toolbar = document.createElement("div");
    toolbar.style.position = "absolute"; toolbar.style.top = "12px"; toolbar.style.right = "12px";
    toolbar.style.zIndex = 1000;
    toolbar.style.display = "flex"; toolbar.style.gap = "8px";
    const s = document.createElement("button"); s.textContent = "Save"; s.className = "btn primary";
    const ex = document.createElement("button"); ex.textContent = "Export"; ex.className = "btn ghost";
    s.addEventListener("click", () => alert("Save button placeholder (no DOM saveBtn present)"));
    ex.addEventListener("click", exportLevel);
    toolbar.appendChild(s); toolbar.appendChild(ex);
    document.body.appendChild(toolbar);
  }

  // ===== Canvas object helpers =====
  function addObjectToCanvas(entry, x, y) {
    const img = new Image();
    img.src = entry.img || "assets/placeholder.png";
    // fallback on error
    img.onerror = () => {
      img.src = "assets/placeholder.png";
    };

    const obj = {
      type: entry.name,
      x,
      y,
      width: 60,
      height: 60,
      rotation: 0,
      img
    };

    img.onload = () => drawCanvas();
    canvasObjects.push(obj);
    drawCanvas();
  }

  function getHandles(obj) {
    return [
      {
        type: "resize",
        position: "bottom-right",
        x: obj.x + obj.width / 2 - 8,
        y: obj.y + obj.height / 2 - 8,
        size: 10
      },
      {
        type: "rotate",
        x: obj.x - 6,
        y: obj.y - obj.height / 2 - 20,
        size: 12
      }
    ];
  }

  function getHandleAt(mx, my, obj) {
    const handles = getHandles(obj);
    for (let h of handles) {
      if (
        mx >= h.x &&
        mx <= h.x + h.size &&
        my >= h.y &&
        my <= h.y + h.size
      ) {
        return h;
      }
    }
    return null;
  }

  function getObjectAt(mx, my) {
    for (let i = canvasObjects.length - 1; i >= 0; i--) {
      const obj = canvasObjects[i];
      if (
        mx > obj.x - obj.width / 2 &&
        mx < obj.x + obj.width / 2 &&
        my > obj.y - obj.height / 2 &&
        my < obj.y + obj.height / 2
      ) {
        return obj;
      }
    }
    return null;
  }

  function drawCanvas() {
  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each object
  canvasObjects.forEach(obj => {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation);

    if (obj.img && obj.img.complete) {
      // If the object has an image
      ctx.drawImage(obj.img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
    } else if (obj.color) {
      // If template JSON provided a color
      ctx.fillStyle = obj.color;
      ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.max(10, Math.floor(obj.height / 6))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText((obj.type || "obj"), 0, 4);
    } else {
      // Fallback placeholder
      ctx.fillStyle = "#444";
      ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      ctx.fillStyle = "#fff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(obj.type, -obj.width / 2 + 4, -obj.height / 2 + 14);
    }

    ctx.restore();

    // Selection box + handles
    if (obj === selectedObject) {
      ctx.strokeStyle = "#00ffd5";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        obj.x - obj.width / 2,
        obj.y - obj.height / 2,
        obj.width,
        obj.height
      );
      const handles = getHandles(obj);
      handles.forEach(h => {
        ctx.fillStyle = h.type === "resize" ? "#00b894" : "#7a5cff";
        ctx.fillRect(h.x, h.y, h.size, h.size);
      });
    }
  });
}


  // ===== Drag & Drop from sidebar =====
  canvas.addEventListener("dragover", e => e.preventDefault());
  canvas.addEventListener("drop", e => {
    e.preventDefault();
    try {
      const entry = JSON.parse(e.dataTransfer.getData("text/plain"));
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addObjectToCanvas(entry, x, y);
    } catch (err) {
      console.warn("Invalid drop data", err);
    }
  });

  // ===== Object interaction (mouse) =====
  canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    selectedObject = getObjectAt(mx, my);

    if (selectedObject) {
      const handle = getHandleAt(mx, my, selectedObject);
      if (handle) {
        if (handle.type === "resize") {
          isResizing = true;
          currentHandle = handle;
        } else if (handle.type === "rotate") {
          isRotating = true;
        }
      } else {
        isDragging = true;
        offsetX = mx - selectedObject.x;
        offsetY = my - selectedObject.y;
      }
    } else {
      // Clicked empty area -> deselect
      selectedObject = null;
    }
    drawCanvas();
  });

  canvas.addEventListener("mousemove", e => {
    if (!selectedObject && !isDragging && !isResizing && !isRotating) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isDragging && selectedObject) {
      selectedObject.x = mx - offsetX;
      selectedObject.y = my - offsetY;
    } else if (isResizing && selectedObject && currentHandle) {
      selectedObject.width = Math.max(20, mx - selectedObject.x + selectedObject.width / 2);
      selectedObject.height = Math.max(20, my - selectedObject.y + selectedObject.height / 2);
    } else if (isRotating && selectedObject) {
      const dx = mx - selectedObject.x;
      const dy = my - selectedObject.y;
      selectedObject.rotation = Math.atan2(dy, dx);
    }
    drawCanvas();
  });

  function finishInteraction() {
    isDragging = false;
    isResizing = false;
    isRotating = false;
    currentHandle = null;
  }

  canvas.addEventListener("mouseup", finishInteraction);
  canvas.addEventListener("mouseleave", finishInteraction);

  // Deselect when clicking outside canvas
  document.addEventListener("click", (e) => {
    if (!canvas.contains(e.target)) {
      selectedObject = null;
      drawCanvas();
    }
  });
// ===== Dynamic Loader: selectedTemplate from localStorage (robust) =====
(async function tryLoadSelectedTemplate() {
  const selectedTemplate = localStorage.getItem("selectedTemplate");
  if (!selectedTemplate) {
    console.info("No selectedTemplate in localStorage — nothing to auto-load.");
    return;
  }

  const candidates = [
    `Templates/${selectedTemplate}.json`,
    `templates/${selectedTemplate}.json`,
    `Templates/${selectedTemplate}.json`,
    `templates/${selectedTemplate}/${selectedTemplate}.json`,
    `Templates/${selectedTemplate}/${selectedTemplate}.json`,
    `generated-games/${selectedTemplate}.json`,
    `generated-games/${selectedTemplate}/${selectedTemplate}.json`,
    `generated-games/${selectedTemplate}/data.json`,
    `generated-games/${selectedTemplate}/index.json`,
    `templates/${selectedTemplate}/data.json`
  ];

  function showLoaderMessage(msg, color = "#7cffb2") {
    let el = document.getElementById("templateLoadStatus");
    if (!el) {
      el = document.createElement("div");
      el.id = "templateLoadStatus";
      el.style.position = "fixed";
      el.style.top = "10px";
      el.style.left = "10px";
      el.style.padding = "8px 12px";
      el.style.borderRadius = "8px";
      el.style.zIndex = 9999;
      el.style.fontFamily = "sans-serif";
      el.style.fontSize = "13px";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.color = color;
    el.style.background = "rgba(0,0,0,0.45)";
    el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.6)";
  }

  showLoaderMessage(`Loading template "${selectedTemplate}"...`, "#00ffd5");

  let loaded = false;
  for (const p of candidates) {
    try {
      const res = await fetch(p, { cache: "no-store" });
      if (!res.ok) {
        console.debug(`fetch ${p} → ${res.status}`);
        continue;
      }
      const data = await res.json().catch(() => null);
      if (!data) continue;

      // Accept many shapes: objects, elements, entities...
      const rawObjects = data.objects || data.elements || data.entities || data.items || data.elementsList || [];
      const normalized = Array.isArray(rawObjects) ? rawObjects : [];

      // Replace canvasObjects with normalized entries
      canvasObjects.length = 0;
      normalized.forEach(obj => {
        const entry = {
          type: obj.type || obj.id || obj.name || "object",
          x: (typeof obj.x === "number") ? obj.x : (obj.cx || obj.cx || 150),
          y: (typeof obj.y === "number") ? obj.y : (obj.cy || obj.cy || 150),
          width: obj.width || obj.w || obj.wid || 60,
          height: obj.height || obj.h || obj.hgt || 60,
          rotation: obj.rotation || obj.rot || 0,
          img: null,             // will be Image if obj.img exists
          color: obj.color || obj.fill || null,
          properties: obj.properties || obj.props || {}
        };

        // Choose image path if present (supports full path or asset key)
        const imgSrc = obj.img || obj.sprite || obj.file || (obj.asset ? `assets/${obj.asset}` : null);
        if (imgSrc) {
          const im = new Image();
          im.src = imgSrc;
          im.onerror = () => { im.src = "assets/placeholder.png"; };
          entry.img = im;
        }

        canvasObjects.push(entry);
      });

      // Preload any backgrounds (optional)
      if (Array.isArray(data.backgrounds)) {
        data.backgrounds.forEach(b => { const bg = new Image(); bg.src = b; bg.onerror = () => {}; });
      }

      drawCanvas();
      showLoaderMessage(`Template "${selectedTemplate}" loaded from ${p}`, "#7cffb2");
      console.info("Template loaded:", p, data);
      loaded = true;
      break;
    } catch (err) {
      console.warn(`Error loading ${p}`, err);
    }
  }

  if (!loaded) {
    showLoaderMessage(`Template "${selectedTemplate}" not found (checked ${candidates.length} paths)`, "#ff7b7b");
    console.error(`Failed to load template "${selectedTemplate}". Tried:`, candidates);
  }
})();


  // ===== Simple keyboard shortcuts =====
  document.addEventListener("keydown", (e) => {
    // Delete selected object
    if ((e.key === "Delete" || e.key === "Backspace") && selectedObject) {
      const idx = canvasObjects.indexOf(selectedObject);
      if (idx >= 0) canvasObjects.splice(idx, 1);
      selectedObject = null;
      drawCanvas();
    }
    // Ctrl+S (save)
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (saveBtn) saveBtn.click();
    }
  });

  // ===== Final initial draw =====
  drawCanvas();
}); 