/**
 * CanvasEffectsManager — Unified facade for all Canvas2D effects.
 *
 * Provides a single update/render cycle and convenience methods
 * for common effect patterns used across all 12 games.
 *
 * Usage:
 *   this.effects = new EffectsManager()
 *   this.effects.update(dt)
 *   this.effects.render(ctx)
 */

import { CanvasScreenShake } from './CanvasScreenShake.js'
import { CanvasParticles } from './CanvasParticles.js'
import { CanvasFloatingText } from './CanvasFloatingText.js'
import { CanvasComboText } from './CanvasComboText.js'
import { CanvasConfetti } from './CanvasConfetti.js'

export class EffectsManager {
  readonly shake: CanvasScreenShake
  readonly particles: CanvasParticles
  readonly floatingText: CanvasFloatingText
  readonly combo: CanvasComboText
  readonly confetti: CanvasConfetti

  constructor() {
    this.shake = new CanvasScreenShake()
    this.particles = new CanvasParticles(500)
    this.floatingText = new CanvasFloatingText()
    this.combo = new CanvasComboText()
    this.confetti = new CanvasConfetti()
  }

  triggerShake(intensity: number, duration: number): void {
    this.shake.trigger({ intensity, duration })
  }

  burst(x: number, y: number, count: number, colors: string[], speed?: { min: number; max: number }): void {
    this.particles.emit({
      count,
      colors,
      speed: speed ?? { min: 2, max: 8 },
      size: { start: 5, end: 0 },
      lifetime: 600,
      gravity: 0.1,
      opacity: { start: 1, end: 0 },
    }, x, y)
  }

  sparkle(x: number, y: number, color: string): void {
    this.particles.emit({
      count: 8,
      colors: [color, '#ffffff'],
      speed: { min: 1, max: 4 },
      size: { start: 4, end: 0 },
      lifetime: 800,
      gravity: 0,
      opacity: { start: 1, end: 0 },
    }, x, y)
  }

  spawnFloatingText(x: number, y: number, text: string, color: string): void {
    this.floatingText.spawn({ x, y, text, color })
  }

  comboHit(): void {
    this.combo.onHit()
  }

  triggerConfetti(count: number): void {
    this.confetti.burst(count)
  }

  update(dt: number): void {
    this.shake.update(dt)
    this.particles.update(dt)
    this.floatingText.update(dt)
    this.combo.update(dt)
    this.confetti.update(dt)
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.render(ctx)
    this.floatingText.render(ctx)
    this.combo.render(ctx)
    this.confetti.render(ctx)
  }
}
