// Wren, round 1: nine sketches on a 3 × 3 grid, in black.
// Rows are structures (symbol, lettermark, wordmark); columns are weirdness 2, 3
// and 4. This is the first thing the user sees after the direction questions.
// They pick one to three by number, and only those get drawn properly.
//
//   node draw.mjs    (writes 1.svg … 9.svg and round-1.png beside this file)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { loadFont, text, svg, write } from '../../../scripts/brand.mjs'
import { circleGrid, fib, union, subtract, intersect, bounds, through, solid, transform, bar, C } from '../../../scripts/geometry.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const R = fib(8, 6) // 8, 16, 24, 40, 64, 104

// The wren from the shipped mark, with its tail swappable.
function wren({ tail = true } = {}) {
  const g = circleGrid(R)
  const body = g.c(120, 156, 4), head = g.c(166, 98, 3)
  const ax = (-116 * Math.PI) / 180, px = -Math.sin(ax), py = Math.cos(ax)
  const t1 = g.c(68 + 93 * px, 92 + 93 * py, 5), t2 = g.c(68 - 93 * px, 92 - 93 * py, 5)
  const parts = [body.d, head.d, intersect(g.c(202, 74, 3).d, g.c(202, 134, 3).d), g.fillet(body, head, 3, -1), g.fillet(body, head, 2, 1)]
  if (tail) parts.push(intersect(t1.d, t2.d), g.fillet(body, t2, 1, 1), g.fillet(body, t1, 1, -1))
  const P1 = [122, 112], P2 = [70, 186]
  const wing = subtract(C(...through(P1, P2, 64, -1), 64).d, C(...through(P1, P2, 104, -1), 104).d)
  return { d: subtract(union(...parts), C(176, 90, 8).d), wing, body, head }
}

const font = await loadFont('Fraunces', 600)
const word = (str, size, x, y) => {
  const t = text(font, str, { size, x, y })
  return { ...t, d: solid(t.d) }
}
const cells = []

// 1 · Symbol · 2: the circle-grid wren.
{
  const w = wren()
  cells.push(subtract(w.d, w.wing))
}

// 2 · Symbol · 3: the wren's cocked tail is a pen nib (a few lines a day).
{
  const w = wren({ tail: false })
  const ax = (-116 * Math.PI) / 180, px = -Math.sin(ax), py = Math.cos(ax)
  const nib = intersect(C(68 + 84 * px, 92 + 84 * py, 104).d, C(68 - 84 * px, 92 - 84 * py, 104).d)
  const tip = [68 + Math.cos(ax) * 60, 92 + Math.sin(ax) * 60], hole = [68 + Math.cos(ax) * 8, 92 + Math.sin(ax) * 8]
  const slit = bar(tip[0] - Math.cos(ax) * 4, tip[1] - Math.sin(ax) * 4, hole[0], hole[1], 6)
  cells.push(subtract(union(w.d, nib, C(98, 120, 24).d), slit, C(hole[0], hole[1], 9).d, w.wing))
}

// 3 · Symbol · 4: a wren whose wings are an open book, mid-flight.
const g2 = (a, b) => circleGrid(R).fillet(a, b, 1, 1)
{
  const page = (tipX) => {
    const spine = [128, 168], tip = [tipX, 84], side = tipX < 128 ? 1 : -1
    return subtract(C(...through(spine, tip, 104, side), 104).d, C(...through(spine, tip, 168, side), 168).d)
  }
  // Seen head on: a round body at the spine, the head on top, a beak pointing at you.
  const body = C(128, 158, 24), head = C(128, 118, 24)
  const beak = intersect(C(116, 132, 16).d, C(140, 132, 16).d)
  cells.push(subtract(union(page(36), page(220), body.d, head.d, g2(body, head)), C(118, 112, 5).d, C(138, 112, 5).d, transform(beak, { y: 0 })))
}

