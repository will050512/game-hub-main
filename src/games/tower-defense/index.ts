import { GameEngine } from '@/engine/GameEngine'
import { REWARD_EVENT_SCHEMA_VERSION, createRewardPayload, type PlayerStats, type GameHudData, type GameInstance } from '@/types'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKawaiiButton, drawKawaiiInlineLabel, drawKawaiiPanel, drawKawaiiProgressBar } from '@/engine/kawaiiCanvas'
import { EffectsManager } from '@/engine/effects'
import { getTheme } from '@/engine/art/KawaiiTheme'
import { GameOverlay } from '@/engine/GameOverlay'
import { getFont, FONTS } from '@/engine/CanvasFontRegistry'

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
  flashTimer: number
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
  bobOffset: number
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
  trailTimer: number
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
  private effects: EffectsManager = new EffectsManager()
  private synergiesDirty = true
  private theme = getTheme('tower-defense')
  private gameOverlay = new GameOverlay()
  private pathDotTimer = 0
  private menuPulseTimer = 0
  private towerPreviewType = 'basic' as Tower['type']

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
    this.pathDotTimer += dt

    if (this.phase === 'playing') {
      this.updateSpawning(dt)
      this.updateEnemies(dt)
      this.updateTowers(dt)
      this.updateProjectiles(dt)
      this.updateTowerSynergies()
    }

    this.effects.update(dt)
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

    // Animated background gradient mesh
    const pulse = Math.sin(this.animationTimer * 0.001) * 0.5 + 0.5
    const menuBg = ctx.createRadialGradient(this.width / 2, this.height / 2, 0, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.6)
    menuBg.addColorStop(0, `${this.theme.ui.accent}33`)
    menuBg.addColorStop(0.5, `${this.theme.palette.bg}88`)
    menuBg.addColorStop(1, this.theme.palette.bg)
    ctx.fillStyle = menuBg
    ctx.fillRect(0, 0, this.width, this.height)

    // Title glow effect
    const titleGlow = ctx.createRadialGradient(this.width / 2, this.height * 0.18, 0, this.width / 2, this.height * 0.18, 200 * scale)
    titleGlow.addColorStop(0, `${this.theme.ui.accent}40`)
    titleGlow.addColorStop(1, 'transparent')
    ctx.fillStyle = titleGlow
    ctx.fillRect(this.width * 0.2, this.height * 0.05, this.width * 0.6, this.height * 0.2)

    drawKawaiiPanel(ctx, this.width * 0.17, this.height * 0.1, this.width * 0.66, this.height * 0.18, {
      fill: this.theme.ui.surface,
      accent: this.theme.ui.accent,
      stroke: this.theme.palette.ink,
      radius: Math.floor(22 * scale),
    })

    // Animated title with glow
    ctx.save()
    const titleScale = 1 + Math.sin(this.animationTimer * 0.002) * 0.03
    ctx.translate(this.width / 2, this.height * 0.17)
    ctx.scale(titleScale, titleScale)
    ctx.translate(-this.width / 2, -this.height * 0.17)
    
    ctx.shadowColor = this.theme.ui.accent
    ctx.shadowBlur = 20 * scale * pulse
    ctx.fillStyle = this.theme.palette.accent
    ctx.font = `bold ${Math.floor(36 * scale)}px ${this.theme.font.family}`
    ctx.fillText('塔防大戰', this.width / 2, this.height * 0.17)
    ctx.shadowBlur = 0
    ctx.restore()

    ctx.fillStyle = this.theme.palette.ink + '80'
    ctx.font = `${Math.floor(15 * scale)}px ${this.theme.font.family}`
    ctx.fillText('Tower Defense', this.width / 2, this.height * 0.17 + Math.floor(38 * scale))

    // Tower preview section
    const previewY = this.height * 0.32
    const previewW = Math.floor(this.width * 0.55)
    const previewH = Math.floor(80 * scale)
    drawKawaiiPanel(ctx, (this.width - previewW) / 2, previewY, previewW, previewH, {
      fill: this.theme.ui.surface + '99',
      accent: this.theme.ui.accent + '66',
      stroke: this.theme.palette.ink + '44',
      radius: Math.floor(14 * scale),
    })

    ctx.fillStyle = this.theme.palette.ink + 'aa'
    ctx.font = `bold ${Math.floor(12 * scale)}px ${this.theme.font.family}`
    ctx.fillText('— 塔防預覽 —', this.width / 2, previewY + Math.floor(16 * scale))

    // Show preview towers
    const towerTypes: { type: 'basic' | 'sniper' | 'splash'; label: string; color: string; cost: number; icon: string }[] = [
      { type: 'basic', label: '基礎', color: '#3b82f6', cost: 50, icon: '⚡' },
      { type: 'sniper', label: '狙擊', color: '#8b5cf6', cost: 100, icon: '🎯' },
      { type: 'splash', label: '範圍', color: '#ef4444', cost: 150, icon: '💥' },
    ]

    const btnW = Math.floor(previewW / 3) - Math.floor(8 * scale)
    towerTypes.forEach((t, i) => {
      const x = (this.width - previewW) / 2 + Math.floor(8 * scale) + i * (btnW + Math.floor(8 * scale))
      const isActive = this.towerPreviewType === t.type
      const isSelected = this.selectedTowerType === t.type

      // Mini tower preview
      const previewX = x + Math.floor(btnW / 2)
      const previewCY = previewY + Math.floor(42 * scale)
      
      ctx.save()
      ctx.translate(previewX, previewCY)
      
      // Tower base preview
      const towerSize = Math.floor(20 * scale)
      ctx.shadowColor = isActive ? t.color : 'transparent'
      ctx.shadowBlur = isActive ? 12 * scale : 0
      ctx.fillStyle = isActive ? t.color : `${t.color}66`
      ctx.beginPath()
      ctx.roundRect(-towerSize / 2, -towerSize / 2, towerSize, towerSize, Math.floor(4 * scale))
      ctx.fill()
      ctx.shadowBlur = 0
      
      // Tower icon
      ctx.font = `${Math.floor(10 * scale)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(t.icon, 0, 0)
      ctx.restore()

      // Label below
      ctx.fillStyle = isActive ? t.color : this.theme.palette.ink + '88'
      ctx.font = `${isActive ? 'bold ' : ''}${Math.floor(10 * scale)}px ${this.theme.font.family}`
      ctx.textAlign = 'center'
      ctx.fillText(`${t.label} ${t.cost}g`, previewX, previewY + Math.floor(58 * scale))
    })

    // Start button with pulse
    const startBtnY = this.height * 0.52
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(52 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    const btnPulse = Math.sin(this.animationTimer * 0.003) * 0.06 + 0.94
    ctx.save()
    ctx.translate(this.width / 2, startBtnY + startBtnH / 2)
    ctx.scale(btnPulse, btnPulse)
    ctx.translate(-this.width / 2, -(startBtnY + startBtnH / 2))
    drawKawaiiButton(ctx, {
      x: startBtnX,
      y: startBtnY,
      width: startBtnW,
      height: startBtnH,
      label: '🚀 開始遊戲',
      iconKind: 'rocket',
      fill: this.theme.ui.surface,
      activeFill: this.theme.ui.accent,
    })
    ctx.restore()

    // Instructions
    ctx.fillStyle = this.theme.palette.ink + '66'
    ctx.font = `${Math.floor(12 * scale)}px ${this.theme.font.family}`
    ctx.fillText('點擊格子上放塔防，抵禦敵人進攻！', this.width / 2, this.height * 0.68)
    ctx.fillText('相鄰塔防會獲得加成效果', this.width / 2, this.height * 0.73)

    // Difficulty indicator
    ctx.fillStyle = this.theme.palette.ink + '44'
    ctx.font = `${Math.floor(10 * scale)}px ${this.theme.font.family}`
    ctx.fillText('挑戰無限波次 | 提升塔防等級 | 解鎖強大敵人', this.width / 2, this.height * 0.85)
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

    // Apply screen shake
    ctx.save()
    this.effects.shake.apply(ctx)

    // ---- GRID RENDERING ----
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.gridOffsetX + c * this.cellSize
        const y = this.gridOffsetY + r * this.cellSize
        const isPath = this.path.some(p => p.r === r && p.c === c)
        const hasTower = towerCells.has(`${c},${r}`)

        if (isPath) {
          // Path cell with subtle glow
          const pathGlow = ctx.createRadialGradient(
            x + this.cellSize / 2, y + this.cellSize / 2, 0,
            x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize * 0.7
          )
          pathGlow.addColorStop(0, 'rgba(139, 92, 246, 0.15)')
          pathGlow.addColorStop(1, 'rgba(139, 92, 246, 0.05)')
          ctx.fillStyle = pathGlow
          ctx.fillRect(x, y, this.cellSize, this.cellSize)

          // Animated path dots
          const dotAlpha = (Math.sin(this.pathDotTimer * 0.003 + c * 0.5 + r * 0.3) * 0.3 + 0.4)
          ctx.fillStyle = `rgba(168, 85, 247, ${dotAlpha})`
          const dotSize = Math.floor(3 * scale)
          ctx.beginPath()
          ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, dotSize, 0, Math.PI * 2)
          ctx.fill()
        } else if (hasTower) {
          // Tower cell with subtle highlight
          ctx.fillStyle = 'rgba(255,255,255,0.06)'
          ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2)
        } else {
          // Buildable cell with subtle pattern
          const checkerAlpha = ((r + c) % 2 === 0) ? 0.02 : 0.04
          ctx.fillStyle = `rgba(255,255,255,${checkerAlpha})`
          ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2)
        }

        // Grid cell border
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.roundRect(x + 0.5, y + 0.5, this.cellSize - 1, this.cellSize - 1, Math.floor(2 * scale))
        ctx.stroke()
      }
    }

    // Path entrance and exit markers
    if (this.path.length > 0) {
      const start = this.path[0]!
      const end = this.path[this.path.length - 1]!
      const startPixel = this.cellToPixel(start.r, start.c)
      const endPixel = this.cellToPixel(end.r, end.c)

      // Entrance marker (green arrow)
      const entrancePulse = Math.sin(this.animationTimer * 0.004) * 0.3 + 0.7
      ctx.save()
      ctx.globalAlpha = entrancePulse
      ctx.fillStyle = '#22c55e'
      ctx.font = `bold ${Math.floor(14 * scale)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('▶', startPixel.x - this.cellSize * 0.6, startPixel.y)
      ctx.restore()

      // Exit marker (red X)
      ctx.save()
      ctx.globalAlpha = entrancePulse
      ctx.fillStyle = '#ef4444'
      ctx.font = `bold ${Math.floor(14 * scale)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✕', endPixel.x + this.cellSize * 0.6, endPixel.y)
      ctx.restore()
    }

    // Draw path line
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)'
    ctx.lineWidth = Math.floor(this.cellSize * 0.45)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    this.path.forEach((p, i) => {
      const pos = this.cellToPixel(p.r, p.c)
      if (i === 0) ctx.moveTo(pos.x, pos.y)
      else ctx.lineTo(pos.x, pos.y)
    })
    ctx.stroke()

    // Path inner line
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)'
    ctx.lineWidth = Math.floor(this.cellSize * 0.2)
    ctx.beginPath()
    this.path.forEach((p, i) => {
      const pos = this.cellToPixel(p.r, p.c)
      if (i === 0) ctx.moveTo(pos.x, pos.y)
      else ctx.lineTo(pos.x, pos.y)
    })
    ctx.stroke()

    // Draw towers
    this.towers.forEach(t => this.renderTower(ctx, t))

    // Draw range indicator for selected tower (if we track selection)
    this.renderTowerRange(ctx)

    // Draw enemies
    this.enemies.forEach(e => {
      if (!e.alive) return
      this.renderEnemy(ctx, e)
    })

    // Draw projectiles
    this.projectiles.forEach(p => {
      if (!p.active) return
      this.renderProjectile(ctx, p)
    })

    // ---- HUD ----
    this.renderHUD(ctx, scale)

    // ---- Tower buttons ----
    this.renderTowerButtons(ctx, scale)

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

    ctx.restore() // End screen shake
    this.effects.render(ctx)
  }

  private renderTowerRange(ctx: CanvasRenderingContext2D): void {
    // We don't track selection but we can highlight on hover-like behavior
    // For now, skip range indicator - it would need mouse tracking
  }

  private renderTower(ctx: CanvasRenderingContext2D, tower: Tower): void {
    const scale = this.dpr
    const size = this.cellSize * 0.7
    const halfSize = size / 2

    // Flash effect (when firing)
    const flashIntensity = Math.max(0, tower.flashTimer / 150)
    
    // Tower base with shadow and glow ring
    ctx.save()
    ctx.translate(tower.x, tower.y)
    
    // Shadow underneath
    ctx.shadowColor = tower.color + '44'
    ctx.shadowBlur = 8 * scale
    ctx.shadowOffsetY = 3 * scale
    
    // Glow ring matching tower type
    const glowColor = `${tower.color}${Math.floor(flashIntensity * 80).toString(16).padStart(2, '0')}`
    ctx.shadowColor = glowColor
    ctx.shadowBlur = (12 + flashIntensity * 15) * scale
    
    // Draw tower base
    const x = -halfSize
    const y = -halfSize
    ctx.fillStyle = tower.color
    ctx.beginPath()
    ctx.roundRect(x, y, size, size, Math.floor(6 * scale))
    ctx.fill()
    
    // Flash overlay
    if (flashIntensity > 0) {
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.6})`
      ctx.beginPath()
      ctx.roundRect(x, y, size, size, Math.floor(6 * scale))
      ctx.fill()
    }
    
    ctx.restore()
    
    // Tower inner detail (smaller inset square)
    ctx.save()
    ctx.translate(tower.x, tower.y)
    const insetSize = size * 0.55
    ctx.fillStyle = `${tower.color}cc`
    ctx.beginPath()
    ctx.roundRect(-insetSize / 2, -insetSize / 2, insetSize, insetSize, Math.floor(3 * scale))
    ctx.fill()
    ctx.restore()

    // Barrel rotation with smooth animation
    ctx.save()
    ctx.translate(tower.x, tower.y)
    ctx.rotate(tower.angle)
    
    const barrelW = size * 0.55
    const barrelH = size * 0.12
    ctx.fillStyle = '#f1f5f9'
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 3 * scale
    ctx.shadowOffsetY = 2 * scale
    ctx.beginPath()
    ctx.roundRect(halfSize * 0.1, -barrelH / 2, barrelW, barrelH, Math.floor(2 * scale))
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()

    // Level indicator with stars
    if (tower.level > 1) {
      const stars = '★'.repeat(tower.level) + '☆'.repeat(Math.max(0, 3 - tower.level))
      
      ctx.save()
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 4 * scale
      
      ctx.fillStyle = '#fbbf24'
      ctx.font = `bold ${Math.floor(10 * scale)}px ${this.theme.font.family}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(stars, tower.x, tower.y + halfSize + Math.floor(6 * scale))
      
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fde68a'
      ctx.font = `${Math.floor(8 * scale)}px ${this.theme.font.family}`
      ctx.fillText(`Lv${tower.level}`, tower.x, tower.y + halfSize + Math.floor(18 * scale))
      ctx.restore()
    }
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const scale = this.dpr
    
    // Bob animation for movement feel
    const bob = Math.sin(this.animationTimer * 0.005 + enemy.x * 0.1) * 1.5 * scale
    const bobY = enemy.y + bob

    // Enemy base with shadow
    ctx.save()
    ctx.translate(enemy.x, bobY)

    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.3)'
    ctx.shadowBlur = 6 * scale
    ctx.shadowOffsetY = 2 * scale

    // Draw enemy body
    ctx.fillStyle = enemy.color
    ctx.beginPath()
    ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Elite pulsing border
    if (enemy.isElite) {
      const pulseAlpha = Math.sin(this.animationTimer * 0.005) * 0.3 + 0.7
      ctx.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha})`
      ctx.lineWidth = Math.floor(2 * scale)
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 8 * scale
      ctx.beginPath()
      ctx.arc(0, 0, enemy.radius + 2 * scale, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Boss label
    if (enemy.type === 'boss') {
      ctx.fillStyle = '#ef4444'
      ctx.font = `bold ${Math.floor(9 * scale)}px ${this.theme.font.family}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('BOSS', 0, -enemy.radius - 4 * scale)
    }

    ctx.restore()

    // Health bar with gradient fill and shadow
    const barW = enemy.radius * 3
    const barH = Math.floor(4 * scale)
    const barX = enemy.x - barW / 2
    const barY = bobY - enemy.radius - Math.floor(8 * scale)
    
    // Health bar background
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.beginPath()
    ctx.roundRect(barX - 1, barY - 1, barW + 2, barH + 2, Math.floor(2 * scale))
    ctx.fill()
    
    // Health bar fill with gradient
    const hpRatio = enemy.hp / enemy.maxHp
    const hpColor = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#fbbf24' : '#ef4444'
    
    const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW * hpRatio, barY)
    hpGrad.addColorStop(0, hpColor)
    hpGrad.addColorStop(1, hpColor + 'cc')
    ctx.fillStyle = hpGrad
    ctx.shadowColor = hpColor
    ctx.shadowBlur = 3 * scale
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW * hpRatio, barH, Math.floor(2 * scale))
    ctx.fill()
    ctx.shadowBlur = 0
    
    // Health bar border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, Math.floor(2 * scale))
    ctx.stroke()
  }

  private renderProjectile(ctx: CanvasRenderingContext2D, proj: Projectile): void {
    const scale = this.dpr

    // Trail effect (fading particles behind projectile)
    const trailLen = 3
    for (let i = 0; i < trailLen; i++) {
      const t = i / trailLen
      const trailX = proj.x - (proj.targetX - proj.x) * t * 0.3
      const trailY = proj.y - (proj.targetY - proj.y) * t * 0.3
      const trailAlpha = (1 - t) * 0.4
      const trailSize = (1 - t) * 3 * scale
      
      ctx.save()
      ctx.globalAlpha = trailAlpha
      ctx.fillStyle = proj.color
      ctx.beginPath()
      ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Main projectile
    const drewProj = drawSprite(ctx, 'td.projectile', {
      x: proj.x,
      y: proj.y,
      scale: scale,
    })
    if (!drewProj) {
      // Glow around projectile
      ctx.save()
      ctx.shadowColor = proj.color
      ctx.shadowBlur = 8 * scale
      ctx.fillStyle = proj.color
      ctx.beginPath()
      ctx.arc(proj.x, proj.y, Math.floor(4 * scale), 0, Math.PI * 2)
      ctx.fill()
      // Inner bright core
      ctx.shadowBlur = 0
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(proj.x, proj.y, Math.floor(1.5 * scale), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D, scale: number): void {
    const hudY = this.gridOffsetY + this.cellSize * this.rows + Math.floor(4 * scale)
    const hudH = Math.floor(44 * scale)

    // Gold display
    const goldW = Math.floor(120 * scale)
    drawKawaiiPanel(ctx, Math.floor(8 * scale), hudY, goldW, hudH, {
      fill: this.theme.ui.surface,
      accent: '#f59e0b',
      stroke: '#92400e',
      radius: Math.floor(10 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: Math.floor(20 * scale),
      y: hudY + Math.floor(16 * scale),
      text: `💰 ${this.gold}`,
      color: '#f59e0b',
      fontSize: Math.max(13, Math.floor(14 * scale)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: Math.floor(20 * scale),
      y: hudY + Math.floor(33 * scale),
      text: `💖 ${this.lives}`,
      color: this.lives <= 5 ? '#ef4444' : '#ef4444',
      fontSize: Math.max(11, Math.floor(12 * scale)),
    })

    // Score display
    const scoreW = Math.floor(100 * scale)
    const scoreX = Math.floor(8 * scale + goldW + Math.floor(8 * scale))
    drawKawaiiPanel(ctx, scoreX, hudY, scoreW, hudH, {
      fill: this.theme.ui.surface,
      accent: this.theme.ui.accent,
      stroke: this.theme.palette.ink,
      radius: Math.floor(10 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: scoreX + Math.floor(14 * scale),
      y: hudY + Math.floor(16 * scale),
      text: `🏆 ${this.score}`,
      color: this.theme.ui.accent,
      fontSize: Math.max(12, Math.floor(13 * scale)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: scoreX + Math.floor(14 * scale),
      y: hudY + Math.floor(33 * scale),
      text: `⚔️ 波次 ${this.wave}`,
      color: '#166534',
      fontSize: Math.max(10, Math.floor(11 * scale)),
    })

    // Wave progress bar
    const progressX = scoreX + Math.floor(14 * scale)
    const progressW = Math.floor(scoreW - Math.floor(28 * scale))
    drawKawaiiProgressBar(ctx, progressX, hudY + Math.floor(26 * scale), progressW, Math.floor(6 * scale),
      Math.min(1, this.enemiesSpawned / Math.max(1, this.enemiesPerWave)), {
      trackFill: 'rgba(15, 23, 42, 0.12)',
      fill: this.theme.ui.accent,
      stroke: 'rgba(15, 23, 42, 0.22)',
    })
  }

  private renderTowerButtons(ctx: CanvasRenderingContext2D, scale: number): void {
    const btnY = this.gridOffsetY + this.cellSize * this.rows + Math.floor(52 * scale)
    const btnW = Math.floor((this.width - Math.floor(32 * scale)) / 3)
    const btnH = Math.floor(38 * scale)
    const gap = Math.floor(4 * scale)

    const types: { type: 'basic' | 'sniper' | 'splash'; label: string; color: string; cost: number; icon: string }[] = [
      { type: 'basic', label: '基礎', color: '#3b82f6', cost: 50, icon: '⚡' },
      { type: 'sniper', label: '狙擊', color: '#8b5cf6', cost: 100, icon: '🎯' },
      { type: 'splash', label: '範圍', color: '#ef4444', cost: 150, icon: '💥' },
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
        label: `${t.icon} ${t.label}`,
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
        this.effects.triggerConfetti(30)
        this.effects.spawnFloatingText(this.width / 2, this.height * 0.4, `+${50 + this.wave * 10} 💰`, '#f59e0b')
        this.effects.shake.trigger({ intensity: 2, duration: 200 })
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
      bobOffset: Math.random() * Math.PI * 2,
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
      tower.flashTimer = Math.max(0, tower.flashTimer - dt)

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
        // Smooth barrel rotation toward target
        const targetAngle = Math.atan2(target.y - tower.y, target.x - tower.x)
        let angleDiff = targetAngle - tower.angle
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2
        tower.angle += angleDiff * 0.2

        if (tower.fireTimer <= 0) {
          tower.fireTimer = tower.fireRate
          tower.flashTimer = 150
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
      trailTimer: 0,
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
        // Small trail particle
        this.effects.particles.emit({
          count: 1,
          colors: [p.color],
          speed: { min: 0.5, max: 1.5 },
          size: { start: 2, end: 0 },
          lifetime: 200,
          gravity: 0,
          opacity: { start: 0.3, end: 0 },
        }, p.x, p.y)
      }
    }
  }

  private hitTarget(proj: Projectile): void {
    // Impact flash at impact point
    this.effects.flash.trigger({ color: '#ffffff', alpha: 0.15, duration: 80 })

    if (proj.splash) {
      // Splash explosion ring
      this.effects.burst(proj.targetX, proj.targetY, 8, [proj.color, '#ffffff'], { min: 3, max: 6 })
      
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
      // Small impact flash
      this.effects.burst(proj.targetX, proj.targetY, 4, ['#ffffff'], { min: 1, max: 3 })
      
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
      
      // Death particle burst
      this.effects.burst(enemy.x, enemy.y, 12, ['#ff5722', '#fff', '#fbbf24'], { min: 2, max: 6 })
      
      // Floating text for reward
      this.effects.spawnFloatingText(enemy.x, enemy.y - 10, `+${enemy.reward}`, '#f59e0b')
      
      if (enemy.isElite && enemy.eliteModifier === 'explosive') {
        this.createExplosion(enemy.x, enemy.y)
      }
    }
  }

  private createExplosion(x: number, y: number): void {
    this.effects.burst(x, y, 16, ['#f97316', '#ef4444', '#fbbf24'], { min: 2, max: 6 })
  }

  private handleTap(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * this.width / rect.width
    const y = (clientY - rect.top) * this.height / rect.height

    if (this.phase === 'menu') {
      const startBtnY = this.height * 0.52
      const startBtnW = Math.floor(this.width * 0.5)
      const startBtnH = Math.floor(52 * this.dpr)
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
    const btnY = this.gridOffsetY + this.cellSize * this.rows + Math.floor(52 * scale)
    const btnW = Math.floor((this.width - Math.floor(32 * scale)) / 3)
    const btnH = Math.floor(38 * scale)
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
            flashTimer: 0,
          }
          this.towers.push(tower)
          this.synergiesDirty = true
          this.effects.burst(pos.x, pos.y, 8, ['#4caf50', '#a3e635'], { min: 1, max: 4 })
          this.effects.sparkle(pos.x, pos.y, '#4caf50')
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
