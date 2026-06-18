import { computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { Capacitor } from '@capacitor/core'
import { useBreakpoints } from './useBreakpoints'

export type GamePlatformMode = 'handheld' | 'tablet' | 'desktop'
export type ScreenOrientation = 'landscape' | 'portrait'

export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface GamePlatformSnapshot {
  width: number
  height: number
  isCoarsePointer: boolean
  isNativePlatform: boolean
  isStandalone: boolean
  orientation: ScreenOrientation
  safeArea: SafeAreaInsets
}

export interface GamePlatformLayout extends GamePlatformSnapshot {
  mode: GamePlatformMode
  shellClass: string
  usesSideHud: boolean
}

function getViewportSize() {
  const viewport = window.visualViewport
  return {
    width: Math.round(viewport?.width ?? window.innerWidth),
    height: Math.round(viewport?.height ?? window.innerHeight),
  }
}

export function detectSafeArea(): SafeAreaInsets {
  const computedStyle = getComputedStyle(document.documentElement)
  return {
    top: parseFloat(computedStyle.getPropertyValue('--safe-top')) || 0,
    right: parseFloat(computedStyle.getPropertyValue('--safe-right')) || 0,
    bottom: parseFloat(computedStyle.getPropertyValue('--safe-bottom')) || 0,
    left: parseFloat(computedStyle.getPropertyValue('--safe-left')) || 0,
  }
}

function detectOrientation(width: number, height: number): ScreenOrientation {
  return width >= height ? 'landscape' : 'portrait'
}

function detectSnapshot(): GamePlatformSnapshot {
  const viewport = getViewportSize()
  return {
    ...viewport,
    isCoarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    isNativePlatform: Capacitor.isNativePlatform(),
    isStandalone: window.matchMedia?.('(display-mode: standalone)').matches ?? false,
    orientation: detectOrientation(viewport.width, viewport.height),
    safeArea: detectSafeArea(),
  }
}

export function resolveGamePlatformLayout(snapshot: GamePlatformSnapshot): GamePlatformLayout {
  const shortSide = Math.min(snapshot.width, snapshot.height)
  const longSide = Math.max(snapshot.width, snapshot.height)
  const isPhoneLike =
    snapshot.isNativePlatform ||
    snapshot.isStandalone ||
    shortSide < 520 ||
    (snapshot.isCoarsePointer && longSide < 920)

  if (isPhoneLike) {
    return {
      ...snapshot,
      mode: 'handheld',
      shellClass: 'game-layout-handheld',
      usesSideHud: false,
    }
  }

  const isTabletLike = snapshot.isCoarsePointer || snapshot.width < 1024
  return {
    ...snapshot,
    mode: isTabletLike ? 'tablet' : 'desktop',
    shellClass: isTabletLike ? 'game-layout-tablet' : 'game-layout-wide',
    usesSideHud: !isTabletLike,
  }
}

export function useGamePlatformLayout() {
  // Initialize with actual viewport dimensions to avoid desktop-default flash
  const viewport = getViewportSize()
  const snapshot = shallowRef<GamePlatformSnapshot>({
    width: viewport.width,
    height: viewport.height,
    isCoarsePointer: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    isNativePlatform: false,
    isStandalone: false,
    orientation: detectOrientation(viewport.width, viewport.height),
    safeArea: { top: 0, right: 0, bottom: 0, left: 0 },
  })

  const layout = computed(() => resolveGamePlatformLayout(snapshot.value))

  function refreshLayout() {
    snapshot.value = detectSnapshot()
  }

  onMounted(() => {
    refreshLayout()
    window.addEventListener('resize', refreshLayout)
    window.addEventListener('orientationchange', refreshLayout)
    window.visualViewport?.addEventListener('resize', refreshLayout)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', refreshLayout)
    window.removeEventListener('orientationchange', refreshLayout)
    window.visualViewport?.removeEventListener('resize', refreshLayout)
  })

  return {
    layout,
    snapshot,
    refreshLayout,
  }
}

export function useResponsiveLayout() {
  const { layout, snapshot, refreshLayout } = useGamePlatformLayout()
  const breakpoints = useBreakpoints()

  return {
    layout,
    snapshot,
    breakpoints,
    refreshLayout,
  }
}