// 4 · Lettermark · 2: a W whose centre peak rises into the wren's tail.
{
  const W = word('W', 230, 0, 0), b = W.bbox
  const Wd = transform(W.d, { x: 128 - (b.x1 + b.w / 2), y: 200 })
  const ax = (-112 * Math.PI) / 180, px = -Math.sin(ax), py = Math.cos(ax), T = [116, 40]
  const tail = intersect(C(T[0] + 52 * px, T[1] + 52 * py, 64).d, C(T[0] - 52 * px, T[1] - 52 * py, 64).d)
  cells.push(union(Wd, tail))
}

// 5 · Lettermark · 3: a lowercase w whose right arm is a perched wren's head.
{
  const w = word('w', 300, 0, 0), b = w.bbox
  const wd = transform(w.d, { x: 128 - (b.x1 + b.w / 2), y: 200 })
  const bb = bounds(wd)
  const hx = bb.x + bb.w - 26, hy = bb.y - 2
  const head = C(hx, hy, 28)
  const beak = intersect(C(hx + 34, hy - 16, 24).d, C(hx + 34, hy + 16, 24).d)
  cells.push(subtract(union(wd, head.d, beak), C(hx + 6, hy - 6, 6).d))
}

// 6 · Lettermark · 4: the wren again, its wing a w cut out of the body.
{
  const w = wren()
  const g = word('w', 120, 0, 0)
  const gd = transform(g.d, { x: 118 - (g.bbox.x1 + g.bbox.w / 2), y: 190 })
  cells.push(subtract(w.d, gd))
}

// 7 · Wordmark · 2: "wren" in Fraunces 600, tracking tightened.
{
  cells.push(word('wren', 120, 0, 0).d)
}

// 8 · Wordmark · 3: the n is a wren's head: an eye in the shoulder, a beak off it.
{
  const all = word('wren', 120, 0, 0), wre = word('wre', 120, 0, 0)
  const n = intersect(all.d, `M${wre.bbox.x2 + 2} -200h300v400h-300Z`), nb = bounds(n)
  const hx = nb.x + nb.w * 0.62, hy = nb.y + 18
  const beak = intersect(C(nb.x + nb.w + 10, hy - 14, 24).d, C(nb.x + nb.w + 10, hy + 14, 24).d)
  cells.push(subtract(union(all.d, beak), C(hx, hy, 6).d))
}

// 9 · Wordmark · 4: the whole word is the bird: a tail rises off the w, a beak off the n.
{
  const all = word('wren', 120, 0, 0), b = bounds(all.d)
  const ax = (-125 * Math.PI) / 180, px = -Math.sin(ax), py = Math.cos(ax)
  const T = [b.x + 18, b.y - 8]
  const tail = intersect(C(T[0] + 50 * px, T[1] + 50 * py, 64).d, C(T[0] - 50 * px, T[1] - 50 * py, 64).d)
  const by = b.y + 22
  const beak = intersect(C(b.x + b.w + 12, by - 14, 24).d, C(b.x + b.w + 12, by + 14, 24).d)
  cells.push(subtract(union(all.d, tail, beak), C(b.x + b.w - 22, by - 2, 6).d))
}

cells.forEach((d, i) => {
  const b = bounds(d), p = 2
  write(out(`${i + 1}.svg`), svg({ w: b.w + p * 2, h: b.h + p * 2, title: `Wren sketch ${i + 1}`, body: `<path d="${d}" fill="#000" transform="translate(${p - b.x} ${p - b.y})"/>` }))
})
const render = join(here, '../../../scripts/render.mjs')
execFileSync('node', [render, ...cells.map((_, i) => out(`${i + 1}.svg`)), '--sheet', out('round-1.png'), '--rows', 'Symbol,Lettermark,Wordmark', '--cols', 'Weirdness 2,Weirdness 3,Weirdness 4', '--title', 'Wren · round 1 · nine sketches, pick one to three', '--mono'], { stdio: 'inherit' })
