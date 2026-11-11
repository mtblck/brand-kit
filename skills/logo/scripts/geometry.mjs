/**
 * geometry.mjs: construction tools for marks built from circles and for monograms.
 *
 *   Booleans   union(...shapes), subtract(a, ...cut), intersect(a, b), exclude(a, b)
 *              take path `d` strings (or anything with a `.d`) and return one
 *              clean `d`, so a mark can be carved from circles instead of drawn
 *              point by point. dilate(d, g) grows a shape by g on every side.
 *   Circle grid  grid = circleGrid(radii) keeps the radius set (series() for a
 *              golden-ratio set, fib() for Fibonacci multiples) and records
 *              every circle drawn from it: grid.c(cx, cy, step), grid.touch(c,
 *              step, deg, 'in'|'out'), grid.at(x, y, step). meet(a, b) gives two
 *              circles' crossing points. grid.check() fails loudly if a circle
 *              isn't from the set.
 *   Sheets     constructionSheet() draws the three-panel construction drawing
 *              (circles over grey, circles over colour, the clean mark) for the
 *              concept round; constructionOverlay() writes the circles alone,
 *              aligned to the mark's viewBox, for the brand guidelines.
 *   Letters    solid(text(...).d) turns a glyph into one clean outline; do it
 *              before any boolean on a letter.
 *   Monograms  bar() (a straight stroke with square ends), polyline() (a
 *              mitred monoline stroke through points), weave() (one letter
 *              passes under another, with a gap, only where you say), knockout()
 *              (one letter cut out of another with a gap all round).
 *
 * Booleans use paper.js (MIT), installed once into the brand-kit cache folder
 * like opentype.js. Output curves are cubic Béziers rounded to 2 decimals.
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { CACHE, circle, round, esc } from './brand.mjs'

const PAPER = 'paper@0.12.18'
let P
function paper() {
  if (P) return P
  const req = createRequire(join(CACHE, 'package.json'))
  try {
    P = req('paper/dist/paper-core.js')
  } catch {
    execFileSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', '--prefix', CACHE, PAPER], { stdio: 'ignore' })
    P = req('paper/dist/paper-core.js')
  }
  P.setup(new P.Size(1, 1))
  return P
}

const D = (s) => (typeof s === 'string' ? s : s.d)
const item = (d) => new (paper().CompoundPath)({ pathData: D(d), fillRule: 'evenodd', insert: false })
const tidy = (pd) => pd.replace(/-?\d*\.?\d+(e-?\d+)?/g, (n) => String(round(Number(n))))
const out = (it) => tidy(it.pathData)

/**
 * A glyph outline from text() made booleans-safe. Fonts draw letters as
 * overlapping pieces filled with the nonzero rule (an F's arms overlap its
 * stem), but these booleans read paths as evenodd, like the rest of the kit, so
 * an overlap would turn into a hole. solid() merges the pieces into one clean
 * outline first. Run every text() path through it before a boolean.
 */
export function solid(d) {
  const Pp = paper()
  const parts = new Pp.CompoundPath({ pathData: D(d), insert: false }).children.map((c) => new Pp.Path({ segments: c.segments, closed: true, insert: false }))
  if (!parts.length) return ''
  // Outer contours run one way and counters the other: merge each group, then cut.
  const outerCw = parts.reduce((a, b) => (Math.abs(b.area) > Math.abs(a.area) ? b : a)).clockwise
  const merge = (list) => list.reduce((acc, p) => (acc ? acc.unite(p, { insert: false }) : p), null)
  const fill = merge(parts.filter((p) => p.clockwise === outerCw))
  const holes = merge(parts.filter((p) => p.clockwise !== outerCw))
  return out(holes ? fill.subtract(holes, { insert: false }) : fill)
}

/** Union of any number of shapes. */
export function union(...shapes) {
  shapes = shapes.flat().filter(Boolean)
  let acc = item(shapes[0])
  for (const s of shapes.slice(1)) acc = acc.unite(item(s), { insert: false })
  return out(acc)
}
/** `a` with every later shape cut out of it. */
export function subtract(a, ...cuts) {
  let acc = item(a)
  for (const s of cuts.flat().filter(Boolean)) acc = acc.subtract(item(s), { insert: false })
  return out(acc)
}
/** Where `a` and `b` overlap: the lens of two circles, a crescent's tip. */
export const intersect = (a, b) => out(item(a).intersect(item(b), { insert: false }))
/** Either but not both. */
export const exclude = (a, b) => out(item(a).exclude(item(b), { insert: false }))

