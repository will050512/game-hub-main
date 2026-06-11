import { GameEngine } from '@/engine/GameEngine'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKenneySprite, preloadKenneySprites } from '@/engine/sprites/kenneySpriteLoader'
import {
  canvasIconKindForItem,
  drawKawaiiCanvasIcon,
  drawKawaiiInlineLabel,
  drawKawaiiPanel,
  drawKawaiiProgressBar,
} from '@/engine/kawaiiCanvas'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type GameHudData,
} from '@/types'
import { 
  POWERUP_DEFS, 
  FORMATION_PATTERNS,
  createShieldBlocks,
  type InvadersPowerUpDef, 
  type FormationType,
  type ShieldBlock 
} from './data'
import { LoadoutCodexManager } from './loadoutCodex'

interface Star {
  x: number
  y: number
  size: number
  twinkle: number
  phase: number
}

interface Player {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Alien {
  x: number
  y: number
  width: number
  height: number
  row: number
  col: number
  alive: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

interface ScreenShake {
  x: number
  y: number
  intensity: number
  duration: number
  elapsed: number
}

interface FloatingText {
  x: number
  y: number
  text: string
  color: string
  scale: number
  alpha: number
  life: number
  maxLife: number
}

interface Bullet {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  friendly: boolean
}

interface PowerUpItem {
  x: number
  y: number
  width: number
  height: number
  vy: number
  def: InvadersPowerUpDef
}

interface HomingMissile {
  x: number
  y: number
  vx: number
  vy: number
  targetIdx: number
}

interface ComboDisplay {
  count: number
  lastKillTime: number
  x: number
  y: number
  scale: number
}

const ALIEN_ROWS = 5
const ALIEN_COLS = 8
const TOTAL_ALIENS_PER_WAVE = ALIEN_ROWS * ALIEN_COLS
const MAX_LIVES = 5
const START_LIVES = 3
const COMBO_TIMEOUT_MS = 3000

const FORMATION_SEQUENCE: FormationType[] = ['standard', 'vee', 'diamond', 'wedge', 'scattered', 'wall']

class InvadersGame extends GameEngine {
  private player: Player = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    speed: 0,
  }

  private stars: Star[] = []
  private aliens: Alien[] = []
  private playerBullets: Bullet[] = []
  private alienBullets: Bullet[] = []
  private particles: Particle[] = []
  private shieldBlocks: ShieldBlock[] = []

  private screenShake: ScreenShake | null = null
  private floatingTexts: FloatingText[] = []
  private comboDisplay: ComboDisplay | null = null

  private score = 0
  private lives = START_LIVES
  private wave = 1
  private totalKills = 0
  private waveKills = 0
  private elapsedMs = 0

  private alienDirection = 1
  private alienStepTimerMs = 0
  private alienShootTimerMs = 0

  private shootCooldownMs = 0
  private gameOver = false
  private gameOverSent = false

  private inputBound = false
  private touchMoveX = 0
  private movementTouchId: number | null = null

  private powerUpItems: PowerUpItem[] = []
  private activeEffects: { id: string; remainingMs: number }[] = []
  private shieldActive = false
  private tripleShotActive = false
  private rapidFireActive = false
  private homingMissiles: HomingMissile[] = []

  private powerUpsCollectedThisRun: Set<string> = new Set()
  private loadoutCodex: LoadoutCodexManager
  private activeLoadouts: string[] = []

  constructor() {
    super()
    const savedCodex = localStorage.getItem('invaders_loadout_codex')
    this.loadoutCodex = new LoadoutCodexManager(savedCodex || undefined)
  }

  protected init(): void {
    void preloadGameSprites('invaders')
    void preloadKenneySprites('invaders')
    const scale = this.dpr

    this.score = 0
    this.lives = START_LIVES
    this.wave = 1
    this.totalKills = 0
    this.waveKills = 0
    this.elapsedMs = 0

    this.shootCooldownMs = 0
    this.alienStepTimerMs = 0
    this.alienShootTimerMs = 0
    this.alienDirection = 1

    this.touchMoveX = 0
    this.movementTouchId = null

    this.gameOver = false
    this.gameOverSent = false

    this.player.width = Math.max(24 * scale, this.width * 0.06)
    this.player.height = Math.max(14 * scale, this.player.width * 0.55)
    this.player.x = (this.width - this.player.width) / 2
    this.player.y = this.height - Math.max(42 * scale, this.height * 0.1)
    this.player.speed = 0.6 * scale

    this.playerBullets = []
    this.alienBullets = []
    this.particles = []

    this.powerUpItems = []
    this.activeEffects = []
    this.homingMissiles = []
    this.shieldActive = false
    this.tripleShotActive = false
    this.rapidFireActive = false

    this.powerUpsCollectedThisRun = new Set()
    this.activeLoadouts = []
    this.comboDisplay = null

    this.createStars()
    this.createWave()
    this.createShields()
    this.bindInputListeners()

    this.screenShake = null
    this.floatingTexts = []

    const bonuses = this.loadoutCodex.getActiveBonuses()
    this.lives += bonuses.startingLives
    this.player.speed *= (1 + bonuses.moveSpeedBonus)

    this.callbacks.onScoreUpdate?.(this.score)
    this.pushStats()
  }

  override stop(): void {
    this.unbindInputListeners()
    super.stop()
  }

