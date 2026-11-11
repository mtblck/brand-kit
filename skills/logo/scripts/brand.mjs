/**
 * brand.mjs: the drawing kit for logos.
 *
 *   import { loadFont, text, circle, rect, poly, svg, write } from '/abs/path/to/scripts/brand.mjs'
 *
 * - loadFont('Space Grotesk', 700) fetches the TTF from Google Fonts once and
 *   caches it (~/.cache/brand-kit/fonts, or $BRAND_KIT_CACHE). A path to a local
 *   .ttf/.otf works too.
 * - text(font, 'Name', { size, tracking, x, y, anchor }) sets a word and returns
 *   it as an outlined path (`d`) plus its measurements, so a wordmark never
 *   depends on the viewer having the font.
 * - The geometry helpers return path data rounded to 2 decimals.
 *
 * Needs opentype.js. If it isn't importable it is installed once into the
 * cache folder with npm (pinned below); nothing is added to the project.
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { homedir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

const OPENTYPE = 'opentype.js@1.3.4'
export const CACHE = process.env.BRAND_KIT_CACHE || join(homedir(), '.cache', 'brand-kit')

let opentype
async function ot() {
  if (opentype) return opentype
  try {
    opentype = (await import('opentype.js')).default
    return opentype
  } catch {}
  const req = createRequire(join(CACHE, 'noop.js'))
  try {
    opentype = req('opentype.js')
    return opentype
  } catch {}
  mkdirSync(CACHE, { recursive: true })
  console.error(`brand-kit: installing ${OPENTYPE} into ${CACHE} (once)`)
  execFileSync('npm', ['install', '--no-save', '--no-audit', '--no-fund', '--prefix', CACHE, OPENTYPE], { stdio: 'ignore' })
  opentype = req('opentype.js')
  return opentype
}

const fontCache = new Map()

/** Fetch (once) and parse a Google Font, or parse a local font file. */
export async function loadFont(family, weight = 400, { italic = false } = {}) {
  const key = `${family}|${weight}|${italic}`
  if (fontCache.has(key)) return fontCache.get(key)
  const lib = await ot()
  let file
  if (/\.(ttf|otf|woff)$/i.test(family)) {
    file = resolve(family)
  } else {
    const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    file = join(CACHE, 'fonts', `${slug}-${weight}${italic ? 'i' : ''}.ttf`)
    if (!existsSync(file)) {
      // With no browser User-Agent, the css2 API answers with plain TTF URLs.
      const fam = encodeURIComponent(family).replace(/%20/g, '+')
      const url = `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@${italic ? 1 : 0},${weight}`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Google Fonts has no "${family}" at weight ${weight}${italic ? ' italic' : ''} (${res.status}). Check the family name and its weights on fonts.google.com.`)
      const src = (await res.text()).match(/url\((https:[^)]+)\)/)?.[1]
      if (!src) throw new Error(`No font file in the Google Fonts answer for "${family}"`)
      const bin = await fetch(src)
      if (!bin.ok) throw new Error(`Couldn't download ${src} (${bin.status})`)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, Buffer.from(await bin.arrayBuffer()))
    }
  }
  const buf = readFileSync(file)
  const font = lib.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
  font.label = /\.(ttf|otf|woff)$/i.test(family) ? family : `${family} ${weight}${italic ? ' italic' : ''}`
  font.file = file
  fontCache.set(key, font)
  return font
}

/**
 * Set `str` in `font` as one outlined path.
 *   size      font size in user units (the em)
 *   tracking  extra space between letters, in em (0.02 = +2 %)
 *   x, y      position of the baseline start (or middle/end, see anchor)
 *   anchor    'start' | 'middle' | 'end'
 *   kern      false to ignore the font's kerning
 * Glyphs are laid out one by one with the font's kerning; ligatures and other
 * substitutions are not applied, which is what a wordmark wants anyway.
 * Returns { d, width, bbox, capHeight, xHeight, ascender, descender, x, y }.
 */
