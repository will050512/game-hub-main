import { GameEngine } from '@/engine/GameEngine'
import { EffectsManager } from '@/engine/effects'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKenneySprite, preloadKenneySprites } from '@/engine/sprites/kenneySpriteLoader'
import { getTheme } from '@/engine/art/KawaiiTheme'
import { REWARD_EVENT_SCHEMA_VERSION, createRewardPayload, type GameInstance, type GameHudData } from '@/types'
import { MISSION_DEFS, SPECIAL_ROW_DEFS, type MissionDef, type SpecialRowDef } from './data'
import {
  canvasIconKindForItem,
  drawKawaiiButton,
  drawKawaiiInlineLabel,
  drawKawaiiPanel,
  drawKawaiiProgressBar,
} from '@/engine/kawaiiCanvas'

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'
type Matrix = number[][]
type BoardCell = TetrominoType | null

interface TetrominoDef {
  color: string
  shape: Matrix
}

interface ActivePiece {
  type: TetrominoType
  color: string
  matrix: Matrix
  x: number
  y: number
}

interface TouchTrack {
  id: number
  startX: number
  startY: number
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

interface LineClearEffect {
  y: number
  alpha: number
  timer: number
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: { color: '#06b6d4', shape: [[1, 1, 1, 1]] },
  O: {
    color: '#eab308',
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    color: '#8b5cf6',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  S: {
    color: '#10b981',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
  },
  Z: {
    color: '#ef4444',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
  },
  J: {
    color: '#3b82f6',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  L: {
    color: '#f97316',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
  },
}

const PIECE_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

class TetrisGame extends GameEngine {
  private board: BoardCell[][] = []
  private currentPiece: ActivePiece | null = null
  private nextPieces: ActivePiece[] = []
  private bag: TetrominoType[] = []

  private score = 0
  private level = 1
  private linesCleared = 0
  private totalLinesCleared = 0
  private gameTime = 0

  private bombRowCharges = 0
  private previewPlusCharges = 0
  private previewPlusActive = false
  private previewPlusTimer = 0

  private activeMission: MissionDef | null = null
  private missionProgress = 0
  private tetrisCount = 0
  private missionStartScore = 0
  private missionStartTime = 0
  private specialRows: Set<number> = new Set()
  private specialRowType: SpecialRowDef | null = null

  private fallTimer = 0
  private softDropActive = false
  private gameOver = false

  private keyboardBound = false
  private touchBound = false
  private activeTouch: TouchTrack | null = null

  private theme = getTheme('tetris')
  private effects: EffectsManager = new EffectsManager()
  private lineClearEffects: LineClearEffect[] = []
  private comboCount = 0
  private comboTimer = 0
  private idlePhase = 0

  // Aliases for compatibility with older code patterns
  private get screenShake() { return this.effects.shake }
  private get particles() { return this.effects.particles }
  private get floatingTexts() { return this.effects.floatingText }

  protected init(): void {
    void preloadGameSprites('tetris')
    void preloadKenneySprites('tetris')
    this.board = this.createEmptyBoard()
    this.bag = []
    this.nextPieces = []
    this.score = 0
    this.level = 1
    this.linesCleared = 0
    this.totalLinesCleared = 0
    this.gameTime = 0
    this.fallTimer = 0
    this.softDropActive = false
    this.gameOver = false
    this.bombRowCharges = 0
    this.previewPlusCharges = 0
    this.previewPlusActive = false
    this.previewPlusTimer = 0

    this.activeMission = null
    this.missionProgress = 0
    this.tetrisCount = 0
    this.missionStartScore = 0
    this.missionStartTime = 0
    this.specialRows = new Set()
    this.specialRowType = null

    this.effects = new EffectsManager()
    this.lineClearEffects = []
    this.comboCount = 0
    this.comboTimer = 0

    this.refillNextPiecesQueue()
    this.spawnPiece()

    this.selectRandomMission()
    this.maybeSpawnSpecialRow()

    this.callbacks.onScoreUpdate?.(this.score)
    this.bindInputListeners()
  }

  private selectRandomMission(): void {
    const missions = MISSION_DEFS.filter((m) => {
      if (m.type === 'score') return m.target > this.score
      if (m.type === 'survival') return m.target > Math.floor(this.gameTime / 1000)
      return true
    })
    if (missions.length === 0) return
    this.activeMission = missions[Math.floor(Math.random() * missions.length)] ?? null
    this.missionProgress = 0
    this.missionStartScore = this.score
    this.missionStartTime = this.gameTime
  }

  private maybeSpawnSpecialRow(): void {
    if (Math.random() < 0.2) {
      const emptyRows = []
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        const row = this.board[y]!
        if (row.every((cell) => cell === null)) {
          emptyRows.push(y)
        }
      }
      if (emptyRows.length > 0) {
        const row = emptyRows[Math.floor(Math.random() * emptyRows.length)]!
        this.specialRows.add(row)
        this.specialRowType = SPECIAL_ROW_DEFS.golden ?? null
      }
    }
  }

  private checkMissionProgress(): void {
    if (!this.activeMission) return

    let progress = 0
    switch (this.activeMission.type) {
      case 'lines':
        progress = this.linesCleared
        break
      case 'tetrises':
        progress = this.tetrisCount
        break
      case 'score':
        progress = this.score
        break
      case 'survival':
        progress = Math.floor(this.gameTime / 1000)
        break
    }

    this.missionProgress = progress

    if (progress >= this.activeMission.target) {
      this.completeMission()
    }
  }

  private completeMission(): void {
    if (!this.activeMission) return

    const reward = this.activeMission.reward
    if (reward.type === 'bomb') {
      this.bombRowCharges = Math.min(3, this.bombRowCharges + reward.amount)
    } else if (reward.type === 'preview') {
      this.previewPlusCharges = Math.min(2, this.previewPlusCharges + reward.amount)
    }

    this.spawnFloatingText(this.width / 2, this.height / 2, '任務完成!', '#4ade80', 1.2)
    this.triggerScreenShake(6, 250)

    this.selectRandomMission()
  }

  override stop(): void {
    super.stop()
    this.unbindInputListeners()
  }

  protected update(dt: number): void {
    this.gameTime += dt

    if (this.previewPlusActive) {
      this.previewPlusTimer = Math.max(0, this.previewPlusTimer - dt)
      if (this.previewPlusTimer <= 0) {
        this.previewPlusActive = false
      }
    }

    if (!this.gameOver) {
      const fallInterval = this.getFallInterval()
      const activeInterval = this.softDropActive ? Math.max(10, fallInterval / 10) : fallInterval
      this.fallTimer += dt

      while (this.fallTimer >= activeInterval) {
        this.fallTimer -= activeInterval
        if (!this.tryMove(0, 1)) {
          this.lockPiece()
          break
        }
      }

      this.checkMissionProgress()
    }

    this.callbacks.onStatsUpdate?.({
      hp: 0,
      maxHp: 0,
      level: this.level,
      xp: this.linesCleared % 10,
      xpToNext: 10,
      kills: this.linesCleared,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    })
    this.pushHud()

    this.updateParticles(dt)
    this.updateLineClearEffects(dt)
    this.updateFloatingTexts(dt)
    this.updateScreenShake(dt)

    if (this.comboTimer > 0) {
      this.comboTimer -= dt
      if (this.comboTimer <= 0) {
        this.comboCount = 0
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

  private updateParticles(dt: number) {
    this.effects.particles.update(dt)
  }

  private updateLineClearEffects(dt: number) {
    for (let i = this.lineClearEffects.length - 1; i >= 0; i--) {
      const e = this.lineClearEffects[i]!
      e.timer -= dt
      e.alpha = Math.max(0, e.timer / 300)
      if (e.timer <= 0) {
        this.lineClearEffects.splice(i, 1)
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    this.effects.floatingText.update(dt)
  }

  private updateScreenShake(dt: number) {
    this.effects.shake.update(dt)
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    const cellSize = Math.max(8, Math.floor(Math.min(this.width / 14, this.height / 22)))
    const boardPixelWidth = BOARD_WIDTH * cellSize
    const boardPixelHeight = BOARD_HEIGHT * cellSize
    const boardX = Math.floor((this.width - boardPixelWidth) / 2)
    const boardY = Math.floor((this.height - boardPixelHeight) / 2)

    ctx.clearRect(0, 0, this.width, this.height)
    ctx.fillStyle = this.theme.palette.bg
    ctx.fillRect(0, 0, this.width, this.height)

    if (this.effects.shake.isActive) {
      this.effects.shake.apply(ctx)
    }

    const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height)
    bgGradient.addColorStop(0, 'rgba(255,255,255,0.04)')
    bgGradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, this.width, this.height)

    ctx.fillStyle = this.theme.palette.bgAlt
    ctx.fillRect(boardX, boardY, boardPixelWidth, boardPixelHeight)

    this.renderGrid(ctx, boardX, boardY, cellSize)
    this.renderBoardBlocks(ctx, boardX, boardY, cellSize)
    this.renderGhostPiece(ctx, boardX, boardY, cellSize)
    this.renderCurrentPiece(ctx, boardX, boardY, cellSize)
    this.renderPanels(ctx, boardX, boardY, cellSize, boardPixelWidth)

    if (this.gameOver) {
      ctx.fillStyle = this.theme.ui.surface
      ctx.fillRect(boardX, boardY, boardPixelWidth, boardPixelHeight)
      ctx.fillStyle = this.theme.palette.highlight
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `bold ${Math.max(18, Math.floor(cellSize * 0.9))}px ${this.theme.font.family}`
      ctx.fillText('遊戲結束', boardX + boardPixelWidth / 2, boardY + boardPixelHeight / 2 - cellSize * 0.6)
      ctx.font = `${Math.max(12, Math.floor(cellSize * 0.5))}px ${this.theme.font.family}`
      ctx.fillText('按 R 重新開始', boardX + boardPixelWidth / 2, boardY + boardPixelHeight / 2 + cellSize * 0.5)
    }

    this.renderParticles(ctx)
    this.renderFloatingTexts(ctx)
    this.renderLineClearEffects(ctx, boardX, boardY, cellSize)

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

  private renderLineClearEffects(ctx: CanvasRenderingContext2D, boardX: number, boardY: number, cellSize: number) {
    const boardWidth = BOARD_WIDTH * cellSize
    for (const e of this.lineClearEffects) {
      const rowY = boardY + e.y * cellSize
      const rowCenterX = boardX + boardWidth / 2
      const rowCenterY = rowY + cellSize / 2

      const kenneyDrew = drawKenneySprite(ctx, 'tetris.line-clear', {
        x: rowCenterX,
        y: rowCenterY,
        scaleX: boardWidth / 16,
        scaleY: cellSize / 16,
        alpha: e.alpha,
      })

      if (!kenneyDrew) {
        ctx.globalAlpha = e.alpha
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(boardX, rowY, boardWidth, cellSize)
      }
    }
    ctx.globalAlpha = 1
  }

  private pushHud(): void {
    const itemSlots: GameHudData['itemSlots'] = []
    if (this.bombRowCharges > 0) {
      itemSlots.push({
        id: 'bomb_row',
        name: '炸彈行',
        icon: 'bomb',
        count: this.bombRowCharges,
        cooldownMs: 0,
        cooldownTotalMs: 0,
      })
    }
    if (this.previewPlusCharges > 0) {
      itemSlots.push({
        id: 'preview_plus',
        name: '預覽+',
        icon: 'preview',
        count: this.previewPlusCharges,
        cooldownMs: 0,
        cooldownTotalMs: 0,
      })
    }

    const hudData: GameHudData = {
      hp: 0,
      maxHp: 0,
      level: this.level,
      xp: this.linesCleared % 10,
      xpToNext: 10,
      kills: this.linesCleared,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: [],
      itemSlots,
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private createEmptyBoard(): BoardCell[][] {
    const rows: BoardCell[][] = []
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      const row: BoardCell[] = []
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        row.push(null)
      }
      rows.push(row)
    }
    return rows
  }

  private refillBag(): void {
    this.bag = [...PIECE_TYPES]
    for (let i = this.bag.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = this.bag[i]!
      this.bag[i] = this.bag[j]!
      this.bag[j] = temp
    }
  }

  private drawFromBag(): TetrominoType {
    if (this.bag.length === 0) {
      this.refillBag()
    }
    return this.bag.pop() ?? 'I'
  }

  private createQueuedPiece(type: TetrominoType): ActivePiece {
    const definition = TETROMINOES[type]
    return {
      type,
      color: definition.color,
      matrix: this.cloneMatrix(definition.shape),
      x: 0,
      y: 0,
    }
  }

  private refillNextPiecesQueue(): void {
    while (this.nextPieces.length < 3) {
      const type = this.drawFromBag()
      this.nextPieces.push(this.createQueuedPiece(type))
    }
  }

  private spawnPiece(): void {
    this.refillNextPiecesQueue()
    const queuedPiece = this.nextPieces.shift()
    if (!queuedPiece) {
      return
    }
    this.refillNextPiecesQueue()

    const matrix = this.cloneMatrix(queuedPiece.matrix)
    const matrixWidth = matrix[0]?.length ?? 0
    const x = Math.floor((BOARD_WIDTH - matrixWidth) / 2)
    const y = -this.findTopFilledRow(matrix)

    const candidate: ActivePiece = {
      type: queuedPiece.type,
      color: queuedPiece.color,
      matrix,
      x,
      y,
    }

    if (this.hasCollision(candidate.matrix, candidate.x, candidate.y)) {
      this.currentPiece = null
      this.gameOver = true
      this.callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'tetris',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.linesCleared,
          time: Math.floor(this.gameTime / 1000),
          level: this.level,
          coins: 0,
        },
      })
      this.callbacks.onGameOver?.(this.score)
      this.triggerScreenShake(10, 400)
      this.spawnFloatingText(this.width / 2, this.height / 2, 'GAME OVER', '#ff4757', 1.2)
      return
    }

    this.currentPiece = candidate
  }

  private findTopFilledRow(matrix: Matrix): number {
    for (let y = 0; y < matrix.length; y += 1) {
      const row = matrix[y]!
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] === 1) {
          return y
        }
      }
    }
    return 0
  }

