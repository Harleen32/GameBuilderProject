// backend/ai-orchestrator.js
import fs from "fs";
import path from "path";

// Path to assets folder
const ASSETS_DIR = path.join(process.cwd(), "frontend/public/assets");

/**
 * Scan assets folder and categorize by type
 */
function scanAssets() {
  const files = fs.readdirSync(ASSETS_DIR);
  const images = [];
  const audio = [];
  const others = [];

  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) images.push({ key: name, path: `assets/${file}`, type: "image" });
    else if ([".mp3", ".wav", ".ogg"].includes(ext)) audio.push({ key: name, path: `assets/${file}`, type: "audio" });
    else others.push({ key: name, path: `assets/${file}`, type: "other" });
  });

  return { images, audio, others };
}

/**
 * Generate game metadata based on prompt
 */
export function generateGameMetadata(prompt) {
  const p = prompt.toLowerCase();
  const { images, audio } = scanAssets();

  // Helper to pick images by keyword
  const pickImage = keywords => images.find(img => keywords.some(k => img.key.includes(k))) || images[0];
  const pickAudio = keywords => audio.find(a => keywords.some(k => a.key.includes(k))) || null;

  // Shooter / Battle Royale
  if (p.includes("shooter") || p.includes("battle") || p.includes("free fire") || p.includes("gun")) {
    return {
      title: "Battle Royale Shooter",
      type: "shooter",
      assets: [
        pickImage(["player", "hero"]),
        pickImage(["enemy"]),
        pickImage(["bullet"]),
        pickImage(["bg", "background"]),
        pickAudio(["shoot"])
      ].filter(Boolean),
      mechanics: {
        playerControls: "WASD",
        shooting: true,
        gravity: false,
        levels: 1,
        specialRules: "Survive as long as possible"
      }
    };
  }

  // Puzzle / Match Game
  if (p.includes("puzzle") || p.includes("match") || p.includes("tiles")) {
    return {
      title: "Tile Puzzle",
      type: "puzzle",
      assets: [
        pickImage(["tile"]),
        pickImage(["bg", "background"])
      ].filter(Boolean),
      mechanics: {
        playerControls: "mouse",
        shooting: false,
        gravity: false,
        levels: 10,
        specialRules: "Match 3 tiles to score"
      }
    };
  }

  // Racing / Driving
  if (p.includes("race") || p.includes("racing") || p.includes("car") || p.includes("kart")) {
    return {
      title: "Racing Game",
      type: "racing",
      assets: [
        pickImage(["car"]),
        pickImage(["track"]),
        pickImage(["bg", "background"])
      ].filter(Boolean),
      mechanics: {
        playerControls: "arrowKeys",
        shooting: false,
        gravity: false,
        levels: 3,
        specialRules: "Reach the finish line"
      }
    };
  }

  // Platformer (Mario style)
  if (p.includes("platform") || p.includes("jump") || p.includes("mario")) {
    return {
      title: "Platform Adventure",
      type: "platformer",
      assets: [
        pickImage(["player"]),
        pickImage(["ground"]),
        pickImage(["enemy"]),
        pickImage(["bg", "background"])
      ].filter(Boolean),
      mechanics: {
        playerControls: "arrowKeys",
        shooting: false,
        gravity: true,
        levels: 5,
        specialRules: "Avoid enemies and reach the goal"
      }
    };
  }

  // RPG / Adventure
  if (p.includes("rpg") || p.includes("adventure") || p.includes("quest")) {
    return {
      title: "Fantasy RPG",
      type: "rpg",
      assets: [
        pickImage(["hero"]),
        pickImage(["npc"]),
        pickImage(["map"]),
        pickImage(["bg", "background"])
      ].filter(Boolean),
      mechanics: {
        playerControls: "arrowKeys",
        shooting: false,
        gravity: false,
        levels: 1,
        specialRules: "Explore and complete quests"
      }
    };
  }

  // Tower Defense
  if (p.includes("tower") || p.includes("defense")) {
    return {
      title: "Tower Defense",
      type: "tower-defense",
      assets: [
        pickImage(["tower"]),
        pickImage(["enemy"]),
        pickImage(["path"]),
        pickImage(["bg", "background"])
      ].filter(Boolean),
      mechanics: {
        playerControls: "mouse",
        shooting: true,
        gravity: false,
        levels: 5,
        specialRules: "Defend the base from enemies"
      }
    };
  }

  // Fallback: generic game
  return {
    title: "Custom Game",
    type: "generic",
    assets: [pickImage(["bg", "background"])].filter(Boolean),
    mechanics: {
      playerControls: "arrowKeys",
      shooting: false,
      gravity: false,
      levels: 1,
      specialRules: "Basic empty scene"
    }
  };
}
