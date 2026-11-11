// Wren: a small journaling app ("a few lines a day"). The circle-grid example.
// Every curve in the mark is an arc of a circle from one Fibonacci set
// (8, 16, 24, 40, 64, 104 on a 256 grid): body 64, head 40, tail a lens of two
// 64s, beak a lens of two 40s, eye 8, the wing line a crescent between a 64 and
// a 104, and the neck and throat rounded with 40 and 24 fillets.
//
//   node draw.mjs            (writes the SVGs, construction drawings and brand.json)
//   node ../../scripts/export.mjs brand.json
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFont, lockup, svg, write } from '../../scripts/brand.mjs'
import { circleGrid, fib, union, subtract, intersect, bounds, through, constructionSheet, constructionOverlay } from '../../scripts/geometry.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const C = { bark: '#3d2b22', berry: '#d9603b', cream: '#f7f1e8', moss: '#dfe3d3' }

// ── The mark, on a 256 grid ──
const R = fib(8, 6) // 8, 16, 24, 40, 64, 104
const g = circleGrid(R)
const body = g.c(120, 156, 4)
const head = g.c(166, 98, 3)
// Tail: the lens where two 104s overlap, slim and cocked up and back at 116°.
const ax = (-116 * Math.PI) / 180, px = -Math.sin(ax), py = Math.cos(ax)
const T = [68, 92], TS = 93
const t1 = g.c(T[0] + TS * px, T[1] + TS * py, 5), t2 = g.c(T[0] - TS * px, T[1] - TS * py, 5)
const tail = intersect(t1.d, t2.d)
// 16s round both notches where the tail meets the body.
const rump = [g.fillet(body, t2, 1, 1), g.fillet(body, t1, 1, -1)]
// Beak: the lens of two 40s, one above the other, so its tip points level.
const beak = intersect(g.c(202, 74, 3).d, g.c(202, 134, 3).d)
const eye = g.c(176, 90, 0)
// Neck and throat: grid circles touching body and head round the two notches.
const neck = g.fillet(body, head, 3, -1)
const throat = g.fillet(body, head, 2, 1)
// Wing line: a 64 and a 104 through the same two points; the sliver where the
// 64 bulges past the 104 is a crescent that tapers to nothing at both ends.
const P1 = [122, 112], P2 = [70, 186]
const w64 = g.at(...through(P1, P2, R[4], -1), 4), w104 = g.at(...through(P1, P2, R[5], -1), 5)
const wing = subtract(w64.d, w104.d)
g.check()

const flat = subtract(union(body.d, head.d, tail, beak, neck, throat, ...rump), eye.d, wing)
const b = bounds(flat)
const box = { x: Math.floor(b.x), y: Math.floor(b.y), w: Math.ceil(b.x + b.w) - Math.floor(b.x), h: Math.ceil(b.y + b.h) - Math.floor(b.y) }
const art = (fill) => `<g transform="translate(${-box.x} ${-box.y})"><path d="${flat}" fill="${fill}"/></g>`
const mark = (fill) => ({ body: art(fill), w: box.w, h: box.h })

write(out('mark.svg'), svg({ w: box.w, h: box.h, title: 'Wren', body: art(C.bark) }))
write(out('mark-dark.svg'), svg({ w: box.w, h: box.h, title: 'Wren', body: art(C.cream) }))
// The construction drawings: a three-panel sheet for the concept round, and the
// circles alone, lined up with mark.svg, for the guidelines' construction panel.
write(out('construction-sheet.svg'), constructionSheet({ grid: g, body: `<path d="${flat}" fill="${C.bark}"/>`, flat, box, title: 'Wren construction' }))
write(out('construction.svg'), constructionOverlay({ grid: g, mark: box, offset: [-box.x, -box.y], stroke: C.berry, title: 'Wren construction' }))

// ── Lockups: Fraunces, soft and bookish like the bird ──
const font = await loadFont('Fraunces', 600)
for (const [layout, file] of [['horizontal', 'logo-horizontal'], ['stacked', 'logo-stacked']]) {
  for (const [suffix, fill] of [['', C.bark], ['-dark', C.cream]]) {
    const l = lockup({ mark: mark(fill), font, name: 'Wren', layout, color: fill, tracking: -0.01 })
    write(out(`${file}${suffix}.svg`), svg({ w: l.w, h: l.h, title: 'Wren', body: l.body }))
  }
}

write(
  out('brand.json'),
  JSON.stringify(
    {
      name: 'Wren',
      tagline: 'A few lines a day.',
      about:
        'Wren is a small journal for a few lines a day: quick to open, quiet to use, and kind about the days you miss.\n\nThe mark is a wren, the smallest bird with the loudest song, drawn entirely from arcs of one set of circles so it stays round, calm and even at any size.',
      construction:
        'Every curve is an arc of a circle from one Fibonacci set (8, 16, 24, 40, 64, 104 on a 256 grid): body 64, head 40, a tail lens of two 64s, a beak lens of two 40s, an eye of 8, and a wing crescent between a 64 and a 104. The red circles are the grid.',
      website: 'wren.example',
      colors: [
        { name: 'Bark', hex: C.bark, role: 'primary', usage: 'The mark, the wordmark and headings.' },
        { name: 'Berry', hex: C.berry, role: 'accent', usage: 'One highlight per layout: a button, a date, a rule.' },
        { name: 'Cream', hex: C.cream, role: 'paper', usage: 'Pages and the mark on Bark.' },
        { name: 'Moss', hex: C.moss, role: 'support', usage: 'Panels and quiet backgrounds.' },
      ],
      type: { display: { family: 'Fraunces', weight: 600 }, text: { family: 'Figtree', weight: 400 } },
      logos: {
        mark: { file: 'mark.svg', dark: 'mark-dark.svg', minWidth: 16, construction: 'construction.svg' },
        horizontal: { file: 'logo-horizontal.svg', dark: 'logo-horizontal-dark.svg', minWidth: 96 },
        stacked: { file: 'logo-stacked.svg', dark: 'logo-stacked-dark.svg', minWidth: 64 },
      },
      icon: { file: 'mark-dark.svg', background: C.bark, faviconBackground: C.bark, favicon: 'mark-dark.svg' },
      direction: { words: ['calm', 'warm', 'crafted'], pairs: { tone: 'between', era: 'classic', volume: 'quiet', finish: 'engineered' }, lives: 'app', weirdness: 2 },
      clearSpace: 0.25,
      out: 'dist',
    },
    null,
    2
  ) + '\n'
)
