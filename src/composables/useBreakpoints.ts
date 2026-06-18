import { computed, onUnmounted } from 'vue'

export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints: Record<BreakpointName, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useBreakpoints() {
  const matches: Record<BreakpointName, boolean> = {} as Record<BreakpointName, boolean>
  const listeners: Array<{ mq: MediaQueryList; handler: (e: MediaQueryListEvent) => void }> = []

  for (const [name, width] of Object.entries(breakpoints) as [BreakpointName, number][]) {
    const mq = window.matchMedia(`(min-width: ${width}px)`)
    matches[name] = mq.matches
    const handler = (e: MediaQueryListEvent) => { matches[name] = e.matches }
    mq.addEventListener('change', handler)
    listeners.push({ mq, handler })
  }

  onUnmounted(() => {
    for (const { mq, handler } of listeners) {
      mq.removeEventListener('change', handler)
    }
  })

  return {
    is: computed(() => {
      const m = {} as Record<BreakpointName, boolean>
      for (const name of Object.keys(breakpoints) as BreakpointName[]) {
        m[name] = matches[name]
      }
      return m
    }),
    isSm: computed(() => matches.sm),
    isMd: computed(() => matches.md),
    isLg: computed(() => matches.lg),
    isXl: computed(() => matches.xl),
    is2Xl: computed(() => matches['2xl']),
  }
}
