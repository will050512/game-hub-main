import type { GamePhase } from './GameStateMachine'
import {
  drawKawaiiPanel,
  drawKawaiiInlineLabel,
  drawKawaiiProgressBar,
  canvasIconKindForItem,
  type CanvasIconKind,
} from './kawaiiCanvas'

const SAFE_MARGIN_PCT = 0.05

function clampSafeY(y: number, height: number): number {
  return Math.min(y, height * (1 - SAFE_MARGIN_PCT))
}

export interface GameOverlayConfig {
  state: GamePhase
  score: number
  highScore?: number
  level: number
  lives: number
  maxLives: number
  gameTime: number
  kills?: number
  coins?: number
  gameName: string
  gameColor: string
  introProgress: number
  dpr: number
  phaseMessage?: string
}

/**
 * Unified overlay renderer for game states: menu, intro (countdown), gameover.
 * Draws on top of the game canvas.
 */
export class GameOverlay {
  width = 0
  height = 0
  private _scoreDisplay = 0

  setSize(w: number, h: number): void {
    this.width = w
    this.height = h
  }

  render(ctx: CanvasRenderingContext2D | null, config: GameOverlayConfig): void {
    if (!ctx) return

    ctx.save()

    switch (config.state) {
      case 'menu':
        this.renderMenu(ctx, config)
        break
      case 'intro':
        this.renderIntro(ctx, config)
        break
      case 'gameover':
        this.renderGameOver(ctx, config)
        break
    }

    ctx.restore()
  }

  private renderMenu(ctx: CanvasRenderingContext2D, config: GameOverlayConfig): void {
    const { width, height } = this
    const dpr = config.dpr

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Title with elastic scale
    const titleScale = 1 + Math.sin(config.introProgress * Math.PI * 3) * 0.05
    ctx.save()
    ctx.translate(width / 2, height * 0.4)
    ctx.scale(titleScale, titleScale)
    ctx.fillStyle = '#f8fafc'
    ctx.font = `bold ${28 * dpr}px "Noto Sans KR", sans-serif`
    ctx.fillText(config.gameName, 0, 0)
    ctx.restore()

    // "開始遊戲" button
    const btnW = width * 0.4
    const btnH = Math.max(36, height * 0.05)
    const btnX = width / 2 - btnW / 2
    const btnY = height * 0.55
    drawKawaiiButton(ctx, {
      x: btnX, y: btnY, width: btnW, height: btnH,
      label: config.gameName,
      iconKind: 'target',
      fill: 'rgba(15, 23, 42, 0.7)',
      activeFill: config.gameColor,
    })

    // High score display — clamp to safe area bottom
    if (config.highScore && config.highScore > 0) {
      const safeBottom = height * 0.85
      drawKawaiiInlineLabel(ctx, {
        x: width / 2,
        y: clampSafeY(height * 0.68, safeBottom),
        text: `最高分 ${config.highScore}`,
        iconKind: 'star',
        color: config.gameColor,
        fontSize: 12 * dpr,
        align: 'center',
      })
    }
  }

  private renderIntro(ctx: CanvasRenderingContext2D, config: GameOverlayConfig): void {
    const { width, height } = this
    const dpr = config.dpr
    const progress = config.introProgress

    // Dark overlay with pulse
    const pulseAlpha = 0.45 + Math.sin(progress * Math.PI * 2) * 0.1
    ctx.fillStyle = `rgba(0, 0, 0, ${pulseAlpha})`
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const phase = Math.min(3, Math.floor(progress * 4))
    const phaseProgress = (progress * 4) % 1

    // Clamp intro text to safe area bounds
    const introSafeYTop = height * SAFE_MARGIN_PCT
    const introSafeYBottom = height * (1 - SAFE_MARGIN_PCT)

    if (phase < 3) {
      // Countdown numbers: 3, 2, 1
      const numbers = ['3', '2', '1']
      const num = numbers[phase] ?? 'GO!'
      const scale = 1 + (1 - phaseProgress) * 0.5
      const alpha = phaseProgress < 0.1 ? phaseProgress * 10 : 1

      ctx.save()
      ctx.translate(width / 2, clampSafeY(height * 0.42, introSafeYBottom))
      ctx.scale(scale, scale)
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#f8fafc'
      ctx.shadowColor = config.gameColor
      ctx.shadowBlur = 20 * dpr
      ctx.font = `bold ${48 * dpr}px "Noto Sans KR", sans-serif`
      ctx.fillText(num, 0, 0)
      ctx.restore()
    } else {
      // "GO!" with extra animation
      const goScale = Math.min(1, phaseProgress * 3)
      const goAlpha = phaseProgress < 0.7 ? 1 : 1 - ((phaseProgress - 0.7) / 0.3)

      ctx.save()
      ctx.translate(width / 2, clampSafeY(height * 0.42, introSafeYBottom))
      ctx.scale(goScale * 1.5, goScale * 1.5)
      ctx.globalAlpha = goAlpha
      ctx.fillStyle = '#facc15'
      ctx.shadowColor = '#facc15'
      ctx.shadowBlur = 30 * dpr
      ctx.font = `bold ${64 * dpr}px "Noto Sans KR", sans-serif`
      ctx.fillText('GO!', 0, 0)
      ctx.restore()
    }
  }

