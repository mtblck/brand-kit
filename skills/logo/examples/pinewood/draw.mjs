// Pinewood Supply: an outdoor shop. One made-up brand drawn as the four kinds of
// logo that have their own reference files:
//   1  Emblem (references/emblems.md): the pine in a seal, the name set round
//      the top with arcText(), the year round the bottom, stars between.
//   2  Negative space (references/negative-space.md): a mountain with a pine
//      cut out of its foot, so the gap is the tree.
//   3  Pictorial wordmark (references/object-letters.md): "pinewood" with its
//      first o drawn as the growth rings of a cut log, at the o's own size and
//      stroke weight.
//   4  Responsive ladder (references/responsive.md): the emblem, the lockup,
//      the mark and the favicon, each step redrawn simpler, not shrunk.
//
//   node draw.mjs    (writes emblem.svg, negative-space.svg, wordmark.svg,
//                     ladder.svg and pinewood.svg beside this file, and docs/pinewood.png)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { renameSync } from 'node:fs'
import { loadFont, text, svg, write, ring, circle, rect, poly, place } from '../../scripts/brand.mjs'
import { union, subtract, intersect, dilate, bounds, bar, solid, arcText, transform } from '../../scripts/geometry.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const C = { pine: '#1f3b2d', bark: '#a3672c', paper: '#f4efe4', grey: '#8a8a8a' }
const display = await loadFont('Jost', 600)
const word = await loadFont('Jost', 500)

// The pine: three stacked tiers and a trunk, on a box (x, y, w, h).
function pine(cx, top, h, { tiers = 3, trunk = 0.12 } = {}) {
  const w = h * 0.72, th = h * (1 - trunk), step = th / (tiers + 1)
  const parts = []
  for (let i = 0; i < tiers; i++) {
    const t = top + i * step, b = top + (i + 2) * step, half = (w / 2) * ((i + 2) / (tiers + 1))
    parts.push(poly([[cx, t], [cx + half, b], [cx - half, b]]))
  }
  parts.push(rect(cx - h * 0.05, top + th - 1, h * 0.1, h * trunk + 1))
  return union(...parts)
}
const star = (cx, cy, R, k = R * 0.2) =>
  `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`

// ── 1  Emblem ──
function emblem() {
  const top = arcText(display, 'PINEWOOD SUPPLY', { r: 103, size: 18, tracking: 0.12 })
  const bot = arcText(display, 'EST 2026', { r: 103, size: 18, tracking: 0.16, bottom: true })
  const rings = ring(128, 128, 124, 6) + ring(128, 128, 84, 3)
  const stars = star(22, 128, 7) + star(234, 128, 7)
  const tree = pine(128, 62, 112)
  const ground = rect(76, 172, 104, 4)
  return union(rings, top.d, bot.d, stars, tree, ground)
}
const E = emblem()
write(out('emblem.svg'), svg({ w: 256, h: 256, title: 'Pinewood Supply emblem', body: `<path d="${E}" fill="${C.pine}" fill-rule="evenodd"/>` }))

// ── 2  Negative space ──
function negative() {
  const peak = poly([[128, 28], [236, 216], [20, 216]])
  const left = poly([[64, 100], [130, 216], [20, 216]])
  const mountain = union(peak, left)
  return subtract(mountain, pine(128, 112, 104, { trunk: 0.14 }))
}
const N = negative()
write(out('negative-space.svg'), svg({ w: 256, h: 256, title: 'Pinewood Supply negative-space mark', body: `<path d="${N}" fill="${C.pine}" fill-rule="evenodd"/>` }))

