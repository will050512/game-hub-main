import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const srcDir = join(root, 'src')

function isEmojiCp(cp) {
  return (
    (cp >= 0x1f000 && cp <= 0x1faff) ||
    (cp >= 0x2600 && cp <= 0x27bf) ||
    (cp >= 0x2300 && cp <= 0x23ff) ||
    cp === 0x00d7 || // ×
    cp === 0x2728
  )
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, out)
    else if (/\.(vue|ts|tsx|js|mjs)$/i.test(name)) out.push(p)
  }
  return out
}

const files = walk(srcDir)
const perFile = []
const emojiSet = new Map() // emoji -> count

for (const f of files) {
  const text = readFileSync(f, 'utf8')
  let count = 0
  for (const ch of text) {
    const cp = ch.codePointAt(0)
    if (isEmojiCp(cp)) {
      count++
      emojiSet.set(ch, (emojiSet.get(ch) || 0) + 1)
    }
  }
  if (count > 0) perFile.push({ count, path: relative(root, f) })
}

perFile.sort((a, b) => b.count - a.count)
console.log('=== PER FILE ===')
for (const r of perFile) console.log(String(r.count).padStart(4), r.path)

console.log('\n=== UNIQUE EMOJI ===')
const sorted = [...emojiSet.entries()].sort((a, b) => b[1] - a[1])
for (const [ch, n] of sorted) {
  const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')
  console.log(`${String(n).padStart(4)}  U+${cp}  ${ch}`)
}

console.log('\nTotal files with emoji:', perFile.length)
console.log('Total unique emoji:', emojiSet.size)
console.log('Total emoji occurrences:', perFile.reduce((s, r) => s + r.count, 0))
