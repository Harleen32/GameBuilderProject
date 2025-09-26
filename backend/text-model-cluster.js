// text-model-cluster.js
// Mock AI/rule-based layer - picks assets based on the prompt

export function detectGameType(prompt) {
  console.log("🧠 Detecting game type from prompt ->", prompt);

  let metadata = { title: "My Game", assets: [] };

  if (prompt.toLowerCase().includes("puzzle")) {
    metadata = {
      title: "Puzzle Game",
      assets: [
        { key: "background", type: "image", path: "/assets/puzzle/background.png" },
        { key: "player", type: "image", path: "/assets/puzzle/player.png" },
        { key: "block", type: "image", path: "/assets/puzzle/block.png" }
      ]
    };
  } else if (prompt.toLowerCase().includes("shooter") || prompt.toLowerCase().includes("fps")) {
    metadata = {
      title: "Shooter Game",
      assets: [
        { key: "map", type: "image", path: "/assets/shooter/map.png" },
        { key: "gun", type: "image", path: "/assets/shooter/gun.png" },
        { key: "enemy", type: "image", path: "/assets/shooter/enemy.png" }
      ]
    };
  } else {
    metadata = {
      title: "Platformer Game",
      assets: [
        { key: "tileset", type: "image", path: "/assets/platformer/tileset.png" },
        { key: "player", type: "image", path: "/assets/platformer/player.png" },
        { key: "enemy", type: "image", path: "/assets/platformer/enemy.png" },
        { key: "coin", type: "image", path: "/assets/platformer/coin.png" }
      ]
    };
  }

  return metadata;
}
