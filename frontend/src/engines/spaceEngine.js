// src/engine/spaceEngine.js
// Reusable game engine: procedural background, pooling, audio, gameplay loop, API (createEngine, Pool, SpaceBG)

/* --------------------------
   Utility: HiDPI canvas fit
   -------------------------- */
function fitCanvas(canvas){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  } // else keep whatever size already set

  const ctx = canvas.getContext('2d');
  // reset any previous transforms then set DPR transform
  ctx.setTransform(1,0,0,1,0,0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // return useful helpers
  return {
    ctx,
    dpr,
    logicalWidth: canvas.width / dpr,
    logicalHeight: canvas.height / dpr
  };
}

/* --------------------------
   Pool utility
   -------------------------- */
class Pool {
  constructor(createFn, initial = 40){
    this.createFn = createFn;
    this.pool = [];
    for (let i = 0; i < initial; i++) this.pool.push(createFn());
  }
  acquire(){ return this.pool.pop() || this.createFn(); }
  release(obj){ this.pool.push(obj); }
}

/* --------------------------
   SpaceBG — procedural background
   -------------------------- */
class SpaceBG {
  constructor(canvas, opts = {}){
    this.canvas = canvas;
    this.opts = Object.assign({
      starCount: 360,
      speed: 0.6,
      twinkle: 0.45,
      nebulaBands: 2,
      layers: 3
    }, opts);

    this._stars = [];
    this._t = 0;
    this.mouse = { x: 0.5, y: 0.5 };
    this._running = true;

    // bound handlers for proper removal
    this._boundOnResize = this._onWindowResize.bind(this);
    this._boundOnMouseMove = this._onMouseMove.bind(this);

    this.ctx = null;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this._rafId = null;

    this.resize();
    this.createStars();
    this.bind();
    this.raf();
  }

  resize(){
    const { ctx, dpr, logicalWidth, logicalHeight } = fitCanvas(this.canvas);
    this.ctx = ctx;
    this.dpr = dpr;
    this.width = logicalWidth;
    this.height = logicalHeight;
  }

  _onWindowResize(){
    this.resize();
    this.createStars();
  }

  _onMouseMove(e){
    const r = this.canvas.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    this.mouse.x = (e.clientX - r.left) / r.width;
    this.mouse.y = (e.clientY - r.top) / r.height;
  }

  bind(){
    window.addEventListener('resize', this._boundOnResize);
    // keep mouse local to canvas
    this.canvas.addEventListener('mousemove', this._boundOnMouseMove);
  }

