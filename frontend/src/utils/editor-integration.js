// src/utils/editor-integration.js
const RAW_API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3001";

/**
 * Normalizes base + path into a single URL string.
 * Ensures there is exactly one slash between base and path.
 */
function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
}

/**
 * Low-level request helper
 * opts:
 *  - method, headers, body, signal, timeout (ms), rawResponse (bool)
 *  - authToken (string) - if provided, attaches Authorization: Bearer <token>
 */
async function request(path, opts = {}) {
  const {
    timeout = 15000,
    rawResponse = false,
    authToken,
    ...fetchOpts
  } = opts;

  const url = joinUrl(RAW_API_BASE, path);

  const controller = new AbortController();
  const timeoutId = timeout ? setTimeout(() => controller.abort(), timeout) : null;
  // merge signals (if caller supplied signal, we should respect it too)
  if (fetchOpts.signal) {
    // If caller passed a signal, we will abort if either the caller aborts or our timeout hits.
    // Create a small helper: if caller aborts, also abort controller.
    const callerSignal = fetchOpts.signal;
    if (callerSignal.aborted) controller.abort();
    const onAbort = () => controller.abort();
    callerSignal.addEventListener('abort', onAbort);
    // ensure we remove the listener later
    fetchOpts._callerAbortListener = onAbort;
  }

  // Headers: ensure object, allow caller to pass headers
  fetchOpts.headers = Object.assign({}, fetchOpts.headers || {});
  if (authToken) fetchOpts.headers['Authorization'] = `Bearer ${authToken}`;

  // Attach our controller's signal
  fetchOpts.signal = controller.signal;

  let res;
  try {
    res = await fetch(url, fetchOpts);
  } catch (err) {
    // normalize abort error for consumer
    if (err.name === 'AbortError') {
      throw new Error(`Request aborted (timeout ${timeout}ms or cancelled) for ${url}`);
    }
    console.warn('API request network error', err);
    throw err;
  } finally {
    // cleanup timeout and any attached listener
    if (timeoutId) clearTimeout(timeoutId);
    if (fetchOpts._callerAbortListener && fetchOpts.signal && fetchOpts.signal.removeEventListener) {
      try { fetchOpts.signal.removeEventListener('abort', fetchOpts._callerAbortListener); } catch(e){ /* ignore */ }
    }
  }

  // If response is not ok, capture body text (if available) to help debugging
  if (!res.ok) {
    let bodyText = null;
    try {
      bodyText = await res.text();
    } catch (e) {
      // ignore parse errors
    }
    const err = new Error(`HTTP ${res.status} ${res.statusText}${bodyText ? ` - ${bodyText}` : ''}`);
    err.status = res.status;
    err.body = bodyText;
    err.response = res;
    console.warn('API request returned error', err);
    throw err;
  }

  if (rawResponse) return res;

  // try parse JSON, but handle empty responses gracefully
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    // not JSON — return text
    const text = await res.text();
    return text;
  }

  // JSON
  try {
    return await res.json();
  } catch (e) {
    // JSON parse failed — surface helpful error
    const text = await res.text().catch(()=>null);
    const parseErr = new Error(`Failed to parse JSON response from ${url}${text ? ` — body: ${text}` : ''}`);
    parseErr.response = res;
    console.warn(parseErr);
    throw parseErr;
  }
}

/* Public helpers (maintain simple API) */

export async function fetchTemplate(name, opts = {}) {
  if (!name) throw new Error('fetchTemplate: template name required');
  // opts may include timeout, authToken, rawResponse etc.
  return await request(`/api/templates/${encodeURIComponent(name)}`, { method: 'GET', ...opts });
}

export async function saveTemplate(name, json, opts = {}) {
  if (!name) throw new Error('saveTemplate: template name required');
  if (typeof json === 'undefined') throw new Error('saveTemplate: json payload required');

  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  // large payloads: consider gzip compression on server; fetch will send as-is
  return await request(`/api/templates/${encodeURIComponent(name)}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(json),
    ...opts
  });
}
