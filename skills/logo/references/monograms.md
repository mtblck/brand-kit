# Monograms

A monogram is two or three initials combined into one mark: Louis Vuitton's LV (1896, partly to stop counterfeits), the Yankees' NY (from an 1877 Tiffany medal), Chanel's CC. It suits long names, names made of two words ("Marlow & Finch"), personal brands, and anything that wants heritage or a stamp-like signature. A single initial is a lettermark (see `craft.md`). `examples/marlow/` draws M and F three ways.

## Structures

Pick the structure from the letters, not the other way round. Concepts should try at least two.

| Structure | How it works | Suits |
|---|---|---|
| **Shared stem (ligature)** | One stroke belongs to both letters: the F stands on the M's right stem, the N's left stem is the D's. | Letters with vertical stems (B D E F H I K L M N P R). The easiest strong monogram. |
| **Stepped** | The second letter is raised or lowered, so its distinctive part (the F's arms) clears the first letter's shoulder. | Shared stems in serif faces, where the serifs would otherwise collide. Often combined with a shared stem. |
| **Interlocking (woven)** | Letters cross, and at each crossing one passes over with a small gap and the other under, alternating. | Round and diagonal letters (C G O Q S, A V W X). Hard with two straight-sided letters: crossings crowd. |
| **Nested** | One letter sits inside the other's counter or V. | A big open letter (C, O, U, V, D) holding a narrow one (I, J, L, T). |
| **Contained** | The letters sit in, or finish at, a frame: a ring, square, shield or diamond. Lines can run out to the frame and stop. | Monoline geometric styles; emblems; anything that will live as a round avatar. |
| **Knockout** | The letters are cut out of a solid shape (a tile, a disc). | App icons and favicons: it already is one. |
| **Negative space** | One letter is formed by the gap inside or between the other's strokes. | Rarely works on the first try; when it does, it's the most memorable. |

## Letter pairs

The 1895 *Studio* rule still helps: sort the letters by stroke family before pairing.

- **Straight** E F H I L T: share stems easily.
- **Diagonal** A V W X, and the mixed K M N Y Z: nest and cross; diagonals that meet stems give natural joins.
- **Round** C G O Q S, and the bowls B D P R: enclose, or cross a straight letter through the bowl.

Same-family pairs share strokes; a round letter with a straight one usually encloses or is crossed. Two rounds need careful counters or concentric nesting. Every pair is solvable, but each needs its own structural idea; don't force one structure on every name.

## Rules

- **Reading order.** It must be clear which letter comes first. The first initial is on the left or on top, and usually at the same size or larger. In a traditional three-letter personal monogram the surname initial is in the middle and largest; for a brand, keep the name's order.
- **Each letter survives alone.** Mentally lift each letter out: is it still that letter? If a shared stroke makes the M read as an N, or the pair reads as another pair (an MRV once read as "PJ"), change the structure.
- **Matched weights.** Same family, same weight, same stroke width in monoline. One bold letter beside one thin letter looks like a mistake unless it's the point (a hairline frame around bold letters).
- **Fix the collisions.** Where serifs, terminals or crossbars land inside the other letter, remove or trim them (`intersect`/`subtract` with a rectangle). The Marlow serif drops the F's foot and half of the M's top serif.
- **Weave gaps.** A gap is about a third of the stroke width (5 to 6 on a 14–16 stroke). Crossings need to be at least two stroke widths apart, or the gaps merge into noise. Alternate over and under.
- **Small size.** Check it at 32 and 16 px. Hairlines in high-contrast serifs vanish; a weave's gaps close up. Make a heavier favicon version or use the knockout tile there.
- **Rotate and mirror.** Turn it 90°, 180° and 270° and flip it. Two letters can make a third letter, a symbol or something rude. Fix it before anyone else sees it.
- **Not from a generator.** The Etsy and wedding looks (a script initial in a circle, a vine wreath, a split circle, letters in a thin serif stacked on a diamond) are the default set every logo maker offers. Avoid them unless the brand is personal or bridal, and even then make one decision of your own.
- **Trademarks.** Two-letter marks are densely registered, and LV, CC, GG, YSL, NY are everywhere. Say plainly that a monogram needs a clearance search.

## Styles and what they signal

- **High-contrast serif** (Bodoni Moda, Playfair Display, Prata, DM Serif Display): heritage, fashion, luxury. Luxury brands swung to plain geometric sans around 2012–2018 ("blanding") and are swinging back to serifs now: it's a cycle, not a rule.
- **Classic serif** (Cormorant Garamond, EB Garamond, Libre Caslon): books, law, wine, craft.
- **Monoline geometric** (draw it with `bar()` and `polyline()` at one stroke width, or a light geometric sans): modern, architectural, tech-adjacent. Pairs with a ring or square frame.
- **Bold sans ligature** (Outfit, Manrope, Archivo at 700+): plain and robust, the one that survives an app icon.

## Building one in code

`scripts/geometry.mjs` has the tools; `examples/marlow/draw.mjs` uses all of them.

```js
import { loadFont, text, rect } from '../../scripts/brand.mjs'
import { solid, bounds, union, subtract, intersect, bar, polyline, weave, knockout } from '../../scripts/geometry.mjs'

const font = await loadFont('Bodoni Moda', 600)
const M = solid(text(font, 'M', { size: 180, x: 20, y: 200 }).d) // always solid() a glyph before booleans
```

- `solid(d)` turns a glyph from `text()` into one clean outline. Fonts draw letters as overlapping pieces (an F's arms overlap its stem), which the booleans would read as holes. Do it first, every time.
- Find a stem to share by slicing the letter: `bounds(intersect(glyph, bar(x0, y, 1e3, y, 2)))` gives the stroke's left edge and width at height `y`. Align the two stems' centres.
- `union()` merges the letters into one path; `subtract()` and `intersect()` with `rect()` trim serifs and clip lines to a frame.
- `bar(x1, y1, x2, y2, w)` is a straight stroke with square ends; `polyline(points, w)` is a mitred stroke through several points (an M's V in one piece). Clip very acute corners, which spike.
- `weave(over, under, { gap, at })` cuts a gap in `under` around `over`, but only inside the `at` circles placed on the crossings you choose. Call it once each way for an over-under weave. `knockout(top, bottom, gap)` puts one letter fully in front of another.
- Render the monograms side by side at 200 px and at 32 px on one sheet, as `examples/marlow/monograms.svg` does, and look at the small ones first.