// ── 3  Pictorial wordmark ──
function wordmark() {
  const size = 120
  const before = text(word, 'pinew', { size }), o = text(word, 'o', { size }), after = text(word, 'od', { size })
  const ob = bounds(solid(o.d))
  // The log keeps the o's outline and mass: a disc the o's size, with the growth
  // rings cut in as hairlines, a little off centre as a real log's are.
  const x0 = before.width, cx = x0 + ob.x + ob.w / 2, cy = ob.y + ob.h / 2, r = ob.h / 2
  const cut = r * 0.07
  const log = subtract(circle(cx, cy, r), ring(cx + 1, cy + 1, r * 0.74, cut), ring(cx + 2, cy + 2, r * 0.46, cut), circle(cx + 3, cy + 3, r * 0.12))
  return union(solid(before.d), log, transform(solid(after.d), { x: x0 + o.width }))
}
const W = wordmark(), WB = bounds(W)
write(out('wordmark.svg'), svg({ w: WB.w + 8, h: WB.h + 8, title: 'Pinewood Supply wordmark', body: `<path d="${W}" fill="${C.pine}" fill-rule="evenodd" transform="translate(${4 - WB.x} ${4 - WB.y})"/>` }))

// ── 4  Responsive ladder ──
// Each step is drawn for its size: the emblem's words go before the rings do,
// and the favicon's pine has two tiers and a thicker trunk so it holds at 16 px.
function ladder() {
  const label = (s, x, y) => `<path d="${text(word, s, { size: 13, x, y, anchor: 'middle' }).d}" fill="${C.grey}"/>`
  const cells = []
  // full emblem at 200
  cells.push(place(`<path d="${E}" fill="${C.pine}" fill-rule="evenodd"/>`, 20, 20, 200 / 256) + label('Emblem · 200 px and up', 120, 250))
  // lockup: pine + name, no rings
  const tree = pine(0, 0, 100)
  const name = text(display, 'PINEWOOD', { size: 30, x: 50, y: 52, tracking: 0.08 }).d + text(word, 'SUPPLY', { size: 18, x: 51, y: 80, tracking: 0.3 }).d
  cells.push(place(`<path d="${tree}${name}" fill="${C.pine}"/>`, 300, 80, 0.9) + label('Lockup · 120 px wide', 384, 250))
  // mark alone: the pine and its ground
  cells.push(place(`<path d="${union(pine(64, 8, 104), rect(20, 116, 88, 5))}" fill="${C.pine}"/>`, 540, 76, 0.8) + label('Mark · 32 px and up', 591, 250))
  // favicon: two tiers, thick trunk, on a tile
  const fav = pine(128, 36, 184, { tiers: 2, trunk: 0.16 })
  cells.push(place(`<rect width="256" height="256" rx="56" fill="${C.pine}"/><path d="${fav}" fill="${C.paper}"/>`, 680, 96, 0.4) + label('Favicon · 64, 32, 16 px', 770, 250))
  for (const [x, s] of [[800, 32], [846, 16]]) cells.push(place(`<rect width="256" height="256" rx="56" fill="${C.pine}"/><path d="${fav}" fill="${C.paper}"/>`, x, 198 - s, s / 256))
  return svg({ w: 880, h: 270, title: 'Pinewood Supply responsive ladder', bg: '#ffffff', body: cells.join('') })
}
write(out('ladder.svg'), ladder())

// ── Overview: all four on one sheet ──
const tile = (body, x, y, s) => place(body, x, y, s)
const sheet = svg({
  w: 1100, h: 640, title: 'Pinewood Supply: emblem, negative space, pictorial wordmark, responsive ladder', bg: '#ffffff',
  body:
    tile(`<path d="${E}" fill="${C.pine}" fill-rule="evenodd"/>`, 40, 40, 1) +
    tile(`<path d="${N}" fill="${C.pine}" fill-rule="evenodd"/>`, 336, 40, 1) +
    tile(`<path d="${W}" fill="${C.pine}" fill-rule="evenodd"/>`, 640 - WB.x * 0.75, 150 - WB.y * 0.75, 0.75) +
    (`<g transform="translate(110 340)">${ladder().replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').replace(/<title>[\s\S]*?<\/title>/, '')}</g>`),
})
write(out('pinewood.svg'), sheet)
execFileSync('node', [join(here, '../../scripts/render.mjs'), out('pinewood.svg'), '--width', '2200', '--out', join(here, '../../../../docs')], { stdio: 'inherit' })
renameSync(join(here, '../../../../docs/pinewood-2200.png'), join(here, '../../../../docs/pinewood.png'))
