# Changelog

## 1.3.0 (2026-11-11)

- Creative direction. Before concepts, the `logo` skill asks five quick
  questions, each with a default: three feeling words, four either/ors (serious
  or playful, classic or futuristic, quiet or loud, handmade or engineered),
  reference brands, where the logo lives most, and weirdness.
- Weirdness dial, 1 (quiet) to 5 (weird). It widens the concepts, type voices
  and colour, and lets some style rules bend from level 3 up; the review
  checklist never bends. With no level given, round 1 shows one concept each at
  2, 3 and 4. See `references/direction.md`.
- `brand.json` takes an optional `direction` record of the answers.
- `examples/harbor/weirdness/`: Harbor drawn at weirdness 1, 3, 4 and 5 (the
  shipped logo is the 2), shown side by side in the README.

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
