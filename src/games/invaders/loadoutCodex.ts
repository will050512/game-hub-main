/**
 * Loadout Codex System - Meta-progression for Invaders
 * 
 * Tracks ship loadout combinations (weapons + formations + shields) across runs
 * and unlocks permanent bonuses when players discover new tactical archetypes.
 */

export interface LoadoutArchetype {
  id: string
  name: string
  description: string
  icon: string
  requiredPowerUps: string[]
  minKills: number
  minWave: number
  bonuses: {
    fireRateBonus?: number
    moveSpeedBonus?: number
    shieldDurationBonus?: number
    powerUpDropBonus?: number
    scoreMultiplier?: number
    startingLives?: number
  }
}

export interface DiscoveredLoadout {
  archetypeId: string
  discoveredAt: number
  bestScore: number
  timesPlayed: number
  highestWave: number
}

export interface CurrentRunLoadout {
  powerUpsCollected: Set<string>
  totalKills: number
  currentWave: number
}

/**
 * Pre-defined loadout archetypes that players can discover
 */
export const LOADOUT_ARCHETYPES: LoadoutArchetype[] = [
  {
    id: 'rapid_assault',
    name: '急速突擊',
    description: '極致火力與速度的完美結合',
    icon: 'speed',
    requiredPowerUps: ['rapid_fire', 'triple_shot'],
    minKills: 50,
    minWave: 3,
    bonuses: {
      fireRateBonus: 0.15,
      moveSpeedBonus: 0.10,
    },
  },
  {
    id: 'fortress_defense',
    name: '堡壘防禦',
    description: '不可摧毀的防禦陣線',
    icon: 'shield',
    requiredPowerUps: ['shield', 'repair'],
    minKills: 40,
    minWave: 3,
    bonuses: {
      shieldDurationBonus: 0.25,
      startingLives: 1,
    },
  },
  {
    id: 'tactical_bomber',
    name: '戰術轟炸',
    description: '清場專家，範圍殺傷',
    icon: 'bomb',
    requiredPowerUps: ['bomb', 'homing'],
    minKills: 60,
    minWave: 4,
    bonuses: {
      powerUpDropBonus: 0.20,
      scoreMultiplier: 0.15,
    },
  },
  {
    id: 'precision_hunter',
    name: '精準獵殺',
    description: '追蹤與三重射擊的致命組合',
    icon: 'target',
    requiredPowerUps: ['homing', 'triple_shot'],
    minKills: 70,
    minWave: 4,
    bonuses: {
      scoreMultiplier: 0.20,
      fireRateBonus: 0.10,
    },
  },
  {
    id: 'berserker_mode',
    name: '狂戰士模式',
    description: '全力進攻，不留餘地',
    icon: 'flame',
    requiredPowerUps: ['rapid_fire', 'triple_shot', 'homing'],
    minKills: 100,
    minWave: 5,
    bonuses: {
      fireRateBonus: 0.20,
      moveSpeedBonus: 0.15,
      scoreMultiplier: 0.25,
    },
  },
  {
    id: 'immortal_guardian',
    name: '不朽守護者',
    description: '生存至上的終極防禦',
    icon: 'fortress',
    requiredPowerUps: ['shield', 'repair', 'bomb'],
    minKills: 80,
    minWave: 5,
    bonuses: {
      startingLives: 2,
      shieldDurationBonus: 0.30,
      powerUpDropBonus: 0.15,
    },
  },
  {
    id: 'support_specialist',
    name: '支援專家',
    description: '修復與防禦的完美平衡',
    icon: 'repair',
    requiredPowerUps: ['repair', 'bomb'],
    minKills: 50,
    minWave: 3,
    bonuses: {
      powerUpDropBonus: 0.25,
      startingLives: 1,
    },
  },
  {
    id: 'ace_pilot',
    name: '王牌飛行員',
    description: '掌握所有武器系統的大師',
    icon: 'crown',
    requiredPowerUps: ['rapid_fire', 'triple_shot', 'shield', 'homing', 'bomb'],
    minKills: 150,
    minWave: 7,
    bonuses: {
      fireRateBonus: 0.25,
      moveSpeedBonus: 0.20,
      scoreMultiplier: 0.30,
      startingLives: 1,
      powerUpDropBonus: 0.20,
    },
  },
]

/**
 * Loadout Codex Manager - handles loadout tracking and archetype matching
 */
export class LoadoutCodexManager {
  private discoveredLoadouts: Map<string, DiscoveredLoadout> = new Map()
  private currentRun: CurrentRunLoadout = {
    powerUpsCollected: new Set(),
    totalKills: 0,
    currentWave: 1,
  }

