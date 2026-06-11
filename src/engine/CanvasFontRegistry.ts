/**
 * CanvasFontRegistry — Unified font specifications for all canvas rendering.
 * Replaces ad-hoc ctx.font = '...' strings with typed, consistent specs.
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

export const FONTS: Record<string, FontSpec> = {
  title:   { name: '"Noto Sans KR", sans-serif', size: 28, weight: 'bold' },
  subtitle:{ name: '"Noto Sans KR", sans-serif', size: 18, weight: 'bold' },
  hud:     { name: '"Noto Sans KR", sans-serif', size: 12, weight: 'bold' },
  label:   { name: '"Noto Sans KR", sans-serif', size: 10, weight: 'normal' },
  score:   { name: '"Noto Sans KR", sans-serif', size: 32, weight: '900' },
  button:  { name: '"Noto Sans KR", sans-serif', size: 14, weight: 'bold' },
  small:   { name: '"Noto Sans KR", sans-serif', size: 9, weight: 'normal' },
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
