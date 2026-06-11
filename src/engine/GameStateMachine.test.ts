import { describe, it, expect } from 'vitest'
import { GameStateMachine } from './GameStateMachine'

describe('GameStateMachine', () => {
  it('should start in intro state', () => {
    const m = new GameStateMachine()
    expect(m.getState()).toBe('intro')
    expect(m.introProgress).toBe(0)
  })

  it('should transition from intro to playing after countdown', () => {
    const m = new GameStateMachine()
    m.startIntro()
    expect(m.getState()).toBe('intro')

    // 4 phases * 800ms = 3200ms total
    m.update(4000)
    expect(m.getState()).toBe('playing')
    expect(m.introProgress).toBe(0)
  })

  it('should report GO! effects at phase 3', () => {
    const m = new GameStateMachine()
    m.startIntro()
    m.update(2500) // phase 3 (2400ms mark)
    expect(m.introPhase).toBe(3)
    expect(m.shouldTriggerEffects()).toBe(true)
  })

  it('should not trigger effects before phase 3', () => {
    const m = new GameStateMachine()
    m.startIntro()
    m.update(1000) // phase 1
    expect(m.introPhase).toBe(1)
    expect(m.shouldTriggerEffects()).toBe(false)
  })

  it('should set game over state', () => {
    const m = new GameStateMachine()
    m.setPlaying()
    m.setGameOver()
    expect(m.getState()).toBe('gameover')
  })

  it('should allow resetting to intro', () => {
    const m = new GameStateMachine()
    m.startIntro()
    m.update(4000)
    expect(m.getState()).toBe('playing')

    m.reset()
    expect(m.getState()).toBe('intro')
  })

  it('should track progress accurately', () => {
    const m = new GameStateMachine()
    m.startIntro()

    m.update(800)
    expect(Math.round(m.introProgress * 100)).toBe(25)

    m.update(800)
    expect(Math.round(m.introProgress * 100)).toBe(50)

    m.update(800)
    expect(Math.round(m.introProgress * 100)).toBe(75)

    m.update(800)
    expect(m.introProgress).toBe(1)
  })

  it('should stay in playing state after intro completes', () => {
    const m = new GameStateMachine()
    m.startIntro()
    m.update(5000)
    expect(m.getState()).toBe('playing')

    // Update should not change state while playing
    m.update(1000)
    expect(m.getState()).toBe('playing')
  })
})