/**
 * Grow a shape by `g` on every side (a Minkowski sum with a circle, made from
 * `n` shifted copies; the error is under 2 % of g). For gaps around crossing
 * strokes, not for changing a letter's weight.
 */
export function dilate(d, g, n = 24) {
  const base = item(d)
  let acc = base
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n
    acc = acc.unite(base.clone({ insert: false }).translate(new (paper().Point)(g * Math.cos(a), g * Math.sin(a))), { insert: false })
  }
  return out(acc)
}

/** Shrink a shape by `g` on every side (the reverse of dilate). */
export function erode(d, g, n = 24) {
  const b = bounds(d), pad = g * 4
  const box = `M${b.x - pad} ${b.y - pad}h${b.w + pad * 2}v${b.h + pad * 2}h${-(b.w + pad * 2)}Z`
  return subtract(d, dilate(subtract(box, d), g, n))
}

/** The outline of a shape as a band `t` wide, inside its edge: inline and line-art letters. */
export const outline = (d, t) => subtract(d, erode(d, t))

/** Move a path `d` by (dx, dy) and scale it about the origin, returning a new `d`. */
export function transform(d, { x = 0, y = 0, s = 1, rotate = 0, about = [0, 0] } = {}) {
  const it = item(d)
  const Pt = paper().Point
  if (rotate) it.rotate(rotate, new Pt(about[0], about[1]))
  if (s !== 1) it.scale(s, new Pt(0, 0))
  if (x || y) it.translate(new Pt(x, y))
  return out(it)
}

/** Bounds of a path: { x, y, w, h }. */
export function bounds(d) {
  const b = item(d).bounds
  return { x: round(b.x), y: round(b.y), w: round(b.width), h: round(b.height) }
}

// ── Circle grids ─────────────────────────────────────────────────────────────

export const PHI = (1 + Math.sqrt(5)) / 2

/** `n` radii growing by `ratio` from `base`: series(10, 6) → 10, 16.18, 26.18, … */
export const series = (base, n = 6, ratio = PHI) => Array.from({ length: n }, (_, i) => round(base * ratio ** i))

/** Fibonacci multiples of `unit`: fib(8, 6) → 8, 16, 24, 40, 64, 104. */
export function fib(unit, n = 6) {
  const s = [1, 2]
  while (s.length < n) s.push(s.at(-1) + s.at(-2))
  return s.slice(0, n).map((k) => k * unit)
}

/** A circle as { cx, cy, r, d }; `d` is its path, ready for the booleans. */
export const C = (cx, cy, r) => ({ cx: round(cx), cy: round(cy), r: round(r), d: circle(cx, cy, r) })

/** The two points where circles a and b cross (empty if they don't). Upper (smaller y) first. */
export function meet(a, b) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, dist = Math.hypot(dx, dy)
  if (dist > a.r + b.r || dist < Math.abs(a.r - b.r) || !dist) return []
  const l = (a.r ** 2 - b.r ** 2 + dist ** 2) / (2 * dist), h = Math.sqrt(Math.max(0, a.r ** 2 - l ** 2))
  const mx = a.cx + (l * dx) / dist, my = a.cy + (l * dy) / dist
  const p = [[round(mx + (h * dy) / dist), round(my - (h * dx) / dist)], [round(mx - (h * dy) / dist), round(my + (h * dx) / dist)]]
  return p.sort((u, v) => u[1] - v[1])
}

/**
 * Centre of the circle of radius r through p1 and p2, on side 1 or -1 of the
 * line p1 → p2. Two grid circles through the same two points make a crescent
 * that tapers to nothing at both: subtract the larger from the smaller.
 */
export function through(p1, p2, r, side = 1) {
  const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2, dx = p2[0] - p1[0], dy = p2[1] - p1[1], L = Math.hypot(dx, dy)
  if (r < L / 2) throw new Error(`through: radius ${r} is too small to reach both points (needs ${round(L / 2)})`)
  const h = Math.sqrt(r * r - (L / 2) ** 2)
  return [round(mx + ((side * -dy) / L) * h), round(my + ((side * dx) / L) * h)]
}

/**
 * Smooth the V where two circles (or arcs) meet: the circle of radius r that
 * touches both from outside, and the web between it and them, so a union of
 * a, b and the web turns the notch into a concave curve of radius r.
 * side 1 or -1 picks the notch on one side of the line between the centres.
 */
