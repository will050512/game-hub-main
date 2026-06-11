export interface ResponsiveGridLayoutInput {
  canvasWidth: number
  canvasHeight: number
  rows: number
  cols: number
  dpr: number
  topReserved: number
  bottomReserved: number
  minCellSize: number
  maxCellSize: number
  gap: number
  horizontalPadding: number
}

export interface ResponsiveGridLayout {
  cellSize: number
  gap: number
  boardX: number
  boardY: number
  boardWidth: number
  boardHeight: number
}

export type DeviceCategory =
  | 'small-phone'
  | 'phone'
  | 'phablet'
  | 'small-tablet-portrait'
  | 'tablet-portrait'
  | 'small-tablet-landscape'
  | 'tablet-landscape'
  | 'small-desktop'
  | 'desktop'
  | 'large-desktop'

export function classifyDevice(width: number, height: number): DeviceCategory {
  const shortSide = Math.min(width, height)
  const longSide = Math.max(width, height)
  const isLandscape = width >= height

  if (shortSide < 360) return 'small-phone'
  if (shortSide < 520) return 'phone'
  if (shortSide < 640) return 'phablet'
  if (shortSide < 768 && !isLandscape) return 'small-tablet-portrait'
  if (shortSide < 1024 && !isLandscape) return 'tablet-portrait'
  if (shortSide < 800 && isLandscape) return 'small-tablet-landscape'
  if (shortSide < 1024 && isLandscape) return 'tablet-landscape'
  if (longSide < 1440) return 'small-desktop'
  if (longSide < 2560) return 'desktop'
  return 'large-desktop'
}

export function getDeviceGridPreset(category: DeviceCategory, dpr: number): {
  minCellSize: number
  maxCellSize: number
  gap: number
} {
  const base = Math.max(1, Math.round(dpr))
  switch (category) {
    case 'small-phone':
      return { minCellSize: 18 * base, maxCellSize: 32 * base, gap: 2 * base }
    case 'phone':
      return { minCellSize: 22 * base, maxCellSize: 40 * base, gap: 3 * base }
    case 'phablet':
      return { minCellSize: 26 * base, maxCellSize: 48 * base, gap: 3 * base }
    case 'small-tablet-portrait':
      return { minCellSize: 30 * base, maxCellSize: 56 * base, gap: 4 * base }
    case 'tablet-portrait':
      return { minCellSize: 34 * base, maxCellSize: 64 * base, gap: 4 * base }
    case 'small-tablet-landscape':
      return { minCellSize: 28 * base, maxCellSize: 52 * base, gap: 3 * base }
    case 'tablet-landscape':
      return { minCellSize: 32 * base, maxCellSize: 60 * base, gap: 4 * base }
    case 'small-desktop':
      return { minCellSize: 36 * base, maxCellSize: 72 * base, gap: 4 * base }
    case 'desktop':
      return { minCellSize: 40 * base, maxCellSize: 80 * base, gap: 5 * base }
    case 'large-desktop':
      return { minCellSize: 44 * base, maxCellSize: 96 * base, gap: 6 * base }
  }
}

export function computeResponsiveGridLayout(input: ResponsiveGridLayoutInput): ResponsiveGridLayout {
  const safeWidth = Math.max(input.canvasWidth, input.minCellSize * input.cols)
  const safeHeight = Math.max(input.canvasHeight, input.minCellSize * input.rows)
  const gap = Math.max(2 * input.dpr, input.gap)
  const availableWidth = Math.max(
    input.minCellSize * input.cols + gap * (input.cols - 1),
    safeWidth - input.horizontalPadding * 2,
  )
  const availableHeight = Math.max(
    input.minCellSize * input.rows + gap * (input.rows - 1),
    safeHeight - input.topReserved - input.bottomReserved,
  )
  const fitWidth = (availableWidth - gap * (input.cols - 1)) / input.cols
  const fitHeight = (availableHeight - gap * (input.rows - 1)) / input.rows
  const cellSize = Math.floor(Math.max(input.minCellSize, Math.min(input.maxCellSize, fitWidth, fitHeight)))
  const boardWidth = cellSize * input.cols + gap * (input.cols - 1)
  const boardHeight = cellSize * input.rows + gap * (input.rows - 1)
  const boardX = Math.floor((safeWidth - boardWidth) / 2)
  const availableTop = input.topReserved
  const availableBottom = safeHeight - input.bottomReserved - boardHeight
  const centeredY = Math.floor(input.topReserved + (safeHeight - input.topReserved - input.bottomReserved - boardHeight) / 2)
  const boardY = Math.floor(Math.max(availableTop, Math.min(centeredY, availableBottom)))

  return {
    cellSize,
    gap,
    boardX,
    boardY,
    boardWidth,
    boardHeight,
  }
}
