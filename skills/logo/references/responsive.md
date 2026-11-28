# Responsive logos

A responsive logo is one logo drawn as a set of steps, each made for a size range, from the full logo down to a 16 px favicon. Each step drops detail and thickens what's left; none of them is the big one shrunk. `examples/pinewood/` draws a four-step ladder: emblem, lockup, mark and favicon.

Every kit needs at least the mark and the favicon (`craft.md`, "The size ladder"). Design the whole ladder when the full logo has detail that dies early: an emblem, a long name, a mark with fine parts, or a detailed figure.

## The ladder

| Step | Size | What it drops | Where it's used |
|---|---|---|---|
| **Full** | 200 px and up | Nothing: emblem with words, or the lockup with a tagline | Headers, packaging, signs, the guidelines' cover |
| **Lockup** | about 120 px wide and up | The emblem's ring and words, the tagline | Site headers, email signatures, documents |
| **Mark** | 32 px and up | The name | App screens, avatars, social profiles, watermarks |
| **Favicon** | 16–32 px | Fine parts: thin lines, small holes, inner details | Browser tabs, bookmarks, small app icons |

Not every logo needs every step. A short wordmark may go straight from the word to a one-letter favicon. Write down the steps the brand needs in the brief.

## Rules

- **Redraw each step, don't shrink it.** Go down a step when a detail drops under about 1/32 of the height, and redraw the step with fewer, heavier parts. Pinewood's favicon has two tiers instead of three and a thicker trunk.
- **Keep the outline the same down the ladder.** The silhouette, the proportions and the main angles stay the same, so all four steps are clearly one logo. Only the number and weight of the parts change.
- **One colour logic.** The accent stays on the same element at every step, or drops out at the small steps. It never moves to another part.
- **Test each step at the bottom of its range.** Render the lockup at 120 px, the mark at 32 and the favicon at 16 on whole pixels (`render.mjs --width`), and look at them at 100 %.
- **Name the steps in `brand.json`.** `logos` carries each step's file and `minWidth`, and `icon.favicon` the favicon's own art. The export and the guidelines' minimum-size row follow them.

## Flexible systems

A step further is a **flexible system**: a fixed frame or structure whose inside changes. Examples are a ring that holds a different picture for each product, a grid of tiles in changing colours, or a mark whose accent shape shifts by season. Use it when a brand has sub-brands or many products.

- Fix the frame: the outer shape, the weights, the type and the place of the name. Only the inside changes.
- Write the rule for what changes, and draw three variants to prove it, before the user locks it.
- Keep one variant as the master logo for the favicon, the app icon and legal use.

## In the workflow

Draw the ladder in round 2, once a pick is clear: the full logo, its mark and its favicon side by side at real sizes. The kit is exported from the locked steps (`brand.json` `logos` and `icon`).
