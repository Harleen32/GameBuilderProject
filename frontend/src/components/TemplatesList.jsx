// src/components/TemplatesList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TemplatesList({ onOpen }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Build API base safely
  const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");
  const TEMPLATES_URL = API_BASE ? `${API_BASE}/api/templates` : `/api/templates`;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(TEMPLATES_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `API ${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 120)}` : ""}`
          );
        }
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json")) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `Unexpected response (not JSON). Got "${ct}". First bytes: ${text?.slice(0, 80) || "(empty)"}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        const items = Array.isArray(data) ? data : data.items || [];
        const normalized = items.map((t) => ({
          id: t._id || t.id || t.name,
          name: t.name || t.title || t.id || "Untitled",
          description: t.description || "",
          thumbnailUrl:
            t.thumbnailUrl ||
            t.cover ||
            `/assets/templates/${encodeURIComponent(t._id || t.id || t.name)}.png`,
          tags: t.tags || [],
          raw: t,
        }));
        setTemplates(normalized);
      })
      .catch((err) => {
        console.error("Failed to load templates", err);
        if (mounted) setError(err.message || "Failed to load");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [TEMPLATES_URL]); // satisfy react-hooks/exhaustive-deps without disabling it

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              minHeight: 170,
            }}
          >
            <div style={{ height: 100, background: "#eee" }} />
            <div style={{ padding: 8 }}>
              <div style={{ width: "60%", height: 12, background: "#eee", marginBottom: 6 }} />
              <div style={{ width: "40%", height: 10, background: "#eee" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ color: "crimson", marginBottom: 8 }}>
          Error: {error}
          {API_BASE ? "" : " (Tip: set REACT_APP_API_BASE in Vercel to your Render URL)"}
        </div>
        <button onClick={() => window.location.reload()} style={{ padding: "8px 12px" }}>
          Retry
        </button>
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div style={{ padding: 12, color: "#444" }}>
        No templates found. Seed your backend or add JSON files to <code>frontend/public/</code>.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
      {templates.map((t) => (
        <article
          key={t.id}
          role="article"
          aria-label={t.name}
          style={{
            cursor: "pointer",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 8,
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            minHeight: 170,
          }}
        >
          <div
            style={{
              height: 120,
              backgroundImage: `url(${t.thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() => {
              onOpen && onOpen(t.raw || t);
              navigate(`/templates/${encodeURIComponent(t.id)}`);
            }}
          />
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ fontWeight: 700 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{t.tags.slice(0, 2).join(", ")}</div>
            </div>
            <div style={{ fontSize: 13, color: "#666", flex: 1 }}>{t.description || t.id}</div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/editor?template=${encodeURIComponent(t.id)}`);
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: "#0b63ff",
                  color: "#fff",
                }}
                aria-label={`Open editor for ${t.name}`}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/templates/${encodeURIComponent(t.id)}`);
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  cursor: "pointer",
                }}
                aria-label={`Preview ${t.name}`}
              >
                Preview
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
