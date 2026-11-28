// Logowright, round 2: the mark Matt liked from an online generator
// (reference.png), rebuilt as clean geometry on the 256 grid: two rings, a
// pair of dividers and a four-point north star.
//
//   node draw.mjs    (writes mark.svg, mark-mono.svg and compare.png)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const KIT = '../../../skills/logo/scripts/'
const { svg, write, circle, rect, poly, path, lockup, loadFont } = await import(KIT + 'brand.mjs')
const { union, subtract, dilate, bar } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
export const NAVY = '#1b2438', GOLD = '#c99a3e'
const C = [128, 128]

// The north star: four points with concave curved sides.
export const star = (cx, cy, R, k = R * 0.16) =>
  `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`

// A leg that tapers to a point: w wide at (x1, y1), a point at (x2, y2).
const taper = (x1, y1, x2, y2, w) => {
  const L = Math.hypot(x2 - x1, y2 - y1), nx = (-(y2 - y1) / L) * (w / 2), ny = ((x2 - x1) / L) * (w / 2)
  const sx = x2 - ((x2 - x1) / L) * w * 1.6, sy = y2 - ((y2 - y1) / L) * w * 1.6 // where the point starts
  return poly([[x1 + nx, y1 + ny], [sx + nx, sy + ny], [x2, y2], [sx - nx, sy - ny], [x1 - nx, y1 - ny]])
}
const mirror = (pts) => pts.map(([x, y]) => [256 - x, y])

export function mark() {
  const S = [C[0], 126], R = 22
  const rings = union(subtract(circle(...C, 120), circle(...C, 110)), subtract(circle(...C, 102), circle(...C, 97)))
  const hinge = subtract(circle(128, 74, 13), circle(128, 74, 6))
  const handle = rect(123, 40, 10, 24, 2)
  const half = (m) => {
    const P = (p) => (m ? mirror([p])[0] : p)
    return union(
      bar(...P([121, 86]), ...P([115, 110]), 6), // the leg's thin top, from the hinge
      bar(...P([72, 62]), ...P([108, 114]), 17), // the heavy arm, top outside to the star
      taper(...P([100, 136]), ...P([78, 194]), 17), // the leg, star to point
    )
  }
  const body = union(hinge, handle, half(false), half(true))
  const s = star(...S, R)
  const compass = subtract(body, dilate(s, 5))
  return { rings, compass, star: s, all: union(rings, compass, s) }
}

const m = mark()
const body = (navy, gold) => path(m.rings, navy) + path(m.compass, navy) + path(m.star, gold)
write(out('mark.svg'), svg({ w: 256, h: 256, title: 'Logowright', body: body(NAVY, GOLD) }))
write(out('mark-dark.svg'), svg({ w: 256, h: 256, title: 'Logowright', body: body('#f4efe4', GOLD) }))
write(out('favicon.svg'), svg({ w: 256, h: 256, title: 'Logowright', body: path('M48 0h160a48 48 0 0 1 48 48v160a48 48 0 0 1-48 48H48A48 48 0 0 1 0 208V48A48 48 0 0 1 48 0Z', NAVY) + `<g transform="translate(128 128) scale(1.25) translate(-128 -124)">${path(m.compass, '#f4efe4')}${path(m.star, GOLD)}</g>` }))
write(out('mark-mono.svg'), svg({ w: 256, h: 256, title: 'Logowright', body: path(m.all, '#000') }))
const font = await loadFont('Outfit', 600)
for (const [name, navy, word] of [['stacked', NAVY, NAVY], ['stacked-dark', '#f4efe4', '#f4efe4'], ['horizontal', NAVY, NAVY]]) {
  const lk = lockup({ mark: { body: body(navy, GOLD), w: 256, h: 256 }, font, name: 'logowright', layout: name.startsWith('stacked') ? 'stacked' : 'horizontal', color: word, tracking: -0.02, capRatio: name.startsWith('stacked') ? 0.2 : 0.42, gap: name.startsWith('stacked') ? 0.12 : 0.3 })
  write(out(`${name}.svg`), svg({ w: lk.w, h: lk.h, title: 'Logowright', body: lk.body }))
}
execFileSync('node', [join(here, KIT, 'render.mjs'), out('mark.svg'), out('stacked.svg'), out('horizontal.svg'), out('mark-mono.svg'), out('favicon.svg'), '--sheet', out('round-2.png'), '--title', 'Logowright · round 2 · the generator mark rebuilt as SVG'], { stdio: 'inherit' })