export function fillet(a, b, r, side = 1) {
  const pts = meet(C(a.cx, a.cy, a.r + r), C(b.cx, b.cy, b.r + r))
  if (!pts.length) throw new Error('fillet: those circles are too far apart for that radius')
  if (!meet(a, b).length) throw new Error('fillet: a and b must overlap')
  const cross = (p) => (b.cx - a.cx) * (p[1] - a.cy) - (b.cy - a.cy) * (p[0] - a.cx)
  const [fx, fy] = pts.find((p) => Math.sign(cross(p)) === side) || pts[0]
  const f = C(fx, fy, r)
  // The notch is bounded by a, b and f: fill the quad from a's touch point to
  // where a and b cross, to b's touch point, to f's centre, minus f itself.
  const touchOn = (c) => [c.cx + ((fx - c.cx) * c.r) / (c.r + r), c.cy + ((fy - c.cy) * c.r) / (c.r + r)]
  const X = meet(a, b).sort((p, q) => Math.hypot(p[0] - fx, p[1] - fy) - Math.hypot(q[0] - fx, q[1] - fy))[0]
  const web = 'M' + [touchOn(a), X, touchOn(b), [fx, fy]].map(([x, y]) => `${round(x)} ${round(y)}`).join('L') + 'Z'
  return { circle: f, d: subtract(web, f.d) }
}

/**
 * A circle grid: a fixed set of radii, and a record of every circle drawn from
 * it (which is what the construction drawing shows).
 *   grid.c(cx, cy, step)               circle of radius radii[step] at a point (grid.at is the same)
 *   grid.touch(c, step, deg, side)     tangent to circle c at angle deg (0 = right,
 *                                      90 = down): 'in' sits inside c, 'out' outside
 *   grid.fillet(a, b, step, side)      the web that rounds the notch between a and b
 *                                      with a grid circle (union it into the shape)
 *   grid.guide(x1, y1, x2, y2)         a straight construction line (baseline, axis)
 *   grid.check()                       throws if any recorded circle's radius isn't in the set
 */
export function circleGrid(radii) {
  const circles = [], lines = []
  const r = (step) => {
    if (radii[step] === undefined) throw new Error(`circle grid has no step ${step} (radii: ${radii.join(', ')})`)
    return radii[step]
  }
  const keep = (c) => (circles.push(c), c)
  return {
    radii,
    circles,
    lines,
    c: (cx, cy, step) => keep(C(cx, cy, r(step))),
    at: (cx, cy, step) => keep(C(cx, cy, r(step))),
    touch(c, step, deg, side = 'in') {
      const rr = r(step), dist = side === 'in' ? c.r - rr : c.r + rr, a = (deg * Math.PI) / 180
      return keep(C(c.cx + dist * Math.cos(a), c.cy + dist * Math.sin(a), rr))
    },
    /** A grid circle tangent to the outside of both a and b, and the web it fills between them (union it in). side 1 or -1 picks which side. */
    fillet(a, b, step, side = 1) {
      const f = fillet(a, b, r(step), side)
      keep(f.circle)
      return f.d
    },
    guide: (x1, y1, x2, y2) => (lines.push([x1, y1, x2, y2]), null),
    check() {
      const bad = circles.filter((c) => !radii.some((q) => Math.abs(q - c.r) < 0.01))
      if (bad.length) throw new Error(`circles off the grid: ${bad.map((c) => c.r).join(', ')}`)
      return true
    },
  }
}

const lineArt = (grid, { stroke, width, offset = [0, 0] }) => {
  const [ox, oy] = offset
  const cs = grid.circles.map((c) => `<circle cx="${round(c.cx + ox)}" cy="${round(c.cy + oy)}" r="${c.r}"/>`).join('')
  const ls = grid.lines.map(([a, b, c, d]) => `<line x1="${round(a + ox)}" y1="${round(b + oy)}" x2="${round(c + ox)}" y2="${round(d + oy)}"/>`).join('')
  return `<g fill="none" stroke="${stroke}" stroke-width="${width}">${cs}${ls}</g>`
}

/** Bounding box of every recorded circle and guide, plus the art box. */
function extent(grid, box) {
  let x1 = box.x, y1 = box.y, x2 = box.x + box.w, y2 = box.y + box.h
  for (const c of grid.circles) (x1 = Math.min(x1, c.cx - c.r)), (y1 = Math.min(y1, c.cy - c.r)), (x2 = Math.max(x2, c.cx + c.r)), (y2 = Math.max(y2, c.cy + c.r))
  for (const [a, b, c, d] of grid.lines) (x1 = Math.min(x1, a, c)), (y1 = Math.min(y1, b, d)), (x2 = Math.max(x2, a, c)), (y2 = Math.max(y2, b, d))
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }
}

