import { ref } from 'vue'
import type {
  ScoreRecord,
  PlayerProfile,
  PlayerAchievement,
  DailyQuestsState,
  PlayerLevelState,
  PlayerCollection,
  ShopPurchaseRecord,
} from '@/types'

const isReady = ref(false)
const DB_NAME = 'gamehub_db'
const SCHEMA_VERSION = 2
const SCHEMA_VERSION_KEY = 'gamehub_schema_version'
const SAVED_RUNS_KEY = 'gamehub_saved_runs'
const PROFILE_KEY = 'gamehub_profile'
const SCORES_KEY = DB_NAME
const UPGRADES_KEY = 'gamehub_upgrades'
const CURRENCY_LOG_KEY = 'gamehub_currency_log'
const ACHIEVEMENTS_KEY = 'gamehub_achievements'
const DAILY_QUESTS_KEY = 'gamehub_daily_quests'
const PLAYER_LEVEL_KEY = 'gamehub_player_level'
const COLLECTION_KEY = 'gamehub_collection'
const SHOP_PURCHASES_KEY = 'gamehub_shop_purchases'

type SavedRunRecord = { gameId: string; runId: string; stateJson: string; savedAt: string }
type PersistedRunEnvelope = { schemaVersion: number; state: unknown }

type DbAdapter = {
  addScore: (gameId: string, score: number, playerName?: string) => Promise<void>
  getTopScores: (gameId: string, limit?: number) => Promise<ScoreRecord[]>
  getHighScore: (gameId: string) => Promise<number>
  getProfile: () => Promise<PlayerProfile>
  updateProfile: (partial: Partial<PlayerProfile>) => Promise<void>
  addCoins: (amount: number, gameId: string, source: string) => Promise<void>
  spendCoins: (amount: number) => Promise<boolean>
  purchaseUpgrade: (upgradeId: string, cost: number, level: number) => Promise<boolean>
  purchaseCollectionItem: (type: 'badge' | 'avatarFrame', id: string, cost: number) => Promise<boolean>
  getBalance: () => Promise<number>
  getUpgradeLevel: (upgradeId: string) => Promise<number>
  setUpgradeLevel: (upgradeId: string, level: number) => Promise<void>
  getAllUpgrades: () => Promise<Record<string, number>>
  getShopPurchases: (limit?: number) => Promise<ShopPurchaseRecord[]>
  getAchievements: () => Promise<PlayerAchievement[]>
  updateAchievementProgress: (achievementId: string, progress: number) => Promise<void>
  unlockAchievement: (achievementId: string) => Promise<void>
  getDailyQuests: () => Promise<DailyQuestsState>
  saveDailyQuests: (state: DailyQuestsState) => Promise<void>
  getPlayerLevel: () => Promise<PlayerLevelState>
  updatePlayerLevel: (state: PlayerLevelState) => Promise<void>
  getCollection: () => Promise<PlayerCollection>
  addToCollection: (type: 'badge' | 'avatarFrame', id: string) => Promise<void>
  equipItem: (type: 'badge' | 'avatarFrame', id: string | null) => Promise<void>
  saveRun: (gameId: string, runId: string, stateJson: string) => Promise<void>
  loadRun: (gameId: string, runId: string) => Promise<string | null>
  deleteRun: (gameId: string, runId: string) => Promise<void>
  listRuns: (gameId: string) => Promise<{ runId: string; savedAt: string }[]>
}

let adapter: DbAdapter | null = null

const defaultProfile: PlayerProfile = {
  totalCoins: 0,
  totalCoinsEarned: 0,
  upgrades: {},
  gamesPlayed: 0,
  uniqueGamesPlayed: 0,
  totalPlayTime: 0,
  achievements: [],
}

const defaultDailyQuests: DailyQuestsState = { date: '', quests: [] }
const defaultPlayerLevel: PlayerLevelState = { level: 1, xp: 0, totalXp: 0, title: '新手' }
const defaultCollection: PlayerCollection = { badges: [], avatarFrames: [], equippedBadge: null, equippedAvatarFrame: null }

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore storage failures to keep app boot-safe
  }
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function clampNonNegative(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function sanitizeUpgrades(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const upgrades: Record<string, number> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    upgrades[key] = clampNonNegative(raw, 0)
  }
  return upgrades
}

function sanitizeProfile(value: unknown): PlayerProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...defaultProfile }
  const src = value as Partial<PlayerProfile>
  return {
    totalCoins: clampNonNegative(src.totalCoins, 0),
    totalCoinsEarned: clampNonNegative(src.totalCoinsEarned, 0),
    upgrades: sanitizeUpgrades(src.upgrades),
    gamesPlayed: clampNonNegative(src.gamesPlayed, 0),
    uniqueGamesPlayed: clampNonNegative(src.uniqueGamesPlayed ?? 0, 0),
    totalPlayTime: clampNonNegative(src.totalPlayTime, 0),
    achievements: sanitizeStringArray(src.achievements),
  }
}

function sanitizeAchievements(value: unknown): PlayerAchievement[] {
  if (!Array.isArray(value)) return []
  const achievements: PlayerAchievement[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const achievement = item as Partial<PlayerAchievement>
    if (typeof achievement.achievementId !== 'string') continue
    achievements.push({
      achievementId: achievement.achievementId,
      progress: clampNonNegative(achievement.progress, 0),
      unlockedAt: typeof achievement.unlockedAt === 'string' || achievement.unlockedAt === null ? achievement.unlockedAt : null,
    })
  }
  return achievements
}

function sanitizeDailyQuests(value: unknown): DailyQuestsState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...defaultDailyQuests }
  const raw = value as { date?: unknown; quests?: unknown[] }
  const quests = Array.isArray(raw.quests)
    ? raw.quests
        .filter((q): q is { questId: string; current: number; completed: boolean; claimed: boolean } => !!q && typeof q === 'object' && !Array.isArray(q))
        .map((q) => {
          const safeQuest = q as Record<string, unknown>
          return {
            questId: typeof safeQuest.questId === 'string' ? safeQuest.questId : '',
            current: clampNonNegative(safeQuest.current, 0),
            completed: Boolean(safeQuest.completed),
            claimed: Boolean(safeQuest.claimed),
          }
        })
        .filter((q) => q.questId.length > 0)
    : []

  return {
    date: typeof raw.date === 'string' ? raw.date : '',
    quests,
  }
}

