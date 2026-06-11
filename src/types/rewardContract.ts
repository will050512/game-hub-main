import type { GameId } from './gameManifest'

export const REWARD_EVENT_SCHEMA_VERSION = 1

export type RewardEmitterId = GameId | 'achievement' | 'daily' | 'system'

export interface CollectionRewardItem {
  type: 'badge' | 'avatarFrame'
  id: string
}

export interface ResultPayloadContract {
  score: number
  kills: number
  time: number
  level: number
  coins: number
}

export interface RewardPayloadContract {
  coins: number
  xp: number
  tokens: number
  achievements: string[]
  collectionItems: CollectionRewardItem[]
  upgradeLevels: Record<string, number>
  dailyQuestDelta: Record<string, number>
}

export interface GameRewardEvent {
  schemaVersion: number
  gameId: RewardEmitterId
  emittedAt: string
  score: number
  rewards: RewardPayloadContract
  result: ResultPayloadContract
}

export interface RewardSettlementResult {
  appliedCoins: number
  appliedXp: number
  unlockedAchievements: string[]
  updatedDailyQuestIds: string[]
}

export function createRewardPayload(partial?: Partial<RewardPayloadContract>): RewardPayloadContract {
  return {
    coins: Math.max(0, Math.floor(partial?.coins ?? 0)),
    xp: Math.max(0, Math.floor(partial?.xp ?? 0)),
    tokens: Math.max(0, Math.floor(partial?.tokens ?? 0)),
    achievements: (partial?.achievements ?? []).filter((item): item is string => typeof item === 'string'),
    collectionItems: (partial?.collectionItems ?? []).filter(
      (item): item is CollectionRewardItem =>
        !!item &&
        (item.type === 'badge' || item.type === 'avatarFrame') &&
        typeof item.id === 'string' &&
        item.id.length > 0,
    ),
    upgradeLevels: Object.fromEntries(
      Object.entries(partial?.upgradeLevels ?? {}).map(([key, value]) => [key, Math.max(0, Math.floor(Number(value) || 0))]),
    ),
    dailyQuestDelta: Object.fromEntries(
      Object.entries(partial?.dailyQuestDelta ?? {}).map(([key, value]) => [key, Math.max(0, Math.floor(Number(value) || 0))]),
    ),
  }
}
