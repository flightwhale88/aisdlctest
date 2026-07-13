#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');

const BASE = (process.env.SNIP_API || 'http://localhost:3000').replace(/\/$/, '');
const [, , cmd, arg] = process.argv;

// ── helpers ────────────────────────────────────────────────────────────────

function die(msg) {
  process.stderr.write(`snip: ${msg}\n`);
  process.exit(1);
}

async function api(path, init) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch (e) {
    die(`cannot reach backend at ${BASE} — ${e.message}`);
  }
  return res;
}

function pad(str, len) {
  str = String(str);
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

function openBrowser(url) {
  const cmds = {
    win32:  ['cmd', ['/c', 'start', '', url]],
    darwin: ['open', [url]],
  };
  const [bin, args] = cmds[process.platform] || ['xdg-open', [url]];
  try {
    const { spawnSync } = require('child_process');
    spawnSync(bin, args, { stdio: 'ignore', detached: true });
  } catch {
    die(`could not open browser: ${url}`);
  }
}

// ── commands ───────────────────────────────────────────────────────────────

async function cmdAdd(url) {
  if (!url) die('usage: snip add <url>');
  try { new URL(url); } catch { die(`invalid URL: ${url}`); }
  const u = new URL(url);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    die(`url must start with http:// or https://`);
  }

  const res = await api('/api/links', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ url }),
  });

  if (!res.ok) {
    let msg = res.statusText;
    try { msg = (await res.json()).error || msg; } catch {}
    die(`server error ${res.status}: ${msg}`);
  }

  const link = await res.json();
  process.stdout.write(`${link.shortUrl}\n`);
}

async function cmdLs() {
  const res = await api('/api/links');
  if (!res.ok) die(`server error ${res.status}: ${res.statusText}`);

  const links = await res.json();
  if (!links.length) {
    process.stdout.write('No links yet.\n');
    return;
  }

  // column widths
  const codeW = Math.max(4, ...links.map(l => l.code.length));
  const hitsW = Math.max(4, ...links.map(l => String(l.hits).length));

  process.stdout.write(
    `${pad('CODE', codeW)}  ${pad('HITS', hitsW)}  URL\n`
  );
  process.stdout.write(
    `${'-'.repeat(codeW)}  ${'-'.repeat(hitsW)}  ${'-'.repeat(30)}\n`
  );
  for (const l of links) {
    process.stdout.write(
      `${pad(l.code, codeW)}  ${pad(l.hits, hitsW)}  ${l.url}\n`
    );
  }
}

async function cmdOpen(code) {
  if (!code) die('usage: snip open <code>');

  const res = await api(`/${encodeURIComponent(code)}`, { redirect: 'manual' });

  if (res.status === 302 || res.status === 301) {
    const location = res.headers.get('location');
    if (!location) die('redirect had no Location header');
    openBrowser(location);
    process.stdout.write(`opening: ${location}\n`);
    return;
  }

  if (res.status === 404) die(`unknown code: ${code}`);
  die(`unexpected status ${res.status} for code: ${code}`);
}

function usage() {
  process.stdout.write(`
Usage: snip <command> [args]

Commands:
  add <url>    Shorten a URL and print the short link
  ls           List all shortened links
  open <code>  Open the URL behind a short code in the browser

Environment:
  SNIP_API     Backend base URL  (default: http://localhost:3000)

`.trimStart());
}

// ── dispatch ───────────────────────────────────────────────────────────────

(async () => {
  switch (cmd) {
    case 'add':  await cmdAdd(arg);  break;
    case 'ls':   await cmdLs();      break;
    case 'open': await cmdOpen(arg); break;
    default:     usage();
  }
})().catch(e => die(e.message));
