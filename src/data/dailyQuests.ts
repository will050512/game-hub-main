import type { DailyQuestDef } from '@/types'

export const dailyQuestPool: DailyQuestDef[] = [
  { id: 'play_3', name: '熱身運動', description: '完成3場遊戲', icon: 'controller', category: 'play', target: 3, reward: { coins: 100, xp: 50 } },
  { id: 'play_5', name: '遊戲馬拉松', description: '完成5場遊戲', icon: 'timer', category: 'play', target: 5, reward: { coins: 200, xp: 100 } },
  { id: 'score_500', name: '分數獵人', description: '單場獲得500分', icon: 'action', category: 'score', target: 500, reward: { coins: 150, xp: 75 } },
  { id: 'score_1000', name: '千分挑戰', description: '單場獲得1000分', icon: 'star', category: 'score', target: 1000, reward: { coins: 300, xp: 150 } },
  { id: 'survivor_play', name: '暗夜挑戰', description: '遊玩暗夜倖存者2次', icon: 'action', category: 'play', targetGameId: 'survivor', target: 2, reward: { coins: 120, xp: 60 } },
  { id: 'tetris_play', name: '方塊挑戰', description: '遊玩俄羅斯方塊2次', icon: 'puzzle', category: 'play', targetGameId: 'tetris', target: 2, reward: { coins: 120, xp: 60 } },
  { id: 'earn_500', name: '金幣收集', description: '累計獲得500金幣', icon: 'coin', category: 'collect', target: 500, reward: { coins: 200, xp: 100 } },
  { id: 'upgrade_1', name: '強化自身', description: '購買1次升級', icon: 'upgrade', category: 'upgrade', target: 1, reward: { coins: 150, xp: 80 } },
  { id: 'win_3', name: '勝利連擊', description: '贏得3場遊戲', icon: 'trophy', category: 'win', target: 3, reward: { coins: 250, xp: 120 } },
  { id: 'snake_play', name: '蛇蛇挑戰', description: '遊玩貪吃蛇2次', icon: 'heart', category: 'play', targetGameId: 'snake', target: 2, reward: { coins: 100, xp: 50 } },
  { id: 'flappy_play', name: '飛行挑戰', description: '遊玩Flappy Bird3次', icon: 'sparkle', category: 'play', targetGameId: 'flappy', target: 3, reward: { coins: 100, xp: 50 } },
  { id: 'memory_play', name: '記憶挑戰', description: '遊玩記憶翻牌2次', icon: 'board', category: 'play', targetGameId: 'memory', target: 2, reward: { coins: 100, xp: 50 } },
]

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

export function generateDailyQuests(): DailyQuestDef[] {
  return shuffleArray(dailyQuestPool).slice(0, 3)
}
