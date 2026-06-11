export interface InvadersPowerUpDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  durationMs: number
  spawnWeight: number
}

export type FormationType = 'standard' | 'vee' | 'diamond' | 'wedge' | 'scattered' | 'wall'

export interface FormationPattern {
  type: FormationType
  name: string
  description: string
  getPositions: (
    rows: number,
    cols: number,
    alienWidth: number,
    alienHeight: number,
    gapX: number,
    gapY: number,
    canvasWidth: number,
    canvasHeight: number,
    wave: number
  ) => Array<{ x: number; y: number; row: number; col: number }>
}

export interface ShieldBlock {
  x: number
  y: number
  width: number
  height: number
  hp: number
  maxHp: number
}

export const POWERUP_DEFS: Record<string, InvadersPowerUpDef> = {
  rapid_fire: {
    id: 'rapid_fire',
    name: '急速射擊',
    icon: 'speed',
    description: '射擊速度 ×2',
    color: '#fbbf24',
    durationMs: 8000,
    spawnWeight: 20,
  },
  triple_shot: {
    id: 'triple_shot',
    name: '三重射擊',
    icon: 'triple',
    description: '同時發射 3 發子彈',
    color: '#3b82f6',
    durationMs: 10000,
    spawnWeight: 15,
  },
  shield: {
    id: 'shield',
    name: '護盾',
    icon: 'shield',
    description: '吸收 1 次傷害',
    color: '#22d3ee',
    durationMs: 0,
    spawnWeight: 12,
  },
  bomb: {
    id: 'bomb',
    name: '炸彈',
    icon: 'bomb',
    description: '清除所有敵方子彈',
    color: '#ef4444',
    durationMs: 0,
    spawnWeight: 18,
  },
  homing: {
    id: 'homing',
    name: '追蹤飛彈',
    icon: 'rocket',
    description: '發射 3 枚追蹤飛彈',
    color: '#a855f7',
    durationMs: 0,
    spawnWeight: 10,
  },
  repair: {
    id: 'repair',
    name: '修復',
    icon: 'repair',
    description: '生命 +1',
    color: '#10b981',
    durationMs: 0,
    spawnWeight: 8,
  },
}

