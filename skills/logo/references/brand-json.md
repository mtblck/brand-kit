# brand.json

One file describes a brand; `scripts/export.mjs` turns it into every deliverable. File paths are relative to `brand.json`. Only `name` and either `logos.mark` or `icon.file` are required.

```json
{
  "name": "Harbor",
  "shortName": "Harbor",
  "tagline": "Everything you saved, safe in one place.",
  "colors": [
    { "name": "Deep Water", "hex": "#12324a", "role": "primary" },
    { "name": "Signal", "hex": "#f0643c", "role": "accent" },
    { "name": "Sand", "hex": "#f6f1e7", "role": "paper" },
    { "name": "Mist", "hex": "#cfe0ea", "role": "support" }
  ],
  "type": {
    "display": { "family": "Space Grotesk", "weight": 700 },
    "text": { "family": "Inter", "weight": 400 }
  },
  "logos": {
    "mark": { "file": "mark.svg", "dark": "mark-dark.svg", "minWidth": 16 },
    "horizontal": { "file": "logo-horizontal.svg", "dark": "logo-horizontal-dark.svg", "minWidth": 96 },
    "stacked": { "file": "logo-stacked.svg", "dark": "logo-stacked-dark.svg", "minWidth": 64 }
  },
  "icon": {
    "file": "mark-dark.svg",
    "background": "#12324a",
    "favicon": "favicon.svg"
  },
  "clearSpace": 0.25,
  "pngWidths": [256, 512, 1024, 2048],
  "out": "dist"
}
```

