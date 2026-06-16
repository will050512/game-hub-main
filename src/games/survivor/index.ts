import { GameEngine } from '@/engine/GameEngine'
import { SpatialHash } from '@/engine/SpatialHash'
import { ObjectPool } from '@/engine/ObjectPool'
import { EffectsManager } from '@/engine/effects'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKawaiiBackground, drawKawaiiProgressBar, drawKawaiiPanel } from '@/engine/kawaiiCanvas'
import { getTheme } from '@/engine/art/KawaiiTheme'
import { audioManager } from './audio'
import {
  WEAPON_DEFS,
  BASE_WEAPONS,
  PASSIVE_DEFS,
  type WeaponDef,
  type PassiveStats,
} from './data'
import { BuildCodexManager } from './buildCodex'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type UpgradeOption,
  type GameHudData,
  type ActiveBuff,
} from '@/types'

interface Entity {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  active: boolean
}

interface Enemy extends Entity {
  hp: number
  maxHp: number
  speed: number
  damage: number
  xpValue: number
  flashTimer: number
  type: 'normal' | 'bat' | 'slime' | 'skeleton' | 'boss'
  shootTimer: number
  pauseTimer: number
}

interface Projectile extends Entity {
  damage: number
  piercing: number
  hitCount: number
  color: string
  lifetime: number
  weaponId: string
  initialLifetime: number
  reversed: boolean
}

interface XpGem extends Entity {
  value: number
}

interface DamageNumber {
  x: number
  y: number
  value: number
  timer: number
  active: boolean
}

// Effects managed by EffectsManager

export const SURVIVOR_VISUAL_TUNING = {
  worldScale: 3.84,
  playerRadius: 36,
  enemyScale: 3.75,
  pickupScale: 4.05,
  projectileScale: 3.75,
} as const

interface OwnedWeapon {
  def: WeaponDef
  level: number
  cooldownTimer: number
}

interface OwnedPassive {
  id: string
  level: number
}

class SurvivorGame extends GameEngine {
  private playerX = 0
  private playerY = 0
  private playerSpeed = 2.5
  private playerHp = 100
  private playerMaxHp = 100
  private playerRadius: number = SURVIVOR_VISUAL_TUNING.playerRadius
  private playerInvulnTimer = 0

  private cameraX = 0
  private cameraY = 0

  private score = 0
  private kills = 0
  private level = 1
  private xp = 0
  private xpToNext = 50
  private gameTime = 0

  private enemies: Enemy[] = []
  private projectiles: Projectile[] = []
  private enemyProjectiles: Projectile[] = []
  private xpGems: XpGem[] = []
  private damageNumbers: DamageNumber[] = []

  private weapons: OwnedWeapon[] = []
  private passives: OwnedPassive[] = []
  private passiveStats: PassiveStats = this.defaultPassiveStats()

  private enemyPool!: ObjectPool<Enemy>
  private projectilePool!: ObjectPool<Projectile>
  private gemPool!: ObjectPool<XpGem>
  private spatialHash!: SpatialHash

  private spawnTimer = 0
  private spawnInterval = 2000
  private difficultyTimer = 0
  private waveNumber = 1
  private bossSpawnTimer = 0
  private bossWarningTimer = 0
  private bossWarningActive = false

  private gameOver = false
  private pendingLevelUp = false

  private buildCodex!: BuildCodexManager

  private theme = getTheme('survivor')
  private effects: EffectsManager = new EffectsManager()
  private comboCount = 0
  private comboTimer = 0
  private killStreak = 0
  private activeArchetypes: string[] = []
  private playerEntranceDone = false
  private idlePhase = 0
  private floorImages: HTMLImageElement[] = []

