import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useDatabase } from '@/composables/useDatabase'
import { usePlayerStore } from './playerStore'
import { useMetaProgression } from '@/composables/useMetaProgression'
import {
  REWARD_EVENT_SCHEMA_VERSION,
  createRewardPayload,
  type GameRewardEvent,
  type ResultPayloadContract,
  type RewardEmitterId,
  type RewardSettlementResult,
  type GameId,
} from '@/types'

const GAME_MULTIPLIERS: Record<string, number> = {
  survivor: 0.5,
  breakout: 1.0,
  tetris: 0.8,
  snake: 1.2,
  game2048: 0.3,
  flappy: 5.0,
  invaders: 0.8,
  'fruit-catch': 1.0,
  'tower-defense': 1.5,
  'tic-tac-toe': 2.0,
  memory: 1.0,
  sudoku: 1.5,
}

export const useCurrencyStore = defineStore('currency', () => {
  const balance = ref(0)
  const pendingEarnings = ref(0)
  const pendingRewardEvent = ref<GameRewardEvent | null>(null)
  const isLoaded = ref(false)

  async function loadBalance() {
    const db = useDatabase()
    balance.value = await db.getBalance()
    isLoaded.value = true
  }

  function calculateCoins(gameId: string, score: number): number {
    const multiplier = GAME_MULTIPLIERS[gameId] ?? 1.0
    const playerStore = usePlayerStore()
    const stats = playerStore.getEffectiveStats()
    const economyBonus = stats.economyBonus ?? 1.0
    return Math.floor(score * multiplier * economyBonus)
  }

  function createCanonicalRewardEvent(
    gameId: RewardEmitterId,
    score: number,
    result?: Partial<ResultPayloadContract>,
    rewardOverrides?: Partial<GameRewardEvent['rewards']>,
  ): GameRewardEvent {
    const safeScore = Math.max(0, Math.floor(score))
    const rewards = createRewardPayload({
      coins: rewardOverrides?.coins ?? calculateCoins(gameId, safeScore),
      xp: rewardOverrides?.xp ?? Math.max(0, Math.floor(safeScore / 10)),
      tokens: rewardOverrides?.tokens ?? 0,
      achievements: rewardOverrides?.achievements ?? [],
      collectionItems: rewardOverrides?.collectionItems ?? [],
      upgradeLevels: rewardOverrides?.upgradeLevels ?? {},
      dailyQuestDelta: rewardOverrides?.dailyQuestDelta ?? {},
    })

    const canonicalResult: ResultPayloadContract = {
      score: safeScore,
      kills: Math.max(0, Math.floor(result?.kills ?? 0)),
      time: Math.max(0, Math.floor(result?.time ?? 0)),
      level: Math.max(1, Math.floor(result?.level ?? 1)),
      coins: rewards.coins,
    }

    return {
      schemaVersion: REWARD_EVENT_SCHEMA_VERSION,
      gameId,
      emittedAt: new Date().toISOString(),
      score: safeScore,
      rewards,
      result: canonicalResult,
    }
  }

  function queueRewardEvent(event: GameRewardEvent) {
    pendingRewardEvent.value = event
    pendingEarnings.value = event.rewards.coins
  }

  function earnFromGame(gameId: RewardEmitterId, scoreOrResult: number | Partial<ResultPayloadContract>) {
    const score = typeof scoreOrResult === 'number' ? scoreOrResult : (scoreOrResult.score ?? 0)
    const result = typeof scoreOrResult === 'number' ? undefined : scoreOrResult
    const event = createCanonicalRewardEvent(gameId, score, result)
    queueRewardEvent(event)
  }

  function emitRewardEvent(event: GameRewardEvent) {
    queueRewardEvent(event)
  }

  async function settlePending(gameId: RewardEmitterId): Promise<number> {
    const event = pendingRewardEvent.value
    if (!event) return 0
    if (event.gameId !== gameId) return 0

    const settlement: RewardSettlementResult = {
      appliedCoins: 0,
      appliedXp: 0,
      unlockedAchievements: [],
      updatedDailyQuestIds: [],
    }

    const db = useDatabase()
    const playerStore = usePlayerStore()
    const metaProgression = useMetaProgression()

    if (event.rewards.coins > 0) {
      await db.addCoins(event.rewards.coins, event.gameId, 'gameplay')
      balance.value += event.rewards.coins
      settlement.appliedCoins = event.rewards.coins
    }

    if (event.rewards.xp > 0) {
      await playerStore.addXp(event.rewards.xp)
      settlement.appliedXp = event.rewards.xp
    }

    for (const achievementId of event.rewards.achievements) {
      await playerStore.unlockAchievement(achievementId)
      settlement.unlockedAchievements.push(achievementId)
    }

    for (const item of event.rewards.collectionItems) {
      await playerStore.addToCollection(item.type, item.id)
    }

    if (Object.keys(event.rewards.upgradeLevels).length > 0) {
      await playerStore.applyUpgradeLevels(event.rewards.upgradeLevels)
    }

    if (Object.keys(event.rewards.dailyQuestDelta).length > 0) {
      settlement.updatedDailyQuestIds = await playerStore.applyDailyQuestDelta(event.rewards.dailyQuestDelta)
    }

    const profile = playerStore.profile
    const newAchievements = await metaProgression.checkAndUnlockAchievements({
      gameId: gameId as GameId,
      score: event.score,
      gamesPlayed: profile.gamesPlayed,
      totalCoinsEarned: profile.totalCoinsEarned + settlement.appliedCoins,
      totalPlayTime: profile.totalPlayTime,
    })
    settlement.unlockedAchievements.push(...newAchievements)

    const { completedQuestIds } = await metaProgression.updateDailyQuestProgress({
      gameId: gameId as GameId,
      score: event.score,
      coinsEarned: settlement.appliedCoins,
    })
    settlement.updatedDailyQuestIds.push(...completedQuestIds)

    pendingRewardEvent.value = null
    pendingEarnings.value = 0
    return settlement.appliedCoins
  }

  async function purchase(upgradeId: string, cost: number, level: number): Promise<boolean> {
    const db = useDatabase()
    const success = await db.purchaseUpgrade(upgradeId, cost, level)
    if (success) {
      balance.value -= cost
    }
    return success
  }

  return {
    balance,
    pendingEarnings,
    pendingRewardEvent,
    isLoaded,
    loadBalance,
    calculateCoins,
    createCanonicalRewardEvent,
    earnFromGame,
    emitRewardEvent,
    settlePending,
    purchase,
  }
})
