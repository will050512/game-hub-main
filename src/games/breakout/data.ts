export interface BreakoutPowerUpDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  durationMs: number
  isNegative: boolean
  spawnWeight: number
}

export const POWERUP_DEFS: Record<string, BreakoutPowerUpDef> = {
  wide_paddle: {
    id: 'wide_paddle',
    name: '加寬球拍',
    icon: 'wide',
    description: '球拍寬度 +50%',
    color: '#22c55e',
    durationMs: 12000,
    isNegative: false,
    spawnWeight: 20,
  },
  multi_ball: {
    id: 'multi_ball',
    name: '多重球',
    icon: 'ball',
    description: '分裂出 2 顆額外球',
    color: '#3b82f6',
    durationMs: 0,
    isNegative: false,
    spawnWeight: 15,
  },
  sticky_paddle: {
    id: 'sticky_paddle',
    name: '黏性球拍',
    icon: 'magnet',
    description: '球碰到球拍會黏住',
    color: '#a855f7',
    durationMs: 10000,
    isNegative: false,
    spawnWeight: 12,
  },
  laser: {
    id: 'laser',
    name: '雷射',
    icon: 'laser',
    description: '球拍可發射雷射',
    color: '#ef4444',
    durationMs: 8000,
    isNegative: false,
    spawnWeight: 10,
  },
  slow_ball: {
    id: 'slow_ball',
    name: '減速球',
    icon: 'slow',
    description: '球速 ×0.6',
    color: '#67e8f9',
    durationMs: 10000,
    isNegative: false,
    spawnWeight: 18,
  },
  extra_life: {
    id: 'extra_life',
    name: '額外生命',
    icon: 'heart',
    description: '生命 +1',
    color: '#f43f5e',
    durationMs: 0,
    isNegative: false,
    spawnWeight: 8,
  },
  narrow_paddle: {
    id: 'narrow_paddle',
    name: '縮小球拍',
    icon: 'narrow',
    description: '球拍寬度 -30%',
    color: '#f59e0b',
    durationMs: 8000,
    isNegative: true,
    spawnWeight: 10,
  },
  speed_ball: {
    id: 'speed_ball',
    name: '加速球',
    icon: 'speed',
    description: '球速 ×1.5',
    color: '#dc2626',
    durationMs: 6000,
    isNegative: true,
    spawnWeight: 8,
  },
}

export type StageVariant = 'standard' | 'pyramid' | 'walls' | 'fortress' | 'chaos' | 'boss'

export interface StageLayout {
  id: StageVariant
  name: string
  icon: string
  description: string
  rows: number
  cols: number
  pattern: 'fill' | 'pyramid' | 'edges' | 'random' | 'boss'
  basePoints: number
  bossConfig?: {
    count: number
    hp: number
    color: string
    icon: string
  }
}

export const STAGE_LAYOUTS: Record<StageVariant, StageLayout> = {
  standard: {
    id: 'standard',
    name: '標準模式',
    icon: 'brick',
    description: '經典磚塊排列',
    rows: 5,
    cols: 10,
    pattern: 'fill',
    basePoints: 10,
  },
  pyramid: {
    id: 'pyramid',
    name: '金字塔',
    icon: 'pyramid',
    description: '金字塔形狀',
    rows: 8,
    cols: 15,
    pattern: 'pyramid',
    basePoints: 15,
  },
  walls: {
    id: 'walls',
    name: '城牆',
    icon: 'fortress',
    description: '邊緣加固',
    rows: 6,
    cols: 12,
    pattern: 'edges',
    basePoints: 12,
  },
  fortress: {
    id: 'fortress',
    name: '堡壘',
    icon: 'action',
    description: '密集防禦',
    rows: 9,
    cols: 16,
    pattern: 'fill',
    basePoints: 20,
  },
  chaos: {
    id: 'chaos',
    name: '混亂',
    icon: 'chaos',
    description: '隨機分布',
    rows: 7,
    cols: 14,
    pattern: 'random',
    basePoints: 18,
  },
  boss: {
    id: 'boss',
    name: 'BOSS 關卡',
    icon: 'crown',
    description: '挑戰 BOSS 磚塊',
    rows: 3,
    cols: 8,
    pattern: 'boss',
    basePoints: 50,
    bossConfig: {
      count: 3,
      hp: 10,
      color: '#dc2626',
      icon: 'crown',
    },
  },
}
