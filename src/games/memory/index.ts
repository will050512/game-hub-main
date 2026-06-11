import { GameEngine } from '@/engine/GameEngine'
import { REWARD_EVENT_SCHEMA_VERSION, createRewardPayload, type GameInstance, type PlayerStats, type GameHudData } from '@/types'
import { drawSprite, preloadGameSprites } from '@/engine/sprites/spriteLoader'
import { drawKawaiiButton, drawKawaiiInlineLabel, drawKawaiiPanel } from '@/engine/kawaiiCanvas'
import { computeResponsiveGridLayout } from '@/games/shared/responsiveGridLayout'

interface Card {
  id: number
  symbol: string
  flipped: boolean
  matched: boolean
}

type GamePhase = 'menu' | 'playing' | 'gameover'
type Difficulty = 'easy' | 'medium' | 'hard'

class MemoryGame extends GameEngine {
  private cards: Card[] = []
  private flippedCards: Card[] = []
  private phase: GamePhase = 'menu'
  private difficulty: Difficulty = 'medium'
  private score = 0
  private moves = 0
  private matches = 0
  private totalPairs = 0
  private gameTime = 0
  private gameOverSent = false
  private combo = 0
  private maxCombo = 0
  private lockBoard = false
  private cellSize = 0
  private boardOffsetX = 0
  private boardOffsetY = 0
  private cols = 4
  private rows = 3
  private animationTimer = 0
  private shakeTimer = 0
  private matchedAnim: { cardId: number; timer: number }[] = []
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = []
  private comboMultiplier = 1
  private perfectMatchBonus = 0
  private boardEffectTimer = 0
  private mismatchTimeoutId: ReturnType<typeof setTimeout> | null = null

  private readonly symbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']

  protected init(): void {
    void preloadGameSprites('memory')
    if (this.mismatchTimeoutId !== null) {
      clearTimeout(this.mismatchTimeoutId)
      this.mismatchTimeoutId = null
    }
    this.phase = 'menu'
    this.score = 0
    this.moves = 0
    this.matches = 0
    this.combo = 0
    this.maxCombo = 0
    this.gameTime = 0
    this.gameOverSent = false
    this.cards = []
    this.flippedCards = []
    this.lockBoard = false
    this.animationTimer = 0
    this.shakeTimer = 0
    this.matchedAnim = []
    this.particles = []
    this.comboMultiplier = 1
    this.perfectMatchBonus = 0
    this.boardEffectTimer = 0
    this.pushStats()
  }

  private setupBoard(): void {
    if (this.mismatchTimeoutId !== null) {
      clearTimeout(this.mismatchTimeoutId)
      this.mismatchTimeoutId = null
    }
    if (this.difficulty === 'easy') { this.cols = 4; this.rows = 3; }
    else if (this.difficulty === 'medium') { this.cols = 4; this.rows = 4; }
    else { this.cols = 6; this.rows = 4; }

    this.totalPairs = (this.cols * this.rows) / 2
    const selected = this.symbols.slice(0, this.totalPairs)
    const pairs = [...selected, ...selected]

    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[pairs[i], pairs[j]] = [pairs[j]!, pairs[i]!]
    }

