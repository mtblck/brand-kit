// Logowright, round 4 (Matt, 2026-11-28): round 3 led with a W and stuck the
// compass on top. Here the compass top from round 2 is the logo, at its own
// proportions (handle, big hinge, heavy arms, thin legs), and the arms and legs
// are only joined at the bottom so the compass itself reads as a W, with the
// big north star in front of the join as in his example.
//
//   node draw.mjs    (writes 1.svg … 5.svg and round-4.png)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const KIT = '../../../skills/logo/scripts/'
const { svg, write, circle, rect, path, lockup, loadFont } = await import(KIT + 'brand.mjs')
const { union, subtract, intersect, dilate, bounds, bar } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const NAVY = '#1b2438', GOLD = '#c99a3e'
const star = (cx, cy, R, k = R * 0.16) =>
  `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`
const mx = ([x, y]) => [256 - x, y]
// a bar from a to b, run on past b by `on` (so it can be cut level there)
const run = (a, b, w, on = 30) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L
  return bar(a[0], a[1], b[0] + ux * on, b[1] + uy * on, w)
}

function compassW({ arm = 20, leg = 8, foot = [100, 150], top = [46, 56], hinge = [128, 74], hr = 17, R = 34, sy = 158, gap = 6 }) {
  const strokes = (m) => {
    const P = m ? mx : (p) => p
    // the heavy arm, cut square at both ends; the thin leg runs from the hinge
    // into the arm's foot, as a compass leg is fixed into its point
    const f = P(foot), t = P(top), L = Math.hypot(f[0] - t[0], f[1] - t[1])
    const into = [f[0] - ((f[0] - t[0]) / L) * arm * 0.6, f[1] - ((f[1] - t[1]) / L) * arm * 0.6]
    const Lh = Math.hypot(into[0] - hinge[0], into[1] - hinge[1])
    const from = [hinge[0] + ((into[0] - hinge[0]) / Lh) * hr * 0.75, hinge[1] + ((into[1] - hinge[1]) / Lh) * hr * 0.75] // start inside the ring, clear of the hole
    return union(bar(...t, ...f, arm), bar(...from, ...into, leg))
  }
  const W = union(strokes(false), strokes(true))
  const ring = subtract(circle(...hinge, hr), circle(...hinge, hr * 0.42))
  const handle = rect(hinge[0] - 6, 26, 12, hinge[1] - 26, 3)
  const body = subtract(union(W, ring, handle), circle(...hinge, hr * 0.42))
  const s = star(128, sy, R)
  return { compass: subtract(subtract(body, dilate(s, gap)), circle(...hinge, hr * 0.42)), star: s }
}

const variants = [
  ['1 · as your example, star 34', {}],
  ['2 · bigger star, 40', { R: 40, sy: 160 }],
  ['3 · feet wider, star 38', { foot: [94, 150], top: [40, 56], R: 38 }],
  ['4 · arms steeper, taller', { top: [58, 40], foot: [100, 156], R: 36, sy: 164 }],
]
const files = [], marks = []
variants.forEach(([label, opt], i) => {
  const m = compassW(opt)
  marks.push(m)
  const b = bounds(union(m.compass, m.star)), p = 4
  write(out(`${i + 1}.svg`), svg({ w: b.w + p * 2, h: b.h + p * 2, title: `Logowright ${label}`, body: `<g transform="translate(${p - b.x} ${p - b.y})">${path(m.compass, NAVY)}${path(m.star, GOLD)}</g>` }))
  files.push(out(`${i + 1}.svg`))
})
{
  const m = marks[0], b = bounds(union(m.compass, m.star))
  const font = await loadFont('Outfit', 600)
  const lk = lockup({ mark: { body: `<g transform="translate(${-b.x} ${-b.y})">${path(m.compass, NAVY)}${path(m.star, GOLD)}</g>`, w: b.w, h: b.h }, font, name: 'logowright', color: NAVY, tracking: -0.02, capRatio: 0.4, gap: 0.24 })
  write(out('5.svg'), svg({ w: lk.w, h: lk.h, title: 'Logowright lockup', body: lk.body }))
  files.push(out('5.svg'))
}
execFileSync('node', [join(here, KIT, 'render.mjs'), ...files, '--sheet', out('round-4.png'), '--title', 'Logowright - round 4 - the compass top is the logo, its arms and legs make the W'], { stdio: 'inherit' })
