// Logowright: the plugin's own logo (locked 2026-11-28, round 4 #2).
// A drafting compass seen from its top: the heavy arms and thin legs come down
// to two points and make a W, the hinge is its middle peak, and the north star
// stands in front of the join. Built on a 256 grid.
//
//   node draw.mjs                                   (writes the SVGs and brand.json)
//   node ../skills/logo/scripts/export.mjs brand.json
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
const KIT = '../skills/logo/scripts/'
const { loadFont, lockup, svg, write, circle, rect, path } = await import(KIT + 'brand.mjs')
const { union, subtract, dilate, bounds, bar } = await import(KIT + 'geometry.mjs')

const here = dirname(fileURLToPath(import.meta.url))
const out = (f) => join(here, f)

export const C = { navy: '#1b2438', gold: '#c99a3e', chart: '#f7f3ea', brass: '#ecdfc2', night: '#10141d' }

// The north star: four points with concave curved sides.
export const star = (cx, cy, R, k = R * 0.16) =>
  `M${cx} ${cy - R}Q${cx + k} ${cy - k} ${cx + R} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + R}Q${cx - k} ${cy + k} ${cx - R} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - R}Z`

const mx = ([x, y]) => [256 - x, y]

/**
 * The mark. arm: the heavy arms; leg: the thin legs, the hinge ring and the
 * handle (half the arm, the logo's one secondary weight); R: the star.
 */
export function compass({ arm = 20, leg = 10, foot = [100, 150], top = [46, 56], hinge = [128, 74], hr = 17, R = 40, sy = 160, gap = 6, handleTop = 26 } = {}) {
  const hole = circle(...hinge, hr - leg)
  const half = (m) => {
    const P = m ? mx : (p) => p
    const f = P(foot), t = P(top), L = Math.hypot(f[0] - t[0], f[1] - t[1])
    // the leg is fixed into the arm's foot, as a compass leg into its point
    const into = [f[0] - ((f[0] - t[0]) / L) * arm * 0.6, f[1] - ((f[1] - t[1]) / L) * arm * 0.6]
    const Lh = Math.hypot(into[0] - hinge[0], into[1] - hinge[1])
    const from = [hinge[0] + ((into[0] - hinge[0]) / Lh) * (hr - leg / 2), hinge[1] + ((into[1] - hinge[1]) / Lh) * (hr - leg / 2)]
    return union(bar(...t, ...f, arm), bar(...from, ...into, leg))
  }
  const ring = subtract(circle(...hinge, hr), hole)
  const handle = rect(hinge[0] - leg / 2, handleTop, leg, hinge[1] - handleTop, 0)
  const s = star(128, sy, R)
  // the hole is cut last, so nothing that meets the ring leaves an edge in it
  const body = subtract(union(half(false), half(true), ring, handle), dilate(s, gap), hole)
  return { compass: body, star: s }
}

const m = compass()
const B = bounds(union(m.compass, m.star)) // trim the viewBox to the art
const draw = (fg, gold = C.gold, mm = m, b = B) => `<g transform="translate(${-b.x} ${-b.y})">${path(mm.compass, fg)}${path(mm.star, gold)}</g>`
const markOf = (fg) => ({ body: draw(fg), w: B.w, h: B.h })

write(out('mark.svg'), svg({ w: B.w, h: B.h, title: 'Logowright', body: draw(C.navy) }))
write(out('mark-dark.svg'), svg({ w: B.w, h: B.h, title: 'Logowright', body: draw(C.chart) }))

// Favicon: heavier legs, ring and handle, so the W holds at 16 px; on a navy tile.
const fm = compass({ arm: 26, leg: 16, hr: 21, R: 44, sy: 162, gap: 7 })
const FB = bounds(union(fm.compass, fm.star))
const fs = 200 / Math.max(FB.w, FB.h)
write(out('favicon.svg'), svg({ w: 256, h: 256, title: 'Logowright', body: `<rect width="256" height="256" rx="56" fill="${C.navy}"/><g transform="translate(128 ${128 + 2}) scale(${fs.toFixed(4)}) translate(${-(FB.x + FB.w / 2)} ${-(FB.y + FB.h / 2)})">${path(fm.compass, C.chart)}${path(fm.star, C.gold)}</g>` }))

