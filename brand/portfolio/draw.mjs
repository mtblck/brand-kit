// Logowright's portfolio covers: one scene, drawn twice (2400 × 800 and 1000 × 800).
//
// Verb: Logowright *draws* a logo. Picture, straight top-down on a navy chart:
// a brass drafting compass with its needle on the north star, its pencil leg
// partway round a gold circle, and inside the circle the faint construction of
// a logo taking shape. The compass and star are the mark's own idea, so the
// logo is part of the scene, not a badge on it.
//
//   node draw.mjs        writes cover.svg and cover-mobile.svg next to this file
//   node ../../skills/logo/scripts/portfolio.mjs ../brand.json
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const KIT = '../../skills/logo/scripts/'
const { arcBand, rect, circle, ring, svg, write, limb } = await import(KIT + 'brand.mjs')
// The north star, as in ../draw.mjs (copied, so this script doesn't rerun that one).
const star = (cx, cy, R, k = R * 0.16) =>
  `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`

const here = dirname(fileURLToPath(import.meta.url))
const C = { navy: '#1b2438', grid: '#222c43', line: '#33405e', brass: '#ecdfc2', brassShade: '#d6c49c', gold: '#c99a3e' }
export const ALT = 'Seen from above on a navy chart, a brass drafting compass has its needle on a gold north star and its pencil leg partway round a gold circle, with the faint lines of a logo being drawn inside it.'

const END = -55 // where the pencil has reached, in degrees
// Where the compass's hinge and handle end stand for a circle of radius R about (cx, cy).
function compassAt(cx, cy, R) {
  const a = (END * Math.PI) / 180
  const tip = [cx + R * Math.cos(a), cy + R * Math.sin(a)]
  const L = R * 1.12, mid = [(cx + tip[0]) / 2, (cy + tip[1]) / 2]
  const ux = (tip[0] - cx) / R, uy = (tip[1] - cy) / R
  const off = Math.sqrt(L * L - (R / 2) ** 2)
  const hinge = [mid[0] - uy * off, mid[1] + ux * off]
  const hx = hinge[0] - mid[0], hy = hinge[1] - mid[1], hl = Math.hypot(hx, hy)
  const end = [hinge[0] + (hx / hl) * R * 0.28, hinge[1] + (hy / hl) * R * 0.28]
  return { tip, mid, hinge, end, legW: R * 0.085 }
}

function scene(W, H, R) {
  // Frame the circle and the compass together inside the middle 60% (a margin
  // of 4% more each side), so the hinge and handle never reach the edges.
  const probe = compassAt(0, 0, R), pad = R * 0.1
  let x0 = Math.min(-R - 16, probe.end[0]) - pad, x1 = Math.max(R + 16, probe.end[0], probe.hinge[0]) + pad
  const most = W * 0.52
  if (x1 - x0 > most) { const k = most / (x1 - x0); R *= k; x0 *= k; x1 *= k }
  const cx = W / 2 - (x0 + x1) / 2, cy = H / 2 + 10
  const p = []
  p.push(`<rect width="${W}" height="${H}" fill="${C.navy}"/>`)
  // The chart's grid, every 80, as a faint texture edge to edge.
  let g = ''
  for (let x = (cx % 80) - 80; x < W; x += 80) g += rect(x - 1, 0, 2, H)
  for (let y = (cy % 80) - 80; y < H; y += 80) g += rect(0, y - 1, W, 2)
  p.push(`<path d="${g}" fill="${C.grid}"/>`)
  // The logo being drawn: a construction circle, a square and the centre lines.
  const k = R * 0.42
  p.push(`<path d="${ring(cx, cy, k, 4)}${rect(cx - k * 0.9, cy - k * 0.9, k * 1.8, 4)}${rect(cx - k * 0.9, cy + k * 0.9 - 4, k * 1.8, 4)}${rect(cx - k * 0.9, cy - k * 0.9, 4, k * 1.8)}${rect(cx + k * 0.9 - 4, cy - k * 0.9, 4, k * 1.8)}${rect(cx - R - 30, cy - 2, 2 * R + 60, 4)}${rect(cx - 2, cy - R - 30, 4, 2 * R + 60)}" fill="${C.line}" fill-rule="evenodd"/>`)
  // The circle the compass is drawing, from the left round to its pencil.
  p.push(`<path d="${arcBand(cx, cy, R + 8, 16, END + 360 - 300, END + 360)}" fill="${C.gold}"/>`)
  // The compass: needle at the star, pencil at the arc's end, hinge between.
  const { tip, hinge, end, legW } = compassAt(cx, cy, R)
  p.push(`<path d="${limb(...hinge, cx, cy, legW)}${limb(...hinge, ...tip, legW)}" fill="${C.brass}"/>`)
  // Handle out past the hinge, away from the legs, and the hinge itself.
  p.push(`<path d="${limb(...hinge, ...end, legW * 0.7)}" fill="${C.brassShade}"/>`)
  p.push(`<path d="${circle(...hinge, legW * 1.15)}" fill="${C.brass}"/><path d="${circle(...hinge, legW * 0.45)}" fill="${C.navy}"/>`)
  // The pencil's lead and the needle's star.
  p.push(`<path d="${circle(...tip, legW * 0.42)}${star(cx, cy, R * 0.2)}" fill="${C.gold}"/>`)
  return svg({ w: W, h: H, title: ALT, body: p.join('') })
}

write(join(here, 'cover.svg'), scene(2400, 800, 270))
write(join(here, 'cover-mobile.svg'), scene(1000, 800, 250))
