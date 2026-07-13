# Snip Bundle System - Complete

## ✅ What Was Accomplished

### 1. Bundle Branch Created
- **Repository**: `https://github.com/flightwhale88/aisdlctest/`
- **Branch**: `bundle` (orphan branch, no parent history)
- **Contents**: README documenting that it's generated output
- **Commit**: `25a70ba` (pushed to origin/bundle)

### 2. Superproject Updated
- Added `bundle` as 4th submodule in `.gitmodules`
- Submodule configuration:
  ```
  [submodule "bundle"]
    path = bundle
    url = https://github.com/flightwhale88/aisdlctest/
    branch = bundle
  ```
- Superproject main commit: `218b0d61` (includes BUNDLE.md + build script)

### 3. Build System Implemented
**File**: `scripts/build-bundle.mjs` (zero-dependency Node script)

**Functionality**:
1. Updates all submodules to branch tips
2. Builds frontend (npm install + ng build)
3. Validates build output exists
4. Assembles bundle/ directory with:
   - `server.js` (Bun backend, copied from backend/)
   - `cli.js` (Node CLI, copied from cli/)
   - `public/` (frontend build output)
   - `.env` (PUBLIC_DIR=./public for Bun)
   - `package.json` (start: "bun server.js", no "type" field)
   - `Dockerfile` (FROM oven/bun:1-alpine)
   - `.dockerignore` (exclude node_modules, dist, .git)
   - `railway.json` (Railway.app deployment config)
5. Commits to bundle branch (if changes exist)
6. Updates superproject submodule pointer (if bundle changed)
7. Optionally pushes with `--push` flag

**Idempotent Design**:
- Checks for staged changes before committing
- Safe to run repeatedly (no-op when unchanged)
- Only pushes with explicit `--push` flag

### 4. Bundle Directory Assembled
**Location**: `bundle/` (submodule)

**Contents**:
```
bundle/
├── server.js           → Backend (Bun HTTP server)
├── cli.js              → Node CLI tool
├── public/             → Frontend build (Angular)
│   ├── index.html
│   ├── main-*.js
│   ├── polyfills-*.js
│   └── styles-*.css
├── .env                → Bun config: PUBLIC_DIR=./public
├── package.json        → start: "bun server.js"
├── Dockerfile          → Multi-platform build
├── .dockerignore       → Build context exclusions
├── railway.json        → Railway.app config
└── README.md           → Generated marker
```

### 5. Testing & Verification

#### Web Test
- ✅ `cd bundle && bun start` → http://localhost:3000
- ✅ Frontend UI loads with Snip branding
- ✅ Input form for URL shortening ready
- ✅ API endpoints available at `/api/links`

#### Docker Test
- `docker build -t snip .` → Ready (not tested due to Docker availability)
- `docker run -p 3000:3000 snip` → Should work on host port 3000

#### Script Idempotence Test
- ✅ First run: Assembles all files, commits to bundle, updates superproject
- ✅ Second run: Rebuilds frontend, checks if staged changes exist
- ✅ No-op when nothing changed (safe to re-run)

## 📖 Usage Guide

### Rebuild Bundle After Code Changes
```bash
cd snip-demo
node scripts/build-bundle.mjs          # Assemble locally
node scripts/build-bundle.mjs --push   # Assemble + push to origin/bundle and origin/main
```

### Run Bundle as Standalone App
```bash
cd bundle
bun start   # Starts http://localhost:3000 (API + UI combined)
```

### Deploy to Docker
```bash
cd bundle
docker build -t snip .
docker run -p 3000:3000 snip
```

### Deploy to Railway.app
1. Connect GitHub repo to Railway
2. Select `snip-demo` repository
3. Link to `bundle` submodule
4. Railway auto-detects `railway.json` builder config
5. Deploy runs `bun server.js` on port 3000

### Clone Fresh Snip Project (with all submodules)
```bash
git clone --recursive https://github.com/flightwhale88/aisdlctest/ snip-demo
cd snip-demo

# Now have:
# ./backend/server.js    (Bun source)
# ./frontend/            (Angular source)
# ./cli/cli.js           (Node CLI source)
# ./bundle/              (Pre-built bundle ready to run)
```

