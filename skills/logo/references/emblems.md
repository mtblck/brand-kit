# Emblems and badges

An emblem sets the mark inside a shape (a seal, a ring, a shield, a patch, a label) and usually puts the name or a line of words round it. Think of a brewery's roundel, a park service patch or a coffee roaster's stamp. Emblems suit crafts, food and drink, clubs, outdoor brands and anything that wants heritage or a made-by-hand feel. `examples/pinewood/` draws one: a pine in a double ring, with the name round the top and the year round the bottom.

An emblem is never the only logo. Its words are unreadable under about 120 px, so every emblem comes with a simpler **inner mark** (the picture alone, or the picture in the bare shape) for the favicon, app icon and small uses (`references/responsive.md`).

## Shapes

| Shape | Feel | Notes |
|---|---|---|
| **Roundel** (a circle, or two rings) | Seals, stamps, coins | Words fit round the top and bottom. The easiest emblem to make well. |
| **Shield** | Clubs, schools, protection | Words go on a banner across it or under it, not round it. |
| **Badge / patch** (rounded rectangle, hexagon) | Outdoor, scouting, workwear | A border stitched or doubled; words on a straight line top and bottom. |
| **Label** (a rectangle with clipped or notched corners) | Food, drink, apothecary | Words set straight, centred; a rule or two between lines. |
| **Ribbon banner** across another shape | Heritage, awards | Draw the ribbon's folds as shapes, not strokes; keep it to one per emblem. |

## Anatomy

From the outside in, for a roundel:

1. **Border.** One heavy ring, or a heavy ring and a fine one (the logo's two weights, `craft.md`). A ring of dots or rope reads as decoration; save it for weirdness 3 and up.
2. **Word band.** The name round the top, reading clockwise, and a short line round the bottom reading left to right (a place, a year, what the business does). Use `arcText()` from `geometry.mjs`: give both lines the same `r` and they sit in one band. Capitals, tracked out (0.08–0.16), in the display face's heavier weight.
3. **Dividers.** Where the top and bottom lines meet (left and right), a small star, dot or diamond, sized to the capitals. They stop the two lines reading as one.
4. **Inner ring** (optional), fine weight, between the words and the picture.
5. **The picture.** The inner mark, filling about 60–70 % of the inner circle's diameter, sitting on a ground line or centred.

## Rules

- **Words fit the band, not the other way round.** Size the capitals so the top line spans 100–150° of the circle. More than that and the letters at its ends tip too far; shorten the line (drop "Company", "The") before shrinking the type.
- **The bottom line reads upright.** `arcText(..., { bottom: true })` sets it with the letters' tops toward the centre, so it reads left to right. Never run it upside down round the bottom.
- **Even gaps.** The band's space above the capitals equals the space below. Check the bottom line too: round figures and capitals sit on different baselines in some faces.
- **One picture, one idea.** An emblem can carry more detail than a symbol, but still one object and its ground, not a scene.
- **Two weights, one colour first.** The border and the picture in the heavy weight, the inner ring and any rules in the fine one. Design it in one colour, then add the accent to one element.
- **Check it at 120 px.** Below that the words are texture. If the picture also turns to mush at 120 px, it has too much detail.
- **Make the inner mark at the same time.** Draw the picture alone at 256 and its favicon version before calling the emblem done.

## In the round 1 grid

When the brief points to a craft, a place or heritage (step 1's category audit), give emblems a row of the 3 × 3 grid with three different shapes or pictures. Sketch the words as real type with `arcText()`, since an emblem's character is mostly in its lettering.
