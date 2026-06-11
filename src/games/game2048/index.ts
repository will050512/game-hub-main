import { GameEngine } from '@/engine/GameEngine'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameInstance,
  type GameCallbacks,
  type PlayerStats,
  type GameHudData,
} from '@/types'
import { OBJECTIVE_DEFS, type ObjectiveDef } from './data'
import { preloadGameSprites, drawSprite } from '@/engine/sprites/spriteLoader'
import { drawKenneySprite, preloadKenneySprites } from '@/engine/sprites/kenneySpriteLoader'
import {
  canvasIconKindForItem,
  drawKawaiiButton,
  drawKawaiiInlineLabel,
  drawKawaiiPanel,
  drawKawaiiProgressBar,
} from '@/engine/kawaiiCanvas'
import { EffectsManager } from '@/engine/effects'

type TileTheme = string
type TileVariant = 'button_square_gradient' | 'button_square_gloss' | 'button_square_flat'
type TileThemeEntry = { theme: TileTheme; variant: TileVariant }
const tileImageCache = new Map<string, HTMLImageElement>()

const tileThemeMap: Record<number, TileThemeEntry> = {
  2: { theme: 'Grey', variant: 'button_square_gradient' },
  4: { theme: 'Blue', variant: 'button_square_gradient' },
  8: { theme: 'Red', variant: 'button_square_gradient' },
  16: { theme: 'Blue', variant: 'button_square_gloss' },
  32: { theme: 'Green', variant: 'button_square_gradient' },
  64: { theme: 'Red', variant: 'button_square_gloss' },
  128: { theme: 'Yellow', variant: 'button_square_gradient' },
  256: { theme: 'Yellow', variant: 'button_square_gloss' },
  512: { theme: 'Green', variant: 'button_square_gloss' },
  1024: { theme: 'Blue', variant: 'button_square_flat' },
  2048: { theme: 'Red', variant: 'button_square_flat' },
}

function preload2048Tiles(): void {
  void Promise.allSettled(
    Object.entries(tileThemeMap).map(async ([valueStr, { theme, variant }]) => {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load tile'))
          img.src = `/assets/sprites/ui-pack/${theme}/Default/${variant}.png`
        })
        tileImageCache.set(valueStr, img)
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }
    }),
  )
}

function drawTileBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  value: number,
  fallbackColor: string,
): void {
  const cacheKey = String(value)
  const img = tileImageCache.get(cacheKey)
  if (img) {
    ctx.drawImage(img, x, y, size, size)
    return
  }
  ctx.fillStyle = fallbackColor
  ctx.fillRect(x, y, size, size)
}

type Direction = 'left' | 'right' | 'up' | 'down'

interface CellPos {
  row: number
  col: number
}

interface AnimatedTile {
  from: CellPos
  to: CellPos
  value: number
}

interface TouchTrack {
  id: number
  x: number
  y: number
}

interface MoveResult {
  grid: number[][]
  moved: boolean
  scoreGain: number
  merges: number
  highestTile: number
  animations: AnimatedTile[]
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface BoardLayout {
  boardX: number
  boardY: number
  boardSize: number
  gap: number
  tileSize: number
  radius: number
  undoButton: Rect
  removeButton: Rect
}

const GRID_SIZE = 4
const CELL_COUNT = GRID_SIZE * GRID_SIZE
const ANIMATION_MS = 100
const SWIPE_THRESHOLD = 24

const TILE_COLORS: Record<number, string> = {
  2: '#eee4da',
  4: '#ede0c8',
  8: '#f2b179',
  16: '#f59563',
  32: '#f67c5f',
  64: '#f65e3b',
  128: '#edcf72',
  256: '#edcc61',
  512: '#edc850',
  1024: '#edc53f',
  2048: '#edc22e',
}

class Game2048 extends GameEngine {
  private grid: number[][] = []
  private pendingGrid: number[][] | null = null
  private previousGrid: number[][] | null = null
  private previousScore = 0
  private score = 0
  private highestTile = 2
  private totalMerges = 0
  private mergesThisLevel = 0
  private level = 0
  private gameTime = 0
  private gameOver = false
  private gameOverNotified = false

  private moveQueue: Direction[] = []
  private keyBound = false
  private touchBound = false
  private clickBound = false
  private activeTouch: TouchTrack | null = null

  private animElapsed = 0
  private animTiles: AnimatedTile[] = []

