/**
 * BackgroundPresets — Per-game background rendering configurations.
 *
 * Each preset defines a gradient sky, ambient particle settings,
 * and optional parallax layers. Designed to be rendered on canvas
 * at the game's full resolution.
 *
 * Usage:
 *   const preset = BACKGROUND_PRESETS['survivor']
 *   drawBackgroundPreset(ctx, preset, width, height, time)
 */

import type { GameId } from '@/types'

/**
 * Configuration for a single game's background rendering.
 */
export interface BackgroundPreset {
  /** Gradient stops for the main background */
  gradient: {
    /** Gradient angle in radians */
    angle: number
    /** Color stops along the gradient */
    stops: { offset: number; color: string }[]
  }
  /** Ambient particle configuration */
  ambientParticles: {
    /** Whether ambient particles are enabled */
    enabled: boolean
    /** Maximum concurrent particles */
    count: number
    /** Colors for ambient particles */
    colors: string[]
    /** Drift speed (world units per second) */
    speed: number
  }
  /** Parallax layers (optional) */
  layers?: {
    /** Depth: 0 = far, 1 = near */
    depth: number
    /** Scroll speed relative to camera */
    speed: number
    /** Procedural element color */
    color: string
    /** Layer opacity */
    opacity: number
  }[]
}

/**
 * All 12 game background presets.
 * Derived from GameArtRegistry skyGradient and ambient configs.
 */
export const BACKGROUND_PRESETS: Record<GameId, BackgroundPreset> = {
  'survivor': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#0c1222' },
        { offset: 0.5, color: '#1a2a3a' },
        { offset: 1, color: '#1a3a2a' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 8,
      colors: ['#fbbf24', '#4ade80', '#86efac'],
      speed: 0.3,
    },
    layers: [
      { depth: 0.2, speed: 0.1, color: '#166534', opacity: 0.15 },
      { depth: 0.5, speed: 0.3, color: '#1a3a2a', opacity: 0.1 },
    ],
  },
  'breakout': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#0f0f1e' },
        { offset: 0.5, color: '#1a1a2e' },
        { offset: 1, color: '#1a1a3e' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 12,
      colors: ['#fbbf24', '#f59e0b', '#ec4899'],
      speed: 0.5,
    },
    layers: [
      { depth: 0.1, speed: 0.05, color: '#2d1b69', opacity: 0.08 },
    ],
  },
  'tetris': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#0c0a1e' },
        { offset: 0.5, color: '#1e1b4b' },
        { offset: 1, color: '#1e1b4b' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 10,
      colors: ['#a78bfa', '#c4b5fd', '#818cf8'],
      speed: 0.2,
    },
    layers: [
      { depth: 0.1, speed: 0.03, color: '#312e81', opacity: 0.05 },
    ],
  },
  'snake': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#86efac' },
        { offset: 0.4, color: '#a7f3d0' },
        { offset: 1, color: '#166534' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 6,
      colors: ['#4ade80', '#22d3ee', '#f472b6'],
      speed: 0.4,
    },
    layers: [
      { depth: 0.3, speed: 0.2, color: '#22c55e', opacity: 0.2 },
      { depth: 0.6, speed: 0.4, color: '#166534', opacity: 0.15 },
    ],
  },
  'game2048': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#fff7ed' },
        { offset: 0.5, color: '#fef3c7' },
        { offset: 1, color: '#fde68a' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 8,
      colors: ['#fde68a', '#f97316', '#fb923c'],
      speed: 0.25,
    },
    layers: [],
  },
  'flappy': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#7dd3fc' },
        { offset: 0.5, color: '#bae6fd' },
        { offset: 1, color: '#22c55e' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 5,
      colors: ['#ffffff', '#fef3c7', '#fbbf24'],
      speed: 0.6,
    },
    layers: [
      { depth: 0.2, speed: 0.15, color: '#86efac', opacity: 0.25 },
      { depth: 0.5, speed: 0.3, color: '#22c55e', opacity: 0.2 },
    ],
  },
  'invaders': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#07010a' },
        { offset: 0.5, color: '#1e1b4b' },
        { offset: 1, color: '#1e1b4b' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 15,
      colors: ['#a78bfa', '#f472b6', '#22d3ee'],
      speed: 0.1,
    },
    layers: [
      { depth: 0.1, speed: 0.02, color: '#312e81', opacity: 0.03 },
    ],
  },
  'fruit-catch': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#a7f3d0' },
        { offset: 0.5, color: '#fef3c7' },
        { offset: 1, color: '#166534' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 8,
      colors: ['#f87171', '#fbbf24', '#34d399'],
      speed: 0.35,
    },
    layers: [
      { depth: 0.3, speed: 0.2, color: '#22c55e', opacity: 0.2 },
      { depth: 0.6, speed: 0.35, color: '#166534', opacity: 0.15 },
    ],
  },
  'tower-defense': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#93c5fd' },
        { offset: 0.4, color: '#bfdbfe' },
        { offset: 1, color: '#166534' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 6,
      colors: ['#60a5fa', '#34d399', '#fbbf24'],
      speed: 0.3,
    },
    layers: [
      { depth: 0.2, speed: 0.1, color: '#86efac', opacity: 0.15 },
      { depth: 0.5, speed: 0.25, color: '#65a30d', opacity: 0.1 },
    ],
  },
  'tic-tac-toe': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#ede9fe' },
        { offset: 0.5, color: '#fef3c7' },
        { offset: 1, color: '#fce7f3' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 10,
      colors: ['#60a5fa', '#f472b6', '#a78bfa'],
      speed: 0.4,
    },
    layers: [],
  },
  'memory': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#ede9fe' },
        { offset: 0.5, color: '#fce7f3' },
        { offset: 1, color: '#fbcfe8' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 12,
      colors: ['#c4b5fd', '#f472b6', '#818cf8'],
      speed: 0.3,
    },
    layers: [],
  },
  'sudoku': {
    gradient: {
      angle: Math.PI / 2,
      stops: [
        { offset: 0, color: '#f0fdfa' },
        { offset: 0.5, color: '#fef7ed' },
        { offset: 1, color: '#fef3c7' },
      ],
    },
    ambientParticles: {
      enabled: true,
      count: 4,
      colors: ['#94a3b8', '#0d9488', '#f59e0b'],
      speed: 0.15,
    },
    layers: [],
  },
}

