// Logowright, round 1c: ships, sailing and the north star (Matt, 2026-11-28,
// after rounds 1 and 1b didn't land). reference.png is the generator logo he
// liked: drafting dividers in a ring with a four-point star. A wright is a
// maker, as in shipwright.
//
//   node draw.mjs    (writes 1.svg … 9.svg and round-1c.png beside this file)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
const KIT = '../../../skills/logo/scripts/'
const { loadFont, text, svg, write, rect, circle, arcBand, ring, limb, poly } = await import(KIT + 'brand.mjs')
const { union, subtract, intersect, bounds, transform, solid } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const font = await loadFont('Outfit', 600)
const TR = -0.02
const word = (str, size = 120) => {
  const t = text(font, str, { size, tracking: TR })
  return { ...t, d: solid(t.d) }
}
// x where letter i of the word starts, and its advance
const at = (str, i, size = 120) => (i === 0 ? 0 : word(str.slice(0, i), size).width + TR * size)

// A four-point star, the north star: points at R, waist at r.
const star = (cx, cy, R, r = R * 0.3) =>
  poly(Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2, k = i % 2 ? r : R
    return [cx + k * Math.cos(a), cy + k * Math.sin(a)]
  }))

// A sailboat from three plain shapes: hull, mainsail (a quarter circle) and jib.
const boat = () => union(
  intersect(circle(128, 40, 172), rect(16, 184, 224, 60, 0)), // hull
  rect(122, 24, 12, 160, 0), // mast
  arcBand(116, 172, 128, 128, 180, 270), // mainsail
  poly([[140, 48], [140, 172], [216, 172]]), // jib
)

const cells = []

// 1 · Symbol · 2: dividers with the north star as their hinge, the arc they've
// just drawn joining the points. Drawing and navigating with one instrument.
cells.push(union(
  limb(128, 64, 60, 214, 22), limb(128, 64, 196, 214, 22),
  arcBand(128, 64, 168, 14, 63, 117),
  star(128, 60, 48, 17),
))

// 2 · Symbol · 3: a sailboat built from three plain shapes: a quarter-circle
// mainsail, a triangle jib and a hull cut from a circle.
cells.push(boat())

// 3 · Symbol · 4: a ship in a bottle: the patient craft of making something
// small and exact. The boat is cut out of the bottle.
{
  const bottle = union(rect(16, 64, 180, 128, 48), rect(188, 106, 36, 44, 6), rect(222, 102, 22, 52, 6))
  cells.push(subtract(bottle, transform(boat(), { s: 0.42, x: 50, y: 70 })))
}

// 4 · Lettermark · 2: an L that is a mast and boom, its sail filling the corner.
cells.push(union(
  rect(56, 24, 30, 208, 0), rect(56, 202, 176, 30, 0),
  poly([[100, 40], [100, 188], [216, 188]]),
))

// 5 · Lettermark · 3: lw: the l is a mast with its pennant, the w is the sea.
cells.push(union(
  rect(117, 24, 22, 156, 0), poly([[139, 26], [139, 70], [196, 48]]),
  arcBand(92, 176, 46, 22, 0, 180), arcBand(164, 176, 46, 22, 0, 180),
))

// 6 · Emblem · 4: the north star made of four sails turning like a pinwheel.
{
  const sail = poly([[128, 128], [128, 20], [168, 112]])
  cells.push(union(...[0, 90, 180, 270].map((r) => transform(sail, { rotate: r, about: [128, 128] })), circle(128, 128, 14)))
}

// 7 · Wordmark · 2: logowright with the north star for the dot of its i.
{
  const w = word('logowright')
  const ix = at('logowright', 6), iw = word('i').width
  const noDot = subtract(w.d, rect(ix - 2, -200, iw + 4, 200 - w.xHeight - 6, 0))
  cells.push(union(noDot, star(ix + iw / 2, -w.xHeight - 24, 20, 7)))
}

// 8 · Wordmark · 3: the first o is a ship's wheel.
{
  const pre = word('l'), o = word('o'), rest = word('gowright')
  const gap = 6, r = o.bbox.h / 2, cx = pre.bbox.x2 + gap + r + 8, cy = -r
  const spokes = [0, 45, 90, 135].map((a) => {
    const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180), L = r + 9
    return limb(cx - c * L, cy - s * L, cx + c * L, cy + s * L, 8)
  })
  const rim = subtract(circle(cx, cy, r), circle(cx, cy, r - 11))
  cells.push(union(pre.d, rim, ...spokes, circle(cx, cy, 9), transform(rest.d, { x: cx + r + 8 + gap - rest.bbox.x1 })))
}

// 9 · Wordmark · 4: the word is the ship: a hull under it and the l raised into
// a mast with a sail.
{
  const w = word('logowright'), b = w.bbox
  const lw = word('l').width
  const hull = intersect(circle(b.x1 + b.w / 2, b.y2 - 640, 680), rect(b.x1 - 20, b.y2 + 14, b.w + 40, 40, 0))
  const l0 = word('l').bbox
  const mast = rect(l0.x1, -200, l0.w, 120, 0)
  const sail = poly([[l0.x2 + 10, -196], [l0.x2 + 10, -100], [l0.x2 + 90, -100]])
  cells.push(union(w.d, hull, mast, sail))
}

cells.forEach((d, i) => {
  const b = bounds(d), p = 2
  write(out(`${i + 1}.svg`), svg({ w: b.w + p * 2, h: b.h + p * 2, title: `Logowright sketch ${i + 1}`, body: `<path d="${d}" fill="#000" fill-rule="evenodd" transform="translate(${p - b.x} ${p - b.y})"/>` }))
})
execFileSync('node', [join(here, KIT, 'render.mjs'), ...cells.map((_, i) => out(`${i + 1}.svg`)), '--sheet', out('round-1c.png'), '--rows', 'Symbol,Lettermark or emblem,Wordmark', '--cols', 'Weirdness 2,Weirdness 3,Weirdness 4', '--title', 'Logowright · round 1c · ships, sails and the north star', '--mono'], { stdio: 'inherit' })
