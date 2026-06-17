/**
 * InputManager — Multi-touch + keyboard input handler for Canvas games.
 *
 * Features:
 * - Multi-touch: movement + fire independent
 * - Virtual joystick with adaptive deadzone
 * - Haptic feedback integration (Capacitor)
 * - Touch state tracking for proper cleanup
 * - Analog input smoothing
 */

export class InputManager {
  private canvas: HTMLCanvasElement
  private touchStates = new Map<number, {
    startX: number
    startY: number
    currentX: number
    currentY: number
    isFire: boolean
    active: boolean
  }>()

  moveX = 0
  moveY = 0
  firePressed = false
  actionPressed = false

  // Adaptive joystick parameters
  private readonly JOYSTICK_DEADZONE = 15
  private readonly MAX_JOYSTICK_DIST = 80
  private readonly JOYSTICK_SENSITIVITY = 1.2
  private hasFocus = true

  // Input smoothing
  private smoothMoveX = 0
  private smoothMoveY = 0
  private readonly SMOOTHING_FACTOR = 0.85

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    // Prevent browser touch gesture delay (scroll, zoom) on the game canvas
    this.canvas.style.touchAction = 'none'
    this.bindEvents()
  }

  private bindEvents() {
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false })
    this.canvas.addEventListener('touchcancel', this.onTouchCancel, { passive: false })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private keysDown = new Set<string>()

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.hasFocus) return
    // Prevent default for game keys to avoid browser shortcuts
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault()
    }

    this.keysDown.add(e.key.toLowerCase())
    if (e.key === ' ' || e.key === 'Enter') this.firePressed = true
    if (e.key === 'Shift') this.actionPressed = true
    this.updateKeyboardMovement()
  }

  private onKeyUp = (e: KeyboardEvent) => {
    if (!this.hasFocus) return
    this.keysDown.delete(e.key.toLowerCase())
    if (e.key === ' ' || e.key === 'Enter') this.firePressed = false
    if (e.key === 'Shift') this.actionPressed = false
    this.updateKeyboardMovement()
  }

  setFocused(focused: boolean) {
    this.hasFocus = focused
  }

  private updateKeyboardMovement() {
    let dx = 0
    let dy = 0
    if (this.keysDown.has('w') || this.keysDown.has('arrowup')) dy -= 1
    if (this.keysDown.has('s') || this.keysDown.has('arrowdown')) dy += 1
    if (this.keysDown.has('a') || this.keysDown.has('arrowleft')) dx -= 1
    if (this.keysDown.has('d') || this.keysDown.has('arrowright')) dx += 1

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy)
      this.moveX = dx / len
      this.moveY = dy / len
    } else {
      this.moveX = 0
      this.moveY = 0
    }
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (!touch) continue

      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const width = rect.width
      const height = rect.height

      // Right half = fire button zone
      const isFireButton = x > width * 0.55

      this.touchStates.set(touch.identifier, {
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        isFire: isFireButton,
        active: true,
      })

      if (isFireButton) {
        this.firePressed = true
        this.triggerHapticFeedback()
      }
    }

    this.updateJoystickState()
  }

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    const rect = this.canvas.getBoundingClientRect()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const state = this.touchStates.get(touch.identifier)
      if (!state || !state.active) continue

      state.currentX = touch.clientX - rect.left
      state.currentY = touch.clientY - rect.top
    }

    this.updateJoystickState()
  }

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const state = this.touchStates.get(touch.identifier)
      if (!state) continue

      state.active = false
      if (state.isFire) {
        this.firePressed = false
      }
    }

    this.updateJoystickState()
  }

  private onTouchCancel = (e: TouchEvent) => {
    e.preventDefault()

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      const state = this.touchStates.get(touch.identifier)
      if (!state) continue

      state.active = false
      if (state.isFire) {
        this.firePressed = false
      }
    }

    this.updateJoystickState()
  }

  private updateJoystickState() {
    let dx = 0
    let dy = 0
    let hasJoystick = false

    for (const [id, state] of this.touchStates) {
      if (!state.active || state.isFire) continue

      hasJoystick = true
      const touchDx = state.currentX - state.startX
      const touchDy = state.currentY - state.startY
      const dist = Math.sqrt(touchDx * touchDx + touchDy * touchDy)

      if (dist > this.JOYSTICK_DEADZONE) {
        const maxDist = this.MAX_JOYSTICK_DIST
        const clampedDist = Math.min(dist, maxDist)
        const normalizedDist = clampedDist / maxDist

        // Apply sensitivity curve for better responsiveness
        const sensitivity = Math.pow(normalizedDist, 1 / this.JOYSTICK_SENSITIVITY)

        dx += (touchDx / dist) * sensitivity
        dy += (touchDy / dist) * sensitivity
      }
    }

    // Smooth input changes for better feel
    this.smoothMoveX = this.smoothMoveX * this.SMOOTHING_FACTOR + dx * (1 - this.SMOOTHING_FACTOR)
    this.smoothMoveY = this.smoothMoveY * this.SMOOTHING_FACTOR + dy * (1 - this.SMOOTHING_FACTOR)

    if (!hasJoystick) {
      this.smoothMoveX *= this.SMOOTHING_FACTOR
      this.smoothMoveY *= this.SMOOTHING_FACTOR

      // Snap to zero if very small
      if (Math.abs(this.smoothMoveX) < 0.01) this.smoothMoveX = 0
      if (Math.abs(this.smoothMoveY) < 0.01) this.smoothMoveY = 0
    }

    this.moveX = this.smoothMoveX
    this.moveY = this.smoothMoveY
  }

  private triggerHapticFeedback(): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10)
    }
  }

  get isJoystickActive(): boolean {
    for (const state of this.touchStates.values()) {
      if (state.active && !state.isFire) return true
    }
    return false
  }

  get joystickOrigin(): { x: number; y: number } {
    for (const state of this.touchStates.values()) {
      if (state.active && !state.isFire) {
        return { x: state.startX, y: state.startY }
      }
    }
    return { x: 0, y: 0 }
  }

  /** Reset all touch state (useful for pause/resume) */
  reset() {
    this.touchStates.clear()
    this.moveX = 0
    this.moveY = 0
    this.firePressed = false
    this.actionPressed = false
    this.smoothMoveX = 0
    this.smoothMoveY = 0
  }

  destroy() {
    this.hasFocus = false
    this.canvas.removeEventListener('touchstart', this.onTouchStart)
    this.canvas.removeEventListener('touchmove', this.onTouchMove)
    this.canvas.removeEventListener('touchend', this.onTouchEnd)
    this.canvas.removeEventListener('touchcancel', this.onTouchCancel)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}
