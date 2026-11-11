# Creative direction

The brief (workflow step 1) collects facts Claude can usually find in the project. Direction is taste, which no README holds, so Claude asks for it. Ask once, in one message, before writing concepts. Every question has a default, so "go with your gut" or no answer at all is fine. Save the answers in `brand.json` under `direction` (see `brand-json.md`) so a later round or a refresh starts from them.

## The questions

Send these together, short, with the defaults shown. Skip any the user has already answered in their request.

1. **First impression.** "Pick three words for how it should feel at first glance, or give me yours." Offer about sixteen: calm, sharp, warm, nerdy, luxurious, scrappy, friendly, precise, rebellious, playful, trustworthy, bold, quiet, crafted, strange, fast. *Default: Claude's three from the brief.*
2. **Four quick either/ors.** Serious or playful. Classic or futuristic. Quiet or loud. Handmade or engineered. "In between" is an answer. *Default: in between.*
3. **References.** "One or two brands, from any category, whose look you like, and one you don't want to resemble." *Default: none.*
4. **Where it lives most.** App icon or favicon, website header, print and merch, or social avatar. *Default: website.*
5. **Weirdness, 1 to 5.** Give the one-line description of each level from the table below. *Default: a spread (see below).*

Don't ask whether they want a symbol, lettermark or wordmark: the concepts already vary structure, and asking first narrows the round before anyone has seen options. If the user volunteers it, follow it.

If the user is away, don't wait. Take the defaults, say so in the checkpoint message, and let the round itself do the asking.

## How the answers shape the work

| Answer | What it changes |
|---|---|
| Three words | Which voices from `typefaces.json` go on the specimen sheet; the warmth and saturation of the palette; the adjectives line of the brief. |
| Serious or playful | Type voice (grotesque, serif-modern, serif-classic toward rounded and display) and corner radius (sharp toward soft). |
| Classic or futuristic | Serif-classic and slab toward geometric, condensed and mono; traditional emblems toward abstract marks. |
| Quiet or loud | Colour contrast and saturation, the weight of the wordmark, and how much of the mark the accent covers. |
| Handmade or engineered | Strict grid geometry with even strokes, or shapes that feel drawn: a slightly irregular curve, an uneven tile, a deliberate wobble that is still built from numbers you chose. |
| References | Qualities to borrow, named in the concept notes ("the confidence of X's wordmark"). Every concept is checked against the brands named so none is a near copy. |
| Where it lives | App icon or favicon first: a symbol or lettermark that fills a square. Website header or print: a wordmark-led logo is fine. Avatar first: the mark must sit well in a circle. |
| Weirdness | How far concepts may stray, which type voices are in play, how bold the colour gets, and which style rules may bend (below). |

## The weirdness dial

| Level | Name | Concepts | Type voices | Colour | Rules that may bend |
|---|---|---|---|---|---|
| 1 | Quiet | The literal idea, or just the name. A wordmark or a simple lettermark. | Grotesque, geometric, serif-modern. No modified letters. | The primary and a neutral; the accent is optional and small. | None. |
| 2 | Considered | One clever idea: a modified letter, a shape found inside a letter, a mark that doubles as something. | Adds humanist, serif-classic and slab. One letter may change. | Primary plus one accent, used once. | None. The Harbor example sits here. |
| 3 | Characterful | A less obvious metaphor, about what the product feels like rather than what it does. | Adds rounded, display, condensed, chunky, stencil, marker and odd-serif. | A brighter accent; a two-colour mark is fine. | Asymmetry. |
| 4 | Odd | Lateral metaphors from the far end of the concept list; a character or object built from the letters. | Adds script, mono, retro, pixel and blackletter; mixed weights within the wordmark. The mark's object may stand in for part of one letter (a stem, a counter, a dot), in the accent. | Unexpected pairings (acid green with maroon, violet with rust), still passing contrast. | Letters off the baseline, overlapping shapes, a broken grid that still snaps to half units. |
| 5 | Weird | The joke, the dream, the wrong answer on purpose, and the weirdness is in the idea's structure: two things fused into one, a thing cut apart and reused, something doing what it can't (see "What makes a 5"). Write fifteen or more concepts and keep the strangest three that still pass small sizes and the silhouette test. | Adds experimental (glitched, dripping, inflated, striped type that is the idea by itself). Any face in `typefaces.json`, or any Google Font added with `--font`, including the one nobody would pick. The word and the mark can merge: the idea splits, holds or swallows the word. | Anything that passes contrast. | Any style rule in `SKILL.md`, but none of the review checklist. |

