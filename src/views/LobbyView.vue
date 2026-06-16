<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { gameRegistry, categories, getGamesByCategory } from '@/games/registry'
import { useCurrencyStore } from '@/stores/currencyStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useDatabase } from '@/composables/useDatabase'
import { generateDailyQuests } from '@/data/dailyQuests'
import { checkAchievements, getAchievementDefById } from '@/data/achievementUtils'
import type { AchievementDef, DailyQuestDef } from '@/types'

// --- Shell imports ---
import LobbyOrbs from '@/components/shell/LobbyOrbs.vue'
import LobbyHeroSection from '@/components/shell/LobbyHeroSection.vue'
import LobbyViewTabs from '@/components/shell/LobbyViewTabs.vue'
import LobbyCategoryBar from '@/components/shell/LobbyCategoryBar.vue'
import LobbySearchBar from '@/components/shell/LobbySearchBar.vue'
import LobbyGameGrid from '@/components/shell/LobbyGameGrid.vue'
import PlayerProfileCard from '@/components/shell/PlayerProfileCard.vue'
import AudioMixerPanel from '@/components/settings/AudioMixerPanel.vue'

// --- Quest/Achievement imports ---
import QuestPanel from '@/components/QuestPanel.vue'
import AchievementToast from '@/components/AchievementToast.vue'
import AchievementList from '@/components/AchievementList.vue'
import DailyQuestsSection from '@/components/DailyQuestsSection.vue'

// --- Stores ---
const router = useRouter()
const currencyStore = useCurrencyStore()
const playerStore = usePlayerStore()
const db = useDatabase()

// --- State ---
const activeCategory = ref('all')
const activeView = ref<'games' | 'quests' | 'achievements' | 'audio'>('games')
const highScores = ref<Record<string, number>>({})
const searchQuery = ref('')
const showQuests = ref(false)
const dailyQuests = ref<DailyQuestDef[]>([])
const achievementQueue = ref<AchievementDef[]>([])
const mascotClicks = ref(0)

// --- Computed ---
const filteredGames = computed(() => {
  let games = getGamesByCategory(activeCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    games = games.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      (g.tags && g.tags.some(t => t.toLowerCase().includes(q)))
    )
  }
  return games
})

const xpPercent = computed(() => {
  const { level, xp } = playerStore.levelState
  const nextLevelXp = [100,200,350,500,750,1000,1500,2000,3000,5000][level-1] ?? 5000
  return Math.min(100, (xp / nextLevelXp) * 100)
})

const unlockedCount = computed(() => playerStore.achievements.filter(a => a.unlockedAt).length)

// --- Handlers ---
function goToGame(id: string): void {
  router.push({ name: 'game-info', params: { id } })
}

function goToShop(): void {
  router.push({ name: 'shop' })
}

function checkAndUnlock(): void {
  const scores = Object.fromEntries(Object.entries(highScores.value))
  const best = Math.max(0, ...Object.values(highScores.value))
  const result = checkAchievements(playerStore.achievements, {
    gamesPlayed: playerStore.profile.gamesPlayed,
    totalCoins: playerStore.profile.totalCoinsEarned,
    totalPlayTime: playerStore.profile.totalPlayTime,
    winStreak: 0,
    bestScore: best,
    bestScoreByGame: scores,
  })
  for (const id of result.newlyUnlocked) {
    const def = getAchievementDefById(id)
    if (def) {
      playerStore.unlockAchievement(id)
      currencyStore.earnFromGame('achievement', def.reward.coins)
      currencyStore.settlePending('achievement')
      achievementQueue.value.push(def)
    }
  }
}

async function initQuests(): Promise<void> {
  const today = new Date().toISOString().split('T')[0] ?? ''
  const stored = playerStore.dailyQuests as unknown as { date?: string; quests?: Array<{ questId: string; current: number; completed: boolean; claimed: boolean }> }
  if ((stored?.date ?? '') !== today) {
    const q = generateDailyQuests()
    dailyQuests.value = q
    await playerStore.updateDailyQuests({ date: today, quests: q.map(x => ({ questId: x.id, current: 0, completed: false, claimed: false })) })
  } else {
    const all = generateDailyQuests()
    const mapped = (stored?.quests ?? []).map(q => all.find(g => g.id === q.questId) ?? all[0]).filter((q): q is DailyQuestDef => q != null)
    dailyQuests.value = mapped.length > 0 ? mapped : all
  }
}

