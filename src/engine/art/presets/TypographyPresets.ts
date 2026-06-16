export const FONT = {
  family: '"Nunito", "Segoe UI", sans-serif',
  weights: { normal: 600, semibold: 700, bold: 800 },
  sizes: {
    xs: 10, sm: 12, base: 14, lg: 18, xl: 24, xxl: 32, xxxl: 44,
  },
} as const

export const RADII = {
  sm: 6, base: 10, lg: 14, xl: 20, full: 9999,
} as const

export const SHADOW = {
  float: '0 10px 0 rgba(29,22,27,0.08), 0 20px 26px rgba(29,22,27,0.10)',
  lg: '0 8px 24px rgba(29,22,27,0.14)',
} as const
