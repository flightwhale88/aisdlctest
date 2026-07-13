#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUSH = process.argv.includes('--push');

const log = (msg) => console.log(`[build-bundle] ${msg}`);
const err = (msg) => {
  console.error(`[build-bundle ERROR] ${msg}`);
  process.exit(1);
};

const run = (cmd, opts = {}) => {
  const { stdio = 'inherit', ...rest } = opts;
  try {
    return execSync(cmd, { stdio, cwd: ROOT, shell: true, ...rest });
  } catch (e) {
    if (opts.ignoreError) return '';
    err(`Command failed: ${cmd}`);
  }
};

try {
  log('Updating submodules to branch tips...');
  run('git submodule update --init --remote backend frontend cli');

  log('Building frontend...');
  const frontendDir = path.join(ROOT, 'frontend');
  run('npm install', { cwd: frontendDir });
  run('npx ng build', { cwd: frontendDir });

  const buildOutputIndex = path.join(frontendDir, 'dist', 'snip-frontend', 'browser', 'index.html');
  if (!fs.existsSync(buildOutputIndex)) {
    err(`Frontend build output missing: ${buildOutputIndex}`);
  }
  log(`✓ Frontend built: ${buildOutputIndex}`);

  log('Assembling bundle/...');
  const bundleDir = path.join(ROOT, 'bundle');
  const buildDir = path.join(frontendDir, 'dist', 'snip-frontend', 'browser');

  // Copy backend/server.js
  const serverSrc = path.join(ROOT, 'backend', 'server.js');
  const serverDst = path.join(bundleDir, 'server.js');
  fs.copyFileSync(serverSrc, serverDst);
  log(`  → server.js`);

  // Copy cli/cli.js
  const cliSrc = path.join(ROOT, 'cli', 'cli.js');
  const cliDst = path.join(bundleDir, 'cli.js');
  fs.copyFileSync(cliSrc, cliDst);
  log(`  → cli.js`);

  // Copy build output to bundle/public
  const publicDir = path.join(bundleDir, 'public');
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.cpSync(buildDir, publicDir, { recursive: true });
  log(`  → public/ (build output)`);

  // Write .env
  const envFile = path.join(bundleDir, '.env');
  fs.writeFileSync(envFile, 'PUBLIC_DIR=./public\n');
  log(`  → .env`);

  // Write package.json
  const packageJson = {
    name: 'snip-bundle',
    version: '1.0.0',
    description: 'URL shortener - bundled backend + frontend + CLI',
    main: 'server.js',
    scripts: {
      start: 'bun server.js'
    },
    engines: {
      node: '>=18'
    }
  };
  fs.writeFileSync(path.join(bundleDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
  log(`  → package.json`);

  // Write Dockerfile
  const dockerfile = `FROM oven/bun:1-alpine
WORKDIR /app
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["bun", "server.js"]
`;
  fs.writeFileSync(path.join(bundleDir, 'Dockerfile'), dockerfile);
  log(`  → Dockerfile`);

  // Write .dockerignore
  const dockerignore = `node_modules/
dist/
.git/
.angular/
*.log
.env.local
`;
  fs.writeFileSync(path.join(bundleDir, '.dockerignore'), dockerignore);
  log(`  → .dockerignore`);

  // Write railway.json
  const railwayJson = {
    $schema: 'https://railway.app/railway.schema.json',
    build: {
      builder: 'DOCKERFILE'
    },
    deploy: {
      numReplicas: 1,
      startCommand: 'bun server.js'
    }
  };
  fs.writeFileSync(path.join(bundleDir, 'railway.json'), JSON.stringify(railwayJson, null, 2) + '\n');
  log(`  → railway.json`);

  // Commit inside bundle/
  log('Committing bundle changes...');
  process.chdir(bundleDir);

  // Stage all changes
  run('git add .');

  // Check if there's anything to commit
  const statusCheck = run('git diff --cached --name-only', { stdio: 'pipe', encoding: 'utf8' }).toString().trim();
  if (statusCheck) {
    run('git -c user.email=bundle@snip.local -c user.name=Bundle commit -m "build: bundle output"');
    log(`✓ Bundle committed`);

    if (PUSH) {
      log('Pushing bundle branch...');
      run('git push origin HEAD:bundle');
      log(`✓ Bundle pushed to origin/bundle`);
    } else {
      log('(use --push to push changes)');
    }
  } else {
    log('✓ No changes to commit (bundle is up-to-date)');
  }

  // Return to root and update submodule pointer
  process.chdir(ROOT);
  log('Updating superproject submodule pointer...');

  // Check if superproject has changes to bundle
  const supDiff = run('git diff --name-only', { stdio: 'pipe', encoding: 'utf8' }).toString().trim();
  const hasBundleChanges = supDiff.split('\n').filter(l => l.trim()).some(l => l.includes('bundle'));
  
  if (hasBundleChanges) {
    run('git add bundle');
    const commitMsg = 'chore: update bundle submodule pointer';
    run(`git -c user.email=bundle@snip.local -c user.name=Bundle commit -m "${commitMsg}"`);
    log(`✓ Superproject committed`);

    if (PUSH) {
      log('Pushing main branch...');
      run('git push origin main');
      log(`✓ Main pushed`);
    } else {
      log('(use --push to push changes)');
    }
  } else {
    log('✓ No superproject changes');
  }

  log('Done!');
} catch (e) {
  err(e.message);
}
