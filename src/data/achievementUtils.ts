import type { AchievementDef, PlayerAchievement } from '@/types'
import { achievementDefs } from '@/data/achievements'

export function checkAchievements(
  achievements: PlayerAchievement[],
  context: {
    gamesPlayed: number
    totalCoins: number
    totalPlayTime: number
    winStreak: number
    bestScore: number
    bestScoreByGame: Record<string, number>
  },
): { newlyUnlocked: string[] } {
  const newlyUnlocked: string[] = []

  for (const def of achievementDefs) {
    const existing = achievements.find(a => a.achievementId === def.id)
    if (existing?.unlockedAt) continue

    let progress = 0
    switch (def.condition.type) {
      case 'gamesPlayed':
        progress = context.gamesPlayed
        break
      case 'totalCoins':
        progress = context.totalCoins
        break
      case 'timePlayed':
        progress = context.totalPlayTime
        break
      case 'winStreak':
        progress = context.winStreak
        break
      case 'score':
        if (def.condition.gameId) {
          progress = context.bestScoreByGame[def.condition.gameId] ?? 0
        } else {
          progress = context.bestScore
        }
        break
      case 'perfectGame':
        progress = 0
        break
      case 'collectAll':
        progress = 0
        break
    }

    if (progress >= def.condition.threshold) {
      newlyUnlocked.push(def.id)
    }
  }

  return { newlyUnlocked }
}

export function getAchievementProgress(
  def: AchievementDef,
  context: {
    gamesPlayed: number
    totalCoins: number
    totalPlayTime: number
    winStreak: number
    bestScore: number
    bestScoreByGame: Record<string, number>
  },
): number {
  switch (def.condition.type) {
    case 'gamesPlayed': return Math.min(context.gamesPlayed / def.condition.threshold, 1)
    case 'totalCoins': return Math.min(context.totalCoins / def.condition.threshold, 1)
    case 'timePlayed': return Math.min(context.totalPlayTime / def.condition.threshold, 1)
    case 'winStreak': return Math.min(context.winStreak / def.condition.threshold, 1)
    case 'score': {
      const score = def.condition.gameId
        ? (context.bestScoreByGame[def.condition.gameId] ?? 0)
        : context.bestScore
      return Math.min(score / def.condition.threshold, 1)
    }
    default: return 0
  }
}

export function getAchievementDefById(id: string): AchievementDef | undefined {
  return achievementDefs.find(a => a.id === id)
}
