import { GameEngine } from '@/engine/GameEngine'
import { REWARD_EVENT_SCHEMA_VERSION, createRewardPayload, type GameInstance, type PlayerStats, type GameHudData } from '@/types'
import { preloadGameSprites, drawSprite } from '@/engine/sprites/spriteLoader'
import { canvasIconKindForItem, drawKawaiiButton, drawKawaiiInlineLabel, drawKawaiiPanel } from '@/engine/kawaiiCanvas'
import { EffectsManager } from '@/engine/effects'
import { computeResponsiveGridLayout } from '@/games/shared/responsiveGridLayout'

type Cell = 'X' | 'O' | null
type Board = Cell[][]
type Difficulty = 'easy' | 'medium' | 'hard'
type GamePhase = 'menu' | 'playing' | 'gameover'
type AIPersonality = 'aggressive' | 'defensive' | 'balanced'
type PowerCard = 'swap' | 'block' | 'undo'

interface PowerCardState {
  type: PowerCard
  name: string
  description: string
  icon: string
  uses: number
  cooldown: number
}

class TicTacToeGame extends GameEngine {
  private board: Board = [[null, null, null], [null, null, null], [null, null, null]]
  private currentPlayer: 'X' | 'O' = 'X'
  private phase: GamePhase = 'menu'
  private difficulty: Difficulty = 'medium'
  private aiPersonality: AIPersonality = 'balanced'
  private score = 0
  private wins = 0
  private losses = 0
  private draws = 0
  private totalGames = 0
  private gameTime = 0
  private gameOverSent = false
  private winLine: { r: number; c: number }[] = []
  private aiThinking = false
  private cellSize = 0
  private boardOffsetX = 0
  private boardOffsetY = 0
  private animationTimer = 0
  private powerCards: PowerCardState[] = []
  private selectedPowerCard: PowerCard | null = null
  private blockedCells: Set<string> = new Set()
  private moveHistory: Array<{ r: number; c: number; player: 'X' | 'O' }> = []
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = []
  private effects: EffectsManager = new EffectsManager()

  protected init(): void {
    void preloadGameSprites('tic-tac-toe')

    this.resetBoard()
    this.phase = 'menu'
    this.score = 0
    this.gameTime = 0
    this.gameOverSent = false
    this.winLine = []
    this.aiThinking = false
    this.animationTimer = 0
    this.aiPersonality = 'balanced'
    this.initPowerCards()
    this.selectedPowerCard = null
    this.blockedCells.clear()
    this.moveHistory = []
    this.particles = []
    this.pushStats()
  }

  private initPowerCards(): void {
    this.powerCards = [
      { type: 'swap', name: 'Swap', description: 'Convert O to X', icon: 'swap', uses: 1, cooldown: 0 },
      { type: 'block', name: 'Block', description: 'Block one cell', icon: 'block', uses: 2, cooldown: 0 },
      { type: 'undo', name: 'Undo', description: 'Undo last move', icon: 'undo', uses: 1, cooldown: 0 },
    ]
  }

  private resetBoard(): void {
    this.board = [[null, null, null], [null, null, null], [null, null, null]]
    this.currentPlayer = 'X'
    this.winLine = []
    this.aiThinking = false
    this.blockedCells.clear()
    this.moveHistory = []
  }

  protected update(dt: number): void {
    this.gameTime += dt
    this.animationTimer += dt
    this.effects.update(dt)
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.x += p.vx * (dt / 16.667)
      p.y += p.vy * (dt / 16.667)
      p.life -= dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }
    
    for (const card of this.powerCards) {
      if (card.cooldown > 0) {
        card.cooldown = Math.max(0, card.cooldown - dt)
      }
    }
    
