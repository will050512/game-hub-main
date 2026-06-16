/**
 * KawaiiPresets — Per-game themed palettes derived from CSS token colors.
 *
 * Each game gets a cohesive color set that drives:
 *  - Entity rendering (KawaiiRenderer)
 *  - Particle colors (ParticlePresets)
 *  - Background gradients (BackgroundPresets)
 *  - HUD elements (HP bars, score, combo text)
 *
 * Palettes are derived from src/assets/styles/tokens.css game-specific tokens
 * and the existing GameArtRegistry configs, unified into a consistent format.
 */

import type { GameId } from '@/types'

/**
 * A complete color palette for a single game's kawaii theme.
 * Use these values for any visual element in the game — entities,
 * particles, backgrounds, HUD, and UI.
 */
export interface GamePalette {
  /** Main entity/character body color */
  primary: string
  /** Secondary accent — eyes, highlights, decorative elements */
  secondary: string
  /** Accent color — special effects, power-ups, rare items */
  accent: string
  /** Primary background fill */
  bg: string
  /** Alternate background for alternating rows, card flips, etc. */
  bgAlt: string
  /** Dark ink for strokes, outlines, text */
  ink: string
  /** Bright highlight — score pop, critical effects */
  highlight: string
  /** Glow color — emissive effects, neon strokes */
  glow: string
}

/**
 * UI identity tokens for game-specific visual identity.
 * These drive the canvas HUD/overlay styling and Vue shell adaptation.
 */
export interface GameUiTokens {
  /** Panel/surface fill (typically semi-transparent) */
  surface: string
  /** UI accent for panels, borders, active buttons */
  accent: string
  /** Danger/alert color — boss warnings, game over, low HP */
  danger: string
  /** Ambient particle type for the game's atmosphere */
  particle: 'firefly' | 'sparkle' | 'butterfly' | 'cloud' | 'star' | 'leaf' | 'petal' | 'bubble' | 'steam' | 'confetti'
}

/**
 * Complete visual preset for a single game.
 * Combines the palette with entity colors and HUD colors.
 */
export interface GamePreset {
  /** The game's kawaii palette */
  palette: GamePalette
  /** Colors for game entities — enemies, items, obstacles */
  entityColors: string[]
  /** HUD-specific color overrides */
  hudColors: {
    /** HP bar gradient top */
    hpBar: string
    /** Score text color */
    score: string
    /** Combo/milestone text color */
    combo: string
  }
  /** UI identity tokens for game-specific visual style (optional per-game override) */
  ui?: GameUiTokens
}

/**
 * All 12 game presets derived from CSS tokens and GameArtRegistry.
 *
 * Palette construction rules:
 *  - primary: game token color (e.g. --game-survivor: #06b6d4)
 *  - secondary: complementary shade from GameArtRegistry.accent
 *  - accent: warm accent (gold/pink) for contrast
 *  - bg/bgAlt: sky gradient top/bottom from GameArtRegistry
 *  - ink: unified dark from --color-kawaii-ink (#1d161b)
 *  - highlight: light variant of primary for pop effects
 *  - glow: neon glow token matching the game color
 */
