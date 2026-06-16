import { GameEngine } from '@/engine/GameEngine'
import { REWARD_EVENT_SCHEMA_VERSION, createRewardPayload, type PlayerStats, type GameHudData, type GameInstance } from '@/types'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKawaiiButton, drawKawaiiInlineLabel, drawKawaiiPanel, drawKawaiiProgressBar } from '@/engine/kawaiiCanvas'
import { EffectsManager } from '@/engine/effects'
import { getTheme } from '@/engine/art/KawaiiTheme'
import { GameOverlay } from '@/engine/GameOverlay'

interface Tower {
  x: number
  y: number
  range: number
  damage: number
  fireRate: number
  fireTimer: number
  level: number
  type: 'basic' | 'sniper' | 'splash'
  color: string
  angle: number
  synergyBonus: number
  adjacentTowers: number
}

interface Enemy {
  x: number
  y: number
  hp: number
  maxHp: number
  speed: number
  pathIndex: number
  reward: number
  type: 'normal' | 'fast' | 'tank' | 'boss' | 'elite'
  color: string
  radius: number
  alive: boolean
  isElite: boolean
  eliteModifier?: 'armored' | 'swift' | 'regenerating' | 'explosive'
}

interface Projectile {
  x: number
  y: number
  targetX: number
  targetY: number
  speed: number
  damage: number
  splash: boolean
  splashRadius: number
  color: string
  active: boolean
}

type GamePhase = 'menu' | 'playing' | 'gameover' | 'waveComplete'