  protected init() {
    void preloadGameSprites('survivor')
    this.loadFloorTiles()
    this.playerX = this.width / 2
    this.playerY = this.height / 2
    this.playerRadius = SURVIVOR_VISUAL_TUNING.playerRadius

    this.enemyPool = new ObjectPool<Enemy>(
      () => ({
        x: 0, y: 0, vx: 0, vy: 0, radius: 10 * SURVIVOR_VISUAL_TUNING.enemyScale, active: false,
        hp: 10, maxHp: 10, speed: 1, damage: 10, xpValue: 5, flashTimer: 0,
        type: 'normal' as const, shootTimer: 0, pauseTimer: 0,
      }),
      (e) => { e.active = false },
      200,
    )

    this.projectilePool = new ObjectPool<Projectile>(
      () => ({
        x: 0, y: 0, vx: 0, vy: 0, radius: 4 * SURVIVOR_VISUAL_TUNING.projectileScale, active: false,
        damage: 0, piercing: 1, hitCount: 0, color: '#fff', lifetime: 0, weaponId: '',
        initialLifetime: 0, reversed: false,
      }),
      (p) => { p.active = false },
      100,
    )

    this.gemPool = new ObjectPool<XpGem>(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, radius: 5 * SURVIVOR_VISUAL_TUNING.pickupScale, active: false, value: 1 }),
      (g) => { g.active = false },
      300,
    )

    this.spatialHash = new SpatialHash(64)
    this.buildCodex = new BuildCodexManager()

    const startWeapon = WEAPON_DEFS[BASE_WEAPONS[0]!]!
    this.weapons.push({ def: { ...startWeapon }, level: 1, cooldownTimer: 0 })

    this.applyCodexBonuses()

    this.score = 0
    this.kills = 0
    this.level = 1
    this.xp = 0
    this.gameTime = 0
    this.gameOver = false
    this.spawnTimer = 0
    this.spawnInterval = 2400
    this.difficultyTimer = 0
    this.waveNumber = 1
    this.bossSpawnTimer = 0
    this.bossWarningTimer = 0
    this.bossWarningActive = false

    this.effects = new EffectsManager()
    this.comboCount = 0
    this.comboTimer = 0
    this.killStreak = 0
    this.activeArchetypes = []
    this.playerEntranceDone = false
    this.idlePhase = 0
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.effects.triggerShake(intensity, duration)
  }

  private spawnParticles(x: number, y: number, count: number, color: string, speedMult = 1) {
    this.effects.burst(x, y, count, [color, '#ffffff'], { min: 2 * speedMult, max: 8 * speedMult })
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, _scale = 1) {
    this.effects.spawnFloatingText(x, y, text, color)
  }

  private defaultPassiveStats(): PassiveStats {
    return {
      moveSpeedMult: 1,
      damageMult: 1,
      fireRateMult: 1,
      pickupRange: 40,
      maxHpBonus: 0,
      armor: 0,
      xpMult: 1,
      thornsMult: 0,
      magnetSpeedMult: 1,
      luckyChance: 0,
    }
  }

  private recalcPassives() {
    this.passiveStats = this.defaultPassiveStats()
    for (const p of this.passives) {
      const def = PASSIVE_DEFS[p.id]
      if (!def) continue
      for (let i = 0; i < p.level; i++) {
        def.effect(this.passiveStats)
      }
    }
    this.playerMaxHp = 100 + this.passiveStats.maxHpBonus

    this.updateCodexTracking()
  }

  private applyCodexBonuses() {
    const bonuses = this.buildCodex.getActiveBonuses()
    this.playerSpeed += this.playerSpeed * bonuses.moveSpeedBonus
    this.playerMaxHp += bonuses.startingHpBonus
    this.playerHp = this.playerMaxHp
  }

  private updateCodexTracking() {
    const weaponLevels = new Map<string, number>()
    for (const w of this.weapons) {
      weaponLevels.set(w.def.id, w.level)
    }

    const passiveLevels = new Map<string, number>()
    for (const p of this.passives) {
      passiveLevels.set(p.id, p.level)
    }

    this.buildCodex.updateCurrentRun(
      this.weapons.map(w => w.def.id),
      weaponLevels,
      this.passives.map(p => p.id),
      passiveLevels
    )

    const newArchetypes = this.buildCodex.getMatchingArchetypes().map(a => a.id)
    const freshDiscoveries = newArchetypes.filter(id => !this.activeArchetypes.includes(id))
    
    if (freshDiscoveries.length > 0) {
      this.activeArchetypes = newArchetypes
      for (const archetypeId of freshDiscoveries) {
        const archetype = this.buildCodex.getMatchingArchetypes().find(a => a.id === archetypeId)
        if (archetype) {
          this.spawnFloatingText(
            this.playerX, 
            this.playerY - 60, 
            archetype.name,
            '#fbbf24',
            1.5
          )
          this.triggerScreenShake(6, 200)
        }
      }
    }
  }

  private pushHud() {
    const matchingArchetypes = this.buildCodex.getMatchingArchetypes()
    const activeBonuses = this.buildCodex.getActiveBonuses()
    
    const hudData: GameHudData = {
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      kills: this.kills,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: [],
      itemSlots: [],
      currency: 0,
      codexInfo: {
        discoveredBuilds: this.buildCodex.getDiscoveryCount(),
        totalArchetypes: this.buildCodex.getTotalArchetypes(),
        activeArchetypes: matchingArchetypes.map(a => a.name),
        activeBonuses,
      },
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  protected update(dt: number) {
    if (this.gameOver) return

    this.gameTime += dt

    this.updatePlayer(dt)
    this.updateWeapons(dt)
    this.updateProjectiles(dt)
    this.updateEnemyProjectiles(dt)
    this.updateEnemies(dt)
    this.updateXpGems(dt)
    this.updateDamageNumbers(dt)
    this.updateSpawning(dt)
    this.updateDifficulty(dt)
    this.updateCamera()
    this.updateCollisions()
    this.effects.update(dt)

    if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) {
        this.comboCount = 0
      }
    }

    this.callbacks.onScoreUpdate?.(this.score)
    this.callbacks.onStatsUpdate?.({
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      kills: this.kills,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    })
    this.pushHud()
  }

  private updatePlayer(dt: number) {
    const speed = this.playerSpeed * this.passiveStats.moveSpeedMult * (dt / 16.667)
    this.playerX += this.input.moveX * speed
    this.playerY += this.input.moveY * speed

    if (this.playerInvulnTimer > 0) {
      this.playerInvulnTimer -= dt
    }
  }

  private updateCamera() {
    this.cameraX = this.playerX - this.width / 2
    this.cameraY = this.playerY - this.height / 2
  }

  private updateWeapons(dt: number) {
    for (const weapon of this.weapons) {
      weapon.cooldownTimer -= dt
      if (weapon.cooldownTimer <= 0) {
        this.fireWeapon(weapon)
        const rate = weapon.def.fireRate / Math.max(0.2, this.passiveStats.fireRateMult)
        weapon.cooldownTimer = rate
      }
    }
  }

  private fireWeapon(weapon: OwnedWeapon) {
    const nearest = this.findNearestEnemy(weapon.def.range)
    if (!nearest && weapon.def.projectileSpeed > 0) return

    const proj = this.projectilePool.acquire()
    proj.active = true
    proj.x = this.playerX
    proj.y = this.playerY
    proj.damage = weapon.def.damage * (1 + (weapon.level - 1) * 0.3) * this.passiveStats.damageMult
    proj.piercing = weapon.def.piercing + Math.floor(weapon.level / 3)
    proj.hitCount = 0
    proj.radius = weapon.def.projectileSize * SURVIVOR_VISUAL_TUNING.projectileScale
    proj.color = weapon.def.projectileColor
    proj.lifetime = 3000
    proj.initialLifetime = 3000
    proj.reversed = false
    proj.weaponId = weapon.def.id

    if (weapon.def.projectileSpeed === 0) {
      proj.vx = 0
      proj.vy = 0
      proj.lifetime = 500
      proj.initialLifetime = 500
    } else if (nearest) {
      const dx = nearest.x - this.playerX
      const dy = nearest.y - this.playerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      proj.vx = (dx / dist) * weapon.def.projectileSpeed
      proj.vy = (dy / dist) * weapon.def.projectileSpeed
    } else {
      proj.vx = weapon.def.projectileSpeed
      proj.vy = 0
    }

    this.projectiles.push(proj)
    void audioManager.playWeaponFire()
  }

  private findNearestEnemy(range: number): Enemy | null {
    let nearest: Enemy | null = null
    let minDist = range * range
    for (const e of this.enemies) {
      if (!e.active) continue
      const dx = e.x - this.playerX
      const dy = e.y - this.playerY
      const d2 = dx * dx + dy * dy
      if (d2 < minDist) {
        minDist = d2
        nearest = e
      }
    }
    return nearest
  }

  private updateProjectiles(dt: number) {
    const speed = dt / 16.667
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]!
      if (!p.active) {
        this.projectiles.splice(i, 1)
        this.projectilePool.release(p)
        continue
      }

      if (p.weaponId === 'boomerang' && !p.reversed && p.lifetime <= p.initialLifetime / 2) {
        p.vx *= -1
        p.vy *= -1
        p.reversed = true
      }

      p.x += p.vx * speed
      p.y += p.vy * speed
      p.lifetime -= dt

      if (p.vx === 0 && p.vy === 0) {
        p.x = this.playerX
        p.y = this.playerY
      }

      if (p.lifetime <= 0 || p.hitCount >= p.piercing) {
        p.active = false
      }
    }
  }

  private spawnEnemyProjectile(enemy: Enemy, damage: number) {
    const dx = this.playerX - enemy.x
    const dy = this.playerY - enemy.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) return

    const proj = this.projectilePool.acquire()
    proj.active = true
    proj.x = enemy.x
    proj.y = enemy.y
    proj.damage = damage
    proj.piercing = 1
    proj.hitCount = 0
    proj.radius = 5 * SURVIVOR_VISUAL_TUNING.projectileScale
    proj.color = '#d4d4d8'
    proj.lifetime = 3000
    proj.initialLifetime = 3000
    proj.reversed = false
    proj.weaponId = '_enemy'
    proj.vx = (dx / dist) * 4
    proj.vy = (dy / dist) * 4
    this.enemyProjectiles.push(proj)
  }

  private updateEnemyProjectiles(dt: number) {
    const speed = dt / 16.667
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const p = this.enemyProjectiles[i]!
      if (!p.active) {
        this.enemyProjectiles.splice(i, 1)
        this.projectilePool.release(p)
        continue
      }
      p.x += p.vx * speed
      p.y += p.vy * speed
      p.lifetime -= dt

      if (p.lifetime <= 0) {
        p.active = false
        continue
      }

      const dx = p.x - this.playerX
      const dy = p.y - this.playerY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < this.playerRadius + p.radius) {
        this.damagePlayer(p.damage, dt)
        p.active = false
      }
    }
  }

  private updateEnemies(dt: number) {
    const speed = dt / 16.667
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!
      if (!e.active) {
        this.enemies.splice(i, 1)
        this.enemyPool.release(e)
        continue
      }

      const dx = this.playerX - e.x
      const dy = this.playerY - e.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      switch (e.type) {
        case 'bat': {
          if (dist > 1) {
            const nx = dx / dist
            const ny = dy / dist
            const perpX = -ny
            const perpY = nx
            const zigzag = Math.sin(this.gameTime * 0.005) * 2
            e.vx = (nx + perpX * zigzag) * e.speed * speed
            e.vy = (ny + perpY * zigzag) * e.speed * speed
            e.x += e.vx
            e.y += e.vy
          }
          break
        }
        case 'slime': {
          if (e.pauseTimer > 0) {
            e.pauseTimer -= dt
          } else {
            if (dist > 1) {
              e.vx = (dx / dist) * e.speed * speed
              e.vy = (dy / dist) * e.speed * speed
              e.x += e.vx
              e.y += e.vy
            }
            e.shootTimer += dt
            if (e.shootTimer >= 500) {
              e.shootTimer = 0
              e.pauseTimer = 300
              this.spawnEnemyProjectile(e, Math.round(10 + this.waveNumber * 2))
            }
          }
          break
        }
        case 'skeleton': {
          if (dist > 200) {
            if (dist > 1) {
              e.vx = (dx / dist) * e.speed * speed
              e.vy = (dy / dist) * e.speed * speed
              e.x += e.vx
              e.y += e.vy
            }
          }
          e.shootTimer -= dt
          if (e.shootTimer <= 0) {
            e.shootTimer = 2000
            this.spawnEnemyProjectile(e, Math.round(12 + this.waveNumber * 2))
          }
          break
        }
        case 'boss': {
          if (dist > 1) {
            e.vx = (dx / dist) * e.speed * speed
            e.vy = (dy / dist) * e.speed * speed
            e.x += e.vx
            e.y += e.vy
          }
          e.shootTimer -= dt
          if (e.shootTimer <= 0) {
            e.shootTimer = 4000
            const aoeDamage = Math.round(15 + this.waveNumber * 2)
            for (const other of this.enemies) {
              if (!other.active || other === e) continue
            }
            const pdx = this.playerX - e.x
            const pdy = this.playerY - e.y
            const pDist = Math.sqrt(pdx * pdx + pdy * pdy)
            if (pDist < 120) {
              this.damagePlayer(aoeDamage, dt)
            }
            this.spawnDamageNumber(this.playerX, this.playerY - 35, aoeDamage)
          }
          break
        }
        default: {
          if (dist > 1) {
            e.vx = (dx / dist) * e.speed * speed
            e.vy = (dy / dist) * e.speed * speed
            e.x += e.vx
            e.y += e.vy
          }
          break
        }
      }

      if (e.flashTimer > 0) e.flashTimer -= dt

      if (dist < this.playerRadius + e.radius) {
        this.damagePlayer(e.damage, dt)
      }

      const despawnDist = Math.max(this.width, this.height) * 1.5
      if (dist > despawnDist) {
        e.active = false
      }
    }
  }

  private damagePlayer(damage: number, _dt: number) {
    if (this.playerInvulnTimer > 0) return

    const actualDamage = Math.max(1, damage - this.passiveStats.armor)
    this.playerHp -= actualDamage
    this.playerInvulnTimer = 200

    this.spawnDamageNumber(this.playerX, this.playerY - 20, actualDamage)

    if (this.playerHp > 0) {
      void audioManager.playPlayerHurt()
    }

    if (this.passiveStats.thornsMult > 0) {
      const thornsDamage = actualDamage * this.passiveStats.thornsMult
      const thornsRange = this.playerRadius + 30
      for (const e of this.enemies) {
        if (!e.active) continue
        const dx = e.x - this.playerX
        const dy = e.y - this.playerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < thornsRange + e.radius) {
          e.hp -= thornsDamage
          e.flashTimer = 100
          this.spawnDamageNumber(e.x, e.y - 10, Math.round(thornsDamage))
          if (e.hp <= 0) {
            e.active = false
            this.kills++
            this.score += Math.round(e.maxHp)
            this.spawnXpGem(e.x, e.y, e.xpValue)
            this.spawnParticles(e.x, e.y, 8, '#22c55e')
            if (e.type === 'boss') {
              void audioManager.playBossDeath()
            } else {
              void audioManager.playEnemyDeath()
            }
          }
        }
      }
    }

    if (this.playerHp <= 0) {
      this.playerHp = 0
      this.gameOver = true
      this.triggerScreenShake(20, 400)
      this.spawnFloatingText(this.playerX, this.playerY - 40, 'GAME OVER', '#ef4444', 2)
      void audioManager.playGameOver()
      
      const codexResult = this.buildCodex.completeRun(this.score, this.waveNumber)
      if (codexResult.bonusXp > 0) {
        this.callbacks.onCurrencyEarned?.(codexResult.bonusXp, 'codex_discovery')
      }

      this.callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'survivor',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.kills,
          time: Math.floor(this.gameTime / 1000),
          level: this.level,
          coins: 0,
        },
      })

      this.callbacks.onGameOver?.({
        score: this.score,
        kills: this.kills,
        level: this.level,
        time: Math.floor(this.gameTime / 1000),
        wave: this.waveNumber,
        codexDiscoveries: codexResult.newDiscoveries.length,
        codexBonusXp: codexResult.bonusXp,
        newArchetypes: codexResult.newDiscoveries.map(a => a.name),
      })
    }
  }

  private updateXpGems(_dt: number) {
    const pickupR = this.passiveStats.pickupRange
    const magnetSpeed = 5 * this.passiveStats.magnetSpeedMult
    for (let i = this.xpGems.length - 1; i >= 0; i--) {
      const g = this.xpGems[i]!
      if (!g.active) {
        this.xpGems.splice(i, 1)
        this.gemPool.release(g)
        continue
      }

      const dx = this.playerX - g.x
      const dy = this.playerY - g.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < pickupR) {
        g.x += (dx / dist) * magnetSpeed
        g.y += (dy / dist) * magnetSpeed
      }

      if (dist < this.playerRadius + g.radius) {
        g.active = false
        this.spawnParticles(this.playerX, this.playerY, 3, '#22d3ee', 0.5)
        void audioManager.playXpPickup()
        this.gainXp(g.value)
      }
    }
  }

  private gainXp(amount: number) {
    this.xp += Math.round(amount * this.passiveStats.xpMult)
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext
      this.level++
      this.xpToNext = Math.floor(50 * Math.pow(1.15, this.level - 1))
      this.score += 100
      this.triggerScreenShake(8, 150)
      this.spawnFloatingText(this.playerX, this.playerY - 50, `LEVEL ${this.level}!`, '#a855f7', 1.3)
      this.effects.triggerConfetti(30)
      void audioManager.playLevelUp()
      this.callbacks.onCurrencyEarned?.(100, 'levelup')

      if (!this.pendingLevelUp) {
        this.triggerLevelUp()
      }
    }
  }

  private triggerLevelUp() {
    this.pendingLevelUp = true
    this.pause()

    const options = this.generateUpgradeOptions()
    this.callbacks.onLevelUp?.(options, (picked: UpgradeOption) => {
      this.applyUpgrade(picked)
      this.pendingLevelUp = false
      this.resume()
    })
  }

  private generateUpgradeOptions(): UpgradeOption[] {
    const pool: UpgradeOption[] = []

    for (const wid of BASE_WEAPONS) {
      if (!this.weapons.find((w) => w.def.id === wid)) {
        const def = WEAPON_DEFS[wid]!
        const synthInfo = def.synthTarget ? ` (可合成 ${WEAPON_DEFS[def.synthTarget]?.icon})` : ''
        pool.push({
          id: `weapon_new_${wid}`,
          name: def.name,
          description: `獲得新武器 • 傷害 ${def.damage} • 射速 ${(1000/def.fireRate).toFixed(1)}/s${synthInfo}`,
          icon: def.icon,
          type: 'weapon',
          rarity: 'rare',
        })
      }
    }

    for (const w of this.weapons) {
      if (w.level < w.def.maxLevel) {
        const nextDmg = Math.floor(w.def.damage * Math.pow(1.3, w.level))
        const currentDmg = Math.floor(w.def.damage * Math.pow(1.3, w.level - 1))
        const dmgIncrease = nextDmg - currentDmg
        pool.push({
          id: `weapon_up_${w.def.id}`,
          name: `${w.def.name} Lv.${w.level + 1}`,
          description: `傷害 ${currentDmg} 到 ${nextDmg} (+${dmgIncrease})`,
          icon: w.def.icon,
          type: 'weapon',
          rarity: w.level >= 3 ? 'epic' : 'common',
        })
      }
      if (w.level >= w.def.maxLevel && w.def.synthTarget) {
        const synthDef = WEAPON_DEFS[w.def.synthTarget]
        if (synthDef && !this.weapons.find((ow) => ow.def.id === synthDef.id)) {
          pool.push({
            id: `weapon_synth_${w.def.id}`,
            name: synthDef.name,
            description: `${w.def.name} 進化為 ${synthDef.name}`,
            icon: synthDef.icon,
            type: 'synthesis',
            rarity: 'legendary',
          })
        }
      }
    }

    for (const pid of Object.keys(PASSIVE_DEFS)) {
      if (!this.passives.find((p) => p.id === pid)) {
        const def = PASSIVE_DEFS[pid]!
        pool.push({
          id: `passive_new_${pid}`,
          name: def.name,
          description: def.description,
          icon: def.icon,
          type: 'passive',
          rarity: 'common',
        })
      }
    }

    for (const p of this.passives) {
      const def = PASSIVE_DEFS[p.id]
      if (def && p.level < def.maxLevel) {
        pool.push({
          id: `passive_up_${p.id}`,
          name: `${def.name} Lv.${p.level + 1}`,
          description: `${def.description} (強化效果)`,
          icon: def.icon,
          type: 'passive',
          rarity: p.level >= 3 ? 'epic' : 'common',
        })
      }
    }

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
    }

    pool.sort((a, b) => {
      const order = { legendary: 0, epic: 1, rare: 2, common: 3 }
      return order[a.rarity] - order[b.rarity]
    })

    const result = pool.slice(0, 3)

    if (this.passiveStats.luckyChance > 0) {
      for (const opt of result) {
        if (Math.random() < this.passiveStats.luckyChance) {
          if (opt.rarity === 'common') {
            opt.rarity = 'rare'
          } else if (opt.rarity === 'rare') {
            opt.rarity = 'epic'
          }
        }
      }
    }

    return result
  }

  private applyUpgrade(option: UpgradeOption) {
    const parts = option.id.split('_')
    const category = parts[0]
    const action = parts[1]
    const itemId = parts.slice(2).join('_')

    if (category === 'weapon') {
      if (action === 'new') {
        const def = WEAPON_DEFS[itemId]
        if (def) {
          this.weapons.push({ def: { ...def }, level: 1, cooldownTimer: 0 })
        }
      } else if (action === 'up') {
        const weapon = this.weapons.find((w) => w.def.id === itemId)
        if (weapon) {
          weapon.level++
        }
      } else if (action === 'synth') {
        const weaponIdx = this.weapons.findIndex((w) => w.def.id === itemId)
        if (weaponIdx !== -1) {
          const baseWeapon = this.weapons[weaponIdx]!
          const synthId = baseWeapon.def.synthTarget
          if (synthId) {
            const synthDef = WEAPON_DEFS[synthId]
            if (synthDef) {
              this.weapons[weaponIdx] = { def: { ...synthDef }, level: 1, cooldownTimer: 0 }
            }
          }
        }
      }
      this.updateCodexTracking()
    } else if (category === 'passive') {
      if (action === 'new') {
        this.passives.push({ id: itemId, level: 1 })
      } else if (action === 'up') {
        const passive = this.passives.find((p) => p.id === itemId)
        if (passive) {
          passive.level++
        }
      }
      this.recalcPassives()
    }
  }

  private updateCollisions() {
    this.spatialHash.clear()
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i]!
      if (e.active) this.spatialHash.insert(i, e.x, e.y)
    }

    for (const p of this.projectiles) {
      if (!p.active) continue
      const nearby = this.spatialHash.query(p.x, p.y, p.radius + 20)
      for (const idx of nearby) {
        const e = this.enemies[idx]
        if (!e?.active) continue
        const dx = p.x - e.x
        const dy = p.y - e.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < p.radius + e.radius) {
          e.hp -= p.damage
          e.flashTimer = 100
          p.hitCount++

          this.spawnDamageNumber(e.x, e.y - 10, Math.round(p.damage))

          if (e.hp <= 0) {
            e.active = false
            this.kills++
            this.killStreak++
            this.comboCount++
            this.comboTimer = 2000
            this.score += Math.round(e.maxHp)
            this.spawnXpGem(e.x, e.y, e.xpValue)
            this.effects.comboHit()

            const enemyColor = e.type === 'boss' ? '#991b1b' : e.type === 'bat' ? '#7c3aed' : e.type === 'slime' ? '#22c55e' : e.type === 'skeleton' ? '#d4d4d8' : '#ef4444'
            this.spawnParticles(e.x, e.y, e.type === 'boss' ? 30 : 12, enemyColor)

            if (e.type === 'boss') {
              void audioManager.playBossDeath()
            } else {
              void audioManager.playEnemyDeath()
            }

            if (e.type === 'boss') {
              this.triggerScreenShake(15, 300)
              this.spawnFloatingText(e.x, e.y - 50, 'BOSS DOWN!', '#fbbf24', 1.5)
            } else if (this.comboCount >= 5) {
              this.spawnFloatingText(e.x, e.y - 30, `${this.comboCount}x`, '#fbbf24', 1.2)
            }
          } else {
            void audioManager.playEnemyHit()
          }

          if (p.hitCount >= p.piercing) {
            p.active = false
            break
          }
        }
      }
    }
  }

  private spawnXpGem(x: number, y: number, value: number) {
    const gem = this.gemPool.acquire()
    gem.active = true
    gem.x = x + (Math.random() - 0.5) * 10
    gem.y = y + (Math.random() - 0.5) * 10
    gem.value = value
    gem.radius = Math.min(4 + value, 8) * SURVIVOR_VISUAL_TUNING.pickupScale
    this.xpGems.push(gem)
  }

  private spawnDamageNumber(x: number, y: number, value: number) {
    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      value,
      timer: 800,
      active: true,
    })
  }

  private updateDamageNumbers(dt: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i]!
      d.timer -= dt
      d.y -= 0.5
      if (d.timer <= 0) {
        this.damageNumbers.splice(i, 1)
      }
    }
  }

  private updateSpawning(dt: number) {
    this.spawnTimer += dt
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0
      const count = Math.min(this.waveNumber, 15)
      for (let i = 0; i < count; i++) {
        this.spawnEnemy()
      }
    }

    this.bossSpawnTimer += dt
    const bossInterval = 300000
    const warningTime = 10000
    
    if (this.bossSpawnTimer >= bossInterval - warningTime && !this.bossWarningActive) {
      this.bossWarningActive = true
      this.bossWarningTimer = 0
      this.spawnFloatingText(this.playerX, this.playerY - 100, 'BOSS INCOMING', '#ef4444', 2)
      this.triggerScreenShake(10, 500)
      void audioManager.playBossSpawn()
    }
    
    if (this.bossWarningActive) {
      this.bossWarningTimer += dt
    }
    
    if (this.bossSpawnTimer >= bossInterval) {
      this.bossSpawnTimer = 0
      this.bossWarningActive = false
      this.bossWarningTimer = 0
      this.spawnBoss()
    }
  }

  private spawnEnemy() {
    const angle = Math.random() * Math.PI * 2
    const spawnDist = Math.max(this.width, this.height) * 0.6
    const x = this.playerX + Math.cos(angle) * spawnDist
    const y = this.playerY + Math.sin(angle) * spawnDist

    const earlyWave = Math.min(this.waveNumber, 3)
    const wave = this.waveNumber <= 3 ? earlyWave * 0.72 : this.waveNumber
    const hpMult = 1 + (this.waveNumber - 1) * (this.waveNumber <= 3 ? 0.2 : 0.3)

    const roll = Math.random()
    const skeletonChance = this.gameTime > 60000 ? 0.10 : 0
    let enemyType: Enemy['type']
    if (roll < 0.25) {
      enemyType = 'bat'
    } else if (roll < 0.50) {
      enemyType = 'slime'
    } else if (roll < 0.50 + skeletonChance) {
      enemyType = 'skeleton'
    } else {
      enemyType = 'normal'
    }

    const e = this.enemyPool.acquire()
    e.active = true
    e.x = x
    e.y = y
    e.flashTimer = 0
    e.shootTimer = 0
    e.pauseTimer = 0
    e.type = enemyType

    switch (enemyType) {
      case 'bat':
        e.hp = Math.round(10 * hpMult)
        e.maxHp = e.hp
        e.speed = 1.2 + wave * 0.06
        e.damage = Math.round(5 + wave * 0.9)
        e.xpValue = Math.round(4 + wave * 0.3)
        e.radius = 8 * SURVIVOR_VISUAL_TUNING.enemyScale
        break
      case 'slime':
        e.hp = Math.round(25 * hpMult)
        e.maxHp = e.hp
        e.speed = 0.6 + wave * 0.04
        e.damage = Math.round(10 + wave * 1.7)
        e.xpValue = Math.round(6 + wave * 0.5)
        e.radius = 14 * SURVIVOR_VISUAL_TUNING.enemyScale
        e.pauseTimer = 0
        break
      case 'skeleton':
        e.hp = Math.round(18 * hpMult)
        e.maxHp = e.hp
        e.speed = 0.9 + wave * 0.04
        e.damage = Math.round(4 + wave * 0.85)
        e.xpValue = Math.round(8 + wave * 0.5)
        e.radius = 11 * SURVIVOR_VISUAL_TUNING.enemyScale
        e.shootTimer = 2000
        break
      default: // normal
        e.hp = Math.round(15 * hpMult)
        e.maxHp = e.hp
        e.speed = 0.8 + Math.random() * 0.5 + wave * 0.05
        e.damage = Math.round(7 + wave * 1.25)
        e.xpValue = Math.round(3 + wave * 0.5)
        e.radius = (10 + Math.random() * 4) * SURVIVOR_VISUAL_TUNING.enemyScale
        break
    }

    this.enemies.push(e)
  }

  private spawnBoss() {
    const angle = Math.random() * Math.PI * 2
    const spawnDist = Math.max(this.width, this.height) * 0.6
    const x = this.playerX + Math.cos(angle) * spawnDist
    const y = this.playerY + Math.sin(angle) * spawnDist

    const hpMult = 1 + (this.waveNumber - 1) * 0.3
    const wave = this.waveNumber

    const e = this.enemyPool.acquire()
    e.active = true
    e.x = x
    e.y = y
    e.type = 'boss'
    e.hp = Math.round(200 * hpMult)
    e.maxHp = e.hp
    e.speed = 0.4
    e.damage = Math.round(20 + wave * 3)
    e.xpValue = Math.round(50 + wave * 5)
    e.radius = 30 * SURVIVOR_VISUAL_TUNING.enemyScale
    e.flashTimer = 0
    e.shootTimer = 4000
    e.pauseTimer = 0
    this.enemies.push(e)
    void audioManager.playBossSpawn()
  }

  private updateDifficulty(dt: number) {
    this.difficultyTimer += dt
    const waveInterval = this.waveNumber < 3 ? 20000 : 15000
    if (this.difficultyTimer >= waveInterval) {
      this.difficultyTimer = 0
      this.waveNumber++
      this.spawnInterval = Math.max(500, this.spawnInterval - (this.waveNumber <= 3 ? 80 : 100))
    }
  }

  protected render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.clearRect(0, 0, this.width, this.height)

    this.effects.shake.apply(ctx)

    this.renderGrid(ctx)

    ctx.translate(this.width / 2, this.height / 2)
    ctx.scale(SURVIVOR_VISUAL_TUNING.worldScale, SURVIVOR_VISUAL_TUNING.worldScale)
    ctx.translate(-this.width / 2, -this.height / 2)
    ctx.translate(-this.cameraX, -this.cameraY)

    this.renderIdleAnimation()
    this.renderXpGems(ctx)
    this.renderEnemies(ctx)
    this.renderProjectiles(ctx)
    this.renderEnemyProjectiles(ctx)
    this.effects.render(ctx)
    this.renderPlayer(ctx)
    this.renderDamageNumbers(ctx)

    ctx.restore()

    this.renderKawaiiHud(ctx)
    this.renderJoystick(ctx)
    this.renderComboText(ctx)
    this.renderBossWarning(ctx)
  }

  private renderIdleAnimation(): void {
    const time = performance.now()
    this.idlePhase = Math.sin(time * 0.003) * 1.5
  }

  private renderKawaiiHud(ctx: CanvasRenderingContext2D) {
    const hud = this.pushHudAndGetHud()
    const scale = this.dpr
    const t = this.theme
    const barWidth = Math.floor(this.width * 0.18)
    const barHeight = Math.floor(10 * scale)
    const padding = Math.floor(10 * scale)

    // HP bar
    drawKawaiiPanel(ctx, padding, padding, barWidth + padding * 4, barHeight + padding * 2, {
      fill: 'rgba(12,18,34,0.85)',
      accent: t.hudColors.hpBar,
      stroke: t.palette.ink,
      radius: Math.floor(6 * scale),
    })
    drawKawaiiProgressBar(ctx, padding + padding * 2, padding + padding * 0.5, barWidth, barHeight, this.playerHp / this.playerMaxHp, { fill: t.hudColors.hpBar, trackFill: '#7f1d1d' })

    // XP bar
    drawKawaiiPanel(ctx, padding, padding + barHeight + padding * 3, barWidth + padding * 4, barHeight + padding * 2, {
      fill: 'rgba(12,18,34,0.85)',
      accent: t.hudColors.score,
      stroke: t.palette.ink,
      radius: Math.floor(6 * scale),
    })
    drawKawaiiProgressBar(ctx, padding + padding * 2, padding + barHeight + padding * 3.5, barWidth, barHeight, this.xp / this.xpToNext, { fill: t.palette.highlight, trackFill: '#1e3a5f' })

    // Level badge
    const badgeY = padding * 2
    const badgeX = barWidth + padding * 4.5
    drawKawaiiPanel(ctx, badgeX, badgeY, Math.floor(70 * scale), Math.floor(32 * scale), {
      fill: 'rgba(251,191,36,0.15)',
      accent: t.palette.highlight,
      stroke: t.palette.highlight,
      radius: Math.floor(8 * scale),
    })
    ctx.fillStyle = t.palette.highlight
    ctx.font = `bold ${Math.floor(14 * scale)}px ${t.font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`Lv.${this.level}`, badgeX + Math.floor(35 * scale), badgeY + Math.floor(16 * scale))

    // Time & Score
    ctx.textAlign = 'right'
    ctx.fillStyle = t.palette.highlight
    ctx.font = `${Math.floor(12 * scale)}px ${t.font.family}`
    const mins = Math.floor(hud.time / 60)
    const secs = String(hud.time % 60).padStart(2, '0')
    ctx.fillText(`${mins}:${secs}`, this.width - padding, padding + Math.floor(14 * scale))
    ctx.fillStyle = t.palette.highlight + '99'
    ctx.font = `${Math.floor(10 * scale)}px ${t.font.family}`
    ctx.fillText(`Score: ${hud.score}`, this.width - padding, padding + Math.floor(28 * scale))

    ctx.textAlign = 'start'
  }

  private pushHudAndGetHud(): GameHudData {
    const matchingArchetypes = this.buildCodex.getMatchingArchetypes()
    const activeBonuses = this.buildCodex.getActiveBonuses()

    const hudData: GameHudData = {
      hp: this.playerHp,
      maxHp: this.playerMaxHp,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      kills: this.kills,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: [],
      itemSlots: [],
      currency: 0,
      codexInfo: {
        discoveredBuilds: this.buildCodex.getDiscoveryCount(),
        totalArchetypes: this.buildCodex.getTotalArchetypes(),
        activeArchetypes: matchingArchetypes.map(a => a.name),
        activeBonuses,
      },
    }
    this.callbacks.onHudUpdate?.(hudData)
    return hudData
  }

  private renderBossWarning(ctx: CanvasRenderingContext2D) {
    if (!this.bossWarningActive) return
    const t = this.theme
    
    const pulseAlpha = 0.3 + Math.sin(this.bossWarningTimer * 0.01) * 0.2
    ctx.globalAlpha = pulseAlpha
    ctx.fillStyle = t.ui.danger
    ctx.fillRect(0, 0, this.width, 8)
    ctx.fillRect(0, this.height - 8, this.width, 8)
    ctx.fillRect(0, 0, 8, this.height)
    ctx.fillRect(this.width - 8, 0, 8, this.height)
    
    ctx.globalAlpha = 1
    ctx.fillStyle = t.ui.danger
    ctx.font = `bold ${Math.round(24 * this.dpr)}px ${t.font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowBlur = 10
    ctx.shadowColor = t.ui.danger
    ctx.fillText('BOSS INCOMING', this.width / 2, this.height * 0.15)
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
  }



  private renderComboText(ctx: CanvasRenderingContext2D) {
    if (this.comboCount < 2) return
    const t = this.theme
    const text = `${this.comboCount}x COMBO!`
    const scale = Math.min(2, 1 + this.comboCount * 0.1)
    const fontSize = Math.round(18 * scale * this.dpr)
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = 0.9
    ctx.fillStyle = '#fbbf24'
    ctx.shadowBlur = 10
    ctx.shadowColor = '#fbbf24'
    ctx.font = `bold ${fontSize}px ${t.font.family}`
    ctx.fillText(text, this.width / 2, this.height * 0.25)
    ctx.restore()
  }

  private renderGrid(ctx: CanvasRenderingContext2D) {
    const t = this.theme
    ctx.save()
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    drawKawaiiBackground(ctx, this.width, this.height, this.gameTime, {
      base: t.palette.bg,
      soft: t.ui.surface,
      accent: t.palette.primary,
      ink: t.palette.highlight,
      blush: t.ui.accent,
    })
    this.renderDungeonTiles(ctx)
    ctx.restore()
  }

  private loadFloorTiles() {
    const tilePaths = [
      '/assets/sprites/dungeon/tile_0040.png',
      '/assets/sprites/dungeon/tile_0041.png',
    ]
    for (const path of tilePaths) {
      const img = new Image()
      img.src = path
      img.onload = () => {
        this.floorImages.push(img)
      }
    }
  }

  private renderDungeonTiles(ctx: CanvasRenderingContext2D) {
    if (this.floorImages.length === 0) return
    const tileSize = 24
    const offsetX = -this.cameraX % tileSize
    const offsetY = -this.cameraY % tileSize
    const cols = Math.ceil(this.width / tileSize) + 2
    const rows = Math.ceil(this.height / tileSize) + 2
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const tileIdx = (row + col) % this.floorImages.length
        const img = this.floorImages[tileIdx]
        if (!img) continue
        const x = col * tileSize + offsetX
        const y = row * tileSize + offsetY
        const tileRow = Math.floor((row + col) / this.floorImages.length)
        const alpha = 0.22 + (tileRow % 3) * 0.04
        ctx.globalAlpha = alpha
        ctx.drawImage(img, x, y, tileSize, tileSize)
      }
    }
    ctx.globalAlpha = 1
  }

  private renderPlayer(ctx: CanvasRenderingContext2D) {
    const blink = this.playerInvulnTimer > 0 && Math.floor(this.playerInvulnTimer / 50) % 2 === 0
    if (blink) return

    const x = this.playerX
    const y = this.playerY + this.idlePhase
    const r = this.playerRadius

    const scale = (r * 2) / 48
    if (drawSprite(ctx, 'survivor.player', { x, y, scale })) return

    ctx.fillStyle = '#8b5cf6'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  private renderEnemies(ctx: CanvasRenderingContext2D) {
    const enemyColors: Record<string, string> = {
      bat: '#7c3aed',
      slime: '#22c55e',
      skeleton: '#d4d4d8',
      boss: '#991b1b',
      normal: '#ef4444',
    }

    for (const e of this.enemies) {
      if (!e.active) continue
      if (!this.isVisible(e.x, e.y, e.radius + 5)) continue

      const x = e.x
      const y = e.y
      const r = e.radius

      if (e.flashTimer > 0) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        continue
      }

      const spriteId =
        e.type === 'bat' ? 'survivor.enemy-bat' :
        e.type === 'slime' ? 'survivor.enemy-slime' :
        e.type === 'skeleton' ? 'survivor.enemy-skeleton' :
        e.type === 'boss' ? 'survivor.enemy-boss' :
        'survivor.enemy-normal'
      const designSize = e.type === 'boss' ? 80 : e.type === 'slime' ? 36 : e.type === 'bat' ? 28 : 32
      const spriteScale = (r * 2) / designSize
      const drewSprite = drawSprite(ctx, spriteId, { x, y, scale: spriteScale })

      if (!drewSprite) {
        ctx.fillStyle = enemyColors[e.type] ?? '#ef4444'
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      if (e.hp >= e.maxHp) continue

      ctx.save()
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

      const hpPercent = e.hp / e.maxHp
      const barW = e.type === 'boss' ? r * 2.5 : r * 2
      const barH = e.type === 'boss' ? 6 : 4
      const barX = (x - this.cameraX) - barW / 2
      const barY = (y - this.cameraY) - r - (e.type === 'boss' ? 28 : 8)

      drawKawaiiProgressBar(ctx, barX, barY, barW, barH, hpPercent, {
        trackFill: 'rgba(0,0,0,0.6)',
      })
      ctx.restore()
    }
  }

  private renderProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.projectiles) {
      if (!p.active) continue

      if (p.vx === 0 && p.vy === 0) {
        ctx.globalAlpha = 0.3
        const scale = (p.radius * 2) / 16
        if (!drawSprite(ctx, 'survivor.projectile', { x: p.x, y: p.y, scale })) {
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        continue
      }

      const scale = (p.radius * 2) / 16
      if (drawSprite(ctx, 'survivor.projectile', { x: p.x, y: p.y, scale })) continue

      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private renderEnemyProjectiles(ctx: CanvasRenderingContext2D) {
    for (const p of this.enemyProjectiles) {
      if (!p.active) continue

      const scale = (p.radius * 2) / 16
      if (drawSprite(ctx, 'survivor.enemy-projectile', { x: p.x, y: p.y, scale })) continue

      // Fallback: red glow orb
      ctx.shadowBlur = 8
      ctx.shadowColor = '#f87171'
      ctx.fillStyle = '#f87171'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.beginPath()
      ctx.arc(p.x - p.radius * 0.25, p.y - p.radius * 0.25, p.radius * 0.3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private renderXpGems(ctx: CanvasRenderingContext2D) {
    for (const g of this.xpGems) {
      if (!g.active) continue
      if (!this.isVisible(g.x, g.y, g.radius + 3)) continue

      const scale = (g.radius * 2) / 20
      if (drawSprite(ctx, 'survivor.xp-gem', { x: g.x, y: g.y, scale })) continue

      ctx.fillStyle = '#22d3ee'
      ctx.beginPath()
      const r = g.radius
      ctx.moveTo(g.x, g.y - r)
      ctx.lineTo(g.x + r * 0.7, g.y)
      ctx.lineTo(g.x, g.y + r)
      ctx.lineTo(g.x - r * 0.7, g.y)
      ctx.closePath()
      ctx.fill()
    }
  }

  private renderDamageNumbers(ctx: CanvasRenderingContext2D) {
    const t = this.theme
    for (const d of this.damageNumbers) {
      const alpha = Math.min(1, d.timer / 300)
      ctx.globalAlpha = alpha
      ctx.fillStyle = t.palette.highlight
      ctx.font = `bold ${14}px ${t.font.family}`
      ctx.textAlign = 'center'
      ctx.fillText(d.value.toString(), d.x, d.y)
    }
    ctx.globalAlpha = 1
  }

  private renderJoystick(ctx: CanvasRenderingContext2D) {
    if (!this.input.isJoystickActive) return

    const origin = this.input.joystickOrigin
    const ox = origin.x * this.dpr
    const oy = origin.y * this.dpr
    const maxR = 50 * this.dpr

    ctx.globalAlpha = 0.3
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(ox, oy, maxR, 0, Math.PI * 2)
    ctx.fill()

    const knobX = ox + this.input.moveX * maxR * 0.6
    const knobY = oy + this.input.moveY * maxR * 0.6
    ctx.globalAlpha = 0.6
    ctx.fillStyle = '#8b5cf6'
    ctx.beginPath()
    ctx.arc(knobX, knobY, maxR * 0.35, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1
  }

  private isVisible(x: number, y: number, margin: number): boolean {
    return (
      x + margin > this.cameraX &&
      x - margin < this.cameraX + this.width &&
      y + margin > this.cameraY &&
      y - margin < this.cameraY + this.height
    )
  }

  serializeState(): string {
    const state = {
      playerX: this.playerX,
      playerY: this.playerY,
      playerHp: this.playerHp,
      playerMaxHp: this.playerMaxHp,
      playerRadius: this.playerRadius,
      score: this.score,
      kills: this.kills,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      gameTime: this.gameTime,
      waveNumber: this.waveNumber,
      weapons: this.weapons.map(w => ({ id: w.def.id, level: w.level })),
      passives: this.passives.map(p => ({ id: p.id, level: p.level })),
      spawnTimer: this.spawnTimer,
      spawnInterval: this.spawnInterval,
      difficultyTimer: this.difficultyTimer,
      bossSpawnTimer: this.bossSpawnTimer,
      codex: this.buildCodex.serialize(),
    }
    return JSON.stringify(state)
  }

  deserializeState(json: string): boolean {
    try {
      const state = JSON.parse(json)
      this.playerX = state.playerX ?? this.width / 2
      this.playerY = state.playerY ?? this.height / 2
      this.playerHp = state.playerHp ?? 100
      this.playerMaxHp = state.playerMaxHp ?? 100
      this.playerRadius = Math.max(state.playerRadius ?? SURVIVOR_VISUAL_TUNING.playerRadius, SURVIVOR_VISUAL_TUNING.playerRadius)
      this.score = state.score ?? 0
      this.kills = state.kills ?? 0
      this.level = state.level ?? 1
      this.xp = state.xp ?? 0
      this.xpToNext = state.xpToNext ?? 50
      this.gameTime = state.gameTime ?? 0
      this.waveNumber = state.waveNumber ?? 1
      this.spawnTimer = state.spawnTimer ?? 0
      this.spawnInterval = state.spawnInterval ?? 2000
      this.difficultyTimer = state.difficultyTimer ?? 0
      this.bossSpawnTimer = state.bossSpawnTimer ?? 0

      if (state.codex) {
        this.buildCodex.deserialize(state.codex)
      }

      if (state.weapons) {
        this.weapons = state.weapons.map((w: { id: string; level: number }) => {
          const def = WEAPON_DEFS[w.id]
          return def ? { def: { ...def }, level: w.level, cooldownTimer: 0 } : null
        }).filter(Boolean)
      }

      if (state.passives) {
        this.passives = state.passives
        this.recalcPassives()
      }

      this.enemies = []
      this.projectiles = []
      this.enemyProjectiles = []
      this.xpGems = []

      return true
    } catch {
      return false
    }
  }
}

export function createSurvivorGame(): GameInstance {
  return new SurvivorGame()
}
