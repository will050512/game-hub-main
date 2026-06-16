import { GameEngine } from '@/engine/GameEngine'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKenneySprite, preloadKenneySprites } from '@/engine/sprites/kenneySpriteLoader'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type GameHudData,
} from '@/types'
import { getTheme } from '@/engine/art/KawaiiTheme'
import { GameOverlay } from '@/engine/GameOverlay'
import { drawKawaiiBackground } from '@/engine/kawaiiCanvas'
import { drawKawaiiPanel } from '@/engine/kawaiiCanvas'
import type { GamePhase } from '@/engine/GameStateMachine'

type GameState = 'ready' | 'playing' | 'dying' | 'gameover'
type RingType = 'gold' | 'silver' | 'bronze'

interface PipePair {
  x: number
  width: number
  gapY: number
  gapHeight: number
  passed: boolean
  ring?: RingGate
}

interface RingGate {
  type: RingType
  x: number
  y: number
  radius: number
  collected: boolean
  points: number
  pulseTimer: number
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

class FlappyGame extends GameEngine {
  private readonly baseGravity = 0.3
  private readonly baseFlapVelocity = -5.35
  private readonly basePipeSpeed = 2.15
  private readonly pipeSpawnInterval = 2000
  private readonly gameOverDelay = 700

  private theme = getTheme('flappy')
  /** Separate overlay instance for game-specific state/scores (not the base class's unified overlay) */
  private gameOverlay = new GameOverlay()

  private state: GameState = 'ready'
  private score = 0
  private elapsedMs = 0
  private gameOverTimer = 0
  private gameOverSent = false
  private ringCombo = 0
  private ringComboTimer = 0
  private readonly ringComboWindow = 3000

  private birdX = 0
  private birdY = 0
  private birdVelocityY = 0
  private birdRadius = 0
  private birdRotation = 0
  private readyBobTimer = 0

  private pipeWidth = 0
  private pipeSpawnTimer = 0
  private pipes: PipePair[] = []

  private particles: Particle[] = []
  private screenShake: ScreenShake | null = null
  private floatingTexts: FloatingText[] = []

  private groundHeight = 0
  private keyboardBound = false
  private pointerBound = false
  private touchBound = false

  constructor() {
    super()
  }

  protected init(): void {
    void preloadGameSprites('flappy')
    void preloadKenneySprites('flappy')
    this.state = 'ready'
    this.score = 0
    this.elapsedMs = 0
    this.gameOverTimer = 0
    this.gameOverSent = false
    this.ringCombo = 0
    this.ringComboTimer = 0

    this.groundHeight = Math.max(56 * this.dpr, this.height * 0.14)
    this.birdRadius = Math.max(9 * this.dpr, this.width * 0.026)
    this.pipeWidth = Math.max(44 * this.dpr, this.width * 0.14)

    this.gameOverlay.setSize(this.width, this.height)

    this.birdX = this.width * 0.3
    this.birdY = this.height * 0.42
    this.birdVelocityY = 0
    this.birdRotation = 0
    this.readyBobTimer = 0

    this.pipeSpawnTimer = 0
    this.pipes = []

    this.particles = []
    this.screenShake = null
    this.floatingTexts = []

    this.callbacks.onScoreUpdate?.(this.score)

    this.stateMachine.startIntro()
    this.bindInputListeners()

    this.pushStats()
  }

  override stop(): void {
    this.unbindInputListeners()
    this.stateMachine.reset()
    super.stop()
  }

