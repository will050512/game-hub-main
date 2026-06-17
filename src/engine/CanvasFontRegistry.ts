/**
 * CanvasFontRegistry — Unified font specifications for all canvas rendering.
 * Replaces ad-hoc ctx.font = '...' strings with typed, consistent specs.
 *
 * CJK font stack: Noto Sans TC → PingFang TC → Microsoft JhengHei (matches CSS tokens)
 *
 * Usage in game code:
 *   getFont(ctx, FONTS.title, this.dpr)
 *   ctx.fillText('Title', x, y)
 */

export interface FontSpec {
  name: string
  size: number
  weight: string
}

const cjkStack = '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif'

export const FONTS: Record<string, FontSpec> = {
  title:   { name: cjkStack, size: 32, weight: 'bold' },
  subtitle:{ name: cjkStack, size: 22, weight: 'bold' },
  hud:     { name: cjkStack, size: 16, weight: 'bold' },
  label:   { name: cjkStack, size: 14, weight: 'normal' },
  score:   { name: cjkStack, size: 36, weight: '900' },
  button:  { name: cjkStack, size: 16, weight: 'bold' },
  small:   { name: cjkStack, size: 12, weight: 'normal' },
}

/**
 * Sets ctx.font based on a FontSpec and DPR.
 * Returns the spec for convenience (chaining).
 */
export function getFont(ctx: CanvasRenderingContext2D, spec: FontSpec, dpr: number): FontSpec {
  ctx.font = `${spec.weight} ${Math.round(spec.size * dpr)}px ${spec.name}`
  return spec
}

/**
 * Formats text with the given font spec and DPR.
 * Useful when you need the formatted font string as a value.
 */
export function makeFontString(spec: FontSpec, dpr: number): string {
  return `${spec.weight} ${Math.round(spec.size * dpr)}px ${spec.name}`
}
