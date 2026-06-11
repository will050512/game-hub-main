/**
 * KawaiiRenderer — Procedural canvas drawing primitives for kawaii-style entities.
 * Provides reusable face/eyes/blush/mouth drawing on canvas contexts.
 */

import type { GameId } from '@/types'
import { getGameArt } from './GameArtRegistry'

// --- Types ---

export type EyeEmotion =
  | 'normal'
  | 'happy'
  | 'angry'
  | 'surprised'
  | 'sleepy'
  | 'determined'
  | 'wink'
  | 'hearts'

export type MouthStyle = 'smile' | 'frown' | 'gasp' | 'grin' | 'tongue' | 'flat'

export type BodyShape = 'circle' | 'rect' | 'star' | 'heart' | 'shield' | 'arrow' | 'diamond' | 'pentagon'

export interface KawaiiFaceOptions {
  emotion?: EyeEmotion
  mouth?: MouthStyle
  blush?: boolean
  outline?: boolean
  outlineColor?: string
  outlineWidth?: number
  scale?: number
  /** Whether to draw eye highlights (white dots in eyes) */
  highlights?: boolean
}

export interface DrawEntityOptions {
  x: number
  y: number
  size: number
  color: string
  outlineColor?: string
  outlineWidth?: number
  options?: KawaiiFaceOptions
  rotation?: number
  glowColor?: string
  glowBlur?: number
  bodyShape?: 'circle' | 'rect' | 'star'
}

// --- Utility Functions ---

function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 7), 16)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function darkenColor(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x + radius, y)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number): void {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / points
    const radius = i % 2 === 0 ? outerR : innerR
    const px = cx + Math.cos(angle) * radius
    const py = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

// --- Core Drawing Functions ---

/**
 * Draw a kawaii circle entity with face, eyes, blush.
 * This is the main drawing function for round characters (balls, blobs, etc.)
 */
export function drawKawaiiCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  options: KawaiiFaceOptions = {},
): void {
  const { emotion = 'normal', mouth = 'flat', blush = false, outline = true, outlineColor, outlineWidth = 2, scale = 1, highlights = true } = options

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  // Body gradient (3D sphere effect)
  const bodyGrad = ctx.createRadialGradient(-radius * 0.3, -radius * 0.3, radius * 0.1, 0, 0, radius)
  bodyGrad.addColorStop(0, lightenColor(color, 60))
  bodyGrad.addColorStop(0.5, color)
  bodyGrad.addColorStop(1, darkenColor(color, 30))
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, Math.PI * 2)
  ctx.fill()

  // Outline
  if (outline) {
    ctx.strokeStyle = outlineColor || darkenColor(color, 40)
    ctx.lineWidth = outlineWidth
    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Specular highlight
  const hlGrad = ctx.createRadialGradient(-radius * 0.25, -radius * 0.35, 0, -radius * 0.25, -radius * 0.35, radius * 0.35)
  hlGrad.addColorStop(0, 'rgba(255,255,255,0.7)')
  hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.15)')
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hlGrad
  ctx.beginPath()
  ctx.arc(-radius * 0.25, -radius * 0.35, radius * 0.35, 0, Math.PI * 2)
  ctx.fill()

  // Bottom shadow
  const shadowGrad = ctx.createRadialGradient(radius * 0.15, radius * 0.3, 0, radius * 0.15, radius * 0.3, radius * 0.5)
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.25)')
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shadowGrad
  ctx.beginPath()
  ctx.arc(radius * 0.15, radius * 0.3, radius * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Eyes
  drawKawaiiEyes(ctx, 0, 0, radius, emotion, { highlights })

  // Blush
  if (blush) {
    drawKawaiiBlush(ctx, 0, 0, radius)
  }

  // Mouth
  if (mouth !== 'flat') {
    drawKawaiiMouth(ctx, 0, 0, radius, mouth)
  }

  ctx.restore()
}

/**
 * Draw a kawaii rect/box entity.
 */
