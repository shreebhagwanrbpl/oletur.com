import "server-only";

import { WEBSITE_ID, COMPANY_ID } from "./catalog-utils";

export const ADMIN_API_BASE_URL = (
  process.env.ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_URL ||
  "https://admin.rajbiosis.app"
).replace(/\/+$/, "");

// High-speed In-Memory Cache with Stale-While-Revalidate
const memoryCache = new Map();
const inFlightRequests = new Map();

const CACHE_TTL_MS = 60 * 1000; // 60 seconds fresh TTL
const STALE_TTL_MS = 60 * 60 * 1000; // 60 minutes stale-while-revalidate window

function buildUrl(pathname, params = {}) {
  const path = String(pathname || "");
  const url = new URL(
    `${ADMIN_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  );

  const query = {
    websiteId: WEBSITE_ID,
    companyId: COMPANY_ID,
    ...params,
  };

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

async function executeAdminFetch(urlStr, options = {}) {
  const response = await fetch(urlStr, {
    ...options,
    next: { revalidate: 60 },
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok || body?.success === false || body?.ok === false) {
    const message = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`Admin API ${response.status}: ${message}`);
  }

  return body;
}

export async function adminFetch(pathname, options = {}, params = {}) {
  const isGet = !options.method || options.method.toUpperCase() === "GET";

  if (!isGet) {
    const fullUrl = buildUrl(pathname, params).toString();
    return executeAdminFetch(fullUrl, options);
  }

  const cacheKey = buildUrl(pathname, params).toString();
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  // 1. Fresh cache hit (< 60s) -> Return immediately (0ms)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Stale cache exists -> Return stale immediately, trigger background refresh
  if (cached && now - cached.timestamp < STALE_TTL_MS) {
    if (!inFlightRequests.has(cacheKey)) {
      const backgroundPromise = executeAdminFetch(cacheKey, options)
        .then((freshData) => {
          memoryCache.set(cacheKey, { data: freshData, timestamp: Date.now() });
          return freshData;
        })
        .catch((err) => {
          // Silent background fallback
        })
        .finally(() => {
          inFlightRequests.delete(cacheKey);
        });
      inFlightRequests.set(cacheKey, backgroundPromise);
    }
    return cached.data;
  }

  // 3. No cache or completely expired -> Deduplicate in-flight requests
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = executeAdminFetch(cacheKey, options)
    .then((data) => {
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    })
    .catch((err) => {
      // If we have any cached data at all, return it on failure
      if (cached?.data) {
        return cached.data;
      }
      return null;
    })
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function postAdminQuery(endpoint, payload = {}) {
  return adminFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      websiteId: WEBSITE_ID,
      companyId: COMPANY_ID,
      ...payload,
    }),
  });
}

export async function fetchCatalogFromAdmin() {
  const response = await adminFetch("/api/catalog");
  const products =
    response?.products ??
    response?.data?.products ??
    response?.data ??
    response;
  return Array.isArray(products) ? products : [];
}
