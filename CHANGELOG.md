# Changelog

## 1.2.0 (2026-11-10)

- Website colour palette. The export now writes `web/`: 12-step OKLCH scales for
  the brand, accent, a tinted neutral and success, warning, danger and info, plus
  light and dark roles (`--bg`, `--surface`, `--text`, `--brand`, `--on-brand`,
  `--border`, …), as `palette.css`, `palette.tailwind.css` (Tailwind v4) and
  `tokens.json` (W3C Design Tokens), with `palette.html` and `palette.png`. Brand
  hexes are kept where they read, text steps are pushed to pass WCAG 2.2 AA, and
  every pair is also scored with APCA. The guidelines get a website colour page.
  `brand.json` `palette` tunes it, or `false` skips it. See `references/palette.md`.

## 1.1.0 (2026-11-07)

- Moved from mtblck/claude-marketplace to its own repo, which is also a
  one-plugin marketplace (`/plugin install brand-kit --marketplace mtblck/brand-kit`).
- Harbor example filled out: an about line, construction notes, a website,
  contact details and usage for each colour.

## 1.0.0 (2026-11-07)

- `logo` and `icons` skills: SVG logos from a brief, Google Fonts specimens,
  favicons and app icons, brand guidelines PDF, vector PDF logos, social
  images, email signature, business card, slide template, social post
  templates and a zip of the kit.
