/**
 * GameStateMachine — Manages game state transitions:
 * menu → intro (countdown) → playing → gameover
 *
 * Usage (in each game's init):
 *   this.stateMachine = new GameStateMachine()
 *   this.stateMachine.startIntro()
 *
 * In update(dt):
 *   this.stateMachine.update(dt)
 *   if (this.stateMachine.shouldTriggerEffects()) { ... }
 *
 * In render:
 *   const state = this.stateMachine.getState()
 *   // use state to draw appropriate overlay
 *
 * Event-based usage (optional, additive):
 *   this.stateMachine.onStateChange((phase, transition) => { ... })
 */

export type GamePhase = 'menu' | 'intro' | 'playing' | 'gameover'

export type StateTransition = {
  from: GamePhase
  to: GamePhase
}

export type GameStateHandler = (state: GamePhase, transition: StateTransition) => void

export class GameStateMachine {
  private _state: GamePhase = 'intro'
  private _introTimer = 0
  private _introPhase = 0
  private _introPhaseDuration = 800 // ms per countdown number
  private _listeners: GameStateHandler[] = []
  private _lastState: GamePhase = 'intro'

  get state(): GamePhase { return this._state }
  get introProgress(): number {
    if (this._state !== 'intro') return 0
    return Math.min(1, this._introTimer / (this._introPhaseDuration * 4))
  }
  get introPhase(): number { return this._introPhase }

  getState(): GamePhase { return this._state }

  getIntroProgress(): number {
    return this.introProgress
  }

  startIntro(): void {
    this._state = 'intro'
    this._introTimer = 0
    this._introPhase = 0
  }

  update(dt: number): void {
    if (this._state !== 'intro') return
    this._introTimer += dt
    const totalPhases = 4
    const newPhase = Math.min(totalPhases - 1, Math.floor(this._introTimer / this._introPhaseDuration))
    if (newPhase !== this._introPhase) {
      this._introPhase = newPhase
    }
    if (this._introTimer > totalPhases * this._introPhaseDuration) {
      this._state = 'playing'
      this._introTimer = 0
      this._introPhase = 0
      this.emitStateChange('playing')
    }
  }

  shouldTriggerEffects(): boolean {
    return this._introPhase === 3 && this._state === 'intro'
  }

  setPlaying(): void {
    this._state = 'playing'
    this._introTimer = 0
    this._introPhase = 0
    this.emitStateChange('playing')
  }

  setGameOver(): void {
    this._state = 'gameover'
    this.emitStateChange('gameover')
  }

  reset(): void {
    this._state = 'intro'
    this._introTimer = 0
    this._introPhase = 0
    this.emitStateChange('intro')
  }

  onStateChange(handler: GameStateHandler): () => void {
    this._listeners.push(handler)
    return () => {
      const idx = this._listeners.indexOf(handler)
      if (idx >= 0) this._listeners.splice(idx, 1)
    }
  }

  private emitStateChange(newState: GamePhase): void {
    if (newState !== this._lastState) {
      const transition: StateTransition = { from: this._lastState, to: newState }
      this._listeners.forEach(handler => handler(newState, transition))
      this._lastState = newState
    }
  }
}