  private effects: EffectsManager = new EffectsManager()
  private mergeEffects: { row: number; col: number; value: number; timer: number }[] = []

  // Aliases for compatibility - use effects managers
  private get screenShake() { return this.effects.shake }
  private get particlesManager() { return this.effects.particles }
  private get floatingTextsManager() { return this.effects.floatingText }

  private undoCharges = 2
  private removeTileCharges = 1
  private removeTileMode = false

  private activeObjective: ObjectiveDef | null = null
  private objectiveProgress = 0

  private layoutCache: BoardLayout | null = null

  constructor() {
    super()
  }

  protected init(): void {
    void preloadGameSprites('game2048')
    void preloadKenneySprites('2048')
    void preload2048Tiles()

    this.grid = this.createEmptyGrid()
    this.pendingGrid = null
    this.previousGrid = null
    this.previousScore = 0
    this.score = 0
    this.highestTile = 2
    this.totalMerges = 0
    this.mergesThisLevel = 0
    this.level = this.computeLevel(this.highestTile)
    this.gameTime = 0
    this.gameOver = false
    this.gameOverNotified = false
    this.moveQueue = []
    this.animElapsed = 0
    this.animTiles = []
    this.activeTouch = null
    this.undoCharges = 2
    this.removeTileCharges = 1
    this.removeTileMode = false
    this.layoutCache = null

    this.activeObjective = null
    this.objectiveProgress = 0

    this.effects = new EffectsManager()
    this.mergeEffects = []

    this.spawnRandomTile(this.grid)
    this.spawnRandomTile(this.grid)
    this.updateHighestTile(this.grid)
    this.level = this.computeLevel(this.highestTile)

    this.selectRandomObjective()

    const callbacks: GameCallbacks = this.callbacks
    callbacks.onScoreUpdate?.(this.score)
    this.bindInputListeners()
    this.pushStats()
  }

  private selectRandomObjective(): void {
    const objectives = OBJECTIVE_DEFS.filter((obj) => {
      if (obj.type === 'tile') return obj.target > this.highestTile
      if (obj.type === 'score') return obj.target > this.score
      if (obj.type === 'merges') return obj.target > this.totalMerges
      return true
    })
    if (objectives.length === 0) return
    this.activeObjective = objectives[Math.floor(Math.random() * objectives.length)] ?? null
    this.objectiveProgress = 0
  }

  private checkObjectiveProgress(): void {
    if (!this.activeObjective) return

    let progress = 0
    switch (this.activeObjective.type) {
      case 'tile':
        progress = this.highestTile
        break
      case 'merges':
        progress = this.totalMerges
        break
      case 'score':
        progress = this.score
        break
    }

    this.objectiveProgress = progress

    if (progress >= this.activeObjective.target) {
      this.completeObjective()
    }
  }

  private completeObjective(): void {
    if (!this.activeObjective) return

    const reward = this.activeObjective.reward
    if (reward.type === 'undo') {
      this.undoCharges = Math.min(3, this.undoCharges + reward.amount)
    } else if (reward.type === 'remove') {
      this.removeTileCharges = Math.min(2, this.removeTileCharges + reward.amount)
    }

    this.effects.floatingText.spawn({ x: this.width / 2, y: this.height / 2, text: '目標達成!', color: '#4ade80', size: 20 })
    this.triggerScreenShake(6, 250)

    this.selectRandomObjective()
  }

  override stop(): void {
    this.unbindInputListeners()
    super.stop()
  }

  protected update(dt: number): void {
    if (!this.gameOver) {
      this.gameTime += dt
    }

    if (this.pendingGrid) {
      this.animElapsed += dt
      if (this.animElapsed >= ANIMATION_MS) {
        this.grid = this.pendingGrid
        this.pendingGrid = null
        this.animTiles = []
        this.animElapsed = 0

        if (!this.hasAnyMoves(this.grid)) {
          this.triggerGameOver()
        }
      }
    } else if (!this.gameOver) {
      const direction = this.moveQueue.shift()
      if (direction) {
        this.tryMove(direction)
      }

      this.checkObjectiveProgress()
    }

    this.pushStats()

    this.effects.update(dt)
    this.updateMergeEffects(dt)
  }

  private triggerScreenShake(intensity: number, duration: number) {
    this.effects.triggerShake(intensity, duration)
  }

