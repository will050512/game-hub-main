export interface MissionDef {
  id: string
  type: 'lines' | 'tetrises' | 'score' | 'survival'
  name: string
  icon: string
  description: string
  target: number
  reward: {
    type: 'bomb' | 'preview'
    amount: number
  }
}

export const MISSION_DEFS: MissionDef[] = [
  {
    id: 'clear_10_lines',
    type: 'lines',
    name: '消除 10 行',
    icon: 'stats',
    description: '消除 10 行',
    target: 10,
    reward: { type: 'bomb', amount: 1 },
  },
  {
    id: 'clear_20_lines',
    type: 'lines',
    name: '消除 20 行',
    icon: 'stats',
    description: '消除 20 行',
    target: 20,
    reward: { type: 'preview', amount: 1 },
  },
  {
    id: 'get_3_tetrises',
    type: 'tetrises',
    name: '達成 3 次 Tetris',
    icon: 'target',
    description: '一次消除 4 行',
    target: 3,
    reward: { type: 'bomb', amount: 1 },
  },
  {
    id: 'get_5_tetrises',
    type: 'tetrises',
    name: '達成 5 次 Tetris',
    icon: 'target',
    description: '一次消除 4 行',
    target: 5,
    reward: { type: 'preview', amount: 1 },
  },
  {
    id: 'score_5000',
    type: 'score',
    name: '得分 5000',
    icon: 'star',
    description: '達到 5000 分',
    target: 5000,
    reward: { type: 'bomb', amount: 1 },
  },
  {
    id: 'score_10000',
    type: 'score',
    name: '得分 10000',
    icon: 'star',
    description: '達到 10000 分',
    target: 10000,
    reward: { type: 'preview', amount: 1 },
  },
  {
    id: 'survive_120',
    type: 'survival',
    name: '生存 2 分鐘',
    icon: 'timer',
    description: '生存 120 秒',
    target: 120,
    reward: { type: 'bomb', amount: 1 },
  },
  {
    id: 'survive_180',
    type: 'survival',
    name: '生存 3 分鐘',
    icon: 'timer',
    description: '生存 180 秒',
    target: 180,
    reward: { type: 'preview', amount: 1 },
  },
]

export interface SpecialRowDef {
  id: string
  name: string
  color: string
  scoreMultiplier: number
}

export const SPECIAL_ROW_DEFS: Record<string, SpecialRowDef> = {
  golden: {
    id: 'golden',
    name: '黃金行',
    color: '#ffd700',
    scoreMultiplier: 3,
  },
}
