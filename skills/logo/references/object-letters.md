# Object letters

An object letter is a letter of the name built out of things from the brand's world, so the picture comes first and the letter appears second. Logowright's own mark (`brand/` at the top of this repo, every round kept in `brand/rounds/`) is one: a drafting compass seen from its top, whose arms and legs come down to two points and make a W, with the north star in front. "Wright" led to shipwright, then to navigation and drawing, so both objects come from one world and each adds a meaning.

It sits between a symbol and a lettermark. A symbol has no letter. A lettermark is a letter with one detail changed. An object letter is an object that already holds most of a letter, finished by its own parts. It's creative and illustrative, and it still reads at 32 px as the initial.

A close cousin is the **pictorial wordmark**, where one letter in the set word is replaced by an object (an `o` drawn as a ship's wheel). Use the same recipe for that one letter, and make sure the object sits on the type's baseline, x-height and stroke weight.

## The recipe

1. **Find the world in the name.** Take the name apart: its roots, its suffix and what it sounds like (wright → shipwright → ships, navigation, drafting). Also ask what the product *does* (draws, measures, guides). Pick one world that fits both. If the name has no world, this isn't the structure for it.
2. **List the iconography before you sketch.** Write ten or more objects from that world (compass, dividers, north star, sail, wheel, anchor, rope, sextant, lighthouse, hull). Cross out the category clichés from the brief and anything that only reads in colour.
3. **Choose the main object by its outline.** The main object must already contain the letter's skeleton: a drafting compass's two arms and hinge are most of a V or W; an anchor is a J or a T; a mast and boom is an L; a sail is a D or a P. Draw the letter's strokes over a photo-simple outline of each candidate and keep the ones where most of the strokes are already there. The main object carries the outline, the heavy weight and the silhouette at 16 px.
4. **Add one supporting symbol in the accent colour.** A second object from the same world, smaller, in the one accent colour: the north star in front of the compass's feet. It adds a second meaning and gives the eye a place to land. One only; it's the logo's one accent.
5. **Finish the letter with the object's own parts.** The strokes that complete the letter must be parts the object really has, continued or turned (the compass's legs fixed into the arms' feet). Nothing is added only to spell the letter. Use the logo's two weights: the main object's heavy strokes, and its fine parts at about half (`craft.md`).

## Rules

- **The object leads and the letter appears.** If the letter is drawn first and the object is stuck onto it (a compass top on the middle of a W), or the object sits on top of the letter, it fails. Logowright's round 3 did this and was rejected; round 4 turned the compass's own arms into the W.
- **Two or three objects at most, all from one world.** A compass, a star and a wave is already crowded.
- **Check it doesn't read as something else.** Look at it small, upside down and blurred. Logowright's round 1c #1 (dividers with a star at the hinge) read as a Christmas tree.
- **The supporting symbol is big enough to read alone.** At 32 px the star in front of the compass is still a star. If it shrinks to a dot, make it bigger or leave it out of the favicon.
- **Keep a real object's logic.** A hinge is round and its hole is whole; a leg is fixed into a foot. Viewers notice when an object couldn't be built.
- **The favicon may simplify.** Thicken the fine parts so the letter holds at 16 px (Logowright's favicon draws the legs, ring and handle at 16 instead of 10).

## In the round 1 grid

When the name points to a world, give object letters one row of the 3 × 3 grid (in place of lettermark or monogram), with a different main object in each column. Pick the main object from its outline (step 3) before drawing, and say in the cell's note which object and which letter it is.

## Building it

Draw it on the 256 grid with `geometry.mjs`: `bar` for straight arms and legs, `circle` and `subtract` for rings and holes, `union` to join the parts, and `dilate` to cut a clear gap round the supporting symbol so it stands in front. Cut holes last, after every union, so no boolean edge is left inside them. Logowright's `brand/draw.mjs` (`compass()`) is the worked example; its parameters (arm and leg weights, foot and top points, hinge, star radius and gap) are the knobs to tune by eye.