    this.pushStats()
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const topReserved = this.phase === 'menu' ? Math.floor(190 * scale) : Math.floor(76 * scale)
    const bottomReserved = this.phase === 'gameover' ? Math.floor(96 * scale) : Math.floor(62 * scale)
    const layout = computeResponsiveGridLayout({
      canvasWidth: this.width,
      canvasHeight: this.height,
      rows: 3,
      cols: 3,
      dpr: scale,
      topReserved,
      bottomReserved,
      minCellSize: Math.floor(48 * scale),
      maxCellSize: Math.floor(140 * scale),
      gap: Math.floor(4 * scale),
      horizontalPadding: Math.floor(18 * scale),
    })
    this.cellSize = layout.cellSize
    this.boardOffsetX = layout.boardX
    this.boardOffsetY = layout.boardY

    const bg = ctx.createLinearGradient(0, 0, 0, this.height)
    bg.addColorStop(0, '#0f0a1e')
    bg.addColorStop(1, '#1a1030')
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
    const titleSize = Math.floor(32 * scale)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    drawKawaiiPanel(ctx, this.width * 0.12, this.height * 0.09, this.width * 0.76, this.height * 0.14, {
      fill: 'rgba(255, 250, 246, 0.9)',
      accent: '#8b5cf6',
      stroke: '#171717',
      radius: Math.floor(20 * scale),
    })

    ctx.fillStyle = '#fff'
    ctx.font = `bold ${titleSize}px sans-serif`
    ctx.fillText('井字棋', this.width / 2, this.height * 0.12)

    const subtitleSize = Math.floor(14 * scale)
    ctx.fillStyle = '#94a3b8'
    ctx.font = `${subtitleSize}px sans-serif`
    ctx.fillText('Tic-Tac-Toe with Power Cards', this.width / 2, this.height * 0.12 + titleSize + 8 * scale)

    const diffItems: { key: Difficulty; label: string; color: string }[] = [
      { key: 'easy', label: 'Easy', color: '#22c55e' },
      { key: 'medium', label: 'Medium', color: '#eab308' },
      { key: 'hard', label: 'Hard', color: '#ef4444' },
    ]

    const btnWidth = Math.floor(this.width * 0.6)
    const btnHeight = Math.floor(48 * scale)
    const btnGap = Math.floor(12 * scale)
    const menuStartY = this.height * 0.35

