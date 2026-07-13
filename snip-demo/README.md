# Snip Backend

Snip is a tiny URL shortener backend built as a single-file Bun server with no npm dependencies and in-memory link storage.

## Run

```bash
bun run server.js
# or
bun start
```

## API

- `POST /api/links` with `{ "url": "https://example.com" }` creates a short link
- `GET /api/links` returns all stored links
- `GET /:code` redirects to the original URL and increments its hit counter

## Environment variables

- `PORT` — server port, defaults to `3000`
- `BASE_URL` — base origin used to build `shortUrl`
- `RAILWAY_PUBLIC_DOMAIN` — used as `https://<domain>` when `BASE_URL` is unset
- `PUBLIC_DIR` — optional directory for serving static files, including `/` → `index.html`
