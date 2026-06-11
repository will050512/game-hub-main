/**
 * TransitionPresets — Pre-configured entrance/exit animation presets.
 *
 * Each preset describes a parameterized animation with easing, duration,
 * and target properties. Designed to be consumed by a tweening system
 * (e.g., GSAP, custom tween engine, or requestAnimationFrame loop).
 *
 * Usage:
 *   const preset = TRANSITION_PRESETS.popIn
 *   tweenEngine.apply(element, preset)
 */

/**
 * Configuration for a single animation transition.
 * All values are relative to the element's current state unless specified.
 */
export interface TransitionPreset {
  /** Duration in milliseconds */
  duration: number
  /** Easing function name (CSS easing or custom) */
  easing: string
  /** Scale animation: start → end */
  scale?: { start: number; end: number }
  /** Alpha animation: start → end */
  alpha?: { start: number; end: number }
  /** Position animation in world units */
  position?: {
    start: { x: number; y: number }
    end: { x: number; y: number }
  }
  /** Screen shake after animation completes */
  shake?: { intensity: number; duration: number }
  /** Rotation animation in degrees: start → end */
  rotation?: { start: number; end: number }
}

/**
 * Common easing functions mapped to CSS and common tween library names.
 */
export const EASING = {
  /** Standard ease-out — fast start, slow finish */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Standard ease-in — slow start, fast finish */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Standard ease-in-out — smooth ramp up and down */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Bounce — overshoots and settles */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  /** Elastic — oscillates then settles */
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  /** Quad ease-out — gentle parabolic */
  quadOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  /** Sine ease-in-out — smooth sinusoidal */
  sineInOut: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
} as const

/**
 * Named transition presets for common animation patterns.
 */
export const TRANSITION_PRESETS: Record<string, TransitionPreset> = {
  /**
   * Pop-in: entity appears from scale 0 with elastic bounce.
   * Use for: entity spawn, UI element entrance.
   */
  popIn: {
    duration: 400,
    easing: EASING.elastic,
    scale: { start: 0, end: 1 },
    alpha: { start: 0, end: 1 },
  },

  /**
   * Slam-in: entity drops from above with bounce.
   * Use for: dramatic entrance, player spawn, boss appearance.
   */
  slamIn: {
    duration: 500,
    easing: EASING.bounce,
    position: { start: { x: 0, y: -100 }, end: { x: 0, y: 0 } },
    scale: { start: 1.2, end: 1 },
    shake: { intensity: 0.01, duration: 100 },
  },

  /**
   * Fade-in: gentle fade with no position change.
   * Use for: UI overlays, text appearance, soft reveals.
   */
  fadeIn: {
    duration: 300,
    easing: EASING.quadOut,
    alpha: { start: 0, end: 1 },
  },

  /**
   * Fade-out: gentle fade away.
   * Use for: UI dismissal, element removal, soft death.
   */
  fadeOut: {
    duration: 300,
    easing: EASING.easeIn,
    alpha: { start: 1, end: 0 },
  },

  /**
   * Slide-up: slide from below with bounce.
   * Use for: bottom panel entrance, score panel, HUD pop-up.
   */
  slideUp: {
    duration: 400,
    easing: EASING.easeOut,
    position: { start: { x: 0, y: 50 }, end: { x: 0, y: 0 } },
    alpha: { start: 0, end: 1 },
  },

  /**
   * Slide-down: slide away downward.
   * Use for: element dismissal, panel exit.
   */
  slideDown: {
    duration: 300,
    easing: EASING.easeIn,
    position: { start: { x: 0, y: 0 }, end: { x: 0, y: 50 } },
    alpha: { start: 1, end: 0 },
  },

  /**
   * Pop-out: shrink and fade away.
   * Use for: non-destructive removal, UI element exit.
   */
  popOut: {
    duration: 300,
    easing: EASING.easeIn,
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
  },

  /**
   * Explode: scale up then fade (for death).
   * Use for: entity destruction, explosive death animation.
   */
  explode: {
    duration: 400,
    easing: EASING.easeIn,
    scale: { start: 1, end: 2 },
    alpha: { start: 1, end: 0 },
    shake: { intensity: 0.02, duration: 200 },
  },

  /**
   * Pulse: brief scale pulse.
   * Use for: feedback on score, selection highlight, interaction pulse.
   */
  pulse: {
    duration: 200,
    easing: EASING.sineInOut,
    scale: { start: 1, end: 1.2 },
  },

  /**
   * Spin-in: rotate while scaling in.
   * Use for: collectible entrance, item appearance.
   */
  spinIn: {
    duration: 500,
    easing: EASING.elastic,
    scale: { start: 0, end: 1 },
    rotation: { start: 180, end: 0 },
    alpha: { start: 0, end: 1 },
  },

  /**
   * Shake: screen shake for impact feedback.
   * Use for: hit feedback, damage, collision.
   */
  shake: {
    duration: 150,
    easing: EASING.easeInOut,
    shake: { intensity: 0.015, duration: 150 },
  },

  /**
   * Flash: quick brightness pulse.
   * Use for: hit flash, critical indicator, attention grab.
   */
  flash: {
    duration: 100,
    easing: EASING.sineInOut,
    alpha: { start: 0.8, end: 0 },
  },

  /**
   * Float-in: gentle upward float with fade.
   * Use for: score text, floating UI elements, combo indicators.
   */
  floatIn: {
    duration: 600,
    easing: EASING.easeOut,
    position: { start: { x: 0, y: 0 }, end: { x: 0, y: -40 } },
    alpha: { start: 1, end: 0 },
    scale: { start: 0.8, end: 1.2 },
  },
} as const

/**
 * Interpolates a transition preset at a given progress (0-1).
 * Returns the current state values for the given time position.
 *
 * @param preset - The transition preset
 * @param progress - Normalized time (0 = start, 1 = end)
 * @param easingFn - Easing function (e.g., t => t for linear)
 * @returns Current interpolated values
 */
export function interpolatePreset(
  preset: TransitionPreset,
  progress: number,
  easingFn: (t: number) => number = (t) => t,
): {
  scale?: number
  alpha?: number
  position?: { x: number; y: number }
  rotation?: number
} {
  const t = easingFn(Math.min(1, Math.max(0, progress)))
  const result: { scale?: number; alpha?: number; position?: { x: number; y: number }; rotation?: number } = {}

  if (preset.scale) {
    result.scale = lerp(preset.scale.start, preset.scale.end, t)
  }

  if (preset.alpha) {
    result.alpha = lerp(preset.alpha.start, preset.alpha.end, t)
  }

  if (preset.position) {
    result.position = {
      x: lerp(preset.position.start.x, preset.position.end.x, t),
      y: lerp(preset.position.start.y, preset.position.end.y, t),
    }
  }

  if (preset.rotation) {
    result.rotation = lerp(preset.rotation.start, preset.rotation.end, t)
  }

  return result
}

/**
 * Linear interpolation between two values.
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Common easing implementations for JavaScript usage.
 */
export const EasingFunctions = {
  linear: (t: number): number => t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeOutBack: (t: number): number => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625
    const d1 = 2.75
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  },
  easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2,
  easeOutElastic: (t: number): number => {
    if (t === 0 || t === 1) return t
    const p = 0.3
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1
  },
}
