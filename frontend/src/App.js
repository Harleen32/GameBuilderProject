// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TemplatesList from "./components/TemplatesList";
import SpaceShooterPage from "./pages/SpaceShooterPage";
import EditorPage from "./pages/EditorPage";
import PreviewPage from "./pages/PreviewPage";

function TemplateDetail() {
  // read last segment of path
  const id = window.location.pathname.split("/").pop();
  return (
    <div style={{ padding: 20 }}>
      <h2>Template: {id}</h2>
      <p>This is a placeholder detail page. Open preview/editor below.</p>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => {
            window.location.href = `/editor?template=${encodeURIComponent(id)}`;
          }}
          style={{ padding: "8px 12px" }}
        >
          Open Preview / Editor
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0 }}>Game Builder</h1>
          <nav>
            <Link to="/" style={{ marginRight: 12 }}>Home</Link>
            <Link to="/templates" style={{ marginRight: 12 }}>Templates</Link>
            <Link to="/editor" style={{ marginRight: 12 }}>Editor</Link>
          </nav>
        </header>

        <main style={{ marginTop: 18 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/templates"
              element={
                <div style={{ padding: 20 }}>
                  <h2>Templates</h2>
                  <TemplatesList onOpen={(t) => console.log("open", t)} />
                </div>
              }
            />
            <Route path="/templates/:id" element={<TemplateDetail />} />
            <Route path="/space-shooter" element={<SpaceShooterPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="*" element={<div style={{ padding: 20 }}>Page not found</div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