export function text(font, str, { size = 100, tracking = 0, x = 0, y = 0, anchor = 'start', kern = true } = {}) {
  const s = size / font.unitsPerEm
  const glyphs = [...str].map((ch) => font.charToGlyph(ch))
  const missing = [...str].filter((ch, i) => ch.trim() && glyphs[i].index === 0)
  if (missing.length) throw new Error(`${font.label} has no glyph for: ${missing.join(' ')}`)
  const advances = []
  let w = 0
  glyphs.forEach((g, i) => {
    if (i > 0) w += (kern ? font.getKerningValue(glyphs[i - 1], g) * s : 0) + tracking * size
    advances.push(w)
    w += g.advanceWidth * s
  })
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x
  let d = ''
  let bbox = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity }
  glyphs.forEach((g, i) => {
    const p = g.getPath(x0 + advances[i], y, size)
    d += p.toPathData(2)
    const b = p.getBoundingBox()
    if (b.x1 < b.x2) bbox = { x1: Math.min(bbox.x1, b.x1), y1: Math.min(bbox.y1, b.y1), x2: Math.max(bbox.x2, b.x2), y2: Math.max(bbox.y2, b.y2) }
  })
  if (d.includes('NaN')) throw new Error(`${font.label}: the outline came out broken (NaN); try another weight or family`)
  const os2 = font.tables.os2 || {}
  return {
    d,
    x: x0,
    y,
    width: round(w),
    bbox: { x1: round(bbox.x1), y1: round(bbox.y1), x2: round(bbox.x2), y2: round(bbox.y2), w: round(bbox.x2 - bbox.x1), h: round(bbox.y2 - bbox.y1) },
    capHeight: round((os2.sCapHeight || font.ascender * 0.7) * s),
    xHeight: round((os2.sxHeight || font.ascender * 0.5) * s),
    ascender: round(font.ascender * s),
    descender: round(font.descender * s),
  }
}

export const round = (n, p = 2) => Math.round(n * 10 ** p) / 10 ** p
const f = (n) => String(round(n))

