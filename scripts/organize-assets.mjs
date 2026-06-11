#!/usr/bin/env node
/**
 * organize-assets.mjs
 *
 * Scan all Kenney asset packs under \u6750\u6599/ and copy files into public/assets/
 * with a clean, game-friendly directory structure.
 *
 * Usage:
 *   node scripts/organize-assets.mjs [--dry-run] [--source <path>] [--dest <path>]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/* ───────────── helpers ───────────── */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

function argValue(flag, defaultVal) {
  const idx = process.argv.indexOf(flag)
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1]
  return defaultVal
}

const dryRun = process.argv.includes('--dry-run')
const sourceRoot = argValue('--source', path.join(projectRoot, '\u7d20\u6750'))
const destRoot = argValue('--dest', path.join(projectRoot, 'public', 'assets'))

let totalFiles = 0
let copiedFiles = 0
let skippedFiles = 0

function log(msg) {
  console.log(msg)
}

function logDry(msg) {
  console.log(`[DRY-RUN] ${msg}`)
}

function ensureDir(dirPath) {
  if (dryRun) return
  fs.mkdirSync(dirPath, { recursive: true })
}

function copyFile(src, dest) {
  totalFiles++
  if (dryRun) {
    logDry(`${src.replace(projectRoot, '.')} -> ${dest.replace(projectRoot, '.')}`)
    copiedFiles++
    return
  }
  ensureDir(path.dirname(dest))
  try {
    fs.copyFileSync(src, dest)
    copiedFiles++
  } catch (err) {
    console.error(`[SKIP] ${src} -> ${dest}: ${err.message}`)
    skippedFiles++
  }
}

function copyDirRecursive(srcDir, destDir, filterFn) {
  if (!fs.existsSync(srcDir)) return
  const entries = fs.readdirSync(srcDir, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath, filterFn)
    } else if (filterFn(entry.name)) {
      copyFile(srcPath, destPath)
    }
  }
}

function copyAllFiles(srcDir, destDir, extensions) {
  const filterFn = (name) => extensions.some((ext) => name.endsWith(ext))
  copyDirRecursive(srcDir, destDir, filterFn)
}

/* ───────────── pack definitions ───────────── */

/**
 * Each pack defines how its source files map to the destination layout.
 */

