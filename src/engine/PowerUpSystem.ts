import type { ActiveBuff, PowerUpDef, ItemSlot } from '@/types'

export abstract class PowerUpSystem {
  protected activeBuffs: ActiveBuff[] = []
  protected availableItems: PowerUpDef[] = []
  protected itemSlots: ItemSlot[] = []

  abstract applyEffect(powerUp: PowerUpDef): void
  abstract removeEffect(powerUp: PowerUpDef): void

  activate(powerUp: PowerUpDef): void {
    this.applyEffect(powerUp)

    if (powerUp.durationMs === 0) {
      return
    }

    if (!powerUp.stackable) {
      const existing = this.activeBuffs.find((b) => b.id === powerUp.id)
      if (existing) {
        existing.remainingMs = powerUp.durationMs
        existing.totalMs = powerUp.durationMs
        return
      }
    }

    this.activeBuffs.push({
      id: powerUp.id,
      name: powerUp.name,
      icon: powerUp.icon,
      remainingMs: powerUp.durationMs,
      totalMs: powerUp.durationMs,
      type: this.tierToBuffType(powerUp.tier),
    })
  }

  update(dt: number): void {
    const expired: ActiveBuff[] = []

    for (const buff of this.activeBuffs) {
      buff.remainingMs -= dt
      if (buff.remainingMs <= 0) {
        expired.push(buff)
      }
    }

    for (const buff of expired) {
      const def = this.findDefById(buff.id)
      if (def) {
        this.removeEffect(def)
      }
      const idx = this.activeBuffs.indexOf(buff)
      if (idx !== -1) {
        this.activeBuffs.splice(idx, 1)
      }
    }
  }

  getActiveBuffs(): ActiveBuff[] {
    return this.activeBuffs
  }

  getItemSlots(): ItemSlot[] {
    return this.itemSlots
  }

  canActivate(powerUpId: string): boolean {
    const def = this.findDefById(powerUpId)
    if (!def) return false
    if (def.durationMs === 0) return true
    if (def.stackable) return true
    return true
  }

  /** Weighted random: probability = item.spawnWeight / totalWeight */
  rollDrop(candidates: PowerUpDef[]): PowerUpDef | null {
    if (candidates.length === 0) return null

    const totalWeight = candidates.reduce((sum, c) => sum + c.spawnWeight, 0)
    if (totalWeight <= 0) return null

    let roll = Math.random() * totalWeight

    for (const candidate of candidates) {
      roll -= candidate.spawnWeight
      if (roll <= 0) {
        return candidate
      }
    }

    return candidates[candidates.length - 1] ?? null
  }

  clearAll(): void {
    for (const buff of this.activeBuffs) {
      const def = this.findDefById(buff.id)
      if (def) {
        this.removeEffect(def)
      }
    }
    this.activeBuffs = []
  }

  private findDefById(id: string): PowerUpDef | undefined {
    return this.availableItems.find((item) => item.id === id)
  }

  private tierToBuffType(tier: PowerUpDef['tier']): ActiveBuff['type'] {
    switch (tier) {
      case 'common':
        return 'score'
      case 'rare':
        return 'power'
      case 'epic':
        return 'special'
    }
  }
}
