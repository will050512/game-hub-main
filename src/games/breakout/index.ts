import { GameEngine } from '@/engine/GameEngine'
import { EffectsManager } from '@/engine/effects'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type GameHudData,
} from '@/types'
import { POWERUP_DEFS, STAGE_LAYOUTS, type StageVariant } from './data'
import type { BreakoutPowerUpDef, StageLayout } from './data'
import { ModifierCodexManager } from './modifierCodex'
import { preloadGameSprites, drawSprite } from '@/engine/sprites/spriteLoader'
import { preloadKenneySprites, drawKenneySprite } from '@/engine/sprites/kenneySpriteLoader'
import { canvasIconKindForItem, drawKawaiiCanvasIcon, drawKawaiiInlineLabel } from '@/engine/kawaiiCanvas'
import { ObjectPool } from '@/engine/ObjectPool'
import { getTheme } from '@/engine/art/KawaiiTheme'

interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
  radius: number
}

interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  active: boolean
}

interface Brick {
  x: number
  y: number
  width: number
  height: number
  radius: number
  color: string
  points: number
  alive: boolean
  hp: number
  maxHp: number
  isBoss: boolean
  flashTimer: number
}

interface PowerUpEntity {
  x: number
  y: number
  width: number
  height: number
  vy: number
  def: BreakoutPowerUpDef
}

interface ActiveEffect {
  id: string
  remainingMs: number
  totalMs: number
}

interface LaserBullet {
  x: number
  y: number
  vy: number
  width: number
  height: number
}

interface BallTrail {
  x: number
  y: number
  alpha: number
}

export interface BreakoutBrickMetricsInput {
  canvasWidth: number
  canvasHeight: number
  dpr: number
  rows: number
  cols: number
}

export interface BreakoutBrickMetrics {
  width: number
  height: number
  gap: number
  rowGap: number
  left: number
  top: number
  rows: number
  cols: number
  radius: number
}

export function computeBreakoutBrickMetrics(input: BreakoutBrickMetricsInput): BreakoutBrickMetrics {
  const dpr = Math.max(1, input.dpr)
  const horizontalMargin = Math.max(18 * dpr, input.canvasWidth * 0.055)
  const gap = Math.max(6 * dpr, Math.min(12 * dpr, input.canvasWidth * 0.018))
  const availableWidth = Math.max(1, input.canvasWidth - horizontalMargin * 2 - gap * (input.cols - 1))
  const width = Math.max(28 * dpr, Math.min(72 * dpr, availableWidth / input.cols))
  const height = Math.max(14 * dpr, Math.min(26 * dpr, width * 0.42, input.canvasHeight * 0.045))
  const rowGap = Math.max(6 * dpr, Math.min(12 * dpr, height * 0.42))
  const totalWidth = width * input.cols + gap * (input.cols - 1)

  return {
    width,
    height,
    gap,
    rowGap,
    left: Math.max(0, (input.canvasWidth - totalWidth) / 2),
    top: Math.max(70 * dpr, input.canvasHeight * 0.14),
    rows: input.rows,
    cols: input.cols,
    radius: Math.max(4 * dpr, Math.min(8 * dpr, height * 0.28)),
  }
}

export function createBreakoutLaunchVelocity(options: {
  level: number
  dpr: number
  random?: () => number
}): { vx: number; vy: number } {
  const random = options.random ?? Math.random
  const dpr = Math.max(1, options.dpr)
  // Exponential difficulty curve: 1.08^(level-1) for better late-game tension
  const levelBoost = Math.min(2.0, Math.pow(1.08, Math.max(0, options.level - 1)))
  const speed = 4.5 * dpr * levelBoost
  const launchSpread = Math.PI / 3.4
  const angle = (random() - 0.5) * launchSpread

  return {
    vx: speed * Math.sin(angle),
    vy: -Math.abs(speed * Math.cos(angle)),
  }
}

export function normalizeBreakoutPowerUpId(id: string): string {
  const legacyMap: Record<string, string> = {
    wider_paddle: 'wide_paddle',
    sticky: 'sticky_paddle',
    lasers: 'laser',
    shrink: 'narrow_paddle',
  }
  return legacyMap[id] ?? id
}

class BreakoutGame extends GameEngine {
  private readonly maxLivesBase = 3
  private readonly maxLevelTextTime = 1400
  private readonly stageProgression: StageVariant[] = ['standard', 'pyramid', 'walls', 'fortress', 'chaos', 'boss']

  private theme = getTheme('breakout')
  private score = 0
  private lives = this.maxLivesBase
  private level = 1
  private bricksDestroyed = 0
  private totalBricks = 0
  private gameTime = 0

