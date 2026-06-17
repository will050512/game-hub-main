export interface KawaiiCanvasTheme {
  base: string
  soft: string
  accent: string
  ink: string
  blush: string
}

export type CanvasIconKind =
  | 'basket'
  | 'apple'
  | 'bomb'
  | 'block'
  | 'heart'
   | 'laser'
   | 'orb'
   | 'preview'
  | 'rocket'
  | 'shield'
  | 'spark'
  | 'speed'
  | 'star'
  | 'target'
  | 'timer'
  | 'undo'

const canvasItemIconMap: Record<string, CanvasIconKind> = {
  apple: 'apple',
  basket: 'basket',
  big_basket: 'basket',
  bomb: 'bomb',
  block: 'block',
  chaos: 'orb',
  crown: 'star',
  double_score: 'star',
  heart: 'heart',
  homing: 'rocket',
  laser: 'laser',
  magnet: 'orb',
  orb: 'orb',
  pill: 'spark',
  power: 'spark',
  preview: 'preview',
  refresh: 'undo',
  repair: 'heart',
  remove: 'spark',
  rocket: 'rocket',
  shield: 'shield',
  slow: 'timer',
  sparkle: 'star',
  speed: 'speed',
  star: 'star',
  stats: 'star',
  swap: 'undo',
  target: 'target',
  timer: 'timer',
  triple: 'target',
  undo: 'undo',
  }

export const kawaiiThemes: KawaiiCanvasTheme[] = [
  { base: '#0f172a', soft: '#1e293b', accent: '#06b6d4', ink: '#0ea5e9', blush: '#8b5cf6' },
  { base: '#0c1929', soft: '#164e63', accent: '#14b8a6', ink: '#0d9488', blush: '#22d3ee' },
  { base: '#172554', soft: '#1e3a5f', accent: '#3b82f6', ink: '#60a5fa', blush: '#a78bfa' },
  { base: '#1a1a2e', soft: '#16213e', accent: '#e0e7ff', ink: '#c7d2fe', blush: '#6366f1' },
]

export const defaultKawaiiTheme: KawaiiCanvasTheme = kawaiiThemes[0] ?? {
  base: '#0f172a',
  soft: '#1e293b',
  accent: '#06b6d4',
  ink: '#0ea5e9',
  blush: '#8b5cf6',
}

export function canvasIconKindForItem(iconId: string): CanvasIconKind {
  return canvasItemIconMap[iconId] ?? 'spark'
}

export function formatCanvasCountLabel(label: string, count: number): string {
  return count > 0 ? `${label} ${count}` : label
}

/* ------------------------------------------------------------------ */
/*  Pixel Drawing Helpers (crisp, blocky rendering for pixel art mode)  */
/* ------------------------------------------------------------------ */

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
}

export function drawPixelBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  thickness: number = 2,
) {
  ctx.strokeStyle = color
  ctx.lineWidth = thickness
  ctx.strokeRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
}

