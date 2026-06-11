/**
 * GameArtRegistry — Single source of truth for ALL visual configs across 12 games.
 * Each game gets a unified palette, background scene, entity specs, and effects.
 */

import type { GameId } from '@/types'
import {
  BACKGROUND_PRESETS,
  PARTICLE_PRESETS,
  TRANSITION_PRESETS,
  getBackgroundForGame,
  getPresetForGame,
} from './presets'
import type { GamePalette, BackgroundPreset } from './presets'

export interface KawaiiPalette {
  /** Entity body color (primary character/enemy color) */
  primary: string
  /** Accent/eyes/cheeks color */
  accent: string
  /** Ground/floor color */
  ground: string
  /** Top of sky gradient */
  skyTop: string
  /** Bottom of sky gradient */
  skyBottom: string
  /** Mid-sky color (optional, for 3-stop gradients) */
  skyMid?: string
  /** Particle burst colors */
  particleColors: string[]
  /** Trail/afterglow color */
  trailColor?: string
  /** Ambient particle type for CSS background */
  ambientParticle?: 'firefly' | 'sparkle' | 'butterfly' | 'cloud' | 'star' | 'leaf' | 'petal' | 'bubble' | 'steam' | 'confetti'
  /** Ambient particle count */
  ambientParticleCount?: number
  /** Background scene component name */
  sceneComponent?: string
}

export interface EntityVisualSpec {
  /** Body shape */
  shape: 'circle' | 'rect' | 'star' | 'heart' | 'shield' | 'arrow' | 'diamond' | 'pentagon'
  /** Body color (overrides palette.primary if set) */
  color?: string
  /** Eye expression emotion */
  eyeEmotion: 'normal' | 'happy' | 'angry' | 'surprised' | 'sleepy' | 'determined' | 'wink' | 'hearts'
  /** Mouth style */
  mouth?: 'smile' | 'frown' | 'gasp' | 'grin' | 'tongue' | 'flat'
  /** Whether to draw blush */
  blush?: boolean
  /** Whether to draw outline stroke */
  outline?: boolean
  /** Outline stroke color */
  outlineColor?: string
  /** Outline width (relative to entity size, 0-1) */
  outlineWidth?: number
  /** Glow color (for emissive entities) */
  glowColor?: string
  /** Whether entity has a continuous trail behind it */
  trailEnabled?: boolean
  /** Idle animation type */
  idleAnim?: 'bob' | 'bounce' | 'spin' | 'pulse' | 'none'
  /** Hit animation type */
  hitAnim?: 'shake' | 'flash' | 'stomp' | 'none'
  /** Death animation type */
  deathAnim?: 'fizzle' | 'explode' | 'fly-away' | 'none'
  /** Scale relative to game width (e.g., 0.06 = 6%) */
  scale: number
}

export interface EnemyVisualSpec extends Omit<EntityVisualSpec, 'eyeEmotion'> {
  /** Different expressions per game state */
  expressions: {
    idle: 'normal' | 'happy' | 'angry' | 'surprised' | 'sleepy' | 'determined'
    hit?: 'angry' | 'surprised' | 'gasp'
    death?: 'fizzle' | 'explode'
    lowHP?: 'angry' | 'sad' | 'worried'
  }
  /** Custom drawing function name (for complex entities) */
  drawFn?: string
}

export interface ParticleEffectConfig {
  /** Burst particle count */
  burstCount: number
  /** Burst spread angle in radians */
  burstSpread: number
  /** Burst speed */
  burstSpeed: number
  /** Burst particle lifespan (ms) */
  burstLife: number
  /** Burst particle size */
  burstSize: number
  /** Colors to pick from */
  colors: string[]
  /** Trail emission interval (ms) */
  trailInterval?: number
  /** Trail particle count per emission */
  trailCount?: number
}

