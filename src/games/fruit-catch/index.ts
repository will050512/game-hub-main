import { GameEngine } from '@/engine/GameEngine'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type GameHudData,
} from '@/types'
import { ITEM_DEFS, type FruitCatchItemDef } from './data'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKenneySprite, preloadKenneySprites } from '@/engine/sprites/kenneySpriteLoader'
import {
  canvasIconKindForItem,
  drawKawaiiCanvasIcon,
  drawKawaiiInlineLabel,
  drawKawaiiPanel,
  drawKawaiiProgressBar,
} from '@/engine/kawaiiCanvas'

type FruitSpriteKind =
  | 'apple'
  | 'orange'
  | 'grape'
  | 'watermelon'
  | 'star'
  | 'bomb'
  | 'golden'
  | 'basket'

const fruitImageCache = new Map<FruitSpriteKind, HTMLImageElement>()

function getFruitTileIndex(kind: FruitSpriteKind): string {
  switch (kind) {
    case 'apple':
      return '0056'
    case 'orange':
      return '0068'
    case 'grape':
      return '0080'
    case 'watermelon':
      return '0052'
    case 'star':
      return '0108'
    case 'bomb':
      return '0096'
    case 'golden':
      return '0104'
    case 'basket':
      return ''
  }
}

function getFruitAssetPath(kind: FruitSpriteKind): string {
  if (kind === 'basket') {
    return '/assets/sprites/ui-icons/White/1x/basket.png'
  }
  const idx = getFruitTileIndex(kind)
  return `/assets/sprites/platformer-food/tile_${idx}.png`
}

