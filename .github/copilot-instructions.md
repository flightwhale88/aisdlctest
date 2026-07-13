# copilot-instructions.md — Snip Development Rules (GitHub Copilot)

**Mirror**: Keep this file in sync with `/CLAUDE.md`

## What This Is

Snip is a **superproject** (main branch) with **4 submodules**, one per layer:
- **backend/** (branch: `backend`) — Bun HTTP server, in-memory link storage
- **frontend/** (branch: `frontend`) — Angular 19 standalone components, signals-based state
- **cli/** (branch: `cli`) — Node.js CommonJS CLI tool (snip add/ls/open)
- **bundle/** (branch: `bundle`) — Generated production bundle (DO NOT HAND-EDIT)

## Tech Stack & Layout

| Layer | Tech | Entry | Output |
|-------|------|-------|--------|
| **Backend** | Bun + Node.js | `backend/server.js` | API: POST/GET /api/links, GET /:code |
| **Frontend** | Angular 19 | `frontend/src/app/app.component.ts` | Build → `frontend/dist/snip-frontend/browser/` |
| **CLI** | Node.js CommonJS | `cli/cli.js` | Standalone executable (no "type":"module") |
| **Bundle** | Bun + Dockerfile | `bundle/server.js` | Production app: bun start or docker run |

## API Contract (Change Everywhere or Nowhere)

```
POST /api/links
  Request: { "url": "https://..." }
  Response: { "code": "abc123", "shortUrl": "http://localhost:3000/abc123", "hits": 0 }

GET /api/links
  Response: [{ "url": "...", "code": "...", "shortUrl": "...", "hits": N }, ...]

GET /:code
  Response: 302 redirect to original URL, hits++
```

## Key Commands

```bash
# Update all submodules to branch tips
git submodule update --init --remote backend frontend cli

# Rebuild frontend and assemble bundle (idempotent, no-op if unchanged)
node scripts/build-bundle.mjs

# Push changes to remote (submodules + main pointer updates)
node scripts/build-bundle.mjs --push

# Run bundled app
cd bundle && bun start    # http://localhost:3000

# Run with Docker
cd bundle && docker build -t snip . && docker run -p 3000:3000 snip
```

## Edit → Push → Pointer-Bump Workflow

1. **Edit code** in `backend/`, `frontend/`, or `cli/` submodule
2. **Commit & push** within that submodule (e.g., `git -C backend push origin backend`)
3. **Bump superproject pointers**:
   ```bash
   git submodule update --init --remote backend  # fetch latest
   git add backend
   git commit -m "chore: update backend pointer"
   git push origin main
   ```
4. **Rebuild bundle** (optional, but recommended before deploy):
   ```bash
   node scripts/build-bundle.mjs --push
   ```

## ✅ DO

- Hand-edit code in **backend/**, **frontend/**, **cli/**
- Run `node scripts/build-bundle.mjs` as many times as needed (idempotent)
- Use `node scripts/build-bundle.mjs --push` to deploy bundle + bump superproject
- Keep `CLAUDE.md` in sync with this file
- Reference API contract in backend/frontend/cli code

## ❌ DON'T

- **Hand-edit bundle/** — it's generated output only. Edit source layers, run build script.
- **Add "type":"module" anywhere near cli.js** — Node CLI must stay CommonJS so it runs under plain `node` without .mjs extension.
- **Move or rename `frontend/dist/snip-frontend/browser/`** — build path is load-bearing, hardcoded in server.js PUBLIC_DIR logic.
- **Add persistent database** — storage is in-memory by design. Server restart = clean slate (feature, not bug).
- **Trigger bundle CI on every commit** — schedule-only by design (cost control, Railway deployment).
- **Watch for bundle file changes in CI** — CI watches the **bundle submodule GITLINK** (commit hash), not individual files.

## Non-Obvious Traps

| Trap | Why | Fix |
|------|-----|-----|
| **Edit bundle/ directly, push** | Bundle is output, not source. Changes get overwritten next build. | Edit backend/frontend/cli, run `build-bundle.mjs`, which regenerates bundle/ correctly. |
| **Add ES modules to cli/** | Node CLI runs without .mjs extension, needs CommonJS. | Keep `cli/package.json` without `"type":"module"`. Use CommonJS require/module.exports. |
| **Move frontend build output** | Server reads PUBLIC_DIR=./public, copies from `frontend/dist/snip-frontend/browser`. | Don't move. If build path changes in Angular config, update `scripts/build-bundle.mjs` line 67. |
| **Add database, persist across restart** | Server goal is stateless, demo-friendly. Reboot = blank slate. | Keep in-memory Map. For persistence, fork and add SQLite/PostgreSQL. |
| **Commit to bundle/ before running build script** | Submodule is in detached HEAD state after checkout. Git won't find the branch. | Always commit in bundle/ via `git -C bundle` or `cd bundle && git commit`, let build script handle pointer updates. |
| **Deploy without `--push`** | `--push` flag required to update remote. Without it, local changes don't push. | Use `node scripts/build-bundle.mjs --push` for deploy. |
