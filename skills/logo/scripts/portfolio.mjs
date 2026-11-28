#!/usr/bin/env node
/**
 * Portfolio art: the pictures a case-study page or Ko-fi shows for the project.
 *
 *   node portfolio.mjs brand.json        remake only portfolio/ (fast, while drawing the scene)
 *
 * Called by export.mjs when "portfolio" is in the exports. Writes <out>/portfolio/:
 *   cover.webp         2400 × 800 (shown 1200 × 400), the wide cover and Ko-fi cover, under ~250 KB
 *   cover-mobile.webp  1000 × 800 (shown 500 × 400), the same scene re-framed for phones, under ~150 KB
 *   icon.png           512 × 512, square corners, full bleed (the site rounds it and adds the shadow)
 *   alt.txt            one sentence describing the scene, for both covers
 *   preview.png        the three as a case-study page shows them, light and dark, plus the composition guides
 *
 * The covers are illustrations drawn for the project (see references/portfolio.md), named in
 * brand.json's "portfolio": { "cover": "portfolio/cover.svg", "mobile": "portfolio/cover-mobile.svg",
 * "icon": optional full-bleed square SVG, "alt": "…", "background": "#hex" }. Without a cover only
 * the icon is made, with a warning. The icon defaults to the app-icon art on its tile.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs'
import { join, resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { browser, viewBox } from './render.mjs'

/** Sizes in pixels, and how big each is shown (CSS px), from the portfolio site's spec. */
export const PORTFOLIO = {
  cover: { w: 2400, h: 800, shown: 1200, budget: 250_000, file: 'cover.webp' },
  mobile: { w: 1000, h: 800, shown: 500, budget: 150_000, file: 'cover-mobile.webp' },
  icon: { w: 512, h: 512, file: 'icon.png' },
  /** The outer band on each side that stays quiet, in CSS px as shown (the sheet rounds its top corners). */
  quiet: 40,
  /** The share of the width the subject sits in, centred. */
  subject: 0.6,
}

const dataUri = (svgText) => 'data:image/svg+xml;base64,' + Buffer.from(svgText).toString('base64')

/**
 * Draws one SVG to a canvas at w × h over `bg` (covers are never transparent) and encodes it
 * as WebP at the highest quality under `budget` bytes, or as PNG when `budget` is null.
 * Also measures how busy each side's quiet band is. Returns { bytes, quality, busy: {left, right}, alpha }.
 */
async function draw(b, svgText, { w, h, bg, budget, band = 0 }) {
  const page = await b.newPage({ viewport: { width: 64, height: 64 }, deviceScaleFactor: 1 })
  const r = await page.evaluate(
    async ({ src, w, h, bg, budget, band }) => {
      const img = new Image()
      img.src = src
      await img.decode()
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const g = c.getContext('2d')
      if (bg) {
        g.fillStyle = bg
        g.fillRect(0, 0, w, h)
      }
      g.drawImage(img, 0, 0, w, h)
      const px = g.getImageData(0, 0, w, h).data
      let alpha = false
      for (let i = 3; i < px.length; i += 4) if (px[i] < 255) { alpha = true; break }
      // A band is busy where many of its pixels differ clearly from their row's usual colour:
      // a horizon, a ground line, a faint texture or a soft shape is fine; a subject running
      // into the corner isn't.
      const busy = (x0) => {
        if (!band) return 0
        let n = 0, off = 0
        for (let y = 0; y < h; y += 2) {
          const row = []
          for (let x = x0; x < x0 + band; x += 2) {
            const i = (y * w + x) * 4
            row.push(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2])
          }
          const mid = [...row].sort((a, b) => a - b)[row.length >> 1]
          n += row.length
          off += row.filter((l) => Math.abs(l - mid) > 28).length
        }
        return off / n
      }
      const blob = (type, q) => new Promise((ok) => c.toBlob(ok, type, q))
      const bytes = async (bl) => Array.from(new Uint8Array(await bl.arrayBuffer()))
      if (!budget) return { data: await bytes(await blob('image/png')), quality: null, alpha, busy: { left: busy(0), right: busy(w - band) } }
      let q = 0.92, out
      for (;;) {
        out = await blob('image/webp', q)
        if (out.size <= budget || q <= 0.5) break
        q = Math.round((q - 0.04) * 100) / 100
      }
      return { data: await bytes(out), quality: q, alpha, busy: { left: busy(0), right: busy(w - band) } }
    },
    { src: dataUri(svgText), w, h, bg, budget, band }
  )
  await page.close()
  return { ...r, data: Buffer.from(r.data) }
}

/** A square SVG with the icon art centred on its tile, full bleed, square corners. */
function tiled(art, bg, k) {
  const vb = viewBox(art)
  const s = Math.max(vb.w, vb.h) / k
  const inner = art.replace(/<\?xml[^>]*>/, '').replace(/<svg\b/, `<svg x="${(s - vb.w) / 2}" y="${(s - vb.h) / 2}" width="${vb.w}" height="${vb.h}"`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}"><rect width="${s}" height="${s}" fill="${bg}"/>${inner}</svg>`
}

