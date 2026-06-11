import { describe, expect, it } from 'vitest'
import { GAME_IDS, type GameId } from '@/types'
import { gameRegistry } from '@/games/registry'
import { gameOptimizationProfiles, getGameOptimizationProfile } from './gameOptimizationProfiles'

const publicImageAssets = import.meta.glob('../../public/images/*', {
  eager: true,
  query: '?raw',
  import: 'default',
})

describe('gameOptimizationProfiles', () => {
  it('covers every registered game exactly once', () => {
    const profileIds = Object.keys(gameOptimizationProfiles).sort()
    expect(profileIds).toEqual([...GAME_IDS].sort())

    for (const gameId of GAME_IDS) {
      const profile = getGameOptimizationProfile(gameId)
      expect(profile.gameId).toBe(gameId)
    }
  })

  it('documents thumbnail, controls, playability checks, deep polish, and touch pattern for each game', () => {
    for (const gameId of GAME_IDS) {
      const profile = getGameOptimizationProfile(gameId)
      expect(profile.thumbnailFocus.trim().length).toBeGreaterThan(10)
      expect(profile.controlChips.length).toBeGreaterThanOrEqual(3)
      expect(profile.playabilityChecks.length).toBeGreaterThanOrEqual(3)
      expect(profile.deepPolish.length).toBeGreaterThanOrEqual(2)
      expect(profile.touchPattern.primary.trim().length).toBeGreaterThan(0)
      expect(profile.touchPattern.hints.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('keeps every thumbnail path backed by a public asset', () => {
    const gamesById = new Map<GameId, string>(gameRegistry.map((game) => [game.id, game.thumbnail]))

    for (const gameId of GAME_IDS) {
      const thumbnail = gamesById.get(gameId)
      expect(thumbnail, `${gameId} has a thumbnail in the registry`).toBeTruthy()

      const relativePath = thumbnail!.replace(/^\//, '')
      const assetKey = `../../public/${relativePath}`
      expect(assetKey in publicImageAssets, `${gameId} thumbnail exists at ${assetKey}`).toBe(true)
    }
  })
})
