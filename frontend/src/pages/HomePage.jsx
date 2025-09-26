// src/pages/HomePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom"; // if you use react-router; harmless if not used in your app
import "./home.css";
import TemplatesList from "../components/TemplatesList"; // optional - your component earlier

// lightweight fetch helper (you can swap with your editor-integration.js helpers)
async function fetchTemplatesFromApi() {
  const res = await fetch("/api/templates"); // replace with REACT_APP_API_BASE if needed
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load templates: ${res.status} ${res.statusText} ${text}`);
  }
  return res.json();
}

export default function HomePage() {
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTemplatesFromApi()
      .then((data) => {
        if (!cancelled) setTemplates(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Failed to fetch templates", err);
        if (!cancelled) setError(err);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const exampleTemplates = useMemo(() => [
    { id: 'space-shooter', title: 'Space Shooter', cover: '/assets/templates/space-shooter/cover.svg' },
    { id: 'platformer', title: 'Platformer', cover: '/assets/templates/platformer/cover.svg' },
    { id: 'racing', title: 'Racing', cover: '/assets/templates/racing/cover.svg' },
    { id: 'rpg', title: 'RPG / Adventure', cover: '/assets/templates/rpg/cover.svg' },
  ], []);

  return (
    <div className="gb-home">
      <header className="gb-header" role="banner">
        <div className="gb-header-inner">
          <h1 className="gb-title">Game Builder</h1>

          <nav className="gb-nav" aria-label="Main navigation">
            {/* Prefer router Link in SPA; fallback to <a> if Link not available */}
            {typeof Link !== "undefined" ? (
              <>
                <Link to="/" className="gb-nav-link">Home</Link>
                <Link to="/templates" className="gb-nav-link">Templates</Link>
                <Link to="/editor" className="gb-nav-link">Editor</Link>
                <Link to="/docs" className="gb-nav-link">Docs</Link>
              </>
            ) : (
              <>
                <a href="/" className="gb-nav-link">Home</a>
                <a href="/templates" className="gb-nav-link">Templates</a>
                <a href="/editor" className="gb-nav-link">Editor</a>
                <a href="/docs" className="gb-nav-link">Docs</a>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="gb-main" role="main">
        <section className="gb-hero" aria-labelledby="hero-heading">
          <div className="gb-hero-inner">
            <h2 id="hero-heading">Build games fast. Ship faster.</h2>
            <p className="gb-lead">
              Create, edit and publish game templates — with an integrated editor, live previews and simple asset handling.
            </p>
            <div className="gb-cta-row">
              <Link className="gb-btn gb-btn-primary" to="/editor" aria-label="Open Editor">Open Editor</Link>
              <Link className="gb-btn gb-btn-ghost" to="/templates" aria-label="Browse Templates">Browse Templates</Link>
            </div>
          </div>

          <div className="gb-hero-visual" aria-hidden="true">
            <div className="gb-visual-box">Preview Canvas</div>
          </div>
        </section>

        <section className="gb-features" aria-labelledby="features-heading">
          <h3 id="features-heading">What you get</h3>
          <div className="gb-features-grid">
            <article className="gb-feature" tabIndex={0}>
              <h4>Live preview</h4>
              <p>Instantly preview templates in the editor using a high-performance canvas engine.</p>
            </article>

            <article className="gb-feature" tabIndex={0}>
              <h4>Template library</h4>
              <p>Ship multiple templates (space shooter, platformer, racing, RPG) with one engine.</p>
            </article>

            <article className="gb-feature" tabIndex={0}>
              <h4>Save & version</h4>
              <p>Save templates to the server and keep history for safe editing and rollbacks.</p>
            </article>

            <article className="gb-feature" tabIndex={0}>
              <h4>Extensible</h4>
              <p>Add adapters for physics, AI or multiplayer — reuse the same editor and preview pipeline.</p>
            </article>
          </div>
        </section>

        <section className="gb-templates" aria-labelledby="templates-heading">
          <h3 id="templates-heading">Templates</h3>

          <div aria-live="polite" aria-atomic="true" style={{ minHeight: 40, marginBottom: 12 }}>
            {loading && <span>Loading templates…</span>}
            {error && <span role="alert" style={{ color: 'salmon' }}>Failed to load templates.</span>}
          </div>

          {/* Prefer your TemplatesList component if available */}
          {templates && templates.length > 0 ? (
            <div className="gb-templates-grid" role="list">
              {templates.map(t => (
                <a key={t.id} className="gb-card" role="listitem" href={`/templates/${t.id}`}>
                  <div className="gb-card-thumb" aria-hidden="true">
                    {t.cover ? <img src={t.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '🎮'}
                  </div>
                  <div className="gb-card-body">
                    <strong>{t.title}</strong>
                    <small>{t.subtitle || t.description || t.type || t.id}</small>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            // fallback: use local example list or your TemplatesList component
            <div className="gb-templates-grid">
              {/* If you have TemplatesList component, render it here */}
              {TemplatesList ? (
                <TemplatesList onOpen={(id) => window.location.href = `/templates/${id}`} />
              ) : (
                exampleTemplates.map(t => (
                  <a key={t.id} className="gb-card" href={`/templates/${t.id}`}>
                    <div className="gb-card-thumb">🚀</div>
                    <div className="gb-card-body">
                      <strong>{t.title}</strong>
                      <small>{t.id}</small>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="gb-footer" role="contentinfo">
        <div className="gb-footer-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 18px' }}>
          <small>© {new Date().getFullYear()} Game Builder — Built with care.</small>
        </div>
      </footer>
    </div>
  );
}