function sanitizePlayerLevel(value: unknown): PlayerLevelState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...defaultPlayerLevel }
  const raw = value as Partial<PlayerLevelState>
  const level = clampNonNegative(raw.level, 1)
  return {
    level: level < 1 ? 1 : level,
    xp: clampNonNegative(raw.xp, 0),
    totalXp: clampNonNegative(raw.totalXp, 0),
    title: typeof raw.title === 'string' ? raw.title : '新手',
  }
}

function sanitizeCollection(value: unknown): PlayerCollection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...defaultCollection }
  const raw = value as Partial<PlayerCollection>
  return {
    badges: sanitizeStringArray(raw.badges),
    avatarFrames: sanitizeStringArray(raw.avatarFrames),
    equippedBadge: typeof raw.equippedBadge === 'string' || raw.equippedBadge === null ? raw.equippedBadge : null,
    equippedAvatarFrame: typeof raw.equippedAvatarFrame === 'string' || raw.equippedAvatarFrame === null ? raw.equippedAvatarFrame : null,
  }
}

function sanitizeScores(value: unknown): ScoreRecord[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      id: typeof item.id === 'number' ? item.id : undefined,
      gameId: typeof item.gameId === 'string' ? item.gameId : 'unknown',
      playerName: typeof item.playerName === 'string' ? item.playerName : 'Player',
      score: clampNonNegative(item.score, 0),
      date: typeof item.date === 'string' ? item.date : new Date().toISOString(),
    }))
}

function sanitizeSavedRuns(value: unknown): SavedRunRecord[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .filter((item) => {
      if (typeof item.gameId !== 'string' || typeof item.runId !== 'string' || typeof item.stateJson !== 'string') return false
      try {
        JSON.parse(item.stateJson)
        return true
      } catch {
        return false
      }
    })
    .map((item) => ({
      gameId: item.gameId as string,
      runId: item.runId as string,
      stateJson: item.stateJson as string,
      savedAt: typeof item.savedAt === 'string' ? item.savedAt : new Date().toISOString(),
    }))
}

function sanitizeShopPurchases(value: unknown): ShopPurchaseRecord[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .filter((item) => {
      const itemId = typeof item.itemId === 'string' ? item.itemId : item.upgradeId
      return typeof itemId === 'string' && itemId.length > 0
    })
    .map((item) => ({
      id: typeof item.id === 'number' ? item.id : undefined,
      itemType:
        item.itemType === 'badge' || item.itemType === 'avatarFrame' || item.itemType === 'upgrade'
          ? item.itemType
          : 'upgrade',
      itemId: typeof item.itemId === 'string' ? item.itemId : (item.upgradeId as string),
      upgradeId: typeof item.upgradeId === 'string' ? item.upgradeId : undefined,
      level: clampNonNegative(item.level, 0),
      cost: clampNonNegative(item.cost, 0),
      purchasedAt: typeof item.purchasedAt === 'string' ? item.purchasedAt : new Date().toISOString(),
    }))
}

function toPersistedRunStateJson(stateJson: string): string | null {
  try {
    const parsed = JSON.parse(stateJson)
    const envelope: PersistedRunEnvelope = {
      schemaVersion: SCHEMA_VERSION,
      state: parsed,
    }
    return JSON.stringify(envelope)
  } catch {
    return null
  }
}

function fromPersistedRunStateJson(storedStateJson: string): string | null {
  try {
    const parsed = JSON.parse(storedStateJson)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return JSON.stringify(parsed)
    }
    const maybeEnvelope = parsed as Partial<PersistedRunEnvelope>
    if (typeof maybeEnvelope.schemaVersion === 'number') {
      if (maybeEnvelope.schemaVersion !== SCHEMA_VERSION || !Object.prototype.hasOwnProperty.call(maybeEnvelope, 'state')) {
        return null
      }
      return JSON.stringify(maybeEnvelope.state)
    }
    return JSON.stringify(parsed)
  } catch {
    return null
  }
}

function getLocalSchemaVersion(): number {
  const raw = safeGetItem(SCHEMA_VERSION_KEY)
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 0
  return parsed
}

function migrateLocalStorageSchema(): void {
  const currentVersion = getLocalSchemaVersion()
  if (currentVersion >= SCHEMA_VERSION) return

  const migratedProfile = sanitizeProfile(safeParseJson<unknown>(safeGetItem(PROFILE_KEY), defaultProfile))
  const migratedScores = sanitizeScores(safeParseJson<unknown>(safeGetItem(SCORES_KEY), []))
  const migratedUpgrades = sanitizeUpgrades(safeParseJson<unknown>(safeGetItem(UPGRADES_KEY), {}))
  const migratedAchievements = sanitizeAchievements(safeParseJson<unknown>(safeGetItem(ACHIEVEMENTS_KEY), []))
  const migratedQuests = sanitizeDailyQuests(safeParseJson<unknown>(safeGetItem(DAILY_QUESTS_KEY), defaultDailyQuests))
  const migratedLevel = sanitizePlayerLevel(safeParseJson<unknown>(safeGetItem(PLAYER_LEVEL_KEY), defaultPlayerLevel))
  const migratedCollection = sanitizeCollection(safeParseJson<unknown>(safeGetItem(COLLECTION_KEY), defaultCollection))
  const migratedRuns = sanitizeSavedRuns(safeParseJson<unknown>(safeGetItem(SAVED_RUNS_KEY), []))
  const migratedShopPurchases = sanitizeShopPurchases(safeParseJson<unknown>(safeGetItem(SHOP_PURCHASES_KEY), []))

  safeSetItem(PROFILE_KEY, JSON.stringify(migratedProfile))
  safeSetItem(SCORES_KEY, JSON.stringify(migratedScores))
  safeSetItem(UPGRADES_KEY, JSON.stringify(migratedUpgrades))
  safeSetItem(ACHIEVEMENTS_KEY, JSON.stringify(migratedAchievements))
  safeSetItem(DAILY_QUESTS_KEY, JSON.stringify(migratedQuests))
  safeSetItem(PLAYER_LEVEL_KEY, JSON.stringify(migratedLevel))
  safeSetItem(COLLECTION_KEY, JSON.stringify(migratedCollection))
  safeSetItem(SAVED_RUNS_KEY, JSON.stringify(migratedRuns))
  safeSetItem(SHOP_PURCHASES_KEY, JSON.stringify(migratedShopPurchases))

  const currencyLog = safeParseJson<{ gameId: string; amount: number; source: string; createdAt: string }[]>(
    safeGetItem(CURRENCY_LOG_KEY),
    [],
  )
    .filter((entry) => entry && typeof entry.gameId === 'string' && typeof entry.source === 'string')
    .map((entry) => ({
      gameId: entry.gameId,
      amount: clampNonNegative(entry.amount, 0),
      source: entry.source,
      createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
    }))
  safeSetItem(CURRENCY_LOG_KEY, JSON.stringify(currencyLog))

  safeSetItem(SCHEMA_VERSION_KEY, String(SCHEMA_VERSION))
}

