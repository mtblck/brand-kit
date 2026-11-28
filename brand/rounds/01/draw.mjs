// Logowright, round 1: nine unrefined sketches on a 3 × 3 grid, in black.
// Rows are structures (symbol, lettermark, wordmark); columns are weirdness 2, 3, 4.
//
//   node draw.mjs    (writes 1.svg … 9.svg and round-1.png beside this file)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const KIT = '../../../skills/logo/scripts/'
const { loadFont, text, svg, write, rect, circle, arcBand, ring } = await import(KIT + 'brand.mjs')
const { union, subtract, intersect, exclude, bounds, transform, solid, polyline, outline, bar } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const font = await loadFont('Outfit', 600)
const word = (str, size = 120, tracking = -0.02) => {
  const t = text(font, str, { size, tracking })
  return { ...t, d: solid(t.d) }
}
const cells = []

// 1 · Symbol · 2: a square and a circle laid over each other, their overlap cut
// out. A logo is a few shapes on a grid; the overlap is where it comes from.
cells.push(exclude(rect(40, 88, 128, 128, 0), circle(160, 96, 64)))

// 2 · Symbol · 3: a maker's stamp, the wright's tool: knob, neck and block, with
// the mark it leaves (sketch 1, small) printed underneath.
{
  const knob = circle(128, 52, 30)
  const neck = rect(112, 70, 32, 60, 0)
  const block = rect(56, 124, 144, 52, 10)
  const print = transform(exclude(rect(96, 0, 40, 40, 0), circle(132, 3, 20)), { y: 196 })
  cells.push(union(knob, neck, block, print))
}

// 3 · Symbol · 4: the size ramp. One tile (a square with its corner circle cut)
// at 512, 128, 32 and 16, standing on a line: the logo and its own export.
{
  const tile = (x, s) => {
    const r = s * 0.2
    return subtract(rect(x, 216 - s, s, s, r), circle(x + s * 0.68, 216 - s * 0.68, s * 0.2))
  }
  cells.push(union(tile(16, 120), tile(148, 64), tile(224, 32), tile(268, 18)))
}

// 4 · Lettermark · 2: an L whose inside corner is a compass arc, with the
// compass point marked: drawn, not typed.
{
  const L = union(rect(48, 32, 44, 192, 0), rect(48, 180, 164, 44, 0))
  const arc = arcBand(92, 180, 88, 16, -90, 0)
  cells.push(union(L, arc))
}

// 5 · Lettermark · 3: L and W as one monoline: the L's stem is the W's first stroke.
cells.push(union(polyline([[44, 32], [44, 216], [212, 216]], 26), polyline([[44, 32], [86, 168], [128, 76], [170, 168], [212, 32]], 26)))

// 6 · Lettermark · 4: a w made of two drafting set squares, each with its hole.
{
  const sq = (x) => subtract(
    `M${x} 48L${x + 112} 48L${x + 56} 208Z`,
    `M${x + 30} 66L${x + 82} 66L${x + 56} 140Z`,
  )
  cells.push(union(sq(24), sq(120)))
}

// 7 · Wordmark · 2: logowright in Outfit 600, each o marked at its centre like a
// compass point.
{
  const w = word('logowright')
  // centres of the two o's: find them from the advance of the preceding letters
  const oo = word('o'), oc = (pre) => word(pre).width + oo.width / 2 - 0.02 * 120
  const cy = -oo.bbox.h / 2 - 1
  const dots = [oc('l'), oc('log')].map((x) => circle(x, cy, 9))
  cells.push(union(w.d, ...dots))
}

// 8 · Wordmark · 3: the first o is a circle still being drawn, the pencil's
// stroke not yet closed.
{
  const pre = word('l'), oo = word('o'), rest = word('gowright')
  const gap = 4
  const ox = pre.bbox.x2 + gap, r = oo.bbox.h / 2, cy = -r
  const o = arcBand(ox + r, cy, r, 17, -55, 265)
  const restd = transform(rest.d, { x: ox + 2 * r + gap })
  cells.push(union(pre.d, o, restd))
}

// 9 · Wordmark · 4: the word and its working: "logo" in a hairline weight like
// construction lines, "wright" built heavy over it.
{
  const thin = await loadFont('Outfit', 200)
  const a = text(thin, 'logo', { size: 120, tracking: -0.02 }), b = word('wright')
  cells.push(union(solid(a.d), transform(b.d, { x: a.width - 0.02 * 120 + 4 })))
}

cells.forEach((d, i) => {
  const b = bounds(d), p = 2
  write(out(`${i + 1}.svg`), svg({ w: b.w + p * 2, h: b.h + p * 2, title: `Logowright sketch ${i + 1}`, body: `<path d="${d}" fill="#000" fill-rule="evenodd" transform="translate(${p - b.x} ${p - b.y})"/>` }))
})
execFileSync('node', [join(here, KIT, 'render.mjs'), ...cells.map((_, i) => out(`${i + 1}.svg`)), '--sheet', out('round-1.png'), '--rows', 'Symbol,Lettermark,Wordmark', '--cols', 'Weirdness 2,Weirdness 3,Weirdness 4', '--title', 'Logowright · round 1 · nine unrefined sketches, pick one to three', '--mono'], { stdio: 'inherit' })
