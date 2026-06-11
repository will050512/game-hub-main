import { describe, expect, it } from 'vitest'
import { computeResponsiveGridLayout } from './responsiveGridLayout'

describe('computeResponsiveGridLayout', () => {
  it('keeps dense grid games inside a short landscape playfield', () => {
    const layout = computeResponsiveGridLayout({
      canvasWidth: 780,
      canvasHeight: 360,
      rows: 4,
      cols: 4,
      dpr: 1,
      topReserved: 92,
      bottomReserved: 74,
      minCellSize: 38,
      maxCellSize: 90,
      gap: 8,
      horizontalPadding: 18,
    })

    expect(layout.boardX).toBeGreaterThanOrEqual(18)
    expect(layout.boardY).toBeGreaterThanOrEqual(92)
    expect(layout.boardX + layout.boardWidth).toBeLessThanOrEqual(780 - 18)
    expect(layout.boardY + layout.boardHeight).toBeLessThanOrEqual(360 - 74)
    expect(layout.cellSize).toBeGreaterThanOrEqual(38)
  })
})
