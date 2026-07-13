# Snip

A tiny URL shortener built as three independent layers, each living on its own
git branch and wired together here as submodules.

```
main  (this branch)
├── backend/   ← branch: backend   Bun HTTP server, zero npm deps
├── frontend/  ← branch: frontend  Angular 19 SPA
└── cli/       ← branch: cli       Node.js CLI, zero npm deps
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                  Backend                    │
│   POST /api/links  GET /api/links  GET /:code│
└────────────┬───────────────┬────────────────┘
             │               │
     ┌───────▼──────┐ ┌──────▼───────┐
     │   Frontend   │ │     CLI      │
     │  Angular SPA │ │  Node.js CLI │
     └──────────────┘ └──────────────┘
```

One backend, two clients. The browser app and the terminal tool both talk to the
same three-endpoint HTTP API.

---

## API contract

| Method | Path            | Body / params               | Success                                    | Errors          |
|--------|-----------------|-----------------------------|--------------------------------------------|-----------------|
| POST   | `/api/links`    | `{ "url": "https://…" }`    | 201 `{ code, url, shortUrl, hits, createdAt }` | 400 bad URL |
| GET    | `/api/links`    | —                           | 200 array of link objects                  | —               |
| GET    | `/:code`        | —                           | 302 → original URL (increments `hits`)     | 404 unknown     |

All endpoints include open CORS headers. `shortUrl` is built from `BASE_URL`
(env var) or `https://$RAILWAY_PUBLIC_DOMAIN`, falling back to
`http://localhost:PORT`.

---

## Branch-per-layer layout

Each concern lives on an isolated, orphan git branch — no shared history:

| Branch     | Contents                                     |
|------------|----------------------------------------------|
| `backend`  | `server.js`, `package.json`, `README.md`     |
| `frontend` | Angular 19 app (`src/`, `angular.json`, …)   |
| `cli`      | `cli.js`, wrappers, `package.json`, `README.md` |
| `main`     | This file + `.gitmodules` (superproject only) |

The `main` branch contains **no source code** — only the submodule pointers and
this README.

---

## Cloning

A plain `git clone` leaves the three submodule folders **empty**. Always clone
with the recurse flag:

```bash
git clone --recurse-submodules https://github.com/flightwhale88/aisdlctest/
```

To populate submodules after a plain clone:

```bash
git submodule update --init --recursive
```

---

## Running all three pieces

### 1 — Backend (requires [Bun](https://bun.sh))

```bash
cd backend
bun run server.js
# Listening on http://localhost:3000
```

Optional env vars: `PORT`, `BASE_URL`, `PUBLIC_DIR` (serve static files from a
folder — point it at `frontend/dist/snip-frontend/browser` to serve the SPA).

### 2 — Frontend (requires Node ≥ 18 + npm)

```bash
cd frontend
npm install
npx ng serve
# Open http://localhost:4200
```

Or serve the production build through the backend:

```bash
cd frontend && npx ng build
# then restart backend with:
PUBLIC_DIR=../frontend/dist/snip-frontend/browser bun run ../backend/server.js
```

### 3 — CLI (requires Node ≥ 18)

```bash
cd cli
npm install -g .   # installs the `snip` binary globally

snip add https://example.com/long/path
snip ls
snip open <code>
```

Without a global install, run directly:

```bash
node cli/cli.js add https://example.com
```

Set `SNIP_API` to point at a remote backend:

```bash
SNIP_API=https://snip.example.com snip ls
```

---

## Updating a submodule

When you push new commits on a layer branch, bump the superproject pointer:

```bash
# 1. Work inside the submodule as a normal repo
cd backend
# … make changes …
git add . && git commit -m "fix: something"
git push

# 2. Back in the superproject, advance the pointer
cd ..
git submodule update --remote backend
git add backend
git commit -m "chore: bump backend submodule"
git push
```

The same workflow applies to `frontend` and `cli`.
