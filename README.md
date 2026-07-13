# snip-cli

Zero-dependency Node.js CLI for the [Snip](../backend) URL shortener.  
Requires Node ≥ 18 (global `fetch` built-in).

## Installation

```bash
# From this directory — makes `snip` available globally
npm install -g .

# Or run directly without installing
node cli.js <command>
```

## Usage

```
snip add <url>    Shorten a URL; prints the short link
snip ls           List all links (aligned code / hits / url table)
snip open <code>  Open the original URL in your OS browser
snip              Print this help
```

## Environment

| Variable   | Default                  | Purpose              |
|------------|--------------------------|----------------------|
| `SNIP_API` | `http://localhost:3000`  | Backend base URL     |

```bash
SNIP_API=https://snip.example.com snip ls
```

## Wrappers

Three thin launchers are included so you can put this directory on your `PATH`
without a global npm install:

| File        | Shell              |
|-------------|--------------------|
| `snip`      | bash / sh / zsh    |
| `snip.cmd`  | Windows CMD        |
| `snip.ps1`  | PowerShell         |

Make `snip` executable on Unix: `chmod +x snip`

## Examples

```bash
$ snip add https://example.com/very/long/path
http://localhost:3000/aB3xYz

$ snip ls
CODE    HITS  URL
------  ----  ------------------------------
aB3xYz     3  https://example.com/very/long/path

$ snip open aB3xYz
opening: https://example.com/very/long/path
```

## Error handling

All errors print to **stderr** and exit with code **1**:
- non-http(s) URL passed to `add`
- unknown code passed to `open`
- backend unreachable
