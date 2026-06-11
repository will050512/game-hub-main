/**
 * Modifier Codex System - Meta-progression for Breakout
 * 
 * Tracks powerup combinations and brick destruction patterns across runs,
 * unlocking permanent modifier bonuses.
 */

export interface ModifierArchetype {
  id: string
  name: string
  description: string
  icon: string
  powerUpIds: string[]
  minBricksDestroyed: number
  minLevel: number
  bonuses: {
    paddleSpeedBonus?: number
    ballSpeedMult?: number
    powerUpDropBonus?: number
    scoreMultiplier?: number
    startingLives?: number
  }
}

export interface DiscoveredModifier {
  archetypeId: string
  discoveredAt: number
  bestScore: number
  timesPlayed: number
  highestLevel: number
}

export interface CurrentRunProgress {
  powerUpsCollected: Set<string>
  bricksDestroyed: number
  levelReached: number
}

/**
 * Pre-defined modifier archetypes
 */
export const MODIFIER_ARCHETYPES: ModifierArchetype[] = [
  {
    id: 'aggressive_breaker',
    name: '暴力破壞者',
    description: '專精於快速破壞和多球',
    icon: 'speed',
    powerUpIds: ['multi_ball', 'speed_ball'],
    minBricksDestroyed: 150,
    minLevel: 5,
    bonuses: {
      ballSpeedMult: 1.08,
      scoreMultiplier: 1.10,
    },
  },
  {
    id: 'precision_master',
    name: '精準大師',
    description: '控制與準確的極致',
    icon: 'target',
    powerUpIds: ['slow_ball', 'wide_paddle', 'sticky_paddle'],
    minBricksDestroyed: 200,
    minLevel: 7,
    bonuses: {
      paddleSpeedBonus: 0.15,
      powerUpDropBonus: 0.12,
    },
  },
  {
    id: 'laser_specialist',
    name: '雷射專家',
    description: '精通雷射破壞',
    icon: 'laser',
    powerUpIds: ['laser'],
    minBricksDestroyed: 120,
    minLevel: 4,
    bonuses: {
      scoreMultiplier: 1.12,
      powerUpDropBonus: 0.08,
    },
  },
  {
    id: 'survivor',
    name: '不屈生存者',
    description: '掌握生存技巧',
    icon: 'heart',
    powerUpIds: ['extra_life', 'slow_ball', 'wide_paddle'],
    minBricksDestroyed: 250,
    minLevel: 8,
    bonuses: {
      startingLives: 1,
      paddleSpeedBonus: 0.10,
    },
  },
  {
    id: 'chaos_lord',
    name: '混沌之王',
    description: '擁抱所有道具',
    icon: 'chaos',
    powerUpIds: ['multi_ball', 'laser', 'speed_ball', 'narrow_paddle'],
    minBricksDestroyed: 300,
    minLevel: 10,
    bonuses: {
      scoreMultiplier: 1.20,
      powerUpDropBonus: 0.15,
      paddleSpeedBonus: 0.12,
    },
  },
  {
    id: 'brick_annihilator',
    name: '磚塊殲滅者',
    description: '純粹的破壞力',
    icon: 'burst',
    powerUpIds: ['multi_ball', 'laser', 'wide_paddle'],
    minBricksDestroyed: 400,
    minLevel: 12,
    bonuses: {
      scoreMultiplier: 1.25,
      ballSpeedMult: 1.10,
      powerUpDropBonus: 0.18,
    },
  },
]

/**
 * Modifier Codex Manager
 */
export class ModifierCodexManager {
  private discoveredModifiers: Map<string, DiscoveredModifier> = new Map()
  private currentRun: CurrentRunProgress = {
    powerUpsCollected: new Set(),
    bricksDestroyed: 0,
    levelReached: 1,
  }

  constructor(savedData?: string) {
    if (savedData) {
      this.loadFromSave(savedData)
    }
  }

  /**
   * Update current run state
   */
  updateCurrentRun(powerUpsCollected: Set<string>, bricksDestroyed: number, levelReached: number) {
    this.currentRun = { powerUpsCollected, bricksDestroyed, levelReached }
  }

