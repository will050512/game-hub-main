import { GameEngine } from '@/engine/GameEngine'
import { REWARD_EVENT_SCHEMA_VERSION, createRewardPayload, type GameInstance, type PlayerStats, type GameHudData } from '@/types'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKawaiiButton, drawKawaiiInlineLabel, drawKawaiiPanel } from '@/engine/kawaiiCanvas'
import { EffectsManager } from '@/engine/effects'
import { computeResponsiveGridLayout } from '@/games/shared/responsiveGridLayout'

type Cell = number | 0
type Board = Cell[][]
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
type GamePhase = 'menu' | 'playing' | 'gameover'
type AssistMode = 'notes' | 'autoFill' | 'highlight'

interface DailyChallenge {
  date: string
  difficulty: Difficulty
  puzzleIndex: number
  completed: boolean
  bestScore: number
}

interface CellNote {
  r: number
  c: number
  notes: Set<number>
}

const PUZZLES: Record<Difficulty, { puzzle: string; solution: string }[]> = {
  easy: [
    {
      puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
      solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
    },
    {
      puzzle: '003020600900305001001806400008102900700000008006708200002609500800203009005010300',
      solution: '483921657967345821251876493548132976729564138316798245172649583834257169695413728',
    },
    {
      puzzle: '200080300060070084030050407000040003000060000703001020003000900050000000045283100',
      solution: '219485367567319284834652179348976512125347896796815423683294751472561938951738642',
    },
  ],
  medium: [
    {
      puzzle: '000260701680070090190004500820100040004602900050003028009300074040050036703018000',
      solution: '435269781682571493197834562826195347374682915951743628519326874248957136763418259',
    },
    {
      puzzle: '200080300060002008008460002070502006900000004600301090700018600100700040002090001',
      solution: '215986347469372518378461952871592136953847264642315789734128695186759423592634871',
    },
  ],
  hard: [
    {
      puzzle: '0000000104000000000200000000000050407008000300001090000300400200050100000000806000',
      solution: '693784512487512936125963874932651487568247391741398625379425268856179243214836759',
    },
    {
      puzzle: '000000000000003007008006500100000000000000000000000000004027000000000000000000000900',
      solution: '912654837635789124478123659156248793749935261283517448367892541591436728824571369',
    },
  ],
  expert: [
    {
      puzzle: '000000000000003085001020000000507000004000100090000000500000073002010000000040009',
      solution: '987654321246173985531928746162537894754892163893416572519286437472351986287419359',
    },
  ],
}

class SudokuGame extends GameEngine {
  private board: Board = []
  private solution: Board = []
  private given: boolean[][] = []
  private selectedCell: { r: number; c: number } | null = null
  private phase: GamePhase = 'menu'
  private difficulty: Difficulty = 'medium'
  private score = 0
  private errors = 0
  private maxErrors = 3
  private gameTime = 0
  private gameOverSent = false
  private hintsUsed = 0
  private cellSize = 0
  private boardOffsetX = 0
  private boardOffsetY = 0
  private animationTimer = 0
  private numberPadCells: { num: number; x: number; y: number; w: number; h: number }[] = []
  private actionButtons: { label: string; action: string; x: number; y: number; w: number; h: number }[] = []
  private cellNotes: Map<string, Set<number>> = new Map()
  private notesMode = false
  private highlightMode = false
  private autoFillEnabled = false
  private dailyChallenge: DailyChallenge | null = null
  private masteryPoints = 0
  private masteryLevel = 1
  private perfectSolves = 0
  private assistToolButtons: { label: string; action: string; active: boolean }[] = []
  private effects: EffectsManager = new EffectsManager()

  protected init(): void {
    void preloadGameSprites('sudoku')
    this.phase = 'menu'
    this.score = 0
    this.errors = 0
    this.gameTime = 0
    this.gameOverSent = false
    this.hintsUsed = 0
    this.board = []
    this.solution = []
    this.given = []
    this.selectedCell = null
    this.animationTimer = 0
    this.cellNotes.clear()
    this.notesMode = false
    this.highlightMode = false
    this.autoFillEnabled = false
    this.initDailyChallenge()
    this.initMasterySystem()
    this.pushStats()
  }

