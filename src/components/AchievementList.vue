<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useMetaProgression } from '@/composables/useMetaProgression'
import { achievementDefs } from '@/data/achievements'
import ProgressBar from '@/components/ProgressBar.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForAchievement } from '@/data/iconManifest'

const playerStore = usePlayerStore()
const metaProgression = useMetaProgression()

const props = withDefaults(defineProps<{
  filter?: 'all' | 'unlocked' | 'locked'
  compact?: boolean
  search?: string
}>(), {
  filter: 'all',
  compact: false,
  search: '',
})

const localSearch = ref(props.search)
watch(() => props.search, (val) => { localSearch.value = val })

const achievements = computed(() => {
  return achievementDefs
    .filter(def => {
      if (!def.hidden) return true
      const playerAchievement = playerStore.achievements.find(a => a.achievementId === def.id)
      return !!playerAchievement?.unlockedAt
    })
    .map(def => {
      const playerAchievement = playerStore.achievements.find(a => a.achievementId === def.id)
      return {
        def,
        unlocked: !!playerAchievement?.unlockedAt,
        progress: playerAchievement?.progress ?? 0,
        unlockedAt: playerAchievement?.unlockedAt,
      }
    })
})

const filteredAchievements = computed(() => {
  const base = props.filter === 'unlocked'
    ? achievements.value.filter(a => a.unlocked)
    : props.filter === 'locked'
      ? achievements.value.filter(a => !a.unlocked)
      : achievements.value

  if (!localSearch.value) return base
  const q = localSearch.value.toLowerCase()
  return base.filter(a =>
    a.def.name.toLowerCase().includes(q) ||
    a.def.description.toLowerCase().includes(q)
  )
})

const stats = computed(() => metaProgression.getAchievementStats())

const rarityOrder: Record<string, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }

const sortedAchievements = computed(() => {
  return [...filteredAchievements.value].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    return (rarityOrder[b.def.rarity] ?? 0) - (rarityOrder[a.def.rarity] ?? 0)
  })
})

function formatProgress(progress: number): number {
  return Math.min(100, Math.round(progress * 100))
}

// Rarity glow mapping
const rarityGlow: Record<string, string> = {
  common: 'rgba(148, 163, 184, 0.25)',
  uncommon: 'rgba(34, 197, 94, 0.25)',
  rare: 'rgba(59, 130, 246, 0.3)',
  epic: 'rgba(139, 92, 246, 0.35)',
  legendary: 'rgba(245, 158, 11, 0.4)',
}

const rarityBorder: Record<string, string> = {
  common: '#94a3b8',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
}

const rarityBg: Record<string, string> = {
  common: 'rgba(148, 163, 184, 0.08)',
  uncommon: 'rgba(34, 197, 94, 0.08)',
  rare: 'rgba(59, 130, 246, 0.08)',
  epic: 'rgba(139, 92, 246, 0.1)',
  legendary: 'rgba(245, 158, 11, 0.12)',
}

const rarityBadgeBg: Record<string, string> = {
  common: 'rgba(148, 163, 184, 0.15)',
  uncommon: 'rgba(34, 197, 94, 0.15)',
  rare: 'rgba(59, 130, 246, 0.15)',
  epic: 'rgba(139, 92, 246, 0.15)',
  legendary: 'rgba(245, 158, 11, 0.15)',
}

const rarityBadgeColor: Record<string, string> = {
  common: '#64748b',
  uncommon: '#16a34a',
  rare: '#2563eb',
  epic: '#7c3aed',
  legendary: '#b45309',
}

const rarityCardBorder: Record<string, string> = {
  common: '#cbd5e1',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
}
</script>

<template>
  <div class="achievement-list">
    <div class="achievement-header">
      <h3 class="section-title">
        <KawaiiIcon name="trophy" size="sm" />
        成就系統
      </h3>
      <div class="achievement-stats">
        <span class="stat-item">{{ stats.unlocked }} / {{ stats.total }}</span>
        <ProgressBar :value="stats.progress" :max="100" :show-label="false" />
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="achievement-controls">
      <div class="search-box">
        <KawaiiIcon name="search" size="sm" class="search-icon" />
        <input
          v-model="localSearch"
          type="text"
          placeholder="搜尋成就..."
          class="search-input"
        />
        <button v-if="localSearch" class="search-clear" @click="localSearch = ''">
          <KawaiiIcon name="search" size="xs" />
        </button>
      </div>
      <div class="filter-tabs">
        <button
          v-for="tab in ['all', 'unlocked', 'locked'] as const"
          :key="tab"
          :class="['filter-tab', { active: props.filter === tab }]"
          @click="$emit('update:filter', tab)"
        >
          {{ tab === 'all' ? '全部' : tab === 'unlocked' ? '已解鎖' : '未解鎖' }}
        </button>
      </div>
    </div>

    <div :class="['achievement-grid', { compact }]">
      <div
        v-for="achievement in sortedAchievements"
        :key="achievement.def.id"
        :class="[
          'achievement-card',
          `rarity-${achievement.def.rarity}`,
          { unlocked: achievement.unlocked, locked: !achievement.unlocked },
          { 'flip-hover': !achievement.unlocked }
        ]"
        :style="achievement.unlocked ? { '--rarity-glow': rarityGlow[achievement.def.rarity] } : {}"
      >
        <!-- Rarity sparkle for legendary/epic -->
        <div v-if="achievement.unlocked && (achievement.def.rarity === 'legendary' || achievement.def.rarity === 'epic')" class="sparkle-layer">
          <span v-for="s in 6" :key="s" class="sparkle" :style="{ '--delay': `${s * 0.4}s`, '--size': `${4 + Math.random() * 6}px` }" />
        </div>

        <div class="achievement-icon-wrap">
          <KawaiiIcon :name="iconForAchievement(achievement.def.id)" size="lg" class="achievement-icon" />
          <div v-if="achievement.unlocked" class="unlocked-shimmer" />
        </div>

        <div class="achievement-content">
          <div class="achievement-name">{{ achievement.def.name }}</div>
          <div class="achievement-desc">{{ achievement.def.description }}</div>

          <div v-if="!achievement.unlocked && achievement.progress > 0" class="achievement-progress">
            <ProgressBar
              :value="formatProgress(achievement.progress)"
              :max="100"
              :show-label="true"
              :label="`${formatProgress(achievement.progress)}%`"
            />
          </div>

          <div class="achievement-reward">
            <span class="reward-coins">
              <KawaiiIcon name="coin" size="xs" />
              {{ achievement.def.reward.coins }}
            </span>

            <span
              v-if="achievement.unlocked"
              class="unlocked-badge"
              :style="{ backgroundColor: rarityBadgeBg[achievement.def.rarity], color: rarityBadgeColor[achievement.def.rarity] }"
            >
              <KawaiiIcon name="check" size="xs" />
              已解鎖
            </span>
            <span v-else class="locked-badge">
              <KawaiiIcon name="lock" size="xs" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="sortedAchievements.length === 0" class="empty-state">
      <KawaiiIcon name="search" size="xl" class="empty-icon" />
      <p v-if="localSearch">沒有符合「{{ localSearch }}」的成就</p>
      <p v-else>沒有找到成就</p>
    </div>
  </div>
