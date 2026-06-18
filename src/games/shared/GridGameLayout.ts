import {
  computeResponsiveGridLayout,
  classifyDevice,
  getDeviceGridPreset,
  type ResponsiveGridLayout,
} from './responsiveGridLayout'

/**
 * Pre-configured responsive grid layout for common game grid sizes.
 * Handles device classification, DPR scaling, and resize recalculation.
 *
 * Usage in games:
 *   this.gridLayout = new GridGameLayout({ rows: 4, cols: 4, topReservedRatio: 0.15 })
 *   this.gridLayout.setSize(this.width, this.height, this.dpr)
 *   // In render():
 *   const { cellSize, gap, boardX, boardY } = this.gridLayout.layout
 */

export interface GridGameLayoutOptions {
  rows: number
  cols: number
  /** Reserved space at top as ratio of canvas height (0-1). Default: 0.15 */
  topReservedRatio?: number
  /** Reserved space at bottom as ratio of canvas height (0-1). Default: 0.05 */
  bottomReservedRatio?: number
  /** Horizontal padding as ratio of canvas width (0-1). Default: 0.05 */
  horizontalPaddingRatio?: number
  /** Override device category (for testing). Default: auto-detected */
  deviceCategory?: string
}

export class GridGameLayout {
  public layout: ResponsiveGridLayout = {
    cellSize: 0,
    gap: 0,
    boardX: 0,
    boardY: 0,
    boardWidth: 0,
    boardHeight: 0,
  }

  private rows: number
  private cols: number
  private topReservedRatio: number
  private bottomReservedRatio: number
  private horizontalPaddingRatio: number
  private deviceCategoryOverride?: string
  private lastWidth = 0
  private lastHeight = 0
  private lastDpr = 1

  constructor(options: GridGameLayoutOptions) {
    this.rows = options.rows
    this.cols = options.cols
    this.topReservedRatio = options.topReservedRatio ?? 0.15
    this.bottomReservedRatio = options.bottomReservedRatio ?? 0.05
    this.horizontalPaddingRatio = options.horizontalPaddingRatio ?? 0.05
    this.deviceCategoryOverride = options.deviceCategory
  }

  setSize(width: number, height: number, dpr: number): void {
    if (width === this.lastWidth && height === this.lastHeight && dpr === this.lastDpr) {
      return
    }
    this.lastWidth = width
    this.lastHeight = height
    this.lastDpr = dpr

    const category =
      this.deviceCategoryOverride ?? classifyDevice(width / dpr, height / dpr)
    const preset = getDeviceGridPreset(category as any, dpr)

    this.layout = computeResponsiveGridLayout({
      canvasWidth: width,
      canvasHeight: height,
      rows: this.rows,
      cols: this.cols,
      dpr,
      topReserved: Math.floor(height * this.topReservedRatio),
      bottomReserved: Math.floor(height * this.bottomReservedRatio),
      minCellSize: preset.minCellSize,
      maxCellSize: preset.maxCellSize,
      gap: preset.gap,
      horizontalPadding: Math.floor(width * this.horizontalPaddingRatio),
    })
  }

  /** Get the position of a cell in canvas coordinates */
  cellPosition(col: number, row: number): { x: number; y: number } {
    return {
      x: this.layout.boardX + col * (this.layout.cellSize + this.layout.gap),
      y: this.layout.boardY + row * (this.layout.cellSize + this.layout.gap),
    }
  }

  /** Get the center of a cell in canvas coordinates */
  cellCenter(col: number, row: number): { x: number; y: number } {
    const pos = this.cellPosition(col, row)
    return {
      x: pos.x + this.layout.cellSize / 2,
      y: pos.y + this.layout.cellSize / 2,
    }
  }

  /** Convert canvas coordinates to grid cell (or null if outside board) */
  coordsToCell(cx: number, cy: number): { col: number; row: number } | null {
    const { boardX, boardY, cellSize, gap, boardWidth, boardHeight } = this.layout
    if (cx < boardX || cx > boardX + boardWidth || cy < boardY || cy > boardY + boardHeight) {
      return null
    }
    const col = Math.floor((cx - boardX) / (cellSize + gap))
    const row = Math.floor((cy - boardY) / (cellSize + gap))
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return null
    }
    return { col, row }
  }
}
