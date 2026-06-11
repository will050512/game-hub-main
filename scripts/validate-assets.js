import { existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PUBLIC_DIR = join(__dirname, '..', 'public')

const assetManifest = {
  images: {
    survivor: '/images/survivor-thumb.svg',
    breakout: '/images/breakout-thumb.svg',
    tetris: '/images/tetris-thumb.svg',
    snake: '/images/snake-thumb.svg',
    game2048: '/images/2048-thumb.svg',
    flappy: '/images/flappy-thumb.svg',
    invaders: '/images/invaders-thumb.svg',
    'fruit-catch': '/images/fruit-catch-thumb.svg',
    'tower-defense': '/images/tower-defense-thumb.svg',
    'tic-tac-toe': '/images/tic-tac-toe-thumb.svg',
    memory: '/images/memory-thumb.svg',
    sudoku: '/images/sudoku-thumb.svg',
    fallback: '/images/fallback-thumb.png',
  },
  audio: {
    'survivor.bgm': '/audio/survivor/bgm.mp3',
    'survivor.weaponFire': '/audio/survivor/weapon_fire.wav',
    'survivor.playerHurt': '/audio/survivor/player_hurt.wav',
    'survivor.enemyDeath': '/audio/survivor/enemy_death.wav',
    'survivor.bossDeath': '/audio/survivor/boss_death.wav',
    'survivor.xpPickup': '/audio/survivor/xp_pickup.wav',
    'survivor.levelUp': '/audio/survivor/level_up.wav',
    'survivor.bossSpawn': '/audio/survivor/boss_spawn.wav',
    'survivor.gameOver': '/audio/survivor/game_over.wav',
    'ui.buttonClick': '/audio/ui/button-click.wav',
    'ui.notification': '/audio/ui/notification.wav',
    'ui.achievement': '/audio/ui/achievement.wav',
    'ui.coinCollect': '/audio/ui/coin-collect.wav',
  },
}

const requiredAssets = {
  images: [
    'fallback',
  ],
  audio: [],
}

function checkAsset(path, category) {
  const fullPath = join(PUBLIC_DIR, path)
  const exists = existsSync(fullPath)
  return { path, exists, category, fullPath }
}

function validateAssets() {
  console.log('🔍 Validating assets...\n')

  const results = {
    images: [],
    audio: [],
  }

  for (const [key, path] of Object.entries(assetManifest.images)) {
    const result = checkAsset(path, 'images')
    result.key = key
    result.required = requiredAssets.images.includes(key)
    results.images.push(result)
  }

  for (const [key, path] of Object.entries(assetManifest.audio)) {
    const result = checkAsset(path, 'audio')
    result.key = key
    result.required = requiredAssets.audio.includes(key)
    results.audio.push(result)
  }

  return results
}

function reportResults(results) {
  let hasErrors = false
  let hasWarnings = false

  console.log('📦 IMAGE ASSETS')
  console.log('─'.repeat(80))

  const missingRequired = results.images.filter((r) => r.required && !r.exists)
  const missingOptional = results.images.filter((r) => !r.required && !r.exists)
  const foundImages = results.images.filter((r) => r.exists)

  if (missingRequired.length > 0) {
    hasErrors = true
    console.log('❌ MISSING REQUIRED IMAGES:')
    missingRequired.forEach((r) => {
      console.log(`   - ${r.key}: ${r.path}`)
    })
    console.log('')
  }

  if (missingOptional.length > 0) {
    hasWarnings = true
    console.log('⚠️  MISSING OPTIONAL IMAGES:')
    missingOptional.forEach((r) => {
      console.log(`   - ${r.key}: ${r.path}`)
    })
    console.log('')
  }

  console.log(`✅ Found: ${foundImages.length}/${results.images.length} images`)
  console.log('')

  console.log('🎵 AUDIO ASSETS')
  console.log('─'.repeat(80))

  const missingAudioRequired = results.audio.filter((r) => r.required && !r.exists)
  const missingAudioOptional = results.audio.filter((r) => !r.required && !r.exists)
  const foundAudio = results.audio.filter((r) => r.exists)

  if (missingAudioRequired.length > 0) {
    hasErrors = true
    console.log('❌ MISSING REQUIRED AUDIO:')
    missingAudioRequired.forEach((r) => {
      console.log(`   - ${r.key}: ${r.path}`)
    })
    console.log('')
  }

  if (missingAudioOptional.length > 0) {
    hasWarnings = true
    console.log('⚠️  MISSING OPTIONAL AUDIO:')
    missingAudioOptional.forEach((r) => {
      console.log(`   - ${r.key}: ${r.path}`)
    })
    console.log('')
  }

  console.log(`✅ Found: ${foundAudio.length}/${results.audio.length} audio files`)
  console.log('')

  console.log('─'.repeat(80))

  if (hasErrors) {
    console.log('❌ VALIDATION FAILED: Missing required assets')
    console.log('   Please add the missing files or update the asset manifest.')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS')
    console.log('   Some optional assets are missing but fallbacks will be used.')
    process.exit(0)
  } else {
    console.log('✅ VALIDATION PASSED: All assets found!')
    process.exit(0)
  }
}

const results = validateAssets()
reportResults(results)
