// src/components/SpaceShooterEmbed.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { createEngine } from '../engines/spaceEngine';

/**
 * Props:
 *  - style: { width, height }
 *  - autoStart: boolean
 *  - musicURL: string|null
 *  - loadTemplate: object|null
 *  - onEnemyKilled: fn
 *  - onGameOver: fn
 *  - onReady: fn(engine)  <-- receives engine instance when ready
 */
export default function SpaceShooterEmbed({
  style = { width: '100%', height: '600px' },
  autoStart = false,
  musicURL = null,
  loadTemplate = null,
  onEnemyKilled = null,
  onGameOver = null,
  onReady = null,
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const handlersRef = useRef([]);

  // create engine once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const eng = createEngine({ container, width: 1024, height: 720, audio: true });
    engineRef.current = eng;

    // call onReady once engine is created
    if (typeof onReady === 'function') {
      try { onReady(eng); } catch (e) { console.warn('onReady callback failed', e); }
    }

    // initial template load (if provided)
    if (loadTemplate) {
      try { eng.loadState?.(loadTemplate); } catch (e) { console.warn('loadTemplate failed', e); }
    }

    // initial music setup
    if (musicURL) {
      try {
        if (eng.bg) eng.bg.musicURL = musicURL;
        if (typeof eng.startMusic === 'function') eng.startMusic().catch(()=>{});
      } catch (e) { console.warn('music wiring failed', e); }
    }

    // start if requested
    try { if (autoStart && typeof eng.start === 'function') eng.start(); } catch (e) { console.warn('engine.start failed', e); }

    // cleanup on unmount
    return () => {
      try {
        // remove any registered handlers if engine exposes off/removeListener
        handlersRef.current.forEach(([evt, fn]) => {
          try {
            if (eng.off) eng.off(evt, fn);
            else if (eng.removeListener) eng.removeListener(evt, fn);
          } catch (e) {}
        });
      } catch (e) {}
      try { if (eng.stop) eng.stop(); } catch (e) {}
      try { if (eng.destroy) eng.destroy(); } catch (e) { console.warn('engine.destroy failed', e); }
      engineRef.current = null;
      handlersRef.current = [];
    };
    // eslint-disable-next-line
  }, []); // run once

  // Register/unregister event listeners when callbacks change
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;

    // cleanup previous
    handlersRef.current.forEach(([evt, fn]) => {
      try {
        if (eng.off) eng.off(evt, fn);
        else if (eng.removeListener) eng.removeListener(evt, fn);
      } catch (e) {}
    });
    handlersRef.current = [];

    if (typeof onEnemyKilled === 'function') {
      try {
        eng.on?.('onEnemyKilled', onEnemyKilled);
        handlersRef.current.push(['onEnemyKilled', onEnemyKilled]);
      } catch (e) { console.warn('register onEnemyKilled failed', e); }
    }
    if (typeof onGameOver === 'function') {
      try {
        eng.on?.('onGameOver', onGameOver);
        handlersRef.current.push(['onGameOver', onGameOver]);
      } catch (e) { console.warn('register onGameOver failed', e); }
    }

    // no cleanup function needed here because we cleaned above and final cleanup will happen on unmount

  }, [onEnemyKilled, onGameOver]);

  // respond to loadTemplate changes (without recreating engine)
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    if (!loadTemplate) return;
    try {
      if (typeof eng.loadState === 'function') {
        eng.loadState(loadTemplate);
      } else {
        // fallback: try applying fields manually if engine supports custom API
        console.warn('Engine does not expose loadState; template not applied automatically.');
      }
    } catch (e) {
      console.warn('loadTemplate failed', e);
    }
  }, [loadTemplate?.id, loadTemplate]); // watch id + identity

  // respond to musicURL changes
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    try {
      if (eng.bg) eng.bg.musicURL = musicURL;
      if (musicURL && typeof eng.startMusic === 'function') eng.startMusic().catch(()=>{});
    } catch (e) { console.warn('music wiring failed', e); }
  }, [musicURL]);

  // respond to autoStart changes
  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    try {
      if (autoStart && typeof eng.start === 'function') eng.start();
      else if (!autoStart && typeof eng.stop === 'function') eng.stop();
    } catch (e) { console.warn('engine start/stop failed on autoStart change', e); }
  }, [autoStart]);

  // safe control callbacks
  const handleStart = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    try { if (typeof eng.start === 'function') eng.start(); } catch (e) { console.warn('engine.start failed', e); }
  }, []);
  const handleStop = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    try { if (typeof eng.stop === 'function') eng.stop(); } catch (e) { console.warn('engine.stop failed', e); }
  }, []);
  const handleDestroy = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    try { if (typeof eng.destroy === 'function') eng.destroy(); } catch (e) { console.warn('engine.destroy failed', e); }
  }, []);

  // container style fallback
  const mergedStyle = {
    position: 'relative',
    width: style.width || '100%',
    height: style.height || '600px',
    minHeight: '320px',
  };

  // render overlay controls in React (avoids manual DOM mutations)
  return (
    <div style={{ position: 'relative', width: mergedStyle.width }} >
      <div
        ref={containerRef}
        style={mergedStyle}
        role="region"
        aria-label="Space shooter preview"
      />
      <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 999, display: 'flex', gap: 8 }}>
        <button type="button" onClick={handleStart} className="btn primary">Start</button>
        <button type="button" onClick={handleStop} className="btn ghost">Stop</button>
        <button type="button" onClick={handleDestroy} className="btn ghost">Destroy</button>
      </div>
    </div>
  );
}
