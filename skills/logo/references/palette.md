# The website palette

`export.mjs` turns the brand colours into every colour a website or app needs, in
light and dark, and writes them to `web/`. The code is `scripts/palette.mjs`. It
follows what current design systems do (Radix Colors, Tailwind v4, Material 3's
colour roles), not a single one of them.

## How it is built

1. **OKLCH, not HSL.** Every step is placed in OKLCH: lightness there is perceptual,
   so two colours at the same step look equally light, and the brand, the greys and
   the status colours line up step for step. Colours are mapped into sRGB by
   lowering chroma only, so lightness and hue stay put.
2. **Twelve steps per scale, one job per step.**

   | Step | Job |
   | --- | --- |
   | 1 | Page background |
   | 2 | Subtle background: panels, sidebars, striped rows |
   | 3, 4, 5 | Component fills: rest, hover, pressed (tints behind brand text, selected rows) |
   | 6, 7, 8 | Borders: subtle separators, component borders, strong borders and focus |
   | 9 | Solid fill: buttons, badges. The brand hex itself, when it sits in this range |
   | 10 | Solid fill hovered |
   | 11 | Low-contrast text (pushed until it passes 4.5:1 on steps 1–4) |
   | 12 | High-contrast text (pushed until 7:1) |

   Light and dark are separate scales, not one scale reversed: dark backgrounds need
   their own small steps, and dark solids sit a little lighter.
3. **Scales.** `brand` (the primary colour), `accent` (when there is one),
   `neutral` (greys tinted toward the paper colour, or the brand when there's no
   paper; a brand `dark` colour tints the dark greys), and `success`, `warning`,
   `danger`, `info`. Status hues lean up to 12° toward the brand hue (Material's
   "harmonize"), so they belong to it while still reading as green, amber, red and blue.
4. **Exact brand colours are kept.** The paper colour is the light page, the dark
   colour the dark page, and the brand and accent hexes are the `brand` and
   `accent` fills wherever they read (3:1 against the page, 4.5:1 for their label).
   Where they don't (a navy on a near-black page), the scale's step 9 stands in.
5. **Roles on top.** Components use names, never step numbers:

   | Role | Use |
   | --- | --- |
   | `bg`, `surface`, `surface-raised` | Page; panels and sidebars; cards, menus and dialogs |
   | `surface-hover`, `surface-active` | Rows and list items hovered and pressed |
   | `border-subtle`, `border`, `border-strong` | Dividers; card and component edges; inputs (3:1, WCAG 1.4.11) |
   | `text`, `text-muted` | Body and headings; secondary text, captions, placeholders |
   | `brand`, `brand-hover`, `on-brand` | Primary button and its label |
   | `brand-subtle`, `brand-subtle-hover`, `brand-border`, `brand-text` | Tinted (secondary) buttons, selected states, brand-coloured text |
   | `accent…` | The same set for the accent; keep it to one highlight per screen |
   | `success…`, `warning…`, `danger…`, `info…` | The same set per status: `danger-subtle` + `danger-border` + `danger-text` for a message, `danger` + `on-danger` for a destructive button |
   | `link`, `focus` | Links and focus rings (the accent when the brand is near-black or grey) |

6. **Contrast is part of the build.** Every pair that has to read is checked against
   WCAG 2.2 AA (4.5:1 text, 3:1 UI edges), which is still the bar in law and audits,
   and scored with APCA Lc, the method in the WCAG 3 draft (aim for 75 for body text,
   60 for other text, 45 for large or bold, 30 for edges). The export warns on any
   WCAG failure; APCA is advisory. `web/palette.html` lists every pair.

## Using it on a site

- Plain CSS: link `palette.css` and write `background: var(--bg); color: var(--text)`.
  Dark mode follows the system; `data-theme="dark"` or `"light"` on `<html>` forces
  it, so a toggle only sets that attribute.
- Tailwind v4: import `palette.css` then `palette.tailwind.css` after `tailwindcss`;
  utilities are `bg-bg`, `bg-surface`, `text-text-muted`, `bg-brand text-on-brand
  hover:bg-brand-hover`, `border-border`, `bg-danger-subtle text-danger-text`, and
  `bg-brand-3` style steps for one-offs.
- Figma, Style Dictionary and other tools: `tokens.json` is in the W3C Design Tokens
  format (2025.10), with each colour as OKLCH components plus its hex.
- To change it, change `brand.json` (`palette` options are in `brand-json.md`) and
  export again. Don't edit `palette.css` by hand: the next export overwrites it.