## 🏗️ Architecture

```
snip-demo (main branch)
├── backend/            (submodule → backend branch)
│   └── server.js       (Bun server, API, data store)
├── frontend/           (submodule → frontend branch)
│   ├── src/            (Angular 19 source)
│   └── dist/           (Compiled output)
├── cli/                (submodule → cli branch)
│   └── cli.js          (Node CLI tool)
├── bundle/             (submodule → bundle branch, GENERATED)
│   ├── server.js       (copy from backend/)
│   ├── cli.js          (copy from cli/)
│   ├── public/         (copy from frontend/dist)
│   ├── .env            (PUBLIC_DIR=./public)
│   ├── package.json    (no "type" field)
│   ├── Dockerfile      (multi-stage ready)
│   └── railway.json    (Railway config)
├── scripts/
│   └── build-bundle.mjs (idempotent build orchestrator)
├── BUNDLE.md           (bundle documentation)
└── README.md           (architecture + submodule info)
```

## 🚀 Deployment Scenarios

### Scenario 1: Local Development
```bash
# Terminal 1: Backend
cd backend && bun start

# Terminal 2: Frontend (dev server with hot reload)
cd frontend && npm install && npx ng serve --port 4200

# Terminal 3: Test via CLI
cd cli && node cli.js add https://example.com/long/path
```

### Scenario 2: Standalone Bundle (No Submodules)
```bash
git clone https://github.com/flightwhale88/aisdlctest/ --single-branch -b bundle snip-bundle
cd snip-bundle
bun start  # http://localhost:3000
```

### Scenario 3: Docker/Container (CI/CD)
```bash
git clone --recurse-submodules https://github.com/flightwhale88/aisdlctest/ snip-demo
cd snip-demo/bundle
docker build -t snip:latest .
docker push registry.example.com/snip:latest
```

### Scenario 4: Serverless (Railway, Vercel, etc.)
```bash
# Push changes
cd snip-demo
git add backend/ frontend/ cli/
git commit -m "Update code"
git push origin main

# Trigger rebuild
node scripts/build-bundle.mjs --push

# Railway auto-deploys from bundle branch via railway.json
```

## 🔄 Build System Workflow

```
User runs: node scripts/build-bundle.mjs [--push]
    ↓
1. git submodule update --init --remote backend frontend cli
    (fetch latest code from each branch)
    ↓
2. npm install && ng build (in frontend/)
    (compile Angular to frontend/dist)
    ↓
3. Copy to bundle/:
    - server.js from backend/
    - cli.js from cli/
    - public/ from frontend/dist
    - Create .env, package.json, Dockerfile, railway.json
    ↓
4. In bundle/ directory:
    - git add .
    - Check if staged changes exist
    - If yes: git commit "build: bundle output"
    ↓
5. Back in superproject:
    - Check if bundle/ submodule pointer changed
    - If yes: git add bundle && git commit "chore: update bundle submodule pointer"
    ↓
6. If --push flag:
    - git push origin bundle:bundle (in bundle/ submodule)
    - git push origin main (in superproject)
    ↓
Done! (or "no changes to commit" if already built)
```

## 📝 Key Design Decisions

1. **Zero Dependencies**: Both `build-bundle.mjs` and `cli.js` use only Node.js built-ins
2. **No "type" Field**: `package.json` intentionally omits `"type": "module"` so cli.js (CommonJS) can coexist
3. **Orphan Bundle Branch**: Keeps compiled output separate from source history
4. **Submodule Strategy**: Each layer (backend/frontend/cli) on separate branch, aggregated via main
5. **Idempotent Build**: Safe to run repeatedly without side effects
6. **Optional Push**: `--push` required to avoid accidental remote changes during development

## 🎯 Next Steps (Optional Enhancements)

- [ ] Add GitHub Actions workflow to auto-build bundle on push to any submodule branch
- [ ] Set up Railway webhook to deploy automatically on bundle branch updates
- [ ] Add healthcheck endpoint `/api/health` for container monitoring
- [ ] Implement rate limiting on API endpoints
- [ ] Add metrics/logging to understand usage patterns
