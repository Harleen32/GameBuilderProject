// src/components/TemplatesList.jsx
import React from "react";

const DEFAULT_TEMPLATES = [
  {
    id: "space-shooter",
    title: "Space Shooter",
    cover: "/assets/templates/space-shooter/cover.svg",
  },
  {
    id: "platformer",
    title: "Platformer",
    cover: "/assets/templates/platformer/cover.svg",
  },
  {
    id: "racing",
    title: "Racing",
    cover: "/assets/templates/racing/cover.svg",
  },
  {
    id: "rpg",
    title: "RPG / Adventure",
    cover: "/assets/templates/rpg/cover.svg",
  },
];

export default function TemplatesList({ templates = DEFAULT_TEMPLATES, onOpen }) {
  if (!templates || templates.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
        No templates available.
      </div>
    );
  }

  return (
    <div
      className="templates-grid"
      role="list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        gap: 12,
      }}
    >
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          role="listitem"
          className="template-card"
          onClick={() => onOpen?.(t)}
          aria-label={`Open ${t.title} template`}
          style={{
            cursor: "pointer",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 8,
            overflow: "hidden",
            textAlign: "left",
            padding: 0,
            background: "#fff", // slightly better than transparent
          }}
        >
          <div
            className="template-cover"
            style={{
              height: 120,
              backgroundImage: `url(${t.cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          />
          <div className="template-meta" style={{ padding: 8 }}>
            <div
              className="template-title"
              style={{ fontWeight: 600, fontSize: "1rem" }}
            >
              {t.title}
            </div>
            <div
              className="template-id"
              style={{ fontSize: 12, color: "#666" }}
            >
              {t.id}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
