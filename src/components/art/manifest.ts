/**
 * Sprite Manifest — Single source of truth for chibi sprite system
 *
 * Each entry maps a logical sprite id to its Vue SVG component, design size,
 * variants, and which game(s) consume it. The spriteLoader uses this manifest
 * to pre-bake SVG components into ImageBitmap caches.
 *
 * Naming: `{game}.{category}.{name}` or `shared.{category}.{name}` for cross-game.
 * Design size = px at design dpr 1.0; runtime scaling handled by drawSprite().
 * Pivot: 'center' (default) | 'top-left' | 'top-center' | 'bottom-center'.
 */
import type { Component } from 'vue'

export type SpriteCategory = 'character' | 'item' | 'background' | 'ui' | 'projectile' | 'tile' | 'effect'
export type SpritePivot = 'center' | 'top-left' | 'top-center' | 'bottom-center'

export interface SpriteEntry {
  /** Stable id, e.g. 'snake.head.default' */
  id: string
  /** Vue SVG component (lazy-imported by loader) */
  loader: () => Promise<{ default: Component }>
  /** Design pixel size at dpr 1 — used to render to offscreen canvas */
  size: { w: number; h: number }
  /** Anchor point for drawSprite positioning */
  pivot: SpritePivot
  /** Logical category for organisation */
  category: SpriteCategory
  /** Which games use this sprite */
  games: string[]
  /** Whether sprite needs runtime tinting (a `--ink` CSS var or color prop) */
  tintable?: boolean
  /** Pre-baked variants: variant-key → props passed to the Vue component when baking. */
  variants?: Record<string, Record<string, unknown>>
  /** Group key for two-stage loader: 'core' = preload at app start, else lazy on game enter */
  preload: 'core' | 'lazy'
}

/**
 * Phase 1 manifest — covers all 12 games' essential entities + UI replacements.
 * Components are created in subsequent steps (characters/, items/, ui/, backgrounds/, primitives/).
 */
