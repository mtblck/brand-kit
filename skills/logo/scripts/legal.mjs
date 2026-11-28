/**
 * The brand folder's own license and usage policy. Called by export.mjs.
 *
 *   LICENSE        all rights reserved: the name, logos and brand material are not
 *                  covered by the project's code license
 *   TRADEMARKS.md  what anyone may do with the name and logo without asking, and what not
 *
 * Both go into the export folder (so the zip carries them) and, when brand.json sits
 * in a folder named `brand` (or `<something>-brand`), at the top of that folder,
 * where they cover the source, the rounds and the export. At the top they are only
 * written when missing, and when they are there they are copied into the export
 * instead of being made again, so an owner's edits reach the export and the zip.
 *
 * The code's license decides one sentence: open source by name, "not open source"
 * for a repo with no license or a proprietary one, and nothing about the code when
 * it can't be told (no repo, or a license file this doesn't recognise).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

/** The nearest folder at or above `dir` named `brand` or `<name>-brand`, looking no higher than `stop`, or null. */
export function brandRoot(dir, stop) {
  for (let d = dir; ; d = dirname(d)) {
    if (/^(.+-)?brand$/i.test(basename(d))) return d
    if (d === stop || dirname(d) === d) return null
  }
}

/** The nearest folder above `dir` that holds `.git`, or null. */
export function repoRoot(dir) {
  for (let d = dir; ; d = dirname(d)) {
    if (existsSync(join(d, '.git'))) return d
    if (dirname(d) === d) return null
  }
}

/** What `codeLicense` and `legalFacts` give for code that isn't open source. */
export const PROPRIETARY = 'proprietary'

/** True for a `legal.codeLicense` that means the code isn't open source. */
export function saysProprietary(v) {
  return v === false || (typeof v === 'string' && /^(proprietary|closed|private|none|unlicensed|all rights reserved)$/i.test(v.trim()))
}

/**
 * The project's code license by name, read from the repo's LICENSE (or package.json's
 * "license"): an open-source license's name, `PROPRIETARY` when the repo has no license
 * or a proprietary one, or null when there is no repo or the license isn't recognised.
 */
export function codeLicense(repo) {
  if (!repo) return null
  for (const f of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'LICENCE.md', 'COPYING']) {
    let text
    try {
      text = readFileSync(join(repo, f), 'utf8').slice(0, 2000)
    } catch {
      continue
    }
    if (/MIT License|Permission is hereby granted, free of charge/i.test(text)) return 'MIT'
    if (/Apache License,?\s+Version 2\.0/i.test(text)) return 'Apache-2.0'
    if (/Mozilla Public License,? v(ersion)?\.? ?2\.0/i.test(text)) return 'MPL-2.0'
    if (/GNU AFFERO GENERAL PUBLIC LICENSE/i.test(text)) return 'AGPL'
    if (/GNU LESSER GENERAL PUBLIC LICENSE/i.test(text)) return 'LGPL'
    if (/GNU GENERAL PUBLIC LICENSE/i.test(text)) return 'GPL'
    if (/Redistribution and use in source and binary forms/i.test(text)) return 'BSD'
    if (/ISC License/i.test(text)) return 'ISC'
    if (/This is free and unencumbered software released into the public domain/i.test(text)) return 'Unlicense'
    if (/CC0 1\.0 Universal/i.test(text)) return 'CC0-1.0'
    if (/Eclipse Public License/i.test(text)) return 'EPL'
    if (/proprietary|confidential|all rights reserved/i.test(text)) return PROPRIETARY
    return null
  }
  let pkg
  try {
    pkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'))
  } catch {
    return PROPRIETARY
  }
  const lic = typeof pkg.license === 'object' ? pkg.license?.type : pkg.license
  const id = typeof lic === 'string' ? lic.trim() : ''
  if (!id || /^(UNLICENSED|SEE LICENSE IN\b)/i.test(id)) return PROPRIETARY
  return id
}

/** Who holds the rights, the year, how to ask, and the code license, from brand.json's "legal". */
export function legalFacts(cfg, detected) {
  const l = cfg.legal || {}
  const email = cfg.contact?.email
  const set = l.codeLicense
  return {
    name: cfg.name || 'This brand',
    owner: l.owner || cfg.name || 'the owner',
    year: l.year || new Date().getFullYear(),
    contact: l.contact || email || (cfg.website ? `https://${cfg.website}` : null),
    code: saysProprietary(set) ? PROPRIETARY : (typeof set === 'string' && set.trim()) || detected || null,
  }
}

/** True when `f.code` names an open-source license (not proprietary, not unknown). */
function openCode(f) {
  return !!f.code && f.code !== PROPRIETARY
}

/** The sentence in TRADEMARKS.md that says what covers the code and the brand. */
export function codeSentence(f) {
  if (f.code === PROPRIETARY) return 'The code in this project is not open source, and the brand has its own license (see [LICENSE](LICENSE)).'
  if (f.code === 'open-source') return 'The code in this project is open source; the brand is not (see [LICENSE](LICENSE)).'
  if (openCode(f)) return `The code in this project is open source under the ${f.code} license; the brand is not (see [LICENSE](LICENSE)).`
  return 'The brand has its own license (see [LICENSE](LICENSE)).'
}

