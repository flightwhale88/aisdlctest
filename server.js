// Snip – tiny URL shortener  (Bun, zero npm deps)

const PORT     = Number(process.env.PORT) || 3000;
const BASE_URL = process.env.BASE_URL
  || (process.env.RAILWAY_PUBLIC_DOMAIN
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `http://localhost:${PORT}`);
const PUBLIC_DIR = process.env.PUBLIC_DIR || null;

/** @type {Map<string, {code:string, url:string, hits:number, createdAt:string}>} */
const links = new Map();

// ── helpers ────────────────────────────────────────────────────────────────

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function randomCode(len = 6) {
  let code = '';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) code += BASE62[b % 62];
  return code;
}

function isValidUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

function linkShape(entry) {
  return {
    code:     entry.code,
    url:      entry.url,
    shortUrl: `${BASE_URL}/${entry.code}`,
    hits:     entry.hits,
    createdAt: entry.createdAt,
  };
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ── static file helper ─────────────────────────────────────────────────────

async function serveStatic(pathname) {
  if (!PUBLIC_DIR) return null;

  // normalise: "/" -> "index.html"
  let rel = pathname === '/' ? 'index.html' : pathname.slice(1);
  // prevent path traversal
  if (rel.includes('..') || rel.startsWith('/')) return null;

  const filePath = `${PUBLIC_DIR}/${rel}`;
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;

  return new Response(file, { headers: CORS_HEADERS });
}

// ── request handler ────────────────────────────────────────────────────────

async function handler(req) {
  const url      = new URL(req.url);
  const pathname = url.pathname;
  const method   = req.method.toUpperCase();

  // preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ── POST /api/links ──────────────────────────────────────────────────────
  if (method === 'POST' && pathname === '/api/links') {
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }

    const target = typeof body?.url === 'string' ? body.url.trim() : '';
    if (!isValidUrl(target)) {
      return json({ error: 'url must be an http or https URL' }, 400);
    }

    let code;
    do { code = randomCode(); } while (links.has(code));

    const entry = { code, url: target, hits: 0, createdAt: new Date().toISOString() };
    links.set(code, entry);
    return json(linkShape(entry), 201);
  }

  // ── GET /api/links ───────────────────────────────────────────────────────
  if (method === 'GET' && pathname === '/api/links') {
    return json([...links.values()].map(linkShape));
  }

  // ── Static files win over short codes ────────────────────────────────────
  if (method === 'GET') {
    const staticRes = await serveStatic(pathname);
    if (staticRes) return staticRes;
  }

  // ── GET /:code  (redirect) ───────────────────────────────────────────────
  if (method === 'GET' && pathname.length > 1) {
    const code  = pathname.slice(1);
    const entry = links.get(code);
    if (entry) {
      entry.hits++;
      return Response.redirect(entry.url, 302);
    }
    return json({ error: 'Not found' }, 404);
  }

  return json({ error: 'Not found' }, 404);
}

// ── start ──────────────────────────────────────────────────────────────────

Bun.serve({ port: PORT, fetch: handler });
console.log(`Snip listening on ${BASE_URL}  (port ${PORT})`);