/**
 * The construction drawing, three panels in a row like a designer's
 * presentation board: (1) the circles over the mark in grey, (2) the circles
 * over the mark in colour, faint, (3) the finished mark.
 *   grid    a circleGrid() with its circles recorded
 *   body    the mark's SVG markup in grid coordinates (fills in brand colours)
 *   flat    the mark's silhouette as one `d` (for the grey panel)
 *   box     the art's bounds in grid coordinates { x, y, w, h }
 * Returns a full SVG document string.
 */
export function constructionSheet({ grid, body, flat, box, title = 'Construction', paper = '#f6f6f4', line = '#8a8a8a', grey = '#c9c7c3', pad = 24 }) {
  const e = extent(grid, box)
  const cell = Math.max(e.w, e.h) + pad * 2
  const sw = round(cell / 400, 2)
  const panel = (i, inner) => `<g transform="translate(${round(i * cell - e.x + pad + (cell - pad * 2 - e.w) / 2)} ${round(-e.y + pad + (cell - pad * 2 - e.h) / 2)})">${inner}</g>`
  const lines = lineArt(grid, { stroke: line, width: sw })
  const art = [
    panel(0, `<path d="${flat}" fill="${grey}"/>${lines}`),
    panel(1, `<g opacity="0.55">${body}</g>${lines}`),
    panel(2, body),
  ].join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(cell * 3)} ${round(cell)}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${round(cell * 3)}" height="${round(cell)}" fill="${paper}"/>${art}</svg>\n`
}

/**
 * The circles alone, as an SVG whose viewBox lines up with the mark's: pass the
 * mark's viewBox `{ w, h }` and the `offset` the mark's art was moved by when it
 * was trimmed (Harbor's trim is [-24, -24]). The guidelines lay it over the mark
 * on the construction panel (`logos.mark.construction` in brand.json).
 */
export function constructionOverlay({ grid, mark, offset = [0, 0], stroke = '#d33', title = 'Construction' }) {
  const box = { x: -offset[0], y: -offset[1], w: mark.w, h: mark.h }
  const e = extent(grid, box)
  const x = round(e.x + offset[0]), y = round(e.y + offset[1])
  const sw = round(Math.max(mark.w, mark.h) / 220, 2)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${round(e.w)} ${round(e.h)}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${lineArt(grid, { stroke, width: sw, offset })}</svg>\n`
}

// ── Monograms ────────────────────────────────────────────────────────────────

/** A straight stroke `w` wide from (x1, y1) to (x2, y2), with square (butt) ends. */
export function bar(x1, y1, x2, y2, w) {
  const len = Math.hypot(x2 - x1, y2 - y1), nx = (-(y2 - y1) / len) * (w / 2), ny = ((x2 - x1) / len) * (w / 2)
  const p = [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]
  return 'M' + p.map(([x, y]) => `${round(x)} ${round(y)}`).join('L') + 'Z'
}

/**
 * An open polyline through [[x, y], …] as one outline `w` wide, with mitred
 * corners and square ends: the strokes of a monoline letter (an M is one
 * polyline of five points). Very sharp corners (under about 20°) make long spikes;
 * trim them with intersect() or split the line.
 */
export function polyline(pts, w) {
  const h = w / 2
  const side = (s) => {
    const off = []
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], a = pts[i - 1], b = pts[i + 1]
      const n = (u, v) => { const L = Math.hypot(v[0] - u[0], v[1] - u[1]); return [(-(v[1] - u[1]) / L) * s, ((v[0] - u[0]) / L) * s] }
      if (!a) { const q = n(p, b); off.push([p[0] + q[0] * h, p[1] + q[1] * h]); continue }
      if (!b) { const q = n(a, p); off.push([p[0] + q[0] * h, p[1] + q[1] * h]); continue }
      const n1 = n(a, p), n2 = n(p, b), mx = n1[0] + n2[0], my = n1[1] + n2[1], dot = (mx * n1[0] + my * n1[1])
      off.push([p[0] + (mx / dot) * h, p[1] + (my / dot) * h])
    }
    return off
  }
  const ring = [...side(1), ...side(-1).reverse()]
  return union('M' + ring.map(([x, y]) => `${round(x)} ${round(y)}`).join('L') + 'Z')
}

/**
 * Interlace: `under` loses a gap of `gap` around `over`, but only inside the
 * `at` regions (circles or any shapes placed over the crossings you want).
 * Call it twice with the letters swapped and different regions for a true
 * over-under weave. Returns the new `under`.
 */
export function weave(over, under, { gap, at }) {
  const zone = union(...[at].flat().map(D))
  return subtract(under, intersect(dilate(D(over), gap), zone))
}

/** `bottom` with `top` cut out of it plus a gap all round: the top letter sits in front. */
export const knockout = (top, bottom, gap) => subtract(bottom, dilate(D(top), gap))