function createLocalStorageAdapter(): DbAdapter {
  const getScores = (): ScoreRecord[] => {
    return sanitizeScores(safeParseJson<unknown>(safeGetItem(SCORES_KEY), []))
  }

  const saveScores = (scores: ScoreRecord[]) => {
    safeSetItem(SCORES_KEY, JSON.stringify(sanitizeScores(scores)))
  }

  const getProfile = (): PlayerProfile => {
    return sanitizeProfile(safeParseJson<unknown>(safeGetItem(PROFILE_KEY), defaultProfile))
  }

  const saveProfile = (profile: PlayerProfile) => {
    safeSetItem(PROFILE_KEY, JSON.stringify(sanitizeProfile(profile)))
  }

  const getUpgrades = (): Record<string, number> => {
    return sanitizeUpgrades(safeParseJson<unknown>(safeGetItem(UPGRADES_KEY), {}))
  }

  const saveUpgrades = (upgrades: Record<string, number>) => {
    safeSetItem(UPGRADES_KEY, JSON.stringify(sanitizeUpgrades(upgrades)))
  }

  const getShopPurchases = (): ShopPurchaseRecord[] => {
    return sanitizeShopPurchases(safeParseJson<unknown>(safeGetItem(SHOP_PURCHASES_KEY), []))
  }

  const saveShopPurchases = (purchases: ShopPurchaseRecord[]) => {
    safeSetItem(SHOP_PURCHASES_KEY, JSON.stringify(sanitizeShopPurchases(purchases)))
  }

  const getCurrencyLog = (): { gameId: string; amount: number; source: string; createdAt: string }[] => {
    return safeParseJson<{ gameId: string; amount: number; source: string; createdAt: string }[]>(
      safeGetItem(CURRENCY_LOG_KEY),
      [],
    )
      .filter((entry) => entry && typeof entry.gameId === 'string' && typeof entry.source === 'string')
      .map((entry) => ({
        gameId: entry.gameId,
        amount: clampNonNegative(entry.amount, 0),
        source: entry.source,
        createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
      }))
  }

  const saveCurrencyLog = (log: { gameId: string; amount: number; source: string; createdAt: string }[]) => {
    safeSetItem(CURRENCY_LOG_KEY, JSON.stringify(log))
  }

  return {
    addScore: async (gameId, score, playerName = 'Player') => {
      const scores = getScores()
      scores.push({
        id: Date.now(),
        gameId,
        playerName,
        score,
        date: new Date().toISOString(),
      })
      saveScores(scores)
    },
    getTopScores: async (gameId, limit = 10) => {
      return getScores()
        .filter((s) => s.gameId === gameId)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    },
    getHighScore: async (gameId) => {
      const scores = getScores().filter((s) => s.gameId === gameId)
      if (scores.length === 0) return 0
      return Math.max(...scores.map((s) => s.score))
    },
    getProfile: async () => {
      return getProfile()
    },
    updateProfile: async (partial) => {
      const profile = getProfile()
      Object.assign(profile, sanitizeProfile({ ...profile, ...partial }))
      saveProfile(profile)
    },
    addCoins: async (amount, gameId, source) => {
      const safeAmount = clampNonNegative(amount, 0)
      if (safeAmount <= 0) return
      const profile = getProfile()
      profile.totalCoins += safeAmount
      profile.totalCoinsEarned += safeAmount
      saveProfile(profile)
      const log = getCurrencyLog()
      log.push({ gameId, amount: safeAmount, source, createdAt: new Date().toISOString() })
      saveCurrencyLog(log)
    },
    spendCoins: async (amount) => {
      const safeAmount = clampNonNegative(amount, 0)
      if (safeAmount <= 0) return false
      const profile = getProfile()
      if (profile.totalCoins < safeAmount) return false
      profile.totalCoins -= safeAmount
      saveProfile(profile)
      return true
    },
    purchaseUpgrade: async (upgradeId, cost, level) => {
      const safeCost = clampNonNegative(cost, 0)
      const safeLevel = clampNonNegative(level, 0)
      if (!upgradeId || safeCost <= 0 || safeLevel <= 0) return false

      const profile = getProfile()
      if (profile.totalCoins < safeCost) return false

      profile.totalCoins -= safeCost
      profile.upgrades[upgradeId] = safeLevel
      saveProfile(profile)

      const upgrades = getUpgrades()
      upgrades[upgradeId] = safeLevel
      saveUpgrades(upgrades)

      const purchases = getShopPurchases()
      purchases.unshift({
        id: Date.now(),
        itemType: 'upgrade',
        itemId: upgradeId,
        upgradeId,
        level: safeLevel,
        cost: safeCost,
        purchasedAt: new Date().toISOString(),
      })
      saveShopPurchases(purchases.slice(0, 100))
      return true
    },
    purchaseCollectionItem: async (type, id, cost) => {
      const safeCost = clampNonNegative(cost, 0)
      if (!id || safeCost <= 0) return false

      const profile = getProfile()
      if (profile.totalCoins < safeCost) return false

      const col = sanitizeCollection(safeParseJson<unknown>(safeGetItem(COLLECTION_KEY), defaultCollection))
      const owned = type === 'badge' ? col.badges.includes(id) : col.avatarFrames.includes(id)
      if (owned) return false

      profile.totalCoins -= safeCost
      saveProfile(profile)

      if (type === 'badge') col.badges.push(id)
      if (type === 'avatarFrame') col.avatarFrames.push(id)
      safeSetItem(COLLECTION_KEY, JSON.stringify(col))

      const purchases = getShopPurchases()
      purchases.unshift({
        id: Date.now(),
        itemType: type,
        itemId: id,
        level: 1,
        cost: safeCost,
        purchasedAt: new Date().toISOString(),
      })
      saveShopPurchases(purchases.slice(0, 100))
      return true
    },
    getBalance: async () => {
      return getProfile().totalCoins
    },
    getUpgradeLevel: async (upgradeId) => {
      return getUpgrades()[upgradeId] ?? 0
    },
    setUpgradeLevel: async (upgradeId, level) => {
      const upgrades = getUpgrades()
      upgrades[upgradeId] = clampNonNegative(level, 0)
      saveUpgrades(upgrades)
      const profile = getProfile()
      profile.upgrades[upgradeId] = clampNonNegative(level, 0)
      saveProfile(profile)
    },
    getAllUpgrades: async () => {
      return getUpgrades()
    },
    getShopPurchases: async (limit = 20) => {
      return getShopPurchases()
        .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
        .slice(0, limit)
    },
    getAchievements: async () => {
      return sanitizeAchievements(safeParseJson<unknown>(safeGetItem(ACHIEVEMENTS_KEY), []))
    },
    updateAchievementProgress: async (achievementId, progress) => {
      const achievements = sanitizeAchievements(safeParseJson<unknown>(safeGetItem(ACHIEVEMENTS_KEY), []))
      const idx = achievements.findIndex(a => a.achievementId === achievementId)
      if (idx >= 0) {
        achievements[idx]!.progress = clampNonNegative(progress, 0)
      } else {
        achievements.push({ achievementId, progress: clampNonNegative(progress, 0), unlockedAt: null })
      }
      safeSetItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements))
    },
    unlockAchievement: async (achievementId) => {
      const achievements = sanitizeAchievements(safeParseJson<unknown>(safeGetItem(ACHIEVEMENTS_KEY), []))
      const idx = achievements.findIndex(a => a.achievementId === achievementId)
      if (idx >= 0) {
        achievements[idx]!.unlockedAt = new Date().toISOString()
      } else {
        achievements.push({ achievementId, progress: 1, unlockedAt: new Date().toISOString() })
      }
      safeSetItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements))
    },
    getDailyQuests: async () => {
      return sanitizeDailyQuests(safeParseJson<unknown>(safeGetItem(DAILY_QUESTS_KEY), defaultDailyQuests))
    },
    saveDailyQuests: async (state) => {
      safeSetItem(DAILY_QUESTS_KEY, JSON.stringify(sanitizeDailyQuests(state)))
    },
    getPlayerLevel: async () => {
      return sanitizePlayerLevel(safeParseJson<unknown>(safeGetItem(PLAYER_LEVEL_KEY), defaultPlayerLevel))
    },
    updatePlayerLevel: async (state) => {
      safeSetItem(PLAYER_LEVEL_KEY, JSON.stringify(sanitizePlayerLevel(state)))
    },
    getCollection: async () => {
      return sanitizeCollection(safeParseJson<unknown>(safeGetItem(COLLECTION_KEY), defaultCollection))
    },
    addToCollection: async (type, id) => {
      const col = sanitizeCollection(safeParseJson<unknown>(safeGetItem(COLLECTION_KEY), defaultCollection))
      if (type === 'badge' && !col.badges.includes(id)) col.badges.push(id)
      if (type === 'avatarFrame' && !col.avatarFrames.includes(id)) col.avatarFrames.push(id)
      safeSetItem(COLLECTION_KEY, JSON.stringify(col))
    },
    equipItem: async (type, id) => {
      const col = sanitizeCollection(safeParseJson<unknown>(safeGetItem(COLLECTION_KEY), defaultCollection))
      if (type === 'badge') col.equippedBadge = id
      if (type === 'avatarFrame') col.equippedAvatarFrame = id
      safeSetItem(COLLECTION_KEY, JSON.stringify(col))
    },
    saveRun: async (gameId, runId, stateJson) => {
      const persistedStateJson = toPersistedRunStateJson(stateJson)
      if (!persistedStateJson) {
        return
      }
      const runs = getSavedRuns()
      const existing = runs.findIndex(r => r.runId === runId && r.gameId === gameId)
      if (existing >= 0) {
        runs[existing]!.stateJson = persistedStateJson
        runs[existing]!.savedAt = new Date().toISOString()
      } else {
        runs.push({ gameId, runId, stateJson: persistedStateJson, savedAt: new Date().toISOString() })
      }
      saveSavedRuns(runs)
    },
    loadRun: async (gameId, runId) => {
      const runs = getSavedRuns()
      const run = runs.find(r => r.runId === runId && r.gameId === gameId)
      if (!run?.stateJson) return null
      const restored = fromPersistedRunStateJson(run.stateJson)
      if (!restored) {
        await adapter?.deleteRun(gameId, runId)
        return null
      }
      return restored
    },
    deleteRun: async (gameId, runId) => {
      const runs = getSavedRuns().filter(r => !(r.runId === runId && r.gameId === gameId))
      saveSavedRuns(runs)
    },
    listRuns: async (gameId) => {
      const runs = getSavedRuns()
      return runs
        .filter(r => r.gameId === gameId)
        .map(r => ({ runId: r.runId, savedAt: r.savedAt }))
    },
  }
}

