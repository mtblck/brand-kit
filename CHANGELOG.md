# Changelog

## 2.0.0 (2026-11-28)

- brand-kit is now **Logowright**. The plugin and its marketplace are named
  `logowright`, so it installs as `logowright@logowright` (or
  `logowright@mtblck` from mtblck/claude-marketplace); uninstall
  `brand-kit@brand-kit` and install the new name. The repo moves to
  mtblck/logowright (GitHub redirects the old address) and the page to
  mattblack.space/skills/logowright/. The skills, `brand.json` and every
  output are unchanged; the cache folder keeps its name (`~/.cache/brand-kit`,
  `$BRAND_KIT_CACHE`) so fonts and libraries already fetched are reused, and
  the kit's zip is still `<name>-brand-kit.zip`.

## 1.10.0 (2026-11-28)

- `TRADEMARKS.md` no longer says the code is open source when it isn't. It
  names the license it finds ("The code in this project is open source under
  the MIT license; the brand is not"). A repo with no license file, a
  proprietary LICENSE, package.json's `"license": "UNLICENSED"`, or
  `legal.codeLicense: "proprietary"` (or `false`) gets "The code in this
  project is not open source, and the brand has its own license". With no repo,
  or a license file it doesn't recognise, it says nothing about the code (an
  unrecognised LICENSE used to count as open source). The brand `LICENSE`
  says "any license that covers the code" unless it can name one.
- When `brand/LICENSE` and `brand/TRADEMARKS.md` already exist, the export
  copies them instead of making them again, so an owner's edits reach `dist/`
  and the zip. The export warns when an existing `TRADEMARKS.md` still says the
  code is open source and it isn't.
- `scripts/legal.test.mjs` (`node --test skills/logo/scripts/legal.test.mjs`)
  covers a repo with no LICENSE, MIT, proprietary, unknown, the setting and an
  owner's edits.
- Logowright's own `brand/TRADEMARKS.md` names the MIT license.

## 1.9.0 (2026-11-28)

- Object letters, a new structure for concepts: a letter of the name built
  from objects in the brand's world, with one main object carrying the
  outline, one accent symbol, and lines from the object's own parts finishing
  the letter. `references/object-letters.md` has the recipe and rules, and
  step 3 can give it a row of the round 1 grid when the name points to a
  world. Pictorial wordmarks (a letter replaced by an object) follow the same
  recipe, now with its own section and rules.
- Emblems and badges (`references/emblems.md`): shapes, the anatomy of a
  seal, and the inner mark every emblem needs. `geometry.mjs` gains
  `arcText()`, which sets a line of type round a circle (top clockwise, bottom
  upright and left to right).
- Negative-space marks (`references/negative-space.md`): one shape that reads
  two ways, four ways to make one, and checking both readings at 32 px.
- Responsive logos (`references/responsive.md`): the ladder from the full
  logo to the favicon, each step redrawn rather than shrunk, and flexible
  systems.
- `examples/pinewood/`: one made-up outdoor shop as an emblem, a
  negative-space mark, a pictorial wordmark and a responsive ladder
  (`docs/pinewood.png`).
- The plugin's own brand kit, under the name Logowright, in `brand/`: a
  drafting compass seen from its top whose arms make a W, with the north star
  in front. It's the worked example for object letters. The name and logo
  are all rights reserved (`brand/LICENSE`), `brand/TRADEMARKS.md` claims
  them as trademarks of mtblck, and the root LICENSE and README say `brand/`
  is not covered by MIT.

## 1.8.1 (2026-11-28)

- Brand guidelines, page 2: with four logos (mark, horizontal, stacked and
  wordmark) the minimum-size row and the one-colour panels ran off the right
  edge of the page. The minimum sizes now wrap onto a second row and the two
  columns can't grow past half the page.

## 1.8.0 (2026-11-28)

- Portfolio art, a new export (menu item 9, `portfolio`): the pictures a
  case-study page and Ko-fi show for the project, in `portfolio/`.
  `cover.webp` is 2400 × 800 (shown 1200 × 400 across the top of the sheet
  from 640 px wide up, and the Ko-fi cover), `cover-mobile.webp` is the same
  scene re-framed at 1000 × 800 for phones, both WebP encoded at the best
  quality under 250 KB and 150 KB. `icon.png` is 512 × 512 with square
  corners, full bleed, from the app-icon art. `alt.txt` holds one sentence
  describing the scene. The covers are drawn for each project (one verb, one
  picture, the product's colours, one viewpoint, its own background, no
  words), with the subject in the middle 60 % and the outer 40 px quiet; new
  `references/portfolio.md` has the rules and a new workflow step draws them.
  `preview.png` shows all three on a light and a dark page and the guides at
  real size, and the export warns about a wrong shape, `<text>`, an embedded
  image, a busy edge, an over-budget file, and missing or long alt text.
  `node scripts/portfolio.mjs brand.json` remakes only this folder.
  `brand.json` gets a `portfolio` field. Harbor's example has covers.
- The social post templates no longer include a Ko-fi cover with a logo and
  headline: the portfolio cover replaces it. The guidelines' social section
  shows the portfolio cover beside the X header when both are made.

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