export interface BackgroundSceneConfig {
  /** CSS background gradient for sky */
  skyGradient: [string, number, string, number, string, number]
  /** Midground animation type */
  midground?: 'clouds' | 'stars' | 'fog' | 'leaves' | 'bubbles' | 'sparkles' | 'particles' | 'steam' | 'none'
  /** Ground texture type */
  ground?: 'checker' | 'stripes' | 'dirt' | 'grass' | 'grid' | 'wood' | 'plain'
  /** Ground color */
  groundColor?: string
  /** CSS particle type */
  ambientParticle?: 'firefly' | 'sparkle' | 'butterfly' | 'cloud' | 'star' | 'leaf' | 'petal' | 'bubble' | 'steam' | 'confetti'
  /** Number of ambient particles */
  ambientParticleCount?: number
  /** Animation speed multiplier */
  animationSpeed?: number
}

export interface CollectibleVisualSpec extends Omit<EntityVisualSpec, 'eyeEmotion'> {
  /** Float or bob animation */
  floatAnim?: 'bob' | 'float' | 'none'
}

export interface GameArtConfig {
  /** Game name display */
  name: string
  /** Primary kawaii palette */
  palette: KawaiiPalette
  /** Player entity visual spec */
  player: EntityVisualSpec
  /** Enemy visual specs by type */
  enemies: Record<string, EnemyVisualSpec>
  /** Collectible/prop visual specs */
  collectibles: Record<string, CollectibleVisualSpec>
  /** Background scene config */
  background: BackgroundSceneConfig
  /** Default particle effects */
  particles: ParticleEffectConfig
  /** Screen shake config for key events */
  screenShake?: {
    hit?: { intensity: number; duration: number }
    kill?: { intensity: number; duration: number }
    levelUp?: { intensity: number; duration: number }
    gameOver?: { intensity: number; duration: number }
  }
}