async function preloadFruitImages(): Promise<void> {
  const kinds: FruitSpriteKind[] = [
    'apple',
    'orange',
    'grape',
    'watermelon',
    'star',
    'bomb',
    'golden',
    'basket',
  ]
  await Promise.allSettled(
    kinds.map(async (kind) => {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load ${kind}`))
          img.src = getFruitAssetPath(kind)
        })
        fruitImageCache.set(kind, img)
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }
    }),
  )
}

function drawFruitTile(
  ctx: CanvasRenderingContext2D,
  kind: FruitSpriteKind,
  x: number,
  y: number,
  size: number,
): boolean {
  const img = fruitImageCache.get(kind)
  if (!img) return false
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
  return true
}

type FruitKind = 'apple' | 'orange' | 'grape' | 'watermelon' | 'star' | 'bomb' | 'golden'
type WeatherType = 'clear' | 'wind' | 'storm'

interface FallingItem {
  kind: FruitKind
  x: number
  y: number
  radius: number
  speed: number
  value: number
  isBomb: boolean
  powerUpId?: string
  windVelocityX?: number
}

interface ScorePopup {
  x: number
  y: number
  text: string
  color: string
  timer: number
  duration: number
  riseSpeed: number
}

interface CatchBurst {
  x: number
  y: number
  color: string
  timer: number
  duration: number
  maxRadius: number
}

class FruitCatchGame extends GameEngine {
  private readonly maxLives = 5
  private readonly levelScoreStep = 100

  private score = 0
  private lives = this.maxLives
  private level = 1
  private fruitsCaught = 0
  private gameTime = 0
  private gameOver = false
  private gameOverTriggered = false

  private basketX = 0
  private basketY = 0
  private basketWidth = 0
  private basketHeight = 0
  private basketSpeed = 0

  private fallingItems: FallingItem[] = []
  private popups: ScorePopup[] = []
  private bursts: CatchBurst[] = []

  private screenShake: { x: number; y: number; intensity: number; duration: number; elapsed: number } | null = null

  private spawnTimer = 0
  private goldenSpawnTimer = 0
  private goldenSpawnInterval = 0
  private activeEffects: { id: string; remainingMs: number; totalMs: number }[] = []
  private shieldActive = false
  private baseBasketWidth = 0
  private scoreMultiplier = 1
  private magnetRange = 0
  private touchMoveX = 0
  private activeTouchId: number | null = null
  private touchBound = false

  private currentWeather: WeatherType = 'clear'
  private weatherTimer = 0
  private weatherDuration = 0
  private windDirection = 0
  private lightningTimer = 0
  private lightningFlash = false

  constructor() {
    super()
  }

  override start(canvas: HTMLCanvasElement, callbacks: GameCallbacks): void {
    super.start(canvas, callbacks)
  }

  protected init(): void {
    void preloadGameSprites('fruit-catch')
    void preloadKenneySprites('fruit-catch')
    void preloadFruitImages()
    this.score = 0
    this.lives = this.maxLives
    this.level = 1
    this.fruitsCaught = 0
    this.gameTime = 0
    this.gameOver = false
    this.gameOverTriggered = false

    this.fallingItems = []
    this.popups = []
    this.bursts = []
    this.spawnTimer = 0
    this.goldenSpawnTimer = 0
    this.goldenSpawnInterval = this.randomGoldenInterval()
    this.activeEffects = []
    this.shieldActive = false
    this.scoreMultiplier = 1
    this.magnetRange = 0
    this.touchMoveX = 0
    this.activeTouchId = null

    this.currentWeather = 'clear'
    this.weatherTimer = 0
    this.weatherDuration = this.getRandomWeatherDuration()
    this.windDirection = 0
    this.lightningTimer = 0
    this.lightningFlash = false

    this.setupBasket()
    this.baseBasketWidth = this.basketWidth
    this.bindTouchInput()

    this.screenShake = null

    this.callbacks.onScoreUpdate?.(this.score)
    this.pushStats()
  }

  override stop(): void {
    this.unbindTouchInput()
    super.stop()
  }

  protected update(dt: number): void {
    const dtScale = dt / 16.667

    if (!this.gameOver) {
      this.gameTime += dt
      this.updateBasket(dtScale)
      this.updateSpawner(dt)
      this.updateGoldenSpawner(dt)
      this.updateActiveEffects(dt)
      this.updateMagnetAttraction(dt)
      this.updateFallingItems(dtScale)
      this.updateLevelFromScore()
      this.updateWeather(dt)
    }

    this.updateEffects(dt)
    this.updateScreenShake(dt)
    this.pushStats()
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.screenShake = { x: 0, y: 0, intensity, duration, elapsed: 0 }
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
    if (this.screenShake) {
      ctx.translate(this.screenShake.x, this.screenShake.y)
    }

    this.renderBackground(ctx)
    this.renderWeatherEffects(ctx)
    this.renderBasket(ctx)

    for (const item of this.fallingItems) {
      this.renderItem(ctx, item)
    }

    this.renderBursts(ctx)
    this.renderPopups(ctx)
    if (this.shieldActive) {
      this.renderShieldGlow(ctx)
    }
    this.renderHud(ctx)
    this.renderWeatherIndicator(ctx)
    this.renderActiveEffectIndicators(ctx)

    if (this.gameOver) {
      this.renderGameOver(ctx)
    }

    if (this.screenShake) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }

  private setupBasket(): void {
    this.basketWidth = Math.max(104 * this.dpr, this.width * 0.21)
    this.basketHeight = Math.max(20 * this.dpr, this.width * 0.035)
    this.basketX = (this.width - this.basketWidth) / 2
    this.basketY = this.height - Math.max(38 * this.dpr, this.height * 0.1)
    this.basketSpeed = 9.2 * this.dpr
  }

  private updateBasket(dtScale: number): void {
    const inputMove = this.resolveMoveInput()
    this.basketX += inputMove * this.basketSpeed * dtScale
    this.basketX = Math.max(0, Math.min(this.width - this.basketWidth, this.basketX))
  }

  private resolveMoveInput(): number {
    let moveX = this.input.moveX
    if (Math.abs(this.touchMoveX) > 0) {
      moveX = this.touchMoveX
    }
    return Math.max(-1, Math.min(1, moveX))
  }

  private updateSpawner(dt: number): void {
    this.spawnTimer += dt
    const interval = this.getSpawnInterval()

    while (this.spawnTimer >= interval) {
      this.spawnTimer -= interval
      this.spawnItem()
    }
  }

  private randomGoldenInterval(): number {
    return 15000 + Math.random() * 10000
  }

  private updateGoldenSpawner(dt: number): void {
    this.goldenSpawnTimer += dt
    if (this.goldenSpawnTimer >= this.goldenSpawnInterval) {
      this.goldenSpawnTimer = 0
      this.goldenSpawnInterval = this.randomGoldenInterval()
      this.spawnGoldenItem()
    }
  }

  private spawnGoldenItem(): void {
    const entries = Object.values(ITEM_DEFS)
    const first = entries[0]
    if (!first) {
      return
    }
    const totalWeight = entries.reduce((sum, def) => sum + def.spawnWeight, 0)
    if (totalWeight <= 0) {
      return
    }

    let roll = Math.random() * totalWeight
    let selected: FruitCatchItemDef = first
    for (const def of entries) {
      roll -= def.spawnWeight
      if (roll <= 0) {
        selected = def
        break
      }
    }

    const radius = 12 * this.dpr
    const item: FallingItem = {
      kind: 'golden',
      x: radius + Math.random() * Math.max(1, this.width - radius * 2),
      y: -radius - 4 * this.dpr,
      radius,
      speed: this.getBaseFallSpeed() * 0.6,
      value: 0,
      isBomb: false,
      powerUpId: selected.id,
    }

    this.fallingItems.push(item)
  }

  private updateFallingItems(dtScale: number): void {
    for (let i = this.fallingItems.length - 1; i >= 0; i -= 1) {
      const item = this.fallingItems[i]!
      
      let speedMultiplier = 1
      if (this.currentWeather === 'storm') {
        speedMultiplier = this.level <= 2 ? 1.18 : 1.35
      }
      
      item.y += item.speed * speedMultiplier * dtScale

      if (this.currentWeather === 'wind' && !item.isBomb) {
        if (item.windVelocityX === undefined) {
          item.windVelocityX = this.windDirection * (0.8 + Math.random() * 0.4)
        }
        item.x += item.windVelocityX * dtScale
        item.x = Math.max(item.radius, Math.min(this.width - item.radius, item.x))
      }

      if (this.isCaught(item)) {
        this.handleCatch(item)
        this.fallingItems.splice(i, 1)
        continue
      }

      if (item.y - item.radius > this.height) {
        if (!item.isBomb && item.kind !== 'golden') {
          this.loseLife(item.x, this.height - 16 * this.dpr, '#ef4444')
        }
        this.fallingItems.splice(i, 1)
      }
    }
  }

  private updateWeather(dt: number): void {
    this.weatherTimer += dt

    if (this.weatherTimer >= this.weatherDuration) {
      this.changeWeather()
      this.weatherTimer = 0
      this.weatherDuration = this.getRandomWeatherDuration()
    }

    if (this.currentWeather === 'storm') {
      this.lightningTimer += dt
      if (this.lightningTimer >= 2000) {
        this.triggerLightning()
        this.lightningTimer = 0
      }
    }

    if (this.lightningFlash) {
      this.lightningFlash = false
    }
  }

  private changeWeather(): void {
    const weatherTypes: WeatherType[] = ['clear', 'wind', 'storm']
    const currentIndex = weatherTypes.indexOf(this.currentWeather)
    const availableWeathers = weatherTypes.filter((_, i) => i !== currentIndex)
    this.currentWeather = availableWeathers[Math.floor(Math.random() * availableWeathers.length)]!

    if (this.currentWeather === 'wind') {
      this.windDirection = Math.random() < 0.5 ? -1 : 1
    } else {
      this.windDirection = 0
      for (const item of this.fallingItems) {
        item.windVelocityX = undefined
      }
    }

    if (this.currentWeather === 'storm') {
      this.lightningTimer = Math.random() * 1000
    }

    this.popups.push({
      x: this.width / 2,
      y: this.height * 0.35,
      text: this.getWeatherLabel(),
      color: this.getWeatherColor(),
      timer: 1500,
      duration: 1500,
      riseSpeed: 0.5 * this.dpr,
    })
  }

  private triggerLightning(): void {
    this.lightningFlash = true
    this.triggerScreenShake(5, 150)
  }

  private getRandomWeatherDuration(): number {
    return 12000 + Math.random() * 8000
  }

  private getWeatherLabel(): string {
    switch (this.currentWeather) {
      case 'clear':
        return '晴天'
      case 'wind':
        return '強風'
      case 'storm':
        return '風暴'
    }
  }

  private getWeatherColor(): string {
    switch (this.currentWeather) {
      case 'clear':
        return '#fbbf24'
      case 'wind':
        return '#60a5fa'
      case 'storm':
        return '#8b5cf6'
    }
  }

  private updateActiveEffects(dt: number): void {
    for (let i = this.activeEffects.length - 1; i >= 0; i -= 1) {
      const effect = this.activeEffects[i]!
      effect.remainingMs -= dt
      if (effect.remainingMs > 0) {
        continue
      }

      if (effect.id === 'big_basket') {
        this.basketWidth = this.baseBasketWidth
        this.basketX = Math.max(0, Math.min(this.width - this.basketWidth, this.basketX))
      } else if (effect.id === 'magnet') {
        this.magnetRange = 0
      } else if (effect.id === 'double_score') {
        this.scoreMultiplier = 1
      }

      this.activeEffects.splice(i, 1)
    }
  }

  private updateMagnetAttraction(dt: number): void {
    if (this.magnetRange <= 0) {
      return
    }

    const basketCenterX = this.basketX + this.basketWidth / 2
    const moveSpeed = 3 * this.dpr * (dt / 16.667)
    for (const item of this.fallingItems) {
      if (item.isBomb) {
        continue
      }

      const dx = basketCenterX - item.x
      const dy = this.basketY - item.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < this.magnetRange) {
        const dir = dx === 0 ? 0 : dx > 0 ? 1 : -1
        item.x += dir * Math.min(Math.abs(dx), moveSpeed)
      }
    }
  }

  private updateEffects(dt: number): void {
    for (let i = this.popups.length - 1; i >= 0; i -= 1) {
      const popup = this.popups[i]!
      popup.timer -= dt
      popup.y -= popup.riseSpeed * (dt / 16.667)
      if (popup.timer <= 0) {
        this.popups.splice(i, 1)
      }
    }

    for (let i = this.bursts.length - 1; i >= 0; i -= 1) {
      const burst = this.bursts[i]!
      burst.timer -= dt
      if (burst.timer <= 0) {
        this.bursts.splice(i, 1)
      }
    }
  }

  private spawnItem(): void {
    const kind = this.pickItemType()
    const radius = this.getItemRadius(kind)

    const item: FallingItem = {
      kind,
      x: radius + Math.random() * Math.max(1, this.width - radius * 2),
      y: -radius - 4 * this.dpr,
      radius,
      speed: this.getBaseFallSpeed() * (0.8 + Math.random() * 0.45),
      value: this.getItemValue(kind),
      isBomb: kind === 'bomb',
    }

    this.fallingItems.push(item)
  }

  private pickItemType(): FruitKind {
    const roll = Math.random()
    if (roll < 0.03) return 'star'
    if (roll < 0.13) return 'bomb'
    if (roll < 0.40) return 'apple'
    if (roll < 0.64) return 'orange'
    if (roll < 0.84) return 'grape'
    return 'watermelon'
  }

  private getItemValue(kind: FruitKind): number {
    if (kind === 'apple') return 10
    if (kind === 'orange') return 15
    if (kind === 'grape') return 20
    if (kind === 'watermelon') return 30
    if (kind === 'star') return 50
    return 0
  }

  private getItemRadius(kind: FruitKind): number {
    if (kind === 'watermelon') return 14 * this.dpr
    if (kind === 'grape') return 10 * this.dpr
    if (kind === 'star') return 11 * this.dpr
    if (kind === 'bomb') return 11 * this.dpr
    return 10 * this.dpr
  }

  private getBaseFallSpeed(): number {
    return (2 + (this.level - 1) * 0.24) * this.dpr
  }

  private getSpawnInterval(): number {
    return Math.max(320, 1200 - (this.level - 1) * 60)
  }

  private isCaught(item: FallingItem): boolean {
    const basketTop = this.basketY
    const basketBottom = this.basketY + this.basketHeight
    const basketLeft = this.basketX
    const basketRight = this.basketX + this.basketWidth
    const catchTop = basketTop - 8 * this.dpr

    return (
      item.y + item.radius >= catchTop &&
      item.y - item.radius <= basketBottom &&
      item.x >= basketLeft &&
      item.x <= basketRight
    )
  }

  private handleCatch(item: FallingItem): void {
    const popupX = item.x
    const popupY = Math.max(20 * this.dpr, this.basketY - 8 * this.dpr)

    if (item.kind === 'golden' && item.powerUpId) {
      const def = ITEM_DEFS[item.powerUpId]
      this.applyItem(item.powerUpId)
      if (def) {
        this.popups.push({
          x: popupX,
          y: popupY,
          text: def.name,
          color: def.color,
          timer: 900,
          duration: 900,
          riseSpeed: 1.05 * this.dpr,
        })
        this.bursts.push({
          x: item.x,
          y: item.y,
          color: def.color,
          timer: 340,
          duration: 340,
          maxRadius: item.radius * 2.3,
        })
      }
      return
    }

    if (item.isBomb) {
      if (this.shieldActive) {
        this.shieldActive = false
        this.popups.push({
          x: popupX,
          y: popupY,
          text: '護盾吸收！',
          color: '#22d3ee',
          timer: 850,
          duration: 850,
          riseSpeed: 1.05 * this.dpr,
        })
        this.bursts.push({
          x: item.x,
          y: item.y,
          color: '#22d3ee',
          timer: 280,
          duration: 280,
          maxRadius: item.radius * 2.2,
        })
        return
      }

      this.loseLife(popupX, popupY, '#ef4444')
      this.popups.push({
        x: popupX,
        y: popupY,
        text: '-1 生命',
        color: '#ef4444',
        timer: 700,
        duration: 700,
        riseSpeed: 0.95 * this.dpr,
      })
      this.bursts.push({
        x: item.x,
        y: item.y,
        color: '#111827',
        timer: 260,
        duration: 260,
        maxRadius: item.radius * 2,
      })
      return
    }

    const gained = item.value * this.scoreMultiplier
    this.score += gained
    this.fruitsCaught += 1
    this.callbacks.onScoreUpdate?.(this.score)

    this.popups.push({
      x: popupX,
      y: popupY,
      text: this.scoreMultiplier > 1 ? `+${gained} (×${this.scoreMultiplier})` : `+${gained}`,
      color: '#22c55e',
      timer: 760,
      duration: 760,
      riseSpeed: 1.15 * this.dpr,
    })

    this.bursts.push({
      x: item.x,
      y: item.y,
      color: this.getBurstColor(item.kind),
      timer: 320,
      duration: 320,
      maxRadius: item.radius * 2.2,
    })
  }

  private applyItem(itemId: string): void {
    const def = ITEM_DEFS[itemId]
    if (!def) {
      return
    }

    switch (itemId) {
      case 'big_basket':
        this.basketWidth = this.baseBasketWidth * 1.4
        this.basketX = Math.max(0, Math.min(this.width - this.basketWidth, this.basketX))
        this.pushTimedEffect(def)
        break
      case 'magnet':
        this.magnetRange = 100 * this.dpr
        this.pushTimedEffect(def)
        break
      case 'double_score':
        this.scoreMultiplier = 2
        this.pushTimedEffect(def)
        break
      case 'shield':
        this.shieldActive = true
        break
    }
  }

  private pushTimedEffect(def: FruitCatchItemDef): void {
    const existing = this.activeEffects.find((effect) => effect.id === def.id)
    if (existing) {
      existing.remainingMs = def.durationMs
      existing.totalMs = def.durationMs
      return
    }
    this.activeEffects.push({ id: def.id, remainingMs: def.durationMs, totalMs: def.durationMs })
  }

  private getBurstColor(kind: FruitKind): string {
    if (kind === 'apple') return '#ef4444'
    if (kind === 'orange') return '#fb923c'
    if (kind === 'grape') return '#8b5cf6'
    if (kind === 'watermelon') return '#10b981'
    if (kind === 'star') return '#facc15'
    if (kind === 'golden') return '#f59e0b'
    return '#111827'
  }

  private loseLife(x: number, y: number, color: string): void {
    if (this.gameOver) {
      return
    }

    this.lives = Math.max(0, this.lives - 1)
    this.bursts.push({
      x,
      y,
      color,
      timer: 260,
      duration: 260,
      maxRadius: 20 * this.dpr,
    })
    this.triggerScreenShake(8, 250)

    if (this.lives <= 0) {
      this.triggerGameOver()
    }
  }

  private triggerGameOver(): void {
    this.lives = 0
    this.gameOver = true
    if (!this.gameOverTriggered) {
      this.gameOverTriggered = true
      this.callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'fruit-catch',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.fruitsCaught,
          time: Math.floor(this.gameTime / 1000),
          level: this.level,
          coins: 0,
        },
      })
      this.callbacks.onGameOver?.(this.score)
    }
  }

  private updateLevelFromScore(): void {
    this.level = Math.floor(this.score / this.levelScoreStep) + 1
  }

  private pushStats(): void {
    const stats: PlayerStats = {
      hp: this.lives,
      maxHp: this.maxLives,
      level: this.level,
      xp: this.score % this.levelScoreStep,
      xpToNext: this.levelScoreStep,
      kills: this.fruitsCaught,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const buffs: GameHudData['activeBuffs'] = []
    for (const effect of this.activeEffects) {
      const def = ITEM_DEFS[effect.id]
      if (def) {
        buffs.push({
          id: effect.id,
          name: def.name,
          icon: def.icon,
          remainingMs: effect.remainingMs,
          totalMs: effect.totalMs,
          type: 'special',
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
      maxHp: this.maxLives,
      level: this.level,
      xp: this.score % this.levelScoreStep,
      xpToNext: this.levelScoreStep,
      kills: this.fruitsCaught,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: buffs,
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private renderBackground(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height)

    let gradient
    if (this.currentWeather === 'storm') {
      gradient = ctx.createLinearGradient(0, 0, 0, this.height)
      gradient.addColorStop(0, '#475569')
      gradient.addColorStop(0.5, '#64748b')
      gradient.addColorStop(1, '#94a3b8')
    } else if (this.currentWeather === 'wind') {
      gradient = ctx.createLinearGradient(0, 0, 0, this.height)
      gradient.addColorStop(0, '#60a5fa')
      gradient.addColorStop(0.5, '#93c5fd')
      gradient.addColorStop(1, '#dbeafe')
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, this.height)
      gradient.addColorStop(0, '#7dd3fc')
      gradient.addColorStop(0.5, '#a7f3d0')
      gradient.addColorStop(1, '#fef9c3')
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.width, this.height)

    if (this.lightningFlash) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.fillRect(0, 0, this.width, this.height)
    }

    if (this.currentWeather === 'clear') {
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      for (let i = 0; i < 5; i += 1) {
        const cloudX = (this.width / 6) * (i + 0.6)
        const cloudY = 45 * this.dpr + ((i % 2) * 28 + 8) * this.dpr
        const cloudR = (18 + (i % 3) * 6) * this.dpr
        ctx.beginPath()
        ctx.arc(cloudX, cloudY, cloudR, 0, Math.PI * 2)
        ctx.arc(cloudX + cloudR * 0.9, cloudY + 2 * this.dpr, cloudR * 0.8, 0, Math.PI * 2)
        ctx.arc(cloudX - cloudR * 0.8, cloudY + 3 * this.dpr, cloudR * 0.7, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  private renderWeatherEffects(ctx: CanvasRenderingContext2D): void {
    if (this.currentWeather === 'wind') {
      this.renderWindLines(ctx)
    } else if (this.currentWeather === 'storm') {
      this.renderRainDrops(ctx)
    }
  }

  private renderWindLines(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = Math.max(1, 2 * this.dpr)
    const lineCount = 8
    const offset = (this.gameTime * 0.15) % (this.width / lineCount)

    for (let i = 0; i < lineCount; i++) {
      const x = (this.width / lineCount) * i + offset * this.windDirection
      const y = (this.height / lineCount) * i
      const length = 40 * this.dpr

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + length * this.windDirection, y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x, y + this.height * 0.3)
      ctx.lineTo(x + length * 0.7 * this.windDirection, y + this.height * 0.3)
      ctx.stroke()
    }
    ctx.restore()
  }

  private renderRainDrops(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)'
    ctx.lineWidth = Math.max(1, 1.5 * this.dpr)
    const dropCount = 30
    const dropLength = 15 * this.dpr

    for (let i = 0; i < dropCount; i++) {
      const x = ((this.gameTime * 0.3 + i * 123) % (this.width + 100)) - 50
      const y = ((this.gameTime * 0.5 + i * 456) % (this.height + 100)) - 50

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y + dropLength)
      ctx.stroke()
    }
    ctx.restore()
  }

  private renderWeatherIndicator(ctx: CanvasRenderingContext2D): void {
    const x = this.width / 2
    const y = 70 * this.dpr
    const progress = Math.min(1, this.weatherTimer / this.weatherDuration)
    const panelW = 132 * this.dpr
    const panelH = 42 * this.dpr

    const label = this.getWeatherLabel()
    const color = this.getWeatherColor()

    drawKawaiiPanel(ctx, x - panelW / 2, y - panelH / 2, panelW, panelH, {
      fill: 'rgba(255, 250, 246, 0.9)',
      accent: color,
      stroke: '#0f172a',
    })
    drawKawaiiInlineLabel(ctx, {
      x: x - 34 * this.dpr,
      y: y - 4 * this.dpr,
      text: label,
      iconKind: this.currentWeather === 'storm' ? 'bomb' : this.currentWeather === 'wind' ? 'speed' : 'star',
      color,
      fontSize: Math.max(11, Math.floor(12 * this.dpr)),
    })
    drawKawaiiProgressBar(
      ctx,
      x - 42 * this.dpr,
      y + 10 * this.dpr,
      84 * this.dpr,
      8 * this.dpr,
      progress,
      {
        trackFill: 'rgba(15, 23, 42, 0.12)',
        fill: color,
        stroke: 'rgba(15, 23, 42, 0.24)',
      },
    )
  }

  private renderBasket(ctx: CanvasRenderingContext2D): void {
    const topInset = this.basketWidth * 0.12
    const rimHeight = this.basketHeight * 0.35
    const x = this.basketX
    const y = this.basketY
    const w = this.basketWidth
    const h = this.basketHeight

    const drew = drawKenneySprite(ctx, 'fruit-catch.basket', {
      x: x + w / 2,
      y: y + h,
      scaleX: w / 32,
      scaleY: h / 32,
    }) || drawSprite(ctx, 'fruit.basket', {
      x: x + w / 2,
      y: y + h,
      scaleX: w / 192,
      scaleY: h / 56,
    }) || drawFruitTile(ctx, 'basket', x + w / 2, y + h / 2, Math.min(w, h))
    if (drew) return

    ctx.fillStyle = '#8b5a2b'
    ctx.beginPath()
    ctx.moveTo(x + topInset, y)
    ctx.lineTo(x + w - topInset, y)
    ctx.lineTo(x + w, y + h)
    ctx.lineTo(x, y + h)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#5f370e'
    ctx.beginPath()
    ctx.moveTo(x + topInset * 0.85, y)
    ctx.lineTo(x + w - topInset * 0.85, y)
    ctx.lineTo(x + w - topInset * 0.6, y + rimHeight)
    ctx.lineTo(x + topInset * 0.6, y + rimHeight)
    ctx.closePath()
    ctx.fill()
  }

  private renderItem(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (item.kind === 'apple') {
      this.drawApple(ctx, item)
      return
    }
    if (item.kind === 'orange') {
      this.drawOrange(ctx, item)
      return
    }
    if (item.kind === 'grape') {
      this.drawGrape(ctx, item)
      return
    }
    if (item.kind === 'watermelon') {
      this.drawWatermelon(ctx, item)
      return
    }
    if (item.kind === 'star') {
      this.drawGoldenStar(ctx, item)
      return
    }
    if (item.kind === 'golden') {
      this.drawGoldenItem(ctx, item)
      return
    }
    this.drawBomb(ctx, item)
  }

  private drawGoldenItem(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    const def = item.powerUpId ? ITEM_DEFS[item.powerUpId] : undefined
    const glowPulse = 0.7 + 0.3 * Math.sin(this.gameTime * 0.003)
    const radius = item.radius

    const drewSprite = drawKenneySprite(ctx, 'fruit-catch.golden', {
      x: item.x,
      y: item.y,
      scale: (radius * 2) / 32,
      alpha: glowPulse,
    }) || drawSprite(ctx, 'fruit.golden', {
      x: item.x,
      y: item.y,
      scale: (radius * 2) / 36,
      alpha: glowPulse,
    }) || drawFruitTile(ctx, 'golden', item.x, item.y, radius * 2)

    if (!drewSprite) {
      const sides = 6
      ctx.save()
      ctx.shadowColor = `rgba(251, 191, 36, ${0.55 * glowPulse})`
      ctx.shadowBlur = 12 * this.dpr * glowPulse
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      for (let i = 0; i < sides; i += 1) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2
        const x = item.x + Math.cos(angle) * radius
        const y = item.y + Math.sin(angle) * radius
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.beginPath()
      ctx.arc(item.x - radius * 0.18, item.y - radius * 0.2, radius * 0.32, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    ctx.save()
    ctx.font = `bold ${Math.max(9, Math.floor(radius * 0.62))}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = def?.color ?? '#7c2d12'
    ctx.fillText((def?.name ?? '道具').slice(0, 2), item.x, item.y + 0.5 * this.dpr)
    ctx.restore()
  }

  private drawApple(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (drawKenneySprite(ctx, 'fruit-catch.apple', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawSprite(ctx, 'fruit.apple', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawFruitTile(ctx, 'apple', item.x, item.y, item.radius * 2)) return
    const r = item.radius
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(item.x, item.y, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#2f2f2f'
    ctx.lineWidth = 2 * this.dpr
    ctx.beginPath()
    ctx.moveTo(item.x, item.y - r * 0.9)
    ctx.lineTo(item.x + r * 0.15, item.y - r * 1.25)
    ctx.stroke()

    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.ellipse(item.x + r * 0.45, item.y - r * 1.05, r * 0.25, r * 0.13, Math.PI / 6, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawOrange(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (drawKenneySprite(ctx, 'fruit-catch.orange', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawSprite(ctx, 'fruit.orange', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawFruitTile(ctx, 'orange', item.x, item.y, item.radius * 2)) return
    const r = item.radius
    ctx.fillStyle = '#fb923c'
    ctx.beginPath()
    ctx.arc(item.x, item.y, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.26)'
    ctx.beginPath()
    ctx.arc(item.x - r * 0.28, item.y - r * 0.3, r * 0.28, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawGrape(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (drawKenneySprite(ctx, 'fruit-catch.grape', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawSprite(ctx, 'fruit.grape', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawFruitTile(ctx, 'grape', item.x, item.y, item.radius * 2)) return
    const r = item.radius * 0.42
    const positions = [
      { x: item.x, y: item.y - r * 1.4 },
      { x: item.x - r, y: item.y - r * 0.4 },
      { x: item.x + r, y: item.y - r * 0.4 },
      { x: item.x - r * 1.2, y: item.y + r * 0.7 },
      { x: item.x, y: item.y + r * 0.8 },
      { x: item.x + r * 1.2, y: item.y + r * 0.7 },
    ]

    ctx.fillStyle = '#7c3aed'
    for (const pos of positions) {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2 * this.dpr
    ctx.beginPath()
    ctx.moveTo(item.x, item.y - item.radius)
    ctx.lineTo(item.x, item.y - item.radius * 1.35)
    ctx.stroke()
  }

  private drawWatermelon(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (drawKenneySprite(ctx, 'fruit-catch.watermelon', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawSprite(ctx, 'fruit.watermelon', { x: item.x, y: item.y, scale: (item.radius * 2) / 36 })) return
    if (drawFruitTile(ctx, 'watermelon', item.x, item.y, item.radius * 2)) return
    const r = item.radius
    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.arc(item.x, item.y, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(item.x, item.y, r * 0.76, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#111827'
    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5 + item.y * 0.01
      const seedX = item.x + Math.cos(angle) * r * 0.4
      const seedY = item.y + Math.sin(angle) * r * 0.4
      ctx.beginPath()
      ctx.ellipse(seedX, seedY, r * 0.06, r * 0.1, angle, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  private drawGoldenStar(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (drawKenneySprite(ctx, 'fruit-catch.star', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawSprite(ctx, 'fruit.star', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawFruitTile(ctx, 'star', item.x, item.y, item.radius * 2)) return
    const spikes = 5
    const outerRadius = item.radius
    const innerRadius = item.radius * 0.45

    ctx.fillStyle = '#facc15'
    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i += 1) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI * i) / spikes - Math.PI / 2
      const x = item.x + Math.cos(angle) * radius
      const y = item.y + Math.sin(angle) * radius
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.beginPath()
    ctx.arc(item.x - item.radius * 0.16, item.y - item.radius * 0.1, item.radius * 0.25, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawBomb(ctx: CanvasRenderingContext2D, item: FallingItem): void {
    if (drawKenneySprite(ctx, 'fruit-catch.bomb', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawSprite(ctx, 'fruit.bomb', { x: item.x, y: item.y, scale: (item.radius * 2) / 32 })) return
    if (drawFruitTile(ctx, 'bomb', item.x, item.y, item.radius * 2)) return
    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2 * this.dpr
    ctx.beginPath()
    ctx.moveTo(item.x + item.radius * 0.25, item.y - item.radius * 0.95)
    ctx.quadraticCurveTo(
      item.x + item.radius * 0.85,
      item.y - item.radius * 1.4,
      item.x + item.radius * 1.1,
      item.y - item.radius * 1.8,
    )
    ctx.stroke()

    ctx.fillStyle = '#f97316'
    ctx.beginPath()
    ctx.arc(item.x + item.radius * 1.1, item.y - item.radius * 1.85, item.radius * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  private renderPopups(ctx: CanvasRenderingContext2D): void {
    for (const popup of this.popups) {
      const alpha = Math.max(0, popup.timer / popup.duration)
      ctx.globalAlpha = alpha
      ctx.fillStyle = popup.color
      ctx.font = `bold ${Math.max(13, Math.floor(14 * this.dpr))}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(popup.text, popup.x, popup.y)
    }
    ctx.globalAlpha = 1
  }

  private renderBursts(ctx: CanvasRenderingContext2D): void {
    for (const burst of this.bursts) {
      const progress = 1 - burst.timer / burst.duration
      const radius = burst.maxRadius * progress
      const alpha = Math.max(0, 1 - progress)
      ctx.globalAlpha = alpha
      ctx.strokeStyle = burst.color
      ctx.lineWidth = Math.max(1, 2 * this.dpr)
      ctx.beginPath()
      ctx.arc(burst.x, burst.y, radius, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  private renderHud(ctx: CanvasRenderingContext2D): void {
    const panelX = 10 * this.dpr
    const panelY = 10 * this.dpr
    const panelW = 182 * this.dpr
    const panelH = 58 * this.dpr
    drawKawaiiPanel(ctx, panelX, panelY, panelW, panelH, {
      fill: 'rgba(255, 250, 246, 0.92)',
      accent: '#f59e0b',
      stroke: '#0f172a',
    })
    drawKawaiiInlineLabel(ctx, {
      x: panelX + 12 * this.dpr,
      y: panelY + 18 * this.dpr,
      text: `分數 ${this.score}`,
      iconKind: 'star',
      color: '#7c2d12',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })
    drawKawaiiInlineLabel(ctx, {
      x: panelX + 12 * this.dpr,
      y: panelY + 36 * this.dpr,
      text: `等級 ${this.level}`,
      iconKind: 'target',
      color: '#7c2d12',
      fontSize: Math.max(10, Math.floor(11 * this.dpr)),
    })

    const heartSize = 9 * this.dpr
    const spacing = 22 * this.dpr
    const startX = this.width - (this.maxLives * spacing + 16 * this.dpr)
    const y = 22 * this.dpr

    for (let i = 0; i < this.maxLives; i += 1) {
      const x = startX + i * spacing
      const active = i < this.lives
      this.drawHeart(ctx, x, y, heartSize, active)
    }
  }

  private renderShieldGlow(ctx: CanvasRenderingContext2D): void {
    const pad = 5 * this.dpr
    const x = this.basketX - pad
    const y = this.basketY - pad
    const w = this.basketWidth + pad * 2
    const h = this.basketHeight + pad * 2
    const pulse = 0.65 + 0.35 * Math.sin(this.gameTime * 0.004)

    ctx.save()
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.45 + 0.3 * pulse})`
    ctx.lineWidth = Math.max(1.5 * this.dpr, 2.5 * this.dpr)
    ctx.shadowColor = 'rgba(34, 211, 238, 0.6)'
    ctx.shadowBlur = 10 * this.dpr * pulse
    ctx.strokeRect(x, y, w, h)
    ctx.restore()
  }

  private renderActiveEffectIndicators(ctx: CanvasRenderingContext2D): void {
    const effectsToRender = [...this.activeEffects]
    if (this.shieldActive) {
      effectsToRender.push({ id: 'shield', remainingMs: 1, totalMs: 1 })
    }
    if (effectsToRender.length === 0) {
      return
    }

    const startX = this.width - 22 * this.dpr
    const startY = 44 * this.dpr
    const itemGap = 24 * this.dpr

    ctx.save()
    for (let i = 0; i < effectsToRender.length; i += 1) {
      const effect = effectsToRender[i]!
      const def = ITEM_DEFS[effect.id]
      if (!def) {
        continue
      }

      const x = startX
      const y = startY + i * itemGap
      const progress = def.durationMs > 0 ? Math.max(0, effect.remainingMs / effect.totalMs) : 1

      drawKawaiiPanel(ctx, x - 13 * this.dpr, y - 11 * this.dpr, 26 * this.dpr, 22 * this.dpr, {
        fill: 'rgba(255, 250, 246, 0.88)',
        accent: def.color,
        stroke: '#0f172a',
        radius: 8 * this.dpr,
        shadow: 'rgba(15, 23, 42, 0.12)',
      })
      drawKawaiiCanvasIcon(
        ctx,
        x,
        y,
        11 * this.dpr,
        canvasIconKindForItem(def.icon),
        { color: def.color, ink: '#0f172a' },
      )

      const barW = 28 * this.dpr
      const barH = 5 * this.dpr
      const barX = x - barW / 2
      const barY = y + 11 * this.dpr

      drawKawaiiProgressBar(ctx, barX, barY, barW, barH, progress, {
        trackFill: 'rgba(15, 23, 42, 0.14)',
        fill: def.color,
        stroke: 'rgba(15, 23, 42, 0.22)',
      })
    }
    ctx.restore()
  }

  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, active: boolean): void {
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(size / 10, size / 10)
    ctx.beginPath()
    ctx.moveTo(0, 3)
    ctx.bezierCurveTo(0, 0, -5, 0, -5, 3)
    ctx.bezierCurveTo(-5, 6, -2.8, 8, 0, 10)
    ctx.bezierCurveTo(2.8, 8, 5, 6, 5, 3)
    ctx.bezierCurveTo(5, 0, 0, 0, 0, 3)
    ctx.closePath()
    ctx.fillStyle = active ? '#ef4444' : 'rgba(239,68,68,0.28)'
    ctx.fill()
    ctx.restore()
  }

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${Math.max(26, Math.floor(30 * this.dpr))}px sans-serif`
    ctx.fillText('遊戲結束', this.width / 2, this.height * 0.44)
    ctx.font = `${Math.max(14, Math.floor(16 * this.dpr))}px sans-serif`
    ctx.fillText(`最終分數：${this.score}`, this.width / 2, this.height * 0.5)
    ctx.fillText(`接到水果：${this.fruitsCaught}`, this.width / 2, this.height * 0.55)
  }

  private bindTouchInput(): void {
    if (this.touchBound) {
      return
    }
    this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false })
    this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false })
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd, { passive: false })
    this.touchBound = true
  }

  private unbindTouchInput(): void {
    if (!this.touchBound) {
      return
    }
    this.canvas.removeEventListener('touchstart', this.handleTouchStart)
    this.canvas.removeEventListener('touchmove', this.handleTouchMove)
    this.canvas.removeEventListener('touchend', this.handleTouchEnd)
    this.canvas.removeEventListener('touchcancel', this.handleTouchEnd)
    this.touchMoveX = 0
    this.activeTouchId = null
    this.touchBound = false
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.changedTouches.length === 0) {
      return
    }

    const touch = event.changedTouches[0]
    if (!touch) {
      return
    }

    // Only assign activeTouchId if no touch is currently active
    // This prevents a second touch from stealing the active movement
    if (this.activeTouchId === null) {
      this.activeTouchId = touch.identifier
      this.touchMoveX = this.touchDirectionFromClientX(touch.clientX)
    }
    event.preventDefault()
  }

  private handleTouchMove = (event: TouchEvent): void => {
    if (this.activeTouchId === null) {
      return
    }

    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i]
      if (touch && touch.identifier === this.activeTouchId) {
        this.touchMoveX = this.touchDirectionFromClientX(touch.clientX)
        event.preventDefault()
        return
      }
    }
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    if (this.activeTouchId === null) {
      return
    }

    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const touch = event.changedTouches[i]
      if (touch && touch.identifier === this.activeTouchId) {
        this.activeTouchId = null
        this.touchMoveX = 0
        event.preventDefault()
        return
      }
    }
  }

  private touchDirectionFromClientX(clientX: number): number {
    const rect = this.canvas.getBoundingClientRect()
    const localX = clientX - rect.left
    return localX < rect.width / 2 ? -1 : 1
  }
}

export function createFruitCatchGame(): GameInstance {
  return new FruitCatchGame()
}
