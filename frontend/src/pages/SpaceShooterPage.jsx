// src/pages/SpaceShooterPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import SpaceShooterEmbed from '../components/SpaceShooterEmbed';
import { fetchTemplate, saveTemplate } from '../utils/editor-integration';

const DEFAULT_TEMPLATE = {
  meta: { name: 'Space Shooter', type: 'space-shooter' },
  score: 0,
  lives: 3,
  level: 1,
  player: { x: 512, y: 600 },
  enemies: [{ x: 220, y: 80, r: 18, hp: 1 }],
  assets: {}
};

export default function SpaceShooterPage() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const engineRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const t = await fetchTemplate('space-shooter');
        // fetchTemplate will throw on HTTP errors (per your helper),
        // but guard in case it returns unexpected data
        if (t && typeof t === 'object') {
          if (mountedRef.current) setTemplate(t);
        } else if (mountedRef.current) {
          setTemplate(DEFAULT_TEMPLATE);
        }
      } catch (err) {
        console.warn('Failed to load template "space-shooter":', err);
        if (mountedRef.current) {
          setError(err);
          setTemplate(DEFAULT_TEMPLATE);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, []); // run once

  // cleanup engine on unmount
  useEffect(() => {
    return () => {
      const eng = engineRef.current;
      if (eng) {
        try {
          // If engine provides off/unsubscribe helpers, call them earlier where you subscribe.
          // Destroy the engine instance and null the ref to prevent leaks.
          typeof eng.destroy === 'function' && eng.destroy();
        } catch (e) {
          console.warn('Engine destroy failed during unmount', e);
        }
        engineRef.current = null;
      }
    };
  }, []);

  async function handleSave() {
    const eng = engineRef.current;
    if (!eng) {
      return alert('Engine is not ready yet. Please wait for the preview to initialize.');
    }

    if (typeof eng.serializeState !== 'function') {
      console.warn('serializeState not available on engine', eng);
      return alert('Cannot serialize engine state: serializeState() missing.');
    }

    setSaving(true);
    try {
      const json = eng.serializeState();
      // merge meta from current template if not present
      if (!json.meta) json.meta = (template && template.meta) ? template.meta : DEFAULT_TEMPLATE.meta;

      // saveTemplate will throw if HTTP response is not OK (see your helper)
      const resJson = await saveTemplate('space-shooter', json);
      // assume API returns an object — show friendly message
      alert('Template saved successfully.');
      // optionally update local template state to reflect saved state
      setTemplate(prev => (prev ? { ...prev, ...json } : json));
      return resJson;
    } catch (e) {
      console.warn('Save failed', e);
      // If your saveTemplate throws a detailed error, show it
      alert('Save failed: ' + (e?.message || 'Unknown error'));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  function handleOnReady(engine) {
    // engine is the low-level engine instance returned by createEngine()
    engineRef.current = engine;
    // Consumers may want a convenient serializeState for saving:
    if (typeof engine.serializeState !== 'function') {
      console.warn('Engine does not expose serializeState() — saving will not be available.');
    }
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Loading template…</div>;
  }

  return (
    <div style={{ padding: 18 }}>
      <h1>Space Shooter — Editor / Preview</h1>

      {error && (
        <div style={{ marginBottom: 12, color: 'salmon' }}>
          Warning: failed to load saved template, using fallback. ({String(error?.message || error)})
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving || !engineRef.current}
          style={{ padding: '8px 12px' }}
          aria-disabled={saving || !engineRef.current}
          title={!engineRef.current ? 'Preview is still initializing' : 'Save current template state'}
        >
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>

      <div style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, overflow: 'hidden', height: 680 }}>
        <SpaceShooterEmbed
          autoStart={true}
          loadTemplate={template}
          onReady={handleOnReady}
          onEnemyKilled={(e) => console.log('enemy killed', e)}
          onGameOver={(score) => console.log('game over', score)}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