export const gameArtRegistry: Record<GameId, GameArtConfig> = {
  'survivor': {
    name: '暗夜倖存者',
    palette: {
      primary: '#4ade80',
      accent: '#fbbf24',
      ground: '#166534',
      skyTop: '#0c1222',
      skyBottom: '#1a3a2a',
      particleColors: ['#fbbf24', '#4ade80', '#f472b6'],
      trailColor: '#86efac',
      ambientParticle: 'firefly',
      ambientParticleCount: 8,
    },
    player: { shape: 'circle', eyeEmotion: 'determined', mouth: 'flat', blush: false, outline: true, trailEnabled: true, idleAnim: 'bob', hitAnim: 'shake', scale: 0.06 },
    enemies: {
      zombie: { shape: 'rect', expressions: { idle: 'angry', hit: 'surprised', lowHP: 'sad' }, scale: 0.055 },
      skeleton: { shape: 'circle', expressions: { idle: 'angry', hit: 'surprised', lowHP: 'sad' }, scale: 0.05 },
    },
    collectibles: {
      heart: { shape: 'heart', blush: true, scale: 0.035 },
      coin: { shape: 'circle', blush: true, scale: 0.03 },
      shield: { shape: 'shield', blush: false, scale: 0.04 },
    },
    background: {
      skyGradient: ['#0c1222', 0, '#1a2a3a', 0.5, '#1a3a2a', 1],
      midground: 'fog',
      ground: 'grass',
      groundColor: '#166534',
      ambientParticle: 'firefly',
      ambientParticleCount: 8,
      animationSpeed: 0.5,
    },
    particles: { burstCount: 15, burstSpread: Math.PI, burstSpeed: 120, burstLife: 500, burstSize: 4, colors: ['#fbbf24', '#4ade80', '#f472b6'] },
    screenShake: { hit: { intensity: 4, duration: 80 }, kill: { intensity: 6, duration: 120 }, levelUp: { intensity: 10, duration: 200 }, gameOver: { intensity: 12, duration: 300 } },
  },
  'breakout': {
    name: '打磚塊',
    palette: {
      primary: '#fbbf24',
      accent: '#f472b6',
      ground: '#1a1a2e',
      skyTop: '#0f0f1e',
      skyBottom: '#1a1a3e',
      particleColors: ['#fbbf24', '#f59e0b', '#ec4899'],
      trailColor: '#fde68a',
      ambientParticle: 'sparkle',
      ambientParticleCount: 12,
    },
    player: { shape: 'rect', eyeEmotion: 'normal', blush: false, outline: true, trailEnabled: false, idleAnim: 'none', scale: 0.12 },
    enemies: {
      brick_normal: { shape: 'rect', expressions: { idle: 'normal', hit: 'surprised' }, scale: 0.04 },
      brick_hard: { shape: 'rect', expressions: { idle: 'angry', hit: 'surprised' }, scale: 0.04 },
    },
    collectibles: {
      laser: { shape: 'star', blush: false, scale: 0.04 },
      bomb: { shape: 'circle', blush: false, scale: 0.045 },
      multi_ball: { shape: 'star', blush: true, scale: 0.03 },
    },
    background: {
      skyGradient: ['#0f0f1e', 0, '#1a1a2e', 0.5, '#1a1a3e', 1],
      midground: 'stars',
      ground: 'grid',
      ambientParticle: 'sparkle',
      ambientParticleCount: 12,
    },
    particles: { burstCount: 20, burstSpread: Math.PI * 1.5, burstSpeed: 150, burstLife: 400, burstSize: 3, colors: ['#fbbf24', '#f59e0b', '#ec4899'] },
    screenShake: { hit: { intensity: 2, duration: 40 }, kill: { intensity: 5, duration: 80 }, levelUp: { intensity: 8, duration: 150 }, gameOver: { intensity: 10, duration: 250 } },
  },
  'tetris': {
    name: '俄羅斯方塊',
    palette: {
      primary: '#a78bfa',
      accent: '#818cf8',
      ground: '#1e1b4b',
      skyTop: '#0c0a1e',
      skyBottom: '#1e1b4b',
      particleColors: ['#a78bfa', '#c4b5fd', '#8b5cf6'],
      trailColor: '#c4b5fd',
      ambientParticle: 'star',
      ambientParticleCount: 10,
    },
    player: { shape: 'rect', eyeEmotion: 'normal', blush: false, outline: true, trailEnabled: false, idleAnim: 'none', scale: 0.05 },
    enemies: {},
    collectibles: {
      line_clear: { shape: 'star', blush: true, scale: 0.05 },
      tetris: { shape: 'star', blush: true, scale: 0.06 },
    },
    background: {
      skyGradient: ['#0c0a1e', 0, '#1e1b4b', 0.5, '#1e1b4b', 1],
      midground: 'stars',
      ground: 'plain',
      ambientParticle: 'star',
      ambientParticleCount: 10,
    },
    particles: { burstCount: 25, burstSpread: Math.PI * 2, burstSpeed: 180, burstLife: 600, burstSize: 5, colors: ['#a78bfa', '#c4b5fd', '#8b5cf6'] },
    screenShake: { hit: { intensity: 1, duration: 20 }, kill: { intensity: 4, duration: 100 }, levelUp: { intensity: 8, duration: 200 }, gameOver: { intensity: 10, duration: 300 } },
  },
  'snake': {
    name: '貪吃蛇',
    palette: {
      primary: '#4ade80',
      accent: '#22d3ee',
      ground: '#22c55e',
      skyTop: '#86efac',
      skyBottom: '#166534',
      particleColors: ['#4ade80', '#22d3ee', '#f472b6'],
      trailColor: '#86efac',
      ambientParticle: 'butterfly',
      ambientParticleCount: 6,
    },
    player: { shape: 'circle', eyeEmotion: 'normal', blush: true, mouth: 'smile', outline: true, trailEnabled: true, idleAnim: 'bob', hitAnim: 'shake', scale: 0.04 },
    enemies: {
      apple: { shape: 'heart', expressions: { idle: 'happy' }, scale: 0.04 },
      bomb: { shape: 'circle', expressions: { idle: 'angry' }, scale: 0.035 },
    },
    collectibles: {},
    background: {
      skyGradient: ['#86efac', 0, '#a7f3d0', 0.4, '#166534', 1],
      midground: 'leaves',
      ground: 'grass',
      groundColor: '#22c55e',
      ambientParticle: 'butterfly',
      ambientParticleCount: 6,
    },
    particles: { burstCount: 12, burstSpread: Math.PI * 1.5, burstSpeed: 100, burstLife: 400, burstSize: 3, colors: ['#4ade80', '#22d3ee', '#f472b6'] },
    screenShake: { hit: { intensity: 3, duration: 60 }, kill: { intensity: 4, duration: 80 }, levelUp: { intensity: 7, duration: 150 }, gameOver: { intensity: 10, duration: 250 } },
  },
  'game2048': {
    name: '2048',
    palette: {
      primary: '#fde68a',
      accent: '#f97316',
      ground: '#f5deb3',
      skyTop: '#fff7ed',
      skyBottom: '#fef3c7',
      particleColors: ['#fde68a', '#f97316', '#fb923c'],
      trailColor: '#fde68a',
      ambientParticle: 'confetti',
      ambientParticleCount: 8,
    },
    player: { shape: 'rect', eyeEmotion: 'normal', blush: true, outline: true, trailEnabled: false, idleAnim: 'pulse', scale: 0.06 },
    enemies: {},
    collectibles: {},
    background: {
      skyGradient: ['#fff7ed', 0, '#fef3c7', 0.5, '#fde68a', 1],
      midground: 'particles',
      ground: 'wood',
      ambientParticle: 'confetti',
      ambientParticleCount: 8,
    },
    particles: { burstCount: 18, burstSpread: Math.PI * 2, burstSpeed: 130, burstLife: 500, burstSize: 4, colors: ['#fde68a', '#f97316', '#fb923c'] },
    screenShake: { hit: { intensity: 2, duration: 40 }, kill: { intensity: 5, duration: 100 }, levelUp: { intensity: 8, duration: 180 }, gameOver: { intensity: 8, duration: 200 } },
  },
  'flappy': {
    name: 'Flappy Bird',
    palette: {
      primary: '#fbbf24',
      accent: '#f472b6',
      ground: '#22c55e',
      skyTop: '#7dd3fc',
      skyBottom: '#1d4ed8',
      particleColors: ['#fbbf24', '#f472b6', '#22d3ee'],
      trailColor: '#fef3c7',
      ambientParticle: 'cloud',
      ambientParticleCount: 5,
    },
    player: { shape: 'circle', eyeEmotion: 'determined', blush: false, outline: true, trailEnabled: true, idleAnim: 'bounce', hitAnim: 'shake', scale: 0.05 },
    enemies: {
      pipe: { shape: 'rect', expressions: { idle: 'normal' }, scale: 0.08 },
    },
    collectibles: {},
    background: {
      skyGradient: ['#7dd3fc', 0, '#bae6fd', 0.5, '#22c55e', 1],
      midground: 'clouds',
      ground: 'grass',
      groundColor: '#22c55e',
      ambientParticle: 'cloud',
      ambientParticleCount: 5,
    },
    particles: { burstCount: 10, burstSpread: Math.PI, burstSpeed: 80, burstLife: 300, burstSize: 3, colors: ['#fbbf24', '#f472b6', '#22d3ee'] },
    screenShake: { hit: { intensity: 5, duration: 80 }, kill: { intensity: 3, duration: 60 }, levelUp: { intensity: 5, duration: 100 }, gameOver: { intensity: 12, duration: 250 } },
  },
  'invaders': {
    name: '小蜜蜂',
    palette: {
      primary: '#a78bfa',
      accent: '#f472b6',
      ground: '#0f0a1e',
      skyTop: '#07010a',
      skyBottom: '#1e1b4b',
      particleColors: ['#a78bfa', '#f472b6', '#22d3ee'],
      trailColor: '#c4b5fd',
      ambientParticle: 'star',
      ambientParticleCount: 15,
    },
    player: { shape: 'arrow', eyeEmotion: 'determined', blush: false, outline: true, trailEnabled: false, idleAnim: 'none', scale: 0.05 },
    enemies: {
      invader: { shape: 'circle', expressions: { idle: 'angry', hit: 'surprised' }, scale: 0.045 },
      boss: { shape: 'star', expressions: { idle: 'angry', hit: 'surprised' }, scale: 0.08 },
    },
    collectibles: {
      power: { shape: 'star', blush: true, scale: 0.04 },
    },
    background: {
      skyGradient: ['#07010a', 0, '#1e1b4b', 0.5, '#1e1b4b', 1],
      midground: 'stars',
      ground: 'plain',
      ambientParticle: 'star',
      ambientParticleCount: 15,
    },
    particles: { burstCount: 18, burstSpread: Math.PI * 1.5, burstSpeed: 130, burstLife: 450, burstSize: 3, colors: ['#a78bfa', '#f472b6', '#22d3ee'] },
    screenShake: { hit: { intensity: 4, duration: 80 }, kill: { intensity: 6, duration: 120 }, levelUp: { intensity: 10, duration: 200 }, gameOver: { intensity: 14, duration: 300 } },
  },
  'fruit-catch': {
    name: '接水果',
    palette: {
      primary: '#f87171',
      accent: '#34d399',
      ground: '#166534',
      skyTop: '#a7f3d0',
      skyBottom: '#166534',
      particleColors: ['#f87171', '#fbbf24', '#34d399'],
      trailColor: '#fca5a5',
      ambientParticle: 'petal',
      ambientParticleCount: 8,
    },
    player: { shape: 'rect', eyeEmotion: 'normal', blush: true, mouth: 'smile', outline: true, trailEnabled: false, idleAnim: 'bob', scale: 0.08 },
    enemies: {
      apple: { shape: 'heart', expressions: { idle: 'happy' }, scale: 0.04 },
      bad_fruit: { shape: 'circle', expressions: { idle: 'angry' }, scale: 0.04 },
    },
    collectibles: {
      golden_fruit: { shape: 'star', blush: true, scale: 0.045 },
    },
    background: {
      skyGradient: ['#a7f3d0', 0, '#fef3c7', 0.5, '#166534', 1],
      midground: 'leaves',
      ground: 'grass',
      groundColor: '#22c55e',
      ambientParticle: 'petal',
      ambientParticleCount: 8,
    },
    particles: { burstCount: 14, burstSpread: Math.PI * 1.5, burstSpeed: 110, burstLife: 450, burstSize: 4, colors: ['#f87171', '#fbbf24', '#34d399'] },
    screenShake: { hit: { intensity: 3, duration: 60 }, kill: { intensity: 5, duration: 100 }, levelUp: { intensity: 8, duration: 150 }, gameOver: { intensity: 8, duration: 200 } },
  },
  'tower-defense': {
    name: '塔防大戰',
    palette: {
      primary: '#60a5fa',
      accent: '#34d399',
      ground: '#65a30d',
      skyTop: '#93c5fd',
      skyBottom: '#166534',
      particleColors: ['#60a5fa', '#34d399', '#fbbf24'],
      trailColor: '#93c5fd',
      ambientParticle: 'bubble',
      ambientParticleCount: 6,
    },
    player: { shape: 'shield', eyeEmotion: 'determined', blush: false, outline: true, trailEnabled: false, idleAnim: 'none', scale: 0.06 },
    enemies: {
      goblin: { shape: 'circle', expressions: { idle: 'angry', hit: 'surprised' }, scale: 0.04 },
      orc: { shape: 'rect', expressions: { idle: 'angry', hit: 'surprised' }, scale: 0.06 },
    },
    collectibles: {
      gold_pile: { shape: 'circle', blush: false, scale: 0.035 },
    },
    background: {
      skyGradient: ['#93c5fd', 0, '#bfdbfe', 0.4, '#166534', 1],
      midground: 'bubbles',
      ground: 'dirt',
      groundColor: '#86efac',
      ambientParticle: 'bubble',
      ambientParticleCount: 6,
    },
    particles: { burstCount: 12, burstSpread: Math.PI * 1.5, burstSpeed: 100, burstLife: 400, burstSize: 3, colors: ['#60a5fa', '#34d399', '#fbbf24'] },
    screenShake: { hit: { intensity: 3, duration: 60 }, kill: { intensity: 5, duration: 100 }, levelUp: { intensity: 7, duration: 150 }, gameOver: { intensity: 10, duration: 250 } },
  },
  'tic-tac-toe': {
    name: '井字棋',
    palette: {
      primary: '#60a5fa',
      accent: '#f472b6',
      ground: '#fef3c7',
      skyTop: '#ede9fe',
      skyBottom: '#fce7f3',
      particleColors: ['#60a5fa', '#f472b6', '#a78bfa'],
      trailColor: '#a78bfa',
      ambientParticle: 'confetti',
      ambientParticleCount: 10,
    },
    player: { shape: 'star', eyeEmotion: 'normal', blush: true, outline: true, trailEnabled: false, idleAnim: 'spin', scale: 0.06 },
    enemies: {
      o_piece: { shape: 'circle', expressions: { idle: 'normal', hit: 'surprised' }, scale: 0.055 },
    },
    collectibles: {},
    background: {
      skyGradient: ['#ede9fe', 0, '#fef3c7', 0.5, '#fce7f3', 1],
      midground: 'particles',
      ground: 'plain',
      ambientParticle: 'confetti',
      ambientParticleCount: 10,
    },
    particles: { burstCount: 20, burstSpread: Math.PI * 2, burstSpeed: 140, burstLife: 500, burstSize: 4, colors: ['#60a5fa', '#f472b6', '#a78bfa'] },
    screenShake: { hit: { intensity: 2, duration: 40 }, kill: { intensity: 4, duration: 80 }, levelUp: { intensity: 6, duration: 100 }, gameOver: { intensity: 6, duration: 150 } },
  },
  'memory': {
    name: '記憶翻牌',
    palette: {
      primary: '#c4b5fd',
      accent: '#f472b6',
      ground: '#fce7f3',
      skyTop: '#ede9fe',
      skyBottom: '#fbcfe8',
      particleColors: ['#c4b5fd', '#f472b6', '#818cf8'],
      trailColor: '#ddd6fe',
      ambientParticle: 'sparkle',
      ambientParticleCount: 12,
    },
    player: { shape: 'rect', eyeEmotion: 'normal', blush: true, outline: true, trailEnabled: false, idleAnim: 'bounce', scale: 0.08 },
    enemies: {},
    collectibles: {
      matched: { shape: 'star', blush: true, scale: 0.05 },
    },
    background: {
      skyGradient: ['#ede9fe', 0, '#fce7f3', 0.5, '#fbcfe8', 1],
      midground: 'sparkles',
      ground: 'plain',
      ambientParticle: 'sparkle',
      ambientParticleCount: 12,
    },
    particles: { burstCount: 16, burstSpread: Math.PI * 2, burstSpeed: 120, burstLife: 500, burstSize: 4, colors: ['#c4b5fd', '#f472b6', '#818cf8'] },
    screenShake: { hit: { intensity: 2, duration: 40 }, kill: { intensity: 3, duration: 60 }, levelUp: { intensity: 6, duration: 120 }, gameOver: { intensity: 6, duration: 150 } },
  },
  'sudoku': {
    name: '數獨',
    palette: {
      primary: '#94a3b8',
      accent: '#0d9488',
      ground: '#fef7ed',
      skyTop: '#f0fdfa',
      skyBottom: '#fef3c7',
      particleColors: ['#94a3b8', '#0d9488', '#f59e0b'],
      trailColor: '#99f6e4',
      ambientParticle: 'steam',
      ambientParticleCount: 4,
    },
    player: { shape: 'rect', eyeEmotion: 'normal', blush: false, outline: true, trailEnabled: false, idleAnim: 'none', scale: 0.05 },
    enemies: {},
    collectibles: {},
    background: {
      skyGradient: ['#f0fdfa', 0, '#fef7ed', 0.5, '#fef3c7', 1],
      midground: 'steam',
      ground: 'wood',
      ambientParticle: 'steam',
      ambientParticleCount: 4,
    },
    particles: { burstCount: 10, burstSpread: Math.PI * 1.5, burstSpeed: 80, burstLife: 400, burstSize: 3, colors: ['#94a3b8', '#0d9488', '#f59e0b'] },
    screenShake: { hit: { intensity: 1, duration: 30 }, kill: { intensity: 3, duration: 60 }, levelUp: { intensity: 5, duration: 100 }, gameOver: { intensity: 5, duration: 120 } },
  },
}