  protected update(dt: number): void {
    this.elapsedMs += dt

    if (!this.gameOver) {
      this.updatePlayer(dt)
      this.updateShooting(dt)
      this.updateAliens(dt)
      this.updateAlienShooting(dt)
      this.updatePowerUpItems(dt)
      this.updateActiveEffects(dt)
      this.updateHomingMissiles(dt)
      this.updateComboDisplay(dt)
      this.checkWaveProgression()
      this.updateLoadoutCodex()
    }

    this.updateParticles(dt)
    this.updateFloatingTexts(dt)
    this.updateScreenShake(dt)
    this.pushStats()
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.screenShake = { x: 0, y: 0, intensity, duration, elapsed: 0 }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, scale = 1) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      scale,
      alpha: 1,
      life: 800,
      maxLife: 800,
    })
  }

  private spawnParticles(x: number, y: number, count: number, color: string, speed = 0.15) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35
      const particleSpeed = (speed + Math.random() * speed) * this.dpr
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed,
        radius: Math.max(2, 2 * this.dpr),
        color,
        alpha: 1,
        life: 160 + Math.random() * 220,
        maxLife: 380,
      })
    }
  }

  private updateComboDisplay(dt: number) {
    if (!this.comboDisplay) return

    const timeSinceLastKill = this.elapsedMs - this.comboDisplay.lastKillTime
    if (timeSinceLastKill > COMBO_TIMEOUT_MS) {
      this.comboDisplay = null
      return
    }

    const fadeStart = COMBO_TIMEOUT_MS - 500
    if (timeSinceLastKill > fadeStart) {
      const fadeProgress = (timeSinceLastKill - fadeStart) / 500
      this.comboDisplay.scale = 1 - fadeProgress * 0.3
    }
  }

  private incrementCombo(x: number, y: number) {
    if (!this.comboDisplay) {
      this.comboDisplay = {
        count: 1,
        lastKillTime: this.elapsedMs,
        x: this.width / 2,
        y: this.height * 0.3,
        scale: 1,
      }
    } else {
      this.comboDisplay.count++
      this.comboDisplay.lastKillTime = this.elapsedMs
      this.comboDisplay.scale = 1.2
    }

    if (this.comboDisplay.count >= 5) {
      this.spawnFloatingText(x, y, `COMBO ×${this.comboDisplay.count}!`, '#fbbf24', 1.3)
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i]!
      t.y -= 1 * (dt / 16.667)
      t.life -= dt
      t.alpha = Math.max(0, t.life / t.maxLife)
      if (t.life <= 0) this.floatingTexts.splice(i, 1)
    }
  }

  private updateScreenShake(dt: number) {
    if (!this.screenShake) return
    this.screenShake.elapsed += dt
    if (this.screenShake.elapsed >= this.screenShake.duration) {
      this.screenShake = null
      return
    }
    const decay = 1 - this.screenShake.elapsed / this.screenShake.duration
    const shake = this.screenShake.intensity * decay
    this.screenShake.x = (Math.random() - 0.5) * shake * 2
    this.screenShake.y = (Math.random() - 0.5) * shake * 2
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height)

    if (this.screenShake) {
      ctx.translate(this.screenShake.x, this.screenShake.y)
    }

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, this.width, this.height)

    this.renderStars(ctx)
    this.renderShields(ctx)
    this.renderAliens(ctx)
    this.renderPlayer(ctx)
    if (this.shieldActive) this.renderPlayerShield(ctx)
    this.renderBullets(ctx)
    this.renderPowerUpItems(ctx)
    this.renderHomingMissiles(ctx)
    this.renderParticles(ctx)
    this.renderFloatingTexts(ctx)
    this.renderComboDisplay(ctx)
    this.renderHud(ctx)

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(0, 0, this.width, this.height)
      ctx.fillStyle = '#f8fafc'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold ${Math.max(18, 25 * this.dpr)}px monospace`
      ctx.fillText('GAME OVER', this.width / 2, this.height * 0.45)
      ctx.font = `${Math.max(10, 12 * this.dpr)}px monospace`
      ctx.fillText('Press Space or tap top area to restart', this.width / 2, this.height * 0.53)
    }

    if (this.screenShake) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }

  private createStars(): void {
    const count = Math.max(40, Math.floor((this.width * this.height) / (13000 * this.dpr)))
    this.stars = []
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: (Math.random() < 0.12 ? 2 : 1) * this.dpr,
        twinkle: 0.0012 + Math.random() * 0.004,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  private createWave(): void {
    const scale = this.dpr
    const alienWidth = Math.max(21 * scale, this.width * 0.034)
    const alienHeight = alienWidth * 0.72
    const gapX = Math.max(8 * scale, alienWidth * 0.33)
    const gapY = Math.max(7 * scale, alienHeight * 0.45)

    const formationType = FORMATION_SEQUENCE[(this.wave - 1) % FORMATION_SEQUENCE.length]!
    const formation = FORMATION_PATTERNS[formationType]!

    const positions = formation.getPositions(
      ALIEN_ROWS,
      ALIEN_COLS,
      alienWidth,
      alienHeight,
      gapX,
      gapY,
      this.width,
      this.height,
      this.wave
    )

    this.aliens = positions.map(pos => ({
      x: pos.x,
      y: pos.y,
      width: alienWidth,
      height: alienHeight,
      row: pos.row,
      col: pos.col,
      alive: true,
    }))

    this.waveKills = 0
    this.playerBullets = []
    this.alienBullets = []
    this.powerUpItems = []
    this.homingMissiles = []
    this.alienDirection = this.wave % 2 === 0 ? -1 : 1
    this.alienStepTimerMs = 0
    this.alienShootTimerMs = 0

    this.spawnFloatingText(this.width / 2, this.height * 0.25, `WAVE ${this.wave}`, '#7dd3fc', 1.5)
    this.triggerScreenShake(5, 300)
  }

  private createShields(): void {
    this.shieldBlocks = createShieldBlocks(this.width, this.height, this.player.y, this.dpr)
  }

  private bindInputListeners(): void {
    if (this.inputBound) return

    window.addEventListener('keydown', this.handleKeyDown)
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false })
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false })
    this.inputBound = true
  }

  private unbindInputListeners(): void {
    if (!this.inputBound) return

    window.removeEventListener('keydown', this.handleKeyDown)
    this.canvas.removeEventListener('touchstart', this.handleTouchStart)
    this.canvas.removeEventListener('touchmove', this.handleTouchMove)
    this.canvas.removeEventListener('touchend', this.handleTouchEnd)
    this.canvas.removeEventListener('touchcancel', this.handleTouchEnd)

    this.touchMoveX = 0
    this.movementTouchId = null
    this.inputBound = false
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' && event.key !== ' ') return
    event.preventDefault()

    if (this.gameOver) {
      this.init()
      return
    }

    this.tryShootPlayerBullet()
  }

  private handleTouchStart = (event: TouchEvent): void => {
    const rect = this.canvas.getBoundingClientRect()

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      if (!touch) continue

      const touchX = touch.clientX - rect.left
      const touchY = touch.clientY - rect.top

      if (touchY <= rect.height * 0.35) {
        if (this.gameOver) {
          this.init()
        } else {
          this.tryShootPlayerBullet()
        }
        continue
      }

      if (this.movementTouchId === null) {
        this.movementTouchId = touch.identifier
      }

      if (touch.identifier === this.movementTouchId) {
        this.touchMoveX = touchX < rect.width * 0.5 ? -1 : 1
      }
    }

    event.preventDefault()
  }

  private handleTouchMove = (event: TouchEvent): void => {
    if (this.movementTouchId === null) return

    const rect = this.canvas.getBoundingClientRect()
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      if (!touch || touch.identifier !== this.movementTouchId) continue

      const touchX = touch.clientX - rect.left
      this.touchMoveX = touchX < rect.width * 0.5 ? -1 : 1
      event.preventDefault()
      return
    }
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    if (this.movementTouchId === null) return

    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i]
      if (!touch || touch.identifier !== this.movementTouchId) continue

      this.movementTouchId = null
      this.touchMoveX = 0
      event.preventDefault()
      return
    }
  }

  private updatePlayer(dt: number): void {
    const bonuses = this.loadoutCodex.getActiveBonuses()
    const moveSpeed = this.player.speed * (1 + bonuses.moveSpeedBonus)
    
    const moveX = this.clamp(this.input.moveX + this.touchMoveX, -1, 1)
    this.player.x += moveX * moveSpeed * dt
    this.player.x = this.clamp(this.player.x, 0, this.width - this.player.width)

    if (this.shootCooldownMs > 0) {
      this.shootCooldownMs = Math.max(0, this.shootCooldownMs - dt)
    }
  }

  private tryShootPlayerBullet(): void {
    const maxBullets = this.tripleShotActive ? 8 : 2
    if (this.shootCooldownMs > 0 || this.playerBullets.length >= maxBullets) return

    const bonuses = this.loadoutCodex.getActiveBonuses()
    const fireRateMult = 1 - bonuses.fireRateBonus

    const bulletWidth = Math.max(2, 2 * this.dpr)
    const bulletHeight = Math.max(10, 10 * this.dpr)
    const bulletSpeed = 0.94 * this.dpr
    const startX = this.player.x + this.player.width / 2 - bulletWidth / 2
    const startY = this.player.y - bulletHeight

    this.playerBullets.push({
      x: startX,
      y: startY,
      width: bulletWidth,
      height: bulletHeight,
      vx: 0,
      vy: -bulletSpeed,
      friendly: true,
    })

    if (this.tripleShotActive) {
      const angleRad = 15 * Math.PI / 180
      const sideVx = Math.sin(angleRad) * bulletSpeed
      const sideVy = -Math.cos(angleRad) * bulletSpeed

      this.playerBullets.push({
        x: startX,
        y: startY,
        width: bulletWidth,
        height: bulletHeight,
        vx: -sideVx,
        vy: sideVy,
        friendly: true,
      })

      this.playerBullets.push({
        x: startX,
        y: startY,
        width: bulletWidth,
        height: bulletHeight,
        vx: sideVx,
        vy: sideVy,
        friendly: true,
      })
    }

    const baseCooldown = this.rapidFireActive ? 90 : 180
    this.shootCooldownMs = Math.max(10, baseCooldown * fireRateMult)
  }

  private updateShooting(dt: number): void {
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i]
      if (!bullet) continue

      bullet.x += bullet.vx * dt
      bullet.y += bullet.vy * dt
      if (bullet.y + bullet.height < 0) {
        this.playerBullets.splice(i, 1)
      }
    }

    for (let i = this.alienBullets.length - 1; i >= 0; i--) {
      const bullet = this.alienBullets[i]
      if (!bullet) continue

      bullet.x += bullet.vx * dt
      bullet.y += bullet.vy * dt
      if (bullet.y > this.height) {
        this.alienBullets.splice(i, 1)
      }
    }

    this.resolveBulletCollisions()
  }

  private updateAliens(dt: number): void {
    const aliveAliens = this.getAliveAliens()
    if (aliveAliens.length === 0) return

    this.alienStepTimerMs += dt

    const aliveRatio = aliveAliens.length / TOTAL_ALIENS_PER_WAVE
    const baseInterval = Math.max(170, 620 - (this.wave - 1) * 45)
    const stepInterval = this.clamp(baseInterval * aliveRatio, 70, 620)

    if (this.alienStepTimerMs < stepInterval) return

    this.alienStepTimerMs = 0

    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    for (const alien of aliveAliens) {
      minX = Math.min(minX, alien.x)
      maxX = Math.max(maxX, alien.x + alien.width)
    }

    const stepX = (8 + this.wave * 0.8) * this.dpr
    const nextMinX = minX + this.alienDirection * stepX
    const nextMaxX = maxX + this.alienDirection * stepX
    const atEdge = nextMinX <= 8 * this.dpr || nextMaxX >= this.width - 8 * this.dpr

    if (atEdge) {
      this.alienDirection *= -1
    }

    const dropY = (14 + this.wave * 1.2) * this.dpr
    for (const alien of aliveAliens) {
      alien.x += this.alienDirection * stepX
      if (atEdge) {
        alien.y += dropY
      }

      if (alien.y + alien.height >= this.player.y) {
        this.triggerGameOver()
      }
    }
  }

  private updateAlienShooting(dt: number): void {
    const aliveAliens = this.getAliveAliens()
    if (aliveAliens.length === 0) return

    this.alienShootTimerMs += dt

    const aliveRatio = aliveAliens.length / TOTAL_ALIENS_PER_WAVE
    const interval = this.clamp(1050 * aliveRatio - (this.wave - 1) * 55, 150, 1050)
    if (this.alienShootTimerMs < interval) return

    this.alienShootTimerMs = 0

    const shooters = this.getBottomAliensByColumn(aliveAliens)
    if (shooters.length === 0) return

    const shooter = shooters[Math.floor(Math.random() * shooters.length)]
    if (!shooter) return

    const bulletWidth = Math.max(2, 2 * this.dpr)
    const bulletHeight = Math.max(10, 10 * this.dpr)
    this.alienBullets.push({
      x: shooter.x + shooter.width / 2 - bulletWidth / 2,
      y: shooter.y + shooter.height,
      width: bulletWidth,
      height: bulletHeight,
      vx: 0,
      vy: (0.45 + this.wave * 0.03) * this.dpr,
      friendly: false,
    })
  }

  private resolveBulletCollisions(): void {
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const playerBullet = this.playerBullets[i]
      if (!playerBullet) continue

      let consumed = false

      for (const alien of this.aliens) {
        if (!alien.alive || !this.overlapRect(playerBullet, alien)) continue

        alien.alive = false
        this.waveKills++
        this.totalKills++
        
        const bonuses = this.loadoutCodex.getActiveBonuses()
        const scoreValue = Math.floor(this.pointsForRow(alien.row) * (1 + bonuses.scoreMultiplier))
        this.addScore(scoreValue)
        
        this.spawnParticles(alien.x + alien.width / 2, alien.y + alien.height / 2, 12, '#86efac')
        this.incrementCombo(alien.x + alien.width / 2, alien.y + alien.height / 2)

        const dropChance = 0.15 * (1 + bonuses.powerUpDropBonus)
        if (Math.random() < dropChance) {
          this.spawnPowerUpItem(alien.x + alien.width / 2, alien.y + alien.height / 2)
        }

        consumed = true
        break
      }

      if (!consumed) {
        for (let j = this.shieldBlocks.length - 1; j >= 0; j--) {
          const shield = this.shieldBlocks[j]
          if (!shield || !this.overlapRect(playerBullet, shield)) continue
          
          shield.hp--
          if (shield.hp <= 0) {
            this.shieldBlocks.splice(j, 1)
            this.spawnParticles(shield.x + shield.width / 2, shield.y + shield.height / 2, 6, '#22d3ee')
          }
          consumed = true
          break
        }
      }

      if (!consumed) {
        for (let j = this.alienBullets.length - 1; j >= 0; j--) {
          const alienBullet = this.alienBullets[j]
          if (!alienBullet || !this.overlapRect(playerBullet, alienBullet)) continue
          this.alienBullets.splice(j, 1)
          consumed = true
          break
        }
      }

      if (consumed) {
        this.playerBullets.splice(i, 1)
      }
    }

    for (let i = this.alienBullets.length - 1; i >= 0; i--) {
      const bullet = this.alienBullets[i]
      if (!bullet) continue

      let consumed = false

      for (let j = this.shieldBlocks.length - 1; j >= 0; j--) {
        const shield = this.shieldBlocks[j]
        if (!shield || !this.overlapRect(bullet, shield)) continue
        
        shield.hp--
        if (shield.hp <= 0) {
          this.shieldBlocks.splice(j, 1)
          this.spawnParticles(shield.x + shield.width / 2, shield.y + shield.height / 2, 6, '#22d3ee')
        }
        consumed = true
        break
      }

      if (!consumed && this.overlapRect(bullet, this.player)) {
        this.alienBullets.splice(i, 1)

        if (this.shieldActive) {
          this.shieldActive = false
          this.spawnParticles(
            bullet.x + bullet.width * 0.5,
            bullet.y + bullet.height * 0.5,
            12,
            '#22d3ee'
          )
          continue
        }

        this.lives = Math.max(0, this.lives - 1)
        this.spawnParticles(
          this.player.x + this.player.width * 0.5,
          this.player.y + this.player.height * 0.5,
          16,
          '#fde047'
        )
        this.triggerScreenShake(8, 300)

        if (this.lives <= 0) {
          this.triggerGameOver()
        }
      } else if (consumed) {
        this.alienBullets.splice(i, 1)
      }
    }
  }

  private checkWaveProgression(): void {
    if (this.getAliveAliens().length > 0) return

    this.wave++
    this.lives = Math.min(MAX_LIVES, this.lives + 1)
    this.createWave()
    this.createShields()
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i]
      if (!particle) continue

      particle.life -= dt
      if (particle.life <= 0) {
        this.particles.splice(i, 1)
        continue
      }

      particle.x += particle.vx * dt
      particle.y += particle.vy * dt
      particle.vx *= 0.985
      particle.vy *= 0.985
      particle.alpha = particle.life / particle.maxLife
    }
  }

  private triggerGameOver(): void {
    if (this.gameOver) return

    this.gameOver = true
    if (!this.gameOverSent) {
      const result = this.loadoutCodex.completeRun(this.score, this.wave)
      
      if (result.newDiscoveries.length > 0) {
        for (const discovery of result.newDiscoveries) {
          this.spawnFloatingText(
            this.width / 2,
            this.height * 0.35,
            `NEW LOADOUT: ${discovery.name}`,
            '#fbbf24',
            1.2
          )
        }
      }

      localStorage.setItem('invaders_loadout_codex', this.loadoutCodex.serialize())

      this.notifyGameOver(this.callbacks, this.score)
      this.gameOverSent = true
      this.triggerScreenShake(10, 400)
      this.spawnFloatingText(this.width / 2, this.height / 2, 'GAME OVER', '#ef4444', 1.2)
    }
  }

  private notifyGameOver(callbacks: GameCallbacks, finalScore: number): void {
    callbacks.onRewardEvent?.({
      schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
      gameId: 'invaders',
      emittedAt: new Date().toISOString(),
      score: finalScore,
      rewards: createRewardPayload(),
      result: {
        score: finalScore,
        kills: this.totalKills,
        time: Math.floor(this.elapsedMs / 1000),
        level: this.wave,
        coins: 0,
      },
    })
    callbacks.onGameOver?.(finalScore)
  }

  private pointsForRow(row: number): number {
    if (row === 0) return 30
    if (row <= 2) return 20
    return 10
  }

  private addScore(points: number): void {
    if (points <= 0) return
    this.score += points
    this.callbacks.onScoreUpdate?.(this.score)
  }

  private getAliveAliens(): Alien[] {
    return this.aliens.filter((alien: Alien) => alien.alive)
  }

  private getBottomAliensByColumn(aliveAliens: Alien[]): Alien[] {
    const byColumn = new Map<number, Alien>()
    for (const alien of aliveAliens) {
      const current = byColumn.get(alien.col)
      if (!current || alien.y > current.y) {
        byColumn.set(alien.col, alien)
      }
    }
    return [...byColumn.values()]
  }

  private updateLoadoutCodex(): void {
    this.loadoutCodex.updateCurrentRun(
      this.powerUpsCollectedThisRun,
      this.totalKills,
      this.wave
    )
    
    const matchingArchetypes = this.loadoutCodex.getMatchingArchetypes()
    const newActiveLoadouts = matchingArchetypes.map(a => a.id)
    
    for (const loadoutId of newActiveLoadouts) {
      if (!this.activeLoadouts.includes(loadoutId)) {
        const archetype = matchingArchetypes.find(a => a.id === loadoutId)
        if (archetype) {
          this.spawnFloatingText(
            this.width / 2,
            this.height * 0.25,
            `${archetype.icon} ${archetype.name}`,
            '#fbbf24',
            1.3
          )
        }
      }
    }
    
    this.activeLoadouts = newActiveLoadouts
  }

  private pushStats(): void {
    const stats: PlayerStats = {
      hp: this.lives,
      maxHp: MAX_LIVES,
      level: this.wave,
      xp: this.waveKills,
      xpToNext: TOTAL_ALIENS_PER_WAVE,
      kills: this.totalKills,
      time: Math.floor(this.elapsedMs / 1000),
      score: this.score,
    }

    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const buffs: GameHudData['activeBuffs'] = []
    for (const effect of this.activeEffects) {
      const def = POWERUP_DEFS[effect.id]
      if (def) {
        buffs.push({
          id: effect.id,
          name: def.name,
          icon: def.icon,
          remainingMs: effect.remainingMs,
          totalMs: def.durationMs,
          type: 'power',
        })
      }
    }
    if (this.shieldActive) {
      buffs.push({
        id: 'shield',
        name: '護盾',
        icon: 'shield',
        remainingMs: 0,
        totalMs: 0,
        type: 'defense',
      })
    }

    const hudData: GameHudData = {
      hp: this.lives,
      maxHp: MAX_LIVES,
      level: this.wave,
      xp: this.waveKills,
      xpToNext: TOTAL_ALIENS_PER_WAVE,
      kills: this.totalKills,
      time: Math.floor(this.elapsedMs / 1000),
      score: this.score,
      activeBuffs: buffs,
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private renderStars(ctx: CanvasRenderingContext2D): void {
    for (const star of this.stars) {
      const alpha = 0.25 + ((Math.sin(this.elapsedMs * star.twinkle + star.phase) + 1) * 0.5) * 0.7
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(star.x, star.y, star.size, star.size)
    }
    ctx.globalAlpha = 1
  }

  private renderPlayer(ctx: CanvasRenderingContext2D): void {
    const x = this.player.x
    const y = this.player.y
    const w = this.player.width
    const h = this.player.height

    const drew = drawKenneySprite(ctx, 'invaders.player', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 64,
      scaleY: h / 36,
    }) || drawSprite(ctx, 'invaders.player', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 64,
      scaleY: h / 36,
    })
    if (drew) return

    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.moveTo(x + w * 0.5, y)
    ctx.lineTo(x + w * 0.1, y + h)
    ctx.lineTo(x + w * 0.9, y + h)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#22c55e'
    ctx.fillRect(x + w * 0.42, y + h * 0.1, w * 0.16, h * 0.34)
    ctx.fillRect(x + w * 0.23, y + h * 0.62, w * 0.54, h * 0.28)
  }

  private renderAliens(ctx: CanvasRenderingContext2D): void {
    for (const alien of this.aliens) {
      if (!alien.alive) continue

      if (alien.row === 0) {
        this.drawSquidAlien(ctx, alien)
      } else if (alien.row <= 2) {
        this.drawCrabAlien(ctx, alien)
      } else {
        this.drawOctopusAlien(ctx, alien)
      }
    }
  }

  private drawSquidAlien(ctx: CanvasRenderingContext2D, alien: Alien): void {
    const x = alien.x
    const y = alien.y
    const w = alien.width
    const h = alien.height

    const drew = drawKenneySprite(ctx, 'invaders.alien-squid', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 40,
      scaleY: h / 32,
    }) || drawSprite(ctx, 'invaders.alien-squid', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 40,
      scaleY: h / 32,
    })
    if (drew) return

    ctx.fillStyle = '#7dd3fc'
    ctx.beginPath()
    ctx.ellipse(x + w * 0.5, y + h * 0.44, w * 0.33, h * 0.34, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(x + w * 0.2, y + h * 0.55, w * 0.6, h * 0.2)

    ctx.fillStyle = '#0c4a6e'
    ctx.fillRect(x + w * 0.38, y + h * 0.36, w * 0.08, h * 0.12)
    ctx.fillRect(x + w * 0.54, y + h * 0.36, w * 0.08, h * 0.12)
  }

  private drawCrabAlien(ctx: CanvasRenderingContext2D, alien: Alien): void {
    const x = alien.x
    const y = alien.y
    const w = alien.width
    const h = alien.height

    const drew = drawKenneySprite(ctx, 'invaders.alien-crab', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 40,
      scaleY: h / 32,
    }) || drawSprite(ctx, 'invaders.alien-crab', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 40,
      scaleY: h / 32,
    })
    if (drew) return

    ctx.fillStyle = '#facc15'
    ctx.fillRect(x + w * 0.16, y + h * 0.16, w * 0.68, h * 0.5)
    ctx.fillRect(x + w * 0.04, y + h * 0.34, w * 0.14, h * 0.18)
    ctx.fillRect(x + w * 0.82, y + h * 0.34, w * 0.14, h * 0.18)
    ctx.fillRect(x + w * 0.16, y + h * 0.68, w * 0.14, h * 0.24)
    ctx.fillRect(x + w * 0.7, y + h * 0.68, w * 0.14, h * 0.24)

    ctx.fillStyle = '#713f12'
    ctx.fillRect(x + w * 0.34, y + h * 0.26, w * 0.1, h * 0.12)
    ctx.fillRect(x + w * 0.56, y + h * 0.26, w * 0.1, h * 0.12)
  }

  private drawOctopusAlien(ctx: CanvasRenderingContext2D, alien: Alien): void {
    const x = alien.x
    const y = alien.y
    const w = alien.width
    const h = alien.height

    const drew = drawKenneySprite(ctx, 'invaders.alien-octopus', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 40,
      scaleY: h / 32,
    }) || drawSprite(ctx, 'invaders.alien-octopus', {
      x: x + w / 2,
      y: y + h / 2,
      scaleX: w / 40,
      scaleY: h / 32,
    })
    if (drew) return

    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(x + w * 0.5, y + h * 0.44, w * 0.34, Math.PI, Math.PI * 2)
    ctx.lineTo(x + w * 0.84, y + h * 0.76)
    ctx.lineTo(x + w * 0.16, y + h * 0.76)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(x + w * 0.2, y + h * 0.76, w * 0.12, h * 0.2)
    ctx.fillRect(x + w * 0.44, y + h * 0.76, w * 0.12, h * 0.2)
    ctx.fillRect(x + w * 0.68, y + h * 0.76, w * 0.12, h * 0.2)

    ctx.fillStyle = '#7c2d12'
    ctx.fillRect(x + w * 0.36, y + h * 0.42, w * 0.09, h * 0.11)
    ctx.fillRect(x + w * 0.55, y + h * 0.42, w * 0.09, h * 0.11)
  }

  private renderBullets(ctx: CanvasRenderingContext2D): void {
    for (const bullet of this.playerBullets) {
      if (!bullet.friendly) continue
      const drew = drawKenneySprite(ctx, 'invaders.bullet-player', {
        x: bullet.x + bullet.width / 2,
        y: bullet.y + bullet.height / 2,
        scaleX: bullet.width / 8,
        scaleY: bullet.height / 16,
      }) || drawSprite(ctx, 'invaders.bullet-player', {
        x: bullet.x + bullet.width / 2,
        y: bullet.y + bullet.height / 2,
        scaleX: bullet.width / 8,
        scaleY: bullet.height / 16,
      })
      if (drew) continue
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(bullet.x, bullet.y + bullet.height * 0.2, bullet.width, bullet.height * 0.2)
    }

    for (const bullet of this.alienBullets) {
      if (bullet.friendly) continue
      const drew = drawKenneySprite(ctx, 'invaders.bullet-alien', {
        x: bullet.x + bullet.width / 2,
        y: bullet.y + bullet.height / 2,
        scaleX: bullet.width / 8,
        scaleY: bullet.height / 16,
      }) || drawSprite(ctx, 'invaders.bullet-alien', {
        x: bullet.x + bullet.width / 2,
        y: bullet.y + bullet.height / 2,
        scaleX: bullet.width / 8,
        scaleY: bullet.height / 16,
      })
      if (drew) continue
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      ctx.fillStyle = '#fde047'
      ctx.fillRect(bullet.x, bullet.y + bullet.height * 0.55, bullet.width, bullet.height * 0.2)
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private renderShields(ctx: CanvasRenderingContext2D): void {
    for (const shield of this.shieldBlocks) {
      const hpRatio = shield.hp / shield.maxHp
      const r = Math.floor(34 + (255 - 34) * (1 - hpRatio))
      const g = Math.floor(211 + (68 - 211) * (1 - hpRatio))
      const b = Math.floor(238 + (68 - 238) * (1 - hpRatio))
      const drew = drawKenneySprite(ctx, 'invaders.shield-block', {
        x: shield.x,
        y: shield.y,
        scaleX: shield.width / 24,
        scaleY: shield.height / 24,
        alpha: 0.4 + hpRatio * 0.6,
      }) || drawSprite(ctx, 'invaders.shield-block', {
        x: shield.x,
        y: shield.y,
        scaleX: shield.width / 24,
        scaleY: shield.height / 24,
        alpha: 0.4 + hpRatio * 0.6,
      })
      if (drew) continue
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(shield.x, shield.y, shield.width, shield.height)
    }
  }

  private renderHud(ctx: CanvasRenderingContext2D): void {
    const margin = 12 * this.dpr
    const line = 16 * this.dpr
    const panelH = 58 * this.dpr
    const leftPanelW = 146 * this.dpr
    const rightEffects: Array<{ id: string; remainingMs: number }> = [...this.activeEffects]
    if (this.shieldActive) {
      rightEffects.push({ id: 'shield', remainingMs: 1 })
    }
    const rightPanelW = 170 * this.dpr
    const rightPanelH = Math.max(panelH, 42 * this.dpr + rightEffects.length * 18 * this.dpr)
    const rightPanelX = this.width - margin - rightPanelW

    drawKawaiiPanel(ctx, margin, margin, leftPanelW, panelH, {
      fill: 'rgba(244, 255, 248, 0.96)',
      accent: '#86efac',
      stroke: '#0f172a',
    })
    drawKawaiiInlineLabel(ctx, {
      x: margin + 12 * this.dpr,
      y: margin + 16 * this.dpr,
      text: `Score ${this.score}`,
      iconKind: 'star',
      color: '#14532d',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: margin + 12 * this.dpr,
      y: margin + 16 * this.dpr + line,
      text: `Wave ${this.wave}`,
      iconKind: 'target',
      color: '#14532d',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: margin + 12 * this.dpr,
      y: margin + 16 * this.dpr + line * 2,
      text: `Kills ${this.totalKills}`,
      iconKind: 'laser',
      color: '#14532d',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })

    drawKawaiiPanel(ctx, rightPanelX, margin, rightPanelW, rightPanelH, {
      fill: 'rgba(240, 253, 250, 0.96)',
      accent: '#22d3ee',
      stroke: '#0f172a',
    })
    drawKawaiiInlineLabel(ctx, {
      x: rightPanelX + 12 * this.dpr,
      y: margin + 16 * this.dpr,
      text: `Lives ${this.lives}`,
      iconKind: 'heart',
      color: '#155e75',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: rightPanelX + 12 * this.dpr,
      y: margin + 16 * this.dpr + line,
      text: `Time ${Math.floor(this.elapsedMs / 1000)}s`,
      iconKind: 'timer',
      color: '#155e75',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })

    const effectStartY = margin + 16 * this.dpr + line * 2 + 4 * this.dpr
    rightEffects.forEach((effect, index) => {
      const def = POWERUP_DEFS[effect.id]
      const iconKind = effect.id === 'shield' && !def ? 'shield' : canvasIconKindForItem(def?.icon ?? effect.id)
      const label = def?.name ?? '護盾'
      const color = def?.color ?? '#22d3ee'
      const y = effectStartY + index * 18 * this.dpr
      drawKawaiiInlineLabel(ctx, {
        x: rightPanelX + 12 * this.dpr,
        y,
        text: def?.durationMs ? `${label} ${Math.ceil(effect.remainingMs / 1000)}s` : label,
        iconKind,
        color,
        fontSize: Math.max(9, Math.floor(10 * this.dpr)),
      })
      if (def?.durationMs) {
        drawKawaiiProgressBar(
          ctx,
          rightPanelX + rightPanelW - 56 * this.dpr,
          y - 4 * this.dpr,
          44 * this.dpr,
          8 * this.dpr,
          Math.max(0, effect.remainingMs / def.durationMs),
          {
            trackFill: 'rgba(15, 23, 42, 0.1)',
            fill: color,
            stroke: 'rgba(15, 23, 42, 0.22)',
          },
        )
      }
    })
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const t of this.floatingTexts) {
      ctx.globalAlpha = t.alpha
      ctx.fillStyle = t.color
      ctx.font = `bold ${16 * t.scale * this.dpr}px sans-serif`
      ctx.fillText(t.text, t.x, t.y)
    }
    ctx.globalAlpha = 1
  }

  private renderComboDisplay(ctx: CanvasRenderingContext2D): void {
    if (!this.comboDisplay || this.comboDisplay.count < 2) return

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = Math.min(1, this.comboDisplay.scale)
    ctx.fillStyle = '#fbbf24'
    ctx.font = `bold ${20 * this.comboDisplay.scale * this.dpr}px sans-serif`
    ctx.fillText(`COMBO ×${this.comboDisplay.count}`, this.comboDisplay.x, this.comboDisplay.y)
    ctx.globalAlpha = 1
  }

  private spawnPowerUpItem(x: number, y: number): void {
    const defs = Object.values(POWERUP_DEFS)
    let totalWeight = 0
    for (const def of defs) {
      totalWeight += def.spawnWeight
    }

    let roll = Math.random() * totalWeight
    let chosen: InvadersPowerUpDef = defs[0]!
    for (const def of defs) {
      roll -= def.spawnWeight
      if (roll <= 0) {
        chosen = def
        break
      }
    }

    const size = 20 * this.dpr
    this.powerUpItems.push({
      x: x - size / 2,
      y: y - size / 2,
      width: size,
      height: size,
      vy: 0.1 * this.dpr,
      def: chosen,
    })
  }

  private updatePowerUpItems(dt: number): void {
    for (let i = this.powerUpItems.length - 1; i >= 0; i--) {
      const item = this.powerUpItems[i]
      if (!item) continue

      item.y += item.vy * dt

      if (item.y > this.height) {
        this.powerUpItems.splice(i, 1)
        continue
      }

      if (this.overlapRect(item, this.player)) {
        this.applyPowerUp(item.def)
        this.powerUpItems.splice(i, 1)
      }
    }
  }

  private applyPowerUp(def: InvadersPowerUpDef): void {
    this.powerUpsCollectedThisRun.add(def.id)
    
    this.spawnParticles(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      16,
      def.color
    )

    switch (def.id) {
      case 'rapid_fire': {
        this.rapidFireActive = true
        const existing = this.activeEffects.find(e => e.id === 'rapid_fire')
        if (existing) {
          existing.remainingMs = def.durationMs
        } else {
          this.activeEffects.push({ id: 'rapid_fire', remainingMs: def.durationMs })
        }
        break
      }
      case 'triple_shot': {
        this.tripleShotActive = true
        const existing = this.activeEffects.find(e => e.id === 'triple_shot')
        if (existing) {
          existing.remainingMs = def.durationMs
        } else {
          this.activeEffects.push({ id: 'triple_shot', remainingMs: def.durationMs })
        }
        break
      }
      case 'shield': {
        this.shieldActive = true
        break
      }
      case 'bomb': {
        for (const bullet of this.alienBullets) {
          this.spawnParticles(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 8, '#ef4444')
        }
        this.alienBullets = []
        this.triggerScreenShake(6, 250)
        break
      }
      case 'homing': {
        const aliveAliens = this.getAliveAliens()
        if (aliveAliens.length === 0) break

        for (let i = 0; i < 3; i++) {
          const targetAlien = aliveAliens[i % aliveAliens.length]!
          const targetIdx = this.aliens.indexOf(targetAlien)
          this.homingMissiles.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            vx: (i - 1) * 0.15 * this.dpr,
            vy: -0.3 * this.dpr,
            targetIdx,
          })
        }
        break
      }
      case 'repair': {
        this.lives = Math.min(this.lives + 1, MAX_LIVES)
        break
      }
    }
  }

  private updateActiveEffects(dt: number): void {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i]
      if (!effect) continue

      effect.remainingMs -= dt
      if (effect.remainingMs <= 0) {
        if (effect.id === 'rapid_fire') this.rapidFireActive = false
        if (effect.id === 'triple_shot') this.tripleShotActive = false
        this.activeEffects.splice(i, 1)
      }
    }
  }

  private updateHomingMissiles(dt: number): void {
    const speed = 0.5 * this.dpr

    for (let i = this.homingMissiles.length - 1; i >= 0; i--) {
      const missile = this.homingMissiles[i]
      if (!missile) continue

      let target = this.aliens[missile.targetIdx]
      if (!target || !target.alive) {
        let nearestDist = Number.POSITIVE_INFINITY
        let nearestIdx = -1
        for (let j = 0; j < this.aliens.length; j++) {
          const alien = this.aliens[j]
          if (!alien || !alien.alive) continue
          const dx = alien.x + alien.width / 2 - missile.x
          const dy = alien.y + alien.height / 2 - missile.y
          const dist = dx * dx + dy * dy
          if (dist < nearestDist) {
            nearestDist = dist
            nearestIdx = j
          }
        }
        if (nearestIdx === -1) {
          this.homingMissiles.splice(i, 1)
          continue
        }
        missile.targetIdx = nearestIdx
        target = this.aliens[nearestIdx]!
      }

      const dx = target.x + target.width / 2 - missile.x
      const dy = target.y + target.height / 2 - missile.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0) {
        missile.vx = (dx / dist) * speed
        missile.vy = (dy / dist) * speed
      }

      missile.x += missile.vx * dt
      missile.y += missile.vy * dt

      const missileRect = { x: missile.x - 4 * this.dpr, y: missile.y - 4 * this.dpr, width: 8 * this.dpr, height: 8 * this.dpr }
      if (this.overlapRect(missileRect, target)) {
        target.alive = false
        this.waveKills++
        this.totalKills++
        
        const bonuses = this.loadoutCodex.getActiveBonuses()
        const scoreValue = Math.floor(this.pointsForRow(target.row) * (1 + bonuses.scoreMultiplier))
        this.addScore(scoreValue)
        
        this.spawnParticles(target.x + target.width / 2, target.y + target.height / 2, 12, '#a855f7')
        this.incrementCombo(target.x + target.width / 2, target.y + target.height / 2)
        this.homingMissiles.splice(i, 1)
        continue
      }

      if (missile.x < -20 || missile.x > this.width + 20 || missile.y < -20 || missile.y > this.height + 20) {
        this.homingMissiles.splice(i, 1)
      }
    }
  }

  private renderPowerUpItems(ctx: CanvasRenderingContext2D): void {
    for (const item of this.powerUpItems) {
      const cx = item.x + item.width / 2
      const cy = item.y + item.height / 2
      const radius = item.width / 2

      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = item.def.color
      ctx.globalAlpha = 0.7
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5 * this.dpr
      ctx.stroke()

      drawKawaiiCanvasIcon(
        ctx,
        cx,
        cy,
        radius * 1.2,
        canvasIconKindForItem(item.def.icon),
        { color: '#fffaf6', ink: '#0f172a' },
      )
    }
  }

  private renderHomingMissiles(ctx: CanvasRenderingContext2D): void {
    for (const missile of this.homingMissiles) {
      const size = 5 * this.dpr
      const angle = Math.atan2(missile.vy, missile.vx)

      const drew = drawKenneySprite(ctx, 'invaders.missile', {
        x: missile.x,
        y: missile.y,
        rotation: angle + Math.PI / 2,
        scale: (size * 2) / 24,
      }) || drawSprite(ctx, 'invaders.missile', {
        x: missile.x,
        y: missile.y,
        rotation: angle + Math.PI / 2,
        scale: (size * 2) / 24,
      })
      if (drew) continue

      ctx.save()
      ctx.translate(missile.x, missile.y)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.moveTo(size, 0)
      ctx.lineTo(-size, -size * 0.6)
      ctx.lineTo(-size, size * 0.6)
      ctx.closePath()
      ctx.fillStyle = '#a855f7'
      ctx.fill()
      ctx.restore()
    }
  }

  private renderPlayerShield(ctx: CanvasRenderingContext2D): void {
    const cx = this.player.x + this.player.width / 2
    const cy = this.player.y + this.player.height / 2
    const radius = Math.max(this.player.width, this.player.height) * 0.75

    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#22d3ee'
    ctx.lineWidth = 2 * this.dpr
    ctx.globalAlpha = 0.5 + Math.sin(this.elapsedMs * 0.005) * 0.2
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  private overlapRect(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): boolean {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }
}

export function createInvadersGame(): GameInstance {
  return new InvadersGame()
}
