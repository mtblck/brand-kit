// node --test skills/logo/scripts/legal.test.mjs
import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PROPRIETARY, codeLicense, legalFacts, trademarksText, writeLegal } from './legal.mjs'

const made = []
after(() => made.forEach((d) => rmSync(d, { recursive: true, force: true })))

const cfg = { name: 'Wren', contact: { email: 'hello@example.com' } }

/** A repo with brand/ and brand/dist/, and the files given at its root. */
function repo(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'legal-'))
  made.push(dir)
  mkdirSync(join(dir, '.git'))
  mkdirSync(join(dir, 'brand', 'dist'), { recursive: true })
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text)
  return { dir, base: join(dir, 'brand'), out: join(dir, 'brand', 'dist') }
}

const export_ = (r, c = cfg) => writeLegal({ cfg: c, base: r.base, out: r.out })
const read = (...p) => readFileSync(join(...p), 'utf8')

test('a repo with no LICENSE: the code is not called open source', () => {
  const r = repo({ 'README.md': 'See brand/.' })
  assert.equal(codeLicense(r.dir), PROPRIETARY)
  export_(r)
  for (const where of [r.out, r.base]) {
    const t = read(where, 'TRADEMARKS.md')
    assert.doesNotMatch(t, /is open source/)
    assert.match(t, /The code in this project is not open source, and the brand has its own license/)
  }
  assert.doesNotMatch(read(r.out, 'LICENSE'), /open-source/)
})

test('an MIT repo: the license is named', () => {
  const r = repo({ LICENSE: 'MIT License\n\nCopyright (c) 2026' })
  export_(r)
  assert.match(read(r.out, 'TRADEMARKS.md'), /open source under the MIT license; the brand is not/)
  assert.match(read(r.out, 'LICENSE'), /the MIT license that covers the code/)
})

test('a proprietary LICENSE, and package.json with UNLICENSED', () => {
  assert.equal(codeLicense(repo({ LICENSE: 'Copyright 2026 Acme. All rights reserved.' }).dir), PROPRIETARY)
  assert.equal(codeLicense(repo({ 'package.json': '{"license":"UNLICENSED"}' }).dir), PROPRIETARY)
  assert.equal(codeLicense(repo({ 'package.json': '{"license":"Apache-2.0"}' }).dir), 'Apache-2.0')
})

test('an unrecognised LICENSE or no repo: nothing is said about the code', () => {
  const unknown = codeLicense(repo({ LICENSE: 'Some license of our own.' }).dir)
  assert.equal(unknown, null)
  const t = trademarksText(legalFacts(cfg, unknown))
  assert.match(t, /\. The brand has its own license \(see \[LICENSE\]\(LICENSE\)\)\./)
  assert.doesNotMatch(t, /code in this project/)
  assert.equal(codeLicense(null), null)
})

test('legal.codeLicense "proprietary" or false wins over a detected license', () => {
  for (const codeLicense of ['proprietary', false]) {
    const f = legalFacts({ ...cfg, legal: { codeLicense } }, 'MIT')
    assert.equal(f.code, PROPRIETARY)
    assert.match(trademarksText(f), /is not open source/)
  }
  assert.equal(legalFacts({ ...cfg, legal: { codeLicense: 'GPL' } }, null).code, 'GPL')
})

test("an owner's brand/ files are what the export gets", () => {
  const r = repo({ LICENSE: 'MIT License' })
  export_(r)
  writeFileSync(join(r.base, 'TRADEMARKS.md'), '# Edited by the owner\n')
  writeFileSync(join(r.base, 'LICENSE'), 'Owner license\n')
  const { written } = export_(r)
  assert.equal(read(r.out, 'TRADEMARKS.md'), '# Edited by the owner\n')
  assert.equal(read(r.out, 'LICENSE'), 'Owner license\n')
  assert.ok(!written.includes(join(r.base, 'TRADEMARKS.md')))
})

test('an old brand/TRADEMARKS.md that wrongly says open source gets a warning', () => {
  const r = repo({ 'README.md': 'See brand/.' })
  writeFileSync(join(r.base, 'TRADEMARKS.md'), 'The code in this project is open source; the brand is not.\n')
  const { warnings } = export_(r)
  assert.ok(warnings.some((w) => /says the code is open source, but it is not/.test(w)))
})
