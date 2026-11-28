// Logowright, round 3 (Matt, 2026-11-28): just the compass top from round 2,
// rings and legs dropped, the north star centred under the hinge, and the
// strokes thinned and joined so the compass becomes a W. Five ways to draw it.
//
//   node draw.mjs    (writes 1.svg … 6.svg and round-3.png)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const KIT = '../../../skills/logo/scripts/'
const { svg, write, circle, rect, path, limb, lockup, loadFont } = await import(KIT + 'brand.mjs')
const { union, subtract, intersect, dilate, bounds, polyline, bar } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const NAVY = '#1b2438', GOLD = '#c99a3e'
export const star = (cx, cy, R, k = R * 0.16) =>
  `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`

// The W's five points: outer tops, the two feet, and the hinge at the middle peak.
function W({ outer = 18, inner = 18, joins = 'cut', hingeR = 15, star: S = { y: 176, R: 20 }, gap = 5, spread = 46 }) {
  const H = [128, 84], fy = 204
  const feet = [[128 - spread, fy], [128 + spread, fy]]
  const slope = spread / (fy - H[1]) // inner legs; the outer arms run parallel
  const topY = 52, tops = [[feet[0][0] - slope * (fy - topY), topY], [feet[1][0] + slope * (fy - topY), topY]]
  let strokes
  if (joins === 'round') {
    strokes = union(
      limb(...tops[0], ...feet[0], outer), limb(...feet[0], ...H, inner),
      limb(...H, ...feet[1], inner), limb(...feet[1], ...tops[1], outer),
    )
  } else {
    // square tops cut level, feet cut level at the baseline
    // extend the ends that get cut level (tops and feet) by 40 along the line; the hinge end stays put
    const line = (a, b, w, ea = 40, eb = 40) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L
      return bar(a[0] - ux * ea, a[1] - uy * ea, b[0] + ux * eb, b[1] + uy * eb, w)
    }
    const raw = union(line(tops[0], feet[0], outer), line(feet[0], H, inner, 40, 0), line(H, feet[1], inner, 0, 40), line(feet[1], tops[1], outer))
    strokes = intersect(raw, rect(0, topY, 256, fy - topY, 0))
  }
  const hinge = subtract(circle(...H, hingeR), circle(...H, hingeR * 0.42))
  const handle = rect(H[0] - 5, 34, 10, H[1] - 34, 2)
  const compass = subtract(union(strokes, handle, hinge), circle(...H, hingeR * 0.42))
  const s = star(128, S.y, S.R)
  return { compass: subtract(compass, dilate(s, gap)), star: s }
}

const variants = [
  ['1 · cut ends, even 18', { outer: 18, inner: 18 }],
  ['2 · cut ends, light 13', { outer: 13, inner: 13, hingeR: 13 }],
  ['3 · heavy arms, thin legs (as the original)', { outer: 22, inner: 11 }],
  ['4 · round ends, even 16', { outer: 16, inner: 16, joins: 'round' }],
  ['5 · wider W, bigger star', { outer: 16, inner: 16, spread: 56, star: { y: 172, R: 24 } }],
]
const files = []
const marks = []
variants.forEach(([label, opt], i) => {
  const m = W(opt)
  marks.push(m)
  const b = bounds(union(m.compass, m.star)), p = 4
  const body = `<g transform="translate(${p - b.x} ${p - b.y})">${path(m.compass, NAVY)}${path(m.star, GOLD)}</g>`
  write(out(`${i + 1}.svg`), svg({ w: b.w + p * 2, h: b.h + p * 2, title: `Logowright ${label}`, body }))
  files.push(out(`${i + 1}.svg`))
})
// 6: variant 1 in a lockup
{
  const m = marks[0], b = bounds(union(m.compass, m.star))
  const font = await loadFont('Outfit', 600)
  const lk = lockup({ mark: { body: `<g transform="translate(${-b.x} ${-b.y})">${path(m.compass, NAVY)}${path(m.star, GOLD)}</g>`, w: b.w, h: b.h }, font, name: 'logowright', color: NAVY, tracking: -0.02, capRatio: 0.42, gap: 0.26 })
  write(out('6.svg'), svg({ w: lk.w, h: lk.h, title: 'Logowright lockup', body: lk.body }))
  files.push(out('6.svg'))
}
execFileSync('node', [join(here, KIT, 'render.mjs'), ...files, '--sheet', out('round-3.png'), '--title', 'Logowright - round 3 - the compass top as a W, five ways'], { stdio: 'inherit' })
