// src/pages/PreviewPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function PreviewPage() {
  const q = useQuery();
  const projectId = q.get("project");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const playerRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!projectId) throw new Error("Missing project id");
        const res = await fetch(`${API_BASE}/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to load project");
        const json = await res.json();
        const data = json.data ? json.data : json;
        data.objects = data.objects || [];
        setProject(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // Basic player physics for demo
  useEffect(() => {
    if (!project) return;
    const canvas = canvasRef.current;
    let rafId = null;
    const state = {
      player: project.objects.find((o) => o.type === "player") || null,
    };
    const player = state.player;
    if (!player) return; // nothing to play
    player.vx = player.vx || 0;
    player.vy = player.vy || 0;
    const gravity = (project.meta && project.meta.gravity) || 900;
    const floor = (project.settings && project.settings.floorY) || 400;

    function tick() {
      // keyboard input
      if (keysRef.current.left) player.vx = -200;
      else if (keysRef.current.right) player.vx = 200;
      else player.vx = 0;

      // apply velocity
      player.x = Math.max(0, (player.x || 0) + player.vx * 0.016);
      // gravity
      player.vy = (player.vy || 0) + gravity * 0.016;
      player.y = Math.min(floor, (player.y || 0) + player.vy * 0.016);

      // simple floor collision
      if (player.y >= floor) {
        player.y = floor;
        player.vy = 0;
      }

      // update DOM
      if (playerRef.current) {
        playerRef.current.style.transform = `translate(${player.x}px, ${player.y}px)`;
      }

      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [project]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowLeft") keysRef.current.left = true;
      if (e.key === "ArrowRight") keysRef.current.right = true;
      if (e.key === "ArrowUp") keysRef.current.up = true;
    }
    function onKeyUp(e) {
      if (e.key === "ArrowLeft") keysRef.current.left = false;
      if (e.key === "ArrowRight") keysRef.current.right = false;
      if (e.key === "ArrowUp") keysRef.current.up = false;
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading preview…</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>Error: {error}</div>;
  if (!project) return <div style={{ padding: 20 }}>No project loaded.</div>;

  const player = project.objects.find((o) => o.type === "player");

  return (
    <div style={{ padding: 20 }}>
      <h2>{project.name || "Preview"}</h2>
      <div
        ref={canvasRef}
        style={{
          border: "1px solid #ddd",
          height: 480,
          width: 800,
          marginTop: 12,
          position: "relative",
          overflow: "hidden",
          background: "#111",
        }}
      >
        {project.objects.map((obj) => {
          if (obj === player) {
            return (
              <div
                key={obj.id}
                ref={playerRef}
                style={{
                  position: "absolute",
                  left: obj.x || 0,
                  top: obj.y || 0,
                  width: obj.w || 40,
                  height: obj.h || 40,
                  background: obj.color || "#e91e63",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                {obj.type}
              </div>
            );
          }
          return (
            <div
              key={obj.id}
              style={{
                position: "absolute",
                left: obj.x || 0,
                top: obj.y || 0,
                width: obj.w || 40,
                height: obj.h || 40,
                background: obj.color || "#2196f3",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {obj.type}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, color: "#ddd" }}>
        Controls: ArrowLeft / ArrowRight to move the player. (This is a minimal demo preview.)
      </div>
    </div>
  );
}