  createStars(){
    this._stars = [];
    for (let i = 0; i < this.opts.starCount; i++){
      const layer = 1 + Math.floor(Math.random() * this.opts.layers);
      const depth = layer / this.opts.layers;
      this._stars.push({
        x: Math.random(),
        y: Math.random(),
        layer,
        depth,
        size: Math.random() * (1.8 + depth * 1.8),
        speedFactor: 0.1 + depth * 0.9,
        brightness: 0.6 + Math.random() * 0.6,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  drawNebula(ctx){
    const w = this.width, h = this.height;
    for (let i = 0; i < this.opts.nebulaBands; i++){
      const sx = (Math.sin(this._t * 0.0006 + i) * 0.5 + 0.5) * w;
      const sy = (Math.cos(this._t * 0.0004 + i * 1.3) * 0.5 + 0.5) * h;
      const r = Math.max(w, h) * (0.28 + i * 0.12);
      const g = ctx.createRadialGradient(sx, sy, r * 0.05, sx, sy, r);
      if (i % 2 === 0){
        g.addColorStop(0, 'rgba(50,20,120,0.22)');
        g.addColorStop(0.5, 'rgba(30,10,70,0.10)');
      } else {
        g.addColorStop(0, 'rgba(10,40,80,0.18)');
        g.addColorStop(0.5, 'rgba(20,10,60,0.09)');
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawStars(ctx){
    const w = this.width, h = this.height;
    const mx = (this.mouse.x - 0.5) * 2;
    const my = (this.mouse.y - 0.5) * 2;
    for (const s of this._stars){
      const parallax = (s.layer - 1) * 10;
      const x = (s.x * w + mx * parallax + this._t * 0.02 * s.speedFactor * this.opts.speed) % w;
      const y = (s.y * h + my * parallax * 0.5 + this._t * 0.01 * s.speedFactor * this.opts.speed) % h;
      const tw = Math.sin(this._t * 0.02 * (0.5 + s.depth) + s.twinklePhase) * 0.5 + 0.5;
      const a = Math.min(1, s.brightness * (1 - this.opts.twinkle + this.opts.twinkle * tw));
      const size = Math.max(0.3, s.size * (0.6 + s.depth));
      const g = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
      g.addColorStop(0.2, `rgba(200,220,255,${0.45 * a})`);
      g.addColorStop(1, `rgba(100,110,140,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${0.6 * a})`;
      ctx.fillRect(x - size * 0.2, y - size * 0.2, size * 0.4, size * 0.4);
    }
  }

  render = (ts) => {
    if (!this._running) return;
    this._t = ts || performance.now();
    const ctx = this.ctx;
    // clear using logical width/height
    ctx.clearRect(0, 0, this.width, this.height);
    const base = ctx.createLinearGradient(0, 0, 0, this.height);
    base.addColorStop(0, '#08102b');
    base.addColorStop(1, '#021026');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, this.width, this.height);
    this.drawNebula(ctx);
    this.drawStars(ctx);
  }

  raf(){
    const loop = (ts) => { this.render(ts); if (this._running) this._rafId = requestAnimationFrame(loop); };
    this._rafId = requestAnimationFrame(loop);
  }

  setOptions(o){ Object.assign(this.opts, o); if (o.starCount) this.createStars(); }
  pause(){ this._running = false; if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; } }
  resume(){ if (!this._running){ this._running = true; this.raf(); } }

  // proper cleanup to avoid leaks
  destroy(){
    this._running = false;
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
    try { window.removeEventListener('resize', this._boundOnResize); } catch(e) {}
    try { this.canvas.removeEventListener('mousemove', this._boundOnMouseMove); } catch(e) {}
  }
}

/* --------------------------
   AudioManager (small WebAudio)
   -------------------------- */
class AudioManager {
  constructor(){
    this.ctx = null;
    this.master = 0.6;
    this.music = null;
    this.musicGain = null;
    this.useGeneratedMusic = true;
    this.musicURL = null;
  }

  init(){
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterNode = this.ctx.createGain();
      this.masterNode.gain.value = this.master;
      this.masterNode.connect(this.ctx.destination);
    } catch (e) { console.warn('Audio init failed', e); }
  }

  playLaser(){
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 900;
    g.gain.value = 0.06;
    o.connect(g); g.connect(this.masterNode);
    o.start();
    o.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);
    setTimeout(()=>{ try { o.stop(); } catch(e){} }, 160);
  }

  playExplosion(){
    if (!this.ctx) return;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.35), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++){
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    g.gain.value = 0.28;
    src.buffer = buffer; src.connect(g); g.connect(this.masterNode);
    src.start();
  }

  async startMusic(){
    if (!this.ctx) this.init();
    if (this.useGeneratedMusic){
      const t = this.ctx;
      const o = t.createOscillator();
      const g = t.createGain();
      o.type = 'sine';
      o.frequency.value = 72;
      g.gain.value = 0.018;
      o.connect(g); g.connect(this.masterNode);
      o.start();
      this.music = o; this.musicGain = g;
      return;
    }
    if (this.musicURL){
      try {
        const resp = await fetch(this.musicURL);
        const ab = await resp.arrayBuffer();
        const buf = await this.ctx.decodeAudioData(ab);
        const src = this.ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const g = this.ctx.createGain(); g.gain.value = 0.12;
        src.connect(g); g.connect(this.masterNode); src.start();
        this.music = src; this.musicGain = g;
      } catch (e) {
        console.warn('startMusic failed to load/parse audio', e);
      }
    }
  }

  stopMusic(){
    if (this.music){
      try{ this.music.stop && this.music.stop(); }catch(e){}
      try{ if (this.musicGain && this.musicGain.disconnect) this.musicGain.disconnect(); }catch(e){}
      this.music = null;
      this.musicGain = null;
    }
  }

  destroy(){
    try { this.stopMusic(); } catch(e) {}
    try { if (this.masterNode && this.masterNode.disconnect) this.masterNode.disconnect(); } catch(e) {}
    // Do not close audio context automatically — let consumer decide if needed.
  }
}

/* --------------------------
   createEngine: instance factory
   -------------------------- */
function createEngine({ container, width = 1024, height = 720, audio = true } = {}){
  if (!container) throw new Error('container required');

  // create canvas layers
  const bgCanvas = document.createElement('canvas');
  const gameCanvas = document.createElement('canvas');
  [bgCanvas, gameCanvas].forEach(c => {
    c.style.position = 'absolute';
    c.style.left = '0';
    c.style.top = '0';
    c.style.width = '100%';
    c.style.height = '100%';
    c.style.userSelect = 'none';
    c.style.pointerEvents = 'none'; // game draws; input is global keys
  });
  bgCanvas.style.zIndex = '10';
  gameCanvas.style.zIndex = '20';
  container.style.position = container.style.position || 'relative';
  container.appendChild(bgCanvas); container.appendChild(gameCanvas);

  // initial fit & bg
  const bgFit = fitCanvas(bgCanvas);
  const gameFit = fitCanvas(gameCanvas);

  const bg = new SpaceBG(bgCanvas, { starCount: 420 });
  const gctx = gameCanvas.getContext('2d');

  // logical sizes (in CSS/logical pixels)
  let logicalWidth = gameFit.logicalWidth;
  let logicalHeight = gameFit.logicalHeight;

  function resize(){
    const bgRes = fitCanvas(bgCanvas);
    const gameRes = fitCanvas(gameCanvas);
    logicalWidth = gameRes.logicalWidth;
    logicalHeight = gameRes.logicalHeight;
    // update bg
    try { bg.resize(); } catch (e) { console.warn('bg.resize failed', e); }
  }
  // store bound resize so we can remove it later
  const _onWindowResize = resize;
  window.addEventListener('resize', _onWindowResize);
  resize();

  // object pools & collections
  const bulletPool = new Pool(()=>({ x:0,y:0,vx:0,vy:0,life:0 }), 120);
  const particlePool = new Pool(()=>({ x:0,y:0,vx:0,vy:0,life:0,size:1,hue:30 }), 240);
  const enemyPool = new Pool(()=>({ x:0,y:0,r:16,vx:0,vy:0,hp:1 }), 40);

  const bullets = [], particles = [], enemies = [];
  const player = { x: width/2, y: height - 100, speed: 260, cooldown: 0, width: 36, height: 44 };
  let score = 0, lives = 3, level = 1, running = false, lastTime = performance.now();

  const audioMgr = new AudioManager(); if (audio) audioMgr.init();

  // event hooks
  const hooks = { onEnemyKilled: [], onPlayerDeath: [], onGameOver: [] };
  function emit(name, payload){ if (hooks[name]) hooks[name].forEach(fn => { try{ fn(payload); }catch(e){} }); }
  function on(name, cb){
    if (!hooks[name]) hooks[name] = [];
    hooks[name].push(cb);
    // return an unsubscribe function for convenience
    return () => off(name, cb);
  }
  function off(name, cb){
    if (!hooks[name]) return;
    if (!cb) { hooks[name] = []; return; }
    const idx = hooks[name].indexOf(cb);
    if (idx >= 0) hooks[name].splice(idx, 1);
  }

  // input (use container-scoped handlers where possible)
  const keys = {};
  const _onKeyDown = (e) => { keys[e.key.toLowerCase()] = true; if (e.key === ' ') e.preventDefault(); };
  const _onKeyUp = (e) => { keys[e.key.toLowerCase()] = false; };
  window.addEventListener('keydown', _onKeyDown);
  window.addEventListener('keyup', _onKeyUp);

  // draw helpers
  function drawPlayer(ctx, p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(16, 18);
    ctx.lineTo(-16, 18);
    ctx.closePath();
    ctx.fillStyle = '#f5f7fb';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff6b6b';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -3, 7, 5, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(10,24,40,0.95)';
    ctx.fill();
    ctx.restore();
  }

  function drawEnemy(ctx, e){
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, e.r * 1.2, e.r, 0, 0, Math.PI*2);
    ctx.fillStyle = '#2fe28a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#123d22';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -e.r * 0.25, e.r * 0.55, e.r * 0.45, 0, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(10,18,30,0.9)';
    ctx.fill();
    ctx.restore();
  }

  // spawners
  function spawnParticle(x,y,vx,vy,life,size,hue){
    const p = particlePool.acquire();
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.size = size; p.hue = hue;
    particles.push(p); return p;
  }
  function spawnThruster(x,y,intensity=1){
    const count = Math.round(8 * intensity);
    for (let i=0;i<count;i++){
      const ang = (-Math.PI/2) + (Math.random()*0.6 - 0.3);
      const s = 0.6 + Math.random()*1.6;
      spawnParticle(x + (Math.random()*6-3), y + 18, Math.cos(ang)*(-1.6 + Math.random()), Math.sin(ang)*(-1.6 + Math.random()), 0.45 + Math.random()*0.35, s, 30 + Math.random()*28);
    }
  }
  function spawnExplosion(x,y,scale=1){
    const count = Math.round(32 * scale);
    for (let i=0;i<count;i++){
      const ang = Math.random() * Math.PI * 2;
      spawnParticle(x, y, Math.cos(ang)*(Math.random()*2.6*scale), Math.sin(ang)*(Math.random()*2.6*scale), 0.6 + Math.random()*0.6, 1 + Math.random()*3*scale, Math.random()*70);
    }
  }
  function fireBullet(x,y,vx,vy){
    const b = bulletPool.acquire();
    b.x = x; b.y = y; b.vx = vx; b.vy = vy; b.life = 1.6;
    bullets.push(b);
    if (audio) audioMgr.playLaser();
  }
  function spawnEnemy(){
    const e = enemyPool.acquire();
    // use logical size for spawning bounds
    e.x = 40 + Math.random() * Math.max(0, (logicalWidth - 80));
    e.y = -30;
    e.r = 14 + Math.random() * 12;
    e.vx = 0;
    e.vy = 40 + Math.random() * 60;
    e.hp = 1 + Math.floor(Math.random() * 2);
    enemies.push(e);
  }

  // update/render
  let spawnTimer = 0;
  function update(dt, ts){
    let mx = 0, my = 0;
    if (keys['arrowleft']||keys['a']) mx -= 1;
    if (keys['arrowright']||keys['d']) mx += 1;
    if (keys['arrowup']||keys['w']) my -= 1;
    if (keys['arrowdown']||keys['s']) my += 1;
    if (mx !== 0 || my !== 0){
      const len = Math.hypot(mx, my) || 1;
      player.x += (mx/len) * player.speed * dt;
      player.y += (my/len) * player.speed * dt;
      spawnThruster(player.x, player.y, Math.min(1.6, 1 + Math.hypot(mx,my)));
    }
    const pad = 28;
    // clamp with logical sizes
    player.x = Math.max(pad, Math.min(logicalWidth - pad, player.x));
    player.y = Math.max(pad, Math.min(logicalHeight - pad, player.y));

    player.cooldown = (player.cooldown || 0) - dt;
    if (keys[' '] && player.cooldown <= 0){ fireBullet(player.x, player.y-18, 0, -520); player.cooldown = 0.16; }

    for (let i = bullets.length-1; i >= 0; i--){
      const b = bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.y < -40 || b.x < -40 || b.x > logicalWidth + 40){ bullets.splice(i,1); bulletPool.release(b); }
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0 && enemies.length < 12){ spawnEnemy(); spawnTimer = 0.9 + Math.random() * 1.1; }

    for (let i = enemies.length-1; i >= 0; i--){
      const e = enemies[i];
      e.y += e.vy * dt; e.x += Math.sin(ts*0.001 + i) * 8 * dt;
      if (e.y > logicalHeight + 60){ enemies.splice(i,1); enemyPool.release(e); continue; }

      for (let j = bullets.length-1; j >= 0; j--){
        const b = bullets[j];
        const dist = Math.hypot(e.x - b.x, e.y - b.y);
        if (dist < e.r + 4){
          bullets.splice(j,1); bulletPool.release(b);
          e.hp -= 1; spawnExplosion(b.x, b.y, 0.6);
          if (audio) audioMgr.playExplosion();
          if (e.hp <= 0){ spawnExplosion(e.x, e.y, 1.2); enemies.splice(i,1); enemyPool.release(e); score += 10; emit('onEnemyKilled', e); }
          break;
        }
      }

      if (Math.hypot(e.x - player.x, e.y - player.y) < (e.r + 18)){
        spawnExplosion(player.x, player.y, 1.6);
        spawnExplosion(e.x, e.y, 1.2);
        enemies.splice(i,1); enemyPool.release(e);
        lives -= 1;
        if (lives <= 0){ emit('onPlayerDeath'); emit('onGameOver', score); stop(); }
      }
    }

    for (let i = particles.length-1; i >= 0; i--){
      const p = particles[i];
      p.x += p.vx * dt * 60; p.y += p.vy * dt * 60; p.life -= dt;
      if (p.life <= 0){ particles.splice(i,1); particlePool.release(p); }
    }
  }

  function render(){
    // clear using logical pixel dimensions but drawing APIs are transformed to DPR via fitCanvas
    gctx.clearRect(0,0,Math.max(1, Math.floor(logicalWidth * (window.devicePixelRatio || 1))), Math.max(1, Math.floor(logicalHeight * (window.devicePixelRatio || 1))));
    drawPlayer(gctx, player);
    for (const e of enemies) drawEnemy(gctx, e);

    gctx.save(); gctx.fillStyle = '#fff';
    for (const b of bullets){ gctx.beginPath(); gctx.rect(b.x-2,b.y-8,4,12); gctx.fill(); }
    gctx.restore();

    gctx.globalCompositeOperation = 'lighter';
    for (const p of particles){
      const alpha = Math.max(0, Math.min(1, p.life / 1.1));
      const size = p.size * (1 + (1 - alpha) * 1.6);
      const grad = gctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
      grad.addColorStop(0, `hsla(${p.hue},90%,60%,${alpha})`);
      grad.addColorStop(0.2, `hsla(${p.hue},80%,55%,${alpha * 0.6})`);
      grad.addColorStop(1, 'rgba(10,12,20,0)');
      gctx.fillStyle = grad;
      gctx.beginPath(); gctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2); gctx.fill();
    }
    gctx.globalCompositeOperation = 'source-over';
  }