  private paddle: Paddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    speed: 0,
    radius: 0,
  }

  private balls: Ball[] = []
  private bricks: Brick[] = []
  private bricksRemaining = 0

  private serveTimer = 0
  private levelTextTimer = this.maxLevelTextTime
  private gameOver = false
  private gameOverTriggered = false

  private powerUps: PowerUpEntity[] = []
  private powerUpsCollectedThisRun = new Set<string>()
  private activeEffects: ActiveEffect[] = []
  private basePaddleWidth = 0
  private laserCooldownMs = 0
  private laserBullets: LaserBullet[] = []

  private ballPool!: ObjectPool<Ball>
  private powerUpPool!: ObjectPool<PowerUpEntity>
  private stickyBall: Ball | null = null
  private stickyActive = false
  private laserActive = false
  private dropRateBonus = 0

  private effects: EffectsManager = new EffectsManager()
  private ballTrails: BallTrail[] = []
  private comboCount = 0
  private comboTimer = 0
  private paddleEntranceDone = false
  private idlePhase = 0

  private modifierCodex!: ModifierCodexManager
  private activeModifiers: string[] = []

  protected init(): void {
    void preloadGameSprites('breakout')
    void preloadKenneySprites('breakout')

    this.modifierCodex = new ModifierCodexManager()
    const bonuses = this.modifierCodex.getActiveBonuses()

    this.score = 0
    this.lives = this.maxLivesBase + bonuses.startingLives
    this.level = 1
    this.bricksDestroyed = 0
    this.totalBricks = 0
    this.gameTime = 0
    this.gameOver = false
    this.gameOverTriggered = false

    this.releaseAllPowerUps()
    this.powerUpsCollectedThisRun = new Set()
    this.activeEffects = []
    this.laserBullets = []
    this.stickyBall = null
    this.stickyActive = false
    this.laserActive = false
    this.laserCooldownMs = 0
    this.dropRateBonus = bonuses.powerUpDropBonus

    this.effects = new EffectsManager()
    this.ballTrails = []
    this.comboCount = 0
    this.comboTimer = 0
    this.activeModifiers = []

    this.setupPaddleAndBall()
    this.createLevelBricks()
    this.resetBallOnPaddle()

    this.callbacks.onScoreUpdate?.(this.score)
    this.pushStats()
  }

  private setupPaddleAndBall(): void {
    const bonuses = this.modifierCodex.getActiveBonuses()
    const baseSpeed = 6.5 * this.dpr
    const paddleSpeed = baseSpeed * (1 + bonuses.paddleSpeedBonus)

    this.paddle = {
      x: (this.width - this.paddle.width) / 2,
      y: this.height - Math.max(40 * this.dpr, this.height * 0.1),
      width: Math.max(70 * this.dpr, this.width * 0.22),
      height: Math.max(10 * this.dpr, this.width * 0.032),
      speed: paddleSpeed,
      radius: Math.max(5 * this.dpr, this.width * 0.015),
    }
    this.basePaddleWidth = this.paddle.width
    this.ballPool = new ObjectPool<Ball>(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, radius: 0, active: false }),
      (ball) => { ball.x = 0; ball.y = 0; ball.vx = 0; ball.vy = 0; ball.active = false },
      3,
    )
    this.powerUpPool = new ObjectPool<PowerUpEntity>(
      () => ({ x: 0, y: 0, width: 0, height: 0, vy: 0, def: POWERUP_DEFS[0]! }),
      (pu) => { pu.x = 0; pu.y = 0; pu.width = 0; pu.height = 0; pu.vy = 0; pu.def = POWERUP_DEFS[0]! },
    )
    this.balls = [this.createBall()]
    this.serveTimer = 700
  }

  private createBall(): Ball {
    const ball = this.ballPool.acquire()
    ball.x = this.paddle.x + this.paddle.width / 2
    ball.y = this.paddle.y - 8 * this.dpr
    ball.vx = 0
    ball.vy = 0
    ball.radius = Math.max(6 * this.dpr, this.width * 0.018)
    ball.active = true
    return ball
  }

  private createLevelBricks(): void {
    this.bricks = []
    this.totalBricks = 0

    const variantIdx = (this.level - 1) % this.stageProgression.length
    const variantType = this.stageProgression[variantIdx]!
    const layout = STAGE_LAYOUTS[variantType]!

    this.levelTextTimer = this.maxLevelTextTime
    this.createBricksForLayout(layout)
    this.bricksRemaining = this.totalBricks
  }

  private createBricksForLayout(layout: StageLayout): void {
    const { rows, cols, pattern, basePoints, bossConfig } = layout
    const metrics = computeBreakoutBrickMetrics({
      canvasWidth: this.width,
      canvasHeight: this.height,
      dpr: this.dpr,
      rows,
      cols,
    })
    const { width, height } = metrics

    if (pattern === 'boss' && bossConfig) {
      const bossWidth = Math.min(this.width * 0.26, width * 2.4)
      const bossHeight = Math.max(height * 1.8, 30 * this.dpr)
      const totalBossWidth = bossWidth * bossConfig.count + metrics.gap * (bossConfig.count - 1)
      const startX = (this.width - totalBossWidth) / 2
      for (let i = 0; i < bossConfig.count; i++) {
        this.bricks.push({
          x: startX + i * (bossWidth + metrics.gap),
          y: metrics.top + metrics.rowGap,
          width: bossWidth,
          height: bossHeight,
          radius: metrics.radius,
          color: bossConfig.color,
          points: basePoints,
          alive: true,
          hp: bossConfig.hp,
          maxHp: bossConfig.hp,
          isBoss: true,
          flashTimer: 0,
        })
        this.totalBricks += 1
      }
      return
    }

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const skip = this.shouldSkipBrick(pattern, row, col, rows, cols)
        if (skip) continue

        const x = metrics.left + col * (width + metrics.gap)
        const y = metrics.top + row * (height + metrics.rowGap)
        const color = `hsl(${(row * 60 + col * 30) % 360}, 65%, 55%)`
        const points = Math.round(basePoints * (1 + row * 0.5))

        this.bricks.push({
          x,
          y,
          width,
          height,
          radius: metrics.radius,
          color,
          points,
          alive: true,
          hp: 1,
          maxHp: 1,
          isBoss: false,
          flashTimer: 0,
        })
        this.totalBricks += 1
      }
    }
  }

  private shouldSkipBrick(
    pattern: StageLayout['pattern'],
    row: number,
    col: number,
    rows: number,
    cols: number
  ): boolean {
    if (pattern === 'fill') {
      return Math.random() > 0.85
    }

    if (pattern === 'pyramid') {
      const midCol = Math.floor(cols / 2)
      const offset = rows - row
      return col < midCol - offset || col > midCol + offset
    }

    if (pattern === 'edges') {
      const isEdge = row === 0 || row === rows - 1 || col === 0 || col === cols - 1
      return !isEdge && Math.random() > 0.7
    }

    if (pattern === 'random') {
      return Math.random() > 0.6
    }

    return false
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.effects.triggerShake(intensity, duration)
  }

  private spawnParticles(x: number, y: number, count: number, color: string, speedMult = 1) {
    this.effects.burst(x, y, count, [color, '#ffffff'], { min: 2 * speedMult, max: 8 * speedMult })
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, scale = 1) {
    this.effects.floatingText.spawn({ x, y, text, color })
  }

  private pushStats(): void {
    const stats: PlayerStats = {
      hp: this.lives,
      maxHp: this.maxLivesBase,
      level: this.level,
      xp: this.bricksDestroyed,
      xpToNext: 10,
      kills: this.bricksDestroyed,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const hudData: GameHudData = {
      hp: this.lives,
      maxHp: this.maxLivesBase,
      level: this.level,
      xp: this.bricksDestroyed,
      xpToNext: 10,
      kills: this.bricksDestroyed,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: [],
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private resetBallOnPaddle(): void {
    this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, (this.width - this.paddle.width) / 2))
    const ball = this.balls[0]
    if (ball) {
      ball.x = this.paddle.x + this.paddle.width / 2
      ball.y = this.paddle.y - ball.radius - 2 * this.dpr
      ball.vx = 0
      ball.vy = 0
    }
    this.stickyBall = null
    this.serveTimer = 700
  }

  private resolvePaddleInputX(_dt: number): void {
    const inputX = this.input.moveX
    if (Math.abs(inputX) > 0.1) {
      const moveX = inputX * this.paddle.speed
      this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x + moveX))
    } else {
      this.paddle.x = Math.max(0, Math.min(this.width - this.paddle.width, this.paddle.x))
    }
  }

  private updateServe(dt: number): boolean {
    if (this.serveTimer <= 0) {
      return false
    }

    this.serveTimer = Math.max(0, this.serveTimer - dt)
    const ball = this.balls[0]
    if (ball) {
      ball.x = this.paddle.x + this.paddle.width / 2
      ball.y = this.paddle.y - ball.radius - 2 * this.dpr
    }

    if (this.serveTimer === 0) {
      this.launchBall()
    }

    return true
  }

  private launchBall(ball: Ball | null = this.balls[0] ?? null): void {
    if (!ball) return
    const velocity = createBreakoutLaunchVelocity({ level: this.level, dpr: this.dpr })
    ball.vx = velocity.vx
    ball.vy = velocity.vy
    ball.active = true
    this.stickyBall = null
  }

  private getLevelBaseBallSpeed(): number {
    return Math.hypot(...Object.values(createBreakoutLaunchVelocity({ level: this.level, dpr: this.dpr, random: () => 0.5 })))
  }

  private updateStickyBall(): void {
    if (!this.stickyBall) return

    this.stickyBall.x = this.paddle.x + this.paddle.width / 2
    this.stickyBall.y = this.paddle.y - this.stickyBall.radius - 2 * this.dpr

    if (this.input.firePressed || this.input.actionPressed || Math.abs(this.input.moveY) > 0.35) {
      this.launchBall(this.stickyBall)
    }
  }

  private updateBalls(dt: number): void {
    for (const ball of this.balls) {
      if (!ball.active) continue
      if (ball === this.stickyBall) continue

      ball.x += ball.vx * (dt / 16.667)
      ball.y += ball.vy * (dt / 16.667)
      this.addBallTrail(ball.x, ball.y)

      if (ball.x - ball.radius <= 0) {
        ball.x = ball.radius
        ball.vx *= -1
      }
      if (ball.x + ball.radius >= this.width) {
        ball.x = this.width - ball.radius
        ball.vx *= -1
      }
      if (ball.y - ball.radius <= 0) {
        ball.y = ball.radius
        ball.vy *= -1
      }

      if (ball.y + ball.radius >= this.paddle.y) {
        if (ball.x >= this.paddle.x && ball.x <= this.paddle.x + this.paddle.width) {
          if (this.stickyActive && !this.stickyBall) {
            ball.vx = 0
            ball.vy = 0
            ball.y = this.paddle.y - ball.radius
            this.stickyBall = ball
            continue
          }

          const hitPos = (ball.x - this.paddle.x) / this.paddle.width
          const angle = (hitPos - 0.5) * Math.PI * 0.7
          const speed = Math.hypot(ball.vx, ball.vy) || this.getLevelBaseBallSpeed()
          ball.vx = speed * Math.sin(angle)
          ball.vy = -Math.abs(speed * Math.cos(angle))
          ball.y = this.paddle.y - ball.radius
        }
      }

      for (const brick of this.bricks) {
        if (!brick.alive) continue
        if (this.collidesBallBrick(ball, brick)) {
          brick.hp -= 1
          brick.flashTimer = 100
          ball.vy *= -1
          if (brick.hp <= 0) {
            brick.alive = false
            this.bricksDestroyed += 1
            this.bricksRemaining -= 1
            this.score += brick.points
            this.callbacks.onScoreUpdate?.(this.score)
            this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, 10, brick.color, 1)
            this.maybeSpawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2)
            if (brick.isBoss) {
              this.triggerScreenShake(8, 250)
            }
          } else {
            this.triggerScreenShake(3, 120)
          }
          break
        }
      }

      if (ball.y + ball.radius > this.height + ball.radius * 2) {
        const idx = this.balls.indexOf(ball)
        if (idx !== -1) {
          this.ballPool.release(ball)
          this.balls.splice(idx, 1)
        }
        if (this.balls.length === 0) {
          this.lives -= 1
          if (this.lives <= 0) {
            this.gameOver = true
            this.callbacks.onGameOver?.(this.score)
          } else {
            this.balls = [this.createBall()]
            this.resetBallOnPaddle()
          }
        }
      }
    }
  }

  private collidesBallBrick(ball: Ball, brick: Brick): boolean {
    const closestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width))
    const closestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height))
    const dx = ball.x - closestX
    const dy = ball.y - closestY
    return dx * dx + dy * dy <= ball.radius * ball.radius
  }

  private updateActiveEffects(dt: number): void {
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i]
      if (!effect) continue
      effect.remainingMs -= dt
      if (effect.remainingMs <= 0) {
        this.expirePowerUpEffect(effect.id)
        this.activeEffects.splice(i, 1)
      }
    }
  }

  private expirePowerUpEffect(id: string): void {
    if (id === 'wide_paddle' || id === 'narrow_paddle') {
      this.paddle.width = this.basePaddleWidth
    }
    if (id === 'sticky_paddle') {
      this.stickyActive = false
      if (this.stickyBall) {
        this.launchBall(this.stickyBall)
      }
    }
    if (id === 'laser') {
      this.laserActive = false
    }
  }

  private updatePowerUps(dt: number): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      if (!powerUp) continue
      powerUp.y += powerUp.vy * (dt / 16.667)

      if (powerUp.y + powerUp.height > this.paddle.y &&
          powerUp.y < this.paddle.y + this.paddle.height &&
          powerUp.x + powerUp.width > this.paddle.x &&
          powerUp.x < this.paddle.x + this.paddle.width) {
        this.collectPowerUp(powerUp.def)
        this.powerUpPool.release(powerUp)
        this.powerUps.splice(i, 1)
        continue
      }

      if (powerUp.y > this.height) {
        this.powerUpPool.release(powerUp)
        this.powerUps.splice(i, 1)
      }
    }
  }

  private collectPowerUp(def: BreakoutPowerUpDef): void {
    const effectId = normalizeBreakoutPowerUpId(def.id)
    switch (effectId) {
      case 'wide_paddle':
        this.paddle.width = this.basePaddleWidth * 1.5
        this.activeEffects.push({ id: effectId, remainingMs: def.durationMs, totalMs: def.durationMs })
        break
      case 'multi_ball':
        for (let i = 0; i < 2; i += 1) {
          const source = this.balls.find((b) => b !== this.stickyBall) ?? this.balls[0]
          if (!source) break
          const speed = Math.hypot(source.vx, source.vy) || this.getLevelBaseBallSpeed()
          const baseAngle = Math.atan2(source.vx, -source.vy)
          const angle = baseAngle + (i === 0 ? -0.34 : 0.34)
          const newBall = this.ballPool.acquire()
          Object.assign(newBall, source)
          newBall.vx = speed * Math.sin(angle)
          newBall.vy = -Math.abs(speed * Math.cos(angle))
          newBall.active = true
          this.ballPool.release(source)
          this.balls.push(newBall)
        }
        break
      case 'sticky_paddle':
        this.stickyActive = true
        this.activeEffects.push({ id: effectId, remainingMs: def.durationMs, totalMs: def.durationMs })
        break
      case 'laser':
        this.laserActive = true
        this.activeEffects.push({ id: effectId, remainingMs: def.durationMs, totalMs: def.durationMs })
        break
      case 'narrow_paddle':
        this.paddle.width = this.basePaddleWidth * 0.7
        this.activeEffects.push({ id: effectId, remainingMs: def.durationMs, totalMs: def.durationMs })
        break
      case 'slow_ball':
        this.scaleActiveBallSpeed(0.72)
        this.activeEffects.push({ id: effectId, remainingMs: def.durationMs, totalMs: def.durationMs })
        break
      case 'speed_ball':
        this.scaleActiveBallSpeed(1.22)
        this.activeEffects.push({ id: effectId, remainingMs: def.durationMs, totalMs: def.durationMs })
        break
      case 'extra_life':
        this.lives = Math.min(this.lives + 1, this.maxLivesBase + 2)
        break
    }
    this.powerUpsCollectedThisRun.add(effectId)
    this.spawnFloatingText(this.width / 2, this.height / 2, `+${def.name}`, '#4ade80', 1.2)
    this.triggerScreenShake(4, 150)
  }

  private scaleActiveBallSpeed(multiplier: number): void {
    for (const ball of this.balls) {
      if (ball === this.stickyBall) continue
      ball.vx *= multiplier
      ball.vy *= multiplier
    }
  }

  private maybeSpawnPowerUp(x: number, y: number): void {
    const defs = Object.values(POWERUP_DEFS)
    const chance = Math.min(0.32, 0.16 + this.dropRateBonus)
    if (Math.random() > chance || defs.length === 0) return

    const totalWeight = defs.reduce((sum, def) => sum + def.spawnWeight, 0)
    let roll = Math.random() * totalWeight
    const selected = defs.find((def) => {
      roll -= def.spawnWeight
      return roll <= 0
    }) ?? defs[0]

    if (!selected) return
    const powerUp = this.powerUpPool.acquire()
    powerUp.x = x - 13 * this.dpr
    powerUp.y = y - 13 * this.dpr
    powerUp.width = 26 * this.dpr
    powerUp.height = 26 * this.dpr
    powerUp.vy = 2.2 * this.dpr
    powerUp.def = selected
    this.powerUps.push(powerUp)
  }

  private updateLasers(dt: number): void {
    if (!this.laserActive) return
    this.laserCooldownMs -= dt
    if (this.laserCooldownMs <= 0) {
      this.laserCooldownMs = 200
      this.laserBullets.push({
        x: this.paddle.x,
        y: this.paddle.y - 5,
        vy: -8,
        width: 4 * this.dpr,
        height: 10 * this.dpr,
      })
      this.laserBullets.push({
        x: this.paddle.x + this.paddle.width,
        y: this.paddle.y - 5,
        vy: -8,
        width: 4 * this.dpr,
        height: 10 * this.dpr,
      })
    }

    for (let i = this.laserBullets.length - 1; i >= 0; i--) {
      const bullet = this.laserBullets[i]
      if (!bullet) continue
      bullet.y += bullet.vy * (dt / 16.667)
      if (bullet.y < -bullet.height) {
        this.laserBullets.splice(i, 1)
        continue
      }

      for (const brick of this.bricks) {
        if (!brick.alive) continue
        if (bullet.x < brick.x + brick.width && bullet.x + bullet.width > brick.x &&
            bullet.y < brick.y + brick.height && bullet.y + bullet.height > brick.y) {
          brick.hp -= 1
          brick.flashTimer = 50
          this.laserBullets.splice(i, 1)
          if (brick.hp <= 0) {
            brick.alive = false
            this.bricksDestroyed += 1
            this.bricksRemaining -= 1
            this.score += brick.points
            this.callbacks.onScoreUpdate?.(this.score)
            this.spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, 8, brick.color)
          }
          break
        }
      }
    }
  }

  private checkLevelClear(): void {
    if (this.bricksRemaining <= 0) {
      this.level += 1
      this.releaseAllBalls()
      this.releaseAllPowerUps()
      this.laserBullets = []
      this.stickyBall = null
      this.stickyActive = false
      this.laserActive = false
      this.activeEffects = []
      this.createLevelBricks()
      this.balls = [this.ballPool.acquire()]
      this.resetBallOnPaddle()
      this.triggerScreenShake(6, 200)
      this.spawnFloatingText(this.width / 2, this.height / 2, `Level ${this.level}!`, '#fbbf24', 1.5)
    }
  }

  private updateComboTimer(dt: number) {
    if (this.comboCount > 0) {
      this.comboTimer += dt
      if (this.comboTimer > 3000) {
        this.comboCount = 0
        this.comboTimer = 0
      }
    }
  }

  private triggerComboText() {
    this.comboTimer = 0
    if (this.comboCount >= 3) {
      this.effects.combo.onHit()
      const text = this.comboCount >= 5 ? `${this.comboCount}x 連擊!` : `${this.comboCount}x`
      const scale = 1 + this.comboCount * 0.08
      this.effects.floatingText.spawn({
        x: this.width / 2,
        y: this.height * 0.3,
        text,
        color: '#fbbf24',
      })
    }
  }

  protected update(dt: number): void {
    this.gameTime += dt

    if (!this.gameOver) {
      if (this.levelTextTimer > 0) {
        this.levelTextTimer = Math.max(0, this.levelTextTimer - dt)
      }

      this.resolvePaddleInputX(dt)
      this.updateStickyBall()
      if (!this.updateServe(dt)) {
        this.updateBalls(dt)
      }
      this.updateActiveEffects(dt)
      this.updatePowerUps(dt)
      this.updateLasers(dt)
      this.checkLevelClear()
      this.updateComboTimer(dt)
    }

    this.effects.update(dt)
    this.updateBallTrails(dt)
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.save()

    this.effects.shake.apply(ctx)

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = 'rgba(2, 4, 12, 0.94)'
    ctx.fillRect(0, 0, this.width, this.height)

    this.renderBallTrails(ctx)
    this.renderBricks(ctx)
    this.renderPaddle(ctx)
    this.renderBalls(ctx)
    this.renderPowerUps(ctx)
    this.renderLasers(ctx)
    this.renderLives(ctx)
    this.renderActiveEffects(ctx)
    this.effects.render(ctx)
    this.renderHudText(ctx)
    this.renderLevelText(ctx)
    this.renderComboText(ctx)
    this.renderGameOver(ctx)

    ctx.restore()
  }

  private renderBricks(ctx: CanvasRenderingContext2D): void {
    const brickSpritePool = [
      'breakout.brick-red',
      'breakout.brick-blue',
      'breakout.brick-green',
      'breakout.brick-yellow',
      'breakout.brick-purple',
      'breakout.brick-cyan',
      'breakout.brick-orange',
    ]

    for (const brick of this.bricks) {
      if (!brick.alive) continue

      if (brick.flashTimer > 0) {
        brick.flashTimer -= 16
        ctx.globalAlpha = 1 - brick.flashTimer / 100
      } else {
        ctx.globalAlpha = 1
      }

      const colorHue = Number.parseInt(brick.color?.replace('hsl(', '').replace(')', '').split(',')[0] ?? '0', 10)
      const spriteIdx = Math.floor(colorHue / (360 / brickSpritePool.length)) % brickSpritePool.length
      const spriteKey = brickSpritePool[spriteIdx]
      if (!spriteKey) continue

      const drew = drawKenneySprite(ctx, spriteKey, {
        x: brick.x + brick.width / 2,
        y: brick.y + brick.height / 2,
        scaleX: brick.width / 32,
        scaleY: brick.height / 32,
        alpha: brick.flashTimer > 0 ? 1 - brick.flashTimer / 100 : 1,
      })

      if (!drew) {
        if (brick.flashTimer > 0) {
          ctx.fillStyle = '#ffffff'
        } else {
          ctx.fillStyle = brick.color
        }

        this.drawRoundedRect(ctx, brick.x, brick.y, brick.width, brick.height, brick.radius)
        ctx.fill()

        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1
  }

  private renderPaddle(ctx: CanvasRenderingContext2D): void {
    const drew = drawKenneySprite(ctx, 'breakout.paddle', {
      x: this.paddle.x + this.paddle.width / 2,
      y: this.paddle.y + this.paddle.height / 2,
      scaleX: this.paddle.width / 32,
      scaleY: this.paddle.height / 32,
    })

    if (!drew) {
      ctx.fillStyle = '#60a5fa'
      this.drawRoundedRect(ctx, this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, this.paddle.radius)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      this.drawRoundedRect(ctx, this.paddle.x + 4 * this.dpr, this.paddle.y + 2 * this.dpr,
        this.paddle.width - 8 * this.dpr, this.paddle.height / 2, this.paddle.radius / 2)
      ctx.fill()
    }
  }

  private renderBalls(ctx: CanvasRenderingContext2D): void {
    for (const ball of this.balls) {
      if (!ball.active) continue

      const drew = drawKenneySprite(ctx, 'breakout.ball', {
        x: ball.x,
        y: ball.y,
        scaleX: (ball.radius * 2) / 16,
        scaleY: (ball.radius * 2) / 16,
      })

      if (!drew) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath()
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private renderPowerUps(ctx: CanvasRenderingContext2D): void {
    for (const powerUp of this.powerUps) {
      const effectId = normalizeBreakoutPowerUpId(powerUp.def.id)
      const drew = drawKenneySprite(ctx, 'breakout.powerup', {
        x: powerUp.x + powerUp.width / 2,
        y: powerUp.y + powerUp.height / 2,
        scaleX: powerUp.width / 32,
        scaleY: powerUp.height / 32,
      })

      if (!drew) {
        const colors: Record<string, string> = {
          wide_paddle: '#60a5fa',
          multi_ball: '#f472b6',
          sticky_paddle: '#a78bfa',
          laser: '#fbbf24',
          narrow_paddle: '#f87171',
          slow_ball: '#67e8f9',
          speed_ball: '#dc2626',
          extra_life: '#f43f5e',
        }
        ctx.fillStyle = colors[effectId] || powerUp.def.color
        this.drawRoundedRect(ctx, powerUp.x, powerUp.y, powerUp.width, powerUp.height, 6 * this.dpr)
        ctx.fill()
        drawKawaiiCanvasIcon(
          ctx,
          powerUp.x + powerUp.width / 2,
          powerUp.y + powerUp.height / 2,
          Math.min(powerUp.width, powerUp.height) * 0.76,
          canvasIconKindForItem(powerUp.def.icon),
          { color: '#fff7ed', ink: '#271b23' },
        )
      }
    }
  }

  private renderLasers(ctx: CanvasRenderingContext2D): void {
    for (const bullet of this.laserBullets) {
      const drew = drawKenneySprite(ctx, 'breakout.laser', {
        x: bullet.x + bullet.width / 2,
        y: bullet.y + bullet.height / 2,
        scaleX: (bullet.width * 2) / 16,
        scaleY: (bullet.height * 2) / 16,
      })

      if (!drew) {
        ctx.fillStyle = '#fbbf24'
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
      }
    }
  }

  private renderActiveEffects(ctx: CanvasRenderingContext2D): void {
    let y = 40 * this.dpr
    for (const effect of this.activeEffects) {
      const progress = effect.remainingMs / effect.totalMs
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(10 * this.dpr, y, 100 * this.dpr * progress, 8 * this.dpr)
      y += 14 * this.dpr
    }
  }

  private renderComboText(ctx: CanvasRenderingContext2D): void {
    if (this.comboCount < 3) return
    const scale = 1 + this.comboCount * 0.08
    ctx.globalAlpha = 0.8
    ctx.fillStyle = '#fbbf24'
    ctx.font = `bold ${Math.floor(24 * this.dpr * scale)}px ${this.theme.font.family}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${this.comboCount}x 連擊!`, this.width / 2, this.height * 0.2)
    ctx.globalAlpha = 1
  }

  private addBallTrail(x: number, y: number) {
    this.ballTrails.push({ x, y, alpha: 1 })
    if (this.ballTrails.length > 30) this.ballTrails.shift()
  }

  private updateBallTrails(dt: number) {
    for (let i = this.ballTrails.length - 1; i >= 0; i--) {
      this.ballTrails[i]!.alpha -= dt / 500
      if (this.ballTrails[i]!.alpha <= 0) this.ballTrails.splice(i, 1)
    }
  }

  private renderBallTrails(ctx: CanvasRenderingContext2D) {
    for (const trail of this.ballTrails) {
      const drew = drawKenneySprite(ctx, 'breakout.ball', {
        x: trail.x,
        y: trail.y,
        scaleX: (6 * this.dpr) / 16,
        scaleY: (6 * this.dpr) / 16,
        alpha: trail.alpha * 0.5,
      })

      if (!drew) {
        ctx.globalAlpha = trail.alpha * 0.5
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(trail.x, trail.y, 3 * this.dpr, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }
    ctx.globalAlpha = 1
  }

  private renderLives(ctx: CanvasRenderingContext2D) {
    const radius = 5 * this.dpr
    const spacing = 16 * this.dpr
    const xStart = 20 * this.dpr
    const y = 20 * this.dpr

    const displayMax = Math.max(this.maxLivesBase, this.lives)
    for (let i = 0; i < displayMax; i++) {
      const x = xStart + i * spacing
      ctx.globalAlpha = i < this.lives ? 1 : 0.25
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalAlpha = 1
  }

  private renderHudText(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(248, 250, 252, 0.92)'
    ctx.font = `${12 * this.dpr}px ${this.theme.font.family}`
    ctx.textAlign = 'right'
    ctx.fillText(`分數 ${this.score}`, this.width - 14 * this.dpr, 24 * this.dpr)
  }

  private renderLevelText(ctx: CanvasRenderingContext2D) {
    if (this.levelTextTimer <= 0) return

    const alpha = Math.min(1, this.levelTextTimer / this.maxLevelTextTime)
    const variantIdx = (this.level - 1) % this.stageProgression.length
    const layout = STAGE_LAYOUTS[this.stageProgression[variantIdx]!]!

    ctx.globalAlpha = alpha
    ctx.fillStyle = '#e2e8f0'
    ctx.font = `bold ${28 * this.dpr}px ${this.theme.font.family}`
    ctx.textAlign = 'center'
    ctx.fillText(`第 ${this.level} 關`, this.width / 2, this.height * 0.5)
    drawKawaiiInlineLabel(ctx, {
      x: this.width / 2,
      y: this.height * 0.56,
      text: layout.name,
      iconKind: canvasIconKindForItem(layout.icon),
      color: '#f8fafc',
      fontSize: 16 * this.dpr,
      align: 'center',
    })
    ctx.globalAlpha = 1
  }

  private renderGameOver(ctx: CanvasRenderingContext2D) {
    if (!this.gameOver) return

    ctx.fillStyle = this.theme.ui.surface
    ctx.fillRect(0, 0, this.width, this.height)
    ctx.fillStyle = '#f8fafc'
    ctx.textAlign = 'center'
    ctx.font = `bold ${32 * this.dpr}px ${this.theme.font.family}`
    ctx.fillText('遊戲結束', this.width / 2, this.height * 0.48)
    ctx.font = `${16 * this.dpr}px ${this.theme.font.family}`
    ctx.fillText(`最終分數 ${this.score}`, this.width / 2, this.height * 0.54)
  }

  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + width - r, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + r)
    ctx.lineTo(x + width, y + height - r)
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
    ctx.lineTo(x + r, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  private releaseAllBalls(): void {
    for (const ball of this.balls) {
      this.ballPool.release(ball)
    }
    this.balls = []
  }

  private releaseAllPowerUps(): void {
    for (const powerUp of this.powerUps) {
      this.powerUpPool.release(powerUp)
    }
    this.powerUps = []
  }
}

export function createBreakoutGame(): GameInstance {
  return new BreakoutGame()
}
