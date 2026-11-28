# Negative-space marks

A negative-space mark is one shape that reads two ways: the solid is one thing and the gap in or beside it is another. Think of the arrow between the E and x in FedEx, or a tree cut out of a mountain. When it works it's the most memorable kind of mark, because the viewer finds the second reading themselves. `examples/pinewood/` draws one: a mountain with a pine cut out of its foot, so the gap is the tree.

It's easy to make a shape with a hole in it, and hard to make a hole that's a picture. Plan for most attempts to fail, and sketch several before choosing.

## Ways to make one

| Method | How | Example |
|---|---|---|
| **Cut-out** | Subtract the second shape from the first, as a knockout that reaches an edge. | A pine cut from a mountain's foot; a keyhole in a house. |
| **Between two shapes** | Place two solids so the gap between them makes the second shape. | Two faces whose gap is a vase; two leaves whose gap is a drop. |
| **Inside a letter** | Shape a letter's counter (the hole in an o, the gap in an A) into the second picture. | An A whose counter is a tent; an e whose eye is a leaf. |
| **Figure–ground swap** | The same outline reads as an object on its own and as a gap in a field. | A bird that's also the space between two hills. |

## Rules

- **Both readings come from one idea.** The two shapes must belong together (a tree on a mountain, an arrow inside a delivery company's name). Two unrelated pictures in one mark is a puzzle, not a logo.
- **The gap must reach an edge, or be big.** A closed hole smaller than a third of the mark's width is a hole. A gap that opens to the outside (the tree's trunk running out of the mountain's foot) lets the eye read it as a figure.
- **Give the gap a real silhouette.** The negative shape needs the detail that makes it recognisable (a pine's tiers, an arrow's head). Draw it as a positive shape first, check it reads alone at 32 px, then cut it.
- **Weight the solid around the gap.** Keep at least the logo's fine weight (about 1/20 of the mark's height) of solid between the gap and the outside, or the edge breaks at small sizes.
- **Check both readings at 32 px.** Render it small and ask whether you still see both things. If the second reading is gone, open up the gap or simplify both shapes.
- **Check it reversed.** In white on a dark ground the gap becomes the dark shape. Make sure it still reads, and that it doesn't read as something you didn't mean.

## Building it

Draw the outer shape and the gap's shape as separate paths, then `subtract(outer, gap)` from `geometry.mjs`. For a gap between two shapes, `union` the two solids and look at what's left between them; move the solids, not the gap. Cut all gaps last, after every union, so no boolean edge is left inside them.

## In the round 1 grid

Negative space suits a symbol cell or a lettermark cell (a shaped counter). Try one per round when two objects from the brief belong together. Say in the cell's note what the two readings are, so the user knows what to look for.
