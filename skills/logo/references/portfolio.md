# Portfolio art

The `portfolio` export is the art a case-study page (mattblack.space's work section, or any portfolio) and Ko-fi show for the project: a wide cover, the same scene re-framed for phones, a square icon, and one sentence of alt text. The covers are illustrations Claude draws for the project after the logo is locked. The icon comes from the logo.

| File | Size | Shown | Format and budget |
| --- | --- | --- | --- |
| `portfolio/cover.webp` | 2400 × 800 (3:1) | edge to edge across the top of the case-study sheet from 640 px wide up, at 1200 × 400 (2×); also the Ko-fi cover | WebP, under ~250 KB |
| `portfolio/cover-mobile.webp` | 1000 × 800 (5:4) | edge to edge at the top of the sheet under 640 px wide, at 500 × 400 (2×), about 312 px tall on an iPhone | WebP, under ~150 KB |
| `portfolio/cover.png`, `cover-mobile.png` | as above | the same covers, lossless, for a site or tool that takes no WebP (or to compress yourself) | PNG, no budget |
| `portfolio/cover.svg`, `cover-mobile.svg` | | the scenes as drawn, copied from their sources, for editing or a site that serves vector art | SVG |
| `portfolio/icon.png` | 512 × 512 | from 58 px on phones to 100 px on desktop; the site rounds the corners and adds the shadow | PNG, square corners, opaque, full bleed |
| `portfolio/alt.txt` | | the alt text of both covers | one sentence |
| `portfolio/preview.png` | | the three on a light and a dark page, as the sheet shows them, and the composition guides at real size | for checking, not for the site |

The page never crops the covers (the shape stays the same at every width), so what you draw is what shows.

## The idea in three lines

1. **One verb, one picture.** Find the one thing the product does to something (keeps what you save, traces pixels into shapes, collects figures) and draw that act, or its result, as a scene. Not a screenshot, a mock-up of the UI, a laptop or a dashboard.
2. **The product's own colours.** Ground, ink, one or two neutrals and the accent, from `brand.json`. The accent goes only on the part of the picture that *is* the verb.
3. **One viewpoint.** Strictly front-on (a flat elevation), straight top-down, or true isometric, never a mix. Shadows, flaps and lids follow the same view.

## Composition

- **A short banner.** The wide cover is three times as wide as tall. Put the subject in the **middle 60 %** of the width (x 480–1920 at 2400) and keep the **outer 40 px** as shown (80 px at 2400 and at 1000) **quiet** on both sides: only ground, a horizon or a faint texture, because the sheet rounds its top corners there. The bottom edge runs straight into the text, so nothing important sits on it.
- **Full bleed, its own ground.** The scene fills the frame edge to edge with its own background (sky and sea, a desk, a cutting mat, a tile map), never transparent: the covers sit on light and dark pages alike.
- **Re-frame, don't crop.** The phone cover is the same scene drawn again for 5:4: same subject, same viewpoint and colours, the subject bigger in the frame, fewer supporting pieces, everything moved in toward the middle. Draw both from one script with the width as a parameter (`examples/harbor/portfolio/draw.mjs`), so the two always match.
- **One focal point** near the optical centre (a touch above the middle). Everything else stays quieter than it. At 1200 × 400, and at 500 × 400, every part of the focal point should still read.
- **No words.** No text, numbers, third-party logos or likenesses: the page sets the project's name under the image. Covers used to carry the logo in a pill and an npm pill in the corners; they don't any more.
- **The logo, rarely.** The logo or name generally stays out of the picture. The exception is when the logo is part of the artwork: Logowright's own cover puts the mark on its construction grid in the middle because making that mark is what the product does, and Harbor's harbour arch and beacon are the mark built as architecture. A logo stuck on as a badge is never the exception.
- **Still.** Imply motion (a boat mid-crossing, a pencil at the end of its line) rather than blur or streaks.

## Style

- **Flat shapes.** Simple geometry, consistent corner radii; no gradients, filters or photos. One soft shadow at ≤ 12 % opacity is fine if it follows the viewpoint. A glow only when glow is the product's own look.
- **Colour count.** The brand's ground, ink, up to two neutrals and the accent, plus up to two muted material colours (wood, kraft, stone). A shade a step lighter or darker of a brand colour doesn't count against the limit.
- **Strokes.** If line-drawn: one weight for structure (at least 8 px at 2400, so 4 px as shown) and one lighter for detail, round caps and joins.
- **Detail.** Enough that it reads as made, never so much it reads as busy. Fine textures and hundreds of tiny shapes also blow the WebP budget.
- **Draw with a script**, computed geometry and `<use>` for repeated pieces, using `brand.mjs`'s shapes (`rect`, `circle`, `poly`, `arcBand`, `smooth`, `limb`) and `svg()`, and the product's real assets where they help (its sample image, its icon geometry). Never `<text>` and never an embedded raster.

Patterns that fit most projects:

| Pattern | When | Example |
| --- | --- | --- |
| **Split** | it turns one thing into another | the same badge as pixels on the left and traced shapes on the right |
| **Signature** | its output is visual and has a house style | a tile map filling the frame, a cursor laying the next tile |
| **Stand-in object** | it organises or collects real things | a retro board with one card lifted out; a vending machine of toy robots |
| **The name, drawn** | the name is an idiom that explains it | a square kitchen timer with the time left as a wedge |
| **Tool at work** | a utility with a physical analogue | a messy pile of scans and the same pages squared into a stack |

## The icon

One bold, simple shape that reads at 58 px, no text, square corners and full bleed. By default it is the app-icon art (`icon.file`) on its tile (`icon.background`) at `icon.scale`, the same as `icons/app-icon-1024.png`: if the project has a logo or favicon, that is the icon's focus. Set `portfolio.icon` to a square SVG only when the mark needs something different on this tile (a bigger crop, a simpler version); keep it full bleed and give it its own ground.

## Alt text

One sentence that says what the picture shows, plainly, for both covers: "Paper boats folded from pages sail across dark water toward a stone harbour arch, where a coral beacon glows and one boat already rests in the calm water inside." Not the marketing line, and not the project's name (the page shows it). Also put it in each cover SVG's `<title>`.

## brand.json

```json
"portfolio": {
  "cover": "portfolio/cover.svg",
  "mobile": "portfolio/cover-mobile.svg",
  "alt": "Paper boats folded from pages sail …",
  "icon": "portfolio/icon.svg",
  "background": "#cfe0ea"
}
```

`cover` (viewBox `0 0 2400 800`) and `mobile` (`0 0 1000 800`) are the drawn scenes; `icon` is optional; `background` fills behind the art before it's encoded, so a scene with a gap is never transparent (default the icon tile colour). Without `cover`, the export makes only the icon and says so.

## Checking

`node scripts/portfolio.mjs brand.json` remakes just `portfolio/` in a second or two, so draw, run, look, repeat. It warns when a cover is the wrong shape, has `<text>` or an embedded image, is over its budget even at the lowest quality it tries, or when a quiet edge is busy (more than 10 % of its pixels stand out from their row: a horizon is fine, a subject running into the corner isn't), and when the alt text is missing, longer than a sentence or names the project. Then read `portfolio/preview.png`:

- At 1200 × 400 and 500 × 400, can you say what the product does from the picture alone? Is the accent the first thing the eye lands on?
- The subject sits in the dashed middle 60 %; the hatched edges hold only ground or texture.
- Both covers look right on the light and the dark page, and the phone cover is the same scene, not a crop of it.
- The icon reads at 58 px.
- No words, no third-party logos; the logo appears only if it is part of the art.
- The alt text describes what both covers actually show.

## On a site

The files stay with the kit in the project's `brand/dist/portfolio/` (and its zip); copy them to wherever the portfolio site keeps project images. On a site of your own, serve `cover.webp` from 640 px wide up and `cover-mobile.webp` below, for example:

```html
<picture>
  <source media="(min-width: 640px)" srcset="cover.webp">
  <img src="cover-mobile.webp" width="1000" height="800" alt="…">
</picture>
```

The Ko-fi page cover is `cover.webp` as it is (Ko-fi shows a 3:1 banner).
