import { existsSync, statSync } from "node:fs";
import path from "node:path";

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = process.env.PUBLIC_DIR;
const BASE_URL = (() => {
  const configured =
    process.env.BASE_URL ||
    (process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : `http://localhost:${PORT}`);

  return configured.replace(/\/+$/, "");
})();

const links = new Map();
const base62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function withCors(response) {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: corsHeaders,
  });
}

function error(message, status) {
  return json({ error: message }, status);
}

function randomCode() {
  let code = "";
  const maxUnbiasedValue = Math.floor(256 / base62.length) * base62.length;

  while (code.length < 6) {
    const [value] = crypto.getRandomValues(new Uint8Array(1));

    if (value >= maxUnbiasedValue) {
      continue;
    }

    code += base62[value % base62.length];
  }

  return code;
}

function createCode() {
  let code = randomCode();

  while (links.has(code)) {
    code = randomCode();
  }

  return code;
}

function buildLink(url) {
  const code = createCode();
  const link = {
    code,
    url,
    shortUrl: `${BASE_URL}/${code}`,
    hits: 0,
    createdAt: new Date().toISOString(),
  };

  links.set(code, link);
  return link;
}

function parseHttpUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}

function resolveStaticFile(url) {
  if (!PUBLIC_DIR) {
    return null;
  }

  const relativePath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const publicRoot = path.resolve(PUBLIC_DIR);
  const filePath = path.resolve(publicRoot, `.${relativePath}`);

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
    return null;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }

  return Bun.file(filePath);
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (request.method === "POST" && url.pathname === "/api/links") {
      let body;

      try {
        body = await request.json();
      } catch {
        return error("Invalid JSON", 400);
      }

      const parsedUrl = parseHttpUrl(body?.url);
      if (!parsedUrl) {
        return error("URL must use http or https", 400);
      }

      return json(buildLink(parsedUrl.toString()), 201);
    }

    if (request.method === "GET" && url.pathname === "/api/links") {
      return json([...links.values()]);
    }

    if (request.method === "GET") {
      const staticFile = resolveStaticFile(url);
      if (staticFile) {
        return withCors(new Response(staticFile));
      }

      const code = url.pathname.slice(1);
      if (!code || code.includes("/")) {
        return withCors(new Response("Not found", {
          status: 404,
        }));
      }

      const link = links.get(code);
      if (!link) {
        return withCors(new Response("Not found", {
          status: 404,
        }));
      }

      link.hits += 1;
      return withCors(Response.redirect(link.url, 302));
    }

    return withCors(new Response("Method not allowed", {
      status: 405,
    }));
  },
});

console.log(`Snip backend listening on ${server.url}`);
