// buildGameTemplate.js
import fs from "fs";
import path from "path";
import { generateImage } from "./image-generator.js";

export async function buildGameTemplate(gameName, gameIdea, numLevels = 3) {
  const folderPath = path.join("generated-games", gameName);
  const assetsPath = path.join(folderPath, "assets");

  // --- Define assets ---
  const assets = [
    { key: "player", prompt: `${gameIdea} main character, cartoon style` },
    { key: "platform", prompt: "cartoon platform, side view" },
    { key: "enemy1", prompt: "cartoon robot enemy" },
    { key: "enemy2", prompt: "cartoon alien enemy" },
    { key: "coin", prompt: "cartoon gold coin, shiny" },
    { key: "powerup", prompt: "cartoon glowing power-up" },
    { key: "spike", prompt: "cartoon spike hazard, sharp" }
  ];

  for (let i = 1; i <= numLevels; i++) {
    assets.push({
      key: `background${i}`,
      prompt: `${gameIdea} background level ${i}, cartoon style, landscape`
    });
  }

  fs.mkdirSync(assetsPath, { recursive: true });

  for (const asset of assets) {
    const outputPath = path.join(assetsPath, `${asset.key}.png`);
    await generateImage(asset.prompt, outputPath);
  }

  // --- Generate game.js ---
  const preloadLines = assets
    .map(a => `this.load.image("${a.key}", "assets/${a.key}.png");`)
    .join("\n    ");

  const gameJS = `
class MyGame extends Phaser.Scene {
  preload() {
    ${preloadLines}
  }

  create() {
    // HUD
    this.score = 0;
    this.startTime = this.time.now;
    this.currentLevel = 0;
    this.numLevels = ${numLevels};

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: 'Arial', fontSize: '20px', fill: '#fff' });
    this.timerText = this.add.text(650, 16, 'Time: 0', { fontFamily: 'Arial', fontSize: '20px', fill: '#fff' });
    this.levelText = this.add.text(350, 16, 'Level 1', { fontFamily: 'Arial', fontSize: '20px', fill: '#ff0' });

    // Player
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // Level data
    this.levels = [];
    for(let i=1;i<=this.numLevels;i++){
      this.levels.push({
        background: 'background'+i,
        enemyTypes: ['enemy1','enemy2'],
        numPlatforms: Phaser.Math.Between(4,6)
      });
    }

    this.loadLevel(this.currentLevel);
  }

  loadLevel(levelIndex) {
    const level = this.levels[levelIndex];

    // Clear previous
    this.children.removeAll(true);

    // HUD re-add
    this.bgImage = this.add.image(400, 300, level.background).setDepth(-1);
    this.add.existing(this.player);
    this.add.existing(this.scoreText);
    this.add.existing(this.timerText);
    this.add.existing(this.levelText);

    this.levelText.setText("Level " + (levelIndex+1));

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = [];
    for(let i=0;i<level.numPlatforms;i++){
      const x = Phaser.Math.Between(50,750);
      const y = Phaser.Math.Between(300,580);
      const p = this.platforms.create(x,y,'platform');
      if(Math.random()>0.6){
        p.isMoving = true;
        p.speed = Phaser.Math.Between(40,80);
        p.direction = 1;
        this.movingPlatforms.push(p);
      }
    }

    // Enemies
    this.enemies = this.physics.add.group();
    level.enemyTypes.forEach(type=>{
      const num = Phaser.Math.Between(1,2);
      for(let i=0;i<num;i++){
        const platform = Phaser.Utils.Array.GetRandom(this.platforms.getChildren());
        const e = this.enemies.create(platform.x, platform.y-20, type);
        e.setCollideWorldBounds(true);
        if(type==='enemy1') e.patrolDirection = 1;
        else e.setVelocity(Phaser.Math.Between(-80,80), -100);
      }
    });

    // Collectibles
    this.collectibles = this.physics.add.group();
    ['coin','powerup'].forEach(type=>{
      for(let i=0;i<Phaser.Math.Between(3,5);i++){
        const platform = Phaser.Utils.Array.GetRandom(this.platforms.getChildren());
        this.collectibles.create(platform.x+Phaser.Math.Between(-40,40), platform.y-20, type);
      }
    });

    // Spikes
    this.spikes = this.physics.add.group();
    for(let i=0;i<3;i++){
      this.spikes.create(Phaser.Math.Between(100,700), 580, 'spike');
    }

    // Collisions
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.collectibles, this.platforms);

    this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
    this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);
    this.physics.add.collider(this.player, this.spikes, this.hitSpike, null, this);
  }

  collectItem(player, collectible) {
    collectible.destroy();
    if(collectible.texture.key==='coin') this.score+=10;
    if(collectible.texture.key==='powerup') this.player.setVelocityY(-400);
    this.scoreText.setText('Score: '+this.score);
  }

  hitEnemy(player, enemy) {
    this.cameras.main.shake(200,0.01);
    this.score = Math.max(this.score-15,0);
    this.scoreText.setText('Score: '+this.score);
    player.setTint(0xff0000);
    this.time.delayedCall(200,()=>player.clearTint());
  }

  hitSpike(player, spike) {
    this.cameras.main.flash(200,0xff0000);
    this.score = Math.max(this.score-10,0);
    this.scoreText.setText('Score: '+this.score);
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if(cursors.left.isDown) this.player.setVelocityX(-200);
    else if(cursors.right.isDown) this.player.setVelocityX(200);
    else this.player.setVelocityX(0);
    if(cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-300);

    // Moving platforms
    this.movingPlatforms.forEach(p=>{
      p.x += p.speed*p.direction*this.game.loop.delta/1000;
      if(p.x<50||p.x>750) p.direction*=-1;
    });

    // Enemy patrol
    this.enemies.getChildren().forEach(e=>{
      if(e.texture.key==='enemy1'){
        e.setVelocityX(100*e.patrolDirection);
        if(e.body.blocked.right||e.body.blocked.left) e.patrolDirection*=-1;
      }
    });

    // HUD timer
    const elapsed = Math.floor((this.time.now-this.startTime)/1000);
    this.timerText.setText('Time: '+elapsed);

    // Level transition
    if(this.player.x>800){
      this.currentLevel++;
      if(this.currentLevel<this.numLevels){
        this.player.x=50; this.loadLevel(this.currentLevel);
      } else {
        this.scene.start('GameOver',{score:this.score});
      }
    }
  }
}

// Game Over scene
class GameOverScene extends Phaser.Scene {
  constructor(){ super('GameOver'); }
  init(data){ this.finalScore=data.score; }
  create(){
    this.add.text(300,250,'Game Over',{fontSize:'32px',fill:'#fff'});
    this.add.text(280,300,'Final Score: '+this.finalScore,{fontSize:'24px',fill:'#ff0'});
    const restart=this.add.text(320,360,'Press SPACE to Restart',{fontSize:'20px',fill:'#0f0'});
    this.input.keyboard.once('keydown-SPACE',()=>this.scene.start('MyGame'));
  }
}

const config={
  type:Phaser.AUTO,
  width:800,
  height:600,
  physics:{default:'arcade',arcade:{gravity:{y:500},debug:false}},
  scene:[MyGame,GameOverScene]
};
new Phaser.Game(config);
`;

  fs.mkdirSync(folderPath, { recursive: true });
  fs.writeFileSync(path.join(folderPath,"game.js"),gameJS);

   // --- write index.html and game.js (you already do this) ---
  fs.writeFileSync(path.join(folderPath,"game.js"),gameJS);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${gameName}</title>
<style>
  body { margin:0; background:#111; display:flex; justify-content:center; align-items:center; height:100vh; }
  canvas { border:3px solid #444; border-radius:12px; }
</style>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
</head>
<body>
<script src="game.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(folderPath,"index.html"),html);

  // --- NEW: generate a normalized JSON file the editor can load ---
  // Build a lightweight "objects" layout so editor can show something meaningful
  const objects = [];

  // Player
  objects.push({
    type: "player",
    x: 100,
    y: 500,
    width: 48,
    height: 64,
    rotation: 0,
    img: `assets/player.png`,
    properties: { collideWorldBounds: true }
  });

  // Platforms (some random-ish positions)
  const platformCount = 6;
  for (let i = 0; i < platformCount; i++) {
    const px = 80 + i * 110;
    const py = 380 + (i % 2 === 0 ? 0 : -80);
    objects.push({
      type: "platform",
      x: px,
      y: py,
      width: 140,
      height: 28,
      img: `assets/platform.png`
    });
  }

  // A couple of enemies
  objects.push({ type: "enemy1", x: 220, y: 340, width: 48, height: 48, img: "assets/enemy1.png" });
  objects.push({ type: "enemy2", x: 500, y: 300, width: 48, height: 48, img: "assets/enemy2.png" });

  // Collectibles
  objects.push({ type: "coin", x: 260, y: 300, width: 24, height: 24, img: "assets/coin.png" });
  objects.push({ type: "powerup", x: 420, y: 260, width: 28, height: 28, img: "assets/powerup.png" });

  // Spikes
  objects.push({ type: "spike", x: 700, y: 560, width: 40, height: 40, img: "assets/spike.png" });

  // Background layers (one per level)
  const backgrounds = [];
  for (let i = 1; i <= numLevels; i++) {
    backgrounds.push(`assets/background${i}.png`);
  }

  const templateData = {
    id: gameName,
    title: gameName.split('-').map(s => s[0].toUpperCase()+s.slice(1)).join(' '),
    description: `Auto-generated game based on: ${gameIdea}`,
    numLevels,
    backgrounds,
    assets: assets.map(a => ({ key: a.key, file: `assets/${a.key}.png` })),
    objects
  };

  // Write two JSON locations the editor will try:
  // 1) generated-games/<gameName>.json
  // 2) generated-games/<gameName>/<gameName>.json
  try {
    const jsonTop = path.join("generated-games", `${gameName}.json`);
    const jsonInner = path.join(folderPath, `${gameName}.json`);
    fs.writeFileSync(jsonTop, JSON.stringify(templateData, null, 2), "utf8");
    fs.writeFileSync(jsonInner, JSON.stringify(templateData, null, 2), "utf8");
    console.log(`✅ Template JSON written: ${jsonTop} and ${jsonInner}`);
  } catch (err) {
    console.warn("⚠️ Failed writing template JSON:", err);
  }

  console.log(`✅ Game "${gameName}" generated with UI, restart, level system, enemies, spikes, and game-over screen!`);
}
