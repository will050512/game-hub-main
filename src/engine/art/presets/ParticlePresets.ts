/**
 * ParticlePresets — Reusable particle configuration factories.
 *
 * Each factory returns a typed ParticleConfig that can be consumed
 * by any particle system (canvas-based or CSS-based).
 *
 * Usage:
 *   const config = PARTICLE_PRESETS.destructionBurst('#ec4899')
 *   particleSystem.emit(config)
 *
 * All configs use consistent timing (ms) and sizing conventions
 * for predictable results across games.
 */

/**
 * Configuration for a single particle emission event.
 * Consumed by game particle renderers.
 */
export interface ParticleConfig {
  /** Color(s) for particles — single string or array for multi-color */
  color: string | string[]
  /** Number of particles to emit */
  count: number
  /** Speed range in world units per second */
  speed: { min: number; max: number }
  /** Size range in world units */
  size: { start: number; end: number }
  /** Lifetime in milliseconds */
  lifetime: number
  /** Gravity in world units per second² (positive = downward) */
  gravity?: number
  /** Rotation speed in degrees per second */
  rotationSpeed?: number
  /** Opacity range over the particle lifetime */
  opacity: { start: number; end: number }
}

/**
 * Factory presets for common particle effects.
 * Each factory accepts a color override and returns a full config.
 */
export const PARTICLE_PRESETS = {
  /**
   * Destruction burst — for enemy/item death.
   * Explodes outward with moderate gravity.
   */
  destructionBurst: (color: string = '#ffffff'): ParticleConfig => ({
    count: 15,
    speed: { min: 2, max: 8 },
    size: { start: 6, end: 0 },
    lifetime: 600,
    gravity: 0.1,
    opacity: { start: 1, end: 0 },
    color: [color, '#ffffff'],
  }),

  /**
   * Score sparkle — for scoring events.
   * Floats upward slowly, no gravity.
   */
  scoreSparkle: (color: string = '#ffd700'): ParticleConfig => ({
    count: 8,
    speed: { min: 1, max: 4 },
    size: { start: 4, end: 0 },
    lifetime: 800,
    gravity: 0,
    opacity: { start: 1, end: 0 },
    color: [color],
  }),

  /**
   * Level-up confetti — for level transitions and milestones.
   * High count, multi-color, moderate gravity.
   */
  levelUpConfetti: (): ParticleConfig => ({
    count: 30,
    speed: { min: 3, max: 12 },
    size: { start: 8, end: 2 },
    lifetime: 1500,
    gravity: 0.05,
    rotationSpeed: 360,
    opacity: { start: 1, end: 0 },
    color: ['#ffd700', '#ff69b4', '#00ff00', '#00bfff', '#ff4500'],
  }),

  /**
   * Trail dots — for entity trails (player, projectiles).
   * Low count, minimal movement, quick fade.
   */
  trailDots: (color: string = '#ffffff'): ParticleConfig => ({
    count: 1,
    speed: { min: 0, max: 1 },
    size: { start: 4, end: 0 },
    lifetime: 300,
    gravity: 0,
    opacity: { start: 0.6, end: 0 },
    color: [color],
  }),

  /**
   * Ambient float — for background atmosphere.
   * Very slow, low opacity, long lifetime.
   */
  ambientFloat: (color: string = '#ffffff'): ParticleConfig => ({
    count: 3,
    speed: { min: 0.1, max: 0.5 },
    size: { start: 2, end: 2 },
    lifetime: 3000,
    gravity: -0.02,
    opacity: { start: 0.3, end: 0 },
    color: [color],
  }),

  /**
   * Hit flash — brief white flash on hit.
   * Large initial size, quick fade, no movement.
   */
  hitFlash: (): ParticleConfig => ({
    count: 5,
    speed: { min: 0, max: 2 },
    size: { start: 12, end: 0 },
    lifetime: 200,
    gravity: 0,
    opacity: { start: 0.8, end: 0 },
    color: ['#ffffff'],
  }),

  /**
   * Combo burst — for combo milestones.
   * Medium count, bright colors, slight gravity.
   */
  comboBurst: (color: string = '#f472b6'): ParticleConfig => ({
    count: 12,
    speed: { min: 3, max: 10 },
    size: { start: 5, end: 0 },
    lifetime: 700,
    gravity: 0.05,
    opacity: { start: 1, end: 0 },
    color: [color, '#ffd700', '#ffffff'],
  }),

  /**
   * Power-up glow — for item pickup or power-up activation.
   * Spiral-like motion, warm colors.
   */
  powerUpGlow: (color: string = '#fbbf24'): ParticleConfig => ({
    count: 10,
    speed: { min: 1, max: 5 },
    size: { start: 6, end: 1 },
    lifetime: 1000,
    gravity: -0.05,
    rotationSpeed: 180,
    opacity: { start: 0.9, end: 0 },
    color: [color, '#ffffff'],
  }),

  /**
   * Critical hit — for special/charged attacks.
   * High-intensity flash with larger particles.
   */
  criticalHit: (color: string = '#ef4444'): ParticleConfig => ({
    count: 20,
    speed: { min: 4, max: 15 },
    size: { start: 8, end: 0 },
    lifetime: 500,
    gravity: 0.15,
    opacity: { start: 1, end: 0 },
    color: [color, '#ffd700', '#ffffff'],
  }),

  /**
   * Shield break — for when a shield or defense effect ends.
   * Fragment-like spread, glassy colors.
   */
  shieldBreak: (): ParticleConfig => ({
    count: 18,
    speed: { min: 2, max: 9 },
    size: { start: 5, end: 0 },
    lifetime: 600,
    gravity: 0.08,
    rotationSpeed: 120,
    opacity: { start: 0.8, end: 0 },
    color: ['#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'],
  }),

  /**
   * Ice frost — for freezing or ice effects.
   * Slow drift, crystalline colors.
   */
  iceFrost: (): ParticleConfig => ({
    count: 8,
    speed: { min: 0.5, max: 2 },
    size: { start: 3, end: 1 },
    lifetime: 1200,
    gravity: -0.02,
    opacity: { start: 0.7, end: 0 },
    color: ['#bae6fd', '#e0f2fe', '#ffffff'],
  }),

  /**
   * Fire ember — for burning or fire effects.
   * Upward drift, warm colors, flickering.
   */
  fireEmber: (): ParticleConfig => ({
    count: 6,
    speed: { min: 0.3, max: 2 },
    size: { start: 3, end: 0 },
    lifetime: 1500,
    gravity: -0.1,
    opacity: { start: 0.8, end: 0 },
    color: ['#ef4444', '#f97316', '#fbbf24'],
  }),
} as const

/**
 * Gets a random color from a ParticleConfig's color array.
 * Convenience helper for particle renderers.
 */
export function getParticleColor(config: ParticleConfig): string {
  if (typeof config.color === 'string') return config.color
  const colors = config.color as string[]
  return colors[Math.floor(Math.random() * colors.length)] ?? colors[0] ?? '#ffffff'
}

/**
 * Gets the max lifetime of a particle from a config.
 * Useful for cleanup timing in particle systems.
 */
export function getMaxLifetime(config: ParticleConfig): number {
  return config.lifetime
}
