/**
 * The website colour palette: from the brand colours in brand.json to a full set
 * of UI colours for light and dark mode, checked for contrast. Called by
 * export.mjs; also runs alone:
 *
 *   node palette.mjs brand.json           prints the roles and the contrast report
 *
 * How it is built (see references/palette.md):
 *   - Every scale is made in OKLCH, so equal lightness steps look equal and hues
 *     at the same step pair up. Each scale has 12 steps, light and dark, and every
 *     step has one job (1–2 backgrounds, 3–5 fills, 6–8 borders, 9–10 solid,
 *     11–12 text), the convention Radix Colors made common.
 *   - Scales: brand (the primary colour), accent (when there is one), a neutral
 *     tinted toward the paper colour or the brand, and success, warning, danger
 *     and info, nudged a little toward the brand hue so they belong to it.
 *   - The exact brand colours are kept: the brand hex becomes step 9 when it sits
 *     in the solid range, and the `primary` role uses it whenever it reads.
 *   - Roles (bg, surface, text, primary, on-primary, border, …) point at steps,
 *     separately for light and dark. Text steps are pushed until they pass WCAG
 *     2.2 AA; every pair is also scored with APCA (the WCAG 3 draft method).
 *
 * brand.json "palette" (all optional; false skips it):
 *   { "brand": "#hex", "accent": "#hex" | false, "neutral": "#hex",
 *     "status": { "success": "#hex", "warning": "#hex", "danger": "#hex", "info": "#hex" },
 *     "harmonize": true }
 */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// ── Colour maths: sRGB ⇄ OKLab/OKLCH (Björn Ottosson), WCAG 2 and APCA ──────
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function hexToRgb(hex) {
  let h = String(hex).trim().replace('#', '')
  if (h.length === 3) h = [...h].map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`not a hex colour: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
}
export function rgbToHex(rgb) {
  return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('')
}
export function toOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  const H = C < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  return { l: L, c: C, h: H }
}
/** OKLCH → gamma-encoded sRGB channels (may fall outside 0–1). */
function oklchToRgb({ l: L, c: C, h: H }) {
  const a = C * Math.cos((H * Math.PI) / 180), b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(gam)
}
const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)
/** Into sRGB by lowering chroma only, so lightness and hue stay where they were put. */
export function fromOklch(o) {
  let rgb = oklchToRgb(o)
  if (inGamut(rgb)) return rgbToHex(rgb)
  let lo = 0, hi = o.c
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(oklchToRgb({ ...o, c: mid }))) lo = mid
    else hi = mid
  }
  return rgbToHex(oklchToRgb({ ...o, c: lo }))
}
export const oklchCss = (hex) => {
  const { l, c, h } = toOklch(hex)
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(4)} ${c < 1e-4 ? 0 : h.toFixed(2)})`
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
/** WCAG 2.x contrast ratio, 1–21. */
export function wcag(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
/** APCA-W3 0.0.98G lightness contrast Lc of text on a background (signed; use its size). */
export function apca(text, bg) {
  const Y = (hex) => {
    const [r, g, b] = hexToRgb(hex).map((v) => v ** 2.4)
    const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b
    return y < 0.022 ? y + (0.022 - y) ** 1.414 : y
  }
  const yt = Y(text), yb = Y(bg)
  if (Math.abs(yb - yt) < 0.0005) return 0
  if (yb > yt) {
    const s = (yb ** 0.56 - yt ** 0.57) * 1.14
    return s < 0.1 ? 0 : (s - 0.027) * 100
  }
  const s = (yb ** 0.65 - yt ** 0.62) * 1.14
  return s > -0.1 ? 0 : (s + 0.027) * 100
}

// ── Scales ───────────────────────────────────────────────────────────────────
// OKLCH lightness and share of the seed's chroma for each of the 12 steps.
const STEPS = {
  light: {
    l: [0.993, 0.982, 0.958, 0.932, 0.903, 0.868, 0.818, 0.75, 0.62, 0.575, 0.5, 0.27],
    c: [0.06, 0.12, 0.22, 0.32, 0.42, 0.52, 0.64, 0.8, 1, 1, 0.92, 0.5],
  },
  dark: {
    l: [0.17, 0.2, 0.245, 0.275, 0.31, 0.35, 0.405, 0.48, 0.68, 0.72, 0.82, 0.95],
    c: [0.12, 0.18, 0.3, 0.4, 0.48, 0.56, 0.66, 0.8, 1, 1, 0.85, 0.35],
  },
}
// Status hues and seed chroma when brand.json doesn't give a colour.
const STATUS = {
  success: { l: 0.6, c: 0.15, h: 150 },
  warning: { l: 0.79, c: 0.16, h: 75 },
  danger: { l: 0.58, c: 0.2, h: 27 },
  info: { l: 0.6, c: 0.14, h: 245 },
}

/** A 12-step scale for one scheme. `pin` keeps the seed's exact hex as step 9 when it fits there. */
function scale(seed, mode, { pin = true, chroma = seed.c, hue = seed.h, l9, top } = {}) {
  const S = STEPS[mode]
  const ls = [...S.l]
  if (l9 !== undefined) {
    // Yellows and other light seeds: move the solid steps to the seed's own lightness.
    ls[8] = l9
    ls[9] = mode === 'light' ? l9 - 0.04 : l9 + 0.04
  }
  const steps = ls.map((l, i) => fromOklch({ l, c: chroma * S.c[i], h: hue }))
  if (top) {
    // A given page colour becomes step 1; the next steps keep stepping away from it so the scale stays in order.
    steps[0] = top
    const t = toOklch(top), dir = mode === 'light' ? -1 : 1
    for (let i = 1; i < 6; i++) {
      const prev = toOklch(steps[i - 1]).l, l = toOklch(steps[i]).l
      if (dir * (l - prev) < 0.018) steps[i] = fromOklch({ l: prev + dir * 0.022, c: Math.max(chroma * S.c[i], t.c), h: t.c > 0.004 ? t.h : hue })
    }
  }
  const labelled = seed.hex && Math.max(wcag('#ffffff', seed.hex), wcag('#111111', seed.hex)) >= 4.6
  const exact = pin && labelled && seed.l >= (mode === 'light' ? 0.4 : 0.45) && seed.l <= 0.9
  if (exact) {
    steps[8] = seed.hex.toLowerCase()
    steps[9] = fromOklch({ l: seed.l + (mode === 'light' ? -0.04 : 0.04), c: seed.c, h: seed.h })
  } else if (mode === 'light' && l9 === undefined) {
    // A generated solid in light mode darkens until a white label passes 4.5:1.
    let l = ls[8]
    while (wcag('#ffffff', steps[8]) < 4.5 && l > 0.42) {
      l -= 0.01
      steps[8] = fromOklch({ l, c: chroma, h: hue })
    }
    steps[9] = fromOklch({ l: l - 0.04, c: chroma, h: hue })
  }
  // Steps 11 and 12 carry text: push them until they pass on steps 2 and 1.
  const bgs = steps.slice(0, 4)
  const dir = mode === 'light' ? -1 : 1
  for (const [i, min] of [[10, 4.5], [11, 7]]) {
    let l = toOklch(steps[i]).l
    while (Math.min(...bgs.map((b) => wcag(steps[i], b))) < min && l > 0.05 && l < 0.99) {
      l += dir * 0.01
      steps[i] = fromOklch({ l, c: chroma * S.c[i], h: hue })
    }
  }
  return steps
}

/** Rotate a status hue up to `max` degrees toward the brand hue (half the gap at most). */
function harmonize(h, toward, max = 12) {
  const d = ((toward - h + 540) % 360) - 180
  return (h + Math.sign(d) * Math.min(Math.abs(d) / 2, max) + 360) % 360
}

const seedOf = (hex) => ({ hex: hex.toLowerCase(), ...toOklch(hex) })
/** The text colour for a solid: white when it passes 4.5:1, else the dark neutral, darkened if it has to be. */
function onColor(bg, darkText) {
  if (wcag('#ffffff', bg) >= 4.5) return '#ffffff'
  const o = toOklch(darkText)
  let t = darkText
  for (let l = o.l; wcag(t, bg) < 4.5 && l > 0.02; l -= 0.02) t = fromOklch({ ...o, l })
  return wcag(t, bg) >= wcag('#ffffff', bg) ? t : '#ffffff'
}
/** Seeds lighter than a usual solid keep their lightness at step 9 (yellows, limes, pastels) and take dark labels. */
const lightSeed = (seed) => (seed.l > 0.72 && seed.l <= 0.9 ? seed.l : undefined)

/**
 * Builds the palette from brand.json. Returns
 *   { seeds, scales: { light: {name: [12 hex]}, dark: {…} }, roles: { light: {role: hex}, dark: {…} }, checks }
 * or null when there's no brand colour to start from.
 */
export function palette(cfg) {
  const p = cfg.palette === false ? null : cfg.palette || {}
  if (!p) return null
  const colors = cfg.colors || []
  const byRole = (r) => colors.find((c) => c.role === r)?.hex
  const brandHex = p.brand || byRole('primary') || byRole('brand') || colors[0]?.hex
  if (!brandHex) return null
  const brand = seedOf(brandHex)
  const accentHex = p.accent === false ? null : p.accent || byRole('accent')
  const accent = accentHex ? seedOf(accentHex) : null
  // The neutral leans toward the paper colour when it has one (a warm or cool white), else the brand hue.
  const paperHex = byRole('paper')
  const paper = paperHex ? seedOf(paperHex) : null
  const nSrc = p.neutral ? seedOf(p.neutral) : paper && paper.c > 0.004 ? paper : brand
  const neutral = { h: nSrc.h, c: Math.min(nSrc.c > 0.004 ? nSrc.c : 0, nSrc === brand ? 0.016 : 0.022) }
  const darkHex = byRole('dark')

  const seeds = { brand, ...(accent && { accent }), neutral }
  const statusSeeds = {}
  for (const [k, d] of Object.entries(STATUS)) {
    const given = p.status?.[k]
    if (given) statusSeeds[k] = seedOf(given)
    else {
      const h = p.harmonize === false || brand.c < 0.03 ? d.h : harmonize(d.h, brand.h)
      statusSeeds[k] = { ...d, h, hex: fromOklch({ ...d, h }) }
    }
  }

  const scales = {}, roles = {}
  for (const mode of ['light', 'dark']) {
    // Keep the brand's own paper and night as the page background when they're light or dark enough.
    const top = mode === 'light' ? (paper && paper.l >= 0.94 ? paper.hex : undefined) : darkHex && toOklch(darkHex).l <= 0.24 ? darkHex.toLowerCase() : undefined
    // A brand "dark" colour sets the dark neutral's tint too, so night and its panels match.
    const nd = mode === 'dark' && top ? { h: toOklch(top).h, c: Math.min(toOklch(top).c, 0.022) } : neutral
    const n = scale({ ...nd, l: 0.5 }, mode, { pin: false, chroma: nd.c * 2.2, top })
    // Keep the brand's own paper and night as the page background when they're light or dark enough.
    const s = { brand: scale(brand, mode, { l9: lightSeed(brand) }), ...(accent && { accent: scale(accent, mode, { l9: lightSeed(accent) }) }), neutral: n }
    for (const [k, seed] of Object.entries(statusSeeds)) {
      s[k] = scale(seed, mode, { pin: !!p.status?.[k], l9: lightSeed(seed) })
    }
    scales[mode] = s
    roles[mode] = rolesFor(s, mode, { brand, accent })
  }
  return { seeds: { ...seeds, ...statusSeeds }, scales, roles, checks: checks(roles) }
}

/** A step pushed away from the backgrounds until it passes 3:1 on all of them (WCAG 1.4.11, for input edges). */
function uiEdge(hex, bgs, mode) {
  const o = toOklch(hex)
  let l = o.l
  while (Math.min(...bgs.map((b) => wcag(hex, b))) < 3 && l > 0.05 && l < 0.99) {
    l += mode === 'light' ? -0.01 : 0.01
    hex = fromOklch({ ...o, l })
  }
  return hex
}

/** Semantic roles for one scheme, from its scales. */
function rolesFor(s, mode, { brand, accent }) {
  const n = s.neutral
  const ink = n[11]
  const r = {
    bg: n[0],
    surface: n[1],
    'surface-raised': mode === 'light' ? '#ffffff' : n[2],
    'surface-hover': n[3],
    'surface-active': n[4],
    'border-subtle': n[5],
    border: n[6],
    'border-strong': uiEdge(n[7], [n[0], n[1]], mode),
    text: ink,
    'text-muted': n[10],
  }
  const darkText = mode === 'light' ? ink : n[0]
  const solid = (name, seed) => {
    const sc = s[name]
    // The exact brand colour wins whenever its label can pass and it doesn't vanish into the page.
    const exact = seed && wcag(seed.hex, n[0]) >= 2 && Math.max(wcag('#ffffff', seed.hex), wcag(darkText, seed.hex)) >= 4.5
    const base = exact ? seed.hex : sc[8]
    const on = onColor(base, darkText)
    // Hover moves away from the label, so the label only gains contrast.
    const o = toOklch(base)
    r[name] = base
    let hover = fromOklch({ ...o, l: o.l + (on === '#ffffff' ? -0.05 : 0.05) })
    if (hover === base) hover = fromOklch({ ...o, l: o.l + (on === '#ffffff' ? 0.2 : -0.07) }) // already black or white
    r[`${name}-hover`] = hover
    r[`on-${name}`] = on
    r[`${name}-subtle`] = sc[2]
    r[`${name}-subtle-hover`] = sc[3]
    r[`${name}-border`] = sc[6]
    r[`${name}-text`] = sc[10]
  }
  solid('brand', brand)
  if (accent) solid('accent', accent)
  for (const k of Object.keys(STATUS)) solid(k, null)
  // A near-black or grey brand leaves links to the accent, when there is one, so they still look like links.
  const linky = brand.c < 0.03 && accent ? 'accent-text' : 'brand-text'
  r.link = r[linky]
  r.focus = r[linky]
  return r
}

/**
 * The pairs that have to read, with WCAG 2 ratio and APCA Lc. `min` is the WCAG
 * 2.2 AA bar (4.5 text, 3 for UI parts); `lc` the APCA level to aim for.
 */
export const PAIRS = [
  ['text', 'bg', 4.5, 75, 'Body text'],
  ['text', 'surface', 4.5, 75, 'Body text on a panel'],
  ['text-muted', 'bg', 4.5, 60, 'Secondary text'],
  ['text-muted', 'surface', 4.5, 60, 'Secondary text on a panel'],
  ['text-muted', 'surface-hover', 4.5, 60, 'Secondary text on a hovered row'],
  ['link', 'bg', 4.5, 60, 'Links'],
  ['on-brand', 'brand', 4.5, 60, 'Primary button label'],
  ['on-brand', 'brand-hover', 4.5, 60, 'Primary button label, hovered'],
  ['brand-text', 'brand-subtle', 4.5, 60, 'Brand text on a tint'],
  ['on-accent', 'accent', 4.5, 60, 'Accent button label'],
  ['accent-text', 'bg', 4.5, 60, 'Accent text'],
  ['border-strong', 'bg', 3, 30, 'Input borders'],
  ['focus', 'bg', 3, 30, 'Focus ring'],
  ...['success', 'warning', 'danger', 'info'].flatMap((k) => [
    [`${k}-text`, `${k}-subtle`, 4.5, 60, `${k[0].toUpperCase() + k.slice(1)} message`],
    [`on-${k}`, k, 4.5, 60, `${k[0].toUpperCase() + k.slice(1)} button label`],
  ]),
]
function checks(roles) {
  const out = []
  for (const mode of ['light', 'dark']) {
    const r = roles[mode]
    for (const [fg, bg, min, lc, label] of PAIRS) {
      if (!r[fg] || !r[bg]) continue
      const ratio = wcag(r[fg], r[bg])
      const L = Math.abs(apca(r[fg], r[bg]))
      out.push({ mode, fg, bg, label, ratio: +ratio.toFixed(2), lc: +L.toFixed(1), min, lcTarget: lc, pass: ratio >= min, apcaPass: L >= lc })
    }
  }
  return out
}

// ── Files ────────────────────────────────────────────────────────────────────
const SCALE_NOTE = '1–2 backgrounds · 3–5 component fills (rest, hover, pressed) · 6–8 borders · 9–10 solid fills (rest, hover) · 11 low-contrast text · 12 high-contrast text'

/** palette.css: scales and roles as custom properties, light by default, dark by media query or data-theme. */
export function css(pal, name = 'Brand') {
  const block = (mode) => {
    const lines = []
    for (const [k, steps] of Object.entries(pal.scales[mode])) steps.forEach((hex, i) => lines.push(`  --${k}-${i + 1}: ${oklchCss(hex)};`))
    lines.push('')
    for (const [k, hex] of Object.entries(pal.roles[mode])) lines.push(`  --${k}: ${oklchCss(hex)};`)
    return lines.join('\n')
  }
  return `/* ${name} website palette, made by brand-kit from brand.json.
 * Scales: ${SCALE_NOTE}.
 * Use the roles (--bg, --text, --brand, --on-brand, …) in components and the numbered steps only for one-offs.
 * Light is the default; dark follows the system, and data-theme="light" or "dark" on <html> forces either. */
:root {
  color-scheme: light;
${block('light')}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
${block('dark').replace(/^ {2}/gm, '    ')}
  }
}
:root[data-theme='dark'] {
  color-scheme: dark;
${block('dark')}
}
`
}

/** palette.tailwind.css: a Tailwind v4 theme that points at palette.css (bg-brand, text-muted, border-brand-7, …). */
export function tailwind(pal) {
  const lines = []
  for (const [k, steps] of Object.entries(pal.scales.light)) steps.forEach((_, i) => lines.push(`  --color-${k}-${i + 1}: var(--${k}-${i + 1});`))
  lines.push('')
  for (const k of Object.keys(pal.roles.light)) lines.push(`  --color-${k}: var(--${k});`)
  return `/* Tailwind v4: import after tailwindcss and palette.css, e.g.
 *   @import "tailwindcss";
 *   @import "./palette.css";
 *   @import "./palette.tailwind.css";
 * Utilities follow the page's light or dark scheme: bg-bg, bg-surface, text-text, text-text-muted,
 * bg-brand hover:bg-brand-hover text-on-brand, border-border, bg-danger-subtle text-danger-text, bg-brand-3 … */
@theme inline {
${lines.join('\n')}
}
`
}

/** tokens.json in the W3C Design Tokens format (2025.10): scales and roles per scheme. */
export function tokens(pal) {
  const color = (hex) => {
    const { l, c, h } = toOklch(hex)
    return { $type: 'color', $value: { colorSpace: 'oklch', components: [+l.toFixed(4), +c.toFixed(4), c < 1e-4 ? 0 : +h.toFixed(2)], hex } }
  }
  const t = { $description: `Made by brand-kit. Scale steps: ${SCALE_NOTE}.` }
  for (const mode of ['light', 'dark']) {
    t[mode] = { scale: {}, role: {} }
    for (const [k, steps] of Object.entries(pal.scales[mode])) t[mode].scale[k] = Object.fromEntries(steps.map((hex, i) => [i + 1, color(hex)]))
    for (const [k, hex] of Object.entries(pal.roles[mode])) t[mode].role[k] = color(hex)
  }
  return JSON.stringify(t, null, 2) + '\n'
}

const escH = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const LABELS = { brand: 'Brand', accent: 'Accent', neutral: 'Neutral', success: 'Success', warning: 'Warning', danger: 'Danger', info: 'Info' }

/**
 * The palette drawn as HTML: for each scheme, every scale as 12 chips and a
 * small sample UI painted only with the roles. Returns { css, html } scoped
 * under .pv, so it can sit inside the guidelines or its own page.
 */
export function preview(pal, { display = 'system-ui, sans-serif', body = 'system-ui, sans-serif', name = 'Brand' } = {}) {
  const vars = (mode) => Object.entries(pal.roles[mode]).map(([k, v]) => `--${k}:${v}`).join(';')
  const css = `
.pv{display:grid;grid-template-columns:1fr 1fr;gap:14px;font-family:${body}}
.pv-mode{background:var(--bg);color:var(--text);border-radius:12px;padding:14px;border:1px solid var(--border-subtle)}
.pv-light{${vars('light')}}.pv-dark{${vars('dark')}}
.pv-h{font:600 9px/1 ${body};letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin:0 0 8px}
.pv-scales{display:grid;grid-template-columns:auto repeat(12,1fr);gap:2px 2px;align-items:center;font-size:8px;color:var(--text-muted);margin-bottom:12px}
.pv-scales i{display:block;height:15px;border-radius:3px}.pv-scales b{font-weight:500;padding-right:6px}
.pv-scales .pv-n{text-align:center}
.pv-ui{background:var(--surface-raised);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px}
.pv-ui h4{font:700 14px/1.2 ${display};margin:0;color:var(--text)}
.pv-ui p{margin:0;font-size:10px;line-height:1.45;color:var(--text-muted)}.pv-ui a{color:var(--link);text-decoration:underline}
.pv-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.pv-btn{font:600 10px/1 ${body};padding:7px 11px;border-radius:7px;border:1px solid transparent}
.pv-primary{background:var(--brand);color:var(--on-brand)}.pv-accent{background:var(--accent);color:var(--on-accent)}
.pv-secondary{background:var(--surface-raised);color:var(--text);border-color:var(--border-strong)}
.pv-ghost{background:var(--brand-subtle);color:var(--brand-text)}
.pv-input{flex:1;min-width:90px;font-size:10px;padding:6px 8px;border-radius:7px;border:1px solid var(--border-strong);background:var(--bg);color:var(--text-muted)}
.pv-focus{outline:2px solid var(--focus);outline-offset:2px}
.pv-alerts{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.pv-alert{font-size:9.5px;padding:6px 8px;border-radius:7px;border:1px solid}
.pv-panel{background:var(--surface);border-radius:8px;padding:8px;font-size:10px}
`
  const mode = (m) => {
    const chips = Object.entries(pal.scales[m])
      .map(([k, steps]) => `<b>${LABELS[k] || k}</b>${steps.map((h) => `<i style="background:${h}" title="${h}"></i>`).join('')}`)
      .join('')
    const nums = `<span></span>${Array.from({ length: 12 }, (_, i) => `<span class="pv-n">${i + 1}</span>`).join('')}`
    const alert = (k, text) => `<div class="pv-alert" style="background:var(--${k}-subtle);border-color:var(--${k}-border);color:var(--${k}-text)">${text}</div>`
    return `<div class="pv-mode pv-${m}">
<p class="pv-h">${m === 'light' ? 'Light' : 'Dark'}</p>
<div class="pv-scales">${chips}${nums}</div>
<div class="pv-ui">
  <h4>${escH(name)} on the web</h4>
  <p>Body text sits on the page in the text colour; this line is the muted one. <a>Links</a> use the brand.</p>
  <div class="pv-row"><span class="pv-btn pv-primary">Primary</span>${pal.roles[m].accent ? '<span class="pv-btn pv-accent">Accent</span>' : ''}<span class="pv-btn pv-secondary">Secondary</span><span class="pv-btn pv-ghost">Subtle</span></div>
  <div class="pv-row"><span class="pv-input">Email address</span><span class="pv-input pv-focus">Focused field</span></div>
  <div class="pv-panel">A panel on the surface colour, for sidebars and grouped content.</div>
  <div class="pv-alerts">${alert('success', 'Saved.')}${alert('warning', 'Almost full.')}${alert('danger', 'Couldn’t send.')}${alert('info', 'New version.')}</div>
</div>
</div>`
  }
  return { css, html: `<div class="pv">${mode('light')}${mode('dark')}</div>` }
}

/** palette.html: the preview on its own, with every role's value and the contrast report. */
export function page(pal, fonts = {}) {
  const { css: pvCss, html } = preview(pal, fonts)
  const rows = Object.keys(pal.roles.light)
    .map((k) => `<tr><td><code>--${k}</code></td>${['light', 'dark'].map((m) => `<td><i style="background:${pal.roles[m][k]}"></i><code>${pal.roles[m][k]}</code></td>`).join('')}</tr>`)
    .join('')
  const checks = pal.checks
    .map((c) => `<tr class="${c.pass ? '' : 'fail'}"><td>${c.mode}</td><td>${escH(c.label)}</td><td><code>${c.fg}</code> on <code>${c.bg}</code></td><td>${c.ratio}:1 ${c.pass ? '✓' : '✕'} <small>(${c.min})</small></td><td>Lc ${c.lc} ${c.apcaPass ? '✓' : '·'} <small>(${c.lcTarget})</small></td></tr>`)
    .join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escH(fonts.name || 'Brand')} web palette</title>
${fonts.link || ''}<style>
*{box-sizing:border-box}body{margin:0;padding:28px;background:#f4f4f4;color:#1b1b1b;font:13px/1.5 ${fonts.body || 'system-ui, sans-serif'}}
main{max-width:1100px;margin:0 auto;display:flex;flex-direction:column;gap:22px}
h1{font:700 26px/1.2 ${fonts.display || 'system-ui, sans-serif'};margin:0}h2{font-size:15px;margin:0 0 8px}
p{margin:0;max-width:75ch}
table{border-collapse:collapse;width:100%;background:#fff;border-radius:10px;overflow:hidden;font-size:12px}
td{padding:5px 10px;border-bottom:1px solid #eee;vertical-align:middle}td i{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:-3px;margin-right:6px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}
tr.fail td{background:#fff0f0}small{color:#777}code{font:11.5px ui-monospace,Menlo,monospace}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media (max-width:800px){.cols,.pv{grid-template-columns:1fr !important}body{padding:16px}}
${pvCss}
.pv-scales i{height:22px}.pv-scales{font-size:10px}.pv-ui h4{font-size:18px}.pv-ui p,.pv-btn,.pv-input,.pv-panel{font-size:12.5px}.pv-alert{font-size:12px}
</style></head><body><main>
<h1>${escH(fonts.name || 'Brand')} web palette</h1>
<p>Made from the brand colours in <code>brand.json</code>. Use <code>palette.css</code> (or <code>palette.tailwind.css</code> on Tailwind v4, or <code>tokens.json</code> for Figma and Style Dictionary). Build components from the roles below, never from the numbered steps directly, and dark mode comes for free.</p>
${html}
<div class="cols">
<div><h2>Roles</h2><table><tr><td></td><td><b>Light</b></td><td><b>Dark</b></td></tr>${rows}</table></div>
<div><h2>Contrast</h2><p style="margin-bottom:8px">WCAG 2.2 AA is the bar (4.5:1 for text, 3:1 for UI edges). APCA Lc is the WCAG 3 draft score: aim for 75 for body text, 60 for other text, 45 for large or bold text, 30 for edges.</p><table>${checks}</table></div>
</div>
</main></body></html>
`
}

/** One-line summary of what failed, for the export log. */
export function report(pal) {
  const fails = pal.checks.filter((c) => !c.pass)
  return fails.length ? `palette: ${fails.map((f) => `${f.mode} ${f.fg} on ${f.bg} ${f.ratio}:1 (needs ${f.min})`).join('; ')}` : ''
}

// ── CLI ──────────────────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const file = process.argv[2]
  if (!file) {
    console.error('usage: node palette.mjs brand.json')
    process.exit(1)
  }
  const pal = palette(JSON.parse(readFileSync(file, 'utf8')))
  if (!pal) {
    console.error('brand.json has no colours (or "palette": false)')
    process.exit(1)
  }
  for (const mode of ['light', 'dark']) {
    console.log(`\n${mode}`)
    for (const [k, hex] of Object.entries(pal.roles[mode])) console.log(`  ${k.padEnd(22)} ${hex}  ${oklchCss(hex)}`)
  }
  console.log('\ncontrast (WCAG 2 ratio / APCA Lc)')
  for (const c of pal.checks) console.log(`  ${c.pass ? (c.apcaPass ? 'ok  ' : 'apca') : 'FAIL'} ${c.mode.padEnd(5)} ${c.label.padEnd(36)} ${String(c.ratio).padStart(5)}:1  Lc ${String(c.lc).padStart(5)}`)
}
