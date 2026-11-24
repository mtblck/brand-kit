# Changelog

## 1.7.0 (2026-11-24)

- Pick the exports. The skill asks which parts of the kit to make, with the
  direction questions, and makes all of them unless the user picks fewer:
  icons, brand guidelines, website palette, social images, email signature,
  business card, slide template and social post templates. The logo files
  (SVG, PNG, PDF), `check.png`, the kit's README, the brand's `LICENSE` and
  `TRADEMARKS.md`, and the zip are always made. New `scripts/exports.mjs`
  prints the menu and turns an answer ("1, 3, slides") into the new
  `brand.json` field `exports` (`"all"` or a list of ids); `export.mjs
  --exports` overrides it for one run. A part dropped from the list is removed
  from the export folder, so the zip holds only what was chosen. The
  guidelines show pages and sections only for what was made and number them to
  match; without icons, `check.png` leaves out the tab and home-screen tests.
  `"templates": false` and `"palette": false` still work.

## 1.6.0 (2026-11-24)

- Brand files get their own license, as a requirement. Everything made for a
  project goes in a `brand/` folder (source, rounds and export). `export.mjs`
  writes a `LICENSE` (all rights reserved: the name, logos and brand material
  are excluded from the project's code license) and a short `TRADEMARKS.md`
  usage policy (allowed: referring, "works with", linking with the unmodified
  logo, unchanged copies in forks; not allowed: forks or products under the
  name, changed logos, implied endorsement) into the kit and its zip, and at
  the top of `brand/` when they're missing. `scripts/legal.mjs` reads the code
  license from the repo's LICENSE and warns when `brand.json` isn't in a
  `brand/` folder or the root README doesn't mention it. New `brand.json`
  field `legal` (`owner`, `year`, `contact`, `codeLicense`). The kit's README
  says the brand has its own license.

## 1.5.0 (2026-11-11)

- Circle-grid construction. `references/circle-grid.md` covers building a mark
  from one set of radii (Fibonacci or golden-ratio): lenses, crescents,
  tangents and fillets, the construction drawing, failure modes, and being
  honest about the golden ratio.
- `scripts/geometry.mjs`: path booleans (`union`, `subtract`, `intersect`,
  `exclude`, `dilate`, `erode`, `outline`) on paper.js; circle grids that
  record every circle (`circleGrid`, `fib`, `series`, `grid.touch`,
  `grid.fillet`, `through`, `meet`, `grid.check`); `constructionSheet()` for
  the three-panel concept drawing and `constructionOverlay()` for the
  guidelines; monogram tools (`solid`, `bar`, `polyline`, `weave`, `knockout`).
- Monograms. `references/monograms.md`: seven structures, letter pairing by
  stroke family, reading order, collisions, weave gaps, small-size and
  rotation checks, the generator clichés, and styles by voice. Concepts now
  always include a monogram when the name has two words or goes by initials.
- `logos.mark.construction` in `brand.json`: the guidelines' construction
  panel lays the circles over the mark.
- From research on logo practice, in `craft.md` and the checklist: overshoot
  and circle-vs-square numbers, centroid centring, thinned joins, lighter dark
  versions (irradiation), the size ladder, a "Dynamic" structure, a Process
  section (volume then choose, Haviv's three tests, a category audit), and
  rotate, mirror and blur tests in the review checklist.
- Concepts are now a funnel. Round 1 is nine unrefined black sketches on a 3 × 3 grid
  (rows are structures, columns are weirdness levels; the old spread of 2, 3
  and 4 becomes the columns). The user picks one to three, those are drawn
  properly in round 2, and the kit is built only after the user locks the
  logo: the skill always waits at both steps instead of going ahead on its own
  recommendation. `render.mjs --sheet` takes `--rows`, `--cols`, `--title` and
  `--mono` for the grid; `examples/wren/round-1/` is the example.
- Examples: `examples/wren/` (a circle-grid wren with its full kit) and
  `examples/marlow/` (MF three ways), shown in the README.

## 1.4.0 (2026-11-11)

- More type for the weirdness dial. `typefaces.json` grows from about 70 to
  about 130 Google Fonts (all SIL OFL or Apache 2.0) with eight new voices:
  chunky, stencil, marker and odd-serif from level 3; retro, pixel and
  blackletter from 4; experimental (glitched, dripping, inflated, striped) at
  5. Every voice now carries a `weirdness` level, some a `note`, and faces that
  clog when small are marked `small: false`.
- `specimen.mjs --weirdness 4` (or `3,4`) sets every voice that opens at those
  levels. Each cell also shows the name about 12 px tall and says "large only"
  for `small: false` faces; names with drips or tall swashes are shrunk to fit
  their cell.
- "Decorative faces" in `craft.md`: one loud thing, wordmark only, check it
  small, short names, each group's own rules, no colour fonts, customise less.
  The dial table in `direction.md` lists the new voices per level.

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
- Figurative marks: a "Creatures and objects" section in `craft.md` (name the
  tells, the silhouette test, one connected outline, the idea never the
  smallest part, three drafts and two passes), a silhouette line in the review
  checklist, and `smooth()`, `limb()` and `ellipse()` in `brand.mjs` for
  organic outlines.
- Level 5 is stricter: "What makes a 5" in `direction.md` (fuse, cut apart,
  break physics, the logo holds the word; decoration doesn't count). Harbor's 5
  is now a whale cut in half as bookends around a bookmark.
- "Putting the mark into the word" in `direction.md`: how far the mark's idea
  may enter the wordmark at each level. Harbor's 4 now uses the bookmark as the
  stem of its b, in a violet that passes 4.5:1.

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
