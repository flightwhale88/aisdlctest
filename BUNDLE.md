# Bundle Build System

The `scripts/build-bundle.mjs` script automates the creation of a production-ready bundle containing:

- **Backend** (Bun HTTP server)
- **Frontend** (Angular 19 compiled UI)
- **CLI** (Node.js command-line tool)

## Usage

```bash
# Assemble bundle (no-op if unchanged)
node scripts/build-bundle.mjs

# Assemble and push to bundle branch + update superproject main
node scripts/build-bundle.mjs --push
```

## How It Works

1. **Updates submodules** to latest branch tips (backend, frontend, cli)
2. **Builds frontend** (npm install + ng build)
3. **Assembles bundle/** with:
   - `server.js` (backend)
   - `cli.js` (CLI tool)
   - `public/` (frontend build output)
   - `.env` (Bun config: PUBLIC_DIR=./public)
   - `package.json` (no "type" field so cli.js works under plain node)
   - `Dockerfile` + `.dockerignore` (multi-stage compatible)
   - `railway.json` (Railway deployment config)
4. **Commits** in bundle branch if changes exist
5. **Updates superproject pointer** if bundle was updated
6. **Pushes** both branches (with --push)

## Running the Bundle

```bash
cd bundle
bun start   # Starts http://localhost:3000 (API + UI)
```

The Bun server reads `.env` (PUBLIC_DIR=./public) and automatically serves the frontend at `/`.

## Docker Deployment

```bash
cd bundle
docker build -t snip .
docker run -p 3000:3000 snip
```

Or deploy to [Railway](https://railway.app) using `railway.json`.

## Idempotent Design

The script is safe to run repeatedly:
- Only commits if staged changes exist (guard against empty commits)
- Only pushes with `--push` flag
- Re-running without code changes produces "no changes to commit"
