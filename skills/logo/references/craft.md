# Logo craft

The rules `logo` draws by. Read the section you need: before drawing, before lockups, before icons.

## Choosing the structure

| Structure | When it fits | Watch out for |
|---|---|---|
| **Symbol + wordmark** | Most products: the symbol becomes the app icon and favicon, the lockup does the rest | Two ideas in one logo. The symbol carries the idea; the wordmark stays plain |
| **Lettermark** | Long names, or names whose initial is distinctive | An initial in a circle is not a concept. Find something the letter can *do* |
| **Monogram** | Two-word names, initials, personal and heritage brands | Generator clichés and unreadable pairs. Choose the structure from the letters (`monograms.md`) |
| **Wordmark only** | Short, distinctive names; editorial or fashion voice | It still needs a favicon: take one letter, or the word's distinctive detail |
| **Wordmark with one modified letter** | The idea lives in a letter (a counter becomes a lens, a stem becomes a pin) | Modify one letter only, and keep it readable as that letter |
| **Abstract mark** | The product is abstract (infrastructure, finance, a platform) | Generic blobs and swooshes. Base it on a real property of the product, like flow, layers or a grid |
| **Emblem / badge** | Crafts, food and drink, clubs, heritage | Detail that dies at small sizes: make a simplified inner mark for icons |
| **Dynamic** | A system that changes (per person, per season, per page) | Variety that loses the brand: MIT Media Lab's 40,000 generated marks were replaced because nothing stayed constant. Keep one fixed element |

Construction is a separate choice from structure. Any figurative or round mark can be built on a **circle grid** (every curve an arc of one set of circles; see `circle-grid.md`), which is what makes a bird or a leaf look engineered rather than drawn.

## Construction

- **Grid** Draw a symbol on a 256 × 256 grid and trim the final `viewBox` to the art's bounds (the `harbor` example trims to 208). Coordinates are integers or halves; only computed curve points may carry two decimals.
- **Shape vocabulary** Circles, arcs (`arcBand`), rectangles with one shared radius, regular polygons (`ngon`), and straight cuts at 0/15/30/45/60/90°. A logo that uses three of these reads as designed; one that uses all of them reads as noise.
- **Weights** One structural thickness for every band and stem (say 32–40 on a 256 grid for a bold mark, 20–24 for a light one), and at most one secondary thickness at about half of it. Two weights that differ by under 20 % look like a mistake.
- **Radii** One corner radius for the whole logo, or zero. Inner corners of a band are its outer radius minus its width.
- **Holes and overlaps** Holes are subpaths with `fill-rule="evenodd"` (or cut out of the geometry). Never paint a shape in the background colour to fake a hole: the one-colour and dark versions will expose it.
- **Strokes** Fine while sketching, but outline them before export: everything in the final SVG is a filled path. Use `arcBand`, `rect` and `poly` to draw thick lines as shapes from the start.
- **Optical corrections** Round shapes overshoot the flat ones by 1–3 % of their height (type designers use about 3 % for an O) and pointed ones by 3–5 % (the apex of an A or a triangle). Next to a square, a circle looks the same size at about 113 % of the square's side (equal area); use that as a starting point, not a law. Horizontal bars are drawn about 5–10 % thinner than vertical stems to look equal. The visual centre of a mark sits slightly above the geometric centre. Triangles, arrows and asymmetric marks are centred by their centroid, not their bounding box, which moves a play triangle toward its point.
- **Joins** Where heavy strokes meet at a sharp angle (a V, a K, a crossing), the corner fills in and looks darker than the rest. Thin the strokes into the join, or cut a small notch (an ink trap); the heavier the weight and the tighter the angle, the more it needs.
- **Near-misses** Either align things exactly or offset them clearly (by at least a stroke width). Edges 2 units apart, or tangents that almost touch, look like errors at every size.
- **Tiny parts** Anything thinner or smaller than about 1/32 of the mark's height (8 units on 256) vanishes at 16–32 px. Enlarge it, merge it, or drop it from the favicon version.

## Creatures and objects

A mark that depicts something (an animal, a character, a tool) has to be recognised before it can be clever. Weird marks lean on this most, so the higher the weirdness, the more these rules matter.