export const spriteManifest: SpriteEntry[] = [
  // ============================================================
  // SHARED UI — replaces decorative characters (×, ✓, →) project-wide
  // ============================================================
  {
    id: 'ui.close',
    loader: () => import('./icons/ArtClose.vue'),
    size: { w: 24, h: 24 },
    pivot: 'center',
    category: 'ui',
    games: ['*'],
    tintable: true,
    preload: 'core',
  },
  {
    id: 'ui.check',
    loader: () => import('./icons/ArtCheck.vue'),
    size: { w: 24, h: 24 },
    pivot: 'center',
    category: 'ui',
    games: ['*'],
    tintable: true,
    preload: 'core',
  },
  {
    id: 'ui.multiply',
    loader: () => import('./icons/ArtMultiply.vue'),
    size: { w: 16, h: 16 },
    pivot: 'center',
    category: 'ui',
    games: ['*'],
    tintable: true,
    preload: 'core',
  },

  // ============================================================
  // SNAKE
  // ============================================================
  {
    id: 'snake.head',
    loader: () => import('./characters/ArtSnakeHead.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['snake'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'snake.body',
    loader: () => import('./characters/ArtSnakeBody.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['snake'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'snake.apple',
    loader: () => import('./items/ArtApple.vue'),
    size: { w: 28, h: 28 },
    pivot: 'center',
    category: 'item',
    games: ['snake'],
    preload: 'lazy',
  },
  {
    id: 'snake.golden-apple',
    loader: () => import('./items/ArtGoldenApple.vue'),
    size: { w: 28, h: 28 },
    pivot: 'center',
    category: 'item',
    games: ['snake'],
    preload: 'lazy',
  },
  {
    id: 'snake.special-food',
    loader: () => import('./items/ArtSpecialFood.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['snake'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'snake.portal',
    loader: () => import('./items/ArtPortal.vue'),
    size: { w: 36, h: 36 },
    pivot: 'center',
    category: 'item',
    games: ['snake'],
    preload: 'lazy',
  },

  // ============================================================
  // BREAKOUT
  // ============================================================
  {
    id: 'breakout.paddle',
    loader: () => import('./characters/ArtPaddle.vue'),
    size: { w: 192, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['breakout'],
    preload: 'lazy',
  },
  {
    id: 'breakout.ball',
    loader: () => import('./items/ArtBall.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['breakout'],
    preload: 'lazy',
  },
  {
    id: 'breakout.brick',
    loader: () => import('./items/ArtBrick.vue'),
    size: { w: 80, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['breakout'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'breakout.brick-boss',
    loader: () => import('./items/ArtBrickBoss.vue'),
    size: { w: 96, h: 48 },
    pivot: 'center',
    category: 'item',
    games: ['breakout'],
    preload: 'lazy',
  },
  {
    id: 'breakout.powerup',
    loader: () => import('./items/ArtPowerup.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['breakout', 'invaders'],
    tintable: true,
    variants: {
      wide_paddle: { bodyColor: '#34d399' },
      multi_ball: { bodyColor: '#38bdf8' },
      sticky_paddle: { bodyColor: '#c084fc' },
      laser: { bodyColor: '#fca5a5' },
      slow_ball: { bodyColor: '#67e8f9' },
      extra_life: { bodyColor: '#fda4af' },
      narrow_paddle: { bodyColor: '#fdba74' },
      speed_ball: { bodyColor: '#f87171' },
    },
    preload: 'lazy',
  },
  {
    id: 'breakout.laser',
    loader: () => import('./decorations/ArtLaser.vue'),
    size: { w: 8, h: 16 },
    pivot: 'center',
    category: 'projectile',
    games: ['breakout'],
    preload: 'lazy',
  },

  // ============================================================
  // TETRIS
  // ============================================================
  {
    id: 'tetris.block',
    loader: () => import('./items/ArtTetrisBlock.vue'),
    size: { w: 32, h: 32 },
    pivot: 'top-left',
    category: 'tile',
    games: ['tetris'],
    tintable: true,
    variants: {
      I: { bodyColor: '#06b6d4' },
      O: { bodyColor: '#eab308' },
      T: { bodyColor: '#8b5cf6' },
      S: { bodyColor: '#10b981' },
      Z: { bodyColor: '#ef4444' },
      J: { bodyColor: '#3b82f6' },
      L: { bodyColor: '#f97316' },
    },
    preload: 'lazy',
  },

  // ============================================================
  // FLAPPY
  // ============================================================
  {
    id: 'flappy.bird',
    loader: () => import('./characters/ArtBird.vue'),
    size: { w: 48, h: 48 },
    pivot: 'center',
    category: 'character',
    games: ['flappy'],
    preload: 'lazy',
  },
  {
    id: 'flappy.pipe-body',
    loader: () => import('./backgrounds/ArtPipeBody.vue'),
    size: { w: 112, h: 64 },
    pivot: 'top-left',
    category: 'background',
    games: ['flappy'],
    preload: 'lazy',
  },
  {
    id: 'flappy.pipe-cap',
    loader: () => import('./backgrounds/ArtPipeCap.vue'),
    size: { w: 128, h: 28 },
    pivot: 'top-left',
    category: 'background',
    games: ['flappy'],
    preload: 'lazy',
  },
  {
    id: 'flappy.ring',
    loader: () => import('./items/ArtRing.vue'),
    size: { w: 80, h: 80 },
    pivot: 'center',
    category: 'item',
    games: ['flappy'],
    tintable: true,
    variants: {
      gold: { inkColor: '#eab308' },
      silver: { inkColor: '#94a3b8' },
      bronze: { inkColor: '#d97706' },
    },
    preload: 'lazy',
  },
  {
    id: 'flappy.ground',
    loader: () => import('./backgrounds/ArtGround.vue'),
    size: { w: 256, h: 88 },
    pivot: 'top-left',
    category: 'background',
    games: ['flappy'],
    preload: 'lazy',
  },
  {
    id: 'flappy.cloud',
    loader: () => import('./backgrounds/ArtCloud.vue'),
    size: { w: 96, h: 48 },
    pivot: 'center',
    category: 'background',
    games: ['flappy', 'fruit-catch'],
    preload: 'lazy',
  },

  // ============================================================
  // SURVIVOR
  // ============================================================
  {
    id: 'survivor.player',
    loader: () => import('./characters/ArtSurvivorPlayer.vue'),
    size: { w: 48, h: 48 },
    pivot: 'center',
    category: 'character',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.enemy-normal',
    loader: () => import('./characters/ArtEnemyNormal.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.enemy-bat',
    loader: () => import('./characters/ArtEnemyBat.vue'),
    size: { w: 28, h: 28 },
    pivot: 'center',
    category: 'character',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.enemy-slime',
    loader: () => import('./characters/ArtEnemySlime.vue'),
    size: { w: 36, h: 36 },
    pivot: 'center',
    category: 'character',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.enemy-skeleton',
    loader: () => import('./characters/ArtEnemySkeleton.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.enemy-boss',
    loader: () => import('./characters/ArtEnemyBoss.vue'),
    size: { w: 80, h: 80 },
    pivot: 'center',
    category: 'character',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.projectile',
    loader: () => import('./decorations/ArtProjectile.vue'),
    size: { w: 16, h: 16 },
    pivot: 'center',
    category: 'projectile',
    games: ['survivor'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'survivor.enemy-projectile',
    loader: () => import('./decorations/ArtEnemyProjectile.vue'),
    size: { w: 16, h: 16 },
    pivot: 'center',
    category: 'projectile',
    games: ['survivor'],
    preload: 'lazy',
  },
  {
    id: 'survivor.xp-gem',
    loader: () => import('./items/ArtXpGem.vue'),
    size: { w: 20, h: 20 },
    pivot: 'center',
    category: 'item',
    games: ['survivor'],
    preload: 'lazy',
  },

  // ============================================================
  // INVADERS
  // ============================================================
  {
    id: 'invaders.player',
    loader: () => import('./characters/ArtInvaderShip.vue'),
    size: { w: 64, h: 36 },
    pivot: 'center',
    category: 'character',
    games: ['invaders'],
    preload: 'lazy',
  },
  {
    id: 'invaders.alien-squid',
    loader: () => import('./characters/ArtAlienSquid.vue'),
    size: { w: 40, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['invaders'],
    preload: 'lazy',
  },
  {
    id: 'invaders.alien-crab',
    loader: () => import('./characters/ArtAlienCrab.vue'),
    size: { w: 40, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['invaders'],
    preload: 'lazy',
  },
  {
    id: 'invaders.alien-octopus',
    loader: () => import('./characters/ArtAlienOctopus.vue'),
    size: { w: 40, h: 32 },
    pivot: 'center',
    category: 'character',
    games: ['invaders'],
    preload: 'lazy',
  },
  {
    id: 'invaders.bullet-player',
    loader: () => import('./decorations/ArtBulletPlayer.vue'),
    size: { w: 8, h: 16 },
    pivot: 'center',
    category: 'projectile',
    games: ['invaders'],
    preload: 'lazy',
  },
  {
    id: 'invaders.bullet-alien',
    loader: () => import('./decorations/ArtBulletAlien.vue'),
    size: { w: 8, h: 16 },
    pivot: 'center',
    category: 'projectile',
    games: ['invaders'],
    preload: 'lazy',
  },
  {
    id: 'invaders.shield-block',
    loader: () => import('./items/ArtShieldBlock.vue'),
    size: { w: 24, h: 24 },
    pivot: 'top-left',
    category: 'item',
    games: ['invaders'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'invaders.missile',
    loader: () => import('./decorations/ArtMissile.vue'),
    size: { w: 16, h: 24 },
    pivot: 'center',
    category: 'projectile',
    games: ['invaders'],
    preload: 'lazy',
  },

  // ============================================================
  // FRUIT-CATCH
  // ============================================================
  {
    id: 'fruit.basket',
    loader: () => import('./characters/ArtBasket.vue'),
    size: { w: 192, h: 56 },
    pivot: 'bottom-center',
    category: 'character',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.apple',
    loader: () => import('./items/ArtFruitApple.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.orange',
    loader: () => import('./items/ArtFruitOrange.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.grape',
    loader: () => import('./items/ArtFruitGrape.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.watermelon',
    loader: () => import('./items/ArtFruitWatermelon.vue'),
    size: { w: 36, h: 36 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.star',
    loader: () => import('./items/ArtFruitStar.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.bomb',
    loader: () => import('./items/ArtBomb.vue'),
    size: { w: 32, h: 32 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },
  {
    id: 'fruit.golden',
    loader: () => import('./items/ArtGoldenItem.vue'),
    size: { w: 36, h: 36 },
    pivot: 'center',
    category: 'item',
    games: ['fruit-catch'],
    preload: 'lazy',
  },

  // ============================================================
  // 2048
  // ============================================================
  {
    id: '2048.tile',
    loader: () => import('./items/Art2048Tile.vue'),
    size: { w: 96, h: 96 },
    pivot: 'top-left',
    category: 'tile',
    games: ['game2048'],
    tintable: true,
    preload: 'lazy',
    variants: {
      empty: { bodyColor: '#334155' },
      '2': { bodyColor: '#1e293b' },
      '4': { bodyColor: '#2563eb' },
      '8': { bodyColor: '#7c3aed' },
      '16': { bodyColor: '#c026d3' },
      '32': { bodyColor: '#db2777' },
      '64': { bodyColor: '#e11d48' },
      '128': { bodyColor: '#059669' },
      '256': { bodyColor: '#0891b2' },
      '512': { bodyColor: '#0284c7' },
      '1024': { bodyColor: '#f59e0b' },
      '2048': { bodyColor: '#eab308' },
      max: { bodyColor: '#1e293b' },
    },
  },

  // ============================================================
  // TOWER DEFENSE
  // ============================================================
  {
    id: 'td.tower-base',
    loader: () => import('./characters/ArtTowerBase.vue'),
    size: { w: 56, h: 56 },
    pivot: 'center',
    category: 'character',
    games: ['tower-defense'],
    tintable: true,
    preload: 'lazy',
    variants: {
      basic: { bodyColor: '#3b82f6' },
      sniper: { bodyColor: '#8b5cf6' },
      splash: { bodyColor: '#ef4444' },
    },
  },
  {
    id: 'td.tower-barrel',
    loader: () => import('./characters/ArtTowerBarrel.vue'),
    size: { w: 48, h: 16 },
    pivot: 'center',
    category: 'character',
    games: ['tower-defense'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'td.enemy',
    loader: () => import('./characters/ArtTdEnemy.vue'),
    size: { w: 28, h: 28 },
    pivot: 'center',
    category: 'character',
    games: ['tower-defense'],
    tintable: true,
    preload: 'lazy',
    variants: {
      normal: { bodyColor: '#ef4444' },
      fast: { bodyColor: '#eab308' },
      tank: { bodyColor: '#10b981' },
      boss: { bodyColor: '#a855f7' },
      elite: { bodyColor: '#f97316' },
    },
  },
  {
    id: 'td.projectile',
    loader: () => import('./decorations/ArtTdProjectile.vue'),
    size: { w: 12, h: 12 },
    pivot: 'center',
    category: 'projectile',
    games: ['tower-defense'],
    tintable: true,
    preload: 'lazy',
  },

  // ============================================================
  // MEMORY
  // ============================================================
  {
    id: 'memory.card-back',
    loader: () => import('./items/ArtCardBack.vue'),
    size: { w: 80, h: 80 },
    pivot: 'top-left',
    category: 'item',
    games: ['memory'],
    preload: 'lazy',
  },
  {
    id: 'memory.card-face',
    loader: () => import('./items/ArtCardFace.vue'),
    size: { w: 80, h: 80 },
    pivot: 'top-left',
    category: 'item',
    games: ['memory'],
    preload: 'lazy',
  },

  // ============================================================
  // SUDOKU
  // ============================================================
  {
    id: 'sudoku.cell',
    loader: () => import('./items/ArtSudokuCell.vue'),
    size: { w: 56, h: 56 },
    pivot: 'top-left',
    category: 'tile',
    games: ['sudoku'],
    tintable: true,
    preload: 'lazy',
  },

  // ============================================================
  // TIC-TAC-TOE
  // ============================================================
  {
    id: 'ttt.cell',
    loader: () => import('./items/ArtTttCell.vue'),
    size: { w: 96, h: 96 },
    pivot: 'top-left',
    category: 'tile',
    games: ['tic-tac-toe'],
    preload: 'lazy',
  },
  {
    id: 'ttt.x',
    loader: () => import('./items/ArtTttX.vue'),
    size: { w: 64, h: 64 },
    pivot: 'center',
    category: 'item',
    games: ['tic-tac-toe'],
    tintable: true,
    preload: 'lazy',
  },
  {
    id: 'ttt.o',
    loader: () => import('./items/ArtTttO.vue'),
    size: { w: 64, h: 64 },
    pivot: 'center',
    category: 'item',
    games: ['tic-tac-toe'],
    tintable: true,
    preload: 'lazy',
  },
]

/** Index by id for O(1) lookup. */
export const spriteById: Record<string, SpriteEntry> = Object.fromEntries(
  spriteManifest.map((s) => [s.id, s] as const),
)

/** Filter helpers for two-stage preloading. */
export const coreSprites = spriteManifest.filter((s) => s.preload === 'core')
export const lazySpritesByGame = (gameId: string): SpriteEntry[] =>
  spriteManifest.filter((s) => s.preload === 'lazy' && (s.games.includes(gameId) || s.games.includes('*')))

