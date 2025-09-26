// use-ai.js — improved, defensive version
(function () {
  // --- Utilities ---
  function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=\/=]/g, function (s) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;' })[s];
    });
  }

  function createButton(text, classes = []) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = classes.join(' ');
    b.textContent = text;
    return b;
  }

  function updateStatusEl(statusEl, text, state = "") {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = "status";
    if (state) statusEl.classList.add(state);
  }

  // --- Hero particles (visual only) ---
  function initHeroParticles() {
    // Respect reduced-motion: don't create particles if user prefers reduced motion
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return null;

    const hero = document.querySelector('.hero');
    if (!hero) return null;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-canvas';
    hero.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, ratio = Math.max(1, window.devicePixelRatio || 1);
    const stars = [];
    const particles = [];
    const STAR_COUNT = 180;
    const PARTICLE_COUNT = 8;

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function resize() {
      w = Math.max(300, hero.clientWidth);
      h = Math.max(200, hero.clientHeight);
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function initParticles() {
      stars.length = 0;
      particles.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 0.8 + 0.1,
          a: Math.random() * 0.65 + 0.12,
        });
      }
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.7) + h * 0.1,
          vx: rand(-0.06, 0.06),
          vy: rand(-0.02, 0.02),
          size: rand(6, 18),
          hue: rand(150, 200)
        });
      }
    }

    function draw() {
      // backdrop radial
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 30, w * 0.5, h * 0.55, Math.max(w, h));
      g.addColorStop(0, 'rgba(0,255,170,0.02)');
      g.addColorStop(0.35, 'rgba(0,170,255,0.01)');
      g.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        ctx.globalAlpha = s.a * 0.9;
        ctx.fillStyle = 'rgba(220,255,245,1)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // soft particles
      for (let j = 0; j < particles.length; j++) {
        const p = particles[j];
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        rg.addColorStop(0, `rgba(120,255,200,0.12)`);
        rg.addColorStop(0.2, `rgba(120,250,220,0.06)`);
        rg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rg;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;
      }
      ctx.globalAlpha = 1;
    }

    let raf = null;
    function frame() {
      draw();
      raf = requestAnimationFrame(frame);
    }

    function onResize() {
      resize();
      initParticles();
    }

    window.addEventListener('resize', onResize);
    resize();
    initParticles();
    frame();

    // return a simple API for teardown
    return function teardown() {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      try { canvas.remove(); } catch (e) {}
    };
  }

  // --- Main logic (runs after DOM ready) ---
  document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const gamePrompt = document.getElementById('gamePrompt');
    const statusEl = document.getElementById('status');

    // action buttons container and preview/open build buttons
    function ensureActionContainer() {
      let container = document.querySelector('.action-buttons-wrap');
      if (!container) {
        container = document.createElement('div');
        container.className = 'action-buttons-wrap';
        container.style.display = 'flex';
        container.style.gap = '10px';
        container.style.justifyContent = 'center';
        container.style.marginTop = '12px';
        if (statusEl && statusEl.parentNode) statusEl.parentNode.appendChild(container);
        else document.body.appendChild(container);
      }
      return container;
    }
    const actionContainer = ensureActionContainer();
    const openPreviewBtn = createButton('Open Preview Page', ['btn', 'outline']);
    const openBuildBtn = createButton('Open Live Build', ['btn', 'ghost']);
    openPreviewBtn.style.display = 'none';
    openBuildBtn.style.display = 'none';
    actionContainer.appendChild(openPreviewBtn);
    actionContainer.appendChild(openBuildBtn);

    // maintain an AbortController for current request
    let currentController = null;
    function abortCurrent() {
      if (currentController) {
        try { currentController.abort(); } catch (e) {}
        currentController = null;
      }
    }

    function setLoading(isLoading) {
      if (!generateBtn) return;
      generateBtn.disabled = isLoading;
      generateBtn.textContent = isLoading ? '⚡ Generating...' : '⚡ Generate Game';
    }

    function updateStatus(text, state = '') {
      updateStatusEl(statusEl, text, state);
    }

    function showPreviewButtons(latestGame) {
      if (!latestGame) {
        openPreviewBtn.style.display = 'none';
        openBuildBtn.style.display = 'none';
        return;
      }
      openPreviewBtn.style.display = 'inline-block';
      openPreviewBtn.onclick = function () {
        // open preview in a new tab so user doesn't lose this page
        window.open('preview.html', '_blank', 'noopener');
      };

      if (latestGame.gameUrl) {
        openBuildBtn.style.display = 'inline-block';
        openBuildBtn.onclick = function () {
          window.open(latestGame.gameUrl, '_blank', 'noopener');
        };
      } else {
        openBuildBtn.style.display = 'none';
      }
    }

    async function generateGame() {
      if (!gamePrompt) return;
      const prompt = (gamePrompt.value || '').trim();
      if (!prompt) {
        updateStatus('⚠️ Please enter a game idea!', 'error');
        gamePrompt.focus();
        return;
      }

      // cancel any previous request
      abortCurrent();
      currentController = new AbortController();
      const signal = currentController.signal;

      setLoading(true);
      updateStatus('⏳ Generating game...', 'loading');
      openPreviewBtn.style.display = 'none';
      openBuildBtn.style.display = 'none';

      try {
        const res = await fetch('/api/games/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
          signal
        });

        // if aborted, bail
        if (signal.aborted) throw new Error('aborted');

        let data = {};
        // try parse JSON safely
        const text = await res.text().catch(() => '');
        try { data = text ? JSON.parse(text) : {}; } catch (err) {
          // not JSON — we still have status code to inspect
          data = { rawText: text };
        }

        setLoading(false);

        // treat only HTTP 2xx as ok
        if (!res.ok) {
          const msg = (data && data.message) ? data.message : `Server returned ${res.status}`;
          updateStatus(`⚠️ ${msg}`, 'error');
          return;
        }

        const gameUrl = data.gameUrl || data.url || null;
        const success = data.success !== undefined ? data.success : true; // allow older endpoints that return direct payload

        if (success && (gameUrl || data.zip || data.id || data.result)) {
          updateStatus(`✅ Game "${prompt}" generated! Saved locally. Open the preview page to view it.`, 'success');

          const latestGame = {
            prompt,
            desc: data.description || data.desc || data.result?.description || 'Description not available.',
            type: data.type || data.result?.type || 'Unknown',
            levels: data.levels || data.levelCount || data.result?.levels || 'N/A',
            enemies: data.enemies || data.result?.enemies || 'N/A',
            gameUrl: gameUrl,
            zip: data.zip || data.result?.zip || null,
            id: data.id || data.result?.id || null,
            generatedAt: new Date().toISOString()
          };

          try {
            localStorage.setItem('latestGame', JSON.stringify(latestGame));
          } catch (err) {
            console.warn('Could not save latestGame to localStorage:', err);
          }

          showPreviewButtons(latestGame);
        } else {
          const message = (data && (data.message || data.error)) ? (data.message || data.error) : 'Game generation failed or returned no usable result.';
          updateStatus(`⚠️ ${message}`, 'error');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          updateStatus('⚠️ Generation cancelled.', 'info');
        } else {
          console.error('Generation error:', err);
          updateStatus(`❌ Error: ${err.message || 'Network error'}`, 'error');
        }
        setLoading(false);
      } finally {
        // ensure controller reset
        currentController = null;
      }
    }

    // Wire up safely: prefer form submit
    const form = document.querySelector('#promptForm');
    if (form) {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        generateGame();
      });
    } else {
      if (generateBtn) generateBtn.addEventListener('click', generateGame);
      if (gamePrompt) gamePrompt.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generateGame();
      });
    }

    // Prefill editingPrompt if present
    try {
      const editingPrompt = localStorage.getItem('editingPrompt');
      if (editingPrompt && gamePrompt && !gamePrompt.value) {
        gamePrompt.value = editingPrompt;
        updateStatus('✏️ Editing previous game idea. Modify and regenerate!', 'info');
        localStorage.removeItem('editingPrompt');
      }
    } catch (err) { console.warn('Could not access editingPrompt:', err); }

    // Load existing latestGame and show preview buttons on load
    try {
      const raw = localStorage.getItem('latestGame');
      if (raw) {
        const parsed = JSON.parse(raw);
        showPreviewButtons(parsed);
      }
    } catch (e) { /* ignore parse errors */ }

    // Initialize decorative particles, capture teardown
    const teardownParticles = initHeroParticles();

    // cleanup on unload: abort fetch + stop particles
    window.addEventListener('beforeunload', () => {
      abortCurrent();
      if (typeof teardownParticles === 'function') teardownParticles();
    });
  });
})();