function getSavedRuns(): { gameId: string; runId: string; stateJson: string; savedAt: string }[] {
  return sanitizeSavedRuns(safeParseJson<unknown>(safeGetItem(SAVED_RUNS_KEY), []))
}

function saveSavedRuns(runs: { gameId: string; runId: string; stateJson: string; savedAt: string }[]) {
  safeSetItem(SAVED_RUNS_KEY, JSON.stringify(sanitizeSavedRuns(runs)))
}

async function createCapacitorAdapter(): Promise<DbAdapter> {
  const { Capacitor } = await import('@capacitor/core')
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite')

  const sqlite = new SQLiteConnection(CapacitorSQLite)
  const platform = Capacitor.getPlatform()

  if (platform === 'web') {
    const { defineCustomElements } = await import('jeep-sqlite/loader')
    defineCustomElements(window)
    const jeepEl = document.createElement('jeep-sqlite')
    document.body.appendChild(jeepEl)
    await customElements.whenDefined('jeep-sqlite')
    await sqlite.initWebStore()
  }

  const db = await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false)
  await db.open()

  await db.execute(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId TEXT NOT NULL,
      playerName TEXT NOT NULL DEFAULT 'Player',
      score INTEGER NOT NULL,
      date TEXT DEFAULT (datetime('now', 'localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_scores_game ON scores(gameId, score DESC);

    CREATE TABLE IF NOT EXISTS player_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      total_coins INTEGER DEFAULT 0,
      total_coins_earned INTEGER DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      unique_games_played INTEGER DEFAULT 0,
      total_play_time INTEGER DEFAULT 0,
      achievements TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
    INSERT OR IGNORE INTO player_profile (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS upgrades (
      upgrade_id TEXT PRIMARY KEY,
      current_level INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS shop_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_type TEXT NOT NULL DEFAULT 'upgrade',
      item_id TEXT NOT NULL,
      upgrade_id TEXT,
      level INTEGER NOT NULL DEFAULT 1,
      cost INTEGER NOT NULL,
      purchased_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_shop_purchases_recent ON shop_purchases(purchased_at DESC);

    CREATE TABLE IF NOT EXISTS currency_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS achievements (
      achievement_id TEXT PRIMARY KEY,
      progress REAL DEFAULT 0,
      unlocked_at TEXT,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS daily_quests (
      date TEXT PRIMARY KEY,
      quests_data TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS player_level (
      id INTEGER PRIMARY KEY DEFAULT 1,
      current_level INTEGER DEFAULT 1,
      current_xp INTEGER DEFAULT 0,
      total_xp INTEGER DEFAULT 0,
      title TEXT DEFAULT '新手',
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
    INSERT OR IGNORE INTO player_level (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS player_collection (
      id INTEGER PRIMARY KEY DEFAULT 1,
      badges TEXT DEFAULT '[]',
      avatar_frames TEXT DEFAULT '[]',
      equipped_badge TEXT,
      equipped_avatar_frame TEXT,
      updated_at TEXT DEFAULT (datetime('now','localtime'))
    );
    INSERT OR IGNORE INTO player_collection (id) VALUES (1);

    CREATE TABLE IF NOT EXISTS saved_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      run_id TEXT NOT NULL,
      state_json TEXT NOT NULL,
      saved_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE INDEX IF NOT EXISTS idx_saved_runs ON saved_runs(game_id, run_id);

    CREATE TABLE IF NOT EXISTS db_meta (
      meta_key TEXT PRIMARY KEY,
      meta_value TEXT NOT NULL
    );
  `)

  const purchaseColumns = await db.query('PRAGMA table_info(shop_purchases)')
  const purchaseColumnRows = (purchaseColumns.values ?? []) as { name: string; notnull?: number }[]
  const purchaseColumnNames = new Set(purchaseColumnRows.map((row) => row.name))
  const upgradeColumn = purchaseColumnRows.find((row) => row.name === 'upgrade_id')
  const needsPurchaseLedgerMigration =
    !purchaseColumnNames.has('item_type') || !purchaseColumnNames.has('item_id') || upgradeColumn?.notnull === 1

  if (needsPurchaseLedgerMigration) {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS shop_purchases_next (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_type TEXT NOT NULL DEFAULT 'upgrade',
        item_id TEXT NOT NULL,
        upgrade_id TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        cost INTEGER NOT NULL,
        purchased_at TEXT DEFAULT (datetime('now','localtime'))
      );
    `)
    if (purchaseColumnNames.has('item_type') && purchaseColumnNames.has('item_id')) {
      await db.run(`
        INSERT INTO shop_purchases_next (id, item_type, item_id, upgrade_id, level, cost, purchased_at)
        SELECT id, item_type, item_id, upgrade_id, level, cost, purchased_at
        FROM shop_purchases
        WHERE item_id IS NOT NULL AND trim(item_id) <> '' AND cost >= 0 AND level >= 0
      `)
    } else {
      await db.run(`
        INSERT INTO shop_purchases_next (id, item_type, item_id, upgrade_id, level, cost, purchased_at)
        SELECT id, 'upgrade', upgrade_id, upgrade_id, level, cost, purchased_at
        FROM shop_purchases
        WHERE upgrade_id IS NOT NULL AND trim(upgrade_id) <> '' AND cost >= 0 AND level >= 0
      `)
    }
    await db.run('DROP TABLE shop_purchases')
    await db.run('ALTER TABLE shop_purchases_next RENAME TO shop_purchases')
    await db.run('CREATE INDEX IF NOT EXISTS idx_shop_purchases_recent ON shop_purchases(purchased_at DESC)')
  }

  const schemaMeta = await db.query("SELECT meta_value FROM db_meta WHERE meta_key = 'schema_version'")
  const schemaVersionRaw = schemaMeta.values?.[0] as { meta_value?: string } | undefined
  const sqliteSchemaVersion = Number(schemaVersionRaw?.meta_value ?? '0')

  if (!Number.isFinite(sqliteSchemaVersion) || sqliteSchemaVersion < SCHEMA_VERSION) {
    await db.run(
      "INSERT OR REPLACE INTO db_meta (meta_key, meta_value) VALUES ('schema_version', ?)",
      [String(SCHEMA_VERSION)],
    )
    await db.run("DELETE FROM saved_runs WHERE state_json IS NULL OR trim(state_json) = ''")
    await db.run('UPDATE player_profile SET total_coins = MAX(total_coins, 0), total_coins_earned = MAX(total_coins_earned, 0), games_played = MAX(games_played, 0), total_play_time = MAX(total_play_time, 0) WHERE id = 1')
    await db.run('UPDATE player_level SET current_level = MAX(current_level, 1), current_xp = MAX(current_xp, 0), total_xp = MAX(total_xp, 0) WHERE id = 1')
    await db.run('UPDATE upgrades SET current_level = MAX(current_level, 0)')
    await db.run('DELETE FROM shop_purchases WHERE item_id IS NULL OR trim(item_id) = "" OR cost < 0 OR level < 0')
    if (platform === 'web') {
      await sqlite.saveToStore(DB_NAME)
    }
  }

  return {
    addScore: async (gameId, score, playerName = 'Player') => {
      await db.run('INSERT INTO scores (gameId, playerName, score) VALUES (?, ?, ?)', [
        gameId,
        playerName,
        score,
      ])
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    getTopScores: async (gameId, limit = 10) => {
      const result = await db.query(
        'SELECT id, gameId, playerName, score, date FROM scores WHERE gameId = ? ORDER BY score DESC LIMIT ?',
        [gameId, limit],
      )
      return (result.values ?? []) as ScoreRecord[]
    },
    getHighScore: async (gameId) => {
      const result = await db.query(
        'SELECT MAX(score) as maxScore FROM scores WHERE gameId = ?',
        [gameId],
      )
      const row = result.values?.[0] as { maxScore: number | null } | undefined
      return row?.maxScore ?? 0
    },
    getProfile: async () => {
      const result = await db.query(
        'SELECT total_coins, total_coins_earned, games_played, unique_games_played, total_play_time, achievements FROM player_profile WHERE id = 1',
      )
      const row = result.values?.[0] as {
        total_coins: number
        total_coins_earned: number
        games_played: number
        unique_games_played: number
        total_play_time: number
        achievements: string
      } | undefined
      if (!row) {
        return { totalCoins: 0, totalCoinsEarned: 0, upgrades: {}, gamesPlayed: 0, uniqueGamesPlayed: 0, totalPlayTime: 0, achievements: [] }
      }
      const upgradesResult = await db.query('SELECT upgrade_id, current_level FROM upgrades')
      const upgrades: Record<string, number> = {}
      for (const u of (upgradesResult.values ?? []) as { upgrade_id: string; current_level: number }[]) {
        upgrades[u.upgrade_id] = u.current_level
      }
      return sanitizeProfile({
        totalCoins: row.total_coins,
        totalCoinsEarned: row.total_coins_earned,
        upgrades,
        gamesPlayed: row.games_played,
        uniqueGamesPlayed: row.unique_games_played,
        totalPlayTime: row.total_play_time,
        achievements: sanitizeStringArray(safeParseJson<unknown>(row.achievements, [])),
      })
    },
    updateProfile: async (partial) => {
      const fields: string[] = []
      const values: (string | number)[] = []
      if (partial.totalCoins !== undefined) { fields.push('total_coins = ?'); values.push(partial.totalCoins) }
      if (partial.totalCoinsEarned !== undefined) { fields.push('total_coins_earned = ?'); values.push(partial.totalCoinsEarned) }
      if (partial.gamesPlayed !== undefined) { fields.push('games_played = ?'); values.push(partial.gamesPlayed) }
      if (partial.uniqueGamesPlayed !== undefined) { fields.push('unique_games_played = ?'); values.push(partial.uniqueGamesPlayed) }
      if (partial.totalPlayTime !== undefined) { fields.push('total_play_time = ?'); values.push(partial.totalPlayTime) }
      if (partial.achievements !== undefined) { fields.push('achievements = ?'); values.push(JSON.stringify(partial.achievements)) }
      if (fields.length > 0) {
        fields.push("updated_at = datetime('now','localtime')")
        await db.run(`UPDATE player_profile SET ${fields.join(', ')} WHERE id = 1`, values)
        if (platform === 'web') {
          await sqlite.saveToStore(DB_NAME)
        }
      }
    },
    addCoins: async (amount, gameId, source) => {
      const safeAmount = clampNonNegative(amount, 0)
      if (safeAmount <= 0) return
      await db.run(
        'UPDATE player_profile SET total_coins = total_coins + ?, total_coins_earned = total_coins_earned + ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
        [safeAmount, safeAmount],
      )
      await db.run(
        'INSERT INTO currency_log (game_id, amount, source) VALUES (?, ?, ?)',
        [gameId, safeAmount, source],
      )
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    spendCoins: async (amount) => {
      const safeAmount = clampNonNegative(amount, 0)
      if (safeAmount <= 0) return false
      const result = await db.query('SELECT total_coins FROM player_profile WHERE id = 1')
      const row = result.values?.[0] as { total_coins: number } | undefined
      const balance = row?.total_coins ?? 0
      if (balance < safeAmount) return false
      await db.run(
        'UPDATE player_profile SET total_coins = total_coins - ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
        [safeAmount],
      )
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
      return true
    },
    purchaseUpgrade: async (upgradeId, cost, level) => {
      const safeCost = clampNonNegative(cost, 0)
      const safeLevel = clampNonNegative(level, 0)
      if (!upgradeId || safeCost <= 0 || safeLevel <= 0) return false

      const result = await db.query('SELECT total_coins FROM player_profile WHERE id = 1')
      const row = result.values?.[0] as { total_coins: number } | undefined
      const balance = row?.total_coins ?? 0
      if (balance < safeCost) return false

      try {
        await db.run('BEGIN TRANSACTION')
        await db.run(
          'UPDATE player_profile SET total_coins = total_coins - ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
          [safeCost],
        )
        await db.run(
          'INSERT OR REPLACE INTO upgrades (upgrade_id, current_level, updated_at) VALUES (?, ?, datetime(\'now\',\'localtime\'))',
          [upgradeId, safeLevel],
        )
        await db.run(
          'INSERT INTO shop_purchases (item_type, item_id, upgrade_id, level, cost) VALUES (?, ?, ?, ?, ?)',
          ['upgrade', upgradeId, upgradeId, safeLevel, safeCost],
        )
        await db.run('COMMIT')
      } catch (error) {
        try {
          await db.run('ROLLBACK')
        } catch {
          // ignore rollback failures; the original transaction error is the useful one
        }
        throw error
      }

      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
      return true
    },
    purchaseCollectionItem: async (type, id, cost) => {
      const safeCost = clampNonNegative(cost, 0)
      if (!id || safeCost <= 0) return false

      const result = await db.query('SELECT total_coins FROM player_profile WHERE id = 1')
      const row = result.values?.[0] as { total_coins: number } | undefined
      const balance = row?.total_coins ?? 0
      if (balance < safeCost) return false

      const col = await adapter!.getCollection()
      const owned = type === 'badge' ? col.badges.includes(id) : col.avatarFrames.includes(id)
      if (owned) return false

      if (type === 'badge') col.badges.push(id)
      if (type === 'avatarFrame') col.avatarFrames.push(id)

      try {
        await db.run('BEGIN TRANSACTION')
        await db.run(
          'UPDATE player_profile SET total_coins = total_coins - ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
          [safeCost],
        )
        await db.run(
          'UPDATE player_collection SET badges = ?, avatar_frames = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
          [JSON.stringify(col.badges), JSON.stringify(col.avatarFrames)],
        )
        await db.run(
          'INSERT INTO shop_purchases (item_type, item_id, upgrade_id, level, cost) VALUES (?, ?, NULL, 1, ?)',
          [type, id, safeCost],
        )
        await db.run('COMMIT')
      } catch (error) {
        try {
          await db.run('ROLLBACK')
        } catch {
          // ignore rollback failures; the original transaction error is the useful one
        }
        throw error
      }

      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
      return true
    },
    getBalance: async () => {
      const result = await db.query('SELECT total_coins FROM player_profile WHERE id = 1')
      const row = result.values?.[0] as { total_coins: number } | undefined
      return row?.total_coins ?? 0
    },
    getUpgradeLevel: async (upgradeId) => {
      const result = await db.query(
        'SELECT current_level FROM upgrades WHERE upgrade_id = ?',
        [upgradeId],
      )
      const row = result.values?.[0] as { current_level: number } | undefined
      return row?.current_level ?? 0
    },
    setUpgradeLevel: async (upgradeId, level) => {
      const safeLevel = clampNonNegative(level, 0)
      await db.run(
        'INSERT OR REPLACE INTO upgrades (upgrade_id, current_level, updated_at) VALUES (?, ?, datetime(\'now\',\'localtime\'))',
        [upgradeId, safeLevel],
      )
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    getAllUpgrades: async () => {
      const result = await db.query('SELECT upgrade_id, current_level FROM upgrades')
      const upgrades: Record<string, number> = {}
      for (const row of (result.values ?? []) as { upgrade_id: string; current_level: number }[]) {
        upgrades[row.upgrade_id] = row.current_level
      }
      return upgrades
    },
    getShopPurchases: async (limit = 20) => {
      const result = await db.query(
        'SELECT id, item_type, item_id, upgrade_id, level, cost, purchased_at FROM shop_purchases ORDER BY purchased_at DESC, id DESC LIMIT ?',
        [limit],
      )
      return (result.values ?? []).map((row: {
        id: number
        item_type: 'upgrade' | 'badge' | 'avatarFrame'
        item_id: string
        upgrade_id: string | null
        level: number
        cost: number
        purchased_at: string
      }) => ({
        id: row.id,
        itemType: row.item_type,
        itemId: row.item_id,
        upgradeId: row.upgrade_id ?? undefined,
        level: row.level,
        cost: row.cost,
        purchasedAt: row.purchased_at,
      }))
    },
    getAchievements: async () => {
      const result = await db.query('SELECT achievement_id, progress, unlocked_at FROM achievements')
      return (result.values ?? []).map((r: { achievement_id: string; progress: number; unlocked_at: string | null }) => ({
        achievementId: r.achievement_id,
        progress: r.progress,
        unlockedAt: r.unlocked_at,
      })) as PlayerAchievement[]
    },
    updateAchievementProgress: async (achievementId, progress) => {
      const safeProgress = clampNonNegative(progress, 0)
      await db.run(
        'INSERT OR REPLACE INTO achievements (achievement_id, progress, updated_at) VALUES (?, ?, datetime(\'now\',\'localtime\'))',
        [achievementId, safeProgress],
      )
    },
    unlockAchievement: async (achievementId) => {
      await db.run(
        'INSERT OR REPLACE INTO achievements (achievement_id, progress, unlocked_at, updated_at) VALUES (?, 1, datetime(\'now\',\'localtime\'), datetime(\'now\',\'localtime\'))',
        [achievementId],
      )
    },
    getDailyQuests: async () => {
      const today = new Date().toISOString().split('T')[0] ?? ''
      const result = await db.query('SELECT quests_data FROM daily_quests WHERE date = ?', [today])
      const row = result.values?.[0] as { quests_data: string } | undefined
      if (row) {
        const parsed = sanitizeDailyQuests({ date: today, quests: safeParseJson<unknown>(row.quests_data, []) })
        return { ...parsed, date: today }
      }
      return { date: today, quests: [] }
    },
    saveDailyQuests: async (state) => {
      await db.run(
        'INSERT OR REPLACE INTO daily_quests (date, quests_data, updated_at) VALUES (?, ?, datetime(\'now\',\'localtime\'))',
        [state.date, JSON.stringify(state.quests)],
      )
    },
    getPlayerLevel: async () => {
      const result = await db.query('SELECT current_level, current_xp, total_xp, title FROM player_level WHERE id = 1')
      const row = result.values?.[0] as { current_level: number; current_xp: number; total_xp: number; title: string } | undefined
      return row
        ? sanitizePlayerLevel({ level: row.current_level, xp: row.current_xp, totalXp: row.total_xp, title: row.title })
        : { ...defaultPlayerLevel }
    },
    updatePlayerLevel: async (state) => {
      await db.run(
        'UPDATE player_level SET current_level = ?, current_xp = ?, total_xp = ?, title = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
        [state.level, state.xp, state.totalXp, state.title],
      )
    },
    getCollection: async () => {
      const result = await db.query('SELECT badges, avatar_frames, equipped_badge, equipped_avatar_frame FROM player_collection WHERE id = 1')
      const row = result.values?.[0] as { badges: string; avatar_frames: string; equipped_badge: string | null; equipped_avatar_frame: string | null } | undefined
      return row
        ? sanitizeCollection({
            badges: safeParseJson<unknown>(row.badges, []),
            avatarFrames: safeParseJson<unknown>(row.avatar_frames, []),
            equippedBadge: row.equipped_badge,
            equippedAvatarFrame: row.equipped_avatar_frame,
          })
        : { ...defaultCollection }
    },
    addToCollection: async (type, id) => {
      const col = await adapter!.getCollection()
      if (type === 'badge' && !col.badges.includes(id)) col.badges.push(id)
      if (type === 'avatarFrame' && !col.avatarFrames.includes(id)) col.avatarFrames.push(id)
      await db.run(
        'UPDATE player_collection SET badges = ?, avatar_frames = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
        [JSON.stringify(col.badges), JSON.stringify(col.avatarFrames)],
      )
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    equipItem: async (type, id) => {
      const col = await adapter!.getCollection()
      if (type === 'badge') col.equippedBadge = id
      if (type === 'avatarFrame') col.equippedAvatarFrame = id
      await db.run(
        'UPDATE player_collection SET equipped_badge = ?, equipped_avatar_frame = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = 1',
        [col.equippedBadge, col.equippedAvatarFrame],
      )
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    saveRun: async (gameId, runId, stateJson) => {
      const persistedStateJson = toPersistedRunStateJson(stateJson)
      if (!persistedStateJson) return
      await db.run(
        'INSERT OR REPLACE INTO saved_runs (game_id, run_id, state_json, saved_at) VALUES (?, ?, ?, datetime(\'now\',\'localtime\'))',
        [gameId, runId, persistedStateJson],
      )
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    loadRun: async (gameId, runId) => {
      const result = await db.query(
        'SELECT state_json FROM saved_runs WHERE game_id = ? AND run_id = ?',
        [gameId, runId],
      )
      const row = result.values?.[0] as { state_json: string } | undefined
      if (!row?.state_json) return null
      const restored = fromPersistedRunStateJson(row.state_json)
      if (!restored) {
        await db.run('DELETE FROM saved_runs WHERE game_id = ? AND run_id = ?', [gameId, runId])
        if (platform === 'web') {
          await sqlite.saveToStore(DB_NAME)
        }
      }
      return restored
    },
    deleteRun: async (gameId, runId) => {
      await db.run('DELETE FROM saved_runs WHERE game_id = ? AND run_id = ?', [gameId, runId])
      if (platform === 'web') {
        await sqlite.saveToStore(DB_NAME)
      }
    },
    listRuns: async (gameId) => {
      const result = await db.query(
        'SELECT run_id, saved_at FROM saved_runs WHERE game_id = ? ORDER BY saved_at DESC',
        [gameId],
      )
      return (result.values ?? []).map((r: { run_id: string; saved_at: string }) => ({
        runId: r.run_id,
        savedAt: r.saved_at,
      }))
    },
  }
}

async function initDatabase(): Promise<void> {
  if (isReady.value) return

  migrateLocalStorageSchema()

  try {
    const { Capacitor } = await import('@capacitor/core')
    const platform = Capacitor.getPlatform()
    
    if (platform === 'web') {
      adapter = createLocalStorageAdapter()
    } else {
      adapter = await createCapacitorAdapter()
    }
  } catch {
    adapter = createLocalStorageAdapter()
  }

  isReady.value = true
}

async function addScore(gameId: string, score: number, playerName = 'Player'): Promise<void> {
  await adapter?.addScore(gameId, score, playerName)
}

async function getTopScores(gameId: string, limit = 10): Promise<ScoreRecord[]> {
  return (await adapter?.getTopScores(gameId, limit)) ?? []
}

async function getHighScore(gameId: string): Promise<number> {
  return (await adapter?.getHighScore(gameId)) ?? 0
}

async function getProfile(): Promise<PlayerProfile> {
  return (await adapter?.getProfile()) ?? { ...defaultProfile }
}

async function updateProfile(partial: Partial<PlayerProfile>): Promise<void> {
  await adapter?.updateProfile(partial)
}

async function addCoins(amount: number, gameId: string, source: string): Promise<void> {
  await adapter?.addCoins(amount, gameId, source)
}

async function spendCoins(amount: number): Promise<boolean> {
  return (await adapter?.spendCoins(amount)) ?? false
}

async function purchaseUpgrade(upgradeId: string, cost: number, level: number): Promise<boolean> {
  return (await adapter?.purchaseUpgrade(upgradeId, cost, level)) ?? false
}

async function purchaseCollectionItem(type: 'badge' | 'avatarFrame', id: string, cost: number): Promise<boolean> {
  return (await adapter?.purchaseCollectionItem(type, id, cost)) ?? false
}

async function getBalance(): Promise<number> {
  return (await adapter?.getBalance()) ?? 0
}

async function getUpgradeLevel(upgradeId: string): Promise<number> {
  return (await adapter?.getUpgradeLevel(upgradeId)) ?? 0
}

async function setUpgradeLevel(upgradeId: string, level: number): Promise<void> {
  await adapter?.setUpgradeLevel(upgradeId, level)
}

async function getAllUpgrades(): Promise<Record<string, number>> {
  return (await adapter?.getAllUpgrades()) ?? {}
}

async function getShopPurchases(limit = 20): Promise<ShopPurchaseRecord[]> {
  return (await adapter?.getShopPurchases(limit)) ?? []
}

async function getAchievements(): Promise<PlayerAchievement[]> {
  return (await adapter?.getAchievements()) ?? []
}

async function updateAchievementProgress(achievementId: string, progress: number): Promise<void> {
  await adapter?.updateAchievementProgress(achievementId, progress)
}

async function unlockAchievement(achievementId: string): Promise<void> {
  await adapter?.unlockAchievement(achievementId)
}

async function getDailyQuests(): Promise<DailyQuestsState> {
  return (await adapter?.getDailyQuests()) ?? { date: '', quests: [] }
}

async function saveDailyQuests(state: DailyQuestsState): Promise<void> {
  await adapter?.saveDailyQuests(state)
}

async function getPlayerLevel(): Promise<PlayerLevelState> {
  return (await adapter?.getPlayerLevel()) ?? { level: 1, xp: 0, totalXp: 0, title: '新手' }
}

async function updatePlayerLevel(state: PlayerLevelState): Promise<void> {
  await adapter?.updatePlayerLevel(state)
}

async function getCollection(): Promise<PlayerCollection> {
  return (await adapter?.getCollection()) ?? { badges: [], avatarFrames: [], equippedBadge: null, equippedAvatarFrame: null }
}

async function addToCollection(type: 'badge' | 'avatarFrame', id: string): Promise<void> {
  await adapter?.addToCollection(type, id)
}

async function equipItem(type: 'badge' | 'avatarFrame', id: string | null): Promise<void> {
  await adapter?.equipItem(type, id)
}

async function saveRun(gameId: string, runId: string, stateJson: string): Promise<void> {
  await adapter?.saveRun(gameId, runId, stateJson)
}

async function loadRun(gameId: string, runId: string): Promise<string | null> {
  return (await adapter?.loadRun(gameId, runId)) ?? null
}

async function deleteRun(gameId: string, runId: string): Promise<void> {
  await adapter?.deleteRun(gameId, runId)
}

async function listRuns(gameId: string): Promise<{ runId: string; savedAt: string }[]> {
  return (await adapter?.listRuns(gameId)) ?? []
}

export function useDatabase() {
  return {
    isReady,
    initDatabase,
    addScore,
    getTopScores,
    getHighScore,
    getProfile,
    updateProfile,
    addCoins,
    spendCoins,
    purchaseUpgrade,
    purchaseCollectionItem,
    getBalance,
    getUpgradeLevel,
    setUpgradeLevel,
    getAllUpgrades,
    getShopPurchases,
    getAchievements,
    updateAchievementProgress,
    unlockAchievement,
    getDailyQuests,
    saveDailyQuests,
    getPlayerLevel,
    updatePlayerLevel,
    getCollection,
    addToCollection,
    equipItem,
    saveRun,
    loadRun,
    deleteRun,
    listRuns,
  }
}
