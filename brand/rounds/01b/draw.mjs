// Logowright, round 1b: Matt kept 1 and 7 from round 1 and asked for the other
// seven again, with new ideas. 1.svg and 7.svg are copied from ../01.
//
//   node draw.mjs    (writes 2–6, 8, 9 .svg and round-1b.png beside this file)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const KIT = '../../../skills/logo/scripts/'
const { loadFont, text, svg, write, rect, circle, arcBand, limb } = await import(KIT + 'brand.mjs')
const { union, subtract, intersect, exclude, bounds, transform, solid, polyline } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const font = await loadFont('Outfit', 600)
const word = (str, size = 120, tracking = -0.02, f = font) => {
  const t = text(f, str, { size, tracking })
  return { ...t, d: solid(t.d) }
}
const mark1 = (x, y, s) => transform(exclude(rect(40, 88, 128, 128, 0), circle(160, 96, 64)), { s, x, y })
const cells = {}

// 2 · Symbol · 3: a wax seal (a scalloped disc) pressed with mark 1: the
// wright's seal of approval on a finished logo.
{
  const bumps = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * 2 * Math.PI
    return circle(128 + 98 * Math.cos(a), 128 + 98 * Math.sin(a), 22)
  })
  const disc = union(circle(128, 128, 100), ...bumps)
  // mark 1 spans x 40..224, y 32..216 (184 square); centre it at 128,128 at 0.5
  const m = mark1(128 - 132 * 0.5, 128 - 124 * 0.5, 0.5)
  cells[2] = subtract(disc, m)
}

// 3 · Symbol · 4: one circle, half traced in pixels and half drawn as a vector:
// the plugin draws in SVG and never traces a raster.
{
  const R = 96, cx = 128, cy = 128, step = 16
  const right = intersect(circle(cx, cy, R), rect(cx, cy - R - 1, R + 2, 2 * R + 2, 0))
  const px = []
  for (let y = cy - R; y < cy + R; y += step) {
    for (let x = cx - R; x < cx; x += step) {
      const mx = x + step / 2, my = y + step / 2
      if ((mx - cx) ** 2 + (my - cy) ** 2 <= R * R) px.push(rect(x, y, step, step, 0))
    }
  }
  cells[3] = union(right, ...px)
}

// 4 · Lettermark · 2: "lw" knocked out of a rounded tile.
{
  const t = word('lw', 150, -0.03)
  const b = t.bbox
  const lw = transform(t.d, { x: 128 - (b.x1 + b.w / 2), y: 128 - (b.y1 + b.h / 2) })
  cells[4] = subtract(rect(16, 16, 224, 224, 48), lw)
}

// 5 · Lettermark · 3: a w drawn with a compass: two arcs swung from two points.
const compassW = () => union(arcBand(92, 80, 52, 17, 0, 180), arcBand(164, 80, 52, 17, 0, 180))
cells[5] = compassW()

// 6 · Lettermark · 4: connect the dots: a 5 × 3 grid of points, five of them
// joined to draw a w, the rest left as the grid it was built on.
{
  const xs = [32, 80, 128, 176, 224], ys = [56, 128, 200]
  const dots = []
  for (const x of xs) for (const y of ys) dots.push(circle(x, y, 11))
  const P = [[32, 56], [80, 200], [128, 128], [176, 200], [224, 56]]
  const line = union(...P.slice(1).map((q, i) => limb(P[i][0], P[i][1], q[0], q[1], 22)))
  const ends = P.map(([x, y]) => circle(x, y, 19))
  cells[6] = union(...dots, line, ...ends)
}

// 8 · Wordmark · 3: logowright with its w swapped for the compass w (cell 5).
{
  const a = word('logo'), b = word('right')
  const xh = a.xHeight // the arcs are scaled to the x-height
  const s = xh / 52
  const w = transform(compassW(), { s })
  const wb = bounds(w)
  const gap = 6
  const wPlaced = transform(w, { x: a.width + gap - wb.x, y: -xh - wb.y + (xh - wb.h) })
  const wx2 = a.width + gap + wb.w
  cells[8] = union(a.d, wPlaced, transform(b.d, { x: wx2 + gap }))
}

// 9 · Wordmark · 4: "logo" in pixels, "wright" as smooth vector: the word
// changing from raster to drawn as it's read.
{
  const pix = await loadFont('Pixelify Sans', 700)
  const a = text(pix, 'logo', { size: 120 }), b = word('wright')
  cells[9] = union(solid(a.d), transform(b.d, { x: a.width + 4 }))
}

for (const [i, d] of Object.entries(cells)) {
  const b = bounds(d), p = 2
  write(out(`${i}.svg`), svg({ w: b.w + p * 2, h: b.h + p * 2, title: `Logowright sketch ${i}`, body: `<path d="${d}" fill="#000" fill-rule="evenodd" transform="translate(${p - b.x} ${p - b.y})"/>` }))
}
const files = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => out(`${i}.svg`))
execFileSync('node', [join(here, KIT, 'render.mjs'), ...files, '--sheet', out('round-1b.png'), '--rows', 'Symbol,Lettermark,Wordmark', '--cols', 'Weirdness 2,Weirdness 3,Weirdness 4', '--title', 'Logowright · round 1b · 1 and 7 kept, seven new sketches', '--mono'], { stdio: 'inherit' })