export function licenseText(f) {
  const code = openCode(f) && f.code !== 'open-source' ? `the ${f.code} license that covers the code` : 'any license that covers the code'
  return [
    `${f.name} brand material`,
    `Copyright (c) ${f.year} ${f.owner}. All rights reserved.`,
    '',
    `This license covers the ${f.name} name as a brand, and every file in this folder: the logos and marks, their drafts and the scripts and source files that draw them, the icons, the brand guidelines, the colour palette, the templates and the social images, in every format. It also covers copies of them elsewhere in this project, such as logos and favicons in a website's public folder.`,
    '',
    `These files are not licensed under ${code} in this project, or under any other license in it. Nothing in that license grants any right to use the ${f.name} name, logos or other brand material.`,
    '',
    `You may keep and pass on these files unchanged as part of a copy or fork of this project, and use the name and logos as TRADEMARKS.md allows. Any other use, including modifying the files or using them in another project, needs written permission from ${f.owner}${f.contact ? ` (${f.contact})` : ''}.`,
    '',
    'The typefaces used in the logos are not included here and keep their own licenses. The wordmarks are drawn as outlines, so using the logo files needs no font.',
    '',
  ].join('\n')
}

export function trademarksText(f) {
  const n = f.name
  return [
    `# ${n} name and logo use`,
    '',
    `The ${n} name and logos identify ${n} and the people who make it. ${codeSentence(f)} This page says what you may do with the name and logos without asking.`,
    '',
    '## You may, without asking',
    '',
    `- Use the name to talk about ${n}: in an article, a review, a talk, a tutorial or a list of tools.`,
    `- Say in plain words that your project works with, is built on, or is a plugin or integration for ${n}, as long as it is clear that ${f.owner} did not make it.`,
    `- Use the unmodified logo to link to or point at ${n}, following the brand guidelines (clear space, colours, minimum size).`,
    `- Keep these files unchanged in a copy or fork of the project, as long as the fork does not present itself as ${n} (below).`,
    '',
    '## You may not',
    '',
    `- Release, host or sell a fork, product or service under the ${n} name or logo, or under a name or logo close enough to be mistaken for it. A fork that others use needs its own name and logo.`,
    '- Change the logos: redraw, stretch, recolour outside the guidelines, add to them, or combine them with your own marks.',
    `- Use the name or logos in a way that suggests ${f.owner} made, sponsors or endorses your work when they don't, or as your own app icon, avatar or domain name.`,
    '',
    '## Anything else',
    '',
    `Ask first${f.contact ? `: ${f.contact}` : ''}. Merchandise, events and anything not listed above need permission.`,
    '',
  ].join('\n')
}

/**
 * Writes LICENSE and TRADEMARKS.md. Returns { written, root, repo, warnings }.
 * `base` is brand.json's folder, `out` the export folder. When the brand folder's
 * top already has them, those are what the export gets.
 */
export function writeLegal({ cfg, base, out }) {
  const repo = repoRoot(base)
  const root = brandRoot(base, repo)
  const f = legalFacts(cfg, codeLicense(repo))
  const files = [['LICENSE', licenseText(f)], ['TRADEMARKS.md', trademarksText(f)]]
  const written = []
  const warnings = []
  const top = root && root !== out
  for (const [name, made] of files) {
    const own = top ? join(root, name) : null
    let text = made
    if (own && existsSync(own)) {
      text = readFileSync(own, 'utf8')
    } else if (own) {
      writeFileSync(own, made)
      written.push(own)
    }
    writeFileSync(join(out, name), text)
    written.push(join(out, name))
  }
  if (!root) {
    warnings.push('brand.json is not inside a brand/ folder. Keep the brand work (draw script, brand.json, rounds, export) in brand/ so its LICENSE covers all of it.')
  } else if (top && !openCode(f)) {
    const own = join(root, 'TRADEMARKS.md')
    if (/code in this project is open source/i.test(readFileSync(own, 'utf8'))) {
      warnings.push(`${basename(root)}/TRADEMARKS.md says the code is open source, but ${f.code === PROPRIETARY ? 'it is not' : 'no open-source license was found'}. Correct that sentence (or set legal.codeLicense in brand.json, delete the file and export again); the export copies it as it is.`)
    }
  }
  if (repo && root) {
    const readme = ['README.md', 'readme.md', 'README'].map((n) => join(repo, n)).find((p) => existsSync(p))
    const folder = basename(root)
    if (readme && !readFileSync(readme, 'utf8').includes(`${folder}/`)) {
      warnings.push(`${basename(readme)} at the repo root doesn't mention ${folder}/. Add a line under its license saying the name, logos and ${folder}/ are not covered by the code license (see "Where the work lives" in the logo skill).`)
    }
  }
  return { written, root, repo, warnings }
}
