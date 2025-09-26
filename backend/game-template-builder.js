// backend/game-template-builder.js
import fs from "fs";
import path from "path";
import { generateImage } from "./image-generator.js";

export async function buildGameTemplate(metadata, folderPath) {
  const gameName = metadata.title;
  const gameIdea = metadata.prompt;
  const numLevels = metadata.numLevels || 3;
  const assetsPath = path.join(folderPath, "assets");

  // --- 1️⃣ Define assets ---
  const assets = [
    { key: "player", prompt: `${gameIdea} main character, cartoon style` },
    { key: "platform", prompt: "cartoon platform, side view" },
    { key: "enemy1", prompt: "cartoon robot enemy" },
    { key: "enemy2", prompt: "cartoon alien enemy" },
    { key: "coin", prompt: "cartoon gold coin, shiny" },
    { key: "powerup", prompt: "cartoon power-up, glowing" },
    { key: "spike", prompt: "cartoon spike hazard, sharp" }
  ];

  // --- Generate AI images for levels ---
  for (let i = 1; i <= numLevels; i++) {
    assets.push({ key: `background${i}`, prompt: `${gameIdea} background level ${i}, cartoon style, landscape` });
  }

  fs.mkdirSync(assetsPath, { recursive: true });

  // Generate placeholder images
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
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setCollideWorldBounds(true);

    this.score = 0;
    this.startTime = this.time.now;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '20px', fill: '#fff' });
    this.timerText = this.add.text(600, 16, 'Time: 0', { fontSize: '20px', fill: '#fff' });

    this.currentLevel = 0;
    this.numLevels = ${numLevels};
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

    if(this.platforms) this.platforms.clear(true,true);
    if(this.movingPlatforms) this.movingPlatforms.length=0;
    if(this.enemies) this.enemies.clear(true,true);
    if(this.collectibles) this.collectibles.clear(true,true);
    if(this.spikes) this.spikes.clear(true,true);
    if(this.bgImage) this.bgImage.destroy();

    this.bgImage = this.add.image(400,300,level.background);

    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = [];
    for(let i=0;i<level.numPlatforms;i++){
      const x = Phaser.Math.Between(50,750);
      const y = Phaser.Math.Between(300,580);
      const p = this.platforms.create(x,y,'platform');

      if(Math.random()>0.6){
        p.isMoving = true;
        p.speed = Phaser.Math.Between(50,100);
        p.direction = 1;
        this.movingPlatforms.push(p);
      }
    }

    this.enemies = this.physics.add.group();
    level.enemyTypes.forEach(type=>{
      const num = Phaser.Math.Between(1,3);
      for(let i=0;i<num;i++){
        const platform = this.platforms.getChildren()[Phaser.Math.Between(0,this.platforms.getChildren().length-1)];
        const x = platform.x;
        const y = platform.y - 20;
        const e = this.enemies.create(x,y,type);
        e.setCollideWorldBounds(true);
        e.setBounce(1);
        if(type==='enemy1') e.patrolDirection=1;
        else if(type==='enemy2') e.setVelocity(Phaser.Math.Between(-100,100),-100);
      }
    });
    this.physics.add.collider(this.enemies,this.platforms);
    this.physics.add.collider(this.player,this.enemies,()=>{ console.log("Player hit an enemy!"); });

    this.collectibles = this.physics.add.group();
    ['coin','powerup'].forEach(type=>{
      const num = Phaser.Math.Between(3,5);
      for(let i=0;i<num;i++){
        const platform = this.platforms.getChildren()[Phaser.Math.Between(0,this.platforms.getChildren().length-1)];
        const x = platform.x + Phaser.Math.Between(-50,50);
        const y = platform.y - 20;
        this.collectibles.create(x,y,type);
      }
    });
    this.physics.add.collider(this.collectibles,this.platforms);
    this.physics.add.overlap(this.player,this.collectibles,(player,collectible)=>{
      collectible.destroy();
      if(collectible.texture.key==='coin') this.score+=10;
      else if(collectible.texture.key==='powerup') this.player.setVelocityY(-500);
      this.scoreText.setText('Score: '+this.score);
    });

    this.spikes = this.physics.add.group();
    for(let i=0;i<3;i++){
      const x = Phaser.Math.Between(100,700);
      const y = Phaser.Math.Between(550,580);
      this.spikes.create(x,y,'spike');
    }
    this.physics.add.collider(this.player,this.spikes,()=>{
      this.score = Math.max(this.score-10,0);
      this.scoreText.setText('Score: '+this.score);
      console.log("Player hit a spike!");
    });

    this.physics.add.collider(this.player,this.platforms);
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if(cursors.left.isDown) this.player.setVelocityX(-200);
    else if(cursors.right.isDown) this.player.setVelocityX(200);
    else this.player.setVelocityX(0);
    if(cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-300);

    this.enemies.getChildren().forEach(e=>{
      if(e.texture.key==='enemy1'){
        e.setVelocityX(100*e.patrolDirection);
        if(e.body.blocked.right||e.body.blocked.left) e.patrolDirection*=-1;
      } else if(e.texture.key==='enemy2'){
        if(Phaser.Math.Between(0,1000)>995 && e.body.touching.down) e.setVelocityY(-200);
      }
    });

    this.movingPlatforms.forEach(p=>{
      p.x += p.speed * p.direction * this.game.loop.delta/1000;
      if(p.x<50 || p.x>750) p.direction*=-1;
    });

    const elapsed = Math.floor((this.time.now-this.startTime)/1000);
    this.timerText.setText('Time: '+elapsed);

    if(this.player.x>800){
      this.currentLevel++;
      if(this.currentLevel<this.numLevels){
        this.player.x=50;
        this.loadLevel(this.currentLevel);
        console.log("Level "+(this.currentLevel+1));
      } else {
        console.log("All levels completed! Final Score: "+this.score);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 500 }, debug: false } },
  scene: MyGame
};

new Phaser.Game(config);
`;

  fs.mkdirSync(folderPath,{recursive:true});
  fs.writeFileSync(path.join(folderPath,"game.js"),gameJS);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${gameName}</title>
<script src="https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js"></script>
</head>
<body>
<script src="game.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(folderPath,"index.html"),html);

  console.log(`Game "${gameName}" generated with moving platforms, spikes, and multi-level support!`);
}