  private initDailyChallenge(): void {
    const today = new Date().toISOString().split('T')[0]
    const stored = localStorage.getItem('sudoku_daily')
    if (stored) {
      const daily = JSON.parse(stored) as DailyChallenge
      if (daily.date === today) {
        this.dailyChallenge = daily
        return
      }
    }
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    this.dailyChallenge = {
      date: today!,
      difficulty: (['easy', 'medium', 'hard', 'expert'] as Difficulty[])[dayOfYear % 4]!,
      puzzleIndex: dayOfYear % PUZZLES.medium.length,
      completed: false,
      bestScore: 0,
    }
    localStorage.setItem('sudoku_daily', JSON.stringify(this.dailyChallenge))
  }

  private initMasterySystem(): void {
    const stored = localStorage.getItem('sudoku_mastery')
    if (stored) {
      const data = JSON.parse(stored) as { points: number; level: number; perfect: number }
      this.masteryPoints = data.points
      this.masteryLevel = data.level
      this.perfectSolves = data.perfect
    }
  }

  private updateMastery(won: boolean, perfect: boolean): void {
    if (won) {
      const basePoints = { easy: 10, medium: 20, hard: 40, expert: 80 }[this.difficulty]
      const points = basePoints + (perfect ? Math.floor(basePoints * 0.5) : 0)
      this.masteryPoints += points
      if (perfect) this.perfectSolves++
      
      const pointsForNextLevel = this.masteryLevel * 100
      if (this.masteryPoints >= pointsForNextLevel) {
        this.masteryLevel++
        this.masteryPoints -= pointsForNextLevel
      }
      
      localStorage.setItem('sudoku_mastery', JSON.stringify({
        points: this.masteryPoints,
        level: this.masteryLevel,
        perfect: this.perfectSolves,
      }))
    }
  }