| Field | Meaning |
|---|---|
| `name`, `shortName` | Brand name (guidelines, page titles, manifest). `shortName` is the home-screen label, at most 12 characters. |
| `tagline` | Optional line for the guidelines' cover and type sample, and under the logo on the link-preview image. |
| `about` | One or two short paragraphs (split with a blank line, `\n\n`) introducing the brand on the guidelines' cover. Keep it under ~90 words or page 1 overflows. |
| `version` | Guidelines version, default `1.0`. |
| `construction` | One sentence on how the mark is built, under the construction drawing. |
| `colors[]` | `name`, `hex`, `role`, optional `usage` (one sentence: where this colour goes). Roles the export uses: `primary` (one-colour reversed ground, CSS), `accent` (white-on-accent test), `paper` (default icon tile, sheet hero), `dark` (dark grounds; defaults to the darkest colour). Any other role is listed and exported as a CSS variable. |
| `type.display`, `type.text` | Google Font `family` and `weight` for the wordmark and headings, and for body copy. The guidelines load them live for the specimens. |
| `logos.<key>` | Any number of logos. `mark` is special: it drives the size ramp, clear-space diagram and one-colour tests. Usual keys: `mark`, `horizontal`, `stacked`, `wordmark`. `file` is the light-ground version; `dark` is the version for dark grounds; `minWidth` is in px. `black` (or `white`) is a hand-drawn one-colour version, needed when the logo sits on its own tile or relies on two colours touching; it is recoloured to make both. Without it, the main file is recoloured. `mono: false` skips the one-colour versions. `construction` (on `mark`) is an SVG of the construction lines alone in the mark's own coordinates, as `constructionOverlay()` in `geometry.mjs` writes it; the guidelines lay it over the mark on the construction panel and the export copies it to `svg/mark-construction.svg`. |
| `icon.file` | The art placed on icon tiles (usually the mark, or its dark version on a dark tile). Defaults to `logos.mark.file`. |
| `icon.background` | Tile colour for apple-touch, PWA, maskable and 1024 app icons. Defaults to the paper colour. |
| `icon.scale`, `icon.maskableScale` | Share of the tile the art fills: 0.62 and 0.5 by default. |
| `icon.favicon` | A separate SVG for 16–48 px (simplified, or already on its own tile). Defaults to `icon.file`. |
| `icon.faviconBackground`, `icon.faviconScale` | Put the favicon art on a rounded tile of this colour (scale default 0.78). Use this when the mark alone vanishes in a light or dark tab. |
| `icon.themeColor` | Browser and manifest theme colour; defaults to the tile colour. |
| `clearSpace` | Clear space as a share of the mark's height (default 0.25). |
| `pngWidths` | Widths for logo PNGs. One-colour versions get one 1024 px PNG each. |
| `social.background` | Background of `social/og-image.png` (default the paper colour). It shows the horizontal lockup (or the next logo that exists), the tagline in the display face, and an accent bar along the bottom. |
| `social.avatarBackground`, `social.avatarScale` | Background and art size of `social/avatar.png`. Default the icon tile and `icon.maskableScale` (or 0.6), so the art survives the circle crop most sites apply. |
| `website` | The site, without `https://`, for the email signature, business card, closing slide and posts. |
| `contact` | `{ name, role, email, phone }` for the email signature and business card. Defaults are placeholders ("Your Name", "Role", `you@<website>`). |
| `exports` | Which optional parts of the kit to make: `"all"` (the default) or a list of ids: `icons`, `guidelines`, `palette`, `social`, `email`, `card`, `slides`, `posts`, `portfolio` (`templates` stands for the four templates). The logo files (SVG, PNG, PDF), `check.png`, `README.md`, `LICENSE`, `TRADEMARKS.md` and the zip are always made. A part dropped from the list is removed from `out` at the next export. `node scripts/exports.mjs` shows the menu; `export.mjs --exports a,b` overrides the list for one run. |
| `templates` | `false` skips the templates (the same as leaving `email`, `card`, `slides` and `posts` out of `exports`; ignored when `exports` is a list). `templates.background` is the field colour for card fronts, title slides and posts (default the primary colour). `templates.email.logoUrl` is where the signature's `logo.png` is hosted (until set, the HTML points at the local file). `templates.social.headline` and `.kicker` replace the sample post copy (default the tagline and website). |
| `palette` | The website palette in `web/` (see `references/palette.md`). Made from the colours above with no settings: `primary` is the brand, `accent` the accent, `paper` the light page and `dark` the dark page. Optional: `brand` and `accent` (hex, to override the roles; `accent: false` leaves it out), `neutral` (hex whose hue tints the greys), `status` (`{ success, warning, danger, info }` hexes to use instead of generated ones), `harmonize: false` (keep the status hues from leaning toward the brand). `false` skips it, as does leaving `palette` out of `exports`. |
| `direction` | Optional record of the creative direction (see `direction.md`): `words` (three adjectives), `pairs` (`{ tone, era, volume, finish }`, each a side such as `"playful"` or `"between"`), `references` (`{ like: [], avoid: [] }`), `lives` (`app`, `web`, `print` or `avatar`) and `weirdness` (1 to 5, the level of the chosen concept). The export ignores it; it is there so a later round or refresh starts from the same direction. |
| `legal` | For the brand's own `LICENSE` and `TRADEMARKS.md` (`legal.mjs`): `owner` (who holds the rights; default the brand name), `year` (default this year), `contact` (where to ask for permission; default `contact.email`, then the website; it goes into public files, so use an address meant to be public), `codeLicense` (the code license's name, such as `"MIT"`; default read from the repo's LICENSE). The brand is always excluded from the code license; there is no setting to include it. |
| `portfolio` | The portfolio art (see `references/portfolio.md`): `cover` (a 2400 × 800 SVG scene drawn for the project), `mobile` (the same scene re-framed at 1000 × 800), `alt` (one sentence describing it), optional `icon` (a square, full-bleed SVG; default the app-icon art on its tile) and `background` (filled behind the art; default the icon tile). Written to `portfolio/` as `cover.webp`, `cover-mobile.webp`, `icon.png`, `alt.txt` and `preview.png`. Without `cover` only the icon is made. |
| `out` | Output folder (default `dist`), inside the `brand/` folder. |

`node export.mjs brand.json --only icons` writes just `icons/` and `check.png` (no logos, guidelines, social images, PDFs or zip), which is what the `icons` skill uses for an existing logo.
