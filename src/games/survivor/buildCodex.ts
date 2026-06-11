/**
 * Build Codex System - Meta-progression macro-system for Survivor
 * 
 * Tracks weapon+passive combinations across runs and unlocks permanent bonuses
 * when players discover new build archetypes.
 */

export interface BuildArchetype {
  id: string
  name: string
  description: string
  icon: string
  weaponIds: string[]
  passiveIds: string[]
  minWeaponLevels: number
  minPassiveLevels: number
  bonuses: {
    moveSpeedBonus?: number
    damageBonus?: number
    fireRateBonus?: number
    xpBonus?: number
    startingHpBonus?: number
  }
}

export interface DiscoveredBuild {
  archetypeId: string
  discoveredAt: number
  bestScore: number
  timesPlayed: number
  highestWave: number
}

export interface CurrentRunBuild {
  weaponIds: string[]
  weaponLevels: Map<string, number>
  passiveIds: string[]
  passiveLevels: Map<string, number>
}

/**
 * Pre-defined build archetypes that players can discover
 */
export const BUILD_ARCHETYPES: BuildArchetype[] = [
  {
    id: 'blade_master',
    name: '刀刃大師',
    description: '專精於飛刀與近戰武器',
    icon: 'action',
    weaponIds: ['dagger', 'blade_storm'],
    passiveIds: ['power_up', 'rapid_fire'],
    minWeaponLevels: 8,
    minPassiveLevels: 4,
    bonuses: {
      damageBonus: 0.10,
      fireRateBonus: 0.08,
    },
  },
  {
    id: 'elemental_mage',
    name: '元素法師',
    description: '掌握火焰、冰霜與閃電的力量',
    icon: 'orb',
    weaponIds: ['fireball', 'frost', 'lightning'],
    passiveIds: ['power_up', 'xp_boost'],
    minWeaponLevels: 10,
    minPassiveLevels: 4,
    bonuses: {
      damageBonus: 0.12,
      xpBonus: 0.15,
    },
  },
  {
    id: 'tank_survivor',
    name: '不死坦克',
    description: '強化生命與護甲，持久戰鬥',
    icon: 'shield',
    weaponIds: [],
    passiveIds: ['vitality', 'armor', 'thorns'],
    minWeaponLevels: 4,
    minPassiveLevels: 9,
    bonuses: {
      startingHpBonus: 50,
      damageBonus: 0.05,
    },
  },
  {
    id: 'speed_demon',
    name: '疾風惡魔',
    description: '極致速度與迴避',
    icon: 'speed',
    weaponIds: ['boomerang', 'lightning'],
    passiveIds: ['speed_boost', 'rapid_fire', 'xp_magnet'],
    minWeaponLevels: 6,
    minPassiveLevels: 6,
    bonuses: {
      moveSpeedBonus: 0.15,
      fireRateBonus: 0.10,
    },
  },
  {
    id: 'inferno_lord',
    name: '地獄領主',
    description: '火焰的終極掌控',
    icon: 'flame',
    weaponIds: ['fireball', 'inferno'],
    passiveIds: ['power_up', 'rapid_fire', 'lucky_charm'],
    minWeaponLevels: 12,
    minPassiveLevels: 5,
    bonuses: {
      damageBonus: 0.18,
      fireRateBonus: 0.12,
      xpBonus: 0.10,
    },
  },
  {
    id: 'frost_knight',
    name: '冰霜騎士',
    description: '冰雪的控場專家',
    icon: 'ice',
    weaponIds: ['frost', 'blizzard'],
    passiveIds: ['vitality', 'armor'],
    minWeaponLevels: 10,
    minPassiveLevels: 6,
    bonuses: {
      startingHpBonus: 30,
      damageBonus: 0.12,
    },
  },
  {
    id: 'storm_caller',
    name: '風暴召喚者',
    description: '雷霆與暴風的使者',
    icon: 'storm',
    weaponIds: ['lightning', 'thunderstorm'],
    passiveIds: ['power_up', 'magnet'],
    minWeaponLevels: 10,
    minPassiveLevels: 4,
    bonuses: {
      damageBonus: 0.15,
      xpBonus: 0.12,
    },
  },
  {
    id: 'lucky_gambler',
    name: '幸運賭徒',
    description: '依賴運氣與機率',
    icon: 'lucky',
    weaponIds: [],
    passiveIds: ['lucky_charm', 'xp_boost', 'xp_magnet'],
    minWeaponLevels: 4,
    minPassiveLevels: 9,
    bonuses: {
      xpBonus: 0.25,
      fireRateBonus: 0.08,
    },
  },
]