    ctx.fillStyle = '#8b5cf6'
    ctx.font = `bold ${Math.floor(13 * scale)}px sans-serif`
    ctx.fillText('Difficulty', this.width / 2, menuStartY - Math.floor(16 * scale))

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
        iconKind: d.key === 'easy' ? 'heart' : d.key === 'medium' ? 'star' : 'bomb',
        active: isActive,
        fill: 'rgba(255,255,255,0.92)',
        activeFill: d.color,
      })
    })

    const persStartY = menuStartY + 3 * (btnHeight + btnGap) + Math.floor(20 * scale)
    ctx.fillStyle = '#06b6d4'
    ctx.font = `bold ${Math.floor(13 * scale)}px sans-serif`
    ctx.fillText('AI Personality', this.width / 2, persStartY - Math.floor(16 * scale))

    const personalities: { key: AIPersonality; label: string; desc: string; color: string }[] = [
      { key: 'aggressive', label: 'Aggressive', desc: 'Offensive plays', color: '#ef4444' },
      { key: 'defensive', label: 'Defensive', desc: 'Blocks threats', color: '#3b82f6' },
      { key: 'balanced', label: 'Balanced', desc: 'Optimal strategy', color: '#8b5cf6' },
    ]

    const persWidth = Math.floor((this.width - Math.floor(32 * scale)) / 3)
    const persHeight = Math.floor(52 * scale)
    const persGap = Math.floor(6 * scale)

    personalities.forEach((p, i) => {
      const btnX = Math.floor(12 * scale) + i * (persWidth + persGap)
      const btnY = persStartY
      const isActive = this.aiPersonality === p.key
      drawKawaiiPanel(ctx, btnX, btnY, persWidth, persHeight, {
        fill: isActive ? p.color : 'rgba(255,255,255,0.92)',
        accent: isActive ? '#fffaf6' : p.color,
        stroke: '#171717',
        radius: Math.floor(8 * scale),
      })
      ctx.fillStyle = isActive ? '#171717' : '#fff'
      ctx.font = `bold ${Math.floor(11 * scale)}px sans-serif`
      ctx.fillText(p.label, btnX + persWidth / 2, btnY + persHeight / 2 - Math.floor(8 * scale))

      ctx.fillStyle = isActive ? 'rgba(23,23,23,0.75)' : '#64748b'
      ctx.font = `${Math.floor(9 * scale)}px sans-serif`
      ctx.fillText(p.desc, btnX + persWidth / 2, btnY + persHeight / 2 + Math.floor(8 * scale))
    })

    const statsY = persStartY + persHeight + Math.floor(20 * scale)
    ctx.fillStyle = '#64748b'
    ctx.font = `${Math.floor(13 * scale)}px sans-serif`
    ctx.fillText(`W:${this.wins} L:${this.losses} D:${this.draws}`, this.width / 2, statsY)

    const startBtnY = statsY + Math.floor(32 * scale)
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(48 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    const pulse = Math.sin(this.animationTimer * 0.003) * 0.1 + 0.9
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
      fill: '#ede9fe',
      activeFill: '#c4b5fd',
    })
    ctx.restore()
  }

  private renderGame(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    drawKawaiiPanel(ctx, this.width / 2 - 76 * scale, this.boardOffsetY - 52 * scale, 152 * scale, 34 * scale, {
      fill: 'rgba(255,250,246,0.9)',
      accent: '#8b5cf6',
      stroke: '#171717',
      radius: Math.floor(12 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: this.width / 2 - 40 * scale,
      y: this.boardOffsetY - 35 * scale,
      text: `Game ${this.totalGames + 1}`,
      iconKind: 'star',
      color: '#4c1d95',
      fontSize: Math.max(11, Math.floor(12 * scale)),
    })

    let turnText = this.currentPlayer === 'X' ? 'Your Turn (X)' : 'AI Thinking...'
    let turnColor = '#e2e8f0'
    if (this.phase === 'gameover') {
      if (this.winLine.length > 0) {
        if (this.currentPlayer === 'X') { turnText = 'You Win!'; turnColor = '#22c55e' }
        else { turnText = 'AI Wins'; turnColor = '#ef4444' }
      } else {
        turnText = 'Draw!'
        turnColor = '#eab308'
      }
    }
    drawKawaiiInlineLabel(ctx, {
      x: this.width / 2 - 54 * scale,
      y: this.boardOffsetY - Math.floor(10 * scale),
      text: turnText,
      iconKind: this.currentPlayer === 'X' ? 'target' : 'orb',
      color: turnColor,
      fontSize: Math.max(12, Math.floor(13 * scale)),
    })

    const cs = this.cellSize
    const gap = Math.floor(4 * scale)
    const ox = this.boardOffsetX
    const oy = this.boardOffsetY

    drawKawaiiPanel(ctx, ox - Math.floor(10 * scale), oy - Math.floor(10 * scale), cs * 3 + gap * 2 + Math.floor(20 * scale), cs * 3 + gap * 2 + Math.floor(20 * scale), {
      fill: 'rgba(255,250,246,0.18)',
      accent: '#8b5cf6',
      stroke: 'rgba(255,255,255,0.2)',
      radius: Math.floor(18 * scale),
      shadow: 'rgba(15, 23, 42, 0.25)',
    })

    this.powerCards.forEach((card, index) => {
      const chipW = 86 * scale
      const chipH = 28 * scale
      const chipGap = 8 * scale
      const totalW = chipW * this.powerCards.length + chipGap * (this.powerCards.length - 1)
      const chipX = this.width / 2 - totalW / 2 + index * (chipW + chipGap)
      const chipY = oy + cs * 3 + gap * 2 + 10 * scale
      drawKawaiiButton(ctx, {
        x: chipX,
        y: chipY,
        width: chipW,
        height: chipH,
        label: card.name,
        count: card.uses,
        iconKind: canvasIconKindForItem(card.icon),
        enabled: card.uses > 0,
        active: this.selectedPowerCard === card.type,
        fill: 'rgba(255,250,246,0.92)',
        activeFill: '#ddd6fe',
      })
    })

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = ox + c * (cs + gap)
        const cy = oy + r * (cs + gap)
        const isWinCell = this.winLine.some(w => w.r === r && w.c === c)

        const cellDrawn = drawSprite(ctx, 'ttt.cell', {
          x: cx,
          y: cy,
          scale: cs / 96,
          alpha: isWinCell ? 0.6 : 1,
        })
        if (!cellDrawn) {
          ctx.fillStyle = isWinCell ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255,255,255,0.05)'
          ctx.beginPath()
          this.roundRect(ctx, cx, cy, cs, cs, Math.floor(8 * scale))
          ctx.fill()
        }

        const cell = this.board[r]![c]
        if (cell) {
          this.renderCell(ctx, cx, cy, cs, cell, isWinCell)
        }
      }
    }

    if (this.phase === 'gameover') {
      const btnW = Math.floor(this.width * 0.5)
      const btnH = Math.floor(44 * scale)
      const btnY = oy + cs * 3 + gap * 2 + Math.floor(48 * scale)
      const btnX = (this.width - btnW) / 2
      drawKawaiiButton(ctx, {
        x: btnX,
        y: btnY,
        width: btnW,
        height: btnH,
        label: 'Play Again',
        iconKind: 'undo',
        fill: '#ede9fe',
        activeFill: '#c4b5fd',
      })
    }

    this.effects.render(ctx)
  }

  private renderCell(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, cell: Cell, isWin: boolean): void {
    const scale = this.dpr
    const cx = x + size / 2
    const cy = y + size / 2
    const s = size * 0.3
    const pulse = 1 + Math.sin(this.animationTimer * 0.005) * 0.04

    if (cell === 'X') {
      const drawn = drawSprite(ctx, 'ttt.x', {
        x: cx,
        y: cy,
        scale: (size / 96) * (isWin ? pulse : 1),
        alpha: isWin ? 0.85 : 1,
      })
      if (drawn) return

      ctx.strokeStyle = isWin ? '#22c55e' : '#8b5cf6'
      ctx.lineWidth = Math.floor(4 * scale)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx - s, cy - s)
      ctx.lineTo(cx + s, cy + s)
      ctx.moveTo(cx + s, cy - s)
      ctx.lineTo(cx - s, cy + s)
      ctx.stroke()
    } else if (cell === 'O') {
      const drawn = drawSprite(ctx, 'ttt.o', {
        x: cx,
        y: cy,
        scale: (size / 96) * (isWin ? pulse : 1),
        alpha: isWin ? 0.85 : 1,
      })
      if (drawn) return

      ctx.strokeStyle = isWin ? '#ef4444' : '#06b6d4'
      ctx.lineWidth = Math.floor(4 * scale)
      ctx.beginPath()
      ctx.arc(cx, cy, s, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  private handleTap(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.width / rect.width
    const scaleY = this.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    if (this.phase === 'menu') {
      this.handleMenuTap(x, y)
    } else if (this.phase === 'playing' && this.currentPlayer === 'X' && !this.aiThinking) {
      this.handleBoardTap(x, y)
    } else if (this.phase === 'gameover') {
      this.handleGameOverTap(x, y)
    }
  }

  private handleMenuTap(x: number, y: number): void {
    const scale = this.dpr
    const diffItems: Difficulty[] = ['easy', 'medium', 'hard']
    const btnWidth = Math.floor(this.width * 0.6)
    const btnHeight = Math.floor(48 * scale)
    const btnGap = Math.floor(12 * scale)
    const menuStartY = this.height * 0.35

    diffItems.forEach((d, i) => {
      const btnY = menuStartY + i * (btnHeight + btnGap)
      const btnX = (this.width - btnWidth) / 2
      if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
        this.difficulty = d
      }
    })

    const personalities: AIPersonality[] = ['aggressive', 'defensive', 'balanced']
    const persStartY = menuStartY + 3 * (btnHeight + btnGap) + Math.floor(20 * scale)
    const persWidth = Math.floor((this.width - Math.floor(32 * scale)) / 3)
    const persHeight = Math.floor(52 * scale)
    const persGap = Math.floor(6 * scale)

    personalities.forEach((p, i) => {
      const btnX = Math.floor(12 * scale) + i * (persWidth + persGap)
      if (x >= btnX && x <= btnX + persWidth && y >= persStartY && y <= persStartY + persHeight) {
        this.aiPersonality = p
      }
    })

    const statsY = persStartY + persHeight + Math.floor(20 * scale)
    const startBtnY = statsY + Math.floor(32 * scale)
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(48 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    if (x >= startBtnX && x <= startBtnX + startBtnW && y >= startBtnY && y <= startBtnY + startBtnH) {
      this.startNewGame()
    }
  }

  private startNewGame(): void {
    this.resetBoard()
    this.phase = 'playing'
    this.currentPlayer = 'X'
    this.gameOverSent = false
    this.effects.triggerConfetti(25)
  }

  private handleBoardTap(x: number, y: number): void {
    const cs = this.cellSize
    const gap = Math.floor(4 * this.dpr)
    const ox = this.boardOffsetX
    const oy = this.boardOffsetY
    const chipW = 86 * this.dpr
    const chipH = 28 * this.dpr
    const chipGap = 8 * this.dpr
    const totalW = chipW * this.powerCards.length + chipGap * (this.powerCards.length - 1)
    const chipY = oy + cs * 3 + gap * 2 + 10 * this.dpr

    for (let i = 0; i < this.powerCards.length; i++) {
      const card = this.powerCards[i]!
      const chipX = this.width / 2 - totalW / 2 + i * (chipW + chipGap)
      if (x >= chipX && x <= chipX + chipW && y >= chipY && y <= chipY + chipH) {
        if (card.uses > 0) {
          this.selectedPowerCard = this.selectedPowerCard === card.type ? null : card.type
        }
        return
      }
    }

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cellX = ox + c * (cs + gap)
        const cellY = oy + r * (cs + gap)
        if (x >= cellX && x <= cellX + cs && y >= cellY && y <= cellY + cs) {
          if (this.selectedPowerCard === 'swap') {
            if (this.board[r]![c] === 'O') {
              this.board[r]![c] = 'X'
              this.consumePowerCard('swap')
            }
            return
          }
          
          if (this.selectedPowerCard === 'block') {
            if (this.isCellPlayable(r, c)) {
              this.blockedCells.add(`${r},${c}`)
              this.consumePowerCard('block')
            }
            return
          }
          
          if (this.selectedPowerCard === 'undo') {
            this.undoLastMove()
            return
          }
          
          if (this.isCellPlayable(r, c)) {
            this.makeMove(r, c)
          }
        }
      }
    }
  }

  private handleGameOverTap(x: number, y: number): void {
    const scale = this.dpr
    const cs = this.cellSize
    const gap = Math.floor(4 * scale)
    const oy = this.boardOffsetY
    const btnY = oy + cs * 3 + gap * 2 + Math.floor(48 * scale)
    const btnW = Math.floor(this.width * 0.5)
    const btnH = Math.floor(44 * scale)
    const btnX = (this.width - btnW) / 2

    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      this.startNewGame()
    }
  }

  private consumePowerCard(cardType: PowerCard): void {
    const card = this.powerCards.find(c => c.type === cardType)
    if (card && card.uses > 0) {
      card.uses--
    }
    this.selectedPowerCard = null
  }

  private undoLastMove(): void {
    if (this.moveHistory.length === 0) {
      this.consumePowerCard('undo')
      return
    }
    
    const lastMove = this.moveHistory.pop()!
    this.board[lastMove.r]![lastMove.c] = null
    this.consumePowerCard('undo')
  }

  private makeMove(r: number, c: number): void {
    this.board[r]![c] = this.currentPlayer
    this.moveHistory.push({ r, c, player: this.currentPlayer })
    const cellX = this.boardOffsetX + c * (this.cellSize + Math.floor(4 * this.dpr))
    const cellY = this.boardOffsetY + r * (this.cellSize + Math.floor(4 * this.dpr))
    const cx = cellX + this.cellSize / 2
    const cy = cellY + this.cellSize / 2
    this.effects.burst(cx, cy, 5, ['#2196f3'], { min: 0.5, max: 2 })
    const result = this.checkWinner()
    if (result) {
      this.endGame(result)
      return
    }
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'
    if (this.currentPlayer === 'O') {
      this.aiThinking = true
      this.effects.burst(this.width / 2, this.boardOffsetY - 30 * this.dpr, 3, ['#9c27b0'], { min: 0.2, max: 0.5 })
      setTimeout(() => {
        this.aiMove()
        this.aiThinking = false
      }, 300 + Math.random() * 400)
    }
  }

  private aiMove(): void {
    if (this.phase !== 'playing') return
    const move = this.getBestMove()
    if (move) {
      this.board[move.r]![move.c] = 'O'
      this.moveHistory.push({ r: move.r, c: move.c, player: 'O' })
      const result = this.checkWinner()
      if (result) {
        this.endGame(result)
        return
      }
      this.currentPlayer = 'X'
    }
  }

  private getBestMove(): { r: number; c: number } | null {
    const empty: { r: number; c: number }[] = []
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.isCellPlayable(r, c)) empty.push({ r, c })
      }
    }
    if (empty.length === 0) return null

    if (this.difficulty === 'easy' && Math.random() < 0.7) {
      return empty[Math.floor(Math.random() * empty.length)]!
    }
    if (this.difficulty === 'medium' && Math.random() < 0.3) {
      return empty[Math.floor(Math.random() * empty.length)]!
    }
    
    if (this.aiPersonality === 'aggressive') {
      return this.getAggressiveMove(empty)
    } else if (this.aiPersonality === 'defensive') {
      return this.getDefensiveMove(empty)
    }
    
    return this.minimaxMove()
  }

  private getAggressiveMove(empty: { r: number; c: number }[]): { r: number; c: number } {
    for (const pos of empty) {
      this.board[pos.r]![pos.c] = 'O'
      if (this.checkWinnerRaw() === 'O') {
        this.board[pos.r]![pos.c] = null
        return pos
      }
      this.board[pos.r]![pos.c] = null
    }
    return this.minimaxMove()
  }

  private getDefensiveMove(empty: { r: number; c: number }[]): { r: number; c: number } {
    for (const pos of empty) {
      this.board[pos.r]![pos.c] = 'X'
      if (this.checkWinnerRaw() === 'X') {
        this.board[pos.r]![pos.c] = null
        return pos
      }
      this.board[pos.r]![pos.c] = null
    }
    return this.minimaxMove()
  }

  private minimaxMove(): { r: number; c: number } {
    let bestScore = -Infinity
    let bestMove: { r: number; c: number } | null = null
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.isCellPlayable(r, c)) {
          this.board[r]![c] = 'O'
          const score = this.minimax(false, 0)
          this.board[r]![c] = null
          if (score > bestScore) {
            bestScore = score
            bestMove = { r, c }
          }
        }
      }
    }
    return bestMove!
  }

  private minimax(isMaximizing: boolean, depth: number): number {
    const winner = this.checkWinnerRaw()
    if (winner === 'O') return 10 - depth
    if (winner === 'X') return depth - 10
    if (this.isBoardFull()) return 0

    if (isMaximizing) {
      let best = -Infinity
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.isCellPlayable(r, c)) {
            this.board[r]![c] = 'O'
            best = Math.max(best, this.minimax(false, depth + 1))
            this.board[r]![c] = null
          }
        }
      }
      return best
    } else {
      let best = Infinity
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.isCellPlayable(r, c)) {
            this.board[r]![c] = 'X'
            best = Math.min(best, this.minimax(true, depth + 1))
            this.board[r]![c] = null
          }
        }
      }
      return best
    }
  }

  private checkWinnerRaw(): Cell {
    const lines: [number, number][][] = [
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
    ]
    for (const line of lines) {
      const a = line[0] as [number, number]
      const b = line[1] as [number, number]
      const c = line[2] as [number, number]
      const cell = this.board[a[0]]![a[1]]
      if (cell && cell === this.board[b[0]]![b[1]] && cell === this.board[c[0]]![c[1]]) {
        return cell
      }
    }
    return null
  }

  private checkWinner(): { winner: Cell; line: { r: number; c: number }[] } | null {
    const lines = [
      [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],
      [{ r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }],
      [{ r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }],
      [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }],
      [{ r: 0, c: 1 }, { r: 1, c: 1 }, { r: 2, c: 1 }],
      [{ r: 0, c: 2 }, { r: 1, c: 2 }, { r: 2, c: 2 }],
      [{ r: 0, c: 0 }, { r: 1, c: 1 }, { r: 2, c: 2 }],
      [{ r: 0, c: 2 }, { r: 1, c: 1 }, { r: 2, c: 0 }],
    ]
    for (const line of lines) {
      const a = line[0]!
      const b = line[1]!
      const c = line[2]!
      if (this.board[a.r]![a.c] && this.board[a.r]![a.c] === this.board[b.r]![b.c] && this.board[a.r]![a.c] === this.board[c.r]![c.c]) {
        return { winner: this.board[a.r]![a.c]!, line }
      }
    }
    if (this.isBoardFull()) return { winner: null, line: [] }
    return null
  }

  private isBoardFull(): boolean {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (this.isCellPlayable(r, c)) return false
      }
    }
    return true
  }

  private isCellPlayable(r: number, c: number): boolean {
    return !this.board[r]![c] && !this.blockedCells.has(`${r},${c}`)
  }

  private endGame(result: { winner: Cell; line: { r: number; c: number }[] }): void {
    this.phase = 'gameover'
    this.winLine = result.line
    this.totalGames++

    if (result.line.length > 0) {
      for (const cell of result.line) {
        const cellX = this.boardOffsetX + cell.c * (this.cellSize + Math.floor(4 * this.dpr))
        const cellY = this.boardOffsetY + cell.r * (this.cellSize + Math.floor(4 * this.dpr))
        this.effects.burst(cellX + this.cellSize / 2, cellY + this.cellSize / 2, 15, ['#ffd700', '#ff9800'], { min: 2, max: 4 })
      }
    } else {
      this.effects.triggerShake(2, 200)
    }

    if (result.winner === 'X') {
      this.wins++
      this.score = 100 * (this.difficulty === 'hard' ? 3 : this.difficulty === 'medium' ? 2 : 1)
    } else if (result.winner === 'O') {
      this.losses++
      this.score = 10
    } else {
      this.draws++
      this.score = 50
    }

    if (!this.gameOverSent) {
      this.gameOverSent = true
      this.callbacks.onRewardEvent?.({
        schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
        gameId: 'tic-tac-toe',
        emittedAt: new Date().toISOString(),
        score: this.score,
        rewards: createRewardPayload(),
        result: {
          score: this.score,
          kills: this.wins,
          time: Math.floor(this.gameTime / 1000),
          level: this.totalGames + 1,
          coins: 0,
        },
      })
      this.callbacks.onGameOver?.(this.score)
    }
  }

  private pushStats(): void {
    const stats: PlayerStats = {
      hp: this.phase === 'gameover' ? 0 : 1,
      maxHp: 1,
      level: this.totalGames + 1,
      xp: 0,
      xpToNext: 1,
      kills: this.wins,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const hudData: GameHudData = {
      hp: this.phase === 'gameover' ? 0 : 1,
      maxHp: 1,
      level: this.totalGames + 1,
      xp: 0,
      xpToNext: 1,
      kills: this.wins,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
      activeBuffs: [],
      itemSlots: [],
      currency: 0,
    }
    this.callbacks.onHudUpdate?.(hudData)
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
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

export function createTicTacToeGame(): GameInstance {
  const game = new TicTacToeGame()
  const origStart = game.start.bind(game)
  game.start = function(canvas, callbacks) {
    origStart(canvas, callbacks)
    canvas.addEventListener('pointerdown', (e) => {
      (game as unknown as { handleTap: (x: number, y: number) => void }).handleTap(e.clientX, e.clientY)
    })
  }
  return game
}