  private spawnParticles(x: number, y: number, count: number, color: string, speedMult = 1) {
    this.effects.burst(x, y, count, [color], { min: 2 * speedMult, max: 8 * speedMult })
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string) {
    this.effects.spawnFloatingText(x, y, text, color)
  }

  private spawnMergeEffect(row: number, col: number, value: number) {
    this.mergeEffects.push({ row, col, value, timer: 300 })
  }

  private updateMergeEffects(dt: number) {
    for (let i = this.mergeEffects.length - 1; i >= 0; i--) {
      const e = this.mergeEffects[i]!
      e.timer -= dt
      if (e.timer <= 0) this.mergeEffects.splice(i, 1)
    }
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height)

    const bgGrad = ctx.createLinearGradient(0, 0, this.width, this.height)
    bgGrad.addColorStop(0, '#2d3748')
    bgGrad.addColorStop(0.5, '#1a202c')
    bgGrad.addColorStop(1, '#2d3748')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, this.width, this.height)

    const shake = this.effects.shake
    if (shake) {
      const decay = Math.max(0, 1 - shake.elapsed / shake.duration)
      const intensity = shake.intensity * decay
      ctx.translate((Math.random() - 0.5) * intensity * 2, (Math.random() - 0.5) * intensity * 2)
    }

    const layout = this.computeLayout()
    this.layoutCache = layout

    const { boardX, boardY, boardSize, gap, tileSize, radius } = layout