/**
 * Build Codex Manager - handles build tracking and archetype matching
 */
export class BuildCodexManager {
  private discoveredBuilds: Map<string, DiscoveredBuild> = new Map()
  private currentRun: CurrentRunBuild = {
    weaponIds: [],
    weaponLevels: new Map(),
    passiveIds: [],
    passiveLevels: new Map(),
  }

  constructor(savedData?: string) {
    if (savedData) {
      this.loadFromSave(savedData)
    }
  }

  /**
   * Update current run state
   */
  updateCurrentRun(weaponIds: string[], weaponLevels: Map<string, number>, passiveIds: string[], passiveLevels: Map<string, number>) {
    this.currentRun = { weaponIds, weaponLevels, passiveIds, passiveLevels }
  }

  /**
   * Check which archetypes match the current build
   */
  getMatchingArchetypes(): BuildArchetype[] {
    const matches: BuildArchetype[] = []

    for (const archetype of BUILD_ARCHETYPES) {
      if (this.matchesArchetype(archetype)) {
        matches.push(archetype)
      }
    }

    return matches
  }

  /**
   * Check if current build matches an archetype
   */
  private matchesArchetype(archetype: BuildArchetype): boolean {
    const hasWeapons = archetype.weaponIds.length === 0 || 
      archetype.weaponIds.every(wid => this.currentRun.weaponIds.includes(wid))

    const hasPassives = archetype.passiveIds.length === 0 ||
      archetype.passiveIds.every(pid => this.currentRun.passiveIds.includes(pid))

    const totalWeaponLevels = Array.from(this.currentRun.weaponLevels.values()).reduce((sum, lvl) => sum + lvl, 0)
    const totalPassiveLevels = Array.from(this.currentRun.passiveLevels.values()).reduce((sum, lvl) => sum + lvl, 0)

    return hasWeapons && hasPassives && 
           totalWeaponLevels >= archetype.minWeaponLevels &&
           totalPassiveLevels >= archetype.minPassiveLevels
  }

  /**
   * Complete a run and discover new archetypes
   */
  completeRun(score: number, waveNumber: number): { newDiscoveries: BuildArchetype[], bonusXp: number } {
    const matchingArchetypes = this.getMatchingArchetypes()
    const newDiscoveries: BuildArchetype[] = []
    let bonusXp = 0

    for (const archetype of matchingArchetypes) {
      const existing = this.discoveredBuilds.get(archetype.id)
      
      if (!existing) {
        this.discoveredBuilds.set(archetype.id, {
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
   * Get all active bonuses from discovered builds
   */
  getActiveBonuses(): {
    moveSpeedBonus: number
    damageBonus: number
    fireRateBonus: number
    xpBonus: number
    startingHpBonus: number
  } {
    const bonuses = {
      moveSpeedBonus: 0,
      damageBonus: 0,
      fireRateBonus: 0,
      xpBonus: 0,
      startingHpBonus: 0,
    }

    const matchingArchetypes = this.getMatchingArchetypes()
    
    for (const archetype of matchingArchetypes) {
      if (this.discoveredBuilds.has(archetype.id)) {
        if (archetype.bonuses.moveSpeedBonus) bonuses.moveSpeedBonus += archetype.bonuses.moveSpeedBonus
        if (archetype.bonuses.damageBonus) bonuses.damageBonus += archetype.bonuses.damageBonus
        if (archetype.bonuses.fireRateBonus) bonuses.fireRateBonus += archetype.bonuses.fireRateBonus
        if (archetype.bonuses.xpBonus) bonuses.xpBonus += archetype.bonuses.xpBonus
        if (archetype.bonuses.startingHpBonus) bonuses.startingHpBonus += archetype.bonuses.startingHpBonus
      }
    }

    return bonuses
  }

  /**
   * Get discovered builds count
   */
  getDiscoveryCount(): number {
    return this.discoveredBuilds.size
  }

  /**
   * Get total number of archetypes
   */
  getTotalArchetypes(): number {
    return BUILD_ARCHETYPES.length
  }

  /**
   * Get all discovered builds
   */
  getDiscoveredBuilds(): DiscoveredBuild[] {
    return Array.from(this.discoveredBuilds.values())
  }

  /**
   * Serialize to JSON
   */
  serialize(): string {
    const data = {
      discovered: Array.from(this.discoveredBuilds.entries()),
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
        this.discoveredBuilds = new Map(data.discovered)
      }
    } catch (error) {
      console.warn('Failed to load build codex data:', error)
    }
  }
}
