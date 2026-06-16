<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useMetaProgression } from '@/composables/useMetaProgression'
import KawaiiIcon from '@/components/KawaiiIcon.vue'

const playerStore = usePlayerStore()
const currencyStore = useCurrencyStore()
const metaProgression = useMetaProgression()

const stats = computed(() => metaProgression.getAchievementStats())
const equippedBadge = computed(() => playerStore.collection.equippedBadge)
const equippedFrame = computed(() => playerStore.collection.equippedAvatarFrame)

const coins = computed(() => currencyStore.balance)
const level = computed(() => playerStore.levelState.level)
const title = computed(() => playerStore.levelState.title)
const xpPercent = computed(() => {
  const { level: lv, xp } = playerStore.levelState
  const nextLevelXp = [100, 200, 350, 500, 750, 1000, 1500, 2000, 3000, 5000][lv - 1] ?? 5000
  return Math.min(100, (xp / nextLevelXp) * 100)
})
</script>

<template>
  <div class="profile-card">
    <!-- Header -->
    <div class="profile-header">
      <KawaiiIcon name="heart" size="lg" class="profile-avatar" />
      <div class="profile-info">
        <span class="profile-title">{{ title }}</span>
        <span class="profile-level">Lv.{{ level }}</span>
      </div>
    </div>

    <!-- XP Bar -->
    <div class="profile-xp">
      <div class="xp-bar-bg">
        <div class="xp-bar-fill" :style="{ width: xpPercent + '%' }" />
      </div>
      <span class="xp-text">{{ Math.round(xpPercent) }}% XP</span>
    </div>

    <!-- Stats Grid -->
    <div class="profile-stats">
      <div class="stat-item">
        <KawaiiIcon name="coin" size="sm" class="stat-icon" />
        <span class="stat-num">{{ coins.toLocaleString() }}</span>
        <span class="stat-label">金幣</span>
      </div>
      <div class="stat-item">
        <KawaiiIcon name="trophy" size="sm" class="stat-icon" />
        <span class="stat-num">{{ stats.unlocked }}<span class="stat-total">/{{ stats.total }}</span></span>
        <span class="stat-label">成就</span>
      </div>
    </div>

    <!-- Equipped Items -->
    <div class="profile-equipped">
      <span class="equipped-label">裝備</span>
      <div class="equipped-items">
        <div v-if="equippedBadge" class="equipped-item equipped-badge">
          <KawaiiIcon name="trophy" size="sm" />
          <span>{{ equippedBadge }}</span>
        </div>
        <div v-else class="equipped-item equipped-empty">
          <KawaiiIcon name="trophy" size="sm" />
          <span>未裝備徽章</span>
        </div>
        <div v-if="equippedFrame" class="equipped-item equipped-frame">
          <KawaiiIcon name="shield" size="sm" />
          <span>{{ equippedFrame }}</span>
        </div>
        <div v-else class="equipped-item equipped-empty">
          <KawaiiIcon name="shield" size="sm" />
          <span>未裝備頭像框</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 480px;
  margin: 0 auto var(--space-6);
  padding: var(--space-5) var(--space-5) var(--space-4);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.profile-avatar {
  width: 48px;
  height: 48px;
  padding: 6px;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  background: var(--color-kawaii-butter-main);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.profile-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.profile-level {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

/* XP Bar */
.profile-xp {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.xp-bar-bg {
  flex: 1;
  height: 8px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--color-border-subtle);
}

.xp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-secondary));
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px var(--color-primary-alpha);
}

.xp-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Stats Grid */
.profile-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-elevated);
  border: 1.5px solid var(--color-border-light);
  border-radius: var(--radius-md);
}

.stat-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 3px;
}

.stat-num {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.stat-total {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Equipped Items */
.profile-equipped {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.equipped-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.equipped-items {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.equipped-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-1) var(--space-2);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.equipped-badge,
.equipped-frame {
  border-color: var(--color-primary-light);
  background: var(--color-primary-alpha);
}

.equipped-empty {
  opacity: 0.5;
}
</style>