  let rafId = null;
  function loop(ts){ if (!running) return; const dt = Math.min(0.033, (ts - lastTime) / 1000); lastTime = ts; update(dt, ts); render(); rafId = requestAnimationFrame(loop); }
  function start(){ if (running) return; running = true; lastTime = performance.now(); try { bg.resume(); } catch(e){} rafId = requestAnimationFrame(loop); }
  function stop(){ running = false; try { bg.pause(); } catch(e){} if (rafId) cancelAnimationFrame(rafId); rafId = null; }

  return {
    container, bgCanvas, gameCanvas, bg,
    start, stop, resize,
    playSfx: (f,d) => audioMgr.playLaser(f,d),
    startMusic: () => audioMgr.startMusic(), stopMusic: () => audioMgr.stopMusic(),
    on, off, // subscribe/unsubscribe to events: on('onEnemyKilled', cb) returns unsubscribe
    serializeState: () => ({ score, lives, level, player: { x: player.x, y: player.y }, enemies: enemies.map(e => ({ x: e.x, y: e.y, r: e.r, hp: e.hp })) }),
    loadState: (st) => {
      if (!st) return;
      score = st.score || 0; lives = st.lives || 3; level = st.level || 1;
      if (st.player) { player.x = st.player.x; player.y = st.player.y; }
      enemies.length = 0;
      if (Array.isArray(st.enemies)) {
        for (const ed of st.enemies) {
          const e = enemyPool.acquire();
          e.x = ed.x; e.y = ed.y; e.r = ed.r; e.hp = ed.hp || 1;
          enemies.push(e);
        }
      }
    },
    destroy: () => {
      stop();
      try { bg.destroy(); } catch(e) {}
      try { audioMgr.destroy(); } catch(e) {}
      try { window.removeEventListener('resize', _onWindowResize); } catch(e) {}
      try { window.removeEventListener('keydown', _onKeyDown); window.removeEventListener('keyup', _onKeyUp); } catch(e) {}
      try { container.removeChild(bgCanvas); container.removeChild(gameCanvas); } catch(e) {}
    }
  };
}

/* --------------------------
   Exports
   -------------------------- */
export { createEngine, SpaceBG, Pool };
export default { createEngine };
