// server.js (updated)
// ESM + Express server with template listing + preview + save endpoints

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs-extra";
import archiver from "archiver";
import { fileURLToPath } from "url";
import { buildGameTemplate } from "./buildGameTemplate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// -----------------------------
// Directories - adjust if needed
// -----------------------------
const FRONTEND_DIR = path.join(process.cwd(), "../frontend/public"); // keep your structure
const GENERATED_DIR = path.join(process.cwd(), "generated-games");
const GAME_ASSETS = path.join(process.cwd(), "game-assets"); // optional

fs.ensureDirSync(GENERATED_DIR);
fs.ensureDirSync(GAME_ASSETS);

// -----------------------------
// Middleware
// -----------------------------
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// logging helper (simple)
const log = (...args) => console.log("[server]", ...args);

// Serve static frontend if present
if (fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));
  log("Serving frontend from:", FRONTEND_DIR);
} else {
  log("Warning: FRONTEND_DIR not found:", FRONTEND_DIR);
}

// serve assets + generated games
app.use("/assets", express.static(GAME_ASSETS, { maxAge: "1d" }));
app.use("/generated-games", express.static(GENERATED_DIR, { index: false }));

// -----------------------------
// Utility helpers
// -----------------------------
function sanitizeName(name = "") {
  return path.basename(name).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_.]/g, "");
}

async function listGeneratedTemplates() {
  const entries = await fs.readdir(GENERATED_DIR, { withFileTypes: true });
  const folders = [];
  for (const ent of entries) {
    // include directories and zip files
    if (ent.isDirectory()) {
      const folderName = ent.name;
      const indexHtml = path.join(GENERATED_DIR, folderName, "index.html");
      const jsonFile = path.join(GENERATED_DIR, folderName + ".json"); // optional
      const zipPath = path.join(GENERATED_DIR, `${folderName}.zip`);
      folders.push({
        id: folderName,
        name: folderName,
        indexExists: fs.existsSync(indexHtml),
        jsonExists: fs.existsSync(jsonFile),
        zip: fs.existsSync(zipPath) ? `/generated-games/${encodeURIComponent(folderName)}.zip` : null,
        url: fs.existsSync(indexHtml) ? `/generated-games/${encodeURIComponent(folderName)}/index.html` : null
      });
    } else if (ent.isFile() && ent.name.endsWith(".zip")) {
      // include zips that aren't folders
      const id = ent.name.replace(/\.zip$/i, "");
      if (!folders.find(f => f.id === id)) {
        folders.push({
          id,
          name: id,
          indexExists: false,
          jsonExists: false,
          zip: `/generated-games/${encodeURIComponent(ent.name)}`,
          url: null
        });
      }
    }
  }
  return folders;
}

// -----------------------------
// API: list templates
// GET /api/templates
// -----------------------------
app.get("/api/templates", async (req, res) => {
  try {
    const list = await listGeneratedTemplates();
    res.json({ ok: true, templates: list });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to list templates" });
  }
});

// -----------------------------
// API: generate a template (your existing endpoint)
// POST /api/games/generate
// -----------------------------
app.post("/api/games/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: "Prompt is required" });

    log("Prompt:", prompt);
    const safeTitle = sanitizeName(prompt.toLowerCase().slice(0, 60) || `game-${Date.now()}`);
    const gameFolder = path.join(GENERATED_DIR, safeTitle);
    fs.ensureDirSync(gameFolder);

    await buildGameTemplate(safeTitle, prompt, 3);

    // create zip (optional)
    const zipPath = path.join(GENERATED_DIR, `${safeTitle}.zip`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);
      archive.directory(gameFolder, false);
      archive.finalize();
    });

    res.json({
      success: true,
      id: safeTitle,
      prompt,
      url: `/generated-games/${encodeURIComponent(safeTitle)}/index.html`,
      zip: `/generated-games/${encodeURIComponent(safeTitle)}.zip`
    });
  } catch (err) {
    console.error("generate error", err);
    res.status(500).json({ success: false, error: err.message || "Generation failed" });
  }
});

// -----------------------------
// API: save game JSON (editor -> save level/template)
// POST /api/save-game
// body: { filename, data }
// -----------------------------
app.post("/api/save-game", async (req, res) => {
  try {
    const { filename, data } = req.body;
    if (!data) return res.status(400).json({ ok: false, error: "Missing data" });

    const name = sanitizeName(filename || `game-${Date.now()}.json`);
    const dest = path.join(GENERATED_DIR, name);
    await fs.writeJson(dest, data, { spaces: 2 });

    res.json({ ok: true, message: `Saved ${name}`, path: `/generated-games/${encodeURIComponent(name)}` });
  } catch (err) {
    console.error("save-game error", err);
    res.status(500).json({ ok: false, error: err.message || "Failed to save" });
  }
});

// -----------------------------
// API: download zip by id
// GET /api/template-zip/:id
// -----------------------------
app.get("/api/template-zip/:id", (req, res) => {
  const id = sanitizeName(req.params.id || "");
  const zipPath = path.join(GENERATED_DIR, `${id}.zip`);
  if (!fs.existsSync(zipPath)) return res.status(404).send("Not found");
  res.download(zipPath);
});

// -----------------------------
// Preview route (Wix-like preview experience)
// GET /preview/:id
// If an index.html exists in generated-games/:id, embed via iframe
// Otherwise, try to load <id>.json and render a simple JSON viewer/player
// -----------------------------
app.get("/preview/:id", async (req, res) => {
  try {
    const id = sanitizeName(req.params.id || "");
    const folder = path.join(GENERATED_DIR, id);
    const indexFile = path.join(folder, "index.html");
    const jsonFile = path.join(GENERATED_DIR, `${id}.json`);

    if (fs.existsSync(indexFile)) {
      // Simple wrapper HTML that iframes the generated index.html
      const iframeUrl = `/generated-games/${encodeURIComponent(id)}/index.html`;
      return res.send(`<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Preview: ${id}</title>
<style>body,html{height:100%;margin:0}iframe{border:0;width:100%;height:100vh;display:block}</style>
</head><body>
<iframe src="${iframeUrl}" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
</body></html>`);
    }

    if (fs.existsSync(jsonFile)) {
      // Basic JSON viewer / lightweight runner
      const payload = await fs.readJson(jsonFile);
      return res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Preview ${id}</title></head><body>
<h3>Template JSON Preview: ${id}</h3>
<pre style="white-space:pre-wrap;background:#111;color:#cfc;padding:12px;border-radius:8px;">${JSON.stringify(payload, null, 2)}</pre>
</body></html>`);
    }

    return res.status(404).send("Preview not available for this template");
  } catch (err) {
    console.error("preview error", err);
    res.status(500).send("Preview failed");
  }
});

// -----------------------------
// Simple health + convenience routes
// -----------------------------
app.get("/health", (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (req, res) => {
  const index = path.join(FRONTEND_DIR, "Home.html");
  if (fs.existsSync(index)) return res.sendFile(index);
  return res.send("GameForge backend (no frontend index found)");
});

// fallback: serve static frontend files if available, else 404
app.get("*", (req, res) => {
  const filePath = path.join(FRONTEND_DIR, req.path);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);
  res.status(404).send("Not found");
});

// -----------------------------
app.listen(PORT, () => {
  log(`Server running at http://localhost:${PORT}`);
});
