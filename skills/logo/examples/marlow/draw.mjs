// Marlow & Finch: a stationery shop. The monogram example: the initials M and F
// drawn three ways, each a different monogram structure.
//   1  Shared stem, serif: Bodoni Moda; the F stands on the M's right stem,
//      raised so its arms clear the M's shoulder (one stroke, two letters).
//   2  Monoline in a ring: one stroke weight; M and F share the centre stem and
//      every line runs out to the ring, so the ring finishes each letter.
//   3  Ligature in a tile: a bold sans MF sharing one stem, knocked out of a
//      rounded square, which is the app icon and favicon as it stands.
//
//   node draw.mjs    (writes monogram-1/2/3.svg and monograms.svg/png beside this file)
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFont, text, svg, write, ring, circle, rect } from '../../scripts/brand.mjs'
import { union, subtract, intersect, bounds, bar, polyline, solid } from '../../scripts/geometry.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)
const ink = '#1f2a24'
const glyph = (font, ch, size, x = 0, y = 0) => {
  const d = solid(text(font, ch, { size, x, y }).d)
  return { d, b: bounds(d) }
}
// Where a letter's stroke crosses a horizontal line: the stem, as { x, w }.
const stemAt = (d, y, fromX = -1e3) => bounds(intersect(d, bar(fromX, y, 1e3, y, 2)))

const marks = []

// ── 1  Shared stem, serif ──
{
  const font = await loadFont('Bodoni Moda', 600)
  const S = 180, cap = text(font, 'M', { size: S }).capHeight, rise = 0.42
  const M0 = glyph(font, 'M', S), F0 = glyph(font, 'F', S)
  const mStem = stemAt(M0.d, -cap / 2, M0.b.x + M0.b.w * 0.72) // the M's right stem
  const fStem = stemAt(F0.d, -cap * 0.25) // the F's stem
  const base = 128 + cap * (0.5 + rise / 2)
  const mx = 128 - M0.b.w * 0.62 - M0.b.x
  const fx = mx + mStem.x + mStem.w / 2 - (fStem.x + fStem.w / 2)
  const M = glyph(font, 'M', S, mx, base)
  const F = glyph(font, 'F', S, fx, base - cap * rise)
  // Serifs that would land in the middle of the other letter go: the F's foot
  // (the M's stem carries it to the baseline) and the right half of the M's top
  // serif (it would cross the F's stem between the arms).
  const fFoot = base - cap * rise - 9
  const Fc = intersect(F.d, rect(fx - 100, 0, 400, fFoot))
  const stemR = mx + mStem.x + mStem.w
  const Mc = subtract(M.d, rect(stemR, base - cap - 2, 60, 14))
  marks.push({ name: 'Shared stem', note: 'Bodoni Moda 600. The F stands on the M’s right stem.', d: union(Mc, Fc) })
}

// ── 2  Monoline in a ring ──
{
  const w = 10, R = 112
  const top = 40
  const lines = union(
    bar(52, 0, 52, 256, w), // M, left stem
    polyline([[52, top], [90, 172], [128, top]], w), // M, the V
    bar(128, 0, 128, 256, w), // shared stem
    bar(128, 84, 256, 84, w), // F, top arm
    bar(128, 140, 256, 140, w) // F, middle arm
  )
  marks.push({ name: 'Monoline in a ring', note: 'One weight, 10 on 256. The ring ends every line.', d: union(ring(128, 128, R, w), intersect(lines, circle(128, 128, R - w))) })
}

// ── 3  Ligature in a tile ──
{
  // The everyday one: a bold sans M and F sharing a stem, knocked out of a
  // rounded tile, so it is already an app icon and survives 16 px.
  const font = await loadFont('Outfit', 700)
  const S = 150, cap = text(font, 'M', { size: S }).capHeight
  const M0 = glyph(font, 'M', S), F0 = glyph(font, 'F', S)
  const stem = stemAt(F0.d, -cap * 0.25).w
  const total = M0.b.w + F0.b.w - stem, x0 = 128 - total / 2, base = 128 + cap / 2
  const M = glyph(font, 'M', S, x0 - M0.b.x, base)
  const F = glyph(font, 'F', S, x0 + M0.b.w - stem - F0.b.x, base)
  marks.push({ name: 'Ligature in a tile', note: 'Outfit 700, one shared stem, cut from the tile.', d: subtract(rect(16, 16, 224, 224, 52), union(M.d, F.d)) })
}

// Each monogram on its own, trimmed to its art, then all three on one sheet.
const cell = 300
let sheet = ''
marks.forEach((m, i) => {
  const b = bounds(m.d)
  const box = { x: Math.floor(b.x), y: Math.floor(b.y), w: Math.ceil(b.x + b.w) - Math.floor(b.x), h: Math.ceil(b.y + b.h) - Math.floor(b.y) }
  write(out(`monogram-${i + 1}.svg`), svg({ w: box.w, h: box.h, title: 'Marlow & Finch', body: `<path d="${m.d}" fill="${ink}" transform="translate(${-box.x} ${-box.y})"/>` }))
  const s = 200 / Math.max(box.w, box.h)
  const tx = i * cell + (cell - box.w * s) / 2 - box.x * s, ty = 40 + (220 - box.h * s) / 2 - box.y * s
  sheet += `<path d="${m.d}" fill="${ink}" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})"/>`
  // 32 px proof under each, for the small-size check.
  const s2 = 32 / Math.max(box.w, box.h)
  sheet += `<path d="${m.d}" fill="${ink}" transform="translate(${(i * cell + cell / 2 - 16 - box.x * s2).toFixed(2)} ${(286 - box.y * s2).toFixed(2)}) scale(${s2.toFixed(4)})"/>`
  sheet += `<text x="${i * cell + cell / 2}" y="350" text-anchor="middle" font-family="system-ui, sans-serif" font-size="15" font-weight="600" fill="${ink}">${i + 1}  ${m.name}</text>`
  sheet += `<text x="${i * cell + cell / 2}" y="370" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#5b625d">${m.note}</text>`
})
write(out('monograms.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cell * 3} 390"><rect width="100%" height="100%" fill="#f4f1ea"/>${sheet}</svg>\n`)
