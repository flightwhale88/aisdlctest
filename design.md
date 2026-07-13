# Snip – Design Language

Inspired by the visual language of dark-mode AI product landing pages (lovable.dev style).

---

## Color Tokens

| Token              | Value                        | Usage                                      |
|--------------------|------------------------------|--------------------------------------------|
| `--bg`             | `#0c0c0f`                    | Page background                            |
| `--surface`        | `#14141a`                    | Card / elevated surfaces                   |
| `--surface-high`   | `#1c1c24`                    | Input background, table header             |
| `--border`         | `rgba(255,255,255,0.08)`     | Subtle borders everywhere                  |
| `--border-focus`   | `rgba(255,120,80,0.55)`      | Input focus ring                           |
| `--text`           | `#f0f0f5`                    | Primary text                               |
| `--text-muted`     | `#7a7a8e`                    | Subheadings, table data, placeholders      |
| `--accent-from`    | `#ff6b4a`                    | Gradient start (coral-orange)              |
| `--accent-mid`     | `#e0408a`                    | Gradient midpoint (hot pink)               |
| `--accent-to`      | `#a855f7`                    | Gradient end (violet)                      |
| `--accent-gradient`| `linear-gradient(135deg, #ff6b4a, #e0408a, #a855f7)` | Button fills, headings |
| `--success-border` | `rgba(52,211,153,0.30)`      | Result notice border                       |
| `--error-border`   | `rgba(248,113,113,0.35)`     | Error notice border                        |

---

## Glow / Atmosphere

```css
/* Hero glow — sits behind the headline as a radial bloom */
background-image: radial-gradient(
  ellipse 90% 55% at 50% -10%,
  rgba(224,64,138,0.18) 0%,
  rgba(168,85,247,0.10) 40%,
  transparent 70%
);
```

---

## Typography

| Role        | Size       | Weight | Letter-spacing | Color          |
|-------------|------------|--------|----------------|----------------|
| Hero h1     | `3.25rem`  | 700    | `-0.04em`      | `--text`       |
| Tagline     | `1.1rem`   | 400    | `0`            | `--text-muted` |
| Label / th  | `0.75rem`  | 600    | `0.06em`       | `--text-muted` |
| Body / td   | `0.9rem`   | 400    | `0`            | `--text`       |
| Button      | `0.95rem`  | 600    | `0`            | `white`        |

**Font stack:** `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

---

## Spacing Scale

`0.5 · 1 · 1.5 · 2 · 3 · 5 · 8 rem`

Hero top padding: `6rem`  
Max content width: `680px`  
Section gap: `3rem`

---

## Border Radii

| Element       | Radius      |
|---------------|-------------|
| Input (pill)  | `9999px`    |
| Button        | `9999px`    |
| Card          | `1rem`      |
| Notice        | `0.75rem`   |
| Table wrapper | `1rem`      |

---

## Borders, Shadows & Glow

```
Card border:    1px solid rgba(255,255,255,0.08)
Card shadow:    0 2px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)
Input shadow:   0 0 0 1px rgba(255,255,255,0.08)
Input glow:     0 0 32px rgba(224,64,138,0.12)  (on focus)
Button shadow:  0 4px 20px rgba(224,64,138,0.35)
```

---

## Snip → Design Mapping

| Snip element         | Design role              | Key tokens                                |
|----------------------|--------------------------|-------------------------------------------|
| `<h1>Snip</h1>`      | Hero headline            | 3.25 rem, weight 700, gradient text fill  |
| `.tagline`           | Hero sub-copy            | 1.1 rem, `--text-muted`                   |
| `.shorten-form`      | Chat-style pill input    | pill radius, `--surface-high`, focus glow |
| `.result`            | Success notice card      | `--surface`, `--success-border`           |
| `.error`             | Error notice card        | `--surface`, `--error-border`             |
| `table` wrapper      | Links card               | `--surface`, card shadow, `1rem` radius   |
| `th`                 | Card column headers      | 0.75 rem, uppercase, `--text-muted`       |
| `td`                 | Card body text           | 0.9 rem, `--text`                         |
