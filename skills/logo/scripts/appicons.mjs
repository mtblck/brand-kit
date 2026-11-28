/**
 * Native app icons for iOS and Android, from the same art and tile as the web icons.
 * Called by export.mjs when "icons" is in the exports. Writes into <out>/icons/:
 *
 *   ios/AppIcon.appiconset/   drop-in Xcode asset catalog: one 1024 icon per appearance
 *                             (any, dark, tinted) and Contents.json; Xcode 14+ makes every
 *                             other size from it
 *   ios/sizes/                every size older Xcode projects and other tools ask for, named
 *                             Icon-<points>@<scale>x.png (20 to 83.5 pt, plus the 1024 marketing icon)
 *   android/res/              mipmap-<density>/ic_launcher.png and ic_launcher_round.png (48 to 192),
 *                             ic_launcher_foreground.png and ic_launcher_monochrome.png
 *                             (adaptive layers, 108 to 432), mipmap-anydpi-v26/ic_launcher.xml and
 *                             ic_launcher_round.xml, and values/ic_launcher_background.xml;
 *                             copy res/ over app/src/main/res/
 *   android/play-store-512.png  the Play Store listing icon (square, opaque; Play rounds it)
 *
 * iOS icons are opaque squares with no alpha (the App Store refuses alpha); the system rounds them.
 * The dark and tinted iOS variants put the art on a clear ground, which iOS fills itself.
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { png, viewBox } from './render.mjs'

/** Every iOS icon slot: idiom, size in points, scales. */
const IOS = [
  ['iphone', 20, [2, 3]], ['iphone', 29, [2, 3]], ['iphone', 40, [2, 3]], ['iphone', 60, [2, 3]],
  ['ipad', 20, [1, 2]], ['ipad', 29, [1, 2]], ['ipad', 40, [1, 2]], ['ipad', 76, [1, 2]], ['ipad', 83.5, [2]],
]
/** Android launcher densities: legacy icon size, adaptive layer size (108 dp). */
const DENSITIES = { mdpi: [48, 108], hdpi: [72, 162], xhdpi: [96, 216], xxhdpi: [144, 324], xxxhdpi: [192, 432] }

/** The art in one colour, every pixel kept by its alpha (Android's themed icon layer). */
function silhouette(svgText, color = '#ffffff') {
  return svgText
    .replace(/\b(fill|stroke|stop-color)="(?!none|url)[^"]*"/g, `$1="${color}"`)
    .replace(/\b(fill|stroke|stop-color):\s*(?!none|url)[^;"}]+/g, `$1:${color}`)
    .replace(/<svg\b(?![^>]*\bfill=)/, `<svg fill="${color}"`)
}

/** The art in grey, its light and dark kept (the iOS tinted icon takes its tint from lightness). */
function greyed(svgText) {
  const vb = viewBox(svgText)
  const inner = svgText.replace(/<\?xml[^>]*>/, '').replace(/<svg\b/, `<svg x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}"`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}"><defs><filter id="grey" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/></filter></defs><g filter="url(#grey)">${inner}</g></svg>`
}

const fmt = (n) => String(n).replace(/\.0$/, '')

export async function appIcons({ b, out, iconSvg, tile, scale = 0.62, maskScale = 0.5, roundScale }) {
  const written = []
  const put = async (file, opts, svg = iconSvg) => written.push(await png(b, svg, file, opts))
  const text = (file, s) => {
    writeFileSync(file, s)
    written.push(file)
  }

  // ── iOS ──
  const ios = join(out, 'ios')
  rmSync(ios, { recursive: true, force: true })
  const set = join(ios, 'AppIcon.appiconset')
  mkdirSync(set, { recursive: true })
  await put(join(set, 'AppIcon-1024.png'), { width: 1024, height: 1024, bg: tile, scale })
  await put(join(set, 'AppIcon-1024-dark.png'), { width: 1024, height: 1024, scale })
  await put(join(set, 'AppIcon-1024-tinted.png'), { width: 1024, height: 1024, scale }, greyed(iconSvg))
  const universal = (filename, appearance) => ({
    filename,
    idiom: 'universal',
    platform: 'ios',
    size: '1024x1024',
    ...(appearance ? { appearances: [{ appearance: 'luminosity', value: appearance }] } : {}),
  })
  text(
    join(set, 'Contents.json'),
    JSON.stringify(
      {
        images: [universal('AppIcon-1024.png'), universal('AppIcon-1024-dark.png', 'dark'), universal('AppIcon-1024-tinted.png', 'tinted')],
        info: { author: 'xcode', version: 1 },
      },
      null,
      2
    ) + '\n'
  )
  const sizes = join(ios, 'sizes')
  mkdirSync(sizes, { recursive: true })
  const done = new Set()
  for (const [, pt, scales] of IOS) {
    for (const k of scales) {
      const name = `Icon-${fmt(pt)}@${k}x.png`
      if (done.has(name)) continue
      done.add(name)
      await put(join(sizes, name), { width: pt * k, height: pt * k, bg: tile, scale })
    }
  }
  await put(join(sizes, 'Icon-1024.png'), { width: 1024, height: 1024, bg: tile, scale })

  // ── Android ──
  const android = join(out, 'android')
  rmSync(android, { recursive: true, force: true })
  const res = join(android, 'res')
  for (const [density, [legacy, layer]] of Object.entries(DENSITIES)) {
    const d = join(res, `mipmap-${density}`)
    mkdirSync(d, { recursive: true })
    await put(join(d, 'ic_launcher.png'), { width: legacy, height: legacy, bg: tile, scale, radius: 0.2 })
    await put(join(d, 'ic_launcher_round.png'), { width: legacy, height: legacy, bg: tile, scale: roundScale ?? Math.min(scale, 0.58), radius: 0.5 })
    // Adaptive layers: 108 dp, the launcher masks it to a shape inside the middle 72 dp
    // and keeps the art safe inside the 66 dp circle.
    await put(join(d, 'ic_launcher_foreground.png'), { width: layer, height: layer, scale: maskScale })
    await put(join(d, 'ic_launcher_monochrome.png'), { width: layer, height: layer, scale: maskScale }, silhouette(iconSvg))
  }
  const anydpi = join(res, 'mipmap-anydpi-v26')
  mkdirSync(anydpi, { recursive: true })
  const adaptive = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
`
  text(join(anydpi, 'ic_launcher.xml'), adaptive)
  text(join(anydpi, 'ic_launcher_round.xml'), adaptive)
  const values = join(res, 'values')
  mkdirSync(values, { recursive: true })
  text(
    join(values, 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${tile}</color>
</resources>
`
  )
  await put(join(android, 'play-store-512.png'), { width: 512, height: 512, bg: tile, scale })
  return written
}
