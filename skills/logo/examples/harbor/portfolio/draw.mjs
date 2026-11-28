// Harbor's portfolio covers: one scene, drawn twice (2400 × 800 and 1000 × 800).
//
// Verb: Harbor *keeps* what you save. Picture: paper boats, folded from pages,
// sailing in from open water through a harbour arch, where the beacon (the one
// accent) waits and one boat already rests in the calm water behind the wall.
// Front-on elevation throughout: sky, a sea line, a stone wall with an arch.
// The arch and beacon are the mark's own idea built as architecture, so the
// logo is part of the scene rather than a badge on it.
//
//   node draw.mjs        writes cover.svg and cover-mobile.svg next to this file
//   node ../../../scripts/portfolio.mjs ../brand.json
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { arcBand, rect, circle, poly, svg, write } from '../../../scripts/brand.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const C = { water: '#12324a', swell: '#1c4562', signal: '#f0643c', sand: '#f6f1e7', stone: '#e4dac8', mist: '#cfe0ea', haze: '#c2d6e2' }

/** A paper boat seen side on, sitting on the water line `y`, `w` wide. */
function boat(x, y, w, fill = C.sand) {
  const h = w * 0.26, sail = w * 0.42
  const hull = poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.32, y], [x - w * 0.32, y]])
  const peak = poly([[x - w * 0.24, y - h], [x + w * 0.02, y - h - sail], [x + w * 0.24, y - h]])
  // The fold: a thin crease line down the sail and across the hull top, in stone.
  const crease = poly([[x + w * 0.005, y - h - sail * 0.92], [x + w * 0.035, y - h - sail * 0.92], [x + w * 0.035, y - h], [x + w * 0.005, y - h]])
  const rim = rect(x - w / 2, y - h, w, w * 0.035)
  return `<path d="${hull}${peak}" fill="${fill}"/><path d="${crease}${rim}" fill="${C.stone}"/>` + `<rect x="${x - w * 0.36}" y="${y + 10}" width="${w * 0.72}" height="10" rx="5" fill="${C.swell}"/>`
}

/** Short rounded wave strokes in the swell colour, as filled pills. */
const wave = (x, y, w) => `<rect x="${x - w / 2}" y="${y - 4}" width="${w}" height="8" rx="4" fill="${C.swell}"/>`

function scene(W, H, { wallHalf, boats, waves, title }) {
  const cx = W / 2
  const sea = 470 // sea line at the foot of the wall
  const top = 210 // top of the wall
  const R = 150 // the arch opening's radius; it springs 100 above the sea
  const spring = sea - 100
  const parts = []
  // Sky and sea, edge to edge.
  parts.push(`<rect width="${W}" height="${H}" fill="${C.mist}"/>`)
  // Two soft horizontal hazes in the sky (same hue, faint), no clouds to compete.
  parts.push(`<rect x="${cx - W * 0.32}" y="150" width="${W * 0.22}" height="18" rx="9" fill="${C.haze}"/>`)
  parts.push(`<rect x="${cx + W * 0.12}" y="112" width="${W * 0.16}" height="18" rx="9" fill="${C.haze}"/>`)
  parts.push(`<rect y="${sea}" width="${W}" height="${H - sea}" fill="${C.water}"/>`)

  // The wall: a sand block from sea to top, with stone courses, and the arch cut through it.
  const x0 = cx - wallHalf, x1 = cx + wallHalf
  const opening = `M${cx - R} ${sea}V${spring}A${R} ${R} 0 0 1 ${cx + R} ${spring}V${sea}Z`
  parts.push(`<path d="${rect(x0, top, x1 - x0, sea - top)}${opening}" fill="${C.sand}" fill-rule="evenodd"/>`)
  // Courses: thin stone lines every 52 px, stopped short of the arch.
  let courses = ''
  for (let y = top + 52; y < sea - 10; y += 52) {
    const yc = y - spring
    const half = yc < 0 ? Math.sqrt(Math.max(0, R * R - yc * yc)) : R
    courses += rect(x0 + 24, y - 2, cx - half - 18 - (x0 + 24), 4) + rect(cx + half + 18, y - 2, x1 - 24 - (cx + half + 18), 4)
  }
  parts.push(`<path d="${courses}" fill="${C.stone}"/>`)
  // Coping along the top and the arch's voussoir band, both in stone.
  parts.push(`<path d="${rect(x0 - 14, top - 22, x1 - x0 + 28, 26)}${arcBand(cx, spring, R + 34, 34, 180, 360)}" fill="${C.stone}"/>`)
  // Inside the arch: the sheltered water is calm (no waves), one boat rests there.
  parts.push(`<path d="M${cx - R} ${sea}V${spring}A${R} ${R} 0 0 1 ${cx + R} ${spring}V${sea}Z" fill="${C.haze}"/>`)
  parts.push(`<rect x="${cx - R}" y="${sea - 46}" width="${R * 2}" height="46" fill="${C.water}"/>`)
  parts.push(boat(cx + 40, sea - 46, 110))
  // The beacon: the accent, the one thing lit, hung at the crown of the arch.
  parts.push(`<rect x="${cx - 3}" y="${spring - R}" width="6" height="56" fill="${C.water}"/>`)
  parts.push(`<path d="${circle(cx, spring - R + 86, 32)}" fill="${C.signal}"/>`)
  // Its light on the water in front of the arch: three signal dashes.
  parts.push([[0, 26, 70], [0, 58, 44], [0, 88, 22]].map(([dx, dy, w]) => `<rect x="${cx + dx - w / 2}" y="${sea + dy - 5}" width="${w}" height="10" rx="5" fill="${C.signal}"/>`).join(''))
  // Waves on the open water, and the boats coming in from the left.
  parts.push(waves.map(([x, y, w]) => wave(cx + x, sea + y, w)).join(''))
  // Boats sail in the foreground water (lower is nearer, in a flat elevation), in a line toward the arch.
  parts.push(boats.map(([x, y, w]) => boat(cx + x, sea + y, w)).join(''))
  return svg({ w: W, h: H, title, body: parts.join('') })
}

const alt = 'Paper boats folded from pages sail across dark water toward a stone harbour arch, where a coral beacon glows and one boat already rests in the calm water inside.'

write(
  join(here, 'cover.svg'),
  scene(2400, 800, {
    title: alt,
    wallHalf: 560,
    boats: [[-700, 170, 170], [-430, 230, 230]],
    waves: [[-820, 60, 90], [-560, 110, 120], [-250, 70, 80], [-180, 170, 140], [300, 90, 110], [520, 50, 80], [700, 150, 120], [-760, 260, 100], [160, 230, 90], [420, 270, 130]],
  })
)
write(
  join(here, 'cover-mobile.svg'),
  scene(1000, 800, {
    title: alt,
    wallHalf: 330,
    boats: [[-210, 220, 200]],
    waves: [[-260, 80, 90], [-120, 130, 70], [200, 90, 100], [280, 180, 80], [-300, 270, 90], [150, 250, 100]],
  })
)
console.log('alt:', alt)