/** Get a game's art config, or return defaults */
export function getGameArt(gameId: GameId): GameArtConfig {
  return gameArtRegistry[gameId] ?? {
    name: gameId,
    palette: {
      primary: '#a78bfa',
      accent: '#f472b6',
      ground: '#1e1b4b',
      skyTop: '#0c0a1e',
      skyBottom: '#1e1b4b',
      particleColors: ['#a78bfa', '#c4b5fd', '#8b5cf6'],
      ambientParticle: 'star',
      ambientParticleCount: 8,
    },
    player: { shape: 'circle', eyeEmotion: 'normal', blush: true, outline: true, scale: 0.06 },
    enemies: {},
    collectibles: {},
    background: {
      skyGradient: ['#0c0a1e', 0, '#1e1b4b', 0.5, '#1e1b4b', 1],
      ground: 'plain',
      ambientParticle: 'star',
      ambientParticleCount: 8,
    },
    particles: { burstCount: 12, burstSpread: Math.PI, burstSpeed: 100, burstLife: 400, burstSize: 3, colors: ['#a78bfa'] },
    screenShake: { hit: { intensity: 3, duration: 60 }, kill: { intensity: 5, duration: 100 }, levelUp: { intensity: 7, duration: 150 }, gameOver: { intensity: 10, duration: 250 } },
  }
}

/** Get palette colors as CSS gradient string */
export function getBackgroundGradient(gameId: GameId): string {
  const art = getGameArt(gameId)
  const [c1, s1, c2, s2, c3, s3] = art.background.skyGradient
  return `linear-gradient(180deg, ${c1} ${s1 * 100}%, ${c2} ${s2 * 100}%, ${c3} ${s3 * 100}%)`
}

/** Get particle colors CSS array string */
export function getParticleCSSColors(gameId: GameId): string {
  const art = getGameArt(gameId)
  return art.particles.colors.join(', ')
}

/** Get the full preset set for a given game. */
export function getPresetsForGame(gameId: GameId): {
  palette: GamePalette
  particles: typeof PARTICLE_PRESETS
  background: BackgroundPreset
  transitions: typeof TRANSITION_PRESETS
} {
  const preset = getPresetForGame(gameId)
  const background = getBackgroundForGame(gameId)

  return {
    palette: preset.palette,
    particles: PARTICLE_PRESETS,
    background,
    transitions: TRANSITION_PRESETS,
  }
}
