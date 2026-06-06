#!/usr/bin/env node
// Validate shared/safety-rules.json with JS RegExp (the twin of check_safety.py).
// Compiles every pattern and checks classifications match. Run: node shared/tests/check_safety.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const rules = JSON.parse(readFileSync(join(here, '..', 'safety-rules.json'), 'utf8'))
const cases = JSON.parse(readFileSync(join(here, 'safety-cases.json'), 'utf8'))

const deny = rules.deny.map((r) => [r.id, new RegExp(r.pattern, 'i')])
const allow = rules.readonly_allow.map((r) => [r.id, new RegExp(r.pattern, 'i')])

function classify(cmd) {
  for (const [id, rx] of deny) if (rx.test(cmd)) return ['blocked', id]
  for (const [id, rx] of allow) if (rx.test(cmd)) return ['low_risk', id]
  return ['needs_review', null]
}

let fail = 0
for (const c of cases) {
  const [got, id] = classify(c.command)
  const ok = got === c.expect
  if (!ok) fail++
  const tag = id ? `  [${id}]` : ''
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${got.padEnd(13)} (exp ${c.expect.padEnd(13)}) ${c.command}${tag}`)
}
console.log(`\n${cases.length - fail}/${cases.length} passed (node RegExp)`)
process.exit(fail ? 1 : 0)
