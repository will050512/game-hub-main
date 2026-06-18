import { onMounted, onUnmounted } from 'vue'

/**
 * Unified SafeArea management.
 *
 * Solves the circular dependency where:
 *  - detectSafeArea() reads CSS vars (--safe-top etc.)
 *  - But nobody writes those CSS vars
 *  - The actual values only exist in browser's env(safe-area-inset-*)
 *
 * This module bridges the gap by:
 *  1. Creating an off-screen measurement element using env() values
 *  2. Reading the computed padding to extract numeric values
 *  3. Writing those values back as CSS custom properties on :root
 *  4. Exposing the same values for JS consumption
 *
 * Usage:
 *  - CSS: `padding: var(--safe-top, 0px)`
 *  - JS:  `const { safeArea } = useSafeArea()`
 */

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

let _measureEl: HTMLDivElement | null = null
let _cssVarUpdater: (() => void) | null = null

/**
 * Detect safe area insets by measuring env() values through a hidden element.
 * This works on iOS Safari / WKWebView where env() is natively supported.
 */
export function detectSafeAreaInsets(): SafeAreaInsets {
  // Fast path: if env() is NOT supported (desktop, Android WebView), return zeros
  if (typeof CSS === 'undefined' || !CSS.supports) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  // Check if env() is supported at all
  try {
    const supportsEnv = CSS.supports('padding-top', 'env(safe-area-inset-top, 0px)')
    if (!supportsEnv) {
      return { top: 0, right: 0, bottom: 0, left: 0 }
    }
  } catch {
    // CSS.supports might throw for env() in some environments
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  // Create or reuse measurement element
  if (!_measureEl) {
    _measureEl = document.createElement('div')
    _measureEl.setAttribute('aria-hidden', 'true')
    _measureEl.style.cssText =
      'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;'
    document.body.appendChild(_measureEl)
  }

  // Set env() as padding, then read computed box model
  _measureEl.style.paddingTop = 'env(safe-area-inset-top, 0px)'
  _measureEl.style.paddingRight = 'env(safe-area-inset-right, 0px)'
  _measureEl.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)'
  _measureEl.style.paddingLeft = 'env(safe-area-inset-left, 0px)'

  // Force synchronous layout recalculation
  void _measureEl.offsetHeight

  const cs = getComputedStyle(_measureEl)
  return {
    top: Math.round(parseFloat(cs.paddingTop) || 0),
    right: Math.round(parseFloat(cs.paddingRight) || 0),
    bottom: Math.round(parseFloat(cs.paddingBottom) || 0),
    left: Math.round(parseFloat(cs.paddingLeft) || 0),
  }
}

/**
 * Apply detected safe area values to CSS custom properties on :root.
 * This makes var(--safe-top) etc. available everywhere in CSS.
 */
export function applySafeAreaToCSS(insets: SafeAreaInsets): void {
  const root = document.documentElement
  root.style.setProperty('--safe-top', `${insets.top}px`)
  root.style.setProperty('--safe-right', `${insets.right}px`)
  root.style.setProperty('--safe-bottom', `${insets.bottom}px`)
  root.style.setProperty('--safe-left', `${insets.left}px`)
}

/**
 * Initialize safe area detection + CSS variable sync.
 * Call this once at app startup (in main.ts).
 *
 * Also sets up a periodic re-check (for orientation changes on iOS).
 */
export function initSafeArea(): void {
  const insets = detectSafeAreaInsets()
  applySafeAreaToCSS(insets)

  // Re-check on resize and orientation change (for iOS landscape/portrait)
  const recheck = () => {
    const fresh = detectSafeAreaInsets()
    applySafeAreaToCSS(fresh)
  }

  window.addEventListener('resize', recheck, { passive: true })
  window.addEventListener('orientationchange', recheck, { passive: true })
  window.visualViewport?.addEventListener('resize', recheck, { passive: true })

  _cssVarUpdater = recheck

  // Cleanup on page hide (Capacitor app backgrounding)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') recheck()
  })
}

/**
 * Clean up safe area event listeners (for testing).
 */
export function cleanupSafeArea(): void {
  if (_cssVarUpdater) {
    window.removeEventListener('resize', _cssVarUpdater)
    window.removeEventListener('orientationchange', _cssVarUpdater)
    window.visualViewport?.removeEventListener('resize', _cssVarUpdater)
    _cssVarUpdater = null
  }
  if (_measureEl) {
    _measureEl.remove()
    _measureEl = null
  }
}

/**
 * Vue composable for reactive safe area access.
 * Returns the current CSS variable values (set by initSafeArea).
 */
export function useSafeArea() {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 }

  function readSafeArea(): SafeAreaInsets {
    const cs = getComputedStyle(document.documentElement)
    const top = parseFloat(cs.getPropertyValue('--safe-top')) || 0
    const right = parseFloat(cs.getPropertyValue('--safe-right')) || 0
    const bottom = parseFloat(cs.getPropertyValue('--safe-bottom')) || 0
    const left = parseFloat(cs.getPropertyValue('--safe-left')) || 0

    Object.assign(insets, { top, right, bottom, left })
    return insets as SafeAreaInsets
  }

  onMounted(() => {
    readSafeArea()
    window.addEventListener('resize', readSafeArea, { passive: true })
    window.addEventListener('orientationchange', readSafeArea, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('resize', readSafeArea)
    window.removeEventListener('orientationchange', readSafeArea)
  })

  return {
    /** Reactive safe area insets (px) — updated on resize */
    safeArea: insets,
    /** Manually re-read from CSS variables */
    refresh: readSafeArea,
    /** Whether any safe area inset is non-zero */
    hasSafeArea: () =>
      insets.top > 0 || insets.right > 0 || insets.bottom > 0 || insets.left > 0,
  }
}
