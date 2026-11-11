// Harbor at weirdness 1, 3, 4 and 5 (see references/direction.md).
// Same brief as ../draw.mjs (a read-it-later app: "everything you saved, safe in
// one place"), drawn again with the dial at 1, 3, 4 and 5. Harbor itself is the 2.
//
//   node draw.mjs     (writes level-N-mark.svg and level-N-horizontal.svg next to this file)
//
// Every level passes the same checklist: 16 px, one colour, the dark tab.
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadFont, lockup, text, rect, poly, circle, smooth, limb, place, svg, write, round } from '../../../scripts/brand.mjs'

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

// ── 4 · Odd ──
// A lateral metaphor, and a character: a crab that won't let go of what you saved.
// Seen head on, so its tells are all there: two big pincers raised, a wide shell,
// three legs a side, eyes on stalks. It holds a bookmark up between its claws,
// clear of them so the one-colour version still reads. Rust and lilac, and a mono
// face with two weights in one word.
{
  const rust = '#a8401c', lilac = '#b9a6ff'
  const W = 18 // one weight for every leg and arm
  const shell = smooth([[128, 120], [184, 128], [212, 160], [184, 196], [128, 204], [72, 196], [44, 160], [72, 128]])
  // A pincer: a rounded palm and two fingers making a V; s = 1 opens toward the right.
  const claw = (cx, s) => smooth([
    [cx, 100], [cx - 20 * s, 86], [cx - 26 * s, 54],
    [cx - 16 * s, 24, 'corner'], [cx - 2 * s, 50, 'corner'], [cx + 12 * s, 26, 'corner'],
    [cx + 20 * s, 58], [cx + 16 * s, 88],
  ])
  const claws = claw(70, 1) + claw(186, -1)
  const arms = limb(86, 136, 70, 92, W) + limb(170, 136, 186, 92, W)
  const legs = [[64, 160, 22, 172], [70, 178, 30, 202], [86, 192, 58, 226]]
    .map(([x1, y1, x2, y2]) => limb(x1, y1, x2, y2, W) + limb(256 - x1, y1, 256 - x2, y2, W)).join('')
  const eyes = limb(112, 124, 108, 104, 12) + limb(144, 124, 148, 104, 12) + circle(108, 100, 11) + circle(148, 100, 11)
  // The bookmark: 60 × 72, 9 units above the eyes and 12 inside each claw.
  const bookmark = poly([[98, 8], [158, 8], [158, 80], [128, 64], [98, 80]])
  // Trim to the art: x 13–243, y 8–235.
  const mark = (b, a) => ({ body: `<g transform="translate(-13 -8)">${[shell, claws, arms, legs, eyes].map((d) => `<path d="${d}" fill="${b}"/>`).join('')}<path d="${bookmark}" fill="${a}"/></g>`, w: 230, h: 227 })
  write(out('level-4-mark.svg'), svg({ w: 230, h: 227, title: 'Harbor', body: mark(rust, lilac).body }))
  // Wordmark: Space Mono, "har" in 700 and "bor" in 400, on one baseline.
  const bold = await loadFont('Space Mono', 700), reg = await loadFont('Space Mono', 400)
  const size = 104
  const cap = text(bold, 'H', { size }).capHeight
  const base = 227 / 2 + cap / 2
  const a = text(bold, 'har', { size, x: 230 + 72, y: base })
  const b = text(reg, 'bor', { size, x: a.x + a.width, y: base })
  const w = round(b.x + b.width + 4)
  write(out('level-4-horizontal.svg'), svg({ w, h: 227, title: 'Harbor', body: mark(rust, lilac).body + `<path d="${a.d}${b.d}" fill="${rust}"/>` }))
}

// ── 5 · Weird ──
// The wrong answer on purpose: the safest harbour is a whale. Everything you saved
// is in its belly, lit by the beacon, and its spout is a bookmark. The whale is one
// smooth outline (blunt head, back, a tail stalk rising into two flukes), so nothing
// floats. Aubergine and acid green; the wordmark bobs on a swell.
{
  const plum = '#3d1a5b', acid = '#c8f031'
  const outline = smooth([
    [10, 150], [18, 110, 'corner'], [60, 98], [116, 100], [156, 112], // snout, forehead, back
    [184, 112], [200, 92],                                            // the stalk rising
    [176, 52, 'corner'], [212, 76, 'corner'], [248, 44, 'corner'],    // flukes and notch
    [232, 108], [208, 152], [164, 188], [100, 200], [40, 194], [14, 182], // back of stalk, belly, jaw
  ])
  // Porthole r 26 with the beacon r 15 inside it; eye r 9. Holes by evenodd.
  const holes = circle(110, 152, 26) + circle(40, 132, 9)
  const beacon = circle(110, 152, 15)
  // Spout: a bookmark 52 × 70, its notch 12 units above the head.
  const spout = poly([[40, 16], [92, 16], [92, 86], [66, 70], [40, 86]])
  // Trim to the art: x 8–248, y 16–200.
  const mark = (b, a) => ({ body: `<g transform="translate(-8 -16)"><path d="${outline}${holes}" fill="${b}" fill-rule="evenodd"/><path d="${beacon}" fill="${a}"/><path d="${spout}" fill="${a}"/></g>`, w: 240, h: 184 })
  write(out('level-5-mark.svg'), svg({ w: 240, h: 184, title: 'Harbor', body: mark(plum, acid).body }))
  // Wordmark: Unbounded 800, letters riding a sine swell, alternate letters tilted ±6°.
  const font = await loadFont('Unbounded', 800)
  const size = 92
  const cap = text(font, 'h', { size }).capHeight
  let x = 240 + 64, word = ''
  const base = 120 + cap / 2
  ;[...'harbor'].forEach((ch, i) => {
    const t = text(font, ch, { size, x, y: base + round(Math.sin(i * 1.15) * 14) })
    word += `<path d="${t.d}" fill="${plum}" transform="rotate(${i % 2 ? 6 : -6} ${round(x + t.width / 2)} ${round(base)})"/>`
    x += t.width - 0.02 * size
  })
  write(out('level-5-horizontal.svg'), svg({ w: round(x + 8), h: 200, title: 'Harbor', body: mark(plum, acid).body + word }))
}
