
// Phaser config
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: "arcade", arcade: { gravity: { y: 600 }, debug: false } },
  scene: [MainMenu, Level1, Level2, GameOver]
};
const game = new Phaser.Game(config);
let score = 0;

// Scenes
class MainMenu extends Phaser.Scene {
  constructor() { super("MainMenu"); }
  create() {
    const { width, height } = this.sys.game.config;
    this.add.text(width/2, height/2-50, "shooter game Game", { fontSize:"32px", fill:"#fff" }).setOrigin(0.5);
    const startBtn = this.add.text(width/2, height/2+50, "Start Game", { fontSize:"24px", fill:"#0f0" }).setOrigin(0.5).setInteractive();
    startBtn.on("pointerdown", () => this.scene.start("Level1"));
  }
}

class Level1 extends Phaser.Scene {
  constructor() { super("Level1"); }
  preload() {
    this.load.image("ground","assets/platform.png");
    this.load.image("player","assets/player.png");
    this.load.image("star","assets/star.png");
    this.load.image("sky","assets/sky.png");
  }
  create() {
    this.add.image(400,300,"sky");
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400,584,"ground").setScale(2).refreshBody();
    this.platforms.create(600,450,"ground");
    this.platforms.create(50,350,"ground");
    this.platforms.create(750,220,"ground");
    this.player = this.physics.add.sprite(100,450,"player").setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(this.player,this.platforms);
    this.collectibles = this.physics.add.group({ key:"star", repeat:5, setXY:{x:50,y:0,stepX:120} });
    this.collectibles.children.iterate(c => { c.setBounceY(Phaser.Math.FloatBetween(0.4,0.8)); });
    this.physics.add.collider(this.collectibles,this.platforms);
    this.physics.add.overlap(this.player,this.collectibles,(player,star)=>{
      star.disableBody(true,true);
      score+=10;
      if(this.collectibles.countActive(true)===0) this.scene.start("Level2");
    });
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  update() {
    if(!this.player) return;
    const speed = 160;
    if(this.cursors.left.isDown){ this.player.setVelocityX(-speed); }
    else if(this.cursors.right.isDown){ this.player.setVelocityX(speed); }
    else{ this.player.setVelocityX(0); }
    if(this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-400);
  }
}

class Level2 extends Phaser.Scene {
  constructor(){ super("Level2"); }
  preload(){ this.load.image("ground","assets/platform.png"); this.load.image("player","assets/player.png"); this.load.image("star","assets/star.png"); this.load.image("sky","assets/sky.png"); }
  create(){
    this.add.image(400,300,"sky");
    this.platforms=this.physics.add.staticGroup();
    this.platforms.create(400,584,"ground").setScale(2).refreshBody();
    this.platforms.create(150,450,"ground");
    this.platforms.create(650,350,"ground");
    this.platforms.create(400,220,"ground");
    this.player=this.physics.add.sprite(100,450,"player").setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(this.player,this.platforms);
    this.collectibles=this.physics.add.group({ key:"star", repeat:7, setXY:{x:50,y:0,stepX:100} });
    this.collectibles.children.iterate(c=>c.setBounceY(Phaser.Math.FloatBetween(0.4,0.8)));
    this.physics.add.collider(this.collectibles,this.platforms);
    this.physics.add.overlap(this.player,this.collectibles,(player,star)=>{
      star.disableBody(true,true);
      score+=10;
      if(this.collectibles.countActive(true)===0) this.scene.start("GameOver");
    });
    this.cursors=this.input.keyboard.createCursorKeys();
  }
  update(){
    if(!this.player) return;
    const speed=160;
    if(this.cursors.left.isDown){ this.player.setVelocityX(-speed); }
    else if(this.cursors.right.isDown){ this.player.setVelocityX(speed); }
    else{ this.player.setVelocityX(0); }
    if(this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-400);
  }
}

class GameOver extends Phaser.Scene{
  constructor(){ super("GameOver"); }
  create(){
    const { width, height } = this.sys.game.config;
    this.add.text(width/2,height/2-50,"Game Over",{ fontSize:"32px", fill:"#fff" }).setOrigin(0.5);
    this.add.text(width/2,height/2,"Score: "+score,{ fontSize:"24px", fill:"#0f0" }).setOrigin(0.5);
    const restartBtn=this.add.text(width/2,height/2+50,"Restart",{ fontSize:"24px", fill:"#0ff" }).setOrigin(0.5).setInteractive();
    restartBtn.on("pointerdown",()=>this.scene.start("MainMenu"));
  }
}