    const boardGrad = ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardSize)
    boardGrad.addColorStop(0, '#475569')
    boardGrad.addColorStop(1, '#334155')
    this.drawRoundedRect(ctx, boardX, boardY, boardSize, boardSize, radius)
    ctx.fillStyle = boardGrad
    ctx.fill()

    if (this.removeTileMode) {
      const pulse = (Math.sin(this.gameTime * 0.01) + 1) * 0.5
      ctx.lineWidth = Math.max(3 * this.dpr, boardSize * 0.012)
      ctx.strokeStyle = `rgba(237, 194, 46, ${0.35 + pulse * 0.55})`
      this.drawRoundedRect(
        ctx,
        boardX - ctx.lineWidth / 2,
        boardY - ctx.lineWidth / 2,
        boardSize + ctx.lineWidth,
        boardSize + ctx.lineWidth,
        radius,
      )
      ctx.stroke()
    }

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const x = boardX + gap + col * (tileSize + gap)
        const y = boardY + gap + row * (tileSize + gap)
        this.drawTileRect(ctx, x, y, tileSize, radius, '#cdc1b4')
      }
    }

    if (this.pendingGrid) {
      const progress = Math.min(1, this.animElapsed / ANIMATION_MS)
      for (const tile of this.animTiles) {
        const fromX = boardX + gap + tile.from.col * (tileSize + gap)
        const fromY = boardY + gap + tile.from.row * (tileSize + gap)
        const toX = boardX + gap + tile.to.col * (tileSize + gap)
        const toY = boardY + gap + tile.to.row * (tileSize + gap)
        const x = fromX + (toX - fromX) * progress
        const y = fromY + (toY - fromY) * progress
        this.drawNumberTile(ctx, x, y, tileSize, radius, tile.value)
      }
    } else {
      for (let row = 0; row < GRID_SIZE; row += 1) {
        for (let col = 0; col < GRID_SIZE; col += 1) {
          const value = this.grid[row]![col]!
          if (value === 0) {
            continue
          }
          const x = boardX + gap + col * (tileSize + gap)
          const y = boardY + gap + row * (tileSize + gap)
          this.drawNumberTile(ctx, x, y, tileSize, radius, value)
        }
      }
    }

    if (this.activeObjective) {
      this.renderObjectiveIndicator(ctx, layout)
    }

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(238, 228, 218, 0.72)'
      ctx.fillRect(boardX, boardY, boardSize, boardSize)
      ctx.fillStyle = '#776e65'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold ${Math.floor(24 * this.dpr)}px Arial`
      ctx.fillText('遊戲結束', boardX + boardSize / 2, boardY + boardSize / 2)
    }

    this.drawItemButton(
      ctx,
      layout.undoButton,
      '撤回',
      this.canUseUndo(),
      this.removeTileMode,
      this.undoCharges,
      'undo',
    )
    this.drawItemButton(
      ctx,
      layout.removeButton,
      '移除',
      this.canUseRemoveTile(),
      this.removeTileMode,
      this.removeTileCharges,
      'remove',
    )

    this.renderParticles(ctx)
    this.renderFloatingTexts(ctx)
    this.renderMergeEffects(ctx)

    if (this.screenShake) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.effects.particles.render(ctx)
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.effects.floatingText.render(ctx)
  }

  private renderMergeEffects(ctx: CanvasRenderingContext2D) {
    const layout = this.computeLayout()
    for (const e of this.mergeEffects) {
      const progress = 1 - e.timer / 300
      const scale = 1 + progress * 0.5
      const x = layout.boardX + e.col * (layout.tileSize + layout.gap) + layout.tileSize / 2
      const y = layout.boardY + e.row * (layout.tileSize + layout.gap) + layout.tileSize / 2
      ctx.globalAlpha = 1 - progress
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(x, y, layout.tileSize * 0.4 * scale, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  private createEmptyGrid(): number[][] {
    const next: number[][] = []
    for (let row = 0; row < GRID_SIZE; row += 1) {
      next.push([0, 0, 0, 0])
    }
    return next
  }

  private copyGrid(grid: number[][]): number[][] {
    return grid.map((row: number[]): number[] => [...row])
  }

  private bindInputListeners(): void {
    if (!this.keyBound) {
      window.addEventListener('keydown', this.handleKeyDown)
      this.keyBound = true
    }
    if (!this.touchBound) {
      this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false })
      this.canvas.addEventListener('touchend', this.handleTouchEnd, { passive: false })
      this.touchBound = true
    }
    if (!this.clickBound) {
      this.canvas.addEventListener('click', this.handleCanvasClick)
      this.clickBound = true
    }
  }

  private unbindInputListeners(): void {
    if (this.keyBound) {
      window.removeEventListener('keydown', this.handleKeyDown)
      this.keyBound = false
    }
    if (this.touchBound) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart)
      this.canvas.removeEventListener('touchend', this.handleTouchEnd)
      this.touchBound = false
    }
    if (this.clickBound) {
      this.canvas.removeEventListener('click', this.handleCanvasClick)
      this.clickBound = false
    }
    this.activeTouch = null
    this.moveQueue = []
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (this.gameOver || this.pendingGrid || this.removeTileMode || event.repeat) {
      return
    }

    const key = event.key.toLowerCase()
    const code = event.code

    let direction: Direction | null = null
    if (key === 'arrowleft' || key === 'a' || code === 'KeyA') {
      direction = 'left'
    } else if (key === 'arrowright' || key === 'd' || code === 'KeyD') {
      direction = 'right'
    } else if (key === 'arrowup' || key === 'w' || code === 'KeyW') {
      direction = 'up'
    } else if (key === 'arrowdown' || key === 's' || code === 'KeyS') {
      direction = 'down'
    }

    if (direction) {
      event.preventDefault()
      this.enqueueMove(direction)
    }
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.changedTouches.length === 0) {
      return
    }

    const touch = event.changedTouches[0]
    if (!touch) {
      return
    }

    this.activeTouch = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    }

    event.preventDefault()
  }

  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.activeTouch) {
      return
    }

    let touch: Touch | null = null
    for (let i = 0; i < event.changedTouches.length; i += 1) {
      const current = event.changedTouches[i]
      if (current && current.identifier === this.activeTouch.id) {
        touch = current
        break
      }
    }

    if (!touch) {
      return
    }

    const endPoint = this.clientToCanvasPoint(touch.clientX, touch.clientY)
    if (this.handleCanvasPointerAction(endPoint.x, endPoint.y)) {
      this.activeTouch = null
      event.preventDefault()
      return
    }

    if (this.gameOver || this.pendingGrid || this.removeTileMode) {
      this.activeTouch = null
      event.preventDefault()
      return
    }

    const dx = touch.clientX - this.activeTouch.x
    const dy = touch.clientY - this.activeTouch.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (Math.max(absDx, absDy) >= SWIPE_THRESHOLD) {
      if (absDx > absDy) {
        this.enqueueMove(dx > 0 ? 'right' : 'left')
      } else {
        this.enqueueMove(dy > 0 ? 'down' : 'up')
      }
    }

    this.activeTouch = null
    event.preventDefault()
  }

  private handleCanvasClick = (event: MouseEvent): void => {
    const point = this.clientToCanvasPoint(event.clientX, event.clientY)
    if (this.handleCanvasPointerAction(point.x, point.y)) {
      event.preventDefault()
    }
  }

  private enqueueMove(direction: Direction): void {
    this.moveQueue = [direction]
  }

  private tryMove(direction: Direction): void {
    const previousGridSnapshot = this.previousGrid ? this.previousGrid.map((r: number[]): number[] => [...r]) : null
    const previousScoreSnapshot = this.previousScore
    this.previousGrid = this.grid.map((r: number[]): number[] => [...r])
    this.previousScore = this.score

    const result = this.computeMove(this.grid, direction)
    if (!result.moved) {
      this.previousGrid = previousGridSnapshot
      this.previousScore = previousScoreSnapshot
      return
    }

    const oldHighestTile = this.highestTile
    this.score += result.scoreGain
    this.totalMerges += result.merges
    this.mergesThisLevel += result.merges
    this.highestTile = Math.max(this.highestTile, result.highestTile)

    if (result.merges > 0) {
      const layout = this.computeLayout()
      for (const anim of result.animations) {
        if (anim.from.col !== anim.to.col || anim.from.row !== anim.to.row) {
          const tx = layout.boardX + anim.to.col * (layout.tileSize + layout.gap) + layout.tileSize / 2
          const ty = layout.boardY + anim.to.row * (layout.tileSize + layout.gap) + layout.tileSize / 2
          this.spawnParticles(tx, ty, 12, '#fbbf24', 1.2)
          this.spawnMergeEffect(anim.to.row, anim.to.col, anim.value)
        }
      }
      if (result.merges >= 2) {
        this.triggerScreenShake(4, 150)
      }
      if (this.highestTile >= 2048 && this.highestTile > oldHighestTile) {
        this.effects.floatingText.spawn({ x: this.width / 2, y: this.height / 2, text: '2048!', color: '#fbbf24' })
      }
    }

    const nextLevel = this.computeLevel(this.highestTile)
    if (nextLevel !== this.level) {
      this.level = nextLevel
      this.mergesThisLevel = 0
    }

    const nextGrid = this.copyGrid(result.grid)
    this.spawnRandomTile(nextGrid)

    this.pendingGrid = nextGrid
    this.animTiles = result.animations
    this.animElapsed = 0

    this.callbacks.onScoreUpdate?.(this.score)
  }

  private canUseUndo(): boolean {
    return !this.gameOver && !this.pendingGrid && this.undoCharges > 0 && this.previousGrid !== null
  }

  private canUseRemoveTile(): boolean {
    return !this.gameOver && !this.pendingGrid && this.removeTileCharges > 0
  }

  private activateUndo(): void {
    if (!this.canUseUndo() || !this.previousGrid) {
      return
    }

    this.grid = this.previousGrid.map((r: number[]): number[] => [...r])
    this.score = this.previousScore
    this.previousGrid = null
    this.undoCharges -= 1
    this.removeTileMode = false
    this.pendingGrid = null
    this.animTiles = []
    this.animElapsed = 0
    this.moveQueue = []

    this.callbacks.onScoreUpdate?.(this.score)
  }

  private activateRemoveTile(): void {
    if (!this.canUseRemoveTile()) {
      return
    }
    this.removeTileMode = true
  }

  private handleRemoveTileClick(row: number, col: number): void {
    if (!this.removeTileMode || this.removeTileCharges <= 0 || this.pendingGrid || this.gameOver) {
      return
    }
    if (this.grid[row]![col] === 0) {
      return
    }

    this.grid[row]![col] = 0
    this.removeTileCharges -= 1
    this.removeTileMode = false
    this.moveQueue = []

    if (!this.hasAnyMoves(this.grid)) {
      this.triggerGameOver()
    }
  }

  private handleCanvasPointerAction(x: number, y: number): boolean {
    const layout = this.layoutCache ?? this.computeLayout()

    if (this.isPointInRect(x, y, layout.undoButton)) {
      this.activateUndo()
      return true
    }
    if (this.isPointInRect(x, y, layout.removeButton)) {
      this.activateRemoveTile()
      return true
    }

    if (this.removeTileMode) {
      const cell = this.getCellFromPoint(x, y, layout)
      if (cell) {
        this.handleRemoveTileClick(cell.row, cell.col)
      }
      return true
    }

    return false
  }

  private getCellFromPoint(x: number, y: number, layout: BoardLayout): CellPos | null {
    const { boardX, boardY, gap, tileSize } = layout
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const tileX = boardX + gap + col * (tileSize + gap)
        const tileY = boardY + gap + row * (tileSize + gap)
        if (x >= tileX && x <= tileX + tileSize && y >= tileY && y <= tileY + tileSize) {
          return { row, col }
        }
      }
    }
    return null
  }

  private isPointInRect(x: number, y: number, rect: Rect): boolean {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
  }

  private clientToCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
    const bounds = this.canvas.getBoundingClientRect()
    const scaleX = this.width / bounds.width
    const scaleY = this.height / bounds.height
    return {
      x: (clientX - bounds.left) * scaleX,
      y: (clientY - bounds.top) * scaleY,
    }
  }

  private computeLayout(): BoardLayout {
    const outerPadding = Math.max(16 * this.dpr, Math.min(this.width, this.height) * 0.02)
    const controlsGap = Math.max(12 * this.dpr, Math.min(this.width, this.height) * 0.018)
    const buttonHeight = Math.max(38 * this.dpr, Math.min(this.width, this.height) * 0.06)
    const buttonGap = Math.max(10 * this.dpr, Math.min(this.width, this.height) * 0.016)

    const boardMaxWidth = this.width - outerPadding * 2
    const boardMaxHeight = Math.max(72 * this.dpr, this.height - outerPadding * 2 - controlsGap - buttonHeight)
    const boardSize = Math.floor(Math.max(72 * this.dpr, Math.min(boardMaxWidth, boardMaxHeight)))

    const boardX = Math.floor((this.width - boardSize) / 2)
    const blockHeight = boardSize + controlsGap + buttonHeight
    const boardY = Math.max(outerPadding, Math.floor((this.height - blockHeight) / 2))
    const gap = Math.max(8 * this.dpr, boardSize * 0.02)
    const tileSize = (boardSize - gap * (GRID_SIZE + 1)) / GRID_SIZE
    const radius = Math.max(6 * this.dpr, tileSize * 0.1)

    const buttonY = boardY + boardSize + controlsGap
    const buttonWidth = (boardSize - buttonGap) / 2

    return {
      boardX,
      boardY,
      boardSize,
      gap,
      tileSize,
      radius,
      undoButton: {
        x: boardX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
      },
      removeButton: {
        x: boardX + buttonWidth + buttonGap,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
      },
    }
  }

  private drawItemButton(
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    text: string,
    enabled: boolean,
    removeTileMode: boolean,
    count: number,
    iconId: string,
  ): void {
    drawKawaiiButton(ctx, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      label: text,
      count,
      iconKind: canvasIconKindForItem(iconId),
      enabled,
      active: enabled && removeTileMode && text === '移除',
      fill: '#e8d5c3',
      activeFill: '#fde68a',
      disabledFill: '#d8cec1',
      textColor: enabled ? '#4a3426' : '#7a6c60',
    })
  }

  private renderObjectiveIndicator(ctx: CanvasRenderingContext2D, layout: BoardLayout): void {
    if (!this.activeObjective) return

    const width = Math.max(200, Math.floor(layout.boardSize * 0.85))
    const height = Math.max(44, Math.floor(layout.boardSize * 0.12))
    const x = layout.boardX + (layout.boardSize - width) / 2
    const y = Math.max(8 * this.dpr, layout.boardY - height - Math.max(12 * this.dpr, layout.boardSize * 0.03))

    const progress = Math.min(1, this.objectiveProgress / this.activeObjective.target)

    ctx.save()
    drawKawaiiPanel(ctx, x, y, width, height, {
      fill: '#fff2e5',
      accent: '#f6c453',
      radius: Math.max(8 * this.dpr, height * 0.15),
    })

    drawKawaiiInlineLabel(ctx, {
      x: x + Math.floor(height * 0.25),
      y: y + Math.floor(height * 0.34),
      text: this.activeObjective.name,
      iconKind: canvasIconKindForItem(this.activeObjective.icon),
      color: '#5f4b3f',
      fontSize: Math.floor(height * 0.32),
      align: 'left',
    })

    const barX = x + Math.floor(height * 0.25)
    const barY = y + height - Math.floor(height * 0.35)
    const barWidth = width - Math.floor(height * 0.5)
    const barHeight = Math.max(6 * this.dpr, Math.floor(height * 0.18))

    drawKawaiiProgressBar(ctx, barX, barY, barWidth, barHeight, progress, {
      trackFill: 'rgba(95, 75, 63, 0.12)',
      fill: '#4ade80',
      stroke: 'rgba(95, 75, 63, 0.25)',
    })

    ctx.fillStyle = '#f2ece4'
    ctx.font = `${Math.floor(height * 0.28)}px Arial`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${this.objectiveProgress}/${this.activeObjective.target}`, barX + barWidth, barY - Math.floor(height * 0.05))

    ctx.restore()
  }

  private computeMove(grid: number[][], direction: Direction): MoveResult {
    const nextGrid = this.createEmptyGrid()
    let moved = false
    let scoreGain = 0
    let merges = 0
    let highestTile = this.highestTile
    const animations: AnimatedTile[] = []

    for (let line = 0; line < GRID_SIZE; line += 1) {
      const positions = this.getLinePositions(direction, line)
      const currentValues = positions.map((pos: CellPos): number => grid[pos.row]![pos.col]!)

      const mergedFlags = [false, false, false, false]
      const lineResult = [0, 0, 0, 0]
      let target = 0

      for (let i = 0; i < currentValues.length; i += 1) {
        const value = currentValues[i]!
        if (value === 0) {
          continue
        }

        if (target > 0 && lineResult[target - 1] === value && !mergedFlags[target - 1]) {
          lineResult[target - 1] = value * 2
          mergedFlags[target - 1] = true
          const to = positions[target - 1]!
          const from = positions[i]!
          animations.push({ from, to, value })
          scoreGain += value * 2
          merges += 1
          highestTile = Math.max(highestTile, value * 2)
        } else {
          lineResult[target] = value
          const to = positions[target]!
          const from = positions[i]!
          animations.push({ from, to, value })
          target += 1
        }
      }

      for (let i = 0; i < positions.length; i += 1) {
        const pos = positions[i]!
        const oldValue = currentValues[i]!
        const newValue = lineResult[i]!
        nextGrid[pos.row]![pos.col] = newValue
        if (oldValue !== newValue) {
          moved = true
        }
      }
    }

    return {
      grid: nextGrid,
      moved,
      scoreGain,
      merges,
      highestTile,
      animations,
    }
  }

  private getLinePositions(direction: Direction, line: number): CellPos[] {
    if (direction === 'left') {
      return [
        { row: line, col: 0 },
        { row: line, col: 1 },
        { row: line, col: 2 },
        { row: line, col: 3 },
      ]
    }
    if (direction === 'right') {
      return [
        { row: line, col: 3 },
        { row: line, col: 2 },
        { row: line, col: 1 },
        { row: line, col: 0 },
      ]
    }
    if (direction === 'up') {
      return [
        { row: 0, col: line },
        { row: 1, col: line },
        { row: 2, col: line },
        { row: 3, col: line },
      ]
    }
    return [
      { row: 3, col: line },
      { row: 2, col: line },
      { row: 1, col: line },
      { row: 0, col: line },
    ]
  }

  private spawnRandomTile(grid: number[][]): void {
    const empties: CellPos[] = []

    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (grid[row]![col] === 0) {
          empties.push({ row, col })
        }
      }
    }

    if (empties.length === 0) {
      return
    }

    const target = empties[Math.floor(Math.random() * empties.length)]
    if (!target) {
      return
    }

    grid[target.row]![target.col] = Math.random() < 0.9 ? 2 : 4
    this.updateHighestTile(grid)
  }

  private updateHighestTile(grid: number[][]): void {
    let highest = this.highestTile
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        highest = Math.max(highest, grid[row]![col]!)
      }
    }
    this.highestTile = highest
  }

  private hasAnyMoves(grid: number[][]): boolean {
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const value = grid[row]![col]!
        if (value === 0) {
          return true
        }
        if (col + 1 < GRID_SIZE && grid[row]![col + 1] === value) {
          return true
        }
        if (row + 1 < GRID_SIZE && grid[row + 1]![col] === value) {
          return true
        }
      }
    }
    return false
  }

  private triggerGameOver(): void {
    if (this.gameOver) {
      return
    }
    this.gameOver = true
    if (!this.gameOverNotified) {
      this.gameOverNotified = true
      this.callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'game2048',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.totalMerges,
          time: Math.floor(this.gameTime / 1000),
          level: this.level,
          coins: 0,
        },
      })
      this.callbacks.onGameOver?.(this.score)
      this.triggerScreenShake(8, 300)
      this.effects.floatingText.spawn({ x: this.width / 2, y: this.height / 2, text: 'GAME OVER', color: '#776e65' })
    }
  }

  private countEmptyCells(): number {
    let count = 0
    for (let row = 0; row < GRID_SIZE; row += 1) {
      for (let col = 0; col < GRID_SIZE; col += 1) {
        if (this.grid[row]![col] === 0) {
          count += 1
        }
      }
    }
    return count
  }

  private computeLevel(highestTile: number): number {
    return Math.max(0, Math.floor(Math.log2(Math.max(2, highestTile))) - 1)
  }

  private buildStats(): PlayerStats {
    return {
      hp: this.countEmptyCells(),
      maxHp: CELL_COUNT,
      level: this.level,
      xp: this.mergesThisLevel,
      xpToNext: 10,
      kills: this.totalMerges,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
  }

  private pushStats(): void {
    const stats: PlayerStats = this.buildStats()
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const stats = this.buildStats()
    const itemSlots: GameHudData['itemSlots'] = []
    if (this.undoCharges > 0) {
      itemSlots.push({
        id: 'undo',
        name: '撤回',
        icon: 'undo',
        count: this.undoCharges,
        cooldownMs: 0,
        cooldownTotalMs: 0,
      })
    }
    if (this.removeTileCharges > 0) {
      itemSlots.push({
        id: 'remove_tile',
        name: '消除方塊',
        icon: 'remove',
        count: this.removeTileCharges,
        cooldownMs: 0,
        cooldownTotalMs: 0,
      })
    }

    const hudData: GameHudData = {
      ...stats,
      activeBuffs: [],
      itemSlots,
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private drawNumberTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    radius: number,
    value: number,
  ): void {
    const color = TILE_COLORS[value] ?? '#3c3a32'
    const variant = value in TILE_COLORS ? String(value) : 'max'
    this.drawTileRect(ctx, x, y, size, radius, color, variant)

    const text = String(value)
    const fontSize = this.getTileFontSize(value, size)
    ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `bold ${fontSize}px Arial`
    ctx.fillText(text, x + size / 2, y + size / 2)
  }

  private getTileFontSize(value: number, size: number): number {
    if (value < 100) return Math.floor(size * 0.5)
    if (value < 1000) return Math.floor(size * 0.42)
    return Math.floor(size * 0.33)
  }

  private drawTileRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    radius: number,
    fill: string,
    variant: string = 'empty',
  ): void {
    // Try Kenney sprite first (uses ui-pack square buttons)
    const numVal = parseInt(variant, 10)
    if (!isNaN(numVal) && numVal > 0) {
      const kenneyId = `2048.tile-${numVal}`
      const drawn = drawKenneySprite(ctx, kenneyId, {
        x,
        y,
        scaleX: width / 32,
        scaleY: width / 32,
      })
      if (drawn) return
    }

    const drawn = drawSprite(ctx, '2048.tile', {
      x,
      y,
      scale: width / 96,
      variant,
    })
    if (!drawn) {
      drawTileBackground(ctx, x, y, width, parseInt(variant, 10) || 0, fill)
    }
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ): void {
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

  getBoardState(): string {
    const lines: string[] = []
    lines.push('=== 2048 BOARD STATE ===')
    lines.push(`Score: ${this.score} | Level: ${this.level} | Merges: ${this.totalMerges}`)
    lines.push(`Highest Tile: ${this.highestTile}`)
    
    if (this.activeObjective) {
      lines.push(`Objective: ${this.activeObjective.name} (${this.objectiveProgress}/${this.activeObjective.target})`)
    }
    
    lines.push(`Undo: ${this.undoCharges} | Remove: ${this.removeTileCharges}`)
    lines.push('')
    
    for (let row = 0; row < GRID_SIZE; row++) {
      const cells = []
      for (let col = 0; col < GRID_SIZE; col++) {
        const value = this.grid[row]![col]!
        if (value === 0) {
          cells.push('    ·')
        } else {
          cells.push(String(value).padStart(5, ' '))
        }
      }
      lines.push(cells.join(' '))
    }
    
    if (this.gameOver) {
      lines.push('')
      lines.push('GAME OVER')
    }
    
    return lines.join('\n')
  }
}

export function create2048Game(): GameInstance {
  return new Game2048()
}