  private tryMove(dx: number, dy: number): boolean {
    if (!this.currentPiece || this.gameOver) {
      return false
    }
    const nextX = this.currentPiece.x + dx
    const nextY = this.currentPiece.y + dy
    if (this.hasCollision(this.currentPiece.matrix, nextX, nextY)) {
      return false
    }
    this.currentPiece.x = nextX
    this.currentPiece.y = nextY
    return true
  }

  private rotateCurrentPiece(): void {
    if (!this.currentPiece || this.gameOver) {
      return
    }
    const rotated = this.rotateMatrixClockwise(this.currentPiece.matrix)
    const kicks: [number, number][] = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [-2, 0],
      [2, 0],
      [0, -1],
      [0, -2],
      [-1, -1],
      [1, -1],
    ]
    for (const [dx, dy] of kicks) {
      const testX = this.currentPiece.x + dx
      const testY = this.currentPiece.y + dy
      if (!this.hasCollision(rotated, testX, testY)) {
        this.currentPiece.matrix = rotated
        this.currentPiece.x = testX
        this.currentPiece.y = testY
        return
      }
    }
  }

  private hardDrop(): void {
    if (!this.currentPiece || this.gameOver) {
      return
    }
    while (this.tryMove(0, 1)) {
      continue
    }
    this.lockPiece()
  }

  private activateBombRow(): void {
    if (this.gameOver || this.bombRowCharges <= 0) {
      return
    }
    this.bombRowCharges -= 1
    this.board.splice(BOARD_HEIGHT - 1, 1)
    const emptyRow: BoardCell[] = []
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      emptyRow.push(null)
    }
    this.board.unshift(emptyRow)

    const points = this.getLineClearPoints(1) * this.level
    this.applyLineClearMilestones(1)
    this.linesCleared += 1
    this.level = Math.floor(this.linesCleared / 10) + 1
    this.score += points
    this.callbacks.onScoreUpdate?.(this.score)
  }

  private activatePreviewPlus(): void {
    if (this.gameOver || this.previewPlusCharges <= 0) {
      return
    }
    this.previewPlusCharges -= 1
    this.previewPlusActive = true
    this.previewPlusTimer = 60_000
  }

  private lockPiece(): void {
    if (!this.currentPiece) {
      return
    }

    for (let y = 0; y < this.currentPiece.matrix.length; y += 1) {
      const row = this.currentPiece.matrix[y]!
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] !== 1) {
          continue
        }
        const boardX = this.currentPiece.x + x
        const boardY = this.currentPiece.y + y
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          this.board[boardY]![boardX] = this.currentPiece.type
        }
      }
    }

    const cleared = this.clearCompleteLines()
    if (cleared > 0) {
      if (cleared >= 4) {
        this.tetrisCount += 1
      }

      const points = this.getLineClearPoints(cleared) * this.level
      this.score += points
      this.linesCleared += cleared
      this.level = Math.floor(this.linesCleared / 10) + 1
      this.callbacks.onScoreUpdate?.(this.score)

      this.comboCount += cleared
      this.comboTimer = 2000

      const cellSize = Math.min(30, Math.floor(this.width / 15))
      const boardPixelWidth = BOARD_WIDTH * cellSize
      const boardPixelHeight = BOARD_HEIGHT * cellSize
      const boardX = Math.floor((this.width - boardPixelWidth) / 2)
      const boardY = Math.floor((this.height - boardPixelHeight) / 2)

      for (let i = 0; i < cleared; i += 1) {
        const rowY = (BOARD_HEIGHT - 1 - i) * cellSize + boardY + cellSize / 2
        this.lineClearEffects.push({ y: BOARD_HEIGHT - 1 - i, alpha: 1, timer: 300 })
        this.spawnParticles(boardX + boardPixelWidth / 2, rowY, 20, '#ffffff', 1.5)
      }

      if (cleared >= 4) {
        this.triggerScreenShake(8, 300)
        this.spawnFloatingText(this.width / 2, this.height / 2, 'tetris!', '#ffd700', 1.5)
      } else if (cleared >= 2) {
        this.triggerScreenShake(4, 200)
      }

      const scoreText = `+${points}`
      let comboLabel = ''
      if (cleared >= 4) {
        comboLabel = 'TETRIS!'
      } else if (cleared >= 3) {
        comboLabel = `${cleared}x COMBO!`
      } else if (cleared >= 2) {
        comboLabel = `${cleared}x`
      }
      const textColor = cleared >= 4 ? '#ffd700' : cleared >= 2 ? '#ff6b6b' : '#4ecdc4'
      this.spawnFloatingText(this.width / 2, this.height / 2 - 40, comboLabel || scoreText, textColor, 1)

      this.maybeSpawnSpecialRow()
    }

    this.fallTimer = 0
    this.spawnPiece()
  }

  private applyLineClearMilestones(lineCount: number): void {
    for (let i = 0; i < lineCount; i += 1) {
      this.totalLinesCleared += 1
      if (this.totalLinesCleared % 20 === 0 && this.bombRowCharges < 3) {
        this.bombRowCharges += 1
      }
      if (this.totalLinesCleared % 15 === 0 && this.previewPlusCharges < 2) {
        this.previewPlusCharges += 1
      }
    }
  }

  private clearCompleteLines(): number {
    let cleared = 0
    let specialRowCleared = false
    for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
      const row = this.board[y]!
      const complete = row.every((cell: BoardCell) => cell !== null)
      if (!complete) {
        continue
      }
      if (this.specialRows.has(y)) {
        specialRowCleared = true
        this.specialRows.delete(y)
      }
      this.board.splice(y, 1)
      const emptyRow: BoardCell[] = []
      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        emptyRow.push(null)
      }
      this.board.unshift(emptyRow)
      cleared += 1
      this.applyLineClearMilestones(1)
      y += 1

      const updatedSpecialRows = new Set<number>()
      for (const row of this.specialRows) {
        updatedSpecialRows.add(row + 1)
      }
      this.specialRows = updatedSpecialRows
    }

    if (specialRowCleared && this.specialRowType) {
      const bonusPoints = this.getLineClearPoints(cleared) * this.level * (this.specialRowType.scoreMultiplier - 1)
      this.score += bonusPoints
      this.spawnFloatingText(this.width / 2, this.height / 2 + 40, `+${bonusPoints} 黃金!`, this.specialRowType.color, 1.2)
      this.specialRowType = null
    }

    return cleared
  }

  private getLineClearPoints(lineCount: number): number {
    if (lineCount === 1) return 100
    if (lineCount === 2) return 300
    if (lineCount === 3) return 500
    if (lineCount >= 4) return 800
    return 0
  }

  private getFallInterval(): number {
    // Exponential difficulty: drops faster as levels increase
    // Base 920ms, decays by 8% per level, minimum 100ms
    return Math.max(100, 920 * Math.pow(0.92, this.level - 1))
  }

  private hasCollision(matrix: Matrix, offsetX: number, offsetY: number): boolean {
    for (let y = 0; y < matrix.length; y += 1) {
      const row = matrix[y]!
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] !== 1) {
          continue
        }

        const boardX = offsetX + x
        const boardY = offsetY + y

        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return true
        }
        if (boardY >= 0 && this.board[boardY]![boardX] !== null) {
          return true
        }
      }
    }
    return false
  }

  private rotateMatrixClockwise(matrix: Matrix): Matrix {
    const height = matrix.length
    const width = matrix[0]?.length ?? 0
    const rotated: Matrix = []

    for (let x = 0; x < width; x += 1) {
      const row: number[] = []
      for (let y = height - 1; y >= 0; y -= 1) {
        row.push(matrix[y]![x]!)
      }
      rotated.push(row)
    }

    return rotated
  }

  private cloneMatrix(matrix: Matrix): Matrix {
    return matrix.map((row: number[]): number[] => [...row])
  }

  private computeGhostY(): number | null {
    if (!this.currentPiece) {
      return null
    }
    let ghostY = this.currentPiece.y
    while (!this.hasCollision(this.currentPiece.matrix, this.currentPiece.x, ghostY + 1)) {
      ghostY += 1
    }
    return ghostY
  }

  private renderGrid(ctx: CanvasRenderingContext2D, boardX: number, boardY: number, cellSize: number): void {
    const hasGridSprite = drawKenneySprite(ctx, 'tetris.grid-bg', {
      x: boardX + cellSize / 2,
      y: boardY + cellSize / 2,
      scaleX: cellSize / 32,
      scaleY: cellSize / 32,
      alpha: 0.3,
    })

    if (hasGridSprite) {
      for (let y = 0; y < BOARD_HEIGHT; y += 1) {
        for (let x = 0; x < BOARD_WIDTH; x += 1) {
          drawKenneySprite(ctx, 'tetris.grid-bg', {
            x: boardX + x * cellSize + cellSize / 2,
            y: boardY + y * cellSize + cellSize / 2,
            scaleX: cellSize / 32,
            scaleY: cellSize / 32,
            alpha: 0.3,
          })
        }
      }
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1

      for (let x = 0; x <= BOARD_WIDTH; x += 1) {
        ctx.beginPath()
        ctx.moveTo(boardX + x * cellSize + 0.5, boardY + 0.5)
        ctx.lineTo(boardX + x * cellSize + 0.5, boardY + BOARD_HEIGHT * cellSize + 0.5)
        ctx.stroke()
      }
      for (let y = 0; y <= BOARD_HEIGHT; y += 1) {
        ctx.beginPath()
        ctx.moveTo(boardX + 0.5, boardY + y * cellSize + 0.5)
        ctx.lineTo(boardX + BOARD_WIDTH * cellSize + 0.5, boardY + y * cellSize + 0.5)
        ctx.stroke()
      }
    }
  }

  private renderBoardBlocks(ctx: CanvasRenderingContext2D, boardX: number, boardY: number, cellSize: number): void {
    for (let y = 0; y < BOARD_HEIGHT; y += 1) {
      const isSpecialRow = this.specialRows.has(y) && this.specialRowType
      if (isSpecialRow && this.specialRowType) {
        ctx.globalAlpha = 0.2 + (Math.sin(this.gameTime * 0.005) + 1) * 0.15
        ctx.fillStyle = this.specialRowType.color
        ctx.fillRect(boardX, boardY + y * cellSize, BOARD_WIDTH * cellSize, cellSize)
        ctx.globalAlpha = 1
      }

      for (let x = 0; x < BOARD_WIDTH; x += 1) {
        const cellType = this.board[y]![x]
        if (!cellType) {
          continue
        }
        let color = TETROMINOES[cellType].color
        if (isSpecialRow && this.specialRowType) {
          color = this.blendColors(color, this.specialRowType.color, 0.4)
        }
        this.drawBlock(ctx, boardX + x * cellSize, boardY + y * cellSize, cellSize, color, 1, cellType)
      }
    }
  }

  private blendColors(color1: string, color2: string, ratio: number): string {
    const c1 = this.hexToRgb(color1)
    const c2 = this.hexToRgb(color2)
    const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio)
    const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio)
    const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio)
    return `rgb(${r},${g},${b})`
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const cleaned = hex.replace('#', '')
    const num = Number.parseInt(cleaned, 16)
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    }
  }

  private renderGhostPiece(ctx: CanvasRenderingContext2D, boardX: number, boardY: number, cellSize: number): void {
    if (!this.currentPiece) {
      return
    }
    const ghostY = this.computeGhostY()
    if (ghostY === null || ghostY === this.currentPiece.y) {
      return
    }

    for (let y = 0; y < this.currentPiece.matrix.length; y += 1) {
      const row = this.currentPiece.matrix[y]!
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] !== 1) {
          continue
        }
        const px = this.currentPiece.x + x
        const py = ghostY + y
        if (py < 0) {
          continue
        }
        this.drawBlock(
          ctx,
          boardX + px * cellSize,
          boardY + py * cellSize,
          cellSize,
          this.currentPiece.color,
          0.2,
          this.currentPiece.type,
        )
      }
    }
  }

  private renderCurrentPiece(ctx: CanvasRenderingContext2D, boardX: number, boardY: number, cellSize: number): void {
    if (!this.currentPiece) {
      return
    }
    for (let y = 0; y < this.currentPiece.matrix.length; y += 1) {
      const row = this.currentPiece.matrix[y]!
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] !== 1) {
          continue
        }
        const px = this.currentPiece.x + x
        const py = this.currentPiece.y + y
        if (py < 0) {
          continue
        }
        this.drawBlock(ctx, boardX + px * cellSize, boardY + py * cellSize, cellSize, this.currentPiece.color, 1, this.currentPiece.type)
      }
    }
  }

  private drawBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string,
    alpha: number,
    variant?: TetrominoType,
  ): void {
    if (variant) {
      const kenneyKey = `tetris.block-${variant}` as const
      const kenneyDrew = drawKenneySprite(ctx, kenneyKey, {
        x: x + size / 2,
        y: y + size / 2,
        scaleX: size / 32,
        scaleY: size / 32,
        alpha,
      })
      const spriteDrew = drawSprite(ctx, 'tetris.block', {
        x,
        y,
        scaleX: size / 32,
        scaleY: size / 32,
        alpha,
        variant,
      })
      if (kenneyDrew || spriteDrew) return
    }

    const border = this.adjustColor(color, -30)
    const highlight = this.adjustColor(color, 30)

    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.strokeStyle = border
    ctx.lineWidth = 1
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1)

    ctx.strokeStyle = highlight
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x + 1, y + size - 1)
    ctx.lineTo(x + 1, y + 1)
    ctx.lineTo(x + size - 1, y + 1)
    ctx.stroke()

    ctx.globalAlpha = 1
  }

  private adjustColor(hexColor: string, amount: number): string {
    const cleaned = hexColor.replace('#', '')
    const num = Number.parseInt(cleaned, 16)
    const r = this.clampColor(((num >> 16) & 255) + amount)
    const g = this.clampColor(((num >> 8) & 255) + amount)
    const b = this.clampColor((num & 255) + amount)
    return `rgb(${r},${g},${b})`
  }

  private clampColor(value: number): number {
    return Math.max(0, Math.min(255, value))
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) {
      lines.push(currentLine)
    }
    return lines
  }

  private renderPanels(
    ctx: CanvasRenderingContext2D,
    boardX: number,
    boardY: number,
    cellSize: number,
    boardWidth: number,
  ): void {
    const leftPanelX = boardX - cellSize * 2.2
    const rightPanelX = boardX + boardWidth + cellSize * 0.5
    const statsPanelWidth = Math.max(cellSize * 3.1, 88)
    const statsPanelHeight = Math.max(cellSize * 3.5, 92)

    drawKawaiiPanel(ctx, leftPanelX - 8, boardY + cellSize * 0.05, statsPanelWidth, statsPanelHeight, {
      fill: '#fdf2f8',
      accent: '#f9a8d4',
      radius: 16,
    })

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = this.theme.palette.ink
    ctx.font = `bold ${Math.max(12, Math.floor(cellSize * 0.55))}px ${this.theme.font.family}`
    ctx.fillText(`等級 ${this.level}`, leftPanelX + 6, boardY + cellSize * 0.35)
    ctx.fillText(`消行 ${this.linesCleared}`, leftPanelX + 6, boardY + cellSize * 1.55)
    ctx.fillText(`總分 ${this.score}`, leftPanelX + 6, boardY + cellSize * 2.75)

    const previewCell = Math.max(6, Math.floor(cellSize * 0.6))
    const boxSize = previewCell * 4 + 12
    const previewBoxX = rightPanelX
    const previewBoxY = boardY + cellSize * 0.2
    const previewCount = this.previewPlusActive ? 3 : 1
    const previewGap = Math.max(8, Math.floor(cellSize * 0.4))

    for (let i = 0; i < previewCount; i += 1) {
      const piece = this.nextPieces[i]
      if (!piece) {
        continue
      }
      const boxY = previewBoxY + i * (boxSize + previewGap)

      drawKawaiiPanel(ctx, previewBoxX, boxY, boxSize, boxSize, {
        fill: '#eef7ff',
        accent: '#93c5fd',
        radius: 14,
      })

      const matrix = piece.matrix
      const matrixWidth = matrix[0]?.length ?? 0
      const matrixHeight = matrix.length
      const offsetX = previewBoxX + (boxSize - matrixWidth * previewCell) / 2
      const offsetY = boxY + (boxSize - matrixHeight * previewCell) / 2

      for (let y = 0; y < matrixHeight; y += 1) {
        const row = matrix[y]!
        for (let x = 0; x < matrixWidth; x += 1) {
          if (row[x] !== 1) {
            continue
          }
          this.drawBlock(
            ctx,
            Math.floor(offsetX + x * previewCell),
            Math.floor(offsetY + y * previewCell),
            previewCell,
            piece.color,
            1,
            piece.type,
          )
        }
      }
    }

    drawKawaiiInlineLabel(ctx, {
      x: previewBoxX,
      y: previewBoxY - Math.max(14, Math.floor(cellSize * 0.45)),
      text: '下一個方塊',
      iconKind: 'preview',
      color: '#fffaf6',
      fontSize: Math.max(11, Math.floor(cellSize * 0.45)),
      align: 'left',
    })

    if (this.activeMission) {
      const missionY = previewBoxY - Math.max(14, Math.floor(cellSize * 0.7)) - Math.max(80, Math.floor(cellSize * 4))
      const missionBoxHeight = Math.max(70, Math.floor(cellSize * 3.5))
      drawKawaiiPanel(ctx, previewBoxX, missionY, boxSize, missionBoxHeight, {
        fill: '#fff7e8',
        accent: '#fbbf24',
        radius: 14,
      })

      drawKawaiiInlineLabel(ctx, {
        x: previewBoxX + 6,
        y: missionY + Math.max(14, Math.floor(cellSize * 0.58)),
        text: '任務',
        iconKind: canvasIconKindForItem(this.activeMission.icon),
        color: '#2a1e25',
        fontSize: Math.max(10, Math.floor(cellSize * 0.4)),
        align: 'left',
      })

      ctx.fillStyle = this.theme.palette.highlight
      ctx.font = `${Math.max(9, Math.floor(cellSize * 0.35))}px ${this.theme.font.family}`
      const lines = this.wrapText(ctx, this.activeMission.name, boxSize - 12)
      let lineY = missionY + Math.max(26, Math.floor(cellSize * 1.1))
      for (const line of lines) {
        ctx.fillText(line, previewBoxX + 6, lineY)
        lineY += Math.max(12, Math.floor(cellSize * 0.5))
      }

      const barY = missionY + missionBoxHeight - Math.max(16, Math.floor(cellSize * 0.65))
      const barWidth = boxSize - 12
      const barHeight = Math.max(6, Math.floor(cellSize * 0.25))
      const progress = Math.min(1, this.missionProgress / this.activeMission.target)
      drawKawaiiProgressBar(ctx, previewBoxX + 6, barY, barWidth, barHeight, progress, {
        trackFill: 'rgba(42, 30, 37, 0.1)',
        fill: '#4ade80',
      })

      ctx.fillStyle = this.theme.palette.ink
      ctx.font = `${Math.max(8, Math.floor(cellSize * 0.32))}px ${this.theme.font.family}`
      ctx.fillText(`${this.missionProgress}/${this.activeMission.target}`, previewBoxX + 6, barY - Math.max(4, Math.floor(cellSize * 0.15)))
    }

    const previewBottomY = previewBoxY + previewCount * boxSize + (previewCount - 1) * previewGap
    const statusY = previewBottomY + cellSize * 0.35

    ctx.fillStyle = this.theme.palette.ink
    ctx.font = `${Math.max(10, Math.floor(cellSize * 0.42))}px ${this.theme.font.family}`
    ctx.fillText(`Bomb x${this.bombRowCharges}  Preview x${this.previewPlusCharges}`, previewBoxX, statusY)

    if (this.previewPlusActive) {
      const secondsLeft = Math.ceil(this.previewPlusTimer / 1000)
      ctx.fillStyle = this.theme.palette.accent
      ctx.fillText(`預覽+ 剩餘 ${secondsLeft} 秒`, previewBoxX, statusY + cellSize * 0.75)
    }

    const buttonWidth = Math.max(88, Math.floor(cellSize * 5.2))
    const buttonHeight = Math.max(30, Math.floor(cellSize * 1.35))
    const buttonGap = Math.max(8, Math.floor(cellSize * 0.45))
    const bombButtonY = statusY + cellSize * 1.5
    const previewButtonY = bombButtonY + buttonHeight + buttonGap

    const bombEnabled = this.bombRowCharges > 0 && !this.gameOver
    drawKawaiiButton(ctx, {
      x: previewBoxX,
      y: bombButtonY,
      width: buttonWidth,
      height: buttonHeight,
      label: '炸彈行 B',
      count: this.bombRowCharges,
      iconKind: 'bomb',
      enabled: bombEnabled,
      fill: '#fed7aa',
      activeFill: '#fdba74',
      disabledFill: '#d7d2cb',
    })

    const previewEnabled = this.previewPlusCharges > 0 && !this.gameOver
    drawKawaiiButton(ctx, {
      x: previewBoxX,
      y: previewButtonY,
      width: buttonWidth,
      height: buttonHeight,
      label: '預覽+ V',
      count: this.previewPlusCharges,
      iconKind: 'preview',
      enabled: previewEnabled,
      fill: '#bfdbfe',
      activeFill: '#93c5fd',
      disabledFill: '#d7d2cb',
    })
  }

  private getItemButtonRects(boardX: number, boardY: number, cellSize: number, boardWidth: number): {
    bomb: Rect
    previewPlus: Rect
  } {
    const rightPanelX = boardX + boardWidth + cellSize * 0.5
    const previewCell = Math.max(6, Math.floor(cellSize * 0.6))
    const boxSize = previewCell * 4 + 12
    const previewCount = this.previewPlusActive ? 3 : 1
    const previewGap = Math.max(8, Math.floor(cellSize * 0.4))
    const previewBottomY =
      boardY + cellSize * 0.2 + previewCount * boxSize + (previewCount - 1) * previewGap
    const statusY = previewBottomY + cellSize * 0.35
    const buttonWidth = Math.max(88, Math.floor(cellSize * 5.2))
    const buttonHeight = Math.max(30, Math.floor(cellSize * 1.35))
    const buttonGap = Math.max(8, Math.floor(cellSize * 0.45))
    const bombY = statusY + cellSize * 1.5

    return {
      bomb: {
        x: rightPanelX,
        y: bombY,
        width: buttonWidth,
        height: buttonHeight,
      },
      previewPlus: {
        x: rightPanelX,
        y: bombY + buttonHeight + buttonGap,
        width: buttonWidth,
        height: buttonHeight,
      },
    }
  }

  private isPointInsideRect(px: number, py: number, rect: Rect): boolean {
    return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height
  }

  private bindInputListeners(): void {
    if (!this.keyboardBound) {
      window.addEventListener('keydown', this.handleKeyDown)
      window.addEventListener('keyup', this.handleKeyUp)
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
      window.removeEventListener('keyup', this.handleKeyUp)
      this.keyboardBound = false
    }
    if (this.touchBound) {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart)
      this.canvas.removeEventListener('touchend', this.handleTouchEnd)
      this.touchBound = false
    }
    this.activeTouch = null
    this.softDropActive = false
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase()
    const code = event.code
    const handledKeys = new Set<string>([
      'arrowleft',
      'arrowright',
      'arrowup',
      'arrowdown',
      'a',
      'd',
      'w',
      's',
      ' ',
      'space',
      'spacebar',
      'keya',
      'keyd',
      'keyw',
      'keys',
      'b',
      'v',
      'keyb',
      'keyv',
    ])

    if (handledKeys.has(key) || handledKeys.has(code.toLowerCase())) {
      event.preventDefault()
    }

    if (this.gameOver) {
      if (key === 'r' || code === 'KeyR') {
        this.init()
      }
      return
    }

    if (key === 'arrowleft' || key === 'a' || code === 'KeyA') {
      this.tryMove(-1, 0)
      return
    }
    if (key === 'arrowright' || key === 'd' || code === 'KeyD') {
      this.tryMove(1, 0)
      return
    }
    if (key === 'arrowup' || key === 'w' || code === 'KeyW') {
      if (!event.repeat) {
        this.rotateCurrentPiece()
      }
      return
    }
    if (key === 'arrowdown' || key === 's' || code === 'KeyS') {
      this.softDropActive = true
      return
    }
    if (key === 'b' || code === 'KeyB') {
      if (!event.repeat) {
        this.activateBombRow()
      }
      return
    }
    if (key === 'v' || code === 'KeyV') {
      if (!event.repeat) {
        this.activatePreviewPlus()
      }
      return
    }
    if (code === 'Space' || key === ' ' || key === 'space' || key === 'spacebar') {
      if (!event.repeat) {
        this.hardDrop()
      }
    }
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase()
    const code = event.code
    if (key === 'arrowdown' || key === 's' || code === 'KeyS') {
      this.softDropActive = false
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
      startX: touch.clientX,
      startY: touch.clientY,
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

    const dx = touch.clientX - this.activeTouch.startX
    const dy = touch.clientY - this.activeTouch.startY
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)
    const rect = this.canvas.getBoundingClientRect()

    const tapThreshold = Math.max(18, Math.min(rect.width, rect.height) * 0.035)
    const swipeThreshold = Math.max(28, Math.min(rect.width, rect.height) * 0.055)

    if (!this.gameOver && absDx < tapThreshold && absDy < tapThreshold) {
      const scaleX = this.width / rect.width
      const scaleY = this.height / rect.height
      const tapX = (touch.clientX - rect.left) * scaleX
      const tapY = (touch.clientY - rect.top) * scaleY
      const cellSize = Math.max(8, Math.floor(Math.min(this.width / 14, this.height / 22)))
      const boardWidth = BOARD_WIDTH * cellSize
      const boardHeight = BOARD_HEIGHT * cellSize
      const boardX = Math.floor((this.width - boardWidth) / 2)
      const boardY = Math.floor((this.height - boardHeight) / 2)
      const itemRects = this.getItemButtonRects(boardX, boardY, cellSize, boardWidth)

      if (this.isPointInsideRect(tapX, tapY, itemRects.bomb)) {
        this.activateBombRow()
        this.activeTouch = null
        event.preventDefault()
        return
      }
      if (this.isPointInsideRect(tapX, tapY, itemRects.previewPlus)) {
        this.activatePreviewPlus()
        this.activeTouch = null
        event.preventDefault()
        return
      }
    }

    if (!this.gameOver) {
      if (Math.max(absDx, absDy) >= swipeThreshold) {
        if (absDy > absDx * 1.15) {
          if (dy > 0) {
            this.hardDrop()
          } else {
            this.rotateCurrentPiece()
          }
        } else if (dx < 0) {
          this.tryMove(-1, 0)
        } else {
          this.tryMove(1, 0)
        }
      } else {
        const zoneX = touch.clientX - rect.left
        const zoneWidth = rect.width / 3
        if (zoneX < zoneWidth) {
          this.tryMove(-1, 0)
        } else if (zoneX > zoneWidth * 2) {
          this.tryMove(1, 0)
        } else {
          this.rotateCurrentPiece()
        }
      }
    }

    this.activeTouch = null
    event.preventDefault()
  }

  getBoardState(): string {
    const lines: string[] = []
    lines.push('=== TETRIS BOARD STATE ===')
    lines.push(`Score: ${this.score} | Level: ${this.level} | Lines: ${this.linesCleared}`)
    
    if (this.activeMission) {
      lines.push(`Mission: ${this.activeMission.name} (${this.missionProgress}/${this.activeMission.target})`)
    }
    
    if (this.specialRows.size > 0) {
      lines.push(`Golden Rows: ${Array.from(this.specialRows).join(', ')}`)
    }
    
    lines.push(`Bomb Charges: ${this.bombRowCharges} | Preview+: ${this.previewPlusCharges}`)
    lines.push('')
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      const row = this.board[y]!
      const isSpecial = this.specialRows.has(y)
      const prefix = isSpecial ? '**' : '  '
      const cells = row.map(cell => cell ? '█' : '·').join('')
      lines.push(`${prefix}${cells}`)
    }
    
    if (this.currentPiece) {
      lines.push('')
      lines.push(`Current: ${this.currentPiece.type} at (${this.currentPiece.x}, ${this.currentPiece.y})`)
    }
    
    if (this.gameOver) {
      lines.push('')
      lines.push('GAME OVER')
    }
    
    return lines.join('\n')
  }
}

export function createTetrisGame(): GameInstance {
  return new TetrisGame()
}