export const PRESETS: Record<GameId, GamePreset> = {
  'survivor': {
    palette: {
      primary: '#06b6d4',
      secondary: '#4ade80',
      accent: '#fbbf24',
      bg: '#0a0a1a',
      bgAlt: '#1a1a3a',
      ink: '#e2e8f0',
      highlight: '#fbbf24',
      glow: '#8b5cf6',
    },
    entityColors: ['#06b6d4', '#22d3ee', '#f472b6', '#fbbf24', '#4ade80'],
    hudColors: {
      hpBar: '#ef4444',
      score: '#fbbf24',
      combo: '#8b5cf6',
    },
    ui: {
      surface: '#1a1a3a',
      accent: '#8b5cf6',
      danger: '#ef4444',
      particle: 'firefly',
    },
  },
  'breakout': {
    palette: {
      primary: '#eab308',
      secondary: '#fbbf24',
      accent: '#f472b6',
      bg: '#0f0f1e',
      bgAlt: '#1a1a3e',
      ink: '#1d161b',
      highlight: '#fde68a',
      glow: '#eab308',
    },
    entityColors: ['#eab308', '#f59e0b', '#fbbf24', '#ec4899', '#f472b6'],
    hudColors: {
      hpBar: '#fbbf24',
      score: '#fde68a',
      combo: '#f472b6',
    },
    ui: {
      surface: 'rgba(15,15,30,0.88)',
      accent: '#eab308',
      danger: '#ef4444',
      particle: 'sparkle',
    },
  },
  'tetris': {
    palette: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      accent: '#818cf8',
      bg: '#0c0a1e',
      bgAlt: '#1e1b4b',
      ink: '#1d161b',
      highlight: '#c4b5fd',
      glow: '#8b5cf6',
    },
    entityColors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6366f1'],
    hudColors: {
      hpBar: '#a78bfa',
      score: '#c4b5fd',
      combo: '#818cf8',
    },
    ui: {
      surface: 'rgba(12,10,30,0.88)',
      accent: '#8b5cf6',
      danger: '#ef4444',
      particle: 'star',
    },
  },
  'snake': {
    palette: {
      primary: '#22c55e',
      secondary: '#4ade80',
      accent: '#22d3ee',
      bg: '#166534',
      bgAlt: '#a7f3d0',
      ink: '#1d161b',
      highlight: '#86efac',
      glow: '#22c55e',
    },
    entityColors: ['#22c55e', '#4ade80', '#86efac', '#f472b6', '#22d3ee'],
    hudColors: {
      hpBar: '#4ade80',
      score: '#86efac',
      combo: '#22d3ee',
    },
    ui: {
      surface: 'rgba(22,101,52,0.88)',
      accent: '#22c55e',
      danger: '#ef4444',
      particle: 'butterfly',
    },
  },
  'game2048': {
    palette: {
      primary: '#f59e0b',
      secondary: '#fde68a',
      accent: '#f97316',
      bg: '#fff7ed',
      bgAlt: '#fef3c7',
      ink: '#1d161b',
      highlight: '#fde68a',
      glow: '#f59e0b',
    },
    entityColors: ['#f59e0b', '#fde68a', '#f97316', '#fb923c', '#fef3c7'],
    hudColors: {
      hpBar: '#fde68a',
      score: '#f59e0b',
      combo: '#f97316',
    },
    ui: {
      surface: 'rgba(255,247,237,0.88)',
      accent: '#f59e0b',
      danger: '#ef4444',
      particle: 'confetti',
    },
  },
  'flappy': {
    palette: {
      primary: '#0891b2',
      secondary: '#fbbf24',
      accent: '#f472b6',
      bg: '#87ceeb',
      bgAlt: '#f0f9ff',
      ink: '#1d161b',
      highlight: '#facc15',
      glow: '#0891b2',
    },
    entityColors: ['#0891b2', '#fbbf24', '#22d3ee', '#f472b6', '#22c55e'],
    hudColors: {
      hpBar: '#f43f5e',
      score: '#facc15',
      combo: '#f472b6',
    },
    ui: {
      surface: 'rgba(240,249,255,0.85)',
      accent: '#facc15',
      danger: '#f43f5e',
      particle: 'cloud',
    },
  },
  'invaders': {
    palette: {
      primary: '#ec4899',
      secondary: '#a78bfa',
      accent: '#f472b6',
      bg: '#07010a',
      bgAlt: '#1e1b4b',
      ink: '#1d161b',
      highlight: '#f9a8d4',
      glow: '#ec4899',
    },
    entityColors: ['#ec4899', '#a78bfa', '#f472b6', '#22d3ee', '#c4b5fd'],
    hudColors: {
      hpBar: '#a78bfa',
      score: '#f472b6',
      combo: '#ec4899',
    },
    ui: {
      surface: 'rgba(7,1,10,0.88)',
      accent: '#ec4899',
      danger: '#ef4444',
      particle: 'star',
    },
  },
  'fruit-catch': {
    palette: {
      primary: '#ef4444',
      secondary: '#f87171',
      accent: '#34d399',
      bg: '#a7f3d0',
      bgAlt: '#166534',
      ink: '#1d161b',
      highlight: '#fca5a5',
      glow: '#ef4444',
    },
    entityColors: ['#ef4444', '#f87171', '#fbbf24', '#34d399', '#fca5a5'],
    hudColors: {
      hpBar: '#f87171',
      score: '#fbbf24',
      combo: '#34d399',
    },
    ui: {
      surface: 'rgba(167,243,208,0.88)',
      accent: '#ef4444',
      danger: '#dc2626',
      particle: 'petal',
    },
  },
  'tower-defense': {
    palette: {
      primary: '#f97316',
      secondary: '#60a5fa',
      accent: '#34d399',
      bg: '#1a1410',
      bgAlt: '#2a2018',
      ink: '#e2e8f0',
      highlight: '#f59e0b',
      glow: '#f97316',
    },
    entityColors: ['#f97316', '#60a5fa', '#34d399', '#fbbf24', '#93c5fd'],
    hudColors: {
      hpBar: '#f97316',
      score: '#f59e0b',
      combo: '#3b82f6',
    },
    ui: {
      surface: 'rgba(30,20,16,0.88)',
      accent: '#f59e0b',
      danger: '#dc2626',
      particle: 'bubble',
    },
  },
  'tic-tac-toe': {
    palette: {
      primary: '#6366f1',
      secondary: '#60a5fa',
      accent: '#f472b6',
      bg: '#ede9fe',
      bgAlt: '#fce7f3',
      ink: '#1d161b',
      highlight: '#a78bfa',
      glow: '#6366f1',
    },
    entityColors: ['#6366f1', '#60a5fa', '#f472b6', '#a78bfa', '#818cf8'],
    hudColors: {
      hpBar: '#60a5fa',
      score: '#f472b6',
      combo: '#a78bfa',
    },
    ui: {
      surface: 'rgba(237,233,254,0.9)',
      accent: '#6366f1',
      danger: '#ef4444',
      particle: 'confetti',
    },
  },
  'memory': {
    palette: {
      primary: '#ec4899',
      secondary: '#c4b5fd',
      accent: '#818cf8',
      bg: '#ede9fe',
      bgAlt: '#fbcfe8',
      ink: '#1d161b',
      highlight: '#f9a8d4',
      glow: '#ec4899',
    },
    entityColors: ['#ec4899', '#c4b5fd', '#f472b6', '#818cf8', '#fda4af'],
    hudColors: {
      hpBar: '#c4b5fd',
      score: '#f472b6',
      combo: '#ec4899',
    },
    ui: {
      surface: 'rgba(237,233,254,0.9)',
      accent: '#ec4899',
      danger: '#ef4444',
      particle: 'sparkle',
    },
  },
  'sudoku': {
    palette: {
      primary: '#14b8a6',
      secondary: '#94a3b8',
      accent: '#0d9488',
      bg: '#f0fdfa',
      bgAlt: '#fef3c7',
      ink: '#1d161b',
      highlight: '#99f6e4',
      glow: '#14b8a6',
    },
    entityColors: ['#14b8a6', '#94a3b8', '#0d9488', '#f59e0b', '#99f6e4'],
    hudColors: {
      hpBar: '#99f6e4',
      score: '#0d9488',
      combo: '#f59e0b',
    },
    ui: {
      surface: 'rgba(240,253,250,0.9)',
      accent: '#14b8a6',
      danger: '#ef4444',
      particle: 'steam',
    },
  },
}

