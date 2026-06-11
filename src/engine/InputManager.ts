export class InputManager {
  private canvas: HTMLCanvasElement
  private joystickActive = false
  private joystickStartX = 0
  private joystickStartY = 0

  moveX = 0
  moveY = 0
  firePressed = false
  actionPressed = false

  private readonly JOYSTICK_DEADZONE = 10
  private readonly MAX_JOYSTICK_DIST = 60

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.bindEvents()
  }

  private bindEvents() {
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false })
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
    this.canvas.addEventListener('touchend', this.onTouchEnd, { passive: false })
    this.canvas.addEventListener('touchcancel', this.onTouchEnd, { passive: false })
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  private keysDown = new Set<string>()

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysDown.add(e.key.toLowerCase())
    if (e.key === ' ' || e.key === 'Enter') this.firePressed = true
    if (e.key === 'Shift') this.actionPressed = true
    this.updateKeyboardMovement()
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.key.toLowerCase())
    if (e.key === ' ' || e.key === 'Enter') this.firePressed = false
    if (e.key === 'Shift') this.actionPressed = false
    this.updateKeyboardMovement()
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
    const touch = e.changedTouches[0]
    if (!touch) return

    const rect = this.canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    const width = rect.width
    const height = rect.height

    const isFireButton = x > width * 0.7 && y > height * 0.7

    if (isFireButton) {
      this.firePressed = true
    } else {
      this.joystickActive = true
      this.joystickStartX = x
      this.joystickStartY = y
    }
  }

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (!this.joystickActive) return
    const touch = e.changedTouches[0]
    if (!touch) return

    const rect = this.canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const dx = x - this.joystickStartX
    const dy = y - this.joystickStartY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < this.JOYSTICK_DEADZONE) {
      this.moveX = 0
      this.moveY = 0
      return
    }

    const maxDist = this.MAX_JOYSTICK_DIST
    const clampedDist = Math.min(dist, maxDist)
    this.moveX = (dx / dist) * (clampedDist / maxDist)
    this.moveY = (dy / dist) * (clampedDist / maxDist)
  }

  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault()
    this.joystickActive = false
    this.moveX = 0
    this.moveY = 0
    this.firePressed = false
    this.actionPressed = false
  }

  get isJoystickActive(): boolean {
    return this.joystickActive
  }

  get joystickOrigin(): { x: number; y: number } {
    return { x: this.joystickStartX, y: this.joystickStartY }
  }

  destroy() {
    this.canvas.removeEventListener('touchstart', this.onTouchStart)
    this.canvas.removeEventListener('touchmove', this.onTouchMove)
    this.canvas.removeEventListener('touchend', this.onTouchEnd)
    this.canvas.removeEventListener('touchcancel', this.onTouchEnd)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }
}