    this.cards = pairs.map((symbol, i) => ({
      id: i,
      symbol,
      flipped: false,
      matched: false,
    }))
  }

  protected update(dt: number): void {
    this.gameTime += dt
    this.animationTimer += dt
    if (this.shakeTimer > 0) this.shakeTimer -= dt
    if (this.boardEffectTimer > 0) this.boardEffectTimer -= dt
    
    for (let i = this.matchedAnim.length - 1; i >= 0; i--) {
      this.matchedAnim[i]!.timer -= dt
      if (this.matchedAnim[i]!.timer <= 0) this.matchedAnim.splice(i, 1)
    }
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!
      p.x += p.vx * (dt / 16.667)
      p.y += p.vy * (dt / 16.667)
      p.life -= dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }
    
    if (this.combo === 0 && this.comboMultiplier > 1) {
      this.comboMultiplier = Math.max(1, this.comboMultiplier - dt / 1000)
    }
    
    this.pushStats()
  }

  protected render(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    const bg = ctx.createLinearGradient(0, 0, 0, this.height)
    bg.addColorStop(0, '#1a0a2e')
    bg.addColorStop(1, '#0f1a2e')
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

    drawKawaiiPanel(ctx, this.width * 0.14, this.height * 0.12, this.width * 0.72, this.height * 0.14, {
      fill: 'rgba(255,250,246,0.9)',
      accent: '#ec4899',
      stroke: '#171717',
      radius: Math.floor(20 * scale),
    })

    ctx.fillStyle = '#fff'
    ctx.font = `bold ${Math.floor(32 * scale)}px sans-serif`
    ctx.fillText('記憶翻牌', this.width / 2, this.height * 0.15)

    ctx.fillStyle = '#94a3b8'
    ctx.font = `${Math.floor(14 * scale)}px sans-serif`
    ctx.fillText('Memory Card Game', this.width / 2, this.height * 0.15 + Math.floor(40 * scale))

    const diffItems: { key: Difficulty; label: string; color: string; desc: string }[] = [
      { key: 'easy', label: 'Easy', color: '#22c55e', desc: '4x3 (6 pairs)' },
      { key: 'medium', label: 'Medium', color: '#eab308', desc: '4x4 (8 pairs)' },
      { key: 'hard', label: 'Hard', color: '#ef4444', desc: '6x4 (12 pairs)' },
    ]

    const btnWidth = Math.floor(this.width * 0.7)
    const btnHeight = Math.floor(52 * scale)
    const btnGap = Math.floor(10 * scale)
    const menuStartY = this.height * 0.35

    diffItems.forEach((d, i) => {
      const btnY = menuStartY + i * (btnHeight + btnGap)
      const btnX = (this.width - btnWidth) / 2
      const isActive = this.difficulty === d.key
      drawKawaiiPanel(ctx, btnX, btnY, btnWidth, btnHeight, {
        fill: isActive ? d.color : 'rgba(255,255,255,0.92)',
        accent: isActive ? '#fffaf6' : d.color,
        stroke: '#171717',
        radius: Math.floor(12 * scale),
      })
      ctx.fillStyle = isActive ? '#171717' : '#fff'
      ctx.font = `bold ${Math.floor(16 * scale)}px sans-serif`
      ctx.fillText(d.label, this.width / 2, btnY + btnHeight / 2 - Math.floor(8 * scale))

      ctx.fillStyle = isActive ? 'rgba(23,23,23,0.65)' : '#64748b'
      ctx.font = `${Math.floor(11 * scale)}px sans-serif`
      ctx.fillText(d.desc, this.width / 2, btnY + btnHeight / 2 + Math.floor(10 * scale))
    })

    const startBtnY = menuStartY + 3 * (btnHeight + btnGap) + Math.floor(24 * scale)
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(52 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    const pulse = Math.sin(this.animationTimer * 0.003) * 0.08 + 0.92
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
      iconKind: 'star',
      fill: '#fce7f3',
      activeFill: '#f9a8d4',
    })
    ctx.restore()
  }

  private renderGame(ctx: CanvasRenderingContext2D): void {
    const scale = this.dpr
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const shake = { x: 0, y: 0 }
    if (this.shakeTimer > 0) {
      shake.x = (Math.random() - 0.5) * Math.floor(8 * scale)
      shake.y = (Math.random() - 0.5) * Math.floor(8 * scale)
    }

    ctx.save()
    ctx.translate(shake.x, shake.y)

    const topBarY = Math.floor(16 * scale)
    drawKawaiiPanel(ctx, this.width / 2 - 96 * scale, topBarY - 12 * scale, 192 * scale, 34 * scale, {
      fill: 'rgba(255,250,246,0.9)',
      accent: '#ec4899',
      stroke: '#171717',
      radius: Math.floor(12 * scale),
    })
    drawKawaiiInlineLabel(ctx, {
      x: this.width / 2 - 78 * scale,
      y: topBarY + 4 * scale,
      text: `Moves ${this.moves} · Pairs ${this.matches}/${this.totalPairs}`,
      iconKind: 'star',
      color: '#831843',
      fontSize: Math.max(11, Math.floor(12 * scale)),
    })

    if (this.combo > 1) {
      const comboColor = this.combo >= 5 ? '#f97316' : this.combo >= 3 ? '#fbbf24' : '#a3e635'
      ctx.fillStyle = comboColor
      ctx.font = `bold ${Math.floor(16 * scale)}px sans-serif`
      const comboText = this.combo >= 5 ? `FIRE x${this.combo}!` : `Combo x${this.combo}!`
      ctx.fillText(comboText, this.width / 2, topBarY + Math.floor(22 * scale))
      
      if (this.comboMultiplier > 1) {
        drawKawaiiInlineLabel(ctx, {
          x: this.width / 2 - 42 * scale,
          y: topBarY + Math.floor(38 * scale),
          text: `${this.comboMultiplier.toFixed(1)}x Score`,
          iconKind: 'spark',
          color: '#8b5cf6',
          fontSize: Math.max(10, Math.floor(10 * scale)),
        })
      }
    }

    const layout = computeResponsiveGridLayout({
      canvasWidth: this.width,
      canvasHeight: this.height,
      rows: this.rows,
      cols: this.cols,
      dpr: scale,
      topReserved: topBarY + Math.floor(52 * scale) + (this.phase === 'gameover' ? Math.floor(20 * scale) : 0),
      bottomReserved: Math.floor(22 * scale),
      minCellSize: Math.floor(34 * scale),
      maxCellSize: Math.floor(86 * scale),
      gap: Math.floor(6 * scale),
      horizontalPadding: Math.floor(16 * scale),
    })
    const gap = layout.gap
    this.cellSize = layout.cellSize
    this.boardOffsetX = layout.boardX
    this.boardOffsetY = layout.boardY

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c
        const card = this.cards[idx]
        if (!card) continue

        const x = this.boardOffsetX + c * (this.cellSize + gap)
        const y = this.boardOffsetY + r * (this.cellSize + gap)
        this.renderCard(ctx, x, y, card)
      }
    }

    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / 500)
      const size = Math.floor(3 * scale + alpha * 2)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = Math.floor(6 * scale)
      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    ctx.restore()

    if (this.phase === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, this.width, this.height)

      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.floor(28 * scale)}px sans-serif`
      ctx.fillText('Complete!', this.width / 2, this.height * 0.35)

      ctx.fillStyle = '#e2e8f0'
      ctx.font = `${Math.floor(16 * scale)}px sans-serif`
      ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height * 0.42)
      ctx.fillText(`Moves: ${this.moves} | Max Combo: ${this.maxCombo}`, this.width / 2, this.height * 0.47)

      const btnW = Math.floor(this.width * 0.5)
      const btnH = Math.floor(44 * scale)
      const btnY = this.height * 0.55
      const btnX = (this.width - btnW) / 2
      ctx.fillStyle = '#ec4899'
      ctx.beginPath()
      this.roundRect(ctx, btnX, btnY, btnW, btnH, Math.floor(12 * scale))
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.floor(15 * scale)}px sans-serif`
      ctx.fillText('Play Again', this.width / 2, btnY + btnH / 2)
    }
  }

  private renderCard(ctx: CanvasRenderingContext2D, x: number, y: number, card: Card): void {
    const scale = this.dpr
    const cs = this.cellSize
    const isMatched = this.matchedAnim.some(a => a.cardId === card.id)
    const cardCenterX = x + cs / 2
    const cardCenterY = y + cs / 2
    const cardScale = cs / 80

    if (card.matched || card.flipped) {
      const faceDrawn = drawSprite(ctx, 'memory.card-face', {
        x,
        y,
        scaleX: cardScale,
        scaleY: cardScale,
        alpha: card.matched ? 0.7 : 1,
      })
      if (!faceDrawn) {
        drawKawaiiPanel(ctx, x, y, cs, cs, {
          fill: card.matched ? 'rgba(220,252,231,0.9)' : 'rgba(255,255,255,0.12)',
          accent: card.matched ? '#22c55e' : '#ec4899',
          stroke: '#171717',
          radius: Math.floor(8 * scale),
        })
      }

      if (card.matched || isMatched) {
        const glowAlpha = isMatched ? 0.9 : 0.7
        ctx.strokeStyle = `rgba(34,197,94,${glowAlpha})`
        ctx.lineWidth = Math.floor((isMatched ? 3 : 2) * scale)
        ctx.beginPath()
        this.roundRect(ctx, x, y, cs, cs, Math.floor(8 * scale))
        ctx.stroke()
      }

      drawKawaiiInlineLabel(ctx, {
        x: cardCenterX - Math.floor(cs * 0.16),
        y: cardCenterY,
        text: card.symbol,
        iconKind: card.matched ? 'heart' : 'star',
        color: card.matched ? '#166534' : '#fff',
        fontSize: Math.floor(cs * 0.28),
      })
    } else {
      const backDrawn = drawSprite(ctx, 'memory.card-back', {
        x,
        y,
        scaleX: cardScale,
        scaleY: cardScale,
        alpha: 0.95,
      })
      if (!backDrawn) {
        drawKawaiiPanel(ctx, x, y, cs, cs, {
          fill: '#ede9fe',
          accent: '#8b5cf6',
          stroke: '#171717',
          radius: Math.floor(8 * scale),
        })
      }
    }
  }

  private handleTap(clientX: number, clientY: number): void {
    const rect = this.canvas.getBoundingClientRect()
    const x = (clientX - rect.left) * this.width / rect.width
    const y = (clientY - rect.top) * this.height / rect.height

    if (this.phase === 'menu') {
      this.handleMenuTap(x, y)
    } else if (this.phase === 'playing' && !this.lockBoard) {
      this.handleBoardTap(x, y)
    } else if (this.phase === 'gameover') {
      this.handleGameOverTap(x, y)
    }
  }

  private handleMenuTap(x: number, y: number): void {
    const scale = this.dpr
    const diffItems: Difficulty[] = ['easy', 'medium', 'hard']
    const btnWidth = Math.floor(this.width * 0.7)
    const btnHeight = Math.floor(52 * scale)
    const btnGap = Math.floor(10 * scale)
    const menuStartY = this.height * 0.35

    diffItems.forEach((d, i) => {
      const btnY = menuStartY + i * (btnHeight + btnGap)
      const btnX = (this.width - btnWidth) / 2
      if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
        this.difficulty = d
      }
    })

    const startBtnY = menuStartY + 3 * (btnHeight + btnGap) + Math.floor(24 * scale)
    const startBtnW = Math.floor(this.width * 0.5)
    const startBtnH = Math.floor(52 * scale)
    const startBtnX = (this.width - startBtnW) / 2

    if (x >= startBtnX && x <= startBtnX + startBtnW && y >= startBtnY && y <= startBtnY + startBtnH) {
      this.setupBoard()
      this.phase = 'playing'
      this.moves = 0
      this.matches = 0
      this.combo = 0
      this.maxCombo = 0
      this.gameTime = 0
      this.gameOverSent = false
      this.flippedCards = []
      this.lockBoard = false
    }
  }

  private handleBoardTap(x: number, y: number): void {
    const gap = Math.floor(6 * this.dpr)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c
        const card = this.cards[idx]
        if (!card) continue
        const cx = this.boardOffsetX + c * (this.cellSize + gap)
        const cy = this.boardOffsetY + r * (this.cellSize + gap)
        if (x >= cx && x <= cx + this.cellSize && y >= cy && y <= cy + this.cellSize) {
          if (!card.flipped && !card.matched && this.flippedCards.length < 2) {
            card.flipped = true
            this.flippedCards.push(card)
            if (this.flippedCards.length === 2) {
              this.moves++
              this.checkMatch()
            }
          }
        }
      }
    }
  }

  private checkMatch(): void {
    this.lockBoard = true
    const [a, b] = this.flippedCards
    if (a!.symbol === b!.symbol) {
      a!.matched = true
      b!.matched = true
      this.combo++
      if (this.combo > this.maxCombo) this.maxCombo = this.combo
      this.matches++
      
      this.comboMultiplier = Math.min(3, 1 + this.combo * 0.2)
      const baseScore = 100
      const comboBonus = Math.floor(baseScore * this.comboMultiplier * this.combo)
      this.score += comboBonus
      
      this.createMatchParticles(a!.id)
      this.createMatchParticles(b!.id)
      
      this.matchedAnim.push({ cardId: a!.id, timer: 500 })
      this.matchedAnim.push({ cardId: b!.id, timer: 500 })
      this.flippedCards = []
      this.lockBoard = false
      
      this.boardEffectTimer = 200

      if (this.matches >= this.totalPairs) {
        const perfectBonus = this.moves === this.totalPairs ? 500 : 0
        this.score += perfectBonus
        this.perfectMatchBonus = perfectBonus
        this.phase = 'gameover'
        if (!this.gameOverSent) {
          this.gameOverSent = true
          this.callbacks.onRewardEvent?.({
            schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
            gameId: 'memory',
            emittedAt: new Date().toISOString(),
            score: this.score,
            rewards: createRewardPayload(),
            result: {
              score: this.score,
              kills: this.matches,
              time: Math.floor(this.gameTime / 1000),
              level: this.matches + 1,
              coins: 0,
            },
          })
          this.callbacks.onGameOver?.(this.score)
        }
      }
    } else {
      this.combo = 0
      this.comboMultiplier = 1
      this.shakeTimer = 300
      this.mismatchTimeoutId = setTimeout(() => {
        a!.flipped = false
        b!.flipped = false
        this.flippedCards = []
        this.lockBoard = false
        this.mismatchTimeoutId = null
      }, 800)
    }
  }

  private createMatchParticles(cardId: number): void {
    const scale = this.dpr
    const card = this.cards.find(c => c.id === cardId)
    if (!card) return
    
    const gap = Math.floor(6 * scale)
    const row = Math.floor(cardId / this.cols)
    const col = cardId % this.cols
    const x = this.boardOffsetX + col * (this.cellSize + gap) + this.cellSize / 2
    const y = this.boardOffsetY + row * (this.cellSize + gap) + this.cellSize / 2
    
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12
      const speed = 2 + Math.random() * 2
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 400 + Math.random() * 200,
        color: colors[i % colors.length]!,
      })
    }
  }

  private handleGameOverTap(x: number, y: number): void {
    const scale = this.dpr
    const btnW = Math.floor(this.width * 0.5)
    const btnH = Math.floor(44 * scale)
    const btnY = this.height * 0.55
    const btnX = (this.width - btnW) / 2
    if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
      this.setupBoard()
      this.phase = 'playing'
      this.moves = 0
      this.matches = 0
      this.combo = 0
      this.maxCombo = 0
      this.gameTime = 0
      this.gameOverSent = false
      this.flippedCards = []
      this.lockBoard = false
    }
  }

  private pushStats(): void {
    const stats: PlayerStats = {
      hp: this.matches,
      maxHp: this.totalPairs,
      level: this.matches + 1,
      xp: this.matches,
      xpToNext: this.totalPairs,
      kills: this.matches,
      time: Math.floor(this.gameTime / 1000),
      score: this.score,
    }
    this.callbacks.onStatsUpdate?.(stats)
    this.pushHud()
  }

  private pushHud(): void {
    const hudData: GameHudData = {
      hp: this.matches,
      maxHp: this.totalPairs,
      level: this.matches + 1,
      xp: this.matches,
      xpToNext: this.totalPairs,
      kills: this.matches,
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

export function createMemoryGame(): GameInstance {
  const game = new MemoryGame()
  const origStart = game.start.bind(game)
  game.start = function(canvas, callbacks) {
    origStart(canvas, callbacks)
    canvas.addEventListener('pointerdown', (e) => {
      (game as unknown as { handleTap: (x: number, y: number) => void }).handleTap(e.clientX, e.clientY)
    })
  }
  return game
}