/**
 * Renders a background preset onto a canvas context.
 *
 * @param ctx - The canvas 2D context to draw on
 * @param preset - The background preset to render
 * @param width - Canvas width
 * @param height - Canvas height
 * @param time - Current time in seconds (for animated elements)
 */
export function drawBackgroundPreset(
  ctx: CanvasRenderingContext2D,
  preset: BackgroundPreset,
  width: number,
  height: number,
  time: number,
): void {
  // Draw gradient background
  const grad = ctx.createLinearGradient(
    0,
    0,
    Math.cos(preset.gradient.angle) * width,
    Math.sin(preset.gradient.angle) * height,
  )
  preset.gradient.stops.forEach((stop) => {
    grad.addColorStop(stop.offset, stop.color)
  })
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Draw parallax layers
  if (preset.layers) {
    preset.layers.forEach((layer) => {
      ctx.globalAlpha = layer.opacity
      ctx.fillStyle = layer.color

      // Procedural scrolling elements based on layer depth
      const scrollOffset = (time * layer.speed * 20) % width
      const elementSize = 30 + layer.depth * 50

      for (let x = -elementSize + scrollOffset; x < width + elementSize; x += elementSize * 2) {
        for (let y = height * (1 - layer.depth * 0.5); y < height; y += elementSize * 1.5) {
          ctx.beginPath()
          ctx.arc(x, y, elementSize * 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    })
  }
  ctx.globalAlpha = 1

  // Draw ambient particles
  if (preset.ambientParticles.enabled) {
    const { count, colors, speed } = preset.ambientParticles
    for (let i = 0; i < count; i++) {
      const seed = i * 137.508
      const x = ((seed * 7.31 + time * speed * 10) % width)
      const y = ((seed * 3.17 + Math.sin(time * speed + seed * 0.01) * 30) % height)
      const size = 1 + (seed % 3)
      const color = colors[i % colors.length] ?? '#ffffff'
      const alpha = 0.15 + Math.sin(time + seed) * 0.1

      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.globalAlpha = 1
}

/**
 * Gets the background preset for a given game ID.
 * Falls back to a neutral dark preset if the ID is not recognized.
 */
export function getBackgroundForGame(gameId: GameId): BackgroundPreset {
  return BACKGROUND_PRESETS[gameId] ?? BACKGROUND_PRESETS['survivor']
}
