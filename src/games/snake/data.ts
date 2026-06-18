export interface SpecialFoodDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  durationMs: number
  scoreMultiplier: number
}

export const SPECIAL_FOOD_DEFS: Record<string, SpecialFoodDef> = {
  slow: {
    id: 'slow',
    name: '減速果',
    icon: 'slow',
    description: '移動速度 −30%',
    color: '#3b82f6',
    durationMs: 8000,
    scoreMultiplier: 1,
  },
  wall_pass: {
    id: 'wall_pass',
    name: '穿牆果',
    icon: 'chaos',
    description: '穿越牆壁邊界',
    color: '#a855f7',
    durationMs: 8000,
    scoreMultiplier: 1,
  },
  shrink: {
    id: 'shrink',
    name: '縮小果',
    icon: 'pill',
    description: '蛇身縮短 3 節',
    color: '#22c55e',
    durationMs: 0,
    scoreMultiplier: 1,
  },
  golden_apple: {
    id: 'golden_apple',
    name: '黃金蘋果',
    icon: 'apple',
    description: '分數 ×3 (8秒)',
    color: '#fbbf24',
    durationMs: 8000,
    scoreMultiplier: 3,
  },
  speed_boost: {
    id: 'speed_boost',
    name: '加速果',
    icon: 'speed',
    description: '移動速度 ×1.4',
    color: '#f59e0b',
    durationMs: 10000,
    scoreMultiplier: 1,
  },
}

export interface ArenaModifierDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  durationMs: number
}

export const ARENA_MODIFIER_DEFS: Record<string, ArenaModifierDef> = {
  speed_boost: {
    id: 'speed_boost',
    name: '加速區域',
    icon: 'speed',
    description: '移動速度 ×1.5',
    color: '#fbbf24',
    durationMs: 15000,
  },
  food_frenzy: {
    id: 'food_frenzy',
    name: '食物狂潮',
    icon: 'apple',
    description: '出現多個食物',
    color: '#ef4444',
    durationMs: 12000,
  },
  portal_zone: {
    id: 'portal_zone',
    name: '傳送門',
    icon: 'chaos',
    description: '傳送門對',
    color: '#8b5cf6',
    durationMs: 18000,
  },
  safe_zone: {
    id: 'safe_zone',
    name: '安全區',
    icon: 'shield',
    description: '中央安全區域',
    color: '#10b981',
    durationMs: 10000,
  },
}

