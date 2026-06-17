import { getGameTheme, type GameTheme, type GameUiTokens } from './presets/KawaiiPresets'
import type { GameId } from '@/types'

export type { GameTheme, GameUiTokens }

export function getTheme(gameId: GameId): GameTheme {
  return getGameTheme(gameId)
}

/* ── RoundRect polyfill (for browsers that don't support it yet) ── */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (
    x: number, y: number, w: number, h: number, radii: number | DOMPointInit[],
  ) {
    const r = typeof radii === 'number' ? radii : 0
    this.rect(x, y, w, h)
    return this
  }
}

/* ── Shared Canvas rendering helpers ── */

export interface KawaiiPanelOpts {
  fill?: string
  stroke?: string
  radius?: number
  accent?: string
  borderWidth?: number
}

export function drawKawaiiPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opts: KawaiiPanelOpts = {},
): void {
  const r = opts.radius ?? 6
  ctx.save()
  ctx.fillStyle = opts.fill ?? 'rgba(30,20,50,0.85)'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
  if (opts.stroke) {
    ctx.strokeStyle = opts.stroke
    ctx.lineWidth = opts.borderWidth ?? 1.5
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    ctx.stroke()
  }
  if (opts.accent) {
    ctx.fillStyle = opts.accent
    ctx.beginPath()
    ctx.roundRect(x, y + 4, 3, h - 8, 1.5)
    ctx.fill()
  }
  ctx.restore()
}

export interface KawaiiProgressOpts {
  fill?: string
  trackFill?: string
  radius?: number
}

export function drawKawaiiProgress(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  ratio: number,
  opts: KawaiiProgressOpts = {},
): void {
  const r = opts.radius ?? (h / 2)
  const clamped = Math.max(0, Math.min(1, ratio))
  ctx.save()
  ctx.fillStyle = opts.trackFill ?? 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
  ctx.fillStyle = opts.fill ?? '#ef4444'
  ctx.beginPath()
  ctx.roundRect(x, y, w * clamped, h, r)
  ctx.fill()
  ctx.restore()
}

export interface KawaiiTextOpts {
  color?: string
  size?: number
  weight?: number
  align?: CanvasTextAlign
  shadowColor?: string
  shadowBlur?: number
}

export function drawKawaiiText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  opts: KawaiiTextOpts = {},
): void {
  ctx.save()
  ctx.font = `${opts.weight ?? 700} ${opts.size ?? 16}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", "Nunito", sans-serif`
  ctx.textAlign = opts.align ?? 'left'
  ctx.textBaseline = 'middle'
  if (opts.shadowColor) {
    ctx.shadowColor = opts.shadowColor
    ctx.shadowBlur = opts.shadowBlur ?? 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
  ctx.fillStyle = opts.color ?? '#ffffff'
  ctx.fillText(text, x, y)
  ctx.restore()
}