  private renderGameOver(ctx: CanvasRenderingContext2D, config: GameOverlayConfig): void {
    const { width, height } = this
    const dpr = config.dpr

    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.58)'
    ctx.fillRect(0, 0, width, height)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const centerY = clampSafeY(height * 0.42, height * 0.85)

    // Title
    drawKawaiiInlineLabel(ctx, {
      x: width / 2,
      y: centerY - 48 * dpr,
      text: '遊戲結束',
      iconKind: 'target',
      color: config.gameColor,
      fontSize: 24 * dpr,
      align: 'center',
    })

    // Score panel — adaptive height to fit safe area
    const panelW = Math.min(width * 0.7, 280 * dpr)
    const panelH = Math.max(120, 120 * dpr)
    const panelX = width / 2 - panelW / 2
    const panelY = centerY - 20 * dpr

    // Clamp panel height so stats row + hint stay within safe area
    const safeBottom = height * 0.92
    const hintOffset = 76 * dpr // stats row height + hint gap
    const panelHToUse = Math.max(80, Math.min(panelH, safeBottom - panelY - hintOffset))

    drawKawaiiPanel(ctx, panelX, panelY, panelW, panelHToUse, {
      fill: 'rgba(15, 23, 42, 0.85)',
      accent: config.gameColor,
      radius: 16 * dpr,
    })

    // Score display
    const scoreSize = 36 * dpr
    ctx.fillStyle = '#f8fafc'
    ctx.font = `900 ${scoreSize}px "Noto Sans KR", sans-serif`
    ctx.fillText(`${config.score}`, width / 2, panelY + panelHToUse * 0.35)

    drawKawaiiInlineLabel(ctx, {
      x: width / 2,
      y: panelY + panelHToUse * 0.65,
      text: '最終得分',
      iconKind: 'star',
      color: config.gameColor,
      fontSize: 11 * dpr,
      align: 'center',
    })

    // Stats row
    const statsY = panelY + panelHToUse + 16 * dpr
    const stats = [
      config.kills ? { icon: 'target' as CanvasIconKind, text: `${config.kills} 擊敗` } : null,
      { icon: 'timer' as CanvasIconKind, text: `${this.formatTime(config.gameTime)}` },
      { icon: 'star' as CanvasIconKind, text: `Lv.${config.level}` },
    ].filter(Boolean)

    if (stats.length > 0) {
      const totalW = stats.length * 60 * dpr + (stats.length - 1) * 12 * dpr
      const startX = width / 2 - totalW / 2
      stats.forEach((s, i) => {
        if (!s) return
        drawKawaiiInlineLabel(ctx, {
          x: startX + i * (60 * dpr + 12 * dpr) + 30 * dpr,
          y: statsY,
          text: s.text,
          iconKind: s.icon,
          color: '#cbd5e1',
          fontSize: 10 * dpr,
          align: 'center',
        })
      })
    }

    // "再玩一次" hint
    const hintY = panelY + panelHToUse + 60 * dpr
    const clampedHintY = clampSafeY(hintY, safeBottom)
    const pulseScale = 1 + Math.sin(Date.now() * 0.004) * 0.05
    ctx.save()
    ctx.translate(width / 2, clampedHintY)
    ctx.scale(pulseScale, pulseScale)
    drawKawaiiInlineLabel(ctx, {
      x: 0, y: 0,
      text: '按 R 重新開始',
      iconKind: 'undo',
      color: '#94a3b8',
      fontSize: 11 * dpr,
      align: 'center',
    })
    ctx.restore()
  }

  private formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }
}

/**
 * Draws a kawaii-styled button directly on the canvas.
 * This is a convenience wrapper around drawKawaiiButton for overlay use.
 */
function drawKawaiiButton(
  ctx: CanvasRenderingContext2D,
  options: { x: number; y: number; width: number; height: number; label: string; iconKind?: CanvasIconKind; fill?: string; activeFill?: string }
): void {
  drawKawaiiPanel(ctx, options.x, options.y, options.width, options.height, {
    fill: options.fill ?? 'rgba(6, 182, 212, 0.15)',
    accent: options.activeFill ?? '#06b6d4',
    radius: options.height * 0.3,
  })

  drawKawaiiInlineLabel(ctx, {
    x: options.x + options.width / 2,
    y: options.y + options.height / 2,
    text: options.label,
    iconKind: options.iconKind,
    color: '#e2e8f0',
    fontSize: Math.max(12, Math.floor(options.height * 0.35)),
    align: 'center',
  })
}
