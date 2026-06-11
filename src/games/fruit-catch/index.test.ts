import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createFruitCatchGame } from './index'

describe('FruitCatchGame - Touch Input Edge Cases', () => {
  let game: any
  let canvas: HTMLCanvasElement
  let mockCallbacks: any

  beforeEach(() => {
    // Create a mock canvas with proper context
    canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    
    // Mock canvas context to prevent rendering errors
    const mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      translate: vi.fn(),
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      ellipse: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'left',
      textBaseline: 'top',
      font: '',
      shadowColor: '',
      shadowBlur: 0,
    } as any
    
    canvas.getContext = vi.fn(() => mockCtx)

    // Mock callbacks
    mockCallbacks = {
      onScoreUpdate: vi.fn(),
      onStatsUpdate: vi.fn(),
      onHudUpdate: vi.fn(),
      onGameOver: vi.fn(),
      onRewardEvent: vi.fn(),
    }

    // Create game instance
    game = createFruitCatchGame()
    game.start(canvas, mockCallbacks)
  })

  afterEach(() => {
    game.stop()
  })

  describe('handleTouchStart - activeTouchId protection', () => {
    it('should not steal activeTouchId when a second touch starts', () => {
      // Simulate first touch starting
      const firstTouch = {
        identifier: 1,
        clientX: 100,
        clientY: 300,
        target: canvas,
      } as any

      const firstTouchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      })
      
      // Mock the touches and changedTouches
      Object.defineProperty(firstTouchEvent, 'touches', {
        value: [firstTouch],
        enumerable: true,
      })
      Object.defineProperty(firstTouchEvent, 'changedTouches', {
        value: [firstTouch],
        enumerable: true,
      })

      // Dispatch first touch
      canvas.dispatchEvent(firstTouchEvent)

      // Get the active touch ID after first touch
      const activeIdAfterFirstTouch = game.activeTouchId

      // Verify first touch was registered
      expect(activeIdAfterFirstTouch).toBe(1)

      // Simulate second touch starting (multi-touch scenario)
      const secondTouch = {
        identifier: 2,
        clientX: 700,
        clientY: 300,
        target: canvas,
      } as any

      const secondTouchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      })
      
      // Mock the touches and changedTouches for second touch
      Object.defineProperty(secondTouchEvent, 'touches', {
        value: [firstTouch, secondTouch],
        enumerable: true,
      })
      Object.defineProperty(secondTouchEvent, 'changedTouches', {
        value: [secondTouch],
        enumerable: true,
      })

      // Dispatch second touch
      canvas.dispatchEvent(secondTouchEvent)

      // Get the active touch ID after second touch
      const activeIdAfterSecondTouch = game.activeTouchId

      // REGRESSION TEST: activeTouchId should NOT change to the second touch
      // It should remain bound to the first touch (identifier 1)
      expect(activeIdAfterSecondTouch).toBe(1)
      expect(activeIdAfterSecondTouch).not.toBe(2)
    })

    it('should allow normal single-touch movement after first touch', () => {
      // Simulate first touch starting
      const firstTouch = {
        identifier: 1,
        clientX: 100,
        clientY: 300,
        target: canvas,
      } as any

      const firstTouchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      })
      
      Object.defineProperty(firstTouchEvent, 'touches', {
        value: [firstTouch],
        enumerable: true,
      })
      Object.defineProperty(firstTouchEvent, 'changedTouches', {
        value: [firstTouch],
        enumerable: true,
      })

      canvas.dispatchEvent(firstTouchEvent)

      // Verify first touch is active
      expect(game.activeTouchId).toBe(1)

      // Simulate movement of first touch
      const movedFirstTouch = {
        identifier: 1,
        clientX: 400,
        clientY: 300,
        target: canvas,
      } as any

      const moveTouchEvent = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
      })
      
      Object.defineProperty(moveTouchEvent, 'touches', {
        value: [movedFirstTouch],
        enumerable: true,
      })
      Object.defineProperty(moveTouchEvent, 'changedTouches', {
        value: [movedFirstTouch],
        enumerable: true,
      })

      canvas.dispatchEvent(moveTouchEvent)

      // touchMoveX should be updated (moved to center, so direction should be 1)
      expect(game.touchMoveX).toBe(1)
    })

    it('should clear activeTouchId when the active touch ends', () => {
      // Simulate first touch starting
      const firstTouch = {
        identifier: 1,
        clientX: 100,
        clientY: 300,
        target: canvas,
      } as any

      const firstTouchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
      })
      
      Object.defineProperty(firstTouchEvent, 'touches', {
        value: [firstTouch],
        enumerable: true,
      })
      Object.defineProperty(firstTouchEvent, 'changedTouches', {
        value: [firstTouch],
        enumerable: true,
      })

      canvas.dispatchEvent(firstTouchEvent)
      expect(game.activeTouchId).toBe(1)

      // Simulate first touch ending
      const endTouchEvent = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
      })
      
      Object.defineProperty(endTouchEvent, 'touches', {
        value: [],
        enumerable: true,
      })
      Object.defineProperty(endTouchEvent, 'changedTouches', {
        value: [firstTouch],
        enumerable: true,
      })

      canvas.dispatchEvent(endTouchEvent)

      // activeTouchId should be cleared
      expect(game.activeTouchId).toBeNull()
      expect(game.touchMoveX).toBe(0)
    })
  })
})