  protected update(dt: number): void {
    this.stateMachine.update(dt)

    const dtScale = dt / 16.667
    this.elapsedMs += dt

    if (this.state === 'ready') {
      this.readyBobTimer += dt
      const bobOffset = Math.sin(this.readyBobTimer / 220) * (5 * this.dpr)
      this.birdY = this.height * 0.42 + bobOffset
      this.birdRotation = Math.sin(this.readyBobTimer / 300) * 0.08
      this.pushStats()
      return
    }

    if (this.state === 'dying') {
      this.updateBirdPhysics(dtScale)
      this.gameOverTimer += dt
      if (this.gameOverTimer >= this.gameOverDelay && !this.gameOverSent) {
        this.state = 'gameover'
        this.gameOverSent = true
        const callbacks: GameCallbacks = this.callbacks
        callbacks.onRewardEvent?.({
          schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
          gameId: 'flappy',
          emittedAt: new Date().toISOString(),
          score: this.score,
          rewards: createRewardPayload(),
          result: {
            score: this.score,
            kills: this.score,
            time: Math.floor(this.elapsedMs / 1000),
            level: 1,
            coins: 0,
          },
        })
        callbacks.onGameOver?.(this.score)
      }
      this.pushStats()
      return
    }

    if (this.state === 'gameover') {
      this.pushStats()
      return
    }

    this.updateBirdPhysics(dtScale)
    this.updatePipes(dt, dtScale)
    this.updateRings(dt)

    if (this.checkCollision()) {
      this.triggerDeath()
    }

    this.pushStats()

    this.updateParticles(dt)
    this.updateFloatingTexts(dt)
    this.updateScreenShake(dt)
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.screenShake = { x: 0, y: 0, intensity, duration, elapsed: 0 }
  }

