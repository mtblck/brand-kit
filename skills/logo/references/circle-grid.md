# Circle-grid construction

A way of drawing a mark, not a kind of mark. Every curve in the finished shape is an arc of a circle from one small set of radii, and every shape is a union, overlap or cut of those circles. The result looks calm and even because the curvature repeats: the same few bends everywhere, nothing lumpy, nothing that's nearly but not quite round. It suits birds, leaves, drops, faces, fruit, letters with bowls: anything organic that should still look engineered. `examples/wren/` is the worked example.

## When to use it

- **Use it** for a figurative mark that has to look clean (an animal, a plant, a object with soft edges), for a family of icons that must match, and whenever "handmade or engineered" came back *engineered* or *in between*.
- **Don't** use it for a mark that is all straight lines (use the 256 grid and the angles in `craft.md`), or where the brief wants a drawn, wobbly feel (that's `smooth()`).
- It's a construction method, so it works at any weirdness level. At 4 and 5 it's what keeps a strange creature looking finished.

## The method

1. **Silhouette first.** Draw or describe the shape you want (with `smooth()` if it helps) and name its tells (`craft.md`, "Creatures and objects"). Designers fit circles to a sketch; they don't hope a shape falls out of a pile of circles.
2. **Pick the radius set.** One set per mark, five to seven sizes:
   - Fibonacci multiples, `fib(8, 6)` → 8, 16, 24, 40, 64, 104 on a 256 grid. The default: integers, so the coordinates stay readable.
   - Golden ratio, `series(10, 6)` → 10, 16.18, 26.18, 42.36 … The same rhythm, with decimals.
   - Or any three to five radii you choose. A set of 3 reads as more systematic than a set of 7.
3. **Build the big shapes from the big circles.** The body is one circle, the head another. Each part is a whole circle (`grid.c`), a lens where two circles overlap (`intersect`, for leaves, beaks, tails, petals) or a crescent where one is cut from another (`subtract`, for wings, moons, cheeks).
4. **Join parts with tangents and fillets.** Two arcs that meet should either cross at a deliberate point (a beak tip, a tail notch) or flow into each other. To round a V where two circles meet, use a fillet: a grid circle that touches both (`grid.fillet(a, b, step, side)`), unioned in. `grid.touch(c, step, deg, 'in'|'out')` places a circle exactly tangent to another, inside or outside.
5. **Cut the detail.** Eyes are small circles subtracted. A line inside the shape (a wing, a fold) is a crescent between two circles through the same two points (`through(p1, p2, r, side)` gives each centre); it tapers to nothing at both ends, which looks drawn rather than stamped. Keep its widest point at least 8 on 256, or it vanishes at 32 px.
6. **Check the set.** `grid.check()` throws if any circle isn't from the set. Fewer than about 15 circles in total; the 2012 Twitter bird used 15, and its designer kept them for "neutrality and simplicity" at small sizes.
7. **Correct by eye afterwards.** The grid gives consistency, not optics. Overshoot round parts, centre the mark by its visual weight, and if a tangent join still shows a kink (two arcs meeting with the same tangent but different curvature can), nudge the circle rather than adding points.

## The construction drawing

The construction is part of the pitch, so draw it, not just the mark.

- **Concept round:** `constructionSheet({ grid, body, flat, box })` makes three panels in a row, as a designer would present it: the circles over the mark in grey, the circles over the mark in colour, and the clean mark. Put it on the concept sheet beside the mark for any circle-grid concept.
- **Guidelines:** `constructionOverlay({ grid, mark, offset })` writes the circles alone in the mark's coordinates. Point `logos.mark.construction` at it in `brand.json` and the guidelines' construction panel lays it over the mark. Say what the set is in `construction` ("every curve is an arc of one of six circles, 8 to 104").

## Honesty about the golden ratio

Most "golden ratio logo" overlays are drawn after the fact. Apple's logo wasn't built that way (its designer drew it more or less freehand, and the big curves aren't even circular arcs), the Pepsi 2008 "breathtaking" document became a joke for claiming it, and any shape can be fitted with circles if "about 1.618" is loose enough. So:

- Only say a mark uses the golden ratio if `series()` built it. Otherwise say "a Fibonacci set" or "six radii", which is what it is.
- Sell the grid as consistency (the same curves everywhere, reproducible in code), never as magic.
- A grid doesn't make an idea. If the concept is weak, the circles just make it neat.

## Failure modes

- **Too many sizes.** Seven radii used once each is no system. Reuse the same two or three.
- **Bubble creatures.** Circles stuck together with V-notches between them look like clip art. Fillet the joins or let a crescent or lens carry the line.
- **Thin slivers.** Overlapping circles leave hairline points and crescents. Anything under 1/32 of the mark (8 on 256) disappears at favicon size: widen it, or remove it from the favicon.
- **Faking the grid.** A shape drawn with `smooth()` and then decorated with circles isn't circle-grid construction. Build it with the booleans so the claim is true.