function handleMascotClick(): void {
  mascotClicks.value++
}

onMounted(async () => {
  await Promise.all([currencyStore.loadBalance(), playerStore.loadProfile()])
  await Promise.all(gameRegistry.map(g => db.getHighScore(g.id).then(s => { highScores.value[g.id] = s })))
  checkAndUnlock()
  await initQuests()
})
</script>

<template>
  <div class="lobby">
    <LobbyOrbs />
    <main class="lobby-content">
      <!-- Hero Section -->
      <Transition name="hero-enter" mode="out-in">
        <LobbyHeroSection
          v-if="activeView === 'games'"
          :key="`hero-${activeCategory}`"
          :games-count="gameRegistry.length"
          :level="playerStore.levelState.level"
          :level-title="playerStore.levelState.title"
          :xp-percent="xpPercent"
          :games-played="playerStore.profile.gamesPlayed"
          :unlocked-count="unlockedCount"
          :coins="currencyStore.balance"
          @show-quests="showQuests = !showQuests"
          @mascot-click="handleMascotClick"
        />
      </Transition>

      <PlayerProfileCard />

      <!-- Quest Panel -->
      <Transition name="quest-panel">
        <QuestPanel
          v-if="showQuests && dailyQuests.length > 0"
          :quests="dailyQuests"
          :progress="playerStore.dailyQuests.quests"
        />
      </Transition>

      <!-- Tabs -->
      <Transition name="tab-enter" mode="out-in">
        <LobbyViewTabs
          v-model="activeView"
          :key="`tabs-${activeView}`"
          @open-shop="goToShop"
        />
      </Transition>

      <!-- Games View -->
      <template v-if="activeView === 'games'">
        <Transition
          name="search-enter"
          enter-active-class="search-enter-active"
          leave-active-class="search-leave-active"
          enter-from-class="search-enter-from"
          leave-to-class="search-leave-to"
        >
          <LobbySearchBar
            v-model="searchQuery"
            :key="`search-${searchQuery.length}`"
          />
        </Transition>
        <Transition
          name="cat-enter"
          enter-active-class="cat-enter-active"
          leave-active-class="cat-leave-active"
          enter-from-class="cat-enter-from"
          leave-to-class="cat-leave-to"
        >
          <LobbyCategoryBar
            :categories="categories"
            v-model:active-category="activeCategory"
            :key="`cat-${activeCategory}`"
          />
        </Transition>
        <Transition
          name="grid-enter"
          enter-active-class="grid-enter-active"
          leave-active-class="grid-leave-active"
          enter-from-class="grid-enter-from"
          leave-to-class="grid-leave-to"
          mode="out-in"
        >
          <LobbyGameGrid
            :games="filteredGames"
            :high-scores="highScores"
            :search-query="searchQuery"
            @play-game="goToGame"
            :key="`grid-${activeCategory}-${filteredGames.length}`"
          />
        </Transition>
      </template>

      <!-- Quests View -->
      <template v-if="activeView === 'quests'">
        <Transition name="content-fade" mode="out-in">
          <div class="content-section" :key="`quests-${dailyQuests.length}`">
            <DailyQuestsSection @claimed="checkAndUnlock" />
          </div>
        </Transition>
      </template>

      <!-- Achievements View -->
      <template v-if="activeView === 'achievements'">
        <Transition name="content-fade" mode="out-in">
          <div class="content-section" :key="`achievements`">
            <AchievementList filter="all" />
          </div>
        </Transition>
      </template>

      <!-- Audio View -->
      <template v-if="activeView === 'audio'">
        <Transition name="content-fade" mode="out-in">
          <div class="content-section audio-section" :key="`audio`">
            <AudioMixerPanel />
          </div>
        </Transition>
      </template>

      <!-- Footer -->
      <footer class="lobby-footer">
        <div class="footer-decor">
          <KawaiiIcon name="star" size="xs" />
          <KawaiiIcon name="sparkle" size="xs" />
          <KawaiiIcon name="heart" size="xs" />
        </div>
        <p>共 {{ gameRegistry.length }} 款遊戲可遊玩</p>
        <p class="footer-hint">選擇你喜歡的遊戲，開始挑戰吧！</p>
      </footer>
    </main>
    <AchievementToast
      v-if="achievementQueue.length > 0"
      :achievement="achievementQueue[0]!"
      @close="achievementQueue.shift()"
    />
  </div>