export function drawKawaiiRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  options: KawaiiFaceOptions = {},
): void {
  const { emotion = 'normal', mouth = 'flat', blush = false, outline = true, outlineColor, outlineWidth = 2, scale = 1 } = options
  const halfW = width / 2
  const halfH = height / 2

  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  // Body gradient
  const bodyGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH)
  bodyGrad.addColorStop(0, lightenColor(color, 30))
  bodyGrad.addColorStop(0.5, color)
  bodyGrad.addColorStop(1, darkenColor(color, 20))
  ctx.fillStyle = bodyGrad
  roundedRectPath(ctx, -halfW, -halfH, width, height, Math.min(width, height) * 0.15)
  ctx.fill()

  // Outline
  if (outline) {
    ctx.strokeStyle = outlineColor || darkenColor(color, 30)
    ctx.lineWidth = outlineWidth
    roundedRectPath(ctx, -halfW, -halfH, width, height, Math.min(width, height) * 0.15)
    ctx.stroke()
  }

  // Top highlight
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  roundedRectPath(ctx, -halfW * 0.8, -halfH + height * 0.05, width * 0.8, height * 0.15, Math.min(width, height) * 0.08)
  ctx.fill()

  // Eyes (centered horizontally, upper half)
  drawKawaiiEyes(ctx, 0, -height * 0.1, Math.min(width, height) * 0.4, emotion, { highlights: true })

  // Blush
  if (blush) {
    const eyeSize = Math.min(width, height) * 0.08
    ctx.fillStyle = 'rgba(248, 180, 212, 0.3)'
    ctx.beginPath()
    ctx.ellipse(-width * 0.25, height * 0.0, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(width * 0.25, height * 0.0, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Mouth
  if (mouth !== 'flat') {
    drawKawaiiMouth(ctx, 0, height * 0.1, Math.min(width, height) * 0.4, mouth)
  }

  ctx.restore()
}

/**
 * Draw eyes based on emotion type.
 * Core function used by all kawaii entity types.
 */
export function drawKawaiiEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faceSize: number,
  emotion: EyeEmotion,
  options: { highlights?: boolean } = {},
): void {
  const { highlights = true } = options
  const eyeSize = Math.max(2, faceSize * 0.14)
  const eyeSpacing = Math.max(4, faceSize * 0.22)
  const eyeY = y - faceSize * 0.12

  ctx.fillStyle = '#1d161b'
  ctx.lineCap = 'round'

  switch (emotion) {
    case 'normal':
      // Round eyes with white highlights
      ctx.beginPath(); ctx.arc(x - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(x + eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2); ctx.fill()
      if (highlights) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(x - eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.35, eyeSize * 0.35, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(x + eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.35, eyeSize * 0.35, 0, Math.PI * 2); ctx.fill()
      }
      break

    case 'happy':
      // Curved "happy" eyes (inverted U arcs)
      ctx.strokeStyle = '#1d161b'
      ctx.lineWidth = eyeSize * 0.6
      ctx.beginPath(); ctx.arc(x - eyeSpacing, eyeY + eyeSize * 0.2, eyeSize * 0.8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
      ctx.beginPath(); ctx.arc(x + eyeSpacing, eyeY + eyeSize * 0.2, eyeSize * 0.8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke()
      break

    case 'angry':
      // Slanted, narrowed eyes
      ctx.save()
      ctx.translate(x - eyeSpacing, eyeY)
      ctx.rotate(-0.25)
      ctx.beginPath(); ctx.ellipse(0, 0, eyeSize * 1.2, eyeSize * 0.7, 0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.save()
      ctx.translate(x + eyeSpacing, eyeY)
      ctx.rotate(0.25)
      ctx.beginPath(); ctx.ellipse(0, 0, eyeSize * 1.2, eyeSize * 0.7, 0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      // Eyebrows
      ctx.strokeStyle = '#1d161b'
      ctx.lineWidth = Math.max(2, faceSize * 0.05)
      ctx.beginPath()
      ctx.moveTo(x - eyeSpacing - eyeSize, eyeY - eyeSize * 1.5)
      ctx.lineTo(x - eyeSpacing + eyeSize * 0.5, eyeY - eyeSize * 1.2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + eyeSpacing + eyeSize, eyeY - eyeSize * 1.5)
      ctx.lineTo(x + eyeSpacing - eyeSize * 0.5, eyeY - eyeSize * 1.2)
      ctx.stroke()
      break

    case 'surprised':
      // Wide oval eyes
      ctx.fillStyle = '#1d161b'
      ctx.beginPath(); ctx.ellipse(x - eyeSpacing, eyeY, eyeSize * 0.5, eyeSize * 1.4, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(x + eyeSpacing, eyeY, eyeSize * 0.5, eyeSize * 1.4, 0, 0, Math.PI * 2); ctx.fill()
      if (highlights) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(x - eyeSpacing, eyeY - eyeSize * 0.5, eyeSize * 0.25, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(x + eyeSpacing, eyeY - eyeSize * 0.5, eyeSize * 0.25, 0, Math.PI * 2); ctx.fill()
      }
      break

    case 'sleepy':
      // Closed/lowered eyelid arcs
      ctx.strokeStyle = '#1d161b'
      ctx.lineWidth = Math.max(2, eyeSize * 0.5)
      ctx.beginPath(); ctx.arc(x - eyeSpacing, eyeY, eyeSize * 0.8, 0, Math.PI); ctx.stroke()
      ctx.beginPath(); ctx.arc(x + eyeSpacing, eyeY, eyeSize * 0.8, 0, Math.PI); ctx.stroke()
      break

    case 'determined':
      // Narrow, focused eyes (oval horizontal)
      ctx.fillStyle = '#1d161b'
      ctx.beginPath(); ctx.ellipse(x - eyeSpacing, eyeY, eyeSize * 1.3, eyeSize * 0.6, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(x + eyeSpacing, eyeY, eyeSize * 1.3, eyeSize * 0.6, 0, 0, Math.PI * 2); ctx.fill()
      if (highlights) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(x - eyeSpacing + eyeSize * 0.4, eyeY - eyeSize * 0.2, eyeSize * 0.3, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(x + eyeSpacing + eyeSize * 0.4, eyeY - eyeSize * 0.2, eyeSize * 0.3, 0, Math.PI * 2); ctx.fill()
      }
      break

    case 'wink':
      // Left eye open, right eye closed
      ctx.beginPath(); ctx.arc(x - eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2); ctx.fill()
      if (highlights) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath(); ctx.arc(x - eyeSpacing + eyeSize * 0.3, eyeY - eyeSize * 0.35, eyeSize * 0.35, 0, Math.PI * 2); ctx.fill()
      }
      ctx.strokeStyle = '#1d161b'
      ctx.lineWidth = Math.max(2, eyeSize * 0.5)
      ctx.beginPath(); ctx.arc(x + eyeSpacing, eyeY, eyeSize * 0.8, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke()
      break

    case 'hearts':
      // Heart-shaped eyes
      ctx.fillStyle = '#f43f5e'
      drawHeart(ctx, x - eyeSpacing, eyeY, eyeSize * 1.2)
      drawHeart(ctx, x + eyeSpacing, eyeY, eyeSize * 1.2)
      break
  }
}

/**
 * Draw a kawaii blush (pink cheek circles).
 */
export function drawKawaiiBlush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faceSize: number,
  intensity: number = 0.3,
): void {
  const blushSize = faceSize * 0.1
  ctx.fillStyle = `rgba(248, 180, 212, ${intensity})`
  ctx.beginPath()
  ctx.ellipse(x - faceSize * 0.3, y + faceSize * 0.05, blushSize, blushSize * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + faceSize * 0.3, y + faceSize * 0.05, blushSize, blushSize * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * Draw mouth styles.
 */
export function drawKawaiiMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  faceSize: number,
  style: MouthStyle,
): void {
  const mouthWidth = Math.max(3, faceSize * 0.15)
  const mouthY = y + faceSize * 0.15

  ctx.strokeStyle = '#1d161b'
  ctx.fillStyle = '#1d161b'
  ctx.lineWidth = Math.max(1.5, faceSize * 0.04)
  ctx.lineCap = 'round'

  switch (style) {
    case 'smile':
      ctx.beginPath()
      ctx.arc(x, mouthY - mouthWidth * 0.3, mouthWidth, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.stroke()
      break

    case 'frown':
      ctx.beginPath()
      ctx.arc(x, mouthY + mouthWidth * 0.8, mouthWidth, 1.15 * Math.PI, 1.85 * Math.PI)
      ctx.stroke()
      break

    case 'gasp':
      ctx.fillStyle = '#1d161b'
      ctx.beginPath()
      ctx.ellipse(x, mouthY, mouthWidth * 0.5, mouthWidth * 0.7, 0, 0, Math.PI * 2)
      ctx.fill()
      break

    case 'grin':
      ctx.fillStyle = '#1d161b'
      ctx.beginPath()
      ctx.arc(x, mouthY - mouthWidth * 0.1, mouthWidth * 1.2, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.lineTo(x + mouthWidth * 1.2, mouthY + mouthWidth * 0.3)
      ctx.lineTo(x - mouthWidth * 1.2, mouthY + mouthWidth * 0.3)
      ctx.closePath()
      ctx.fill()
      // White teeth line
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x - mouthWidth, mouthY - mouthWidth * 0.1, mouthWidth * 2, mouthWidth * 0.15)
      break

    case 'tongue':
      // Simple line smile + pink tongue
      ctx.strokeStyle = '#1d161b'
      ctx.lineWidth = Math.max(1.5, faceSize * 0.04)
      ctx.beginPath()
      ctx.arc(x, mouthY - mouthWidth * 0.3, mouthWidth, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx.stroke()
      ctx.fillStyle = '#f43f5e'
      ctx.beginPath()
      ctx.ellipse(x, mouthY + mouthWidth * 0.2, mouthWidth * 0.4, mouthWidth * 0.5, 0, 0, Math.PI)
      ctx.fill()
      break

    case 'flat':
      // Small straight line
      ctx.beginPath()
      ctx.moveTo(x - mouthWidth * 0.5, mouthY)
      ctx.lineTo(x + mouthWidth * 0.5, mouthY)
      ctx.stroke()
      break
  }
}

/**
 * Draw a heart shape.
 */
export function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 20, size / 20)
  ctx.beginPath()
  ctx.moveTo(0, -10)
  ctx.bezierCurveTo(-5, -15, -15, -10, -15, 0)
  ctx.bezierCurveTo(-15, 10, 0, 18, 0, 22)
  ctx.bezierCurveTo(0, 18, 15, 10, 15, 0)
  ctx.bezierCurveTo(15, -10, 5, -15, 0, -10)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Draw a kawaii star entity.
 */
export function drawKawaiiStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  points: number,
  color: string,
  options?: KawaiiFaceOptions,
): void {
  ctx.save()
  ctx.translate(x, y)

  // Star body with gradient
  const outerR = size
  const innerR = size * 0.45
  const starGrad = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, outerR)
  starGrad.addColorStop(0, lightenColor(color, 50))
  starGrad.addColorStop(0.6, color)
  starGrad.addColorStop(1, darkenColor(color, 30))
  ctx.fillStyle = starGrad
  drawStarShape(ctx, 0, 0, outerR, innerR, points)
  ctx.fill()

  ctx.strokeStyle = darkenColor(color, 40)
  ctx.lineWidth = Math.max(1.5, size * 0.08)
  drawStarShape(ctx, 0, 0, outerR, innerR, points)
  ctx.stroke()

  // Draw face in center
  drawKawaiiEyes(ctx, 0, -size * 0.05, size * 0.35, options?.emotion || 'normal', { highlights: true })
  if (options?.blush) {
    drawKawaiiBlush(ctx, 0, 0, size * 0.35)
  }
  if (options?.mouth && options.mouth !== 'flat') {
    drawKawaiiMouth(ctx, 0, size * 0.1, size * 0.25, options.mouth)
  }

  // Glossy highlight
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.ellipse(-size * 0.1, -size * 0.2, size * 0.12, size * 0.08, -0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

/**
 * Draw a trail/afterglow effect behind a moving entity.
 * Call this each frame at the entity's previous position.
 */
export function drawEntityTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  prevX: number,
  prevY: number,
  color: string,
  length: number = 6,
  alpha: number = 0.4,
): void {
  const dx = x - prevX
  const dy = y - prevY
  for (let i = 0; i < length; i++) {
    const t = i / length
    const px = x - dx * t
    const py = y - dy * t
    const radius = 3 * (1 - t)
    const a = alpha * (1 - t)
    ctx.save()
    ctx.globalAlpha = a
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

// --- Shape-specific drawing ---

export function drawKawaiiEntity(
  ctx: CanvasRenderingContext2D,
  options: DrawEntityOptions,
): void {
  const { x, y, color, options: faceOpts, rotation, glowColor, glowBlur, size, bodyShape } = options
  const radius = size ?? 20
  const width = size ?? 20
  const height = size ?? 20

  ctx.save()
  if (rotation) ctx.rotate(rotation)

  // Glow
  if (glowColor && glowBlur) {
    ctx.shadowColor = glowColor
    ctx.shadowBlur = glowBlur
  }

  switch (bodyShape) {
    case 'rect':
      drawKawaiiRect(ctx, x, y, width, height, color, faceOpts)
      break
    default:
      drawKawaiiCircle(ctx, x, y, radius, color, faceOpts)
      break
  }

  ctx.restore()
}

/**
 * Get appropriate emotion based on health/game state.
 * Use this to dynamically change entity expressions.
 */
export function getEmotionForHP(hpPercent: number, baseEmotion: EyeEmotion = 'normal'): EyeEmotion {
  if (hpPercent > 0.7) return baseEmotion
  if (hpPercent > 0.4) return 'normal'
  if (hpPercent > 0.2) return 'angry'
  return 'sleepy'
}

/**
 * Create a gradient for a game background.
 * Returns a canvas gradient object ready to use with ctx.createLinearGradient.
 */
export function createGameBackgroundGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameId: GameId,
): CanvasGradient {
  const art = getGameArt(gameId)
  const [c1, s1, c2, s2, c3, s3] = art.background.skyGradient
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(s1, c1)
  grad.addColorStop(s2, c2)
  grad.addColorStop(s3, c3)
  return grad
}

/**
 * Draw ambient background particles on canvas.
 * Call this every frame for animated ambient effects.
 */
export function drawAmbientParticles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameId: GameId,
  tick: number,
): void {
  const art = getGameArt(gameId)
  const count = art.background.ambientParticleCount ?? 8

  for (let i = 0; i < count; i++) {
    const seed = i * 137.508 // golden angle offset
    const px = ((seed * 7.3 + tick * 0.02 * (i % 3 + 0.5)) % (width + 40)) - 20
    const py = ((seed * 3.7 + Math.sin(tick * 0.001 + i * 2.1) * 20 + i * height / count) % (height + 40)) - 20
    const size = 1.5 + (i % 4) * 0.7

    ctx.save()
    ctx.globalAlpha = 0.1 + (i % 3) * 0.05
    const color = art.particles.colors[i % art.particles.colors.length]!
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(px, py, size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

/**
 * Emit a burst of particles from a point (for hit/kill effects).
 * Returns an array of particle positions to update on the next frame.
 */
export interface BurstParticle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string;
}

export function emitBurst(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
  colors: string[],
  speed: number = 120,
  spread: number = Math.PI,
): BurstParticle[] {
  const particles: BurstParticle[] = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() - 0.5) * spread
    const spd = speed * (0.4 + Math.random() * 0.6)
    const vx = Math.cos(angle) * spd
    const vy = Math.sin(angle) * spd - 30 // slight upward bias
    particles.push({
      x, y,
      vx, vy,
      life: 0.3 + Math.random() * 0.4, // seconds
      maxLife: 0.3 + Math.random() * 0.4,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)]!,
    })
  }
  return particles
}
