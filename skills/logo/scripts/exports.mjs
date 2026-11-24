#!/usr/bin/env node
/**
 * Which parts of the kit export.mjs makes.
 *
 * The core is always made, because the kit isn't usable or lawful without it:
 * the logo files (svg/, png/, pdf/), check.png, README.md, LICENSE and
 * TRADEMARKS.md, and the zip. Everything else is a choice, all by default:
 *
 *   node exports.mjs            prints the menu to show the user
 *   node exports.mjs "icons, slides"   prints what that choice makes
 *
 * brand.json "exports": "all" (the default) or a list of ids, such as
 * ["icons", "guidelines", "palette"]. "templates" stands for all four
 * templates. export.mjs --exports icons,palette overrides it for one run.
 */
import { fileURLToPath } from 'node:url'

/** The optional exports, in the order the menu shows them. `paths` are what each writes into "out". */
export const EXPORTS = [
  { id: 'icons', label: 'Icons', what: 'favicons, app and PWA icons, site.webmanifest and head.html', paths: ['icons'] },
  { id: 'guidelines', label: 'Brand guidelines', what: 'printable US Letter PDF (plus HTML and a PNG per page)', paths: ['brand-guidelines.html', 'brand-guidelines.pdf', /^brand-guidelines-\d+\.png$/] },
  { id: 'palette', label: 'Website palette', what: 'OKLCH scales and light and dark roles as CSS, Tailwind v4 and design tokens, with a contrast report', paths: ['web'] },
  { id: 'social', label: 'Social images', what: 'a 1200 × 630 link preview and an 800 × 800 avatar', paths: ['social'] },
  { id: 'email', label: 'Email signature', what: 'HTML and text signature with a hosted-logo PNG', paths: ['templates/email'], template: true },
  { id: 'card', label: 'Business card', what: 'print PDF with bleed, front and back', paths: ['templates/business-card'], template: true },
  { id: 'slides', label: 'Slide template', what: 'an editable .pptx with a master per layout, plus PDF', paths: ['templates/slides'], template: true },
  { id: 'posts', label: 'Social post templates', what: 'square, portrait, story, Ko-fi cover and X header, each with a blank', paths: ['templates/social'], template: true },
]

export const CORE = 'Logo files (SVG, PNG and PDF, with dark and one-colour versions), check.png, README.md, LICENSE, TRADEMARKS.md and the zip'

const ALIASES = {
  'business-card': ['card'],
  cards: ['card'],
  signature: ['email'],
  slide: ['slides'],
  deck: ['slides'],
  pptx: ['slides'],
  web: ['palette'],
  colours: ['palette'],
  colors: ['palette'],
  favicons: ['icons'],
  guide: ['guidelines'],
  og: ['social'],
  templates: EXPORTS.filter((e) => e.template).map((e) => e.id),
}

/**
 * The set of optional export ids to make. `asked` (the --exports argument) wins
 * over brand.json's "exports"; neither means all. The older switches still
 * work when no list is given: "templates": false and "palette": false drop those.
 */
export function chosen(cfg = {}, asked) {
  const raw = asked ?? cfg.exports ?? 'all'
  const words = (Array.isArray(raw) ? raw : String(raw).split(/[\s,]+/)).map((w) => String(w).trim().toLowerCase()).filter(Boolean)
  const all = EXPORTS.map((e) => e.id)
  let want
  if (!words.length || words.includes('all')) {
    want = new Set(all)
    if (asked == null && cfg.exports == null) {
      if (cfg.templates === false) EXPORTS.filter((e) => e.template).forEach((e) => want.delete(e.id))
      if (cfg.palette === false) want.delete('palette')
    }
  } else if (words.length === 1 && ['none', 'core', 'logos'].includes(words[0])) {
    want = new Set()
  } else {
    want = new Set()
    const unknown = []
    for (const w of words) {
      const ids = all.includes(w) ? [w] : ALIASES[w]
      if (ids) ids.forEach((id) => want.add(id))
      else if (!['logos', 'logo', 'core', 'license', 'trademarks'].includes(w)) unknown.push(w)
    }
    if (unknown.length) throw new Error(`unknown export${unknown.length > 1 ? 's' : ''} ${unknown.map((u) => `"${u}"`).join(', ')}; choose from all, ${all.join(', ')} (or templates for all four templates)`)
  }
  return want
}

/** The menu, as the skill shows it to the user. */
export function menu() {
  return [
    'Which parts of the kit do you want? All of them unless you say otherwise.',
    '',
    ...EXPORTS.map((e, i) => `${i + 1}. ${e.label}: ${e.what}`),
    '',
    `Always included: ${CORE}.`,
  ].join('\n')
}

/** One line saying what a choice makes, for the export log. */
export function summary(want) {
  const on = EXPORTS.filter((e) => want.has(e.id)).map((e) => e.label.toLowerCase())
  return `exports: core${on.length ? ` + ${on.join(', ')}` : ' only'}`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv.slice(2).join(' ').trim()
  if (!arg) console.log(menu())
  else {
    try {
      // Accept the user's numbers from the menu too: "1, 3, 7".
      const words = arg.split(/[\s,]+/).filter(Boolean).map((w) => (/^\d+$/.test(w) && EXPORTS[w - 1] ? EXPORTS[w - 1].id : w))
      const want = chosen({}, words)
      console.log(summary(want))
      console.log(`brand.json: "exports": ${want.size === EXPORTS.length ? '"all"' : JSON.stringify([...want])}`)
    } catch (e) {
      console.error(e.message)
      process.exit(1)
    }
  }
}