</template>

<style scoped>
.lobby {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(38, 27, 34, 0.035) 1px, transparent 1px),
    linear-gradient(rgba(38, 27, 34, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, #fff6e8 0%, #fbe8ef 58%, #fffaf2 100%);
  background-size: 20px 20px, 20px 20px, auto;
}

.lobby-content {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: var(--space-8) var(--space-8) 0;
  max-width: 90rem;
  margin-inline: auto;
  width: 100%;
}

/* ==================== Transitions ==================== */

/* Hero staggered entrance */
.hero-enter-enter-active { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
.hero-enter-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.hero-enter-enter-from { opacity: 0; transform: translateY(30px) scale(0.97); }
.hero-enter-leave-to { opacity: 0; transform: translateY(-15px) scale(0.98); }

/* Tabs staggered entrance */
.tab-enter-enter-active { transition: all 0.4s ease; }
.tab-enter-leave-active { transition: all 0.2s ease; }
.tab-enter-enter-from { opacity: 0; transform: translateY(8px); }
.tab-enter-leave-to { opacity: 0; transform: translateY(-5px); }

/* Search/Content staggered entrance */
.search-enter-active { transition: all 0.4s ease; }
.search-leave-active { transition: all 0.2s ease; }
.search-enter-from { opacity: 0; transform: translateY(10px); }
.search-leave-to { opacity: 0; transform: translateY(-5px); }

/* Category bar transitions */
.cat-enter-enter-active { transition: all 0.35s ease; }
.cat-leave-active { transition: all 0.2s ease; }
.cat-enter-from { opacity: 0; transform: translateX(-15px); }
.cat-leave-to { opacity: 0; transform: translateX(15px); }

/* Grid transitions */
.grid-enter-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.grid-leave-active { transition: all 0.2s ease; }
.grid-enter-from { opacity: 0; transform: translateY(20px) scale(0.98); }
.grid-leave-to { opacity: 0; transform: translateY(-10px) scale(0.99); }

/* Content fade (for non-game views) */
.content-fade-enter-active, .content-fade-leave-active { transition: all 0.3s ease; }
.content-fade-enter-from { opacity: 0; transform: translateY(12px); }
.content-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* Quest panel */
.quest-panel-enter-active, .quest-panel-leave-active { transition: all var(--duration-normal) var(--ease-out); }
.quest-panel-enter-from { opacity: 0; transform: translateY(-20px); }
.quest-panel-leave-to { opacity: 0; transform: translateY(-10px); }

/* Content sections */
.content-section {
  padding: var(--space-8);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-card);
  margin-bottom: var(--space-8);
  animation: fadeInUp var(--duration-slow) ease backwards;
}

.audio-section {
  max-width: 760px;
  margin-inline: auto;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(var(--space-5)); }
  to { opacity: 1; transform: translateY(0); }
}

/* ==================== Footer ==================== */
.lobby-footer {
  text-align: center;
  padding: var(--space-10) 0 var(--space-8);
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--space-4);
}

.footer-decor {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  opacity: 0.4;
}

.footer-decor .kawaii-icon {
  animation: footer-decor-float 3s ease-in-out infinite;
}

.footer-decor .kawaii-icon:nth-child(2) { animation-delay: -1s; }
.footer-decor .kawaii-icon:nth-child(3) { animation-delay: -2s; }

@keyframes footer-decor-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.lobby-footer p { margin: var(--space-2) 0; font-size: var(--font-size-sm); }
.footer-hint { color: var(--color-text-muted); font-size: var(--font-size-sm) !important; }

/* ==================== Responsive ==================== */
@media (max-width: 768px) {
  .lobby-content { padding: var(--space-4) var(--space-4) 0; }
  .content-section { padding: var(--space-4); }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .lobby-content { padding: var(--space-6) var(--space-6) 0; }
}
</style>
