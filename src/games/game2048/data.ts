export interface ObjectiveDef {
  id: string
  type: 'tile' | 'merges' | 'score'
  name: string
  icon: string
  description: string
  target: number
  reward: {
    type: 'undo' | 'remove'
    amount: number
  }
}

export const OBJECTIVE_DEFS: ObjectiveDef[] = [
  {
    id: 'reach_128',
    type: 'tile',
    name: '達到 128',
    icon: 'target',
    description: '合成 128 方塊',
    target: 128,
    reward: { type: 'undo', amount: 1 },
  },
  {
    id: 'reach_256',
    type: 'tile',
    name: '達到 256',
    icon: 'target',
    description: '合成 256 方塊',
    target: 256,
    reward: { type: 'remove', amount: 1 },
  },
  {
    id: 'reach_512',
    type: 'tile',
    name: '達到 512',
    icon: 'target',
    description: '合成 512 方塊',
    target: 512,
    reward: { type: 'undo', amount: 1 },
  },
  {
    id: 'reach_1024',
    type: 'tile',
    name: '達到 1024',
    icon: 'target',
    description: '合成 1024 方塊',
    target: 1024,
    reward: { type: 'remove', amount: 1 },
  },
  {
    id: 'reach_2048',
    type: 'tile',
    name: '達到 2048',
    icon: 'target',
    description: '合成 2048 方塊',
    target: 2048,
    reward: { type: 'undo', amount: 1 },
  },
  {
    id: 'merge_10',
    type: 'merges',
    name: '合併 10 次',
    icon: 'refresh',
    description: '完成 10 次合併',
    target: 10,
    reward: { type: 'undo', amount: 1 },
  },
  {
    id: 'merge_20',
    type: 'merges',
    name: '合併 20 次',
    icon: 'refresh',
    description: '完成 20 次合併',
    target: 20,
    reward: { type: 'remove', amount: 1 },
  },
  {
    id: 'score_1000',
    type: 'score',
    name: '得分 1000',
    icon: 'star',
    description: '達到 1000 分',
    target: 1000,
    reward: { type: 'undo', amount: 1 },
  },
  {
    id: 'score_5000',
    type: 'score',
    name: '得分 5000',
    icon: 'star',
    description: '達到 5000 分',
    target: 5000,
    reward: { type: 'remove', amount: 1 },
  },
  {
    id: 'score_10000',
    type: 'score',
    name: '得分 10000',
    icon: 'star',
    description: '達到 10000 分',
    target: 10000,
    reward: { type: 'undo', amount: 1 },
  },
]
