import { computed } from 'vue'

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

  for (const [name, width] of Object.entries(breakpoints) as [BreakpointName, number][]) {
    const mediaQuery = window.matchMedia(`(min-width: ${width}px)`)
    matches[name] = mediaQuery.matches
  }

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
