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
// Two things mashed into one: a whale cut in half and stood up as a pair of
// bookends, holding a bookmark between them. Everything you saved, kept on the
// shelf by a whale. Both halves are flat-bottomed so they stand; the bookmark rises
// above them, 8 units clear of each cut face. The wordmark splits the same way.
{
  const plum = '#3d1a5b', acid = '#c8f031'
  const G = 56 // how far apart the halves stand
  const head = smooth([[10, 150], [18, 110, 'corner'], [60, 98], [104, 98, 'corner'], [104, 200, 'corner'], [36, 200], [14, 182]])
  const eye = circle(44, 132, 9)
  const tail = smooth([
    [104, 98, 'corner'], [148, 104], [184, 100], [200, 84],
    [176, 52, 'corner'], [212, 76, 'corner'], [248, 44, 'corner'],
    [232, 108], [216, 156], [196, 200, 'corner'], [104, 200, 'corner'],
  ].map(([x, y, c]) => [x + G, y, c]))
  const bookmark = poly([[112, 16], [152, 16], [152, 200], [132, 184], [112, 200]])
  // Trim to the art: x 10–304, y 16–200.
  const mark = (b, a) => ({ body: `<g transform="translate(-10 -16)"><path d="${head}${eye}" fill="${b}" fill-rule="evenodd"/><path d="${tail}" fill="${b}"/><path d="${bookmark}" fill="${a}"/></g>`, w: 294, h: 184 })
  write(out('level-5-mark.svg'), svg({ w: 294, h: 184, title: 'Harbor', body: mark(plum, acid).body }))
  // Wordmark: Unbounded 800, "har" and "bor" held apart by a bookmark that stands
  // on the baseline and rises above the x-height, as in the mark.
  const font = await loadFont('Unbounded', 800)
  const size = 96
  const probe = text(font, 'harbor', { size })
  const base = 184 / 2 + probe.capHeight / 2
  const gap = round(probe.capHeight * 0.14), bw = round(probe.capHeight * 0.44), bh = round(probe.capHeight * 1.5)
  const a = text(font, 'har', { size, x: 294 + 64, y: base })
  const bx = a.x + a.width + gap
  const mini = poly([[bx, base - bh], [bx + bw, base - bh], [bx + bw, base], [bx + bw / 2, base - bw * 0.45], [bx, base]])
  const b = text(font, 'bor', { size, x: bx + bw + gap, y: base })
  write(out('level-5-horizontal.svg'), svg({ w: round(b.x + b.width + 4), h: 184, title: 'Harbor', body: mark(plum, acid).body + `<path d="${a.d}${b.d}" fill="${plum}"/><path d="${mini}" fill="${acid}"/>` }))
}
