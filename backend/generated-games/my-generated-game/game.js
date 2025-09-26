
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update }
};
let player;
const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'assets/player.png');
  this.load.image('background', 'assets/background.png');
}

function create() {
  this.add.image(400, 300, 'background');
  player = this.add.sprite(400, 300, 'player');
}

function update() {}
  