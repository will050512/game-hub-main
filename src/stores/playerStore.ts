import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PlayerProfile, PlayerAchievement, DailyQuestsState, PlayerLevelState, PlayerCollection } from '@/types'
import { useDatabase } from '@/composables/useDatabase'
import { permanentUpgrades } from '@/data/upgrades'

const DEFAULT_PROFILE: PlayerProfile = {
  totalCoins: 0,
  totalCoinsEarned: 0,
  upgrades: {},
  gamesPlayed: 0,
  uniqueGamesPlayed: 0,
  totalPlayTime: 0,
  achievements: [],
}

const PLAYER_LEVELS = [
  { level: 1, xpRequired: 100, totalXpRequired: 0, title: '新手' },
  { level: 2, xpRequired: 200, totalXpRequired: 100, title: '學徒' },
  { level: 3, xpRequired: 350, totalXpRequired: 300, title: '玩家' },
  { level: 4, xpRequired: 500, totalXpRequired: 650, title: '熟手' },
  { level: 5, xpRequired: 750, totalXpRequired: 1150, title: '高手' },
  { level: 6, xpRequired: 1000, totalXpRequired: 1900, title: '菁英' },
  { level: 7, xpRequired: 1500, totalXpRequired: 2900, title: '大師' },
  { level: 8, xpRequired: 2000, totalXpRequired: 4400, title: '宗師' },
  { level: 9, xpRequired: 3000, totalXpRequired: 6400, title: '傳奇' },
  { level: 10, xpRequired: 5000, totalXpRequired: 9400, title: '神話' },
]

function getLevelInfo(totalXp: number): PlayerLevelState {
  const accumulated = 0
  for (let i = PLAYER_LEVELS.length - 1; i >= 0; i--) {
    const lv = PLAYER_LEVELS[i]!
    if (totalXp >= lv.totalXpRequired) {
      const currentLevelXp = totalXp - lv.totalXpRequired
      const nextLevel = PLAYER_LEVELS[i + 1]
      const xpToNext = nextLevel ? nextLevel.totalXpRequired - lv.totalXpRequired : lv.xpRequired
      return { level: lv.level, xp: currentLevelXp, totalXp, title: lv.title }
    }
  }
  return { level: 1, xp: totalXp, totalXp, title: '新手' }
}