  private loadPuzzle(): void {
    const puzzles = PUZZLES[this.difficulty]
    let puzzleIndex = Math.floor(Math.random() * puzzles.length)
    
    if (this.dailyChallenge && this.dailyChallenge.difficulty === this.difficulty) {
      puzzleIndex = this.dailyChallenge.puzzleIndex % puzzles.length
    }
    
    const puzzleData = puzzles[puzzleIndex]
    if (!puzzleData) return
    const puzzleStr = puzzleData.puzzle
    const solutionStr = puzzleData.solution

    this.board = []
    this.solution = []
    this.given = []

    for (let r = 0; r < 9; r++) {
      const boardRow: Cell[] = []
      const solRow: Cell[] = []
      const givenRow: boolean[] = []
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c
        const pVal = puzzleStr[idx] ?? '0'
        const sVal = solutionStr[idx] ?? '0'
        boardRow.push(parseInt(pVal, 10))
        solRow.push(parseInt(sVal, 10))
        givenRow.push(pVal !== '0')
      }
      this.board.push(boardRow)
      this.solution.push(solRow)
      this.given.push(givenRow)
    }
  }

  protected update(dt: number): void {
    this.gameTime += dt
    this.animationTimer += dt
    this.effects.update(dt)
    this.pushStats()
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const bg = ctx.createLinearGradient(0, 0, 0, this.height)
    bg.addColorStop(0, '#0a1628')
    bg.addColorStop(1, '#0f2027')
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

    drawKawaiiPanel(ctx, this.width * 0.18, this.height * 0.12, this.width * 0.64, this.height * 0.14, {
      fill: 'rgba(255,250,246,0.9)',
      accent: '#14b8a6',
      stroke: '#171717',
      radius: Math.floor(20 * scale),
    })

    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.floor(32 * scale)}px sans-serif`
    ctx.fillText('數獨', this.width / 2, this.height * 0.15)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.floor(14 * scale)}px sans-serif`
    ctx.fillText('Sudoku', this.width / 2, this.height * 0.15 + Math.floor(40 * scale))
    
    if (this.dailyChallenge) {
      const dailyY = this.height * 0.15 + Math.floor(70 * scale)
      ctx.fillStyle = this.dailyChallenge.completed ? '#22c55e' : '#fbbf24'
      ctx.font = `${Math.floor(12 * scale)}px sans-serif`
      const status = this.dailyChallenge.completed ? 'Completed' : 'Daily Challenge'
      ctx.fillText(`${status} (${this.dailyChallenge.difficulty})`, this.width / 2, dailyY)
    }

    const diffItems: { key: Difficulty; label: string; color: string }[] = [
      { key: 'easy', label: 'Easy', color: '#22c55e' },
      { key: 'medium', label: 'Medium', color: '#eab308' },
      { key: 'hard', label: 'Hard', color: '#f97316' },
      { key: 'expert', label: 'Expert', color: '#ef4444' },
    ]

    const btnWidth = Math.floor(this.width * 0.6)
    const btnHeight = Math.floor(44 * scale)
    const btnGap = Math.floor(10 * scale)
    const menuStartY = this.height * 0.35

    diffItems.forEach((d, i) => {
      const btnY = menuStartY + i * (btnHeight + btnGap)
      const btnX = (this.width - btnWidth) / 2
      const isActive = this.difficulty === d.key
      drawKawaiiButton(ctx, {
        x: btnX,
        y: btnY,
        width: btnWidth,
        height: btnHeight,
        label: d.label,
        iconKind: d.key === 'easy' ? 'heart' : d.key === 'medium' ? 'star' : d.key === 'hard' ? 'timer' : 'bomb',
        active: isActive,
        fill: 'rgba(255,255,255,0.92)',
        activeFill: d.color,
      })
    })

    const startBtnY = menuStartY + 4 * (btnHeight + btnGap) + Math.floor(20 * scale)
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(52 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    drawKawaiiButton(ctx, {
      x: startBtnX,
      y: startBtnY,
      width: startBtnW,
      height: startBtnH,
      label: 'Start Game',
      iconKind: 'target',
      fill: '#ccfbf1',
      activeFill: '#5eead4',
    })
  }

  private renderGame(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    drawKawaiiPanel(ctx, this.width / 2 - 110 * scale, Math.floor(6 * scale), 220 * scale, 50 * scale, {
      fill: 'rgba(255,250,246,0.9)',
      accent: '#14b8a6',
      stroke: '#171717',
      radius: Math.floor(14 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: this.width / 2 - 92 * scale,
      y: Math.floor(20 * scale),
      text: `Errors ${this.errors}/${this.maxErrors} · Hints ${this.hintsUsed}`,
      iconKind: 'target',
      color: '#134e4a',
      fontSize: Math.max(10, Math.floor(11 * scale)),
      })

    const mins = Math.floor(this.gameTime / 60000)
    const secs = Math.floor((this.gameTime % 60000) / 1000)
     drawKawaiiInlineLabel(ctx, {
       x: this.width / 2 - 28 * scale,
       y: Math.floor(34 * scale),
       text: `${mins}:${secs.toString().padStart(2, '0')}`,
       iconKind: 'timer',
       color: '#475569',
       fontSize: Math.max(10, Math.floor(10 * scale)),
      })
    
     drawKawaiiInlineLabel(ctx, {
       x: this.width / 2 - 54 * scale,
       y: Math.floor(48 * scale),
       text: `Lv.${this.masteryLevel} · ${this.masteryPoints}/${this.masteryLevel * 100} MP`,
       iconKind: 'star',
       color: '#a16207',
       fontSize: Math.max(9, Math.floor(9 * scale)),
      })

    const layout = computeResponsiveGridLayout({
      canvasWidth: this.width,
      canvasHeight: this.height,
      rows: 9,
      cols: 9,
      dpr: scale,
      topReserved: Math.floor(66 * scale),
      bottomReserved: Math.floor(146 * scale),
      minCellSize: Math.floor(24 * scale),
      maxCellSize: Math.floor(58 * scale),
      gap: 0,
      horizontalPadding: Math.floor(16 * scale),
    })
    this.cellSize = layout.cellSize
    this.boardOffsetX = layout.boardX
    this.boardOffsetY = layout.boardY

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const x = this.boardOffsetX + c * this.cellSize
        const y = this.boardOffsetY + r * this.cellSize
        const val = this.board[r]?.[c] ?? 0
        const isGiven = this.given[r]?.[c] ?? false
        const isSelected = this.selectedCell?.r === r && this.selectedCell?.c === c
        const isError = !isGiven && val !== 0 && val !== (this.solution[r]?.[c] ?? 0)
        const shouldHighlight = this.highlightMode && this.selectedCell && val !== 0 && val === this.board[this.selectedCell.r]?.[this.selectedCell.c]

        const cellAlpha = isSelected ? 1 : shouldHighlight ? 0.92 : isError ? 0.9 : isGiven ? 0.84 : 0.78
        const cellDrawn = drawSprite(ctx, 'sudoku.cell', {
          x,
          y,
          scaleX: this.cellSize / 56,
          scaleY: this.cellSize / 56,
          alpha: cellAlpha,
        })
        if (!cellDrawn) {
          if (isSelected) {
            ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'
          } else if (shouldHighlight) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'
          } else if (isError) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'
          } else if (isGiven) {
            ctx.fillStyle = 'rgba(255,255,255,0.03)'
          } else {
            ctx.fillStyle = 'rgba(255,255,255,0.06)'
          }
          ctx.fillRect(x, y, this.cellSize, this.cellSize)
        }

        if (c % 3 === 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'
          ctx.lineWidth = Math.floor(2 * scale)
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + this.cellSize)
          ctx.stroke()
        }
        if (r % 3 === 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'
          ctx.lineWidth = Math.floor(2 * scale)
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + this.cellSize, y)
          ctx.stroke()
        }

        if (val !== 0) {
          ctx.fillStyle = isGiven ? '#e2e8f0' : isError ? '#ef4444' : '#8b5cf6'
          ctx.font = `bold ${Math.floor(this.cellSize * 0.55)}px sans-serif`
          ctx.fillText(val.toString(), x + this.cellSize / 2, y + this.cellSize / 2)
        } else {
          const key = `${r},${c}`
          const notes = this.cellNotes.get(key)
          if (notes && notes.size > 0) {
            ctx.fillStyle = '#64748b'
            ctx.font = `${Math.floor(this.cellSize * 0.22)}px sans-serif`
            const noteArr = Array.from(notes).sort()
            noteArr.forEach((n, idx) => {
              const nx = x + ((idx % 3) + 0.5) * (this.cellSize / 3)
              const ny = y + (Math.floor(idx / 3) + 0.5) * (this.cellSize / 3)
              ctx.fillText(n.toString(), nx, ny)
            })
          }
        }
      }
    }

    // Board border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = Math.floor(2 * scale)
    ctx.strokeRect(this.boardOffsetX, this.boardOffsetY, this.cellSize * 9, this.cellSize * 9)

    // Number pad
    this.renderNumberPad(ctx)

    // Action buttons
    this.renderActionButtons(ctx)

    // Game over overlay
    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, this.width, this.height)

      const isWin = this.errors < this.maxErrors
      ctx.fillStyle = isWin ? '#22c55e' : '#ef4444'
      ctx.font = `bold ${Math.floor(28 * scale)}px sans-serif`
      ctx.fillText(isWin ? 'Complete!' : 'Game Over', this.width / 2, this.height * 0.4)

      ctx.fillStyle = '#e2e8f0'
      ctx.font = `${Math.floor(16 * scale)}px sans-serif`
      ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height * 0.47)

      const btnW = Math.floor(this.width * 0.5)
      const btnH = Math.floor(44 * scale)
      const btnY = this.height * 0.55
      const btnX = (this.width - btnW) / 2
      ctx.fillStyle = '#14b8a6'
      ctx.beginPath()
      this.roundRect(ctx, btnX, btnY, btnW, btnH, Math.floor(12 * scale))
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.floor(15 * scale)}px sans-serif`
      ctx.fillText('Play Again', this.width / 2, btnY + btnH / 2)
    }

    this.effects.render(ctx)
  }

  private renderNumberPad(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const padY = this.boardOffsetY + this.cellSize * 9 + Math.floor(12 * scale)
    const padSize = Math.min(Math.floor((this.width - Math.floor(48 * scale)) / 5), Math.floor(40 * scale))
    const padGap = Math.floor(6 * scale)
    const totalW = padSize * 5 + padGap * 4
    const startX = Math.floor((this.width - totalW) / 2)

    this.numberPadCells = []

    for (let i = 1; i <= 9; i++) {
      const col = (i - 1) % 5
      const row = Math.floor((i - 1) / 5)
      const x = startX + col * (padSize + padGap)
      const y = padY + row * (padSize + padGap)

        drawKawaiiButton(ctx, {
          x,
          y,
          width: padSize,
          height: padSize,
          label: i.toString(),
          fill: 'rgba(255,255,255,0.92)',
          activeFill: '#a7f3d0',
        })

      this.numberPadCells.push({ num: i, x, y, w: padSize, h: padSize })
    }
  }

  private renderActionButtons(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const btnH = Math.floor(36 * scale)
    const btnW = Math.floor(this.width * 0.25)
    const gap = Math.floor(8 * scale)
    const totalW = btnW * 3 + gap * 2
    const startX = Math.floor((this.width - totalW) / 2)
    const btnY = this.boardOffsetY + this.cellSize * 9 + Math.floor(12 * scale) + Math.floor(90 * scale)

    this.actionButtons = [
      { label: 'Erase', action: 'erase', x: startX, y: btnY, w: btnW, h: btnH },
      { label: 'Hint', action: 'hint', x: startX + btnW + gap, y: btnY, w: btnW, h: btnH },
      { label: 'Menu', action: 'menu', x: startX + (btnW + gap) * 2, y: btnY, w: btnW, h: btnH },
    ]

    this.actionButtons.forEach(btn => {
      drawKawaiiButton(ctx, {
        x: btn.x,
        y: btn.y,
        width: btn.w,
        height: btn.h,
        label: btn.label,
        iconKind: btn.action === 'erase' ? 'undo' : btn.action === 'hint' ? 'star' : 'target',
        fill: btn.action === 'hint' ? '#fef3c7' : 'rgba(255,255,255,0.92)',
        activeFill: btn.action === 'hint' ? '#fcd34d' : '#a7f3d0',
      })
    })
    
    const assistY = btnY + btnH + Math.floor(12 * scale)
    const assistBtnW = Math.floor(this.width * 0.28)
    const assistGap = Math.floor(6 * scale)
    const assistTotalW = assistBtnW * 3 + assistGap * 2
    const assistStartX = Math.floor((this.width - assistTotalW) / 2)
    const assistH = Math.floor(28 * scale)
    
    this.assistToolButtons = [
      { label: 'Notes', action: 'notes', active: this.notesMode },
      { label: 'Highlight', action: 'highlight', active: this.highlightMode },
      { label: 'AutoFill', action: 'autofill', active: this.autoFillEnabled },
    ]
    
    this.assistToolButtons.forEach((tool, i) => {
      const x = assistStartX + i * (assistBtnW + assistGap)
      const isActive = tool.active
      
      drawKawaiiButton(ctx, {
        x,
        y: assistY,
        width: assistBtnW,
        height: assistH,
        label: tool.label,
        iconKind: tool.action === 'notes' ? 'preview' : tool.action === 'highlight' ? 'spark' : 'speed',
        active: isActive,
        fill: 'rgba(255,255,255,0.92)',
        activeFill: '#bbf7d0',
      })
    })
  }

  private handleTap(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * this.width / rect.width
    const y = (clientY - rect.top) * this.height / rect.height

    if (this.phase === 'menu') {
      this.handleMenuTap(x, y)
    } else if (this.phase === 'playing') {
      this.handleGameTap(x, y)
    } else if (this.phase === 'gameover') {
      this.handleGameOverTap(x, y)
    }
  }

  private handleMenuTap(x: number, y: number): void {
    const scale = this.dpr
    const diffItems: Difficulty[] = ['easy', 'medium', 'hard', 'expert']
    const btnWidth = Math.floor(this.width * 0.6)
    const btnHeight = Math.floor(44 * scale)
    const btnGap = Math.floor(10 * scale)
    const menuStartY = this.height * 0.35

    diffItems.forEach((d, i) => {
      const btnY = menuStartY + i * (btnHeight + btnGap)
      const btnX = (this.width - btnWidth) / 2
      if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
        this.difficulty = d
      }
    })

    const startBtnY = menuStartY + 4 * (btnHeight + btnGap) + Math.floor(20 * scale)
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(52 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    if (x >= startBtnX && x <= startBtnX + startBtnW && y >= startBtnY && y <= startBtnY + startBtnH) {
      this.loadPuzzle()
      this.phase = 'playing'
      this.selectedCell = null
      this.errors = 0
      this.score = 0
      this.hintsUsed = 0
      this.gameTime = 0
      this.gameOverSent = false
    }
  }

  private handleGameTap(x: number, y: number): void {
    const scale = this.dpr
    
    for (const tool of this.assistToolButtons) {
      const assistY = this.boardOffsetY + this.cellSize * 9 + Math.floor(12 * scale) + Math.floor(90 * scale) + Math.floor(36 * scale) + Math.floor(12 * scale)
      const assistBtnW = Math.floor(this.width * 0.28)
      const assistGap = Math.floor(6 * scale)
      const assistTotalW = assistBtnW * 3 + assistGap * 2
      const assistStartX = Math.floor((this.width - assistTotalW) / 2)
      const assistH = Math.floor(28 * scale)
      const idx = this.assistToolButtons.indexOf(tool)
      const toolX = assistStartX + idx * (assistBtnW + assistGap)
      
      if (x >= toolX && x <= toolX + assistBtnW && y >= assistY && y <= assistY + assistH) {
        if (tool.action === 'notes') this.notesMode = !this.notesMode
        else if (tool.action === 'highlight') this.highlightMode = !this.highlightMode
        else if (tool.action === 'autofill') this.autoFillEnabled = !this.autoFillEnabled
        return
      }
    }
    
    for (const pad of this.numberPadCells) {
      if (x >= pad.x && x <= pad.x + pad.w && y >= pad.y && y <= pad.y + pad.h) {
        this.placeNumber(pad.num)
        return
      }
    }

    for (const btn of this.actionButtons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        if (btn.action === 'erase') this.eraseCell()
        else if (btn.action === 'hint') this.useHint()
        else if (btn.action === 'menu') this.phase = 'menu'
        return
      }
    }

    // Board cells
    const col = Math.floor((x - this.boardOffsetX) / this.cellSize)
    const row = Math.floor((y - this.boardOffsetY) / this.cellSize)
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      if (!this.given[row]![col]) {
        this.selectedCell = { r: row, c: col }
      }
    }
  }

  private placeNumber(num: number): void {
    if (!this.selectedCell) return
    const { r, c } = this.selectedCell
    if (this.given[r]?.[c]) return

    if (this.notesMode && num !== 0) {
      const key = `${r},${c}`
      if (!this.cellNotes.has(key)) this.cellNotes.set(key, new Set())
      const notes = this.cellNotes.get(key)!
      if (notes.has(num)) notes.delete(num)
      else notes.add(num)
      return
    }

    const prev = this.board[r]![c]!
    this.board[r]![c] = num
    if (num !== 0) {
      const x = this.boardOffsetX + c * this.cellSize + this.cellSize / 2
      const y = this.boardOffsetY + r * this.cellSize + this.cellSize / 2
      this.effects.burst(x, y, 4, ['#00bcd4'], { min: 0.5, max: 1.5 })
    }
    
    if (num !== 0) {
      const key = `${r},${c}`
      this.cellNotes.delete(key)
    }

    if (num !== 0 && num !== this.solution[r]![c]) {
      this.errors++
      this.effects.triggerShake(2, 100)
      if (this.errors >= this.maxErrors) {
        this.phase = 'gameover'
        this.updateMastery(false, false)
        if (!this.gameOverSent) {
          this.gameOverSent = true
          this.callbacks.onRewardEvent?.({
            schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
            gameId: 'sudoku',
            emittedAt: new Date().toISOString(),
            score: this.score,
            rewards: createRewardPayload(),
            result: {
              score: this.score,
              kills: this.board.flat().filter(cell => cell !== 0).length,
              time: Math.floor(this.gameTime / 1000),
              level: Math.floor(this.board.flat().filter(cell => cell !== 0).length / 9) + 1,
              coins: 0,
            },
          })
          this.callbacks.onGameOver?.(this.score)
        }
      }
    } else if (num !== 0 && prev === 0 && num === this.solution[r]![c]) {
      this.score += 10
      const x = this.boardOffsetX + c * this.cellSize + this.cellSize / 2
      const y = this.boardOffsetY + r * this.cellSize + this.cellSize / 2
      this.effects.burst(x, y, 8, ['#4caf50'], { min: 1, max: 2 })
    }

    this.checkWin()
  }

  private eraseCell(): void {
    if (!this.selectedCell) return
    const { r, c } = this.selectedCell
    if (!this.given[r]![c]) {
      this.board[r]![c] = 0
    }
  }

  private useHint(): void {
    if (!this.selectedCell) return
    const { r, c } = this.selectedCell
    if (this.given[r]![c] || this.board[r]![c] !== 0) return

    this.board[r]![c] = this.solution[r]?.[c] ?? 0
    this.given[r]![c] = true
    this.hintsUsed++
    const x = this.boardOffsetX + c * this.cellSize + this.cellSize / 2
    const y = this.boardOffsetY + r * this.cellSize + this.cellSize / 2
    this.effects.burst(x, y, 6, ['#ffeb3b'], { min: 1, max: 2 })
    this.score = Math.max(0, this.score - 20)
    this.checkWin()
  }

  private checkWin(): void {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r]![c] !== this.solution[r]![c]) return
      }
    }
    this.phase = 'gameover'
    this.effects.triggerConfetti(40)
    const isPerfect = this.errors === 0 && this.hintsUsed === 0
    this.score += Math.max(0, 500 - this.errors * 50 - this.hintsUsed * 30) + (isPerfect ? 300 : 0)
    this.updateMastery(true, isPerfect)
    
    if (this.dailyChallenge && !this.dailyChallenge.completed) {
      this.dailyChallenge.completed = true
      this.dailyChallenge.bestScore = Math.max(this.dailyChallenge.bestScore, this.score)
      localStorage.setItem('sudoku_daily', JSON.stringify(this.dailyChallenge))
    }
    
    if (!this.gameOverSent) {
      this.gameOverSent = true
      this.callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'sudoku',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.board.flat().filter(cell => cell !== 0).length,
          time: Math.floor(this.gameTime / 1000),
          level: Math.floor(this.board.flat().filter(cell => cell !== 0).length / 9) + 1,
          coins: 0,
        },
      })
      this.callbacks.onGameOver?.(this.score)
    }
  }

  private handleGameOverTap(x: number, y: number): void {
    const scale = this.dpr
    const btnW = Math.floor(this.width * 0.5)
    const btnH = Math.floor(44 * scale)
    const btnY = this.height * 0.55
    const btnX = (this.width - btnW) / 2
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      this.phase = 'menu'
    }
  }

  private pushStats(): void {
    const filled = this.board.flat().filter(v => v !== 0).length
    const total = 81
    const stats: PlayerStats = {
      hp: this.maxErrors - this.errors,
      maxHp: this.maxErrors,
      level: Math.floor(filled / 9) + 1,
      xp: filled % 9,
      xpToNext: 9,
      kills: filled,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const filled = this.board.flat().filter(v => v !== 0).length
    const hudData: GameHudData = {
      hp: this.maxErrors - this.errors,
      maxHp: this.maxErrors,
      level: Math.floor(filled / 9) + 1,
      xp: filled % 9,
      xpToNext: 9,
      kills: filled,
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

export function createSudokuGame(): GameInstance {
  const game = new SudokuGame()
  const origStart = game.start.bind(game)
  game.start = function(canvas, callbacks) {
    origStart(canvas, callbacks)
    canvas.addEventListener('pointerdown', (e) => {
      (game as unknown as { handleTap: (x: number, y: number) => void }).handleTap(e.clientX, e.clientY)
    })
  }
  return game
}
