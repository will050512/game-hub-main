import { GameEngine } from '@/engine/GameEngine'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type GameHudData,
} from '@/types'
import { SPECIAL_FOOD_DEFS, ARENA_MODIFIER_DEFS, type SpecialFoodDef, type ArenaModifierDef } from './data'
import {
  preloadCoreSprites,
  preloadGameSprites,
  drawSprite,
  getSprite,
} from '@/engine/sprites/spriteLoader'
import { drawKenneySprite } from '@/engine/sprites/kenneySpriteLoader'
import {
  canvasIconKindForItem,
  drawKawaiiInlineLabel,
  drawKawaiiPanel,
  drawKawaiiProgressBar,
} from '@/engine/kawaiiCanvas'
import { EffectsManager } from '@/engine/effects'

const SPECIAL_FOOD_TINTS: Record<string, { variant: string; color: string }> = {
  slow: { variant: 'slow', color: '#60a5fa' },
  wall_pass: { variant: 'wall_pass', color: '#c084fc' },
  shrink: { variant: 'shrink', color: '#34d399' },
  golden_apple: { variant: 'golden_apple', color: '#fbbf24' },
}

const SNAKE_HEAD_TINTS: Record<string, { variant: string; color: string }> = {
  slow: { variant: 'slow', color: '#60a5fa' },
  wall_pass: { variant: 'wall_pass', color: '#c084fc' },
}

const DIRECTION_ROTATION: Record<Direction, number> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
}

interface Cell {
  x: number
  y: number
}

type Direction = 'up' | 'down' | 'left' | 'right'



class SnakeGame extends GameEngine {
  private readonly gridCols = 20
  private readonly gridRows = 20
  private readonly levelFoodTarget = 5

  private snake: Cell[] = []
  private food: Cell = { x: 0, y: 0 }

  private direction: Direction = 'right'
  private queuedDirection: Direction = 'right'

  private score = 0
  private level = 1
  private foodsEaten = 0
  private elapsedMs = 0

  private stepTimer = 0
  private moveIntervalMs = 170
  private baseMoveInterval = 170

  private specialFood: (Cell & { def: SpecialFoodDef }) | null = null
  private specialFoodTimer = 0
  private activeBuff: { def: SpecialFoodDef; remainingMs: number } | null = null
  private wallPassActive = false

  private activeArenaModifier: { def: ArenaModifierDef; remainingMs: number } | null = null
  private arenaModifierCooldown = 0
  private extraFoods: Cell[] = []
  private portals: [Cell, Cell] | null = null
  private safeZoneActive = false

  private analogInputCooldownMs = 0
  private readonly analogInputIntervalMs = 85

  private gameOver = false
  private gameOverNotified = false

  private effects: EffectsManager = new EffectsManager()
  private trailTimer = 0

  private keyboardBound = false
  private touchBound = false
  private touchStart: { id: number; x: number; y: number } | null = null

  constructor() {
    super()
  }

  protected init(): void {
    const centerX = Math.floor(this.gridCols / 2)
    const centerY = Math.floor(this.gridRows / 2)

    this.snake = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ]

    this.food = this.createFoodPosition()
    this.direction = 'right'
    this.queuedDirection = 'right'

    this.score = 0
    this.level = 1
    this.foodsEaten = 0
    this.elapsedMs = 0

    this.stepTimer = 0
    this.moveIntervalMs = 170
    this.baseMoveInterval = 170
    this.specialFood = null
    this.specialFoodTimer = 0
    this.activeBuff = null
    this.wallPassActive = false
    this.analogInputCooldownMs = 0

    this.activeArenaModifier = null
    this.arenaModifierCooldown = 0
    this.extraFoods = []
    this.portals = null
    this.safeZoneActive = false

    this.effects = new EffectsManager()
    this.trailTimer = 0

    this.gameOver = false
    this.gameOverNotified = false

    this.bindInputListeners()
    this.callbacks.onScoreUpdate?.(this.score)
    this.pushStats()