export const usePlayerStore = defineStore('player', () => {
  const profile = ref<PlayerProfile>({ ...DEFAULT_PROFILE })
  const isLoaded = ref(false)

  const levelState = ref<PlayerLevelState>({ level: 1, xp: 0, totalXp: 0, title: '新手' })
  const achievements = ref<PlayerAchievement[]>([])
  const dailyQuests = ref<DailyQuestsState>({ date: '', quests: [] })
  const collection = ref<PlayerCollection>({ badges: [], avatarFrames: [], equippedBadge: null, equippedAvatarFrame: null })
  const playedGameIds = ref<Set<string>>(new Set())

  async function loadProfile() {
    const db = useDatabase()
    const loaded = await db.getProfile()
    profile.value = loaded
    levelState.value = await db.getPlayerLevel()
    achievements.value = await db.getAchievements()
    dailyQuests.value = await db.getDailyQuests()
    collection.value = await db.getCollection()
    isLoaded.value = true
    playedGameIds.value = new Set()
  }

  async function incrementGamesPlayed() {
    profile.value.gamesPlayed++
    const db = useDatabase()
    await db.updateProfile({ gamesPlayed: profile.value.gamesPlayed })
  }

  async function incrementUniqueGamesPlayed(gameId: string) {
    if (!playedGameIds.value.has(gameId)) {
      playedGameIds.value.add(gameId)
      profile.value.uniqueGamesPlayed++
      const db = useDatabase()
      await db.updateProfile({ uniqueGamesPlayed: profile.value.uniqueGamesPlayed })
    }
  }

  async function addPlayTime(ms: number) {
    profile.value.totalPlayTime += ms
    const db = useDatabase()
    await db.updateProfile({ totalPlayTime: profile.value.totalPlayTime })
  }

  function getUpgradeLevel(upgradeId: string): number {
    return profile.value.upgrades[upgradeId] ?? 0
  }

  const totalUpgradeLevel = computed(() => {
    return Object.values(profile.value.upgrades).reduce((sum, lv) => sum + lv, 0)
  })

  const upgradeTag = computed(() => {
    const total = totalUpgradeLevel.value
    if (total === 0) return ''
    return `Lv${total}`
  })

  function getEffectiveStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const upgrade of permanentUpgrades) {
      const level = getUpgradeLevel(upgrade.id)
      if (level === 0) continue
      for (const effect of upgrade.effects) {
        if (effect.isMultiplier) {
          stats[effect.stat] = (stats[effect.stat] ?? 1.0) + effect.value * level
        } else {
          stats[effect.stat] = (stats[effect.stat] ?? 0) + effect.value * level
        }
      }
    }
    return stats
  }

  async function syncUpgradesFromDb() {
    const db = useDatabase()
    const upgrades = await db.getAllUpgrades()
    profile.value.upgrades = upgrades
  }

  async function addXp(amount: number) {
    const safeAmount = Number.isFinite(amount) && amount > 0 ? Math.floor(amount) : 0
    if (safeAmount <= 0) return
    const db = useDatabase()
    const newTotal = levelState.value.totalXp + safeAmount
    const newLevel = getLevelInfo(newTotal)
    levelState.value = newLevel
    await db.updatePlayerLevel(newLevel)
  }

  async function updateAchievementProgress(achievementId: string, progress: number) {
    const db = useDatabase()
    await db.updateAchievementProgress(achievementId, progress)
    const idx = achievements.value.findIndex(a => a.achievementId === achievementId)
    if (idx >= 0) {
      achievements.value[idx]!.progress = progress
    } else {
      achievements.value.push({ achievementId, progress, unlockedAt: null })
    }
  }

  async function unlockAchievement(achievementId: string) {
    const db = useDatabase()
    await db.unlockAchievement(achievementId)
    const idx = achievements.value.findIndex(a => a.achievementId === achievementId)
    if (idx >= 0) {
      achievements.value[idx]!.unlockedAt = new Date().toISOString()
      achievements.value[idx]!.progress = 1
    } else {
      achievements.value.push({ achievementId, progress: 1, unlockedAt: new Date().toISOString() })
    }
  }

  async function applyUpgradeLevels(upgrades: Record<string, number>) {
    const db = useDatabase()
    for (const [upgradeId, level] of Object.entries(upgrades)) {
      const safeLevel = Number.isFinite(level) && level >= 0 ? Math.floor(level) : 0
      await db.setUpgradeLevel(upgradeId, safeLevel)
      profile.value.upgrades[upgradeId] = safeLevel
    }
  }

  async function applyDailyQuestDelta(deltaByQuestId: Record<string, number>): Promise<string[]> {
    const current = dailyQuests.value
    if (!current.date || current.quests.length === 0) return []

    const updatedQuestIds: string[] = []
    const nextState: DailyQuestsState = {
      date: current.date,
      quests: current.quests.map((quest) => {
        const rawDelta = deltaByQuestId[quest.questId] ?? 0
        const safeDelta = Number.isFinite(rawDelta) && rawDelta > 0 ? Math.floor(rawDelta) : 0
        if (safeDelta <= 0) return quest
        updatedQuestIds.push(quest.questId)
        const currentProgress = Number.isFinite(quest.current) ? quest.current : 0
        return {
          ...quest,
          current: currentProgress + safeDelta,
        }
      }),
    }

    if (updatedQuestIds.length > 0) {
      await updateDailyQuests(nextState)
    }

    return updatedQuestIds
  }

  async function updateDailyQuests(state: DailyQuestsState) {
    const db = useDatabase()
    await db.saveDailyQuests(state)
    dailyQuests.value = state
  }

  async function addToCollection(type: 'badge' | 'avatarFrame', id: string) {
    const db = useDatabase()
    await db.addToCollection(type, id)
    collection.value = await db.getCollection()
  }

  async function equipItem(type: 'badge' | 'avatarFrame', id: string | null) {
    const db = useDatabase()
    await db.equipItem(type, id)
    collection.value = await db.getCollection()
  }

  return {
    profile,
    isLoaded,
    levelState,
    achievements,
    dailyQuests,
    collection,
    loadProfile,
    incrementGamesPlayed,
    incrementUniqueGamesPlayed,
    addPlayTime,
    getUpgradeLevel,
    totalUpgradeLevel,
    upgradeTag,
    getEffectiveStats,
    syncUpgradesFromDb,
    addXp,
    updateAchievementProgress,
    unlockAchievement,
    applyUpgradeLevels,
    applyDailyQuestDelta,
    updateDailyQuests,
    addToCollection,
    equipItem,
  }
})
