# Snip – backend

Tiny URL shortener API. Single-file Bun server, no npm dependencies.

## Run

```bash
bun run server.js
# or
bun start
```

## Environment variables

| Variable               | Default                              | Purpose                                       |
|------------------------|--------------------------------------|-----------------------------------------------|
| `PORT`                 | `3000`                               | TCP port to listen on                         |
| `BASE_URL`             | derived (see below)                  | Origin used in `shortUrl` values              |
| `RAILWAY_PUBLIC_DOMAIN`| –                                    | Fallback origin when `BASE_URL` is not set    |
| `PUBLIC_DIR`           | –                                    | Optional directory to serve static files from |

`BASE_URL` resolution order:
1. `$BASE_URL`
2. `https://$RAILWAY_PUBLIC_DOMAIN` (if set)
3. `http://localhost:$PORT`

## API

### `POST /api/links`
Body: `{ "url": "https://example.com" }`  
Returns **201** `{ code, url, shortUrl, hits, createdAt }`  
Returns **400** on invalid JSON or non-http(s) URL.

### `GET /api/links`
Returns **200** array of all links (same shape).

### `GET /:code`
Redirects (**302**) to the original URL and increments `hits`.  
Returns **404** if the code is unknown.

## Static file serving

When `PUBLIC_DIR` is set the server also serves files from that directory.  
`GET /` maps to `index.html`. A matching file takes priority over a short code.