  private spawnParticles(x: number, y: number, count: number, color: string, speedMult = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (2 + Math.random() * 4) * speedMult
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 2 + Math.random() * 4,
        color,
        alpha: 1,
        life: 400 + Math.random() * 200,
        maxLife: 600,
      })
    }
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

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.x += p.vx * (dt / 16.667)
      p.y += p.vy * (dt / 16.667)
      p.vy += 0.15
      p.life -= dt
      p.alpha = Math.max(0, p.life / p.maxLife)
      if (p.life <= 0) this.particles.splice(i, 1)
    }
    if (this.particles.length > 150) this.particles.splice(0, this.particles.length - 150)
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

    const flappyTheme = { base: '#87ceeb', soft: '#b0e0f0', accent: '#facc15', ink: '#5cc1f0', blush: '#f0f9ff' }
    drawKawaiiBackground(ctx, this.width, this.height, this.frameTick, flappyTheme)

    this.drawCloudBands(ctx)
    this.drawPipes(ctx)
    this.drawRings(ctx)
    this.drawGround(ctx)
    this.drawBird(ctx)
    this.drawScore(ctx)

    if (this.state === 'ready') {
      const panelWidth = Math.max(170 * this.dpr, this.width * 0.4)
      const panelHeight = Math.max(70 * this.dpr, this.height * 0.12)
      drawKawaiiPanel(ctx, this.width / 2 - panelWidth / 2, this.height * 0.24, panelWidth, panelHeight, {
        fill: 'rgba(255, 250, 245, 0.92)',
        accent: '#93c5fd',
        radius: 20,
      })
      ctx.fillStyle = '#2a1e25'
      ctx.textAlign = 'center'
      ctx.font = `bold ${Math.max(16, Math.floor(17 * this.dpr))}px ${this.theme.font.family}`
      ctx.fillText('TAP TO START', this.width / 2, this.height * 0.32)
      ctx.font = `${Math.max(11, Math.floor(12 * this.dpr))}px ${this.theme.font.family}`
      ctx.fillText('Space / ArrowUp / Tap', this.width / 2, this.height * 0.36)
    }

    if (this.state === 'gameover') {
      this.gameOverlay.render(ctx, {
        state: 'gameover' as GamePhase,
        score: this.score,
        level: 1,
        lives: 1,
        maxLives: 1,
        gameTime: Math.floor(this.elapsedMs / 1000),
        gameName: 'Flappy Bird',
        gameColor: this.theme.ui.accent,
        dpr: this.dpr,
        introProgress: 0,
      })
    }

    this.renderParticles(ctx)
    this.renderFloatingTexts(ctx)

    if (this.screenShake) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const t of this.floatingTexts) {
      ctx.globalAlpha = t.alpha
      ctx.fillStyle = t.color
      ctx.font = `bold ${16 * t.scale}px sans-serif`
      ctx.fillText(t.text, t.x, t.y)
    }
    ctx.globalAlpha = 1
  }

  private bindInputListeners(): void {
    if (!this.keyboardBound) {
      window.addEventListener('keydown', this.handleKeyDown)
      this.keyboardBound = true
    }
    if (!this.pointerBound) {
      this.canvas.addEventListener('pointerdown', this.handlePointerDown)
      this.pointerBound = true
    }
    if (!this.touchBound) {
      this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false })
      this.touchBound = true
    }
  }

  private unbindInputListeners(): void {
    if (this.keyboardBound) {
      window.removeEventListener('keydown', this.handleKeyDown)
      this.keyboardBound = false
    }
    if (this.pointerBound) {
      this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
      this.pointerBound = false
    }
    if (this.touchBound) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart)
      this.touchBound = false
    }
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== 'Space' && event.code !== 'ArrowUp') {
      return
    }
    event.preventDefault()
    this.performFlapAction()
  }

  private handlePointerDown = (_event: PointerEvent): void => {
    this.performFlapAction()
  }

  private handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault()
    this.performFlapAction()
  }

  private performFlapAction(): void {
    if (this.state === 'gameover') {
      this.init()
      return
    }

    if (this.state === 'dying') {
      return
    }

    if (this.state === 'ready') {
      this.state = 'playing'
      this.pipeSpawnTimer = this.pipeSpawnInterval * 0.55
    }

    this.birdVelocityY = this.baseFlapVelocity * this.dpr
    this.birdRotation = -0.5
  }

  private updateBirdPhysics(dtScale: number): void {
    this.birdVelocityY += this.baseGravity * this.dpr * dtScale
    this.birdY += this.birdVelocityY * dtScale

    const maxUp = -0.65
    const maxDown = 1.05
    const velocityNorm = this.birdVelocityY / (7 * this.dpr)
    this.birdRotation = Math.max(maxUp, Math.min(maxDown, velocityNorm))
  }

  private updatePipes(dt: number, dtScale: number): void {
    this.pipeSpawnTimer += dt

    while (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
      this.pipeSpawnTimer -= this.pipeSpawnInterval
      this.spawnPipePair()
    }

    const earlyPace = Math.min(1, 0.86 + this.score * 0.025)
    const speed = this.basePipeSpeed * earlyPace * this.dpr * dtScale
    for (const pipe of this.pipes) {
      pipe.x -= speed

      if (!pipe.passed && pipe.x + pipe.width < this.birdX) {
        pipe.passed = true
        this.score += 1
        this.callbacks.onScoreUpdate?.(this.score)
        this.spawnParticles(this.birdX + 30, this.birdY, 8, '#4ecdc4', 0.8)
        this.spawnFloatingText(this.birdX + 40, this.birdY - 25, '+1', '#4ecdc4', 0.8)
      }

      if (pipe.ring) {
        pipe.ring.x -= speed
        pipe.ring.pulseTimer += dt
      }
    }

    let writeIdx = 0
    for (let i = 0; i < this.pipes.length; i++) {
      const pipe = this.pipes[i]!
      if (pipe.x + pipe.width > -4 * this.dpr) {
        this.pipes[writeIdx] = pipe
        writeIdx++
      }
    }
    this.pipes.length = writeIdx
  }

  private updateRings(dt: number): void {
    if (this.ringComboTimer > 0) {
      this.ringComboTimer -= dt
      if (this.ringComboTimer <= 0) {
        this.ringCombo = 0
      }
    }

    for (const pipe of this.pipes) {
      const ring = pipe.ring
      if (!ring || ring.collected) continue

      const dx = this.birdX - ring.x
      const dy = this.birdY - ring.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < this.birdRadius + ring.radius) {
        this.collectRing(ring)
      }
    }
  }

  private collectRing(ring: RingGate): void {
    ring.collected = true
    this.ringCombo += 1
    this.ringComboTimer = this.ringComboWindow

    const comboMultiplier = Math.min(this.ringCombo, 5)
    const points = ring.points * comboMultiplier
    this.score += points

    this.callbacks.onScoreUpdate?.(this.score)

    const color = this.getRingColor(ring.type)
    this.spawnParticles(ring.x, ring.y, 15, color, 1.2)
    this.triggerScreenShake(3, 120)

    const comboText = this.ringCombo > 1 ? ` ×${this.ringCombo}` : ''
    this.spawnFloatingText(ring.x, ring.y - 20, `+${points}${comboText}`, color, 1.2)

    if (this.ringCombo >= 3) {
      this.spawnFloatingText(
        this.width / 2,
        this.height * 0.25,
        `${this.ringCombo}× COMBO!`,
        '#facc15',
        1.5,
      )
    }
  }

  private spawnPipePair(): void {
    const minGap = this.birdRadius * 3.8 * 2
    const baseGap = Math.max(minGap + 18 * this.dpr, this.height * 0.31)
    const shrink = Math.min(baseGap - minGap, this.score * 2.1 * this.dpr)
    const gapHeight = Math.max(minGap, baseGap - shrink)

    const topMargin = 42 * this.dpr
    const bottomLimit = this.height - this.groundHeight - 42 * this.dpr
    const minGapY = topMargin + gapHeight * 0.5
    const maxGapY = bottomLimit - gapHeight * 0.5
    const gapY = minGapY + Math.random() * Math.max(1, maxGapY - minGapY)

    const pipe: PipePair = {
      x: this.width + this.pipeWidth,
      width: this.pipeWidth,
      gapY,
      gapHeight,
      passed: false,
    }

    if (Math.random() < 0.45) {
      pipe.ring = this.createRing(pipe)
    }

    this.pipes.push(pipe)
  }

  private createRing(pipe: PipePair): RingGate {
    const ringTypes: RingType[] = ['bronze', 'silver', 'gold']
    const weights = [60, 30, 10]
    let roll = Math.random() * 100
    let selectedType: RingType = 'bronze'

    for (let i = 0; i < ringTypes.length; i++) {
      roll -= weights[i]!
      if (roll <= 0) {
        selectedType = ringTypes[i]!
        break
      }
    }

    const radius = Math.max(14 * this.dpr, this.birdRadius * 1.8)
    const ringX = pipe.x + pipe.width / 2
    const ringY = pipe.gapY + (Math.random() - 0.5) * (pipe.gapHeight * 0.3)

    const pointsMap = { bronze: 3, silver: 7, gold: 15 }

    return {
      type: selectedType,
      x: ringX,
      y: ringY,
      radius,
      collected: false,
      points: pointsMap[selectedType],
      pulseTimer: 0,
    }
  }

  private getRingColor(type: RingType): string {
    switch (type) {
      case 'gold':
        return '#facc15'
      case 'silver':
        return '#d1d5db'
      case 'bronze':
        return '#d97706'
    }
  }

  private checkCollision(): boolean {
    const hitRadius = this.birdRadius * 0.84
    const ceilingHit = this.birdY - hitRadius <= 0
    const groundHit = this.birdY + hitRadius >= this.height - this.groundHeight
    if (ceilingHit || groundHit) {
      return true
    }

    for (const pipe of this.pipes) {
      const withinPipeX =
        this.birdX + hitRadius > pipe.x && this.birdX - hitRadius < pipe.x + pipe.width
      if (!withinPipeX) {
        continue
      }

      const gapTop = pipe.gapY - pipe.gapHeight * 0.5
      const gapBottom = pipe.gapY + pipe.gapHeight * 0.5
      if (this.birdY - hitRadius < gapTop || this.birdY + hitRadius > gapBottom) {
        return true
      }
    }

    return false
  }

  private triggerDeath(): void {
    if (this.state === 'dying' || this.state === 'gameover') {
      return
    }
    this.state = 'dying'
    this.gameOverTimer = 0
    this.triggerScreenShake(8, 300)
    this.spawnParticles(this.birdX, this.birdY, 20, '#ffd93d', 1.5)
    this.spawnFloatingText(this.birdX, this.birdY - 30, 'OUCH!', '#ff6b6b', 1)
  }

  private buildStats(): PlayerStats {
    const isAlive = this.state === 'ready' || this.state === 'playing'
    return {
      hp: isAlive ? 1 : 0,
      maxHp: 1,
      level: Math.floor(this.score / 10) + 1,
      xp: this.score % 10,
      xpToNext: 10,
      kills: this.score,
      time: Math.floor(this.elapsedMs / 1000),
      score: this.score,
    }
  }

  private pushStats(): void {
    this.callbacks.onStatsUpdate?.(this.buildStats())
    this.pushHud()
  }

  private pushHud(): void {
    const stats = this.buildStats()
    const hudData: GameHudData = {
      ...stats,
      activeBuffs: [],
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private drawCloudBands(ctx: CanvasRenderingContext2D): void {
    const clouds = [
      { x: this.width * 0.22, y: this.height * 0.19, scale: 1.4 },
      { x: this.width * 0.62, y: this.height * 0.25, scale: 1.1 },
      { x: this.width * 0.42, y: this.height * 0.32, scale: 1.6 },
    ]

    let drewAny = false
    for (const c of clouds) {
      const baseScale = (this.width * 0.18) / 96
      const ok = drawKenneySprite(ctx, 'flappy.cloud', {
        x: c.x,
        y: c.y,
        scale: baseScale * c.scale,
        alpha: 0.85,
      }) || drawSprite(ctx, 'flappy.cloud', {
        x: c.x,
        y: c.y,
        scale: baseScale * c.scale,
        alpha: 0.85,
      })
      if (ok) drewAny = true
    }

    if (!drewAny) {
      ctx.globalAlpha = 0.15
      ctx.fillStyle = '#ffffff'
      const bandHeight = 28 * this.dpr
      ctx.fillRect(this.width * 0.1, this.height * 0.18, this.width * 0.45, bandHeight)
      ctx.fillRect(this.width * 0.48, this.height * 0.24, this.width * 0.36, bandHeight * 0.9)
      ctx.fillRect(this.width * 0.18, this.height * 0.3, this.width * 0.52, bandHeight * 0.8)
      ctx.globalAlpha = 1
    }
  }

  private drawPipes(ctx: CanvasRenderingContext2D): void {
    const bodyColor = '#39b54a'
    const borderColor = '#2b8d39'
    const capColor = '#55cd64'
    const capHeight = Math.max(11 * this.dpr, this.pipeWidth * 0.2)
    const capOverhang = Math.max(5 * this.dpr, this.pipeWidth * 0.08)

    for (const pipe of this.pipes) {
      const gapTop = pipe.gapY - pipe.gapHeight * 0.5
      const gapBottom = pipe.gapY + pipe.gapHeight * 0.5
      const lowerH = this.height - this.groundHeight - gapBottom

      const upperBody = drawKenneySprite(ctx, 'flappy.pipe-body', {
        x: pipe.x,
        y: 0,
        scaleX: pipe.width / 112,
        scaleY: gapTop / 64,
      }) || drawSprite(ctx, 'flappy.pipe-body', {
        x: pipe.x,
        y: 0,
        scaleX: pipe.width / 112,
        scaleY: gapTop / 64,
      })
      const lowerBody = drawKenneySprite(ctx, 'flappy.pipe-body', {
        x: pipe.x,
        y: gapBottom,
        scaleX: pipe.width / 112,
        scaleY: lowerH / 64,
      }) || drawSprite(ctx, 'flappy.pipe-body', {
        x: pipe.x,
        y: gapBottom,
        scaleX: pipe.width / 112,
        scaleY: lowerH / 64,
      })

      if (!upperBody || !lowerBody) {
        ctx.fillStyle = bodyColor
        ctx.fillRect(pipe.x, 0, pipe.width, gapTop)
        ctx.fillRect(pipe.x, gapBottom, pipe.width, lowerH)
        ctx.strokeStyle = borderColor
        ctx.lineWidth = Math.max(2, Math.floor(2 * this.dpr))
        ctx.strokeRect(pipe.x, 0, pipe.width, gapTop)
        ctx.strokeRect(pipe.x, gapBottom, pipe.width, lowerH)
      }

      const capWidth = pipe.width + capOverhang * 2
      const capScaleX = capWidth / 128
      const capScaleY = capHeight / 28

      const upperCap = drawKenneySprite(ctx, 'flappy.pipe-cap', {
        x: pipe.x - capOverhang,
        y: gapTop - capHeight,
        scaleX: capScaleX,
        scaleY: capScaleY,
      }) || drawSprite(ctx, 'flappy.pipe-cap', {
        x: pipe.x - capOverhang,
        y: gapTop - capHeight,
        scaleX: capScaleX,
        scaleY: capScaleY,
      })
      const lowerCap = drawKenneySprite(ctx, 'flappy.pipe-cap', {
        x: pipe.x - capOverhang,
        y: gapBottom,
        scaleX: capScaleX,
        scaleY: capScaleY,
      }) || drawSprite(ctx, 'flappy.pipe-cap', {
        x: pipe.x - capOverhang,
        y: gapBottom,
        scaleX: capScaleX,
        scaleY: capScaleY,
      })

      if (!upperCap || !lowerCap) {
        ctx.fillStyle = capColor
        ctx.fillRect(pipe.x - capOverhang, gapTop - capHeight, capWidth, capHeight)
        ctx.fillRect(pipe.x - capOverhang, gapBottom, capWidth, capHeight)
        ctx.strokeStyle = borderColor
        ctx.lineWidth = Math.max(2, Math.floor(2 * this.dpr))
        ctx.strokeRect(pipe.x - capOverhang, gapTop - capHeight, capWidth, capHeight)
        ctx.strokeRect(pipe.x - capOverhang, gapBottom, capWidth, capHeight)
      }
    }
  }

  private drawRings(ctx: CanvasRenderingContext2D): void {
    for (const pipe of this.pipes) {
      const ring = pipe.ring
      if (!ring || ring.collected) continue

      const pulseScale = 1 + Math.sin(ring.pulseTimer / 200) * 0.12
      const ringRadius = ring.radius * pulseScale
      const color = this.getRingColor(ring.type)

      const spriteSize = ringRadius * 2 * 1.4
      const drewRing = drawKenneySprite(ctx, 'flappy.ring', {
        x: ring.x,
        y: ring.y,
        scale: spriteSize / 80,
        variant: ring.type,
      }) || drawSprite(ctx, 'flappy.ring', {
        x: ring.x,
        y: ring.y,
        scale: spriteSize / 80,
        variant: ring.type,
      })

      if (drewRing) continue

      ctx.save()
      ctx.globalAlpha = 0.25
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(ring.x, ring.y, ringRadius * 1.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.strokeStyle = color
      ctx.lineWidth = Math.max(3, Math.floor(4 * this.dpr))
      ctx.beginPath()
      ctx.arc(ring.x, ring.y, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.lineWidth = Math.max(2, Math.floor(2.5 * this.dpr))
      ctx.beginPath()
      ctx.arc(ring.x, ring.y, ringRadius * 0.7, 0, Math.PI * 2)
      ctx.stroke()

      const starSize = ring.radius * 0.4
      this.drawRingStar(ctx, ring.x, ring.y, starSize, color)

      ctx.restore()
    }
  }

  private drawRingStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
  ): void {
    ctx.save()
    ctx.fillStyle = color
    ctx.shadowColor = color
    ctx.shadowBlur = 8 * this.dpr

    const spikes = 4
    const outerRadius = size
    const innerRadius = size * 0.5

    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI * i) / spikes
      const px = x + Math.cos(angle) * radius
      const py = y + Math.sin(angle) * radius
      if (i === 0) {
        ctx.moveTo(px, py)
      } else {
        ctx.lineTo(px, py)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    const groundY = this.height - this.groundHeight

    const tileW = this.groundHeight * (256 / 88)
    const scale = this.groundHeight / 88
    let drewAll = true
    for (let x = 0; x < this.width; x += tileW) {
      const ok = drawKenneySprite(ctx, 'flappy.ground', {
        x,
        y: groundY,
        scale,
      }) || drawSprite(ctx, 'flappy.ground', {
        x,
        y: groundY,
        scale,
      })
      if (!ok) {
        drewAll = false
        break
      }
    }

    if (!drewAll) {
      ctx.fillStyle = '#8f5a2a'
      ctx.fillRect(0, groundY, this.width, this.groundHeight)

      ctx.fillStyle = '#73bf4b'
      ctx.fillRect(0, groundY, this.width, Math.max(10 * this.dpr, this.groundHeight * 0.2))

      ctx.strokeStyle = 'rgba(79, 46, 20, 0.45)'
      ctx.lineWidth = Math.max(2, Math.floor(2 * this.dpr))
      ctx.beginPath()
      ctx.moveTo(0, groundY + this.groundHeight * 0.45)
      ctx.lineTo(this.width, groundY + this.groundHeight * 0.45)
      ctx.stroke()
    }
  }

  private drawBird(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.translate(this.birdX, this.birdY)
    ctx.rotate(this.birdRotation)

    const birdSize = this.birdRadius * 2
    const drewSprite = drawKenneySprite(ctx, 'flappy.bird', {
      x: 0,
      y: 0,
      scale: birdSize / 48,
    }) || drawSprite(ctx, 'flappy.bird', {
      x: 0,
      y: 0,
      scale: birdSize / 48,
    })

    if (!drewSprite) {
      const bodyGradient = ctx.createRadialGradient(
        -this.birdRadius * 0.25,
        -this.birdRadius * 0.25,
        this.birdRadius * 0.2,
        0,
        0,
        this.birdRadius,
      )
      bodyGradient.addColorStop(0, '#ffe87d')
      bodyGradient.addColorStop(1, '#ffbc2f')

      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.arc(0, 0, this.birdRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.moveTo(this.birdRadius * 0.15, this.birdRadius * 0.05)
      ctx.lineTo(this.birdRadius * 1.1, this.birdRadius * 0.28)
      ctx.lineTo(this.birdRadius * 0.2, this.birdRadius * 0.55)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(this.birdRadius * 0.25, -this.birdRadius * 0.25, this.birdRadius * 0.28, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#111827'
      ctx.beginPath()
      ctx.arc(this.birdRadius * 0.34, -this.birdRadius * 0.22, this.birdRadius * 0.12, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  private drawScore(ctx: CanvasRenderingContext2D): void {
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.98)'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.lineWidth = Math.max(2, Math.floor(3 * this.dpr))
    ctx.font = `bold ${Math.max(24, Math.floor(40 * this.dpr))}px ${this.theme.font.family}`
    ctx.strokeText(String(this.score), this.width / 2, this.height * 0.13)
    ctx.fillText(String(this.score), this.width / 2, this.height * 0.13)

    if (this.ringCombo > 0 && this.state === 'playing') {
      const comboY = this.height * 0.2
      const comboAlpha = Math.min(1, this.ringComboTimer / 500)
      ctx.globalAlpha = comboAlpha
      ctx.font = `bold ${Math.max(14, Math.floor(18 * this.dpr))}px ${this.theme.font.family}`
      ctx.fillStyle = '#facc15'
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.lineWidth = Math.max(2, Math.floor(2 * this.dpr))
      ctx.strokeText(`COMBO ×${this.ringCombo}`, this.width / 2, comboY)
      ctx.fillText(`COMBO ×${this.ringCombo}`, this.width / 2, comboY)
      ctx.globalAlpha = 1
    }
  }

  protected override onResize(w: number, h: number): void {
    this.gameOverlay.setSize(w, h)
  }
}

export function createFlappyGame(): GameInstance {
  return new FlappyGame()
}
