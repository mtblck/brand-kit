// Harbor at weirdness 1, 3 and 5 (see references/direction.md).
// Same brief as ../draw.mjs (a read-it-later app: "everything you saved, safe in
// one place"), drawn three times with the dial at 1, 3 and 5. Harbor itself is a 2.
//
//   node draw.mjs     (writes level-N-mark.svg and level-N-horizontal.svg next to this file)
//
// Every level passes the same checklist: 16 px, one colour, the dark tab.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFont, lockup, text, rect, poly, circle, place, svg, write, round } from '../../../scripts/brand.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)

// ── 1 · Quiet ──
// The name, and a lettermark tile for the icon. Grotesque type, Deep Water only.
// The H is knocked out of a square of radius 40 with evenodd, so there is no fake hole.
{
  const ink = '#12324a'
  const font = await loadFont('Inter Tight', 600)
  const h = text(font, 'H', { size: 100 })
  const s = 132 / h.capHeight * 100 // cap height 132 on the 208 tile
  const H = text(font, 'H', { size: s, x: 104, y: 104 + 132 / 2, anchor: 'middle' })
  const tile = rect(0, 0, 208, 208, 40)
  const mark = (fill) => ({ body: `<path d="${tile}${H.d}" fill="${fill}" fill-rule="evenodd"/>`, w: 208, h: 208 })
  write(out('level-1-mark.svg'), svg({ w: 208, h: 208, title: 'Harbor', body: mark(ink).body }))
  const l = lockup({ mark: mark(ink), font, name: 'Harbor', color: ink, tracking: -0.01 })
  write(out('level-1-horizontal.svg'), svg({ w: l.w, h: l.h, title: 'Harbor', body: l.body }))
}

// ── 3 · Characterful ──
// What saving feels like rather than what the app does: you fold the page into a
// paper boat and it carries the thing for you. Asymmetric sail, a rounded face,
// a brighter Signal. The sail stands 10 units clear of the hull so the one-colour
// version still reads as two pieces.
{
  const water = '#12324a', signal = '#ff5a2c'
  const hull = poly([[0, 132], [208, 132], [168, 192], [40, 192]])
  const sail = poly([[120, 16], [178, 122], [62, 122]])
  const fold = poly([[120, 16], [120, 122], [62, 122]]) // the folded half, a shade darker
  const mark = (h, s, f) => ({ body: `<path d="${hull}" fill="${h}"/><path d="${sail}" fill="${s}"/><path d="${fold}" fill="${f}"/>`, w: 208, h: 192 })
  write(out('level-3-mark.svg'), svg({ w: 208, h: 192, title: 'Harbor', body: mark(water, signal, '#d9461d').body }))
  const font = await loadFont('Fredoka', 600)
  const l = lockup({ mark: mark(water, signal, '#d9461d'), font, name: 'harbor', color: water, tracking: -0.01, capRatio: 0.5 })
  write(out('level-3-horizontal.svg'), svg({ w: l.w, h: l.h, title: 'Harbor', body: l.body }))
}

// ── 5 · Weird ──
// The wrong answer on purpose: the safest harbour is a whale. Everything you saved
// is in its belly, lit by the beacon, and the spout is a bookmark. Aubergine and
// acid green; the wordmark bobs on a swell, each letter off the baseline.
{
  const plum = '#3d1a5b', acid = '#c8f031'
  // Body: a pill 168 × 112 (radius 56). Porthole r 32 with a beacon r 18 inside; eye r 8.
  const body = rect(0, 84, 168, 112, 56) + circle(88, 144, 32) + circle(36, 120, 8)
  const beacon = circle(88, 144, 18)
  // Tail: a stalk rising from the back, ending in a V fluke.
  const tail = poly([[124, 100], [164, 56], [188, 76], [152, 128]]) + poly([[176, 66], [146, 14], [196, 42]]) + poly([[176, 66], [208, 22], [208, 78]])
  // Spout: a bookmark ribbon, 12 units above the head.
  const spout = poly([[40, 28], [64, 28], [64, 72], [52, 62], [40, 72]])
  const mark = (b, a) => ({ body: `<path d="${body}" fill="${b}" fill-rule="evenodd"/><path d="${tail}" fill="${b}"/><path d="${spout}" fill="${a}"/><path d="${beacon}" fill="${a}"/>`, w: 208, h: 208 })
  write(out('level-5-mark.svg'), svg({ w: 208, h: 208, title: 'Harbor', body: mark(plum, acid).body }))
  // Wordmark: Unbounded 800, letters riding a sine swell, alternate letters tilted ±6°.
  const font = await loadFont('Unbounded', 800)
  const size = 92
  const probe = text(font, 'harbor', { size, tracking: -0.02 })
  let x = 208 + 64, word = ''
  const base = 140 + probe.capHeight / 2
  ;[...'harbor'].forEach((ch, i) => {
    const t = text(font, ch, { size, x, y: base + round(Math.sin(i * 1.15) * 14) })
    const cx = x + t.width / 2
    word += `<path d="${t.d}" fill="${plum}" transform="rotate(${i % 2 ? 6 : -6} ${round(cx)} ${round(base)})"/>`
    x += t.width + -0.02 * size
  })
  const w = round(x + 8)
  write(out('level-5-horizontal.svg'), svg({ w, h: 208, title: 'Harbor', body: place(mark(plum, acid).body, 0, 0) + word }))
}