- **Name the tells first.** Before drawing, write down the two or three features that make the thing recognisable at a glance: a crab is two big raised pincers, a wide shell and legs splayed sideways; a whale is a blunt head flowing into a tail stalk and two flukes. Make the tells the largest shapes, and pick the view that shows them best (a crab head on, a whale side on). Anything that isn't a tell is a candidate to cut.
- **Silhouette test.** Fill the mark solid black and look at it at 64 px. Someone who has never seen it should name it in one word. If they'd say "blob", "bug" or "fish" when you meant "crab" or "whale", it isn't done, however good the colour version looks.
- **One connected silhouette.** Parts of one body join: draw the body, tail and fins as one outline with `smooth()`, and overlap limbs into the body rather than butting them against it. A part that floats (a tail that doesn't meet the body) reads as a mistake. A deliberate gap (a held object, a separate spout) is even all round and at least 1/16 of the mark, so it's clearly on purpose.
- **Organic shapes are curves.** Build animals and soft objects from `smooth()` outlines and `ellipse`, with `'corner'` points only where the real thing is sharp (fin tips, claw points, notches). Pills, rectangles and triangles bolted together look like clip art.
- **One limb weight.** Legs, arms, stalks and handles are `limb()` strokes of one width, about 1/14 of the mark (18 on 256), with a second width only for something clearly finer, such as eye stalks at two thirds of it.
- **The idea is never the smallest thing.** The part that carries the concept (the bookmark, the beacon) is at least a fifth of the mark's height. If it has to be small to fit, the composition is wrong: move it, or make the creature hold it.
- **Draft more, not less.** For a figurative mark, draw at least three silhouettes of the chosen idea (different poses, views or proportions), compare them in black at 64 px, and refine the best one in two passes before it goes on a concept sheet. Look at it at 512 px and ask whether a designer would ship it as it is: even curves, no lumps where shapes meet, consistent weights, the tells obvious.

## Process

- **Volume, then choose.** Professionals sketch dozens to thousands of variations before one survives. In code that's cheap: when a concept is chosen, draw it five or more ways (proportions, weights, crop, which part carries the accent), and look across the set for things nobody planned. The FedEx arrow was found in the kerning, not designed in.
- **Appropriate, distinctive, simple.** Sagi Haviv's three tests. Appropriate doesn't mean expressive: a logo can't tell the whole story, and meaning accrues through use (Bierut), so don't stack three symbols into one mark to say everything.
- **Category audit.** Before concepts, list how five to eight competitors' logos look (colours, shapes, type voices) and aim to stand apart from the pattern, not inside it.

## Type

- **Voice first** Match the face to the brief's adjectives using the groups in `typefaces.json`, then choose by eye on the specimen sheet.
- **Customise lightly** A known face with tuned spacing and one or two custom letters or a ligature gets most of the distinctiveness of fully custom type at a fraction of the work. In order of effort: set tracking (wordmarks in bold weights usually want −1 to −3 %, all-caps wants +4 to +10 %); choose case; swap in an alternate; modify one letter (cut a terminal, join two letters, replace a counter with the symbol). Redrawing the whole word is a bigger job than it looks: avoid it unless asked.
- **Spacing** Kerning comes from the font, but check the classic gaps (`r` before a round letter, `T`, `V`, `W`, `Y`, `A`, `L` next to anything) and fix them by splitting the word: `text()` on parts and position them by hand.
- **Pairing** One family for the wordmark and headings; a text face for body copy that is calmer than it (see the group's `text` list). A serif display face pairs with a sans text face more often than the other way round. Never more than two families.
- **Licensing** Every face in `typefaces.json` is SIL OFL or Apache 2.0, which allow outlined use in a logo. For any other font, check its licence on fonts.google.com or the foundry's site before using it.

### Decorative faces

The voices that open at weirdness 3 and up (chunky, stencil, marker, odd-serif, then retro, pixel, blackletter, and experimental at 5) are characters, not workhorses. They follow the rules above, plus these:

- **One loud thing.** A decorative wordmark goes with a quiet mark (or no separate mark: at 5 the word can be the mark), and a loud mark goes with a calm face. Two loud halves fight.
- **Wordmark only.** The decorative face sets the name and perhaps a headline. Everything else (templates, the website palette page, guidelines body copy) uses a face from the group's `text` list, which goes in `brand.json` as `type.text`.
- **Check it small on the sheet.** `specimen.mjs` draws each name about 12 px tall in the cell's corner. A face that turns to mush there, or one marked `small: false` ("large only" on the sheet), can still win at 4 and 5, but the horizontal lockup must then hold at 24 px of word height, and the email signature and small uses take the mark alone. The favicon never uses the decorative word.
- **Short names.** Experimental and blackletter faces suit names of about eight letters or fewer; a long name in them reads as texture.
- **Respect the face's own rules.** Each group's `note` says what breaks it: pixel faces snap to their pixel grid, blackletter never goes all capitals, stencil bridges stay open, a repeated letter in a marker face gets nudged so it looks drawn, retro faces commit to one era.
- **No colour fonts.** Outlining keeps one layer, so colour fonts (Nabla, Foldit, Bungee Spice, Honk) arrive flat. If a `--font` face looks plainer on the sheet than on fonts.google.com, that's why.
- **Customise less.** These faces already carry the character, so tracking and case are usually enough; modifying a letter mostly adds noise. The exception is the mark's object entering the word at 4 and 5 (`direction.md`), which still works when the letter it replaces is simple.

## Lockups

- **Horizontal** The word's cap height is 40–55 % of the mark's height (`capRatio`, default 0.46), centred on the mark's vertical middle. The gap is 25–40 % of the mark's height (default 0.32).
- **Mark as a letter** A solid, simple mark (a square, a circle) can instead sit at exactly the cap height, top on the capitals and bottom on the baseline, with a gap of about 40 % of the cap height: `lockup({ capRatio: 1, gap: 0.4 })`. It reads as the word's first letter and keeps the lockup compact. Render both options side by side and choose by eye; keep the larger-mark version for the stacked lockup.
- **Stacked** The word centred under the mark, cap height about 30 % of the mark's width, gap about a third of the mark.
- **Balance** Neither half should dominate. If the mark looks heavier, shrink it slightly or step the wordmark up a weight; don't change the mark's internal proportions.
- **Clear space** Default 25 % of the mark's height on every side (`clearSpace` in `brand.json`). Minimum widths: mark 16 px, horizontal 96 px, stacked 64 px unless the check sheet says otherwise.

## Colour

- Start from the product's existing tokens. If there are none, choose a primary colour from the brief's adjectives (deep blue reads trustworthy, green growth, warm reds and oranges energy, black and white editorial), then add one accent with a clearly different hue and lightness, a paper (warm or cool off-white) and a dark.
- The primary colour carries the wordmark, so it needs 4.5:1 or more on white; the guidelines show each contrast ratio.
- The accent goes on one part of the mark, the part that carries the idea (Harbor's beacon).
- The dark version swaps the primary colour for the paper and keeps the accent if it still has 3:1 or more against the dark. If not, lighten the accent for the dark version.
- Light shapes on a dark ground look heavier than the same shapes dark on light (irradiation). For a mark with fine lines or tight counters, draw the dark version 2–5 % lighter (thinner strokes, slightly larger holes) and compare the two on the check sheet. In print the opposite can happen, as ink spreads into reversed hairlines, so print proofs win over rules.
- Every logo also exists in pure black and pure white. `export.mjs` makes these by recolouring every fill, which is why holes must be real holes.

## Icons

- **The size ladder** Full lockup, then the mark, then the favicon: each step drops detail but keeps the geometry. Redraw the small steps with heavier parts rather than shrinking the big one, and check them on whole pixels (a 16 px favicon wants edges on the pixel grid).
- **Favicon** At 16 px only the silhouette survives. If the mark has fine detail, draw a `favicon.svg` with the detail enlarged or removed, often on a rounded tile in the primary colour so it holds up in both light and dark tabs (`icon.favicon`, or `icon.faviconBackground` to have the export add the tile).
- **App icon** The art fills about 60–65 % of the tile (`icon.scale`, default 0.62) on an opaque background. iOS adds its own rounded corners, so `app-icon-1024.png` and `apple-touch-icon.png` are square and opaque.
- **Maskable (Android)** Launchers crop to a circle, squircle or other shape, so the art stays inside the central 80 % circle: `icon.maskableScale`, default 0.5. Check the circle crop on `check.png`.
- **Tile colour** Usually the primary colour with the dark or reversed mark on it, or paper with the normal mark. A white tile with a thin mark looks unfinished on a home screen.

## Things that make a logo look AI-made

Generic gradients and glows, a symbol made of a dozen small parts, a "tech" hexagon or circuit trace, a lightbulb for ideas, a speech bubble for chat, a leaf for anything green, a wordmark in the default weight with no tracking adjustment, and three colours of similar weight. Avoid all of them unless the brief explicitly calls for one, and even then do something specific with it.
