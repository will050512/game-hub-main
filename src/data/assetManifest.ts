import type { GameId } from '@/types'

export type AssetCategory = 'thumbnails' | 'ui' | 'mascot' | 'audio' | 'icons'

export interface ImageAsset {
  path: string
  alt: string
  category: AssetCategory
  required: boolean
  fallback?: string
}

export interface AudioAsset {
  path: string
  category: AssetCategory
  required: boolean
  fallback?: string
}

export interface AssetRegistry {
  images: Record<string, ImageAsset>
  audio: Record<string, AudioAsset>
}

const FALLBACK_THUMBNAIL = '/images/fallback-thumb.png'
const FALLBACK_ICON = '/icons/fallback.svg'
const FALLBACK_MASCOT = '/images/mascot/fallback.png'


export const gameThumbnails: Record<GameId, ImageAsset> = {
  survivor: {
    path: '/images/survivor-thumb.svg',
    alt: '暗夜倖存者縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  breakout: {
    path: '/images/breakout-thumb.svg',
    alt: '打磚塊縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  tetris: {
    path: '/images/tetris-thumb.svg',
    alt: '俄羅斯方塊縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  snake: {
    path: '/images/snake-thumb.svg',
    alt: '貪吃蛇縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  game2048: {
    path: '/images/2048-thumb.svg',
    alt: '2048縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  flappy: {
    path: '/images/flappy-thumb.svg',
    alt: 'Flappy Bird縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  invaders: {
    path: '/images/invaders-thumb.svg',
    alt: '小蜜蜂縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  'fruit-catch': {
    path: '/images/fruit-catch-thumb.svg',
    alt: '接水果縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  'tower-defense': {
    path: '/images/tower-defense-thumb.svg',
    alt: '塔防大戰縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  'tic-tac-toe': {
    path: '/images/tic-tac-toe-thumb.svg',
    alt: '井字棋縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  memory: {
    path: '/images/memory-thumb.svg',
    alt: '記憶翻牌縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
  sudoku: {
    path: '/images/sudoku-thumb.svg',
    alt: '數獨縮圖',
    category: 'thumbnails',
    required: true,
    fallback: FALLBACK_THUMBNAIL,
  },
}

export const sharedUIAssets: Record<string, ImageAsset> = {
  logo: {
    path: '/images/logo.png',
    alt: 'Game Hub Logo',
    category: 'ui',
    required: false,
    fallback: FALLBACK_ICON,
  },
  emptyState: {
    path: '/images/empty-state.svg',
    alt: '空狀態插圖',
    category: 'ui',
    required: false,
  },
  achievementBadge: {
    path: '/images/ui/achievement-badge.svg',
    alt: '成就徽章',
    category: 'ui',
    required: false,
  },
  levelUpBanner: {
    path: '/images/ui/level-up.svg',
    alt: '升級橫幅',
    category: 'ui',
    required: false,
  },
  coinIcon: {
    path: '/images/ui/coin.svg',
    alt: '金幣圖示',
    category: 'ui',
    required: false,
  },
  ghostPeek: {
    path: '/images/decor/ghost-peek.svg',
    alt: '微笑幽靈裝飾',
    category: 'ui',
    required: false,
  },
  pixelHeart: {
    path: '/images/decor/pixel-heart.svg',
    alt: '像素愛心裝飾',
    category: 'ui',
    required: false,
  },
  kawaiiStar: {
    path: '/images/decor/kawaii-star.svg',
    alt: '可愛星星裝飾',
    category: 'ui',
    required: false,
  },
  frogBadge: {
    path: '/images/decor/frog-badge.svg',
    alt: '暈眩青蛙徽章',
    category: 'ui',
    required: false,
  },
  pandaToken: {
    path: '/images/decor/panda-token.svg',
    alt: '熊貓徽章',
    category: 'ui',
    required: false,
  },
  chibiGirlToken: {
    path: '/images/decor/chibi-girl-token.svg',
    alt: 'Q版女孩徽章',
    category: 'ui',
    required: false,
  },
  rabbitCorner: {
    path: '/images/decor/rabbit-corner.svg',
    alt: '探頭兔子裝飾',
    category: 'ui',
    required: false,
  },
  soundBubble: {
    path: '/images/decor/sound-bubble.svg',
    alt: '音效泡泡裝飾',
    category: 'ui',
    required: false,
  },
}

export const mascotAssets: Record<string, ImageAsset> = {
  default: {
    path: '/images/mascot/default.png',
    alt: '預設吉祥物',
    category: 'mascot',
    required: false,
    fallback: FALLBACK_MASCOT,
  },
  happy: {
    path: '/images/mascot/happy.png',
    alt: '開心吉祥物',
    category: 'mascot',
    required: false,
    fallback: FALLBACK_MASCOT,
  },
  sad: {
    path: '/images/mascot/sad.png',
    alt: '難過吉祥物',
    category: 'mascot',
    required: false,
    fallback: FALLBACK_MASCOT,
  },
  celebrating: {
    path: '/images/mascot/celebrating.png',
    alt: '慶祝吉祥物',
    category: 'mascot',
    required: false,
    fallback: FALLBACK_MASCOT,
  },
  rabbit: {
    path: '/images/mascots/rabbit.svg',
    alt: '粉紅兔子吉祥物',
    category: 'mascot',
    required: false,
  },
  rabbitHappy: {
    path: '/images/mascots/rabbit-happy.svg',
    alt: '開心粉紅兔子吉祥物',
    category: 'mascot',
    required: false,
  },
  rabbitSurprised: {
    path: '/images/mascots/rabbit-surprised.svg',
    alt: '驚訝粉紅兔子吉祥物',
    category: 'mascot',
    required: false,
  },
  rabbitHurt: {
    path: '/images/mascots/rabbit-hurt.svg',
    alt: '受傷粉紅兔子吉祥物',
    category: 'mascot',
    required: false,
  },
  rabbitWin: {
    path: '/images/mascots/rabbit-win.svg',
    alt: '勝利粉紅兔子吉祥物',
    category: 'mascot',
    required: false,
  },
  rabbitLose: {
    path: '/images/mascots/rabbit-lose.svg',
    alt: '失敗粉紅兔子吉祥物',
    category: 'mascot',
    required: false,
  },
  panda: {
    path: '/images/mascots/panda.svg',
    alt: '熊貓吉祥物',
    category: 'mascot',
    required: false,
  },
  frog: {
    path: '/images/mascots/frog.svg',
    alt: '青蛙吉祥物',
    category: 'mascot',
    required: false,
  },
}

export const audioAssets: Record<string, Record<string, AudioAsset>> = {
  survivor: {
    bgm: {
      path: '/audio/survivor/bgm.mp3',
      category: 'audio',
      required: false,
    },
    weaponFire: {
      path: '/audio/survivor/weapon_fire.wav',
      category: 'audio',
      required: false,
    },
    playerHurt: {
      path: '/audio/survivor/player_hurt.wav',
      category: 'audio',
      required: false,
    },
    enemyDeath: {
      path: '/audio/survivor/enemy_death.wav',
      category: 'audio',
      required: false,
    },
    bossDeath: {
      path: '/audio/survivor/boss_death.wav',
      category: 'audio',
      required: false,
    },
    xpPickup: {
      path: '/audio/survivor/xp_pickup.wav',
      category: 'audio',
      required: false,
    },
    levelUp: {
      path: '/audio/survivor/level_up.wav',
      category: 'audio',
      required: false,
    },
    bossSpawn: {
      path: '/audio/survivor/boss_spawn.wav',
      category: 'audio',
      required: false,
    },
    gameOver: {
      path: '/audio/survivor/game_over.wav',
      category: 'audio',
      required: false,
    },
  },
  ui: {
    buttonClick: {
      path: '/audio/ui/button-click.wav',
      category: 'audio',
      required: false,
    },
    notification: {
      path: '/audio/ui/notification.wav',
      category: 'audio',
      required: false,
    },
    achievement: {
      path: '/audio/ui/achievement.wav',
      category: 'audio',
      required: false,
    },
    coinCollect: {
      path: '/audio/ui/coin-collect.wav',
      category: 'audio',
      required: false,
    },
  },
}

export const assetManifest: AssetRegistry = {
  images: {
    ...gameThumbnails,
    ...sharedUIAssets,
    ...mascotAssets,
  },
  audio: {
    ...Object.entries(audioAssets).reduce((acc, [gameId, assets]) => {
      Object.entries(assets).forEach(([key, asset]) => {
        acc[`${gameId}.${key}`] = asset
      })
      return acc
    }, {} as Record<string, AudioAsset>),
  },
}

export function getAssetPath(assetKey: string, type: 'images' | 'audio' = 'images'): string {
  const asset = assetManifest[type][assetKey]
  if (!asset) {
    console.warn(`[AssetManifest] Asset not found: ${assetKey}`)
    return type === 'images' ? FALLBACK_THUMBNAIL : ''
  }
  return asset.path
}

export function getGameThumbnail(gameId: GameId): string {
  const thumbnail = gameThumbnails[gameId]
  return thumbnail?.path || FALLBACK_THUMBNAIL
}

export function getGameAudio(gameId: GameId, audioKey: string): string {
  const fullKey = `${gameId}.${audioKey}`
  return getAssetPath(fullKey, 'audio')
}

export async function checkAssetExists(path: string): Promise<boolean> {
  try {
    const response = await fetch(path, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export function getRequiredAssets(): { images: string[]; audio: string[] } {
  const requiredImages = Object.values(assetManifest.images)
    .filter((asset) => asset.required)
    .map((asset) => asset.path)

  const requiredAudio = Object.values(assetManifest.audio)
    .filter((asset) => asset.required)
    .map((asset) => asset.path)

  return { images: requiredImages, audio: requiredAudio }
}

export function getAllAssets(): { images: string[]; audio: string[] } {
  const allImages = Object.values(assetManifest.images).map((asset) => asset.path)
  const allAudio = Object.values(assetManifest.audio).map((asset) => asset.path)

  return { images: allImages, audio: allAudio }
}

export async function preloadCriticalImages(): Promise<void> {
  const criticalImages = Object.values(gameThumbnails).map((asset) => asset.path)

  const promises = criticalImages.map((path) => {
    return new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => {
        console.warn(`[AssetManifest] Failed to preload: ${path}`)
        resolve()
      }
      img.src = path
    })
  })

  await Promise.all(promises)
}

export default assetManifest