export const FORMATION_PATTERNS: Record<FormationType, FormationPattern> = {
  standard: {
    type: 'standard',
    name: '標準陣型',
    description: '經典網格排列',
    getPositions: (rows, cols, alienWidth, alienHeight, gapX, gapY, canvasWidth, canvasHeight, wave) => {
      const formationWidth = cols * alienWidth + (cols - 1) * gapX
      const startX = (canvasWidth - formationWidth) / 2
      const startY = Math.max(52, canvasHeight * 0.1) + (wave - 1) * 8
      const positions = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          positions.push({
            x: startX + col * (alienWidth + gapX),
            y: startY + row * (alienHeight + gapY),
            row,
            col,
          })
        }
      }
      return positions
    },
  },
  vee: {
    type: 'vee',
    name: 'V字陣型',
    description: '向下的V字形攻擊隊形',
    getPositions: (rows, cols, alienWidth, alienHeight, gapX, gapY, canvasWidth, canvasHeight, wave) => {
      const formationWidth = cols * alienWidth + (cols - 1) * gapX
      const startX = (canvasWidth - formationWidth) / 2
      const startY = Math.max(52, canvasHeight * 0.1) + (wave - 1) * 8
      const positions = []
      const centerCol = Math.floor(cols / 2)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const distFromCenter = Math.abs(col - centerCol)
          const yOffset = distFromCenter * (alienHeight + gapY) * 0.5
          positions.push({
            x: startX + col * (alienWidth + gapX),
            y: startY + row * (alienHeight + gapY) + yOffset,
            row,
            col,
          })
        }
      }
      return positions
    },
  },
  diamond: {
    type: 'diamond',
    name: '菱形陣型',
    description: '集中火力的菱形隊形',
    getPositions: (rows, cols, alienWidth, alienHeight, gapX, gapY, canvasWidth, canvasHeight, wave) => {
      const formationWidth = cols * alienWidth + (cols - 1) * gapX
      const startX = (canvasWidth - formationWidth) / 2
      const startY = Math.max(52, canvasHeight * 0.1) + (wave - 1) * 8
      const positions = []
      const centerRow = Math.floor(rows / 2)
      const centerCol = Math.floor(cols / 2)
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const distFromCenterRow = Math.abs(row - centerRow)
          const distFromCenterCol = Math.abs(col - centerCol)
          const totalDist = distFromCenterRow + distFromCenterCol
          if (totalDist <= Math.floor(Math.max(rows, cols) / 2) + 1) {
            positions.push({
              x: startX + col * (alienWidth + gapX),
              y: startY + row * (alienHeight + gapY),
              row,
              col,
            })
          }
        }
      }
      return positions
    },
  },
  wedge: {
    type: 'wedge',
    name: '楔形陣型',
    description: '尖端突破的楔形隊形',
    getPositions: (rows, cols, alienWidth, alienHeight, gapX, gapY, canvasWidth, canvasHeight, wave) => {
      const formationWidth = cols * alienWidth + (cols - 1) * gapX
      const startX = (canvasWidth - formationWidth) / 2
      const startY = Math.max(52, canvasHeight * 0.1) + (wave - 1) * 8
      const positions = []
      const centerCol = Math.floor(cols / 2)
      for (let row = 0; row < rows; row++) {
        const rowWidth = Math.max(1, cols - row * 2)
        const rowStartCol = Math.floor((cols - rowWidth) / 2)
        for (let i = 0; i < rowWidth; i++) {
          const col = rowStartCol + i
          positions.push({
            x: startX + col * (alienWidth + gapX),
            y: startY + row * (alienHeight + gapY),
            row,
            col,
          })
        }
      }
      return positions
    },
  },
  scattered: {
    type: 'scattered',
    name: '散佈陣型',
    description: '隨機分散的混亂隊形',
    getPositions: (rows, cols, alienWidth, alienHeight, gapX, gapY, canvasWidth, canvasHeight, wave) => {
      const formationWidth = cols * alienWidth + (cols - 1) * gapX
      const startX = (canvasWidth - formationWidth) / 2
      const startY = Math.max(52, canvasHeight * 0.1) + (wave - 1) * 8
      const positions = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const randomOffsetX = (Math.random() - 0.5) * gapX * 1.5
          const randomOffsetY = (Math.random() - 0.5) * gapY * 1.5
          positions.push({
            x: startX + col * (alienWidth + gapX) + randomOffsetX,
            y: startY + row * (alienHeight + gapY) + randomOffsetY,
            row,
            col,
          })
        }
      }
      return positions
    },
  },
  wall: {
    type: 'wall',
    name: '城牆陣型',
    description: '密集的防禦牆',
    getPositions: (rows, cols, alienWidth, alienHeight, gapX, gapY, canvasWidth, canvasHeight, wave) => {
      const formationWidth = cols * alienWidth + (cols - 1) * gapX * 0.5
      const startX = (canvasWidth - formationWidth) / 2
      const startY = Math.max(52, canvasHeight * 0.1) + (wave - 1) * 8
      const positions = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          positions.push({
            x: startX + col * (alienWidth + gapX * 0.5),
            y: startY + row * (alienHeight + gapY * 0.5),
            row,
            col,
          })
        }
      }
      return positions
    },
  },
}

export function createShieldBlocks(
  canvasWidth: number,
  canvasHeight: number,
  playerY: number,
  dpr: number
): ShieldBlock[] {
  const shields: ShieldBlock[] = []
  const shieldCount = 4
  const blockSize = Math.max(8, 8 * dpr)
  const shieldWidth = blockSize * 6
  const shieldHeight = blockSize * 4
  const totalWidth = shieldCount * shieldWidth + (shieldCount - 1) * (shieldWidth * 0.8)
  const startX = (canvasWidth - totalWidth) / 2
  const shieldY = playerY - shieldHeight * 3

  for (let s = 0; s < shieldCount; s++) {
    const shieldX = startX + s * (shieldWidth + shieldWidth * 0.8)
    
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 6; col++) {
        if (row === 3 && (col === 2 || col === 3)) continue
        
        shields.push({
          x: shieldX + col * blockSize,
          y: shieldY + row * blockSize,
          width: blockSize,
          height: blockSize,
          hp: 3,
          maxHp: 3,
        })
      }
    }
  }

  return shields
}
