export interface FruitCatchItemDef {
  id: string
  name: string
  icon: string
  description: string
  color: string
  durationMs: number
  spawnWeight: number
}

export const ITEM_DEFS: Record<string, FruitCatchItemDef> = {
  big_basket: {
    id: 'big_basket',
    name: '大籃子',
    icon: 'basket',
    description: '籃子寬度 +40%',
    color: '#f59e0b',
    durationMs: 10000,
    spawnWeight: 25,
  },
  magnet: {
    id: 'magnet',
    name: '磁鐵',
    icon: 'magnet',
    description: '吸引 100px 範圍內的水果',
    color: '#3b82f6',
    durationMs: 8000,
    spawnWeight: 20,
  },
  double_score: {
    id: 'double_score',
    name: '雙倍分數',
    icon: 'sparkle',
    description: '得分 ×2',
    color: '#eab308',
    durationMs: 8000,
    spawnWeight: 20,
  },
  shield: {
    id: 'shield',
    name: '護盾',
    icon: 'shield',
    description: '吸收 1 次炸彈',
    color: '#22d3ee',
    durationMs: 0,
    spawnWeight: 15,
  },
}