const packs = [
  /* ═══════ AUDIO PACKS ═══════ */
  {
    name: 'kenney_casino-audio',
    src: 'Audio',
    dst: 'audio/casino',
    extensions: ['.ogg'],
  },
  {
    name: 'kenney_digital-audio',
    src: 'Audio',
    dst: 'audio/digital',
    extensions: ['.ogg'],
  },
  {
    name: 'kenney_impact-sounds',
    src: 'Audio',
    dst: 'audio/impact',
    extensions: ['.ogg'],
  },
  {
    name: 'kenney_music-jingles',
    src: 'Audio',
    dst: 'audio/music',
    extensions: ['.ogg'],
  },
  {
    name: 'kenney_rpg-audio',
    src: 'Audio',
    dst: 'audio/rpg',
    extensions: ['.ogg'],
  },
  {
    name: 'kenney_sci-fi-sounds',
    src: 'Audio',
    dst: 'audio/scifi',
    extensions: ['.ogg'],
  },
  {
    name: 'kenney_ui-audio',
    src: 'Audio',
    dst: 'audio/ui',
    extensions: ['.ogg'],
  },

  /* ═══════ SPRITE / PNG PACKS ═══════ */
  {
    name: 'kenney_game-icons',
    src: 'PNG',
    dst: 'sprites/ui-icons',
    extensions: ['.png'],
  },
  {
    name: 'kenney_ui-pack',
    src: 'PNG',
    dst: 'sprites/ui-pack',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-platformer',
    src: 'Tiles',
    dst: 'sprites/platformer',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-platformer',
    src: 'Tilemap',
    dst: 'sprites/platformer/tilemap',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-platformer-blocks',
    src: 'Tiles',
    dst: 'sprites/platformer-blocks',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-platformer-blocks',
    src: 'Tilemap',
    dst: 'sprites/platformer-blocks/tilemap',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-platformer-food-expansion',
    src: 'Tiles',
    dst: 'sprites/platformer-food',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-platformer-food-expansion',
    src: 'Tilemap',
    dst: 'sprites/platformer-food/tilemap',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-shmup',
    src: 'Tiles',
    dst: 'sprites/shmup',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-shmup',
    src: 'Ships',
    dst: 'sprites/shmup/ships',
    extensions: ['.png'],
  },
  {
    name: 'kenney_pixel-shmup',
    src: 'Tilemap',
    dst: 'sprites/shmup/tilemap',
    extensions: ['.png'],
  },
  {
    name: 'kenney_tiny-dungeon',
    src: 'Tiles',
    dst: 'sprites/dungeon',
    extensions: ['.png'],
  },
  {
    name: 'kenney_tiny-dungeon',
    src: 'Tilemap',
    dst: 'sprites/dungeon/tilemap',
    extensions: ['.png'],
  },
  {
    name: 'kenney_monochrome-rpg',
    src: 'Default',
    dst: 'sprites/rpg-monochrome/default',
    extensions: ['.png'],
  },
  {
    name: 'kenney_monochrome-rpg',
    src: 'Dot Matrix',
    dst: 'sprites/rpg-monochrome/dot-matrix',
    extensions: ['.png'],
  },
  {
    name: 'kenney_monochrome-rpg',
    src: 'Monochrome',
    dst: 'sprites/rpg-monochrome/monochrome',
    extensions: ['.png'],
  },
  {
    name: 'kenney_particle-pack',
    src: 'PNG (Transparent)',
    dst: 'sprites/particles/transparent',
    extensions: ['.png'],
  },
  {
    name: 'kenney_particle-pack',
    src: 'PNG (Black background)',
    dst: 'sprites/particles/black-bg',
    extensions: ['.png'],
  },

  /* ═══════ FONT PACKS ═══════ */
  {
    name: 'kenney_kenney-fonts',
    src: 'Fonts',
    dst: 'fonts',
    extensions: ['.ttf', '.otf'],
  },
  {
    name: 'kenney_ui-pack',
    src: 'Font',
    dst: 'fonts',
    extensions: ['.ttf', '.otf'],
  },

  /* ═══════ ATLAS / SPRITESHEET ═══════ */
  {
    name: 'kenney_game-icons',
    src: 'Spritesheet',
    dst: 'atlas/game-icons',
    extensions: ['.png', '.xml', '.json'],
  },
]

/* ───────────── main ───────────── */

function main() {
  log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2555')
  log('\u2551  Kenney Asset Organizer                                       \u2551')
  log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n')

  log(`Source: ${sourceRoot}`)
  log(`Destination: ${destRoot}`)
  log(`Mode: ${dryRun ? 'DRY RUN (no files will be copied)' : 'LIVE'}`)
  log('')

  if (!fs.existsSync(sourceRoot)) {
    console.error(`[ERROR] Source directory not found: ${sourceRoot}`)
    process.exit(1)
  }

  /* Process each pack */
  for (const pack of packs) {
    const packSrc = path.join(sourceRoot, pack.name, pack.src)
    const packDst = path.join(destRoot, pack.dst)

    if (!fs.existsSync(packSrc)) {
      log(`[SKIP] ${pack.name}/${pack.src} not found`)
      continue
    }

    log(`\n[\u25b6] ${pack.name}/${pack.src} -> ${pack.dst}`)
    copyAllFiles(packSrc, packDst, pack.extensions)
  }

  /* Summary */
  log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2555')
  log(`\u2551  Summary: ${copiedFiles} copied, ${skippedFiles} skipped out of ${totalFiles} files  \u2551`)
  log('\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\n')

  if (skippedFiles > 0) {
    process.exit(1)
  }
}

main()