  /**
   * Check which archetypes match the current run
   */
  getMatchingArchetypes(): ModifierArchetype[] {
    const matches: ModifierArchetype[] = []

    for (const archetype of MODIFIER_ARCHETYPES) {
      if (this.matchesArchetype(archetype)) {
        matches.push(archetype)
      }
    }

    return matches
  }

  /**
   * Check if current run matches an archetype
   */
  private matchesArchetype(archetype: ModifierArchetype): boolean {
    const hasPowerUps = archetype.powerUpIds.length === 0 || 
      archetype.powerUpIds.every(pid => this.currentRun.powerUpsCollected.has(pid))

    return hasPowerUps && 
           this.currentRun.bricksDestroyed >= archetype.minBricksDestroyed &&
           this.currentRun.levelReached >= archetype.minLevel
  }

  /**
   * Complete a run and discover new archetypes
   */
  completeRun(score: number, level: number): { newDiscoveries: ModifierArchetype[], bonusCoins: number } {
    const matchingArchetypes = this.getMatchingArchetypes()
    const newDiscoveries: ModifierArchetype[] = []
    let bonusCoins = 0

    for (const archetype of matchingArchetypes) {
      const existing = this.discoveredModifiers.get(archetype.id)
      
      if (!existing) {
        this.discoveredModifiers.set(archetype.id, {
          archetypeId: archetype.id,
          discoveredAt: Date.now(),
          bestScore: score,
          timesPlayed: 1,
          highestLevel: level,
        })
        newDiscoveries.push(archetype)
        bonusCoins += 200
      } else {
        existing.timesPlayed++
        if (score > existing.bestScore) {
          existing.bestScore = score
          bonusCoins += 50
        }
        if (level > existing.highestLevel) {
          existing.highestLevel = level
        }
      }
    }

    return { newDiscoveries, bonusCoins }
  }

  /**
   * Get all active bonuses from discovered modifiers
   */
  getActiveBonuses(): {
    paddleSpeedBonus: number
    ballSpeedMult: number
    powerUpDropBonus: number
    scoreMultiplier: number
    startingLives: number
  } {
    const bonuses = {
      paddleSpeedBonus: 0,
      ballSpeedMult: 1,
      powerUpDropBonus: 0,
      scoreMultiplier: 1,
      startingLives: 0,
    }

    const matchingArchetypes = this.getMatchingArchetypes()
    
    for (const archetype of matchingArchetypes) {
      if (this.discoveredModifiers.has(archetype.id)) {
        if (archetype.bonuses.paddleSpeedBonus) bonuses.paddleSpeedBonus += archetype.bonuses.paddleSpeedBonus
        if (archetype.bonuses.ballSpeedMult) bonuses.ballSpeedMult *= archetype.bonuses.ballSpeedMult
        if (archetype.bonuses.powerUpDropBonus) bonuses.powerUpDropBonus += archetype.bonuses.powerUpDropBonus
        if (archetype.bonuses.scoreMultiplier) bonuses.scoreMultiplier *= archetype.bonuses.scoreMultiplier
        if (archetype.bonuses.startingLives) bonuses.startingLives += archetype.bonuses.startingLives
      }
    }

    return bonuses
  }

  /**
   * Get discovered modifiers count
   */
  getDiscoveryCount(): number {
    return this.discoveredModifiers.size
  }

  /**
   * Get total number of archetypes
   */
  getTotalArchetypes(): number {
    return MODIFIER_ARCHETYPES.length
  }

  /**
   * Get all discovered modifiers
   */
  getDiscoveredModifiers(): DiscoveredModifier[] {
    return Array.from(this.discoveredModifiers.values())
  }

  /**
   * Serialize to JSON
   */
  serialize(): string {
    const data = {
      discovered: Array.from(this.discoveredModifiers.entries()),
    }
    return JSON.stringify(data)
  }

  /**
   * Deserialize from JSON
   */
  deserialize(json: string): void {
    this.loadFromSave(json)
  }

  /**
   * Load from saved JSON
   */
  private loadFromSave(json: string) {
    try {
      const data = JSON.parse(json)
      if (data.discovered && Array.isArray(data.discovered)) {
        this.discoveredModifiers = new Map(data.discovered)
      }
    } catch (error) {
      console.warn('Failed to load modifier codex data:', error)
    }
  }
}
