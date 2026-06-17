import {
  drawKawaiiInlineLabel,
  drawKawaiiItem,
  canvasIconKindForItem,
  type CanvasIconKind,
} from './kawaiiCanvas'

export interface HudConfig {
  score: number
  level: number
  lives: number
  maxLives: number
  time: number
  gameColor: string
  dpr: number
  width: number
  height: number
}

/**
 * Standardized HUD renderer for all games.
 * Draws score (top right), level (top center), lives/hearts (top left), and timer (top right below score).
 */
export function renderGameHud(ctx: CanvasRenderingContext2D, config: HudConfig): void {
  const { score, level, lives, maxLives, time, gameColor, dpr, width, height } = config
  const fontSize = 18 * dpr
  const hudY = height * 0.06
  const hMargin = width * 0.04

  // Hearts (top left, 5% from left edge)
  for (let i = 0; i < maxLives; i++) {
    ctx.globalAlpha = i < lives ? 1 : 0.25
    drawKawaiiItem(ctx, hMargin + i * 24 * dpr, hudY + 6 * dpr, 16 * dpr, 'heart')
  }
  ctx.globalAlpha = 1

  // Level (top center, within safe area)
  drawKawaiiInlineLabel(ctx, {
    x: width / 2, y: hudY,
    text: `Lv.${level}`,
    color: '#f8fafc',
    fontSize,
    align: 'center',
  })

  // Score (top right, 5% from right edge)
  drawKawaiiInlineLabel(ctx, {
    x: width - hMargin, y: hudY,
    text: `${score}`,
    iconKind: 'star',
    color: gameColor,
    fontSize,
    align: 'right',
  })

  // Timer (top right below score, 5% from right edge)
  const timeStr = `${formatTime(time)}`
  drawKawaiiInlineLabel(ctx, {
    x: width - hMargin, y: hudY + 18 * dpr,
    text: timeStr,
    iconKind: 'timer',
    color: 'rgba(248, 250, 252, 0.65)',
    fontSize: 14 * dpr,
    align: 'right',
  })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