/**
 * Gets the preset for a given game ID.
 * Falls back to 'survivor' as the default if the ID is not recognized.
 */
export function getPresetForGame(gameId: GameId): GamePreset {
  return PRESETS[gameId] ?? PRESETS['survivor']
}

/**
 * Convenience: get a random entity color from a game's palette.
 * Useful for procedurally colored enemies, items, or particles.
 */
export function getRandomEntityColor(gameId: GameId): string {
  const preset = getPresetForGame(gameId)
  return preset.entityColors[Math.floor(Math.random() * preset.entityColors.length)] ?? '#a78bfa'
}

/* ── GameTheme (full design token bag for Canvas bridge) ── */

import { FONT, RADII } from './TypographyPresets'

export interface GameTheme {
  palette: GamePalette
  entityColors: string[]
  hudColors: { hpBar: string; score: string; combo: string }
  font: typeof FONT
  radii: typeof RADII
  /** UI identity tokens for game-specific visual style */
  ui: GameUiTokens
}

export function getGameTheme(gameId: GameId): GameTheme {
  const preset = getPresetForGame(gameId)
  return {
    ...preset,
    font: FONT,
    radii: RADII,
    ui: preset.ui ?? {
      surface: 'rgba(30,20,50,0.85)',
      accent: '#06b6d4',
      danger: '#ef4444',
      particle: 'sparkle',
    },
  }
}
