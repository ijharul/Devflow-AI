import axios from 'axios';

const isDev = import.meta.env.DEV;
const apiClient = axios.create({
  baseURL: isDev ? '/api' : (import.meta.env.VITE_API_URL || '/api'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 90000,
});

/* ── In-memory GET cache ──────────────────────────────────── */
const cache = new Map();
const CACHE_TTL = 60_000; // 1 minute

function cacheKey(config) {
  return `${config.url}?${config.params ? new URLSearchParams(config.params).toString() : ''}`;
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) cache.delete(oldest[0]);
  }
}

export function invalidateCache(urlPrefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(urlPrefix)) cache.delete(key);
  }
}

/* ── Request interceptor ────────────────────────────────────── */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('devflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.method === 'get' && config.cache !== false) {
    const key = cacheKey(config);
    const cached = getCache(key);
    if (cached) {
      config._cached = true;
      config._cachedData = cached;
    }
  }
  return config;
});

/* ── Response interceptor ───────────────────────────────────── */
apiClient.interceptors.response.use(
  (res) => {
    if (res.config.method === 'get' && res.config.cache !== false) {
      setCache(cacheKey(res.config), res);
    }
    return res;
  },
  (err) => {
    if (err.config?._cached) {
      return Promise.resolve(err.config._cachedData);
    }

    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      'Something went wrong';

    if (err.response?.status === 401) {
      localStorage.removeItem('devflow_token');
      localStorage.removeItem('devflow_user');
      if (window.location.pathname !== '/login' && !err.config.url.includes('/auth/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

/* Wrap get to support short-circuit on cache hit */
const _get = apiClient.get.bind(apiClient);
apiClient.get = (url, config = {}) => {
  const token = localStorage.getItem('devflow_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const merged = { ...config, headers: { ...headers, ...config.headers } };
  const key = `${url}?${merged.params ? new URLSearchParams(merged.params).toString() : ''}`;
  const cached = getCache(key);
  if (cached && config.cache !== false) return Promise.resolve(cached);
  return _get(url, { ...merged, cache: config.cache });
};

export default apiClient;