const font = await loadFont('Outfit', 600)
for (const [layout, file] of [['horizontal', 'logo-horizontal'], ['stacked', 'logo-stacked']]) {
  for (const [suffix, fg] of [['', C.navy], ['-dark', C.chart]]) {
    const l = lockup({ mark: markOf(fg), font, name: 'logowright', layout, color: fg, tracking: -0.02, ...(layout === 'horizontal' ? { capRatio: 0.4, gap: 0.24 } : { capRatio: 0.24, gap: 0.16 }) })
    write(out(`${file}${suffix}.svg`), svg({ w: l.w, h: l.h, title: 'Logowright', body: l.body }))
  }
}

write(
  out('brand.json'),
  JSON.stringify(
    {
      name: 'Logowright',
      shortName: 'Logowright',
      tagline: 'Logos drawn in SVG, and the whole kit around them.',
      about:
        'Logowright is a Claude Code plugin that designs a logo as clean SVG from a short brief, sets the name in real typefaces so you choose by eye, and exports the whole brand kit around it from one file.\n\nThe mark is a drafting compass seen from its top: its arms and legs come down to two points and make a W, with the north star in front, for drawing and finding your way with one instrument.',
      construction:
        'On a 256 grid: arms 20 wide and legs, hinge ring and handle 10 wide (the one secondary weight), the legs fixed into the arms\' feet; a four-point star of radius 40 on the centre line, set 6 clear of the compass.',
      website: 'mattblack.space/skills/logowright',
      colors: [
        { name: 'Midnight', hex: C.navy, role: 'primary', usage: 'The compass, the wordmark, headings and the brand field.' },
        { name: 'North Star', hex: C.gold, role: 'accent', usage: 'The star, and one highlight per layout; never body text.' },
        { name: 'Chart', hex: C.chart, role: 'paper', usage: 'Backgrounds, and the compass on Midnight.' },
        { name: 'Brass', hex: C.brass, role: 'support', usage: 'Panels, rules and quiet backgrounds.' },
        { name: 'Night', hex: C.night, role: 'dark', usage: 'The dark page.' },
      ],
      type: {
        display: { family: 'Outfit', weight: 600 },
        text: { family: 'Inter', weight: 400 },
      },
      logos: {
        mark: { file: 'mark.svg', dark: 'mark-dark.svg', minWidth: 20 },
        horizontal: { file: 'logo-horizontal.svg', dark: 'logo-horizontal-dark.svg', minWidth: 120 },
        stacked: { file: 'logo-stacked.svg', dark: 'logo-stacked-dark.svg', minWidth: 72 },
      },
      icon: { file: 'mark-dark.svg', background: C.navy, favicon: 'favicon.svg' },
      clearSpace: 0.25,
      exports: ['icons', 'guidelines', 'palette', 'social', 'portfolio'],
      direction: {
        words: ['crafted', 'precise', 'friendly'],
        pairs: { tone: 'between', era: 'classic', volume: 'quiet', finish: 'engineered' },
        references: { like: ['a generator mark Matt found: dividers in a ring with a four-point star'], avoid: [] },
        lives: 'web',
        weirdness: 2,
      },
      legal: { owner: 'mtblck', codeLicense: 'MIT', contact: 'https://github.com/mtblck/logowright/issues' },
      portfolio: {
        cover: 'portfolio/cover.svg',
        mobile: 'portfolio/cover-mobile.svg',
        alt: 'Seen from above on a navy chart, a brass drafting compass has its needle on a gold north star and its pencil leg partway round a gold circle, with the faint lines of a logo being drawn inside it.',
      },
      out: 'dist',
    },
    null,
    2,
  ) + '\n',
)