    void this.preloadSprites()
  }

  private async preloadSprites(): Promise<void> {
    await preloadCoreSprites()
    await preloadGameSprites('snake')
    await Promise.all([
      ...Object.entries(SPECIAL_FOOD_TINTS).map(([, t]) =>
        getSprite('snake.special-food', { variant: t.variant, props: { color: t.color } }).catch(() => null),
      ),
      ...Object.entries(SNAKE_HEAD_TINTS).map(([, t]) =>
        getSprite('snake.head', { variant: t.variant, props: { color: t.color } }).catch(() => null),
      ),
    ])
  }

  override stop(): void {
    this.unbindInputListeners()
    super.stop()
  }

  protected update(dt: number): void {
    this.elapsedMs += dt
    this.readContinuousInput(dt)

    if (!this.gameOver) {
      this.updateBuff(dt)
      this.updateArenaModifier(dt)

      if (this.arenaModifierCooldown > 0) {
        this.arenaModifierCooldown -= dt
      } else if (!this.activeArenaModifier && Math.random() < 0.002) {
        this.activateRandomArenaModifier()
      }

      if (this.specialFood) {
        this.specialFoodTimer += dt
        if (this.specialFoodTimer >= 10000) {
          this.specialFood = null
          this.specialFoodTimer = 0
        }
      }

      this.stepTimer += dt
      while (this.stepTimer >= this.moveIntervalMs && !this.gameOver) {
        this.stepTimer -= this.moveIntervalMs
        this.advanceSnake()
      }
    }

    this.pushStats()

    this.effects.update(dt)

    if (!this.gameOver) {
      this.trailTimer += dt
      if (this.trailTimer > 60) {
        this.trailTimer = 0
        const head = this.snake[0]
        if (head) {
          const boardSize = Math.floor(Math.min(this.width, this.height) * 0.9)
          const sz = Math.max(8, Math.floor(boardSize / this.gridCols))
          const ox = Math.floor((this.width - this.gridCols * sz) / 2)
          const oy = Math.floor((this.height - this.gridRows * sz) / 2)
          const x = ox + head.x * sz + sz / 2
          const y = oy + head.y * sz + sz / 2
          this.effects.burst(x, y, 2, ['#4ade80', '#22c55e'], { min: 0.5, max: 2 })
        }
      }
    }
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.effects.triggerShake(intensity, duration)
  }

  private spawnParticles(x: number, y: number, count: number, color: string, speedMult = 1) {
    this.effects.burst(x, y, count, [color], { min: 2 * speedMult, max: 8 * speedMult })
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, _scale = 1) {
    this.effects.spawnFloatingText(x, y, text, color)
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    const boardSize = Math.floor(Math.min(this.width, this.height) * 0.9)
    const cellSize = Math.max(8, Math.floor(boardSize / this.gridCols))
    const gridWidth = cellSize * this.gridCols
    const gridHeight = cellSize * this.gridRows
    const offsetX = Math.floor((this.width - gridWidth) / 2)
    const offsetY = Math.floor((this.height - gridHeight) / 2)

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = '#05180d'
    ctx.fillRect(0, 0, this.width, this.height)

    if (this.effects.shake.isActive) {
      this.effects.shake.apply(ctx)
    }

    const backdrop = ctx.createLinearGradient(0, offsetY, 0, offsetY + gridHeight)
    backdrop.addColorStop(0, '#0b2e19')
    backdrop.addColorStop(1, '#0a2415')
    ctx.fillStyle = backdrop
    ctx.fillRect(offsetX, offsetY, gridWidth, gridHeight)

    ctx.strokeStyle = 'rgba(60, 120, 82, 0.42)'
    ctx.lineWidth = Math.max(1, Math.floor(this.dpr))
    for (let x = 0; x <= this.gridCols; x += 1) {
      const lineX = offsetX + x * cellSize
      ctx.beginPath()
      ctx.moveTo(lineX + 0.5, offsetY)
      ctx.lineTo(lineX + 0.5, offsetY + gridHeight)
      ctx.stroke()
    }
    for (let y = 0; y <= this.gridRows; y += 1) {
      const lineY = offsetY + y * cellSize
      ctx.beginPath()
      ctx.moveTo(offsetX, lineY + 0.5)
      ctx.lineTo(offsetX + gridWidth, lineY + 0.5)
      ctx.stroke()
    }

    const appleInset = Math.max(1, Math.floor(cellSize * 0.12))
    const spriteScale = cellSize / 32
    const appleSpriteScale = cellSize / 28
    const portalSpriteScale = cellSize / 36
    const kenneyFoodScale = cellSize / 32
    const kenneyPortalScale = cellSize / 16

    const foodCx = offsetX + this.food.x * cellSize + cellSize / 2
    const foodCy = offsetY + this.food.y * cellSize + cellSize / 2
    if (!drawKenneySprite(ctx, 'snake.apple', {
      x: foodCx,
      y: foodCy,
      scaleX: kenneyFoodScale,
      scaleY: kenneyFoodScale,
    }) && !drawSprite(ctx, 'snake.apple', {
      x: foodCx,
      y: foodCy,
      scale: appleSpriteScale,
    })) {
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(
        offsetX + this.food.x * cellSize + appleInset,
        offsetY + this.food.y * cellSize + appleInset,
        cellSize - appleInset * 2,
        cellSize - appleInset * 2,
      )
    }

    for (const extraFood of this.extraFoods) {
      const extraCx = offsetX + extraFood.x * cellSize + cellSize / 2
      const extraCy = offsetY + extraFood.y * cellSize + cellSize / 2
      if (!drawKenneySprite(ctx, 'snake.golden-apple', {
        x: extraCx,
        y: extraCy,
        scaleX: kenneyFoodScale,
        scaleY: kenneyFoodScale,
      }) && !drawSprite(ctx, 'snake.golden-apple', {
        x: extraCx,
        y: extraCy,
        scale: appleSpriteScale,
      })) {
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(
          offsetX + extraFood.x * cellSize + appleInset,
          offsetY + extraFood.y * cellSize + appleInset,
          cellSize - appleInset * 2,
          cellSize - appleInset * 2,
        )
      }
    }

    if (this.portals) {
      for (const portal of this.portals) {
        const pulse = (Math.sin(this.elapsedMs * 0.006) + 1) * 0.5
        const centerX = offsetX + portal.x * cellSize + cellSize / 2
        const centerY = offsetY + portal.y * cellSize + cellSize / 2
        if (!drawKenneySprite(ctx, 'snake.portal', {
          x: centerX,
          y: centerY,
          scaleX: kenneyPortalScale,
          scaleY: kenneyPortalScale,
          alpha: 0.55 + pulse * 0.4,
          rotation: this.elapsedMs * 0.001,
        }) && !drawSprite(ctx, 'snake.portal', {
          x: centerX,
          y: centerY,
          scale: portalSpriteScale,
          alpha: 0.55 + pulse * 0.4,
          rotation: this.elapsedMs * 0.001,
        })) {
          ctx.globalAlpha = 0.3 + pulse * 0.3
          ctx.fillStyle = '#8b5cf6'
          ctx.beginPath()
          ctx.arc(centerX, centerY, cellSize * 0.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
    }

    if (this.safeZoneActive) {
      const centerX = Math.floor(this.gridCols / 2)
      const centerY = Math.floor(this.gridRows / 2)
      const safeRadius = Math.floor(Math.min(this.gridCols, this.gridRows) / 3)
      const zoneX = offsetX + (centerX - safeRadius) * cellSize
      const zoneY = offsetY + (centerY - safeRadius) * cellSize
      const zoneSize = (safeRadius * 2 + 1) * cellSize
      ctx.globalAlpha = 0.15
      ctx.fillStyle = '#10b981'
      ctx.fillRect(zoneX, zoneY, zoneSize, zoneSize)
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = Math.max(2, Math.floor(cellSize * 0.1))
      ctx.strokeRect(zoneX, zoneY, zoneSize, zoneSize)
      ctx.globalAlpha = 1
    }

    if (this.specialFood) {
      this.renderSpecialFood(ctx, cellSize, offsetX, offsetY)
    }

    const kenneySegmentScale = cellSize / 32
    for (let i = this.snake.length - 1; i >= 0; i -= 1) {
      const segment = this.snake[i]
      if (!segment) {
        continue
      }
      const isHead = i === 0
      const cx = offsetX + segment.x * cellSize + cellSize / 2
      const cy = offsetY + segment.y * cellSize + cellSize / 2

      if (isHead) {
        const buffId = this.activeBuff?.def.id
        const tint = buffId ? SNAKE_HEAD_TINTS[buffId] : null
        const headDrew = drawKenneySprite(ctx, 'snake.head', {
          x: cx,
          y: cy,
          scaleX: kenneySegmentScale,
          scaleY: kenneySegmentScale,
          rotation: DIRECTION_ROTATION[this.direction],
          alpha: buffId ? 0.85 : 1,
        }) || drawSprite(ctx, 'snake.head', {
          x: cx,
          y: cy,
          scale: spriteScale,
          rotation: DIRECTION_ROTATION[this.direction],
          variant: tint?.variant,
        })
        if (!headDrew) {
          const headColor = buffId === 'slow' ? '#60a5fa' : buffId === 'wall_pass' ? '#c084fc' : '#5bff74'
          const inset = Math.max(1, Math.floor(cellSize * 0.08))
          ctx.fillStyle = headColor
          ctx.fillRect(
            offsetX + segment.x * cellSize + inset,
            offsetY + segment.y * cellSize + inset,
            cellSize - inset * 2,
            cellSize - inset * 2,
          )
        }
      } else {
        const bodyDrew = drawKenneySprite(ctx, 'snake.body', {
          x: cx,
          y: cy,
          scaleX: kenneySegmentScale,
          scaleY: kenneySegmentScale,
        }) || drawSprite(ctx, 'snake.body', {
          x: cx,
          y: cy,
          scale: spriteScale,
        })
        if (!bodyDrew) {
          const inset = Math.max(1, Math.floor(cellSize * 0.15))
          ctx.fillStyle = '#37c95a'
          ctx.fillRect(
            offsetX + segment.x * cellSize + inset,
            offsetY + segment.y * cellSize + inset,
            cellSize - inset * 2,
            cellSize - inset * 2,
          )
        }
      }
    }

    if (this.activeBuff) {
      this.renderBuffIndicator(ctx, offsetX, offsetY, gridWidth)
    }

    if (this.activeArenaModifier) {
      this.renderArenaModifierIndicator(ctx, offsetX, offsetY, gridWidth, gridHeight)
    }

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.58)'
      ctx.fillRect(offsetX, offsetY, gridWidth, gridHeight)
      ctx.fillStyle = '#d7ffe0'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold ${Math.max(22, Math.floor(cellSize * 1.1))}px sans-serif`
      ctx.fillText('遊戲結束', offsetX + gridWidth / 2, offsetY + gridHeight * 0.46)
      ctx.font = `${Math.max(12, Math.floor(cellSize * 0.5))}px sans-serif`
      ctx.fillText('滑動或按方向鍵再玩一次', offsetX + gridWidth / 2, offsetY + gridHeight * 0.56)
    }

    this.renderParticles(ctx)
    this.renderFloatingTexts(ctx)

    if (this.effects.shake.isActive) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.effects.particles.render(ctx)
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.effects.floatingText.render(ctx)
  }

  private readContinuousInput(dt: number): void {
    this.analogInputCooldownMs = Math.max(0, this.analogInputCooldownMs - dt)
    if (this.analogInputCooldownMs > 0) {
      return
    }

    const dx = this.input.moveX
    const dy = this.input.moveY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    if (absDx < 0.45 && absDy < 0.45) {
      return
    }

    if (absDx >= absDy) {
      this.queueDirection(dx >= 0 ? 'right' : 'left')
    } else {
      this.queueDirection(dy >= 0 ? 'down' : 'up')
    }
    this.analogInputCooldownMs = this.analogInputIntervalMs
  }

  private advanceSnake(): void {
    this.direction = this.queuedDirection

    const head = this.snake[0]
    if (!head) {
      return
    }

    const movement = this.directionVector(this.direction)
    const nextHead: Cell = {
      x: head.x + movement.x,
      y: head.y + movement.y,
    }

    if (!this.isInsideBoard(nextHead)) {
      if (this.wallPassActive) {
        nextHead.x = ((nextHead.x % this.gridCols) + this.gridCols) % this.gridCols
        nextHead.y = ((nextHead.y % this.gridRows) + this.gridRows) % this.gridRows
      } else {
        this.triggerGameOver()
        return
      }
    }

    if (this.safeZoneActive) {
      const centerX = Math.floor(this.gridCols / 2)
      const centerY = Math.floor(this.gridRows / 2)
      const safeRadius = Math.floor(Math.min(this.gridCols, this.gridRows) / 3)
      const inSafeZone =
        nextHead.x >= centerX - safeRadius &&
        nextHead.x <= centerX + safeRadius &&
        nextHead.y >= centerY - safeRadius &&
        nextHead.y <= centerY + safeRadius
      if (!inSafeZone) {
        this.triggerGameOver()
        return
      }
    }

    if (this.portals) {
      if (nextHead.x === this.portals[0].x && nextHead.y === this.portals[0].y) {
        nextHead.x = this.portals[1].x
        nextHead.y = this.portals[1].y
      } else if (nextHead.x === this.portals[1].x && nextHead.y === this.portals[1].y) {
        nextHead.x = this.portals[0].x
        nextHead.y = this.portals[0].y
      }
    }

    const willEat = nextHead.x === this.food.x && nextHead.y === this.food.y
    const bodyToCheck = willEat ? this.snake : this.snake.slice(0, -1)
    if (this.isSnakeAt(nextHead, bodyToCheck)) {
      this.triggerGameOver()
      return
    }

    this.snake.unshift(nextHead)

    if (willEat) {
      this.foodsEaten += 1
      this.level = Math.floor(this.foodsEaten / this.levelFoodTarget) + 1
      this.score += 10 * this.level
      this.moveIntervalMs = Math.max(70, this.moveIntervalMs * 0.96)
      this.food = this.createFoodPosition()
      if (!this.specialFood && Math.random() < 0.2) {
        this.spawnSpecialFood()
      }
      this.callbacks.onScoreUpdate?.(this.score)

      const boardSize = Math.floor(Math.min(this.width, this.height) * 0.9)
      const sz = Math.max(8, Math.floor(boardSize / this.gridCols))
      const ox = Math.floor((this.width - this.gridCols * sz) / 2)
      const oy = Math.floor((this.height - this.gridRows * sz) / 2)
      const screenX = ox + this.food.x * sz + sz / 2
      const screenY = oy + this.food.y * sz + sz / 2
      this.spawnParticles(screenX, screenY, 15, '#4ade80', 1.2)
      this.spawnFloatingText(screenX, screenY - 20, `+${10 * this.level}`, '#4ade80', 0.8)
    } else {
      this.snake.pop()
    }

    if (this.specialFood && nextHead.x === this.specialFood.x && nextHead.y === this.specialFood.y) {
      this.collectSpecialFood()
    }

    for (let i = this.extraFoods.length - 1; i >= 0; i--) {
      const extraFood = this.extraFoods[i]!
      if (nextHead.x === extraFood.x && nextHead.y === extraFood.y) {
        this.extraFoods.splice(i, 1)
        this.foodsEaten += 1
        this.score += 10 * this.level
        this.callbacks.onScoreUpdate?.(this.score)
        const boardSize = Math.floor(Math.min(this.width, this.height) * 0.9)
        const sz = Math.max(8, Math.floor(boardSize / this.gridCols))
        const ox = Math.floor((this.width - this.gridCols * sz) / 2)
        const oy = Math.floor((this.height - this.gridRows * sz) / 2)
        const screenX = ox + extraFood.x * sz + sz / 2
        const screenY = oy + extraFood.y * sz + sz / 2
        this.spawnParticles(screenX, screenY, 15, '#f59e0b', 1.2)
      }
    }
  }

  private spawnSpecialFood(): void {
    const defs = Object.values(SPECIAL_FOOD_DEFS)
    const def = defs[Math.floor(Math.random() * defs.length)]
    if (!def) {
      return
    }

    const maxCells = this.gridCols * this.gridRows
    const occupiedCount = this.snake.length + 1
    if (occupiedCount >= maxCells) {
      return
    }

    for (let attempt = 0; attempt < 200; attempt += 1) {
      const candidate: Cell = {
        x: Math.floor(Math.random() * this.gridCols),
        y: Math.floor(Math.random() * this.gridRows),
      }
      const hitsSnake = this.isSnakeAt(candidate, this.snake)
      const hitsNormalFood = candidate.x === this.food.x && candidate.y === this.food.y
      if (!hitsSnake && !hitsNormalFood) {
        this.specialFood = { ...candidate, def }
        this.specialFoodTimer = 0
        return
      }
    }

    const freeCells: Cell[] = []
    for (let y = 0; y < this.gridRows; y += 1) {
      for (let x = 0; x < this.gridCols; x += 1) {
        const candidate = { x, y }
        const hitsSnake = this.isSnakeAt(candidate, this.snake)
        const hitsNormalFood = candidate.x === this.food.x && candidate.y === this.food.y
        if (!hitsSnake && !hitsNormalFood) {
          freeCells.push(candidate)
        }
      }
    }

    const chosen = freeCells[Math.floor(Math.random() * freeCells.length)]
    if (!chosen) {
      return
    }
    this.specialFood = { ...chosen, def }
    this.specialFoodTimer = 0
  }

  private collectSpecialFood(): void {
    if (!this.specialFood) {
      return
    }

    const def = this.specialFood.def
    this.applySpecialEffect(def)
    this.specialFood = null
    this.specialFoodTimer = 0
    this.score += 10 * this.level * def.scoreMultiplier
    this.callbacks.onScoreUpdate?.(this.score)
  }

  private applySpecialEffect(def: SpecialFoodDef): void {
    if (this.activeBuff) {
      this.revertBuff(this.activeBuff.def)
      this.activeBuff = null
    }

    switch (def.id) {
      case 'slow':
        this.baseMoveInterval = this.moveIntervalMs
        this.moveIntervalMs = this.moveIntervalMs / 0.7
        this.activeBuff = { def, remainingMs: def.durationMs }
        break
      case 'wall_pass':
        this.wallPassActive = true
        this.activeBuff = { def, remainingMs: def.durationMs }
        break
      case 'shrink': {
        const removeCount = Math.min(3, this.snake.length - 1)
        for (let i = 0; i < removeCount; i += 1) {
          this.snake.pop()
        }
        break
      }
      case 'golden_apple':
        break
      default:
        break
    }
  }

  private updateBuff(dt: number): void {
    if (!this.activeBuff) {
      return
    }

    this.activeBuff.remainingMs -= dt
    if (this.activeBuff.remainingMs <= 0) {
      this.revertBuff(this.activeBuff.def)
      this.activeBuff = null
    }
  }

  private revertBuff(def: SpecialFoodDef): void {
    switch (def.id) {
      case 'slow':
        this.moveIntervalMs = this.baseMoveInterval
        break
      case 'wall_pass':
        this.wallPassActive = false
        break
      default:
        break
    }
  }

  private activateRandomArenaModifier(): void {
    const defs = Object.values(ARENA_MODIFIER_DEFS)
    const chosen = defs[Math.floor(Math.random() * defs.length)]
    if (!chosen) return

    this.activeArenaModifier = { def: chosen, remainingMs: chosen.durationMs }

    switch (chosen.id) {
      case 'speed_boost':
        this.baseMoveInterval = this.moveIntervalMs
        this.moveIntervalMs = this.moveIntervalMs / 1.5
        break
      case 'food_frenzy':
        for (let i = 0; i < 3; i++) {
          const food = this.createFoodPosition()
          if (food.x !== 0 || food.y !== 0) {
            this.extraFoods.push(food)
          }
        }
        break
      case 'portal_zone': {
        const p1 = this.createFoodPosition()
        const p2 = this.createFoodPosition()
        this.portals = [p1, p2]
        break
      }
      case 'safe_zone':
        this.safeZoneActive = true
        break
    }

    this.spawnFloatingText(this.width / 2, this.height / 4, chosen.name, chosen.color, 1)
  }

  private updateArenaModifier(dt: number): void {
    if (!this.activeArenaModifier) return

    this.activeArenaModifier.remainingMs -= dt
    if (this.activeArenaModifier.remainingMs <= 0) {
      this.deactivateArenaModifier()
    }
  }

  private deactivateArenaModifier(): void {
    if (!this.activeArenaModifier) return

    switch (this.activeArenaModifier.def.id) {
      case 'speed_boost':
        this.moveIntervalMs = this.baseMoveInterval
        break
      case 'food_frenzy':
        this.extraFoods = []
        break
      case 'portal_zone':
        this.portals = null
        break
      case 'safe_zone':
        this.safeZoneActive = false
        break
    }

    this.arenaModifierCooldown = 20000 + Math.random() * 10000
    this.activeArenaModifier = null
  }

  private renderSpecialFood(ctx: CanvasRenderingContext2D, cellSize: number, offsetX: number, offsetY: number): void {
    const specialFood = this.specialFood
    if (!specialFood) {
      return
    }

    const pulse = (Math.sin(this.elapsedMs * 0.004) + 1) * 0.5
    const centerX = offsetX + specialFood.x * cellSize + cellSize * 0.5
    const centerY = offsetY + specialFood.y * cellSize + cellSize * 0.5
    const glowRadius = Math.max(4, cellSize * (0.38 + pulse * 0.14))

    ctx.save()
    ctx.globalAlpha = 0.22 + pulse * 0.26
    ctx.fillStyle = specialFood.def.color
    ctx.beginPath()
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.restore()

    const tint = SPECIAL_FOOD_TINTS[specialFood.def.id]
    const kenneyDrew = drawKenneySprite(ctx, 'snake.special-food', {
      x: centerX,
      y: centerY,
      scaleX: cellSize / 32,
      scaleY: cellSize / 32,
      rotation: Math.sin(this.elapsedMs * 0.003) * 0.15,
    })
    const spriteDrew = drawSprite(ctx, 'snake.special-food', {
      x: centerX,
      y: centerY,
      scale: cellSize / 32,
      variant: tint?.variant,
      rotation: Math.sin(this.elapsedMs * 0.003) * 0.15,
    })
    if (!kenneyDrew && !spriteDrew) {
      const half = Math.max(3, cellSize * 0.3)
      ctx.save()
      ctx.fillStyle = specialFood.def.color
      ctx.beginPath()
      ctx.moveTo(centerX, centerY - half)
      ctx.lineTo(centerX + half, centerY)
      ctx.lineTo(centerX, centerY + half)
      ctx.lineTo(centerX - half, centerY)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)'
      ctx.lineWidth = Math.max(1, Math.floor(cellSize * 0.08))
      ctx.stroke()
      ctx.restore()
    }
  }

  private renderBuffIndicator(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, gridWidth: number): void {
    const activeBuff = this.activeBuff
    if (!activeBuff) {
      return
    }

    const width = Math.max(136, Math.min(240, Math.floor(gridWidth * 0.6)))
    const height = 30
    const x = offsetX + (gridWidth - width) / 2
    const y = Math.max(8, offsetY - height - 8)
    const progress = activeBuff.def.durationMs > 0 ? Math.max(0, Math.min(1, activeBuff.remainingMs / activeBuff.def.durationMs)) : 1

    ctx.save()
    drawKawaiiPanel(ctx, x, y, width, height, {
      fill: 'rgba(255, 251, 245, 0.96)',
      accent: activeBuff.def.color,
      radius: 12,
      shadow: 'rgba(2, 12, 8, 0.16)',
    })

    const seconds = Math.max(0, Math.ceil(activeBuff.remainingMs / 1000))
    drawKawaiiInlineLabel(ctx, {
      x: x + 10,
      y: y + height * 0.42,
      text: `${activeBuff.def.name} ${seconds}秒`,
      iconKind: canvasIconKindForItem(activeBuff.def.icon),
      color: '#213227',
      fontSize: Math.max(12, Math.floor(height * 0.42)),
      align: 'left',
    })

    const barX = x + 8
    const barY = y + height - 8
    const barWidth = width - 16
    const barHeight = 4
    drawKawaiiProgressBar(ctx, barX, barY, barWidth, barHeight, progress, {
      trackFill: 'rgba(23, 23, 23, 0.1)',
      fill: activeBuff.def.color,
    })
    ctx.restore()
  }

  private renderArenaModifierIndicator(
    ctx: CanvasRenderingContext2D,
    offsetX: number,
    offsetY: number,
    gridWidth: number,
    gridHeight: number,
  ): void {
    const activeArenaModifier = this.activeArenaModifier
    if (!activeArenaModifier) return

    const width = Math.max(136, Math.min(240, Math.floor(gridWidth * 0.6)))
    const height = 30
    const x = offsetX + (gridWidth - width) / 2
    const y = offsetY + gridHeight + Math.max(8, Math.floor(height * 0.4))
    const progress =
      activeArenaModifier.def.durationMs > 0
        ? Math.max(0, Math.min(1, activeArenaModifier.remainingMs / activeArenaModifier.def.durationMs))
        : 1

    ctx.save()
    drawKawaiiPanel(ctx, x, y, width, height, {
      fill: 'rgba(255, 251, 245, 0.96)',
      accent: activeArenaModifier.def.color,
      radius: 12,
      shadow: 'rgba(2, 12, 8, 0.16)',
    })

    const seconds = Math.max(0, Math.ceil(activeArenaModifier.remainingMs / 1000))
    drawKawaiiInlineLabel(ctx, {
      x: x + 10,
      y: y + height * 0.42,
      text: `${activeArenaModifier.def.name} ${seconds}秒`,
      iconKind: canvasIconKindForItem(activeArenaModifier.def.icon),
      color: '#213227',
      fontSize: Math.max(12, Math.floor(height * 0.42)),
      align: 'left',
    })

    const barX = x + 8
    const barY = y + height - 8
    const barWidth = width - 16
    const barHeight = 4
    drawKawaiiProgressBar(ctx, barX, barY, barWidth, barHeight, progress, {
      trackFill: 'rgba(23, 23, 23, 0.1)',
      fill: activeArenaModifier.def.color,
    })
    ctx.restore()
  }

  private triggerGameOver(): void {
    this.gameOver = true
    if (!this.gameOverNotified) {
      this.gameOverNotified = true
      const callbacks: GameCallbacks = this.callbacks
      callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'snake',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.foodsEaten,
          time: Math.floor(this.elapsedMs / 1000),
          level: this.level,
          coins: 0,
        },
      })
      callbacks.onGameOver?.(this.score)
      this.triggerScreenShake(10, 400)
      this.spawnFloatingText(this.width / 2, this.height / 2, 'GAME OVER', '#ff4757', 1.2)
    }
  }

  private createFoodPosition(): Cell {
    const maxCells = this.gridCols * this.gridRows
    if (this.snake.length >= maxCells) {
      return { x: 0, y: 0 }
    }

    for (let attempt = 0; attempt < 200; attempt += 1) {
      const candidate = {
        x: Math.floor(Math.random() * this.gridCols),
        y: Math.floor(Math.random() * this.gridRows),
      }
      const hitsSpecialFood = this.specialFood ? candidate.x === this.specialFood.x && candidate.y === this.specialFood.y : false
      if (!this.isSnakeAt(candidate, this.snake) && !hitsSpecialFood) {
        return candidate
      }
    }

    const freeCells: Cell[] = []
    for (let y = 0; y < this.gridRows; y += 1) {
      for (let x = 0; x < this.gridCols; x += 1) {
        const candidate = { x, y }
        const hitsSpecialFood = this.specialFood ? candidate.x === this.specialFood.x && candidate.y === this.specialFood.y : false
        if (!this.isSnakeAt(candidate, this.snake) && !hitsSpecialFood) {
          freeCells.push(candidate)
        }
      }
    }

    return freeCells[Math.floor(Math.random() * freeCells.length)] ?? { x: 0, y: 0 }
  }

  private isSnakeAt(cell: Cell, body: Cell[]): boolean {
    return body.some((segment) => segment.x === cell.x && segment.y === cell.y)
  }

  private isInsideBoard(cell: Cell): boolean {
    return cell.x >= 0 && cell.x < this.gridCols && cell.y >= 0 && cell.y < this.gridRows
  }

  private directionVector(direction: Direction): Cell {
    if (direction === 'up') return { x: 0, y: -1 }
    if (direction === 'down') return { x: 0, y: 1 }
    if (direction === 'left') return { x: -1, y: 0 }
    return { x: 1, y: 0 }
  }

  private isOpposite(next: Direction, current: Direction): boolean {
    return (
      (next === 'up' && current === 'down') ||
      (next === 'down' && current === 'up') ||
      (next === 'left' && current === 'right') ||
      (next === 'right' && current === 'left')
    )
  }

  private queueDirection(next: Direction): void {
    if (this.gameOver) {
      return
    }
    if (this.isOpposite(next, this.direction) || next === this.direction) {
      return
    }
    this.queuedDirection = next
  }

  private bindInputListeners(): void {
    if (!this.keyboardBound) {
      window.addEventListener('keydown', this.handleKeyDown)
      this.keyboardBound = true
    }
    if (!this.touchBound) {
      this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false })
      this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false })
      this.touchBound = true
    }
  }

  private unbindInputListeners(): void {
    if (this.keyboardBound) {
      window.removeEventListener('keydown', this.handleKeyDown)
      this.keyboardBound = false
    }
    if (this.touchBound) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart)
      this.canvas.removeEventListener('touchend', this.handleTouchEnd)
      this.touchBound = false
    }
    this.touchStart = null
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase()
    if (key === 'arrowup') {
      event.preventDefault()
      this.queueDirection('up')
      return
    }
    if (key === 'arrowdown') {
      event.preventDefault()
      this.queueDirection('down')
      return
    }
    if (key === 'arrowleft') {
      event.preventDefault()
      this.queueDirection('left')
      return
    }
    if (key === 'arrowright') {
      event.preventDefault()
      this.queueDirection('right')
      return
    }
    if (this.gameOver && key === 'r') {
      event.preventDefault()
      this.init()
    }
  }

  private handleTouchStart = (event: TouchEvent): void => {
    const touch = event.changedTouches[0]
    if (!touch) {
      return
    }

    this.touchStart = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    }
    event.preventDefault()
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.touchStart) {
      return
    }

    let touch: Touch | null = null
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const candidate = event.changedTouches[i]
      if (candidate && candidate.identifier === this.touchStart.id) {
        touch = candidate
        break
      }
    }

    if (!touch) {
      return
    }

    const dx = touch.clientX - this.touchStart.x
    const dy = touch.clientY - this.touchStart.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const threshold = 24

    if (Math.max(absDx, absDy) >= threshold) {
      if (absDx >= absDy) {
        this.queueDirection(dx >= 0 ? 'right' : 'left')
      } else {
        this.queueDirection(dy >= 0 ? 'down' : 'up')
      }
    }

    this.touchStart = null
    event.preventDefault()
  }

  getBoardState(): string {
    const lines: string[] = []
    lines.push('=== SNAKE BOARD STATE ===')
    lines.push(`Score: ${this.score} | Level: ${this.level} | Foods: ${this.foodsEaten}`)
    
    if (this.activeBuff) {
      const seconds = Math.ceil(this.activeBuff.remainingMs / 1000)
      lines.push(`Buff: ${this.activeBuff.def.name} (${seconds}s)`)
    }
    
    if (this.activeArenaModifier) {
      const seconds = Math.ceil(this.activeArenaModifier.remainingMs / 1000)
      lines.push(`Arena: ${this.activeArenaModifier.def.name} (${seconds}s)`)
    }
    
    lines.push(`Direction: ${this.direction}`)
    lines.push('')
    
    const grid: string[][] = []
    for (let y = 0; y < this.gridRows; y++) {
      grid[y] = []
      for (let x = 0; x < this.gridCols; x++) {
        grid[y]![x] = '·'
      }
    }
    
    if (this.food) {
      grid[this.food.y]![this.food.x] = 'F'
    }
    
    if (this.specialFood) {
      grid[this.specialFood.y]![this.specialFood.x] = 'S'
    }
    
    for (const extra of this.extraFoods) {
      grid[extra.y]![extra.x] = 'E'
    }
    
    if (this.portals) {
      grid[this.portals[0].y]![this.portals[0].x] = 'P'
      grid[this.portals[1].y]![this.portals[1].x] = 'P'
    }
    
    for (let i = 0; i < this.snake.length; i++) {
      const seg = this.snake[i]!
      grid[seg.y]![seg.x] = i === 0 ? 'H' : 'o'
    }
    
    for (let y = 0; y < this.gridRows; y++) {
      lines.push(grid[y]!.join(''))
    }
    
    lines.push('')
    lines.push('Legend: H=Head o=Body F=Food S=Special E=Extra P=Portal')
    
    if (this.gameOver) {
      lines.push('')
      lines.push('GAME OVER')
    }
    
    return lines.join('\n')
  }

  private pushStats(): void {
    const maxHp = this.gridCols * this.gridRows
    const stats: PlayerStats = {
      hp: this.snake.length,
      maxHp,
      level: this.level,
      xp: this.foodsEaten % this.levelFoodTarget,
      xpToNext: this.levelFoodTarget,
      kills: this.foodsEaten,
      time: Math.floor(this.elapsedMs / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const buffs: GameHudData['activeBuffs'] = []
    if (this.activeBuff) {
      buffs.push({
        id: this.activeBuff.def.id,
        name: this.activeBuff.def.name,
        icon: this.activeBuff.def.icon,
        remainingMs: this.activeBuff.remainingMs,
        totalMs: this.activeBuff.def.durationMs,
        type: 'special',
      })
    }

    const hudData: GameHudData = {
      hp: this.snake.length,
      maxHp: this.gridCols * this.gridRows,
      level: this.level,
      xp: this.foodsEaten % this.levelFoodTarget,
      xpToNext: this.levelFoodTarget,
      kills: this.foodsEaten,
      time: Math.floor(this.elapsedMs / 1000),
      score: this.score,
      activeBuffs: buffs,
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }
}

export function createSnakeGame(): GameInstance {
  return new SnakeGame()
}
