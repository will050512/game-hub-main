import type { GameId } from './gameManifest'
import type { GameRewardEvent } from './rewardContract'

/** Game metadata for the lobby */
export interface GameInfo {
  id: GameId
  name: string
  description: string
  category: GameCategory
  thumbnail: string
  color: string
  icon: string
  instructions: string[]
  controls: string
  difficulty?: 'easy' | 'medium' | 'hard' | 'extreme'
  tags?: string[]
}

export type GameCategory = 'action' | 'puzzle' | 'strategy' | 'casual' | 'board'

/** Score record persisted in SQLite */
export interface ScoreRecord {
  id?: number
  gameId: string
  playerName: string
  score: number
  date: string
}

export interface GameOverData {
  score: number
  kills?: number
  level?: number
  time?: number
  wave?: number
  codexDiscoveries?: number
  codexBonusXp?: number
  newArchetypes?: string[]
}

/** Game lifecycle callbacks — each game module exports this */
export interface GameCallbacks {
  onScoreUpdate?: (score: number) => void
  onStatsUpdate?: (stats: PlayerStats) => void
  onLevelUp?: (options: UpgradeOption[], resolve: (picked: UpgradeOption) => void) => void
  onGameOver?: (data: number | GameOverData) => void
  onPause?: () => void
  onResume?: () => void
  /** Push full HUD data (stats + buffs + items) to Vue overlay */
  onHudUpdate?: (hudData: GameHudData) => void
  /** Notify when player collects an in-game item/power-up */
  onItemCollected?: (item: PowerUpDef) => void
  /** Notify when currency is earned during gameplay */
  onCurrencyEarned?: (amount: number, source: string) => void
  /** Canonical meta-progression reward event payload */
  onRewardEvent?: (event: GameRewardEvent) => void
}

export interface GameInstance {
  start: (canvas: HTMLCanvasElement, callbacks: GameCallbacks) => void
  stop: () => void
  pause: () => void
  resume: () => void
  resize: (width: number, height: number) => void
}

/** Stats pushed from engine to Vue HUD */
export interface PlayerStats {
  hp: number
  maxHp: number
  level: number
  xp: number
  xpToNext: number
  kills: number
  time: number
  score: number
}

/** Upgrade option shown on level-up */
export interface UpgradeOption {
  id: string
  name: string
  description: string
  icon: string
  type: 'weapon' | 'passive' | 'synthesis'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface ActiveBuff {
  id: string
  name: string
  icon: string
  remainingMs: number
  totalMs: number
  type: 'speed' | 'power' | 'defense' | 'score' | 'special'
}

export interface ItemSlot {
  id: string
  name: string
  icon: string
  count: number
  cooldownMs: number
  cooldownTotalMs: number
}

export interface GameHudData extends PlayerStats {
  activeBuffs: ActiveBuff[]
  itemSlots: ItemSlot[]
  currency: number
  codexInfo?: {
    discoveredBuilds: number
    totalArchetypes: number
    activeArchetypes: string[]
    activeBonuses: {
      moveSpeedBonus: number
      startingHpBonus: number
    }
  }
}

export interface PowerUpDef {
  id: string
  name: string
  description: string
  icon: string
  tier: 'common' | 'rare' | 'epic'
  durationMs: number
  magnitude: number
  spawnWeight: number
  stackable: boolean
}

export interface CurrencyTransaction {
  gameId: string
  amount: number
  source: 'gameplay' | 'achievement' | 'daily'
  timestamp: number
}

export interface ShopPurchaseRecord {
  id?: number
  itemType: 'upgrade' | 'badge' | 'avatarFrame'
  itemId: string
  upgradeId?: string
  level: number
  cost: number
  purchasedAt: string
}

export interface ShopCollectionItem {
  id: string
  type: 'badge' | 'avatarFrame'
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  cost: number
  color?: string
  glowColor?: string
}

export interface RewardSettlementMeta {
  xp: number
  achievements: string[]
  tokens: number
}

export interface UpgradeEffect {
  stat: string
  value: number
  isMultiplier: boolean
}

export interface PermanentUpgrade {
  id: string
  name: string
  description: string
  icon: string
  category: 'offense' | 'defense' | 'utility' | 'economy'
  maxLevel: number
  costs: number[]
  effects: UpgradeEffect[]
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  /** Game categories this upgrade applies to. Undefined = applies to all categories (backward-compatible). */
  applicableCategories?: string[]
}

export interface PlayerProfile {
  totalCoins: number
  totalCoinsEarned: number
  upgrades: Record<string, number>
  gamesPlayed: number
  uniqueGamesPlayed: number
  totalPlayTime: number
  achievements: string[]
}

export interface ExtendedScoreRecord extends ScoreRecord {
  upgradeLevel: number
  upgradeTag: string
}

/** ===== Achievement System ===== */
export interface AchievementDef {
  id: string
  name: string
  description: string
  icon: string
  category: 'gameplay' | 'collection' | 'mastery' | 'social' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  condition: AchievementCondition
  reward: { coins: number; badge?: string }
  /** When true, the achievement is hidden from the list until unlocked */
  hidden?: boolean
}

export type AchievementCondition =
  | { type: 'score'; gameId?: string; threshold: number }
  | { type: 'gamesPlayed'; threshold: number }
  | { type: 'uniqueGamesPlayed'; threshold: number }
  | { type: 'totalCoins'; threshold: number }
  | { type: 'winStreak'; threshold: number }
  | { type: 'perfectGame'; threshold: number }
  | { type: 'timePlayed'; threshold: number }
  | { type: 'collectAll'; collectionType: 'badge' | 'avatarFrame'; threshold: number }
  | { type: 'kills'; gameId?: string; threshold: number }
  | { type: 'speedrun'; threshold: number }
  | { type: 'nightOwl'; threshold: number }
  | { type: 'allInOneDay'; threshold: number }

export interface PlayerAchievement {
  achievementId: string
  unlockedAt: string | null
  progress: number
}

/** ===== Daily Quest System ===== */
export interface DailyQuestDef {
  id: string
  name: string
  description: string
  icon: string
  category: 'play' | 'score' | 'collect' | 'upgrade' | 'win'
  targetGameId?: string
  target: number
  reward: { coins: number; xp: number }
}

export interface DailyQuestProgress {
  questId: string
  current: number
  completed: boolean
  claimed: boolean
}

export interface DailyQuestsState {
  date: string
  quests: DailyQuestProgress[]
}

/** ===== Player Level System ===== */
export interface PlayerLevel {
  level: number
  xpRequired: number
  totalXpRequired: number
  title: string
  reward?: { coins: number; badge?: string }
}

export interface PlayerLevelState {
  level: number
  xp: number
  totalXp: number
  title: string
}

/** ===== Collection System ===== */
export interface CollectibleBadge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  source: string
}

export interface CollectibleAvatarFrame {
  id: string
  name: string
  color: string
  glowColor: string
  source: string
}

export interface PlayerCollection {
  badges: string[]
  avatarFrames: string[]
  equippedBadge: string | null
  equippedAvatarFrame: string | null
}

/** ===== Enhanced Player Profile ===== */
export interface EnhancedPlayerProfile {
  totalCoins: number
  totalCoinsEarned: number
  upgrades: Record<string, number>
  gamesPlayed: number
  uniqueGamesPlayed: number
  totalPlayTime: number
  achievements: PlayerAchievement[]
  level: PlayerLevelState
  dailyQuests: DailyQuestsState
  collection: PlayerCollection
  winStreak: number
  bestWinStreak: number
  lastPlayedAt: string | null
}

export * from './gameManifest'
export * from './rewardContract'
