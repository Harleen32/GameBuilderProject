// src/pages/EditorPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function EditorPage() {
  const q = useQuery();
  const templateId = q.get("template");
  const projectId = q.get("project");
  const [project, setProject] = useState(null); // project.data shape OR template.data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // simple in-memory id tracker for created objects
  const nextIdRef = useRef(1000);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let url = "";
        if (templateId) url = `${API_BASE}/api/templates/${templateId}`;
        else if (projectId) url = `${API_BASE}/api/projects/${projectId}`;
        if (!url) {
          // blank project
          setProject({ name: "Untitled", objects: [] });
          setLoading(false);
          return;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const json = await res.json();
        // API returns either { data: {...}, name } or the raw data itself
        const data = json.data ? json.data : json;
        // standardize: ensure objects array exists
        data.objects = data.objects || [];
        data.name = data.name || json.name || data.name || (templateId ? `Template ${templateId}` : "Project");
        setProject(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [templateId, projectId]);

  // Drag handling
  useEffect(() => {
    if (!project) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dragging = null;
    let offset = { x: 0, y: 0 };

    function findObjAtPosition(x, y) {
      // iterate reversed to pick top-most
      for (let i = project.objects.length - 1; i >= 0; i--) {
        const obj = project.objects[i];
        const left = obj.x || 0;
        const top = obj.y || 0;
        const w = obj.w || 40;
        const h = obj.h || 40;
        if (x >= left && x <= left + w && y >= top && y <= top + h) return obj;
      }
      return null;
    }

    function onPointerDown(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const obj = findObjAtPosition(x, y);
      if (obj) {
        dragging = obj;
        offset.x = x - (obj.x || 0);
        offset.y = y - (obj.y || 0);
        canvas.setPointerCapture(e.pointerId);
      }
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dragging.x = Math.max(0, Math.round(x - offset.x));
      dragging.y = Math.max(0, Math.round(y - offset.y));
      // trigger a state update by cloning project (simple)
      setProject((p) => ({ ...p, objects: [...p.objects] }));
    }

    function onPointerUp(e) {
      if (dragging) {
        try { canvas.releasePointerCapture && canvas.releasePointerCapture(e.pointerId); } catch {}
        dragging = null;
      }
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [project]);

  function addObject(type = "box") {
    const newObj = {
      id: `obj-${nextIdRef.current++}`,
      type,
      x: 50,
      y: 50,
      w: 48,
      h: 48,
      color: type === "player" ? "#2ecc71" : "#4a90e2",
    };
    setProject((p) => ({ ...p, objects: [...p.objects, newObj] }));
  }

  async function handleSave() {
    try {
      const payload = {
        name: project.name || "Untitled",
        data: project // some APIs expect {name,data}, our services expect {name,data}
      };
      // our backend expects { name, data } in POST /api/projects
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: payload.name, data: project }),
      });
      if (!res.ok) throw new Error("Save failed: " + res.status);
      const json = await res.json();
      const id = json.id || json._id || json.insertedId;
      if (!id) {
        // if service returned full project object
        if (json._id) {
          navigate(`/preview?project=${encodeURIComponent(json._id)}`);
          return;
        }
        alert("Saved but no id returned. Inspect response in console.");
        console.log("save response:", json);
        return;
      }
      navigate(`/preview?project=${encodeURIComponent(id)}`);
    } catch (err) {
      console.error(err);
      alert("Save failed: " + err.message);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading editor…</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>Error: {error}</div>;
  if (!project) return <div style={{ padding: 20 }}>No project loaded.</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{project.name || "Editor"}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => addObject("player")}>Add Player</button>
          <button onClick={() => addObject("box")}>Add Box</button>
          <button onClick={() => addObject("platform")}>Add Platform</button>
          <button onClick={handleSave} style={{ background: "#0b63ff", color: "#fff" }}>Save & Preview</button>
        </div>
      </div>

      <div
        ref={canvasRef}
        id="editor-canvas"
        style={{
          border: "1px solid #ddd",
          height: 500,
          marginTop: 12,
          background: "#f7f7fb",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {Array.isArray(project.objects) &&
          project.objects.map((obj) => (
            <div
              key={obj.id}
              style={{
                position: "absolute",
                left: obj.x,
                top: obj.y,
                width: obj.w || 40,
                height: obj.h || 40,
                background: obj.color || (obj.type === "player" ? "#2ecc71" : "#4a90e2"),
                borderRadius: obj.type === "player" ? 6 : 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                userSelect: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              }}
              title={`${obj.type} (${obj.id})`}
            >
              {obj.type}
            </div>
          ))}
      </div>

      <div style={{ marginTop: 12, color: "#666" }}>
        Drag objects on the canvas. Click "Save & Preview" to persist and open a preview page.
      </div>
    </div>
  );
}