</template>

<style scoped>
.achievement-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.achievement-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.achievement-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.stat-item {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  min-width: 60px;
}

/* ===== Controls ===== */
.achievement-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-dim);
  font-size: 0.85rem;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 36px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: 600;
  outline: none;
  transition: border-color var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.search-input::placeholder {
  color: var(--color-text-dim);
}

.search-clear {
  position: absolute;
  right: 10px;
  background: transparent;
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: color var(--duration-fast) ease;
}

.search-clear:hover {
  color: var(--color-danger);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  flex: 1;
  padding: 8px 16px;
  border: 2px solid rgba(38, 27, 34, 0.15);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text-secondary);
  font-weight: 700;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition:
    transform var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    background var(--duration-fast) ease,
    color var(--duration-fast) ease;
}

.filter-tab:hover {
  border-color: var(--color-primary-light);
  color: var(--color-text);
}

.filter-tab.active {
  border-color: var(--color-primary);
  background: var(--color-primary-alpha);
  color: var(--color-primary-dark);
}

/* ===== Achievement Grid ===== */
.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.achievement-grid.compact {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

/* ===== Achievement Card (3D Flip) ===== */
.achievement-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  position: relative;
  overflow: hidden;
  transition:
    transform var(--duration-slow) cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow var(--duration-slow) ease;
  cursor: pointer;
}

/* Rarity background tint */
.rarity-common { background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--rarity-bg, rgba(148, 163, 184, 0.04)) 100%); }
.rarity-uncommon { background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--rarity-bg, rgba(34, 197, 94, 0.04)) 100%); }
.rarity-rare { background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--rarity-bg, rgba(59, 130, 246, 0.05)) 100%); }
.rarity-epic { background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--rarity-bg, rgba(139, 92, 246, 0.06)) 100%); }
.rarity-legendary { background: linear-gradient(135deg, var(--color-bg-card) 0%, var(--rarity-bg, rgba(245, 158, 11, 0.08)) 100%); }

/* Locked state */
.achievement-card.locked {
  opacity: 0.55;
  filter: saturate(0.6);
}

.achievement-card.locked.locked:hover {
  opacity: 0.7;
  filter: saturate(0.8);
}

/* Unlocked hover */
.achievement-card.unlocked:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* Rarity glow on hover */
.achievement-card.unlocked:hover {
  box-shadow:
    4px 4px 0 rgba(38, 27, 34, 0.14),
    0 0 20px var(--rarity-glow, rgba(255, 255, 255, 0.1));
}

/* Rarity left border */
.achievement-card.unlocked {
  border-left: 4px solid var(--rarity-border, #94a3b8);
}

/* Flip hover for locked cards */
.achievement-card.flip-hover {
  perspective: 800px;
}

.achievement-card.flip-hover:hover {
  animation: card-flip 0.6s ease-in-out;
}

@keyframes card-flip {
  0% { transform: perspective(800px) rotateY(0deg); }
  50% { transform: perspective(800px) rotateY(12deg) translateY(-4px); }
  100% { transform: perspective(800px) rotateY(0deg); }
}

/* ===== Icon Area ===== */
.achievement-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.achievement-icon {
  font-size: 2.5rem;
}

.unlocked-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 45%,
    transparent 55%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2.5s ease-in-out infinite;
  border-radius: var(--radius-md);
  pointer-events: none;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ===== Sparkles ===== */
.sparkle-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.sparkle {
  position: absolute;
  width: var(--size, 6px);
  height: var(--size, 6px);
  background: var(--color-accent-light);
  border-radius: 50%;
  opacity: 0;
  animation: sparkle-glow 2s ease-in-out infinite;
  animation-delay: var(--delay, 0s);
}

@keyframes sparkle-glow {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  30% { opacity: 0.8; transform: scale(1) rotate(90deg); }
  70% { opacity: 0.3; transform: scale(0.5) rotate(180deg); }
}

/* ===== Content ===== */
.achievement-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.achievement-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.achievement-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.achievement-progress {
  margin-top: 0.25rem;
}

.achievement-reward {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
}

.reward-coins {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent);
}

.unlocked-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.locked-badge {
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

/* ===== Empty State ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .achievement-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .achievement-stats {
    width: 100%;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }
}
</style>