`examples/harbor/weirdness/` draws the Harbor brief at the other four levels (Harbor as shipped is the 2): 1, an H tile and a grotesque wordmark; 3, a paper boat with a rounded face; 4, a crab holding a bookmark up between its claws, with a bookmark for the stem of the wordmark's b; 5, a whale cut in half and stood up as bookends around a bookmark, with the wordmark split by a bookmark the same way. Read its `draw.mjs` to see how far each level goes in code.

For a sense of scale on another brief, Tinkerkit (a browser pixel-art game maker) at each level: 1, TINKERKIT in a clean grotesque, ink only, with a single brass square for a full stop. 2, a T built from pixel tiles. 3, a pixel spanner whose jaw is a D-pad. 4, a small pixel creature whose body is the letter K, holding a wrench. 5, a wordmark where every letter is a different tool, beside a melting gear.

**What never changes with the dial:** the review checklist (16 px, one colour, the dark tab, no gradients, filters or raster), clean SVG under the size limits, WCAG AA on the website palette, and the near-copy check. Weird still has to work as a logo.

`specimen.mjs --weirdness 4` sets the name in the voices that open at a level (3,4 for two levels), so the type on the sheet matches the dial. Decorative faces have their own rules in `craft.md`, "Decorative faces".

### No level given: the spread

If the user doesn't pick a level, round 1 shows the three concepts at different levels: one at 2, one at 3 and one at 4, labelled with their level. Most people can't say how weird they want to go until they see it, and the pick tells you. Round 2 and the refinement stay at the level of the chosen concept, and `direction.weirdness` records it.

If they did pick a level, all three concepts sit at that level and differ by metaphor and structure, as usual.

### Putting the mark into the word

How far the mark's idea gets into the wordmark rises with the level. At 1 the word is set and left alone. At 2 and 3 one letter may be modified in its own colour (a counter becomes a round dot, a terminal is cut). At 4 the mark's object can replace part of one letter outright, in the accent, and still be read as the object: the bookmark as the stem of a b, a beacon as the dot of an i. At 5 the word and mark can merge entirely. Whatever replaces part of a letter must keep the letter readable at the wordmark's minimum width, and its colour needs 4.5:1 against the ground, because it is now part of the text.

### What makes a 5

A 4 puts an unexpected thing in the logo. A 5 changes what the thing *is*. The test: if the concept can be said as "an X with a Y on it, or in it" (a whale with a bookmark for a spout, a crab holding a bookmark), it's a 4 at most. A 5 reads as "an X that is a Y" or "an X doing something it can't": a whale cut in half and used as bookends, a whale whose open mouth swallows the wordmark, a lighthouse made of stacked pages.

Ways to get there, from the concept list:

- **Fuse two things into one object** instead of placing them side by side: the metaphor and the product's own thing (the whale and the bookmark become one piece of furniture).
- **Cut, split or reassemble** something familiar so it does a new job.
- **Break physics or scale:** something huge held by something tiny, something soft used as something hard.
- **Make the logo hold the word:** the wordmark lives inside the mark, or the mark's idea runs through the word (the bookmark splits "har" from "bor").

Decoration doesn't raise the level: an odd colour, a circle on a body, tilted or bobbing letters are level 3 or 4 moves. If the weirdest thing about a level 5 concept is its colour or its type, start again from the concept list.

### Weird still has to be well drawn

Levels 4 and 5 usually mean a creature, a character or an object, and those fail in a different way from geometric marks: they stop reading as the thing. Before a level 4 or 5 concept goes on the sheet, it passes the rules in `craft.md` under "Creatures and objects": the tells named and largest, the silhouette test, one connected outline, the idea at least a fifth of the mark, and at least three drafted silhouettes with two refining passes. The extra drafting is the cost of the extra weirdness; a quick weird mark looks rushed, not bold.

### At the checkpoint

Label each concept with its level. At 4 and 5, say plainly which concept is the risky one and what it gives up (recognisability, seriousness, ease of use on a busy background), so a wild pick is an informed one. Your recommendation can be any level; don't default to the safest.