export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  align: CanvasTextAlign = 'center',
) {
  ctx.font = `${Math.max(size, 12)}px 'Silkscreen', monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  // Pixel text shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillText(text, Math.floor(x + 2), Math.floor(y + 2))
  ctx.fillStyle = color
  ctx.fillText(text, Math.floor(x), Math.floor(y))
}

/**
 * Approximate a circle using filled square blocks (pixel art style).
 * Uses a rasterized disc algorithm — iterates over a bounding box and
 * fills pixels whose center falls within the radius.
 */
export function drawPixelCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  pixelSize: number = 4,
) {
  const startX = Math.floor(cx - radius - pixelSize)
  const endX = Math.ceil(cx + radius + pixelSize)
  const startY = Math.floor(cy - radius - pixelSize)
  const endY = Math.ceil(cy + radius + pixelSize)

  for (let px = startX; px <= endX; px += pixelSize) {
    for (let py = startY; py <= endY; py += pixelSize) {
      const pixelCx = px + pixelSize / 2
      const pixelCy = py + pixelSize / 2
      const dist = Math.sqrt((pixelCx - cx) ** 2 + (pixelCy - cy) ** 2)
      if (dist <= radius + pixelSize / 2) {
        ctx.fillStyle = color
        ctx.fillRect(Math.floor(px), Math.floor(py), pixelSize, pixelSize)
      }
    }
  }
}

/**
 * Draw a pixel grid overlay (subtle) over an existing canvas drawing.
 * Useful for giving a polished "pixel-perfect" feel.
 */
export function drawPixelGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = 32,
  gridColor: string = 'rgba(255,255,255,0.02)',
) {
  ctx.save()
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 0.5
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(Math.floor(x), 0)
    ctx.lineTo(Math.floor(x), height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, Math.floor(y))
    ctx.lineTo(width, Math.floor(y))
    ctx.stroke()
  }
  ctx.restore()
}

export function drawKawaiiBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tick: number,
  theme: KawaiiCanvasTheme = defaultKawaiiTheme,
  options?: { pixelGrid?: boolean; gridSize?: number; gridColor?: string },
) {
  ctx.imageSmoothingEnabled = false

  // 4-stop gradient mesh background
  const gradient = ctx.createLinearGradient(0, 0, width * 0.6, height)
  gradient.addColorStop(0, theme.base)
  gradient.addColorStop(0.35, theme.soft)
  gradient.addColorStop(0.7, theme.accent)
  gradient.addColorStop(1, theme.blush)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Subtle radial vignette for depth
  ctx.imageSmoothingEnabled = false
  const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.7)
  vignette.addColorStop(0, 'rgba(255,255,255,0.06)')
  vignette.addColorStop(0.6, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)

  // Floating particle system
  ctx.save()
  ctx.globalAlpha = 0.12
  for (let i = 0; i < 32; i += 1) {
    const px = ((i * 173 + tick * 0.008 * (i % 3 + 1)) % (width + 40)) - 20
    const py = ((i * 97 + Math.sin(tick * 0.0008 + i * 1.3) * 18 + i * 37) % (height + 40)) - 20
    const particleSize = 1.5 + (i % 5) * 0.8
    const alpha = 0.15 + (i % 3) * 0.08
    ctx.globalAlpha = alpha
    ctx.fillStyle = i % 4 === 0 ? theme.accent : i % 4 === 1 ? theme.blush : theme.soft
    ctx.beginPath()
    ctx.arc(px, py, particleSize, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()

  // Subtle dot-grid (not lines) for tech feel
  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.fillStyle = theme.ink
  const dotSpacing = 28
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      ctx.beginPath()
      ctx.arc(x, y, 0.8, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  // Animated subtle glow nodes
  ctx.save()
  ctx.globalAlpha = 0.06
  for (let i = 0; i < 5; i += 1) {
    const gx = (width * 0.2) + (i * width * 0.15)
    const gy = height * 0.5 + Math.sin(tick * 0.001 + i * 1.5) * height * 0.15
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, 60 + i * 10)
    glow.addColorStop(0, theme.accent)
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(gx - 80, gy - 80, 160, 160)
  }
  ctx.restore()

  // Pixel grid overlay (optional, for pixel art mode)
  if (options?.pixelGrid) {
    drawPixelGrid(ctx, width, height, options.gridSize ?? 32, options.gridColor ?? 'rgba(255,255,255,0.02)')
  }
}

export function drawRoundedBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  ink = '#0ea5e9',
  face = true,
  fill = '#06b6d4',
) {
  ctx.save()
  ctx.imageSmoothingEnabled = false

  // 3D sphere base with radial gradient
  const radialGrad = ctx.createRadialGradient(
    x - size * 0.25, y - size * 0.25, size * 0.05,
    x, y, size * 0.95
  )
  radialGrad.addColorStop(0, '#ffffff')
  radialGrad.addColorStop(0.3, fill)
  radialGrad.addColorStop(0.8, ink)
  radialGrad.addColorStop(1, 'rgba(0,0,0,0.4)')

  ctx.fillStyle = radialGrad
  ctx.beginPath()
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2)
  ctx.fill()

  // Subtle outer stroke
  ctx.strokeStyle = `rgba(255,255,255,0.15)`
  ctx.lineWidth = Math.max(1, size * 0.06)
  ctx.beginPath()
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2)
  ctx.stroke()

  // Specular highlight dot
  const hlGrad = ctx.createRadialGradient(
    x - size * 0.2, y - size * 0.3, 0,
    x - size * 0.2, y - size * 0.3, size * 0.25
  )
  hlGrad.addColorStop(0, 'rgba(255,255,255,0.9)')
  hlGrad.addColorStop(0.5, 'rgba(255,255,255,0.3)')
  hlGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hlGrad
  ctx.beginPath()
  ctx.arc(x - size * 0.2, y - size * 0.3, size * 0.25, 0, Math.PI * 2)
  ctx.fill()

  // Bottom shadow
  const shadowGrad = ctx.createRadialGradient(
    x + size * 0.1, y + size * 0.3, 0,
    x + size * 0.1, y + size * 0.3, size * 0.4
  )
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0.25)')
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shadowGrad
  ctx.beginPath()
  ctx.arc(x + size * 0.1, y + size * 0.3, size * 0.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
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

export interface KawaiiPanelOptions {
  fill?: string
  stroke?: string
  radius?: number
  accent?: string
  alpha?: number
  shadow?: string
}

export function drawKawaiiPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: KawaiiPanelOptions = {},
) {
  const {
    fill = 'rgba(30, 41, 59, 0.7)',
    stroke = '#06b6d4',
    radius = Math.min(width, height) * 0.22,
    accent,
    alpha = 1,
    shadow = 'rgba(6, 182, 212, 0.25)',
  } = options

  ctx.save()
  ctx.imageSmoothingEnabled = false
  ctx.globalAlpha = alpha

  // Soft glow behind panel
  ctx.shadowColor = shadow
  ctx.shadowBlur = Math.max(8, Math.min(width, height) * 0.2)
  ctx.shadowOffsetY = Math.max(4, Math.min(width, height) * 0.08)
  ctx.shadowOffsetX = 0

  // Frosted glass fill
  const panelFill = ctx.createLinearGradient(x, y, x + width, y + height)
  panelFill.addColorStop(0, fill)
  panelFill.addColorStop(0.5, fill.replace(/[\d.]+\s*\)/, '0.85)'))
  panelFill.addColorStop(1, fill)
  ctx.fillStyle = panelFill

  roundedRectPath(ctx, x, y, width, height, radius)
  ctx.fill()

  // Reset shadow for border drawing
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // Gradient border (top to bottom, light-to-dark)
  const borderGrad = ctx.createLinearGradient(x, y, x, y + height)
  borderGrad.addColorStop(0, 'rgba(255,255,255,0.4)')
  borderGrad.addColorStop(0.5, stroke)
  borderGrad.addColorStop(1, 'rgba(255,255,255,0.1)')

  ctx.strokeStyle = borderGrad
  ctx.lineWidth = Math.max(1.5, Math.min(width, height) * 0.06)
  roundedRectPath(ctx, x, y, width, height, radius)
  ctx.stroke()

  // Glass highlight line (top edge reflection)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = Math.max(1, Math.min(width, height) * 0.04)
  ctx.beginPath()
  ctx.moveTo(x + width * 0.08, y + height * 0.15)
  ctx.lineTo(x + width * 0.92, y + height * 0.15)
  ctx.stroke()

  // Accent bar (modern left accent)
  if (accent) {
    const barW = Math.max(3, Math.min(width, height) * 0.06)
    const barGrad = ctx.createLinearGradient(x, y, x, y + height)
    barGrad.addColorStop(0, accent)
    barGrad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = barGrad
    roundedRectPath(ctx, x, y + height * 0.15, barW, height * 0.7, barW)
    ctx.fill()
  }

  // Frosted noise overlay (very subtle texture)
  ctx.globalAlpha = alpha * 0.03
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 12; i++) {
    const rx = x + Math.random() * width
    const ry = y + Math.random() * height
    ctx.fillRect(rx, ry, 1, 1)
  }
  ctx.restore()
}

export interface KawaiiProgressBarOptions {
  trackFill?: string
  fill?: string
  stroke?: string
}

export function drawKawaiiProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number,
  options: KawaiiProgressBarOptions = {},
) {
  const trackFill = options.trackFill ?? 'rgba(15, 23, 42, 0.6)'
  const fill = options.fill ?? '#06b6d4'
  const stroke = options.stroke ?? '#0ea5e9'
  const clamped = Math.max(0, Math.min(1, progress))
  const radius = Math.min(width, height) * 0.5

  ctx.save()

  // Track (glass effect)
  ctx.shadowColor = 'rgba(6, 182, 212, 0.15)'
  ctx.shadowBlur = 4
  ctx.fillStyle = trackFill
  roundedRectPath(ctx, x, y, width, height, radius)
  ctx.fill()
  ctx.shadowBlur = 0

  // Track border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = Math.max(1, height * 0.16)
  roundedRectPath(ctx, x, y, width, height, radius)
  ctx.stroke()

  // Fill with cyan-to-magenta gradient
  if (clamped > 0) {
    const clipX = x + width * clamped

    // Clip to bar shape for gradient fill
    ctx.save()
    roundedRectPath(ctx, x, y, width, height, radius)
    ctx.clip()

    // Main gradient fill
    const barGrad = ctx.createLinearGradient(x, 0, clipX, 0)
    barGrad.addColorStop(0, '#06b6d4')
    barGrad.addColorStop(0.5, '#8b5cf6')
    barGrad.addColorStop(1, '#ec4899')
    ctx.fillStyle = barGrad
    roundedRectPath(ctx, x, y, width * clamped, height, radius)
    ctx.fill()

    // Inner glow overlay (brighter center)
    const innerGrad = ctx.createLinearGradient(x, y - height * 0.2, x, y + height * 0.5)
    innerGrad.addColorStop(0, 'rgba(255,255,255,0.4)')
    innerGrad.addColorStop(0.5, 'rgba(255,255,255,0.05)')
    innerGrad.addColorStop(1, 'rgba(0,0,0,0.15)')
    ctx.fillStyle = innerGrad
    roundedRectPath(ctx, x, y, width * clamped, height, radius)
    ctx.fill()

    // End-cap glow
    const capGrad = ctx.createRadialGradient(clipX, y + height * 0.5, 0, clipX, y + height * 0.5, height * 1.5)
    capGrad.addColorStop(0, 'rgba(139, 92, 246, 0.6)')
    capGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')
    ctx.fillStyle = capGrad
    ctx.fillRect(clipX - height * 2, y - height, height * 4, height * 3)

    ctx.restore()
  }

  // Glass track overlay (top half highlight)
  ctx.save()
  const glassGrad = ctx.createLinearGradient(x, y, x, y + height * 0.5)
  glassGrad.addColorStop(0, 'rgba(255,255,255,0.12)')
  glassGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glassGrad
  roundedRectPath(ctx, x, y, width, height, radius)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}

export interface DrawKawaiiCanvasIconOptions {
  color?: string
  ink?: string
  alpha?: number
}

export function drawKawaiiCanvasIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  kind: CanvasIconKind,
  options: DrawKawaiiCanvasIconOptions = {},
) {
  const color = options.color ?? defaultKawaiiTheme.accent
  const ink = options.ink ?? defaultKawaiiTheme.ink
  const lineWidth = Math.max(1.2, size * 0.1)

  ctx.save()
  ctx.globalAlpha = options.alpha ?? 1
  ctx.translate(x, y)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Glow effect for all icons
  ctx.shadowColor = color
  ctx.shadowBlur = size * 0.15

  if (kind === 'heart' || kind === 'star' || kind === 'shield') {
    drawKawaiiItem(ctx, 0, 0, size, kind === 'star' ? 'star' : kind, {
      base: '#0f172a',
      soft: color,
      accent: color,
      ink,
      blush: color,
    })
    ctx.restore()
    return
  }

  if (kind === 'basket') {
    // Body with gradient
    const bodyGrad = ctx.createLinearGradient(-size * 0.34, 0, size * 0.34, 0)
    bodyGrad.addColorStop(0, '#f59e0b')
    bodyGrad.addColorStop(0.5, '#fbbf24')
    bodyGrad.addColorStop(1, '#d97706')
    ctx.fillStyle = bodyGrad
    roundedRectPath(ctx, -size * 0.34, -size * 0.06, size * 0.68, size * 0.34, size * 0.1)
    ctx.fill()
    ctx.strokeStyle = '#92400e'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // Handle
    ctx.strokeStyle = '#92400e'
    ctx.beginPath()
    ctx.moveTo(-size * 0.18, -size * 0.04)
    ctx.quadraticCurveTo(0, -size * 0.36, size * 0.18, -size * 0.04)
    ctx.stroke()
    // Weave lines
    ctx.beginPath()
    ctx.moveTo(-size * 0.22, size * 0.08)
    ctx.lineTo(size * 0.22, size * 0.08)
    ctx.stroke()
  } else if (kind === 'apple') {
    // Apple with 3D gradient
    const appleGrad = ctx.createRadialGradient(
      -size * 0.08, -size * 0.08, size * 0.02,
      0, 0, size * 0.32
    )
    appleGrad.addColorStop(0, '#fca5a5')
    appleGrad.addColorStop(0.4, '#ef4444')
    appleGrad.addColorStop(1, '#991b1b')
    ctx.fillStyle = appleGrad
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#7f1d1d'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // Stem
    ctx.strokeStyle = '#65a30d'
    ctx.lineWidth = Math.max(1, size * 0.08)
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.28)
    ctx.quadraticCurveTo(size * 0.03, -size * 0.4, size * 0.02, -size * 0.45)
    ctx.stroke()
    // Leaf
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.ellipse(size * 0.15, -size * 0.35, size * 0.14, size * 0.07, -0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#166534'
    ctx.lineWidth = Math.max(1, size * 0.05)
    ctx.stroke()
  } else if (kind === 'bomb') {
    // Bomb body with gradient
    const bombGrad = ctx.createRadialGradient(
      -size * 0.06, -size * 0.06, size * 0.02,
      0, size * 0.06, size * 0.28
    )
    bombGrad.addColorStop(0, '#6b7280')
    bombGrad.addColorStop(0.6, '#1f2937')
    bombGrad.addColorStop(1, '#030712')
    ctx.fillStyle = bombGrad
    ctx.beginPath()
    ctx.arc(0, size * 0.06, size * 0.28, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // Fuse
    ctx.strokeStyle = '#92400e'
    ctx.lineWidth = Math.max(1, size * 0.06)
    ctx.beginPath()
    ctx.moveTo(size * 0.06, -size * 0.16)
    ctx.quadraticCurveTo(size * 0.18, -size * 0.34, size * 0.28, -size * 0.34)
    ctx.stroke()
    // Spark on fuse tip
    ctx.fillStyle = '#fbbf24'
    ctx.shadowColor = '#f59e0b'
    ctx.shadowBlur = size * 0.2
    ctx.beginPath()
    ctx.arc(size * 0.3, -size * 0.36, size * 0.06, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  } else if (kind === 'block') {
    // Block with gradient and X
    const blockGrad = ctx.createLinearGradient(-size * 0.28, -size * 0.28, size * 0.28, size * 0.28)
    blockGrad.addColorStop(0, '#475569')
    blockGrad.addColorStop(0.5, '#334155')
    blockGrad.addColorStop(1, '#1e293b')
    ctx.fillStyle = blockGrad
    roundedRectPath(ctx, -size * 0.28, -size * 0.28, size * 0.56, size * 0.56, size * 0.12)
    ctx.fill()
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // X mark
    ctx.strokeStyle = '#f87171'
    ctx.beginPath()
    ctx.moveTo(-size * 0.16, -size * 0.16)
    ctx.lineTo(size * 0.16, size * 0.16)
    ctx.moveTo(size * 0.16, -size * 0.16)
    ctx.lineTo(-size * 0.16, size * 0.16)
    ctx.stroke()
  } else if (kind === 'laser') {
    // Laser beam line
    const laserGrad = ctx.createLinearGradient(0, -size * 0.42, 0, size * 0.42)
    laserGrad.addColorStop(0, '#a78bfa')
    laserGrad.addColorStop(0.5, '#8b5cf6')
    laserGrad.addColorStop(1, '#6d28d9')
    ctx.fillStyle = laserGrad
    ctx.shadowColor = '#8b5cf6'
    ctx.shadowBlur = size * 0.3
    roundedRectPath(ctx, -size * 0.08, -size * 0.42, size * 0.16, size * 0.84, size * 0.06)
    ctx.fill()
    ctx.shadowBlur = 0
    // Cross lines
    ctx.strokeStyle = '#a78bfa'
    ctx.lineWidth = lineWidth * 0.6
    ctx.beginPath()
    ctx.moveTo(-size * 0.24, -size * 0.2)
    ctx.lineTo(size * 0.24, -size * 0.2)
    ctx.moveTo(-size * 0.18, 0)
    ctx.lineTo(size * 0.18, 0)
    ctx.moveTo(-size * 0.24, size * 0.2)
    ctx.lineTo(size * 0.24, size * 0.2)
    ctx.stroke()
  } else if (kind === 'orb') {
    // Orb with rings
    const orbGrad = ctx.createRadialGradient(
      -size * 0.05, -size * 0.05, size * 0.01,
      0, 0, size * 0.23
    )
    orbGrad.addColorStop(0, '#c084fc')
    orbGrad.addColorStop(0.4, '#7c3aed')
    orbGrad.addColorStop(0.8, '#4c1d95')
    orbGrad.addColorStop(1, '#2e1065')
    ctx.fillStyle = orbGrad
    ctx.shadowColor = '#7c3aed'
    ctx.shadowBlur = size * 0.25
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.23, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    // Orbit rings
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)'
    ctx.lineWidth = lineWidth * 0.5
    ctx.beginPath()
    ctx.ellipse(0, 0, size * 0.42, size * 0.22, 0.28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(0, 0, size * 0.42, size * 0.22, -0.38, 0, Math.PI * 2)
    ctx.stroke()
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.beginPath()
    ctx.arc(-size * 0.06, -size * 0.08, size * 0.06, 0, Math.PI * 2)
    ctx.fill()
  } else if (kind === 'preview') {
    // Stacked preview cards
    ctx.fillStyle = '#1e293b'
    ctx.strokeStyle = '#475569'
    roundedRectPath(ctx, -size * 0.22, -size * 0.18, size * 0.28, size * 0.34, size * 0.06)
    ctx.fill()
    ctx.stroke()

    // Front card with accent
    const cardGrad = ctx.createLinearGradient(-size * 0.05, -size * 0.28, size * 0.23, size * 0.06)
    cardGrad.addColorStop(0, '#06b6d4')
    cardGrad.addColorStop(1, '#0891b2')
    ctx.fillStyle = cardGrad
    ctx.shadowColor = '#06b6d4'
    ctx.shadowBlur = size * 0.15
    roundedRectPath(ctx, -size * 0.05, -size * 0.28, size * 0.28, size * 0.34, size * 0.06)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#0e7490'
    ctx.stroke()
  } else if (kind === 'rocket') {
    // Rocket body
    const rocketGrad = ctx.createLinearGradient(-size * 0.18, -size * 0.38, size * 0.18, size * 0.3)
    rocketGrad.addColorStop(0, '#e2e8f0')
    rocketGrad.addColorStop(0.5, '#94a3b8')
    rocketGrad.addColorStop(1, '#475569')
    ctx.fillStyle = rocketGrad
    ctx.shadowColor = '#64748b'
    ctx.shadowBlur = size * 0.1
    ctx.beginPath()
    ctx.moveTo(0, -size * 0.38)
    ctx.lineTo(size * 0.18, size * 0.04)
    ctx.lineTo(size * 0.12, size * 0.3)
    ctx.lineTo(0, size * 0.18)
    ctx.lineTo(-size * 0.12, size * 0.3)
    ctx.lineTo(-size * 0.18, size * 0.04)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // Flame
    ctx.fillStyle = '#f97316'
    ctx.shadowColor = '#f97316'
    ctx.shadowBlur = size * 0.2
    ctx.beginPath()
    ctx.moveTo(-size * 0.08, size * 0.18)
    ctx.lineTo(0, size * 0.42)
    ctx.lineTo(size * 0.08, size * 0.18)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    // Window
    ctx.fillStyle = '#7dd3fc'
    ctx.beginPath()
    ctx.arc(0, -size * 0.08, size * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#0284c7'
    ctx.lineWidth = lineWidth * 0.5
    ctx.stroke()
  } else if (kind === 'speed') {
    // Speed lines
    ctx.strokeStyle = '#94a3b8'
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = size * 0.1
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(-size * 0.34, size * 0.08)
    ctx.lineTo(size * 0.12, size * 0.08)
    ctx.moveTo(-size * 0.18, -size * 0.14)
    ctx.lineTo(size * 0.24, -size * 0.14)
    ctx.stroke()
    ctx.shadowBlur = 0
    // Arrow head
    const arrowGrad = ctx.createLinearGradient(size * 0.04, -size * 0.32, size * 0.32, 0)
    arrowGrad.addColorStop(0, '#3b82f6')
    arrowGrad.addColorStop(1, '#1d4ed8')
    ctx.fillStyle = arrowGrad
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = size * 0.15
    ctx.beginPath()
    ctx.moveTo(size * 0.04, -size * 0.32)
    ctx.lineTo(size * 0.32, 0)
    ctx.lineTo(size * 0.04, size * 0.32)
    ctx.lineTo(size * 0.12, 0)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
  } else if (kind === 'target') {
    // Target rings
    ctx.fillStyle = '#1e293b'
    ctx.shadowColor = '#94a3b8'
    ctx.shadowBlur = size * 0.1
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.38, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = lineWidth * 0.6
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2)
    ctx.stroke()
    // Red dot
    const dotGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.08)
    dotGrad.addColorStop(0, '#ef4444')
    dotGrad.addColorStop(1, '#991b1b')
    ctx.fillStyle = dotGrad
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = size * 0.2
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    // Crosshair
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)'
    ctx.lineWidth = lineWidth * 0.4
    ctx.beginPath()
    ctx.moveTo(size * 0.08, -size * 0.08)
    ctx.lineTo(size * 0.32, -size * 0.32)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-size * 0.08, -size * 0.32)
    ctx.lineTo(size * 0.08, -size * 0.48)
    ctx.stroke()
  } else if (kind === 'timer') {
    // Clock face
    const clockGrad = ctx.createRadialGradient(0, 0, size * 0.05, 0, 0, size * 0.32)
    clockGrad.addColorStop(0, '#1e293b')
    clockGrad.addColorStop(1, '#0f172a')
    ctx.fillStyle = clockGrad
    ctx.shadowColor = '#64748b'
    ctx.shadowBlur = size * 0.1
    ctx.beginPath()
    ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = lineWidth
    ctx.stroke()
    // Hour marks
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = lineWidth * 0.5
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6
      const innerR = size * 0.22
      const outerR = size * 0.28
      ctx.beginPath()
      ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR)
      ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR)
      ctx.stroke()
    }
    // Hands
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = lineWidth * 0.5
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -size * 0.16)
    ctx.stroke()
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = lineWidth * 0.35
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(size * 0.1, -size * 0.08)
    ctx.stroke()
    // Top accent bar
    ctx.fillStyle = '#06b6d4'
    ctx.shadowColor = '#06b6d4'
    ctx.shadowBlur = size * 0.15
    ctx.beginPath()
    ctx.moveTo(-size * 0.12, -size * 0.36)
    ctx.lineTo(size * 0.12, -size * 0.36)
    ctx.lineTo(size * 0.12, -size * 0.42)
    ctx.lineTo(-size * 0.12, -size * 0.42)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
  } else if (kind === 'undo') {
    // Curved arrow with glow
    ctx.beginPath()
    ctx.arc(size * 0.04, 0, size * 0.26, 0.35 * Math.PI, 1.85 * Math.PI)
    ctx.strokeStyle = '#60a5fa'
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = size * 0.15
    ctx.lineWidth = lineWidth
    ctx.stroke()
    ctx.shadowBlur = 0
    // Arrowhead
    const arrowGrad = ctx.createLinearGradient(-size * 0.34, -size * 0.22, -size * 0.08, size * 0.14)
    arrowGrad.addColorStop(0, '#3b82f6')
    arrowGrad.addColorStop(1, '#1d4ed8')
    ctx.fillStyle = arrowGrad
    ctx.beginPath()
    ctx.moveTo(-size * 0.34, -size * 0.04)
    ctx.lineTo(-size * 0.08, -size * 0.22)
    ctx.lineTo(-size * 0.08, size * 0.14)
    ctx.closePath()
    ctx.fill()
    // Arrowhead outline
    ctx.strokeStyle = '#1e3a5f'
    ctx.lineWidth = lineWidth * 0.5
    ctx.stroke()
  } else {
    // Spark / generic star with gradient and glow
    const starGrad = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 0.34)
    starGrad.addColorStop(0, '#fde68a')
    starGrad.addColorStop(0.5, color)
    starGrad.addColorStop(1, '#854d0e')
    ctx.fillStyle = starGrad
    ctx.shadowColor = color
    ctx.shadowBlur = size * 0.2
    drawStar(ctx, 0, 0, size * 0.34, size * 0.12, 5)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = ink
    ctx.lineWidth = lineWidth
    drawStar(ctx, 0, 0, size * 0.34, size * 0.12, 5)
    ctx.stroke()
  }

  ctx.restore()
}

export interface KawaiiInlineLabelOptions {
  x: number
  y: number
  text: string
  iconKind?: CanvasIconKind
  color?: string
  ink?: string
  fontSize: number
  align?: CanvasTextAlign
  /**
   * Maximum total width for the label (icon + gap + text).
   * When the text would exceed this width it is truncated with an ellipsis.
   * When even the icon + minimum text exceed the limit the icon is hidden.
   * Omit or pass `Infinity` for unbounded rendering (backward-compatible).
   */
  maxWidth?: number
}

export function drawKawaiiInlineLabel(ctx: CanvasRenderingContext2D, options: KawaiiInlineLabelOptions) {
  const iconSize = options.fontSize * 1.15
  const gap = iconSize * 0.45
  ctx.save()
  ctx.textAlign = options.align ?? 'left'
  ctx.textBaseline = 'middle'
  ctx.font = `bold ${options.fontSize}px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif`
  ctx.fillStyle = options.color ?? defaultKawaiiTheme.ink
  ctx.shadowColor = options.color ?? defaultKawaiiTheme.ink
  ctx.shadowBlur = 2

  const effectiveMaxWidth = options.maxWidth ?? Infinity
  const hasIcon = !!options.iconKind

  // Measure the full-width text to know what we're working with
  const fullTextWidth =
    typeof ctx.measureText === 'function'
      ? ctx.measureText(options.text).width
      : options.text.length * options.fontSize * 0.62
  const iconGapWidth = (hasIcon ? iconSize : 0) + (hasIcon ? gap : 0)
  const textAvailableWidth = Math.max(0, effectiveMaxWidth - iconGapWidth)

  // Determine the text to render — truncate with ellipsis if needed
  let renderText = options.text
  let showIcon = hasIcon
  if (hasIcon && textAvailableWidth > 0) {
    // Try the full text first
    if (fullTextWidth <= textAvailableWidth) {
      // Fits as-is, render everything
      renderText = options.text
    } else {
      // Needs truncation — binary-search for the longest string that fits
      renderText = truncateToFit(ctx, options.text, textAvailableWidth, options.fontSize)
      // If even one character + ellipsis is wider than the budget, hide the icon
      const iconOnlyWidth = iconSize + gap
      if (iconOnlyWidth > effectiveMaxWidth) {
        showIcon = false
      }
    }
  }

  // Measure the (possibly truncated) text
  const textWidth =
    typeof ctx.measureText === 'function'
      ? ctx.measureText(renderText).width
      : renderText.length * options.fontSize * 0.62

  const startX = options.align === 'center' ? options.x - (textWidth + (showIcon ? iconGapWidth : 0)) / 2 : options.x
  const iconX = showIcon ? startX + iconSize * 0.5 : -9999 // off-screen if hidden

  if (showIcon) {
    drawKawaiiCanvasIcon(
      ctx,
      iconX,
      options.y,
      iconSize,
      options.iconKind ?? 'spark',
      { color: options.color, ink: options.ink },
    )
  }

  const textX = showIcon ? startX + iconSize + gap : startX
  ctx.fillText(renderText, textX, options.y)
  ctx.restore()
}

/**
 * Binary-search truncate text to fit within maxWidth, appending an ellipsis.
 * Returns the longest prefix that fits (including the ellipsis characters).
 */
function truncateToFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
): string {
  if (ctx.measureText) {
    // Binary search for the longest prefix that fits alongside "…"
    const ellipsis = '…'
    let lo = 0
    let hi = text.length

    // Fast rejection
    if (ctx.measureText(ellipsis).width <= maxWidth) return ellipsis
    if (ctx.measureText(text + ellipsis).width <= maxWidth) return text

    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2)
      if (ctx.measureText(text.slice(0, mid) + ellipsis).width <= maxWidth) {
        lo = mid
      } else {
        hi = mid - 1
      }
    }
    return text.slice(0, lo) + ellipsis
  }

  // Fallback: character-count estimate (same heuristic as the inline check)
  const ellipsis = '…'
  const ellipsisWidth = ellipsis.length * fontSize * 0.62
  const charWidth = fontSize * 0.62
  const availableChars = Math.max(0, Math.floor((maxWidth - ellipsisWidth) / charWidth))
  return text.slice(0, availableChars) + ellipsis
}

export interface KawaiiButtonOptions {
  x: number
  y: number
  width: number
  height: number
  label: string
  count?: number
  iconKind?: CanvasIconKind
  enabled?: boolean
  active?: boolean
  fill?: string
  activeFill?: string
  disabledFill?: string
  textColor?: string
}

export function drawKawaiiButton(ctx: CanvasRenderingContext2D, options: KawaiiButtonOptions) {
  const isDisabled = options.enabled === false
  const isActive = options.active === true
  const fill = isDisabled
    ? (options.disabledFill ?? '#334155')
    : isActive
      ? (options.activeFill ?? '#0891b2')
      : (options.fill ?? '#06b6d4')

  // Panel background
  drawKawaiiPanel(ctx, options.x, options.y, options.width, options.height, {
    fill: isDisabled ? 'rgba(30, 41, 59, 0.6)' : isActive ? 'rgba(8, 145, 178, 0.7)' : 'rgba(6, 182, 212, 0.15)',
    accent: isDisabled ? '#64748b' : isActive ? '#22d3ee' : '#06b6d4',
    radius: options.height * 0.3,
    alpha: isDisabled ? 0.7 : 1,
  })

  // Glow on active state
  if (!isDisabled && isActive) {
    ctx.save()
    const glowGrad = ctx.createRadialGradient(
      options.x + options.width / 2, options.y + options.height / 2, 0,
      options.x + options.width / 2, options.y + options.height / 2, options.width * 0.6
    )
    glowGrad.addColorStop(0, 'rgba(34, 211, 238, 0.3)')
    glowGrad.addColorStop(1, 'rgba(34, 211, 238, 0)')
    ctx.fillStyle = glowGrad
    ctx.fillRect(options.x - options.width * 0.1, options.y - options.height * 0.1,
                 options.width * 1.2, options.height * 1.2)
    ctx.restore()
  }

  drawKawaiiInlineLabel(ctx, {
    x: options.x + options.width / 2,
    y: options.y + options.height / 2,
    text: formatCanvasCountLabel(options.label, options.count ?? 0),
    iconKind: options.iconKind,
    color: isDisabled ? '#64748b' : options.textColor ?? '#e2e8f0',
    fontSize: Math.max(10, Math.floor(options.height * 0.34)),
    align: 'center',
  })
}

export function drawKawaiiItem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  kind: 'coin' | 'heart' | 'star' | 'gem' | 'shield',
  theme: KawaiiCanvasTheme = defaultKawaiiTheme,
) {
  ctx.save()
  ctx.strokeStyle = theme.ink
  ctx.lineWidth = Math.max(3, size * 0.1)

  if (kind === 'heart') {
    // 3D gradient heart
    ctx.translate(x, y)
    ctx.rotate(-Math.PI / 4)

    // Shadow underneath
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillRect(-size * 0.35 + 3, -size * 0.2 + 3, size * 0.7, size * 0.7)

    // Top circle
    const heartTop = ctx.createRadialGradient(
      -size * 0.08, -size * 0.35, 0,
      0, -size * 0.15, size * 0.4
    )
    heartTop.addColorStop(0, '#fda4af')
    heartTop.addColorStop(0.5, '#ec4899')
    heartTop.addColorStop(1, '#9d174d')
    ctx.fillStyle = heartTop
    ctx.beginPath()
    ctx.arc(-size * 0.17, -size * 0.1, size * 0.35, 0, Math.PI * 2)
    ctx.fill()

    // Right circle
    const heartRight = ctx.createRadialGradient(
      size * 0.27, -size * 0.05, 0,
      size * 0.17, size * 0.05, size * 0.4
    )
    heartRight.addColorStop(0, '#fda4af')
    heartRight.addColorStop(0.5, '#ec4899')
    heartRight.addColorStop(1, '#9d174d')
    ctx.fillStyle = heartRight
    ctx.beginPath()
    ctx.arc(size * 0.17, -size * 0.1, size * 0.35, 0, Math.PI * 2)
    ctx.fill()

    // Bottom rectangle (merged)
    const rectGrad = ctx.createLinearGradient(
      -size * 0.35, -size * 0.2, size * 0.35, size * 0.5
    )
    rectGrad.addColorStop(0, '#ec4899')
    rectGrad.addColorStop(0.7, '#9d174d')
    rectGrad.addColorStop(1, '#701a3a')
    ctx.fillStyle = rectGrad

    // Draw filled heart shape via paths
    ctx.beginPath()
    ctx.moveTo(-size * 0.35, -size * 0.15)
    ctx.bezierCurveTo(
      -size * 0.45, -size * 0.3, -size * 0.1, -size * 0.4,
      size * 0.0, -size * 0.2
    )
    ctx.bezierCurveTo(
      size * 0.1, -size * 0.4, size * 0.45, -size * 0.3,
      size * 0.35, -size * 0.15
    )
    ctx.lineTo(size * 0.35, size * 0.4)
    ctx.lineTo(-size * 0.35, size * 0.4)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Glossy highlight
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.beginPath()
    ctx.ellipse(-size * 0.15, -size * 0.25, size * 0.08, size * 0.12, -0.3, 0, Math.PI * 2)
    ctx.fill()

  } else if (kind === 'star') {
    // 5-point star with 3D gradient and glow
    const starGrad = ctx.createRadialGradient(
      x - size * 0.1, y - size * 0.15, size * 0.02,
      x, y, size * 0.55
    )
    starGrad.addColorStop(0, '#fef08a')
    starGrad.addColorStop(0.3, '#fbbf24')
    starGrad.addColorStop(0.7, '#d97706')
    starGrad.addColorStop(1, '#92400e')
    ctx.fillStyle = starGrad
    ctx.shadowColor = '#f59e0b'
    ctx.shadowBlur = size * 0.25
    drawStar(ctx, x, y, size * 0.55, size * 0.25, 5)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#92400e'
    ctx.lineWidth = Math.max(2, size * 0.08)
    drawStar(ctx, x, y, size * 0.55, size * 0.25, 5)
    ctx.stroke()

    // Inner highlight
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    drawStar(ctx, x, y, size * 0.3, size * 0.12, 5)
    ctx.fill()

  } else if (kind === 'shield') {
    // Shield with metallic gradient
    const shieldGrad = ctx.createLinearGradient(x, y - size * 0.55, x, y + size * 0.62)
    shieldGrad.addColorStop(0, '#e2e8f0')
    shieldGrad.addColorStop(0.2, '#94a3b8')
    shieldGrad.addColorStop(0.5, '#64748b')
    shieldGrad.addColorStop(0.8, '#334155')
    shieldGrad.addColorStop(1, '#1e293b')
    ctx.fillStyle = shieldGrad
    ctx.shadowColor = '#475569'
    ctx.shadowBlur = size * 0.15
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.55)
    ctx.lineTo(x + size * 0.48, y - size * 0.3)
    ctx.lineTo(x + size * 0.35, y + size * 0.45)
    ctx.lineTo(x, y + size * 0.62)
    ctx.lineTo(x - size * 0.35, y + size * 0.45)
    ctx.lineTo(x - size * 0.48, y - size * 0.3)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = Math.max(2, size * 0.08)
    ctx.stroke()

    // Center emblem (small star)
    ctx.fillStyle = '#06b6d4'
    ctx.shadowColor = '#06b6d4'
    ctx.shadowBlur = size * 0.12
    ctx.beginPath()
    ctx.arc(x, y - size * 0.05, size * 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x - size * 0.3, y - size * 0.35)
    ctx.lineTo(x, y - size * 0.5)
    ctx.lineTo(x + size * 0.3, y - size * 0.35)
    ctx.stroke()

  } else {
    // Coin: circular with metallic reflection and bevel
    const coinGrad = ctx.createRadialGradient(
      x - size * 0.1, y - size * 0.1, size * 0.05,
      x, y, size * 0.48
    )
    coinGrad.addColorStop(0, '#fde68a')
    coinGrad.addColorStop(0.4, '#f59e0b')
    coinGrad.addColorStop(0.8, '#d97706')
    coinGrad.addColorStop(1, '#92400e')
    ctx.fillStyle = coinGrad
    ctx.shadowColor = '#d97706'
    ctx.shadowBlur = size * 0.15
    ctx.beginPath()
    ctx.arc(x, y, size * 0.48, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Inner ring (bevel effect)
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = Math.max(1.5, size * 0.06)
    ctx.beginPath()
    ctx.arc(x, y, size * 0.36, 0, Math.PI * 2)
    ctx.stroke()

    // Bottom half darker
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, size * 0.48, 0, Math.PI * 2)
    ctx.clip()
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(x - size * 0.5, y, size, size * 0.5)
    ctx.restore()

    // Reflection streak
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = Math.max(1, size * 0.06)
    ctx.beginPath()
    ctx.arc(x - size * 0.15, y - size * 0.1, size * 0.15, -Math.PI * 0.8, -Math.PI * 0.2)
    ctx.stroke()

    // Center icon (simple dollar sign)
    ctx.fillStyle = '#92400e'
    ctx.font = `bold ${size * 0.35}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('$', x, y + size * 0.02)
  }
  ctx.restore()
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, outer: number, inner: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / points
    const radius = i % 2 === 0 ? outer : inner
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}