/**
 * Makes portfolio/. `iconSvg`, `tile` and `scale` are the app icon's art, tile colour and size,
 * as export.mjs works them out. Returns { written, warnings }.
 */
export async function portfolio({ b, cfg, base, out, iconSvg, tile, scale = 0.62, paper = '#ffffff', dark = '#111111' }) {
  const p = cfg.portfolio || {}
  const d = join(out, 'portfolio')
  mkdirSync(d, { recursive: true })
  const at = (f) => resolve(base, f)
  const written = [], warnings = []
  const warn = (m) => warnings.push(`portfolio: ${m}`)
  const bg = p.background || tile

  // ── Covers ──
  const made = {}
  for (const key of ['cover', 'mobile']) {
    const spec = PORTFOLIO[key]
    const file = join(d, spec.file)
    if (!p[key]) {
      if (existsSync(file)) rmSync(file)
      continue
    }
    if (!existsSync(at(p[key]))) {
      warn(`${p[key]} not found`)
      continue
    }
    const text = readFileSync(at(p[key]), 'utf8')
    const vb = viewBox(text)
    if (Math.abs(vb.w / vb.h - spec.w / spec.h) > 0.01) warn(`${p[key]} is ${vb.w} × ${vb.h}; draw it at ${spec.w / spec.h === 3 ? '3:1' : '5:4'} (viewBox 0 0 ${spec.w} ${spec.h}), it is stretched to fit`)
    if (/<text\b/.test(text)) warn(`${p[key]} has <text>: covers carry no words (the page sets the name under them)`)
    if (/<image\b/.test(text)) warn(`${p[key]} embeds a raster image: draw the scene as shapes`)
    const band = Math.round((PORTFOLIO.quiet * spec.w) / spec.shown)
    const r = await draw(b, text, { w: spec.w, h: spec.h, bg, budget: spec.budget, band })
    writeFileSync(file, r.data)
    written.push(file)
    made[key] = file
    if (r.data.length > spec.budget) warn(`${spec.file} is ${Math.round(r.data.length / 1000)} KB even at quality ${r.quality}: simplify the scene (fewer tiny details, flat fills) to get under ${spec.budget / 1000} KB`)
    for (const side of ['left', 'right']) {
      if (r.busy[side] > 0.1) warn(`${spec.file}: the ${side} ${PORTFOLIO.quiet} px edge is busy (${Math.round(r.busy[side] * 100)} % of it stands out); keep the subject in the middle ${PORTFOLIO.subject * 100} % and only ground or a faint texture at the edges`)
    }
  }
  if (!p.cover) warn('no cover drawn yet: draw the scene (references/portfolio.md) and set "portfolio": { "cover", "mobile", "alt" } in brand.json')
  else if (!p.mobile) warn('no mobile cover: re-frame the same scene at 1000 × 800 and set "portfolio.mobile"')

  // ── Icon: one bold shape that reads at 58 px; square corners, the site rounds them ──
  const iconText = p.icon ? readFileSync(at(p.icon), 'utf8') : tiled(iconSvg, tile, scale)
  if (p.icon) {
    const vb = viewBox(iconText)
    if (vb.w !== vb.h) warn(`${p.icon} isn't square (${vb.w} × ${vb.h})`)
    if (/<text\b/.test(iconText)) warn(`${p.icon} has <text>: the icon carries no words`)
  }
  const icon = await draw(b, iconText, { w: 512, h: 512, bg: p.icon ? bg : tile, budget: null })
  writeFileSync(join(d, PORTFOLIO.icon.file), icon.data)
  written.push(join(d, PORTFOLIO.icon.file))

  // ── Alt text ──
  const alt = String(p.alt || '').trim()
  const altFile = join(d, 'alt.txt')
  if (alt) {
    writeFileSync(altFile, alt + '\n')
    written.push(altFile)
    if ((alt.match(/[.!?](\s|$)/g) || []).length > 1) warn('the alt text is more than one sentence')
    if (cfg.name && alt.toLowerCase().includes(String(cfg.name).toLowerCase())) warn('the alt text names the project; describe the picture (the page already shows the name)')
  } else {
    if (existsSync(altFile)) rmSync(altFile)
    if (p.cover) warn('no alt text: add "portfolio.alt", one sentence saying what the scene shows')
  }

  // ── Preview: as the case-study sheet shows them, light and dark, plus the guides ──
  const rel = (f) => relative(d, f)
  const q = PORTFOLIO.quiet, s = PORTFOLIO.subject
  const guides = (w) => `<i class="q" style="left:0;width:${q}px"></i><i class="q" style="right:0;width:${q}px"></i><i class="sub" style="left:${(w * (1 - s)) / 2}px;width:${w * s}px"></i>`
  const sheet = (theme, page, text) => `<div class="theme" style="background:${page};color:${text}"><h2>${theme}</h2><div class="row">
${made.cover ? `<div><div class="sheet" style="width:1000px"><img src="${rel(made.cover)}" style="width:1000px;height:${1000 / 3}px"><div class="body" style="background:${page === '#ffffff' ? '#fff' : '#1c1c1e'}"><b>${esc(cfg.name)}</b><span></span><span></span></div></div></div>` : ''}
${made.mobile ? `<div><div class="sheet" style="width:390px"><img src="${rel(made.mobile)}" style="width:390px;height:312px"><div class="body" style="background:${page === '#ffffff' ? '#fff' : '#1c1c1e'}"><b>${esc(cfg.name)}</b><span></span></div></div></div>` : ''}
<div class="icons"><img class="ic" src="icon.png" style="width:100px;height:100px;border-radius:22px"><img class="ic" src="icon.png" style="width:58px;height:58px;border-radius:13px"></div>
</div></div>`
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;width:1800px;font:13px/1.4 system-ui,sans-serif;background:#888}
.theme{padding:28px 32px}h2{margin:0 0 14px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;opacity:.6}
.row{display:flex;gap:32px;align-items:flex-start}
.sheet{border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.18)}.sheet img{display:block}
.body{padding:16px 20px 20px;display:flex;flex-direction:column;gap:8px}.body b{font-size:20px}.body span{height:8px;border-radius:4px;background:currentColor;opacity:.15;width:70%}.body span+span{width:45%}
.icons{display:flex;flex-direction:column;gap:20px;align-items:center}.ic{display:block;box-shadow:0 2px 8px rgba(0,0,0,.25)}
.guides{padding:28px 32px;background:#f3f2ef;color:#333}.guides .row{flex-wrap:wrap}.g{margin:0}.f{position:relative}.f img{display:block}
.q{position:absolute;top:0;bottom:0;background:repeating-linear-gradient(45deg,rgba(230,40,40,.45) 0 6px,transparent 6px 12px)}
.sub{position:absolute;top:0;bottom:0;outline:2px dashed rgba(0,0,0,.6);outline-offset:-2px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.7)}
.g figcaption{margin-top:6px;font-size:12px;opacity:.7}
</style></head><body>
${sheet('Light page', '#ffffff', '#222')}
${sheet('Dark page', '#111113', '#eee')}
${made.cover || made.mobile ? `<div class="guides"><h2>Guides at real size: subject in the dashed middle ${s * 100} %, the hatched ${q} px edges quiet</h2><div class="row">
${made.cover ? `<figure class="g"><div class="f"><img src="${rel(made.cover)}" style="width:1200px;height:400px">${guides(1200)}</div><figcaption>Wide cover, 1200 × 400</figcaption></figure>` : ''}
${made.mobile ? `<figure class="g"><div class="f"><img src="${rel(made.mobile)}" style="width:500px;height:400px">${guides(500)}</div><figcaption>Phone cover, 500 × 400</figcaption></figure>` : ''}</div></div>` : ''}
</body></html>`
  const tmp = join(d, '.preview.html')
  writeFileSync(tmp, html)
  const page = await b.newPage({ viewport: { width: 1800, height: 100 }, deviceScaleFactor: 1 })
  await page.goto('file://' + tmp)
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())))
  await page.screenshot({ path: join(d, 'preview.png'), fullPage: true })
  await page.close()
  rmSync(tmp)
  written.push(join(d, 'preview.png'))
  return { written, warnings }
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

// CLI: remake only portfolio/ from brand.json, while drawing the scene.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cfgPath = process.argv.slice(2).find((a) => a.endsWith('.json'))
  if (!cfgPath) {
    console.error('usage: node portfolio.mjs brand.json')
    process.exit(1)
  }
  const base = dirname(resolve(cfgPath))
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'))
  const colors = cfg.colors || []
  const byRole = (role) => colors.find((c) => c.role === role)?.hex
  const icon = cfg.icon || {}
  const iconFile = icon.file || cfg.logos?.mark?.file
  if (!iconFile && !cfg.portfolio?.icon) {
    console.error('brand.json needs "logos.mark", "icon.file" or "portfolio.icon"')
    process.exit(1)
  }
  const b = await browser()
  const r = await portfolio({
    b,
    cfg,
    base,
    out: resolve(base, cfg.out || 'dist'),
    iconSvg: iconFile ? readFileSync(resolve(base, iconFile), 'utf8') : null,
    tile: icon.background || byRole('paper') || '#ffffff',
    scale: icon.scale ?? 0.62,
  })
  await b.close()
  for (const f of r.written) console.log(relative(process.cwd(), f))
  for (const w of r.warnings) console.warn(`warning: ${w}`)
}