class TowerDefenseGame extends GameEngine {
  private towers: Tower[] = []
  private enemies: Enemy[] = []
  private projectiles: Projectile[] = []
  private phase: GamePhase = 'menu'
  private gold = 200
  private lives = 20
  private wave = 0
  private score = 0
  private gameTime = 0
  private gameOverSent = false
  private enemiesSpawned = 0
  private enemiesPerWave = 0
  private spawnTimer = 0
  private spawnInterval = 1000
  private waveTimer = 0
  private waveDelay = 3000
  private cellSize = 0
  private gridOffsetX = 0
  private gridOffsetY = 0
  private cols = 8
  private rows = 6
  private selectedTowerType: 'basic' | 'sniper' | 'splash' = 'basic'
  private path: { r: number; c: number }[] = []
  private animationTimer = 0
  private towerCosts: Record<string, number> = { basic: 50, sniper: 100, splash: 150 }
  private eliteWaveInterval = 3
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }> = []
  private effects: EffectsManager = new EffectsManager()
  private synergiesDirty = true
  private theme = getTheme('tower-defense')
  /** Separate overlay instance for game-specific state/scores */
  private gameOverlay = new GameOverlay()

  protected init(): void {
    this.phase = 'menu'
    this.gold = 200
    this.lives = 20
    this.wave = 0
    this.score = 0
    this.gameTime = 0
    this.gameOverSent = false
    this.towers = []
    this.enemies = []
    this.projectiles = []
    this.enemiesSpawned = 0
    this.animationTimer = 0
    this.gameOverlay.setSize(this.width, this.height)
    this.generatePath()
    this.pushStats()
    void preloadGameSprites('tower-defense')
  }

  private generatePath(): void {
    this.path = []
    const startRow = Math.floor(this.rows / 2)
    for (let c = 0; c < this.cols; c++) {
      this.path.push({ r: startRow, c })
    }
  }

  private cellToPixel(r: number, c: number): { x: number; y: number } {
    return {
      x: this.gridOffsetX + c * this.cellSize + this.cellSize / 2,
      y: this.gridOffsetY + r * this.cellSize + this.cellSize / 2,
    }
  }

  protected update(dt: number): void {
    this.gameTime += dt
    this.animationTimer += dt

    if (this.phase === 'playing') {
      this.updateSpawning(dt)
      this.updateEnemies(dt)
      this.updateTowers(dt)
      this.updateProjectiles(dt)
      this.updateTowerSynergies()
    }

    this.effects.update(dt)

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.x += p.vx * (dt / 16.667)
      p.y += p.vy * (dt / 16.667)
      p.life -= dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }

    this.pushStats()
  }

  private updateTowerSynergies(): void {
    if (!this.synergiesDirty) return
    this.synergiesDirty = false
    for (const tower of this.towers) {
      let adjacent = 0
      const towerRow = Math.floor((tower.y - this.gridOffsetY) / this.cellSize)
      const towerCol = Math.floor((tower.x - this.gridOffsetX) / this.cellSize)
      
      for (const other of this.towers) {
        if (other === tower) continue
        const otherRow = Math.floor((other.y - this.gridOffsetY) / this.cellSize)
        const otherCol = Math.floor((other.x - this.gridOffsetX) / this.cellSize)
        const dist = Math.abs(towerRow - otherRow) + Math.abs(towerCol - otherCol)
        if (dist === 1) adjacent++
      }
      
      tower.adjacentTowers = adjacent
      tower.synergyBonus = 1 + adjacent * 0.15
    }
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const bg = ctx.createLinearGradient(0, 0, 0, this.height)
    bg.addColorStop(0, this.theme.palette.bg)
    bg.addColorStop(1, this.theme.palette.bgAlt)
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, this.width, this.height)

    if (this.phase === 'menu') {
      this.renderMenu(ctx)
    } else {
      this.renderGame(ctx)
    }
  }

  private renderMenu(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    drawKawaiiPanel(ctx, this.width * 0.17, this.height * 0.14, this.width * 0.66, this.height * 0.2, {
      fill: this.theme.ui.surface,
      accent: this.theme.ui.accent,
      stroke: this.theme.palette.ink,
      radius: Math.floor(22 * scale),
    })

    ctx.fillStyle = this.theme.palette.ink
    ctx.font = `bold ${Math.floor(32 * scale)}px ${this.theme.font.family}`
    ctx.fillText('塔防大戰', this.width / 2, this.height * 0.2)

    ctx.fillStyle = this.theme.palette.ink + '80'
    ctx.font = `${Math.floor(14 * scale)}px ${this.theme.font.family}`
    ctx.fillText('Tower Defense', this.width / 2, this.height * 0.2 + Math.floor(40 * scale))

    const startBtnY = this.height * 0.45
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(56 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    const pulse = Math.sin(this.animationTimer * 0.003) * 0.08 + 0.92
    ctx.save()
    ctx.translate(this.width / 2, startBtnY + startBtnH / 2)
    ctx.scale(pulse, pulse)
    ctx.translate(-this.width / 2, -(startBtnY + startBtnH / 2))
    drawKawaiiButton(ctx, {
      x: startBtnX,
      y: startBtnY,
      width: startBtnW,
      height: startBtnH,
      label: 'Start Game',
      iconKind: 'target',
      fill: this.theme.ui.surface,
      activeFill: this.theme.ui.accent,
    })
    ctx.restore()

    ctx.fillStyle = this.theme.palette.ink + '66'
    ctx.font = `${Math.floor(12 * scale)}px ${this.theme.font.family}`
    ctx.fillText('Place towers to stop enemies!', this.width / 2, this.height * 0.65)
    ctx.fillText('Basic: 50g | Sniper: 100g | Splash: 150g', this.width / 2, this.height * 0.7)
  }

  private renderGame(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr

    // Calculate grid
    const gridW = Math.min(this.width - Math.floor(16 * scale), this.height * 0.6)
    this.cellSize = Math.floor(gridW / this.cols)
    this.gridOffsetX = Math.floor((this.width - this.cellSize * this.cols) / 2)
    this.gridOffsetY = Math.floor(16 * scale)

    // Build tower cell lookup set for O(1) checks
    const towerCells = new Set<string>()
    for (const t of this.towers) {
      const tc = Math.floor((t.x - this.gridOffsetX) / this.cellSize)
      const tr = Math.floor((t.y - this.gridOffsetY) / this.cellSize)
      towerCells.add(`${tc},${tr}`)
    }

    // Draw grid
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.gridOffsetX + c * this.cellSize
        const y = this.gridOffsetY + r * this.cellSize
        const isPath = this.path.some(p => p.r === r && p.c === c)
        const hasTower = towerCells.has(`${c},${r}`)

        if (isPath) {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.1)'
        } else if (hasTower) {
          ctx.fillStyle = 'rgba(255,255,255,0.05)'
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.02)'
        }
        ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2)
      }
    }

    // Draw path
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = Math.floor(this.cellSize * 0.4)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    this.path.forEach((p, i) => {
      const pos = this.cellToPixel(p.r, p.c)
      if (i === 0) ctx.moveTo(pos.x, pos.y)
      else ctx.lineTo(pos.x, pos.y)
    })
    ctx.stroke()

    // Draw towers
    this.towers.forEach(t => this.renderTower(ctx, t))

    // Draw enemies
    this.enemies.forEach(e => {
      if (!e.alive) return
      this.renderEnemy(ctx, e)
    })

    // Draw projectiles
    this.projectiles.forEach(p => {
      if (!p.active) return
      const drewProj = drawSprite(ctx, 'td.projectile', {
        x: p.x,
        y: p.y,
        scale: scale,
      })
      if (!drewProj) {
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.floor(3 * scale), 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // HUD
    const hudY = this.gridOffsetY + this.cellSize * this.rows + Math.floor(6 * scale)
    drawKawaiiPanel(ctx, Math.floor(8 * scale), hudY, Math.floor(108 * scale), Math.floor(42 * scale), {
      fill: this.theme.ui.surface,
      accent: this.theme.ui.accent,
      stroke: this.theme.palette.ink,
      radius: Math.floor(12 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: Math.floor(18 * scale),
      y: hudY + Math.floor(15 * scale),
      text: `Gold ${this.gold}`,
      iconKind: 'star',
      color: '#92400e',
      fontSize: Math.max(10, Math.floor(11 * scale)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: Math.floor(18 * scale),
      y: hudY + Math.floor(31 * scale),
      text: `Lives ${this.lives}`,
      iconKind: 'heart',
      color: '#7f1d1d',
      fontSize: Math.max(10, Math.floor(11 * scale)),
    })

    drawKawaiiPanel(ctx, Math.floor(this.width / 2 - 52 * scale), hudY, Math.floor(104 * scale), Math.floor(42 * scale), {
      fill: this.theme.ui.surface,
      accent: this.theme.ui.accent,
      stroke: this.theme.palette.ink,
      radius: Math.floor(12 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: Math.floor(this.width / 2 - 36 * scale),
      y: hudY + Math.floor(16 * scale),
      text: `Wave ${this.wave}`,
      iconKind: 'target',
      color: '#166534',
      fontSize: Math.max(10, Math.floor(11 * scale)),
    })
    drawKawaiiProgressBar(ctx, Math.floor(this.width / 2 - 38 * scale), hudY + Math.floor(25 * scale), Math.floor(76 * scale), Math.floor(8 * scale), Math.min(1, this.enemiesSpawned / Math.max(1, this.enemiesPerWave)), {
      trackFill: 'rgba(15, 23, 42, 0.12)',
      fill: this.theme.ui.accent,
      stroke: 'rgba(15, 23, 42, 0.22)',
    })

    // Tower selection buttons
    this.renderTowerButtons(ctx)

    // Game over overlay
    if (this.phase === 'gameover') {
      this.gameOverlay.render(ctx, {
        state: 'gameover',
        score: this.score,
        level: this.wave,
        lives: this.lives,
        maxLives: 20,
        gameTime: this.gameTime,
        gameName: '塔防大戰',
        gameColor: this.theme.ui.accent,
        dpr: scale,
        introProgress: 1,
      })
    }

    this.effects.render(ctx)
  }

  private renderTower(ctx: CanvasRenderingContext2D, tower: Tower): void {
    const scale = this.dpr
    const size = this.cellSize * 0.7

    const spriteScale = size / 56
    const drewBase = drawSprite(ctx, 'td.tower-base', {
      x: tower.x,
      y: tower.y,
      scale: spriteScale,
      variant: tower.type,
    })
    if (!drewBase) {
      const x = tower.x - size / 2
      const y = tower.y - size / 2
      ctx.fillStyle = tower.color
      ctx.beginPath()
      this.roundRect(ctx, x, y, size, size, Math.floor(4 * scale))
      ctx.fill()
    }

    ctx.save()
    ctx.translate(tower.x, tower.y)
    ctx.rotate(tower.angle)
    const drewBarrel = drawSprite(ctx, 'td.tower-barrel', {
      x: 0,
      y: 0,
      scale: spriteScale,
    })
    if (!drewBarrel) {
      ctx.fillStyle = '#fff'
      ctx.fillRect(Math.floor(size * 0.1), Math.floor(-2 * scale), Math.floor(size * 0.5), Math.floor(4 * scale))
    }
    ctx.restore()

    // Level indicator
    if (tower.level > 1) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = `bold ${Math.floor(10 * scale)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(`Lv${tower.level}`, tower.x, tower.y + size / 2 + Math.floor(4 * scale))
    }
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const scale = this.dpr
    const variant: 'normal' | 'fast' | 'tank' | 'boss' | 'elite' = enemy.isElite ? 'elite' : enemy.type
    const spriteScale = (enemy.radius * 2) / 28
    const drewSprite = drawSprite(ctx, 'td.enemy', {
      x: enemy.x,
      y: enemy.y,
      scale: spriteScale,
      variant,
    })
    if (!drewSprite) {
      ctx.fillStyle = enemy.color
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const barW = enemy.radius * 2.5
    const barH = Math.floor(3 * scale)
    const barX = enemy.x - barW / 2
    const barY = enemy.y - enemy.radius - Math.floor(6 * scale)
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(barX, barY, barW, barH)
    ctx.fillStyle = enemy.hp / enemy.maxHp > 0.5 ? '#22c55e' : enemy.hp / enemy.maxHp > 0.25 ? '#fbbf24' : '#ef4444'
    ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH)
  }

  private renderTowerButtons(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const btnY = this.gridOffsetY + this.cellSize * this.rows + Math.floor(56 * scale)
    const btnW = Math.floor((this.width - Math.floor(32 * scale)) / 3)
    const btnH = Math.floor(40 * scale)
    const gap = Math.floor(4 * scale)

    const types: { type: 'basic' | 'sniper' | 'splash'; label: string; color: string; cost: number }[] = [
      { type: 'basic', label: 'Basic', color: '#3b82f6', cost: 50 },
      { type: 'sniper', label: 'Sniper', color: '#8b5cf6', cost: 100 },
      { type: 'splash', label: 'Splash', color: '#ef4444', cost: 150 },
    ]

    types.forEach((t, i) => {
      const x = Math.floor(12 * scale) + i * (btnW + gap)
      const isActive = this.selectedTowerType === t.type
      const canAfford = this.gold >= t.cost
      drawKawaiiButton(ctx, {
        x,
        y: btnY,
        width: btnW,
        height: btnH,
        label: t.label,
        count: t.cost,
        iconKind: t.type === 'basic' ? 'laser' : t.type === 'sniper' ? 'target' : 'bomb',
        enabled: canAfford,
        active: isActive,
        fill: 'rgba(255,255,255,0.9)',
        activeFill: t.color,
        disabledFill: 'rgba(226,232,240,0.5)',
        textColor: canAfford ? '#1f2937' : '#64748b',
      })
    })
  }

  private updateSpawning(dt: number): void {
    if (this.enemiesSpawned >= this.enemiesPerWave) {
      if (this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesPerWave) {
        this.enemiesSpawned = 0
        this.gold += 50 + this.wave * 10
        this.effects.triggerConfetti(20)
        this.startWave()
      }
      return
    }

    this.spawnTimer += dt
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0
      this.spawnEnemy()
    }
  }

  private startWave(): void {
    this.wave++
    this.enemiesPerWave = 5 + this.wave * 3
    this.enemiesSpawned = 0
    this.spawnInterval = Math.max(400, 1000 - this.wave * 50)
  }

  private spawnEnemy(): void {
    if (this.path.length === 0) return
    const start = this.path[0]!
    const pos = this.cellToPixel(start.r, start.c)

    const isEliteWave = this.wave % this.eliteWaveInterval === 0
    const types: Enemy['type'][] = ['normal', 'fast', 'tank']
    if (this.wave >= 3) types.push('boss')
    if (isEliteWave) types.push('elite')

    let type: Enemy['type'] = 'normal'
    const roll = Math.random()
    if (isEliteWave && roll < 0.3) type = 'elite'
    else if (this.wave >= 5 && roll < 0.1) type = 'boss'
    else if (this.wave >= 3 && roll < 0.3) type = 'tank'
    else if (roll < 0.5) type = 'fast'

    const hpMult = 1 + (this.wave - 1) * 0.3
    const enemy: Enemy = {
      x: pos.x,
      y: pos.y,
      hp: 0,
      maxHp: 0,
      speed: 0,
      pathIndex: 0,
      reward: 0,
      type,
      color: '',
      radius: 0,
      alive: true,
      isElite: type === 'elite',
      eliteModifier: undefined,
    }

    if (type === 'elite') {
      const modifiers: Enemy['eliteModifier'][] = ['armored', 'swift', 'regenerating', 'explosive']
      enemy.eliteModifier = modifiers[Math.floor(Math.random() * modifiers.length)]
      
      switch (enemy.eliteModifier) {
        case 'armored':
          enemy.hp = Math.round(80 * hpMult * 1.5)
          enemy.maxHp = enemy.hp
          enemy.speed = 0.8
          enemy.reward = 40
          enemy.color = '#94a3b8'
          enemy.radius = Math.floor(11 * this.dpr)
          break
        case 'swift':
          enemy.hp = Math.round(30 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 3
          enemy.reward = 35
          enemy.color = '#fbbf24'
          enemy.radius = Math.floor(7 * this.dpr)
          break
        case 'regenerating':
          enemy.hp = Math.round(60 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 0.9
          enemy.reward = 45
          enemy.color = '#10b981'
          enemy.radius = Math.floor(9 * this.dpr)
          break
        case 'explosive':
          enemy.hp = Math.round(40 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 1.2
          enemy.reward = 50
          enemy.color = '#f97316'
          enemy.radius = Math.floor(8 * this.dpr)
          break
      }
    } else {
      switch (type) {
        case 'fast':
          enemy.hp = Math.round(20 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 2
          enemy.reward = 15
          enemy.color = '#22d3ee'
          enemy.radius = Math.floor(6 * this.dpr)
          break
        case 'tank':
          enemy.hp = Math.round(80 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 0.6
          enemy.reward = 30
          enemy.color = '#f97316'
          enemy.radius = Math.floor(10 * this.dpr)
          break
        case 'boss':
          enemy.hp = Math.round(200 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 0.4
          enemy.reward = 100
          enemy.color = '#dc2626'
          enemy.radius = Math.floor(14 * this.dpr)
          break
        default:
          enemy.hp = Math.round(40 * hpMult)
          enemy.maxHp = enemy.hp
          enemy.speed = 1
          enemy.reward = 10
          enemy.color = '#22c55e'
          enemy.radius = Math.floor(8 * this.dpr)
      }
    }

    this.enemies.push(enemy)
    this.enemiesSpawned++
  }

  private updateEnemies(dt: number): void {
    const speed = dt / 16.667
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!
      if (!e.alive) {
        this.enemies.splice(i, 1)
        continue
      }

      if (e.pathIndex < this.path.length - 1) {
        const next = this.path[e.pathIndex + 1]!
        const target = this.cellToPixel(next.r, next.c)
        const dx = target.x - e.x
        const dy = target.y - e.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < e.speed * speed) {
          e.x = target.x
          e.y = target.y
          e.pathIndex++
        } else {
          e.x += (dx / dist) * e.speed * speed
          e.y += (dy / dist) * e.speed * speed
        }
      }

        if (e.pathIndex >= this.path.length - 1) {
          e.alive = false
          this.lives--
          this.effects.triggerShake(3, 150)
          if (this.lives <= 0) {
          this.lives = 0
          this.phase = 'gameover'
          if (!this.gameOverSent) {
            this.gameOverSent = true
            this.callbacks.onRewardEvent?.({
              schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
              gameId: 'tower-defense',
              emittedAt: new Date().toISOString(),
              score: this.score,
              rewards: createRewardPayload(),
              result: {
                score: this.score,
                kills: this.towers.length,
                time: Math.floor(this.gameTime / 1000),
                level: this.wave,
                coins: 0,
              },
            })
            this.callbacks.onGameOver?.(this.score)
          }
        }
      }
    }
  }

  private updateTowers(dt: number): void {
    const speed = dt / 16.667
    for (const tower of this.towers) {
      tower.fireTimer -= dt

      // Find target
      let target: Enemy | null = null
      let minDist = tower.range * tower.range
      for (const e of this.enemies) {
        if (!e.alive) continue
        const dx = e.x - tower.x
        const dy = e.y - tower.y
        const d2 = dx * dx + dy * dy
        if (d2 < minDist) {
          minDist = d2
          target = e
        }
      }

      if (target) {
        tower.angle = Math.atan2(target.y - tower.y, target.x - tower.x)

        if (tower.fireTimer <= 0) {
          tower.fireTimer = tower.fireRate
          this.fireProjectile(tower, target)
        }
      }
    }
  }

  private fireProjectile(tower: Tower, target: Enemy): void {
    const effectiveDamage = Math.floor(tower.damage * tower.synergyBonus)
    this.projectiles.push({
      x: tower.x,
      y: tower.y,
      targetX: target.x,
      targetY: target.y,
      speed: 5,
      damage: effectiveDamage,
      splash: tower.type === 'splash',
      splashRadius: tower.type === 'splash' ? this.cellSize * 0.8 : 0,
      color: tower.color,
      active: true,
    })
  }

  private updateProjectiles(dt: number): void {
    const speed = dt / 16.667
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]!
      if (!p.active) {
        this.projectiles.splice(i, 1)
        continue
      }

      const dx = p.targetX - p.x
      const dy = p.targetY - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < p.speed * speed + 5) {
        p.active = false
        this.hitTarget(p)
      } else {
        p.x += (dx / dist) * p.speed * speed
        p.y += (dy / dist) * p.speed * speed
        this.effects.burst(p.x, p.y, 1, ['#ffd700'], { min: 0, max: 1 })
      }
    }
  }

  private hitTarget(proj: Projectile): void {
    if (proj.splash) {
      for (const e of this.enemies) {
        if (!e.alive) continue
        const dx = e.x - proj.targetX
        const dy = e.y - proj.targetY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < proj.splashRadius) {
          this.damageEnemy(e, proj.damage * (1 - dist / proj.splashRadius * 0.5))
        }
      }
    } else {
      for (const e of this.enemies) {
        if (!e.alive) continue
        const dx = e.x - proj.targetX
        const dy = e.y - proj.targetY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < e.radius + 10) {
          this.damageEnemy(e, proj.damage)
          break
        }
      }
    }
  }

  private damageEnemy(enemy: Enemy, damage: number): void {
    if (enemy.isElite && enemy.eliteModifier === 'armored') {
      damage *= 0.7
    }
    
    enemy.hp -= Math.round(damage)
    
    if (enemy.isElite && enemy.eliteModifier === 'regenerating' && enemy.alive) {
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.round(enemy.maxHp * 0.02))
    }
    
    if (enemy.hp <= 0) {
      enemy.alive = false
      this.gold += enemy.reward
      this.score += enemy.reward * 10
      this.effects.burst(enemy.x, enemy.y, 12, ['#ff5722', '#fff'], { min: 2, max: 5 })

      if (enemy.isElite && enemy.eliteModifier === 'explosive') {
        this.createExplosion(enemy.x, enemy.y)
      }
    }
  }

  private createExplosion(x: number, y: number): void {
    const scale = this.dpr
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16
      const speed = 2 + Math.random() * 3
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 400 + Math.random() * 200,
        color: ['#f97316', '#ef4444', '#fbbf24'][Math.floor(Math.random() * 3)]!,
        size: Math.floor(3 * scale),
      })
    }
  }

  private handleTap(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * this.width / rect.width
    const y = (clientY - rect.top) * this.height / rect.height

    if (this.phase === 'menu') {
      const startBtnY = this.height * 0.45
      const startBtnW = Math.floor(this.width * 0.5)
      const startBtnH = Math.floor(56 * this.dpr)
      const startBtnX = (this.width - startBtnW) / 2
      if (x >= startBtnX && x <= startBtnX + startBtnW && y >= startBtnY && y <= startBtnY + startBtnH) {
        this.phase = 'playing'
        this.startWave()
      }
    } else if (this.phase === 'playing') {
      this.handleGameTap(x, y)
    } else if (this.phase === 'gameover') {
      const btnW = Math.floor(this.width * 0.5)
      const btnH = Math.floor(44 * this.dpr)
      const btnY = this.height * 0.55
      const btnX = (this.width - btnW) / 2
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        this.init()
      }
    }
  }

  private handleGameTap(x: number, y: number): void {
    const scale = this.dpr
    const btnY = this.gridOffsetY + this.cellSize * this.rows + Math.floor(56 * scale)
    const btnW = Math.floor((this.width - Math.floor(32 * scale)) / 3)
    const btnH = Math.floor(40 * scale)
    const gap = Math.floor(4 * scale)
    const types: ('basic' | 'sniper' | 'splash')[] = ['basic', 'sniper', 'splash']

    for (let i = 0; i < 3; i++) {
      const bx = Math.floor(12 * scale) + i * (btnW + gap)
      if (x >= bx && x <= bx + btnW && y >= btnY && y <= btnY + btnH) {
        this.selectedTowerType = types[i]!
        return
      }
    }

    const col = Math.floor((x - this.gridOffsetX) / this.cellSize)
    const row = Math.floor((y - this.gridOffsetY) / this.cellSize)

    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      const isPath = this.path.some(p => p.r === row && p.c === col)
      const hasTower = this.towers.some(t => {
        const tc = Math.floor((t.x - this.gridOffsetX) / this.cellSize)
        const tr = Math.floor((t.y - this.gridOffsetY) / this.cellSize)
        return tc === col && tr === row
      })

      if (!isPath && !hasTower) {
        const cost = this.towerCosts[this.selectedTowerType] ?? 50
        if (this.gold >= cost) {
          this.gold -= cost
          const pos = this.cellToPixel(row, col)
          const tower: Tower = {
            x: pos.x,
            y: pos.y,
            range: this.cellSize * (this.selectedTowerType === 'sniper' ? 3 : 2),
            damage: this.selectedTowerType === 'sniper' ? 30 : this.selectedTowerType === 'splash' ? 15 : 10,
            fireRate: this.selectedTowerType === 'sniper' ? 2000 : this.selectedTowerType === 'splash' ? 1500 : 800,
            fireTimer: 0,
            level: 1,
            type: this.selectedTowerType,
            color: this.selectedTowerType === 'sniper' ? '#8b5cf6' : this.selectedTowerType === 'splash' ? '#ef4444' : '#3b82f6',
            angle: 0,
            synergyBonus: 1,
            adjacentTowers: 0,
          }
          this.towers.push(tower)
          this.synergiesDirty = true
          this.effects.burst(pos.x, pos.y, 8, ['#4caf50'], { min: 1, max: 3 })
        }
      }
    }
  }

  protected override onResize(w: number, h: number): void {
    this.gameOverlay.setSize(w, h)
  }

  private pushStats(): void {
    const stats: PlayerStats = {
      hp: this.lives,
      maxHp: 20,
      level: this.wave,
      xp: this.enemiesSpawned,
      xpToNext: this.enemiesPerWave,
      kills: this.towers.length,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const hudData: GameHudData = {
      hp: this.lives,
      maxHp: 20,
      level: this.wave,
      xp: this.enemiesSpawned,
      xpToNext: this.enemiesPerWave,
      kills: this.towers.length,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: [],
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }
}

export function createTowerDefenseGame(): GameInstance {
  const game = new TowerDefenseGame()
  const origStart = game.start.bind(game)
  game.start = function(canvas, callbacks) {
    origStart(canvas, callbacks)
    canvas.addEventListener('pointerdown', (e) => {
      (game as unknown as { handleTap: (x: number, y: number) => void }).handleTap(e.clientX, e.clientY)
    })
  }
  return game
}
