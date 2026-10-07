"use client";

export const db = Object.freeze({ source: "admin-api" });

const clientApiCache = new Map();
const inFlightClientRequests = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60s
const STALE_TTL_MS = 10 * 60 * 1000; // 10m

export function doc(_db, ...segments) {
  return { kind: "doc", path: segments.filter(Boolean).map(String) };
}

export function collection(_db, ...segments) {
  return { kind: "collection", path: segments.filter(Boolean).map(String) };
}

function pageForPath(path) {
  const parts = path || [];
  if (parts[0] === "websites" && parts[2] === "pages" && parts[3]) return { type: parts[3], pageType: parts[3] };
  if (parts[0] === "websites" && parts[2] === "districts" && parts[3]) return { type: "district", pageType: "district", district: parts[3] };
  if (parts[0] === "__website__" && parts[1] === "pages" && parts[2]) return { type: parts[2], pageType: parts[2] };
  if (parts[0] === "__website__" && parts[1] === "districts" && parts[2]) return { type: "district", pageType: "district", district: parts[2] };
  return null;
}

async function readJson(url, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === "GET";

  if (!isGet) {
    const response = await fetch(url, {
      ...options,
      headers: { Accept: "application/json", ...(options.headers || {}) },
    });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!response.ok || body?.ok === false) throw new Error(`API ${response.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
    return body;
  }

  const cacheKey = url;
  const now = Date.now();
  const cached = clientApiCache.get(cacheKey);

  // 1. Fresh cache hit
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Stale cache exists -> return immediately, background refresh
  if (cached && now - cached.timestamp < STALE_TTL_MS) {
    if (!inFlightClientRequests.has(cacheKey)) {
      const bgPromise = fetch(url, {
        headers: { Accept: "application/json", ...(options.headers || {}) },
      })
        .then((res) => res.text())
        .then((text) => (text ? JSON.parse(text) : null))
        .then((fresh) => {
          clientApiCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
          return fresh;
        })
        .catch((err) => console.warn(`[client-api] Background refresh error for ${url}:`, err))
        .finally(() => inFlightClientRequests.delete(cacheKey));
      inFlightClientRequests.set(cacheKey, bgPromise);
    }
    return cached.data;
  }

  // 3. Request deduplication
  if (inFlightClientRequests.has(cacheKey)) {
    return inFlightClientRequests.get(cacheKey);
  }

  const fetchPromise = fetch(url, {
    headers: { Accept: "application/json", ...(options.headers || {}) },
  })
    .then(async (response) => {
      const text = await response.text();
      let body = null;
      try { body = text ? JSON.parse(text) : null; } catch { body = text; }
      if (!response.ok || body?.ok === false) {
        throw new Error(`API ${response.status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
      }
      clientApiCache.set(cacheKey, { data: body, timestamp: Date.now() });
      return body;
    })
    .catch((err) => {
      if (cached?.data) return cached.data;
      throw err;
    })
    .finally(() => inFlightClientRequests.delete(cacheKey));

  inFlightClientRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function getDoc(reference) {
  const query = pageForPath(reference?.path);
  if (!query) return { exists: () => false, data: () => undefined, id: reference?.path?.at(-1) || "" };
  const params = new URLSearchParams(query);
  const body = await readJson(`/api/site-data?${params.toString()}`);
  const data = body?.data ?? body ?? null;
  return { exists: () => data !== null && data !== undefined, data: () => data, id: reference.path.at(-1) || "" };
}

function snapshotFromRows(rows) {
  const safe = Array.isArray(rows) ? rows : [];
  const docs = safe.map((row, index) => {
    const data = row?.data ?? row ?? {};
    const id = row?.id || data?.id || data?.uid || data?.productId || data?.slug || `row-${index}`;
    return { id, data: () => data, exists: () => true };
  });
  return { docs, empty: docs.length === 0, size: docs.length, forEach: (fn) => docs.forEach(fn) };
}

export async function getDocs(reference) {
  const path = reference?.path || [];
  if (path[0] === "websites" && path[2] === "districts") {
    const body = await readJson("/api/site-data?districts=1");
    return snapshotFromRows(body?.data?.districts ?? body?.districts ?? body?.data ?? body);
  }
  const body = await readJson("/api/catalog");
  const rows = body?.products ?? body?.data?.products ?? body?.data ?? body;
  return snapshotFromRows(rows);
}

export async function addDoc(reference, data = {}) {
  const path = reference?.path || [];
  const last = path.at(-1);
  const endpoint = last === "contactQueries" ? "/api/contact-query" : last === "productQueries" ? "/api/product-query" : "/api/contact-query";
  const result = await readJson(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { id: result?.id || result?.data?.id || `query-${Date.now()}`, ...result };
}

export function onSnapshot(reference, onNext, onError) {
  let active = true;
  let timer = null;
  const run = async () => {
    try {
      const snapshot = await getDocs(reference);
      if (active) onNext(snapshot);
    } catch (error) {
      if (active && onError) onError(error);
    }
  };
  run();
  timer = setInterval(run, 30000);
  return () => { active = false; if (timer) clearInterval(timer); };
}
