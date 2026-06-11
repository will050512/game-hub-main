import { usePlayerStore } from '@/stores/playerStore'
import { useDatabase } from '@/composables/useDatabase'
import { achievementDefs } from '@/data/achievements'
import { dailyQuestPool } from '@/data/dailyQuests'
import type { AchievementDef, DailyQuestProgress, GameId } from '@/types'

/**
 * Cross-game meta-progression system
 * Handles achievements, daily quests, and player stats across all games
 */
export function useMetaProgression() {
  const playerStore = usePlayerStore()
  const db = useDatabase()

  /**
   * Check and auto-unlock achievements after game completion
   * Returns newly unlocked achievement IDs
   */
  async function checkAndUnlockAchievements(context: {
    gameId?: GameId
    score: number
    gamesPlayed: number
    totalCoinsEarned: number
    totalPlayTime: number
    winStreak?: number
  }): Promise<string[]> {
    const newlyUnlocked: string[] = []
    const currentAchievements = playerStore.achievements

    const bestScoreByGame: Record<string, number> = {}
    if (context.gameId) {
      const highScore = await db.getHighScore(context.gameId)
      bestScoreByGame[context.gameId] = Math.max(highScore, context.score)
    }

    for (const def of achievementDefs) {
      const existing = currentAchievements.find(a => a.achievementId === def.id)
      if (existing?.unlockedAt) continue

      let progress = 0
      let shouldUnlock = false

      switch (def.condition.type) {
        case 'gamesPlayed':
          progress = context.gamesPlayed
          shouldUnlock = progress >= def.condition.threshold
          break

        case 'totalCoins':
          progress = context.totalCoinsEarned
          shouldUnlock = progress >= def.condition.threshold
          break

        case 'timePlayed':
          progress = Math.floor(context.totalPlayTime / 1000)
          shouldUnlock = progress >= def.condition.threshold
          break

        case 'winStreak':
          progress = context.winStreak ?? 0
          shouldUnlock = progress >= def.condition.threshold
          break

        case 'score':
          if (def.condition.gameId) {
            if (def.condition.gameId === context.gameId) {
              progress = context.score
              shouldUnlock = progress >= def.condition.threshold
            }
          } else {
            progress = context.score
            shouldUnlock = progress >= def.condition.threshold
          }
          break

        case 'perfectGame':
          break

        case 'collectAll':
          break
      }

      if (shouldUnlock) {
        await playerStore.unlockAchievement(def.id)
        newlyUnlocked.push(def.id)
      } else if (progress > 0) {
        await playerStore.updateAchievementProgress(def.id, progress / def.condition.threshold)
      }
    }

    return newlyUnlocked
  }

  /**
   * Update daily quest progress after game completion
   * Returns updated quest IDs and newly completed quest IDs
   */
  async function updateDailyQuestProgress(context: {
    gameId: GameId
    score: number
    coinsEarned: number
    won?: boolean
    upgradesPurchased?: number
  }): Promise<{
    updatedQuestIds: string[]
    completedQuestIds: string[]
  }> {
    const dailyQuests = playerStore.dailyQuests
    if (!dailyQuests.date || dailyQuests.quests.length === 0) {
      return { updatedQuestIds: [], completedQuestIds: [] }
    }

    const deltaByQuestId: Record<string, number> = {}
    const completedQuestIds: string[] = []

    for (const questProgress of dailyQuests.quests) {
      if (questProgress.completed) continue

      const questDef = dailyQuestPool.find(q => q.id === questProgress.questId)
      if (!questDef) continue

      let delta = 0

      switch (questDef.category) {
        case 'play':
          if (!questDef.targetGameId || questDef.targetGameId === context.gameId) {
            delta = 1
          }
          break

        case 'score':
          if (!questDef.targetGameId || questDef.targetGameId === context.gameId) {
            if (context.score >= questDef.target) {
              delta = 1
            }
          }
          break

        case 'collect':
          delta = context.coinsEarned
          break

        case 'upgrade':
          delta = context.upgradesPurchased ?? 0
          break

        case 'win':
          if (context.won) {
            delta = 1
          }
          break
      }

      if (delta > 0) {
        deltaByQuestId[questProgress.questId] = delta
      }
    }

    const updatedQuestIds = await playerStore.applyDailyQuestDelta(deltaByQuestId)

    const updatedDailyQuests = playerStore.dailyQuests
    for (const questProgress of updatedDailyQuests.quests) {
      const questDef = dailyQuestPool.find(q => q.id === questProgress.questId)
      if (!questDef) continue

      if (!questProgress.completed && questProgress.current >= questDef.target) {
        questProgress.completed = true
        completedQuestIds.push(questProgress.questId)
      }
    }

    if (completedQuestIds.length > 0) {
      await playerStore.updateDailyQuests(updatedDailyQuests)
    }

    return { updatedQuestIds, completedQuestIds }
  }

  /**
   * Get achievement definition by ID
   */
  function getAchievementDef(achievementId: string): AchievementDef | undefined {
    return achievementDefs.find(a => a.id === achievementId)
  }

  /**
   * Get total achievement stats
   */
  function getAchievementStats() {
    const unlockedCount = playerStore.achievements.filter(a => a.unlockedAt).length
    const totalCount = achievementDefs.length
    const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

    return {
      unlocked: unlockedCount,
      total: totalCount,
      progress: progressPercentage,
    }
  }

  /**
   * Get daily quest stats
   */
  function getDailyQuestStats() {
    const quests = playerStore.dailyQuests.quests
    const completedCount = quests.filter(q => q.completed).length
    const totalCount = quests.length

    return {
      completed: completedCount,
      total: totalCount,
      progress: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
    }
  }

  /**
   * Claim rewards for completed daily quest
   */
  async function claimDailyQuestReward(questId: string): Promise<boolean> {
    const quest = playerStore.dailyQuests.quests.find(q => q.questId === questId)
    if (!quest || !quest.completed || quest.claimed) {
      return false
    }

    const questDef = dailyQuestPool.find(q => q.id === questId)
    if (!questDef) return false

    await db.addCoins(questDef.reward.coins, 'daily-quest', 'daily')
    await playerStore.addXp(questDef.reward.xp)

    quest.claimed = true
    await playerStore.updateDailyQuests(playerStore.dailyQuests)

    return true
  }

  /**
   * Process all meta-progression after game completion
   * This is the main hook that games should call
   */
  async function processGameCompletion(context: {
    gameId: GameId
    score: number
    coinsEarned: number
    won?: boolean
    upgradesPurchased?: number
  }): Promise<{
    newAchievements: string[]
    completedQuests: string[]
    levelUp: boolean
    newLevel?: number
  }> {
    const profile = playerStore.profile
    const gamesPlayed = profile.gamesPlayed
    const totalCoinsEarned = profile.totalCoinsEarned
    const totalPlayTime = profile.totalPlayTime

    const newAchievements = await checkAndUnlockAchievements({
      gameId: context.gameId,
      score: context.score,
      gamesPlayed,
      totalCoinsEarned,
      totalPlayTime,
    })

    const { completedQuestIds } = await updateDailyQuestProgress(context)

    const previousLevel = playerStore.levelState.level
    const currentLevel = playerStore.levelState.level
    const levelUp = currentLevel > previousLevel

    return {
      newAchievements,
      completedQuests: completedQuestIds,
      levelUp,
      newLevel: levelUp ? currentLevel : undefined,
    }
  }

  return {
    checkAndUnlockAchievements,
    updateDailyQuestProgress,
    getAchievementDef,
    getAchievementStats,
    getDailyQuestStats,
    claimDailyQuestReward,
    processGameCompletion,
  }
}
