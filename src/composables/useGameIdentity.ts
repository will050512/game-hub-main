import type { GameId } from '@/types'
import type { GameUiTokens } from '@/engine/art/KawaiiTheme'

// Import preset data directly — pure data, no canvas side effects
import { getPresetForGame } from '@/engine/art/presets/KawaiiPresets'

const uiTokenCache = new Map<string, GameUiTokens>()

/**
 * Get UI identity tokens for a game.
 * Safe to call from Vue components — no canvas side effects.
 */
export function getGameUiTokens(gameId: string): GameUiTokens {
  const cached = uiTokenCache.get(gameId)
  if (cached) return cached

  const preset = getPresetForGame(gameId as GameId)
  const ui = preset.ui ?? {
    surface: 'rgba(30,20,50,0.85)',
    accent: '#06b6d4',
    danger: '#ef4444',
    particle: 'sparkle' as const,
  }
  uiTokenCache.set(gameId, ui)
  return ui
}

/**
 * Get the ambient particle type for a game.
 */
export function getGameParticleType(gameId: string): GameUiTokens['particle'] {
  return getGameUiTokens(gameId).particle
}

/**
 * Get surface/accent/danger colors for a game.
 */
export function getGameIdentityColors(gameId: string): {
  surface: string
  accent: string
  danger: string
  particle: GameUiTokens['particle']
} {
  const ui = getGameUiTokens(gameId)
  return {
    surface: ui.surface,
    accent: ui.accent,
    danger: ui.danger,
    particle: ui.particle,
  }
}

/**
 * Map particle types to CSS decoration properties.
 */
export const PARTICLE_CSS: Record<GameUiTokens['particle'], {
  character: string
  color: string
  animation: string
  size: number
}> = {
  firefly:   { character: '✦', color: '#a7f3d0', animation: 'particle-float',    size: 4 },
  sparkle:   { character: '✦', color: '#fde68a', animation: 'particle-sparkle',  size: 3 },
  butterfly: { character: '🦋', color: '#f0abfc', animation: 'particle-flutter',  size: 10 },
  cloud:     { character: '○', color: 'rgba(255,255,255,0.4)', animation: 'particle-drift', size: 8 },
  star:      { character: '★', color: '#fbbf24', animation: 'particle-twinkle',  size: 5 },
  leaf:      { character: '🍃', color: '#4ade80', animation: 'particle-fall',    size: 8 },
  petal:     { character: '🌸', color: '#f9a8d4', animation: 'particle-fall',    size: 7 },
  bubble:    { character: '○', color: 'rgba(147,197,253,0.5)', animation: 'particle-rise', size: 6 },
  steam:     { character: '~', color: 'rgba(255,255,255,0.3)', animation: 'particle-rise', size: 3 },
  confetti:  { character: '▪', color: '#fbbf24', animation: 'particle-confetti', size: 4 },
}
