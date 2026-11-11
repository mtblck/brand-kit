---
name: logo
description: Design a logo as clean SVG (symbol, wordmark, monogram or combination), choose its typeface from real Google Fonts, and export the full kit (SVG and PNG logos, dark and one-colour versions, favicons, app icons, webmanifest and printable brand guidelines). Use for a new logo, a logo refresh, or a brand identity for a product, project or business.
---

# logo

A logo here is a small piece of geometry drawn by a script, plus a name set in a real typeface and converted to outlines, locked together and exported from one `brand.json`. Claude designs in SVG directly. It never generates a raster image and traces it: that gives pictures, not logos, and they fall apart at 16 px.

## The idea in three lines

1. **One idea, drawn simply.** A logo carries a single idea (what the thing is, does or feels like), built from a few shapes on a grid. If it needs explaining, it's an illustration. Use `cover-art` or `linewash` for those.
2. **Small first.** It has to survive 16 px, one colour and a dark background before it is allowed to be pretty at 512.
3. **Choose type by eye.** Set the actual name in many real typefaces on one sheet and pick from that, not from a font's reputation.

## Files

Paths are relative to this skill's folder.

| File | Use |
|---|---|
| `scripts/brand.mjs` | The kit. `loadFont(family, weight)` fetches a Google Font once (cached in `~/.cache/brand-kit`). `text(font, str, {size, tracking, x, y, anchor})` returns the word as an outlined path with its measurements. `lockup({mark, font, name, layout})` builds horizontal or stacked lockups. Shape helpers: `circle`, `ring`, `rect`, `poly`, `ngon`, `polar`, `arcBand`, `place`, plus `svg()` and `write()`. Import it from a draw script by absolute path; never hand-type a logo's SVG. |
| `scripts/specimen.mjs` | `node scripts/specimen.mjs "Name" --group geometric,humanist [--font "Fraunces:600"] [--out DIR]` sets the name in every listed face at matched cap height on one numbered sheet (`specimen.svg` + `.png`). |
| `scripts/export.mjs` | `node scripts/export.mjs brand.json` writes `dist/` with `svg/`, `png/`, `icons/` (favicon.ico/svg, apple-touch, PWA and maskable, 1024 app icon, manifest, `head.html`), `check.png`, `brand-guidelines.pdf` (US Letter, three pages plus website colour and two template pages, also as `.html` and one PNG per page; drawn by `guide.mjs`), `web/` (the website palette, `palette.mjs`), then `social/` (1200 × 630 `og-image.png`, 800 × 800 `avatar.png`), `pdf/` (each logo as a vector PDF), a `README.md` saying which file is for what, and `<name>-brand-kit.zip` of all of it (`package.mjs`). |
| `scripts/palette.mjs` | Called by `export.mjs`: writes `web/` with the website palette, 12-step OKLCH scales for brand, accent, neutral and status colours, light and dark roles, as `palette.css`, `palette.tailwind.css` (Tailwind v4), `tokens.json` (W3C Design Tokens) and `palette.html`/`.png` with a contrast report (WCAG 2.2 and APCA). The guidelines get a page for it. `node scripts/palette.mjs brand.json` prints the roles and checks alone. |
| `scripts/templates.mjs` | Called by `export.mjs`: writes `templates/` with an email signature (HTML, text, hosted-logo PNG), a business card (print PDF with bleed, front and back), a slide template (`.pptx` with a master per layout, plus PDF and PNGs) and social posts (square, portrait, story, Ko-fi cover, X header, each with a blank). The brand guidelines get two pages showing them. |
| `scripts/render.mjs` | `node scripts/render.mjs art.svg --width 512` for a quick PNG of any SVG while drawing. |
| `references/typefaces.json` | Around 70 commercially free Google Fonts in eleven voices (geometric, grotesque, humanist, rounded, display, condensed, serif-modern, serif-classic, slab, mono, script), each with body faces that pair with it. |
| `references/craft.md` | Construction rules, the shape vocabulary, lockup proportions, small-size and icon rules. Read it before drawing. |
| `references/templates.md` | The design rules for the email signature, business card, slides and social posts: sizes, bleed and safe areas, type sizes, where the logo goes, what email clients strip. Read it before changing a template or making a new one. |
| `references/palette.md` | How the website palette is built (scales, step jobs, roles, contrast) and how to use it on a site. Read it before tuning colours for a website. |
| `references/direction.md` | The direction questions asked before concepts, how each answer changes the work, and the weirdness dial (1 quiet to 5 weird) with what each level allows. Read it before step 2. |
| `references/brand-json.md` | Every `brand.json` field and what it does. |
| `examples/harbor/` | A complete worked logo: `draw.mjs` (mark, favicon, both lockups and their dark versions, `brand.json`). Run it and then `export.mjs` to see every output. Read it before writing your own draw script. `examples/harbor/weirdness/draw.mjs` draws the same brief at weirdness 1, 3 and 5. |