/** Full circle as a path (two arcs), so it can join other shapes in one `d`. */
export const circle = (cx, cy, r) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`

/** Ring (annulus): use with fill-rule="evenodd". */
export const ring = (cx, cy, r, w) => circle(cx, cy, r) + circle(cx, cy, r - w)

/** Rectangle with optional corner radius. */
export function rect(x, y, w, h, r = 0) {
  r = Math.min(r, w / 2, h / 2)
  if (!r) return `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`
  return `M${f(x + r)} ${f(y)}h${f(w - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(r)}v${f(h - 2 * r)}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(r)}h${f(-(w - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(-r)} ${f(-r)}v${f(-(h - 2 * r))}a${f(r)} ${f(r)} 0 0 1 ${f(r)} ${f(-r)}Z`
}

/** Closed polygon through [[x, y], …]. */
export const poly = (pts) => 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join('L') + 'Z'

/** Regular n-gon, first vertex straight up unless `rot` (degrees) says otherwise. */
export function ngon(cx, cy, r, n, rot = 0) {
  return poly(Array.from({ length: n }, (_, i) => {
    const a = ((rot - 90 + (360 / n) * i) * Math.PI) / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }))
}

/** Point on a circle at `deg` (0 = right, 90 = down, SVG convention). */
export const polar = (cx, cy, r, deg) => [round(cx + r * Math.cos((deg * Math.PI) / 180)), round(cy + r * Math.sin((deg * Math.PI) / 180))]

/** Filled arc band (a thick arc as an outline) from a0 to a1 degrees. */
export function arcBand(cx, cy, r, w, a0, a1) {
  const ro = r, ri = r - w
  const large = Math.abs(a1 - a0) % 360 > 180 ? 1 : 0
  const [x1, y1] = polar(cx, cy, ro, a0), [x2, y2] = polar(cx, cy, ro, a1)
  const [x3, y3] = polar(cx, cy, ri, a1), [x4, y4] = polar(cx, cy, ri, a0)
  return `M${x1} ${y1}A${f(ro)} ${f(ro)} 0 ${large} 1 ${x2} ${y2}L${x3} ${y3}A${f(ri)} ${f(ri)} 0 ${large} 0 ${x4} ${y4}Z`
}

/** Ellipse as a path, like `circle`. */
export const ellipse = (cx, cy, rx, ry) =>
  `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`

/**
 * A thick line with round ends (a capsule) from (x1, y1) to (x2, y2), `w` wide.
 * For limbs, stalks and handles in figurative marks, so they share one weight.
 */
export function limb(x1, y1, x2, y2, w) {
  const r = w / 2, len = Math.hypot(x2 - x1, y2 - y1)
  const nx = (-(y2 - y1) / len) * r, ny = ((x2 - x1) / len) * r
  return `M${f(x1 + nx)} ${f(y1 + ny)}L${f(x2 + nx)} ${f(y2 + ny)}A${f(r)} ${f(r)} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)}L${f(x1 - nx)} ${f(y1 - ny)}A${f(r)} ${f(r)} 0 0 0 ${f(x1 + nx)} ${f(y1 + ny)}Z`
}

/**
 * A closed smooth outline through [[x, y], …] (Catmull-Rom turned into cubic
 * Béziers). Add 'corner' as a third item to keep a point sharp, for a fin tip, a
 * claw point or a notch. `tension` 0 is loose, 0.5 a standard Catmull-Rom curve (the
 * default), 1 straight lines.
 * The tool for organic silhouettes: one outline instead of a pill and triangles,
 * so the parts of a creature flow into each other.
 */
export function smooth(pts, tension = 0.5) {
  const n = pts.length, k = (1 - tension) / 3
  const P = (i) => pts[(i + n) % n]
  let d = `M${f(P(0)[0])} ${f(P(0)[1])}`
  for (let i = 0; i < n; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2)
    const c1 = p1[2] === 'corner' ? p1 : [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k]
    const c2 = p2[2] === 'corner' ? p2 : [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k]
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}

/** Wrap SVG markup in a translate/scale group. */
export const place = (body, x = 0, y = 0, s = 1) => `<g transform="translate(${f(x)} ${f(y)})${s !== 1 ? ` scale(${round(s, 4)})` : ''}">${body}</g>`

/**
 * Lock a mark and a wordmark together.
 *   mark      { body, w, h }: the mark's SVG markup drawn in a w × h box
 *   font      a loadFont() result; name: the word to set
 *   layout    'horizontal' (word right of the mark) or 'stacked' (word under it)
 *   capRatio  cap height as a share of the mark's height (horizontal) or of its width (stacked)
 *   gap       space between mark and word, as a share of the mark's height
 *   color     fill for the word; tracking: em, as in text()
 * The word's cap height is centred on the mark (horizontal) or the word is
 * centred under it (stacked). Returns { w, h, body } with the art touching
 * the edges, so callers add their own clear space with `pad`.
 */
export function lockup({ mark, font, name, layout = 'horizontal', capRatio, gap = 0.32, color = '#000', tracking = 0, pad = 0 }) {
  capRatio ??= layout === 'horizontal' ? 0.46 : 0.3
  const probe = text(font, name, { size: 100, tracking })
  const capTarget = capRatio * (layout === 'horizontal' ? mark.h : mark.w)
  const size = (100 * capTarget) / probe.capHeight
  const t0 = text(font, name, { size, tracking })
  const g = gap * mark.h
  if (layout === 'horizontal') {
    const base = mark.h / 2 + t0.capHeight / 2 // baseline, measured from the mark's top
    const top = Math.min(0, base + t0.bbox.y1), bottom = Math.max(mark.h, base + t0.bbox.y2)
    const t = text(font, name, { size, tracking, x: pad + mark.w + g - t0.bbox.x1, y: pad - top + base })
    return { w: round(pad * 2 + mark.w + g + t0.bbox.w), h: round(pad * 2 + bottom - top), body: place(mark.body, pad, pad - top) + `<path d="${t.d}" fill="${color}"/>`, size: round(size) }
  }
  const w = Math.max(mark.w, t0.bbox.w)
  const t = text(font, name, { size, tracking, x: pad + w / 2 - (t0.bbox.x1 + t0.bbox.w / 2), y: pad + mark.h + g - t0.bbox.y1 })
  return { w: round(pad * 2 + w), h: round(pad * 2 + mark.h + g + t0.bbox.h), body: place(mark.body, pad + (w - mark.w) / 2, pad) + `<path d="${t.d}" fill="${color}"/>`, size: round(size) }
}

/** `<path>` element. */
export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}"${extra ? ' ' + extra : ''}/>`

/**
 * A finished SVG document. `w`/`h` set the viewBox (and nothing else, so the
 * logo scales to its container); `title` is its accessible name.
 */
export function svg({ w, h, title, body, bg }) {
  const back = bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${back}${body}</svg>\n`
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Write a file, creating its folder, and print its path. */
export function write(file, content) {
  mkdirSync(dirname(resolve(file)), { recursive: true })
  writeFileSync(file, content)
  console.log(resolve(file))
}