  constructor(savedData?: string) {
    if (savedData) {
      this.loadFromSave(savedData)
    }
  }

  /**
   * Update current run state
   */
  updateCurrentRun(powerUpsCollected: Set<string>, totalKills: number, currentWave: number) {
    this.currentRun = { powerUpsCollected, totalKills, currentWave }
  }

  /**
   * Check which archetypes match the current loadout
   */
  getMatchingArchetypes(): LoadoutArchetype[] {
    const matches: LoadoutArchetype[] = []

    for (const archetype of LOADOUT_ARCHETYPES) {
      if (this.matchesArchetype(archetype)) {
        matches.push(archetype)
      }
    }

    return matches
  }

  /**
   * Check if current loadout matches an archetype
   */
  private matchesArchetype(archetype: LoadoutArchetype): boolean {
    const hasPowerUps = archetype.requiredPowerUps.every(puid => 
      this.currentRun.powerUpsCollected.has(puid)
    )

    const hasKills = this.currentRun.totalKills >= archetype.minKills
    const hasWave = this.currentRun.currentWave >= archetype.minWave

    return hasPowerUps && hasKills && hasWave
  }

  /**
   * Complete a run and discover new archetypes
   */
  completeRun(score: number, waveNumber: number): { newDiscoveries: LoadoutArchetype[], bonusXp: number } {
    const matchingArchetypes = this.getMatchingArchetypes()
    const newDiscoveries: LoadoutArchetype[] = []
    let bonusXp = 0

    for (const archetype of matchingArchetypes) {
      const existing = this.discoveredLoadouts.get(archetype.id)
      
      if (!existing) {
        this.discoveredLoadouts.set(archetype.id, {
          archetypeId: archetype.id,
          discoveredAt: Date.now(),
          bestScore: score,
          timesPlayed: 1,
          highestWave: waveNumber,
        })
        newDiscoveries.push(archetype)
        bonusXp += 500
      } else {
        existing.timesPlayed++
        if (score > existing.bestScore) {
          existing.bestScore = score
          bonusXp += 100
        }
        if (waveNumber > existing.highestWave) {
          existing.highestWave = waveNumber
        }
      }
    }

    return { newDiscoveries, bonusXp }
  }

  /**
   * Get all active bonuses from discovered loadouts
   */
  getActiveBonuses(): {
    fireRateBonus: number
    moveSpeedBonus: number
    shieldDurationBonus: number
    powerUpDropBonus: number
    scoreMultiplier: number
    startingLives: number
  } {
    const bonuses = {
      fireRateBonus: 0,
      moveSpeedBonus: 0,
      shieldDurationBonus: 0,
      powerUpDropBonus: 0,
      scoreMultiplier: 0,
      startingLives: 0,
    }

    const matchingArchetypes = this.getMatchingArchetypes()
    
    for (const archetype of matchingArchetypes) {
      if (this.discoveredLoadouts.has(archetype.id)) {
        if (archetype.bonuses.fireRateBonus) bonuses.fireRateBonus += archetype.bonuses.fireRateBonus
        if (archetype.bonuses.moveSpeedBonus) bonuses.moveSpeedBonus += archetype.bonuses.moveSpeedBonus
        if (archetype.bonuses.shieldDurationBonus) bonuses.shieldDurationBonus += archetype.bonuses.shieldDurationBonus
        if (archetype.bonuses.powerUpDropBonus) bonuses.powerUpDropBonus += archetype.bonuses.powerUpDropBonus
        if (archetype.bonuses.scoreMultiplier) bonuses.scoreMultiplier += archetype.bonuses.scoreMultiplier
        if (archetype.bonuses.startingLives) bonuses.startingLives += archetype.bonuses.startingLives
      }
    }

    return bonuses
  }

  /**
   * Get discovered loadouts count
   */
  getDiscoveryCount(): number {
    return this.discoveredLoadouts.size
  }

  /**
   * Get total number of archetypes
   */
  getTotalArchetypes(): number {
    return LOADOUT_ARCHETYPES.length
  }

  /**
   * Get all discovered loadouts
   */
  getDiscoveredLoadouts(): DiscoveredLoadout[] {
    return Array.from(this.discoveredLoadouts.values())
  }

  /**
   * Serialize to JSON
   */
  serialize(): string {
    const data = {
      discovered: Array.from(this.discoveredLoadouts.entries()),
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
        this.discoveredLoadouts = new Map(data.discovered)
      }
    } catch (error) {
      console.warn('Failed to load loadout codex data:', error)
    }
  }
}