The scripts need Node 18+. Rendering uses Playwright's Chromium if one is installed; exit 2 means there's no browser, so deliver the SVGs and say the PNGs couldn't be made. Fonts and the one dependency (`opentype.js`, installed once into the cache folder) need network access to `fonts.googleapis.com`, `fonts.gstatic.com` and the npm registry.

## Workflow

1. **Brief.** Read the project first if there is one (README, landing page, existing colours and tokens, any current logo). Then write the brief in six lines: *name*, *what it does in one sentence*, *who it's for*, *three to five adjectives*, *colours to keep or avoid*, *the category's clichés* (the lightbulb, the globe, the speech bubble, the leaf, the generic "S" swoosh). Ask only what you can't find. If the user is away, go with your best reading and say what you assumed.
2. **Direction.** Ask the five direction questions in `references/direction.md` in one message: three feeling words, four either/ors, reference brands, where the logo lives most, and weirdness from 1 (quiet) to 5 (weird). Each has a default, so don't wait on an answer; with no weirdness given, round 1 spreads its concepts across levels 2, 3 and 4. The answers steer the concepts, the type voices and the colour (the file has the table).
3. **Concepts.** Write eight to twelve one-line concepts (fifteen or more at weirdness 5), from **different metaphors and different structures**: a symbol, a lettermark or monogram, a wordmark with one modified letter, an abstract mark, an emblem. Describing what the product *does* gives a wider spread than prescribing a shape. Keep the three strongest and most different, at the weirdness level (or the spread), and say in a sentence why each one fits.
4. **Type.** Pick two or three voices from `typefaces.json` that match the adjectives and the weirdness level and run `specimen.mjs` on the name, adding any extra faces with `--font`. Try the name in sentence case and in capitals or lower case if it might suit. Shortlist two or three faces, and note any letter with a shape the mark could borrow, such as a round `o`, a shared stem or a notch.
5. **Draw** each of the three concepts with a script that imports `brand.mjs`. Draw it in black first on a 256 grid, and only then add colour. Build its horizontal lockup with the shortlisted face. Render all three side by side at 512 and at 32 px into one PNG, number them, and look.
6. **Checkpoint.** Show the user the three concepts (the PNG, plus the specimen sheet if type is still open) with your recommendation, each labelled with its weirdness level; at 4 and 5 say what the risky one gives up. If they're around, wait for their pick before building the kit; it's the one decision that's theirs. If they've said to go ahead, take your recommendation. Iterate by number ("2, but a lighter wordmark"); keep earlier rounds in `rounds/01/`, `rounds/02/` so nothing is lost.
7. **Refine** the chosen concept against `references/craft.md`: optical corrections, consistent radii and stroke weights, tracking, a simplified favicon if the mark has a detail under 1/32 of its size, and dark and one-colour versions. Write `brand.json`, including `direction` (the answers and the chosen weirdness), `about` (two short paragraphs for the guidelines' introduction), `construction` (one sentence on how the mark is built), a `usage` line per colour, and for the templates `website`, `contact` (a real person, or leave the placeholders) and `templates.background` (the field colour, when the primary is too close to black).
8. **Export and check.** Run `node scripts/export.mjs brand.json`, then read `dist/check.png`, every `dist/brand-guidelines-N.png` (six pages with templates), `dist/web/palette.png` (the export lists any colour pair below WCAG AA), `dist/social/og-image.png`, and the template previews (`templates/email/preview.png`, `templates/business-card/preview.png`, `templates/slides/slide-N.png`, `templates/social/*.png`) (the export warns if a page overflows Letter). Fix whatever fails the checklist below and export again. Expect at least two passes.
9. **Deliver** two ways at once: the files people preview (attach `brand-guidelines.pdf`, `check.png`, the main logo SVG, `social/og-image.png` and the template previews to the reply) and the one download that has everything (`<name>-brand-kit.zip`, which opens to the kit's `README.md`). Keep the draw script and `brand.json` with it, so the logo can be changed later by editing code. In a repo, the logo SVGs go where the site keeps its images and `icons/` goes in `public/` with `head.html` pasted into the layout. Say plainly that the logo hasn't been checked for trademark conflicts.

## Style rules (the short version; details in craft.md)

These are the rules at weirdness 1 and 2. From 3 up, `references/direction.md` says which ones may bend (asymmetry, then off-baseline letters and overlaps, then any of them). The review checklist below never bends.

- **Geometry** Build from circles, arcs, rectangles and polygons with numbers you chose: a 256 grid, integer or half-unit coordinates, angles of 0, 15, 30, 45, 60 or 90°, one corner radius and one stroke width per logo. Strokes are outlined: everything is a filled path, holes use `fill-rule="evenodd"`, and no shape is painted in the background colour to fake a hole.
- **Economy** Three to five shapes, one or two colours plus an optional accent, no gradients, filters, masks, shadows or `<text>`. Anything thinner than about 1/32 of the mark's height disappears at favicon size.
- **Type** One family for the wordmark; a second only for body text. Set it, then adjust it: tighten or loosen tracking, and modify at most one letter where the idea lives. Never fake bold, italic or condensed by stretching.
- **Lockups** The wordmark's cap height is about 40–55 % of the mark's height in a horizontal lockup, with a gap of about a third of the mark. The stacked version centres the word under the mark. Both use the same mark and word, just placed differently.
- **Colour** Start from the product's own tokens if it has them. One primary colour that passes 4.5:1 on white (it will carry the wordmark), an accent used on one part of the mark, and a paper and a dark. Every version must also work in pure black and pure white. The website palette grows from these four, so pick the paper and dark as the real page colours (a near-white and a near-black) and let the export make the rest.

## Review checklist (read check.png and the brand-guidelines pages)

- At 16 and 32 px the mark is still recognisably itself, not a smudge; the favicon reads in both the light and the dark tab.
- One-colour black, white on the ink, and white on the accent all hold, with no part relying on a second colour to be seen.
- The wordmark's spacing looks even (round letters a touch closer, no holes around `r`, `y`, `T`, `A`); the lockup looks balanced, with neither half shouting.
- The mark sits optically centred in the app icon and inside the circle on the maskable icon; the iOS icon has no transparency.
- No near-misses: edges that almost align, curves that almost meet, two radii or stroke widths that are nearly but not quite equal.
- Nothing in it is a cliché from the brief, and it isn't a near copy of a well-known logo. If it reminds you of one, change it.
- The SVGs have `viewBox`, a `<title>`, no `<text>`, no embedded raster, and each is under ~10 KB (wordmarks under ~25 KB).

## Templates

The export also makes the pieces every brand needs next, all from `brand.json` and following `references/templates.md`: an email signature, a business card, a slide template and social posts. They're samples with placeholder copy that says what goes where, so the person can use them directly or hand them to whoever makes the next thing. Set `"templates": false` to skip them. For a template the export doesn't make (a letterhead, a poster, merch), follow the same shared rules: one field colour, the logo version that matches the ground, the brand's two faces, and the accent once.
