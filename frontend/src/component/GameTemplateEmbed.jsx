// src/components/GameTemplateEmbed.jsx
import React, { useEffect, useRef } from 'react';
import { createEngine } from '../engine/spaceEngine';

// adapters map: extend later to adapt template data into engine calls
const adapters = {
  'space-shooter': {
    apply: (engine, template) => engine.loadState?.(template),
  },
  'platformer': {
    apply: (engine, template) => engine.loadState?.(template),
  },
  'racing': {
    apply: (engine, template) => engine.loadState?.(template),
  },
  'rpg': {
    apply: (engine, template) => engine.loadState?.(template),
  }
};

export default function GameTemplateEmbed({
  template,
  type = 'space-shooter',
  autoStart = false,
  onEnemyKilled = null,
  onGameOver = null,
  onReady = null
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // create engine once on mount, destroy on unmount
  useEffect(() => {
    if (!containerRef.current) return;

    const eng = createEngine({ container: containerRef.current, audio: true });
    engineRef.current = eng;

    // call onReady once engine is created
    if (typeof onReady === 'function') {
      try { onReady(eng); } catch (e) { console.warn('onReady handler error', e); }
    }

    // cleanup: stop & destroy engine
    return () => {
      try {
        if (eng.stop) eng.stop();
      } catch (e) { console.warn('engine.stop failed', e); }
      try {
        if (eng.destroy) eng.destroy();
      } catch (e) { console.warn('engine.destroy failed', e); }
      engineRef.current = null;
    };
    // NOTE: intentionally only run once on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // attach/detach event listeners whenever callbacks change
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;

    const handlers = [];

    if (typeof onEnemyKilled === 'function') {
      eng.on?.('onEnemyKilled', onEnemyKilled);
      handlers.push(['onEnemyKilled', onEnemyKilled]);
    }
    if (typeof onGameOver === 'function') {
      eng.on?.('onGameOver', onGameOver);
      handlers.push(['onGameOver', onGameOver]);
    }

    return () => {
      // remove handlers on cleanup
      handlers.forEach(([evt, fn]) => {
        try {
          if (eng.off) eng.off(evt, fn);
          else if (eng.removeListener) eng.removeListener(evt, fn);
        } catch (e) {
          // graceful fallback if engine doesn't support off/removeListener pair
        }
      });
    };
  }, [onEnemyKilled, onGameOver]);

  // apply template / type changes without recreating engine
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng || !template) return;

    try {
      const adapter = adapters[type];
      if (adapter && typeof adapter.apply === 'function') {
        adapter.apply(eng, template);
      } else if (eng.loadState) {
        eng.loadState(template);
      } else {
        console.warn('Engine does not expose loadState and no adapter found for type', type);
      }

      // optionally start the engine after applying a template
      if (autoStart && typeof eng.start === 'function') {
        try { eng.start(); } catch (e) { console.warn('engine.start failed', e); }
      }
    } catch (e) {
      console.error('Failed to apply template to engine', e);
    }
  // We watch meaningful fields only: template.id or template.version if available,
  // otherwise fall back to template object identity (last resort).
  // This reduces unnecessary reloads when callers re-create props frequently.
  }, [type, autoStart, template?.id, template?.version, template]);

  // Basic container style ensures engine has visible space by default.
  // Prefer giving parent an explicit height in CSS. We provide a safe fallback here.
  const style = {
    width: '100%',
    height: '100%',
    minHeight: '340px',
    position: 'relative'
  };

  return (
    <div
      ref={containerRef}
      style={style}
      role="region"
      aria-label={template?.title ? `Preview: ${template.title}` : 'Game preview'}
      tabIndex={-1}
    />
  );
}
