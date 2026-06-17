<script setup lang="ts">
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import LobbyHeroSection from './LobbyHeroSection.vue'

defineProps<{
  gamesCount: number
  level: number
  levelTitle: string
  xpPercent: number
  gamesPlayed: number
  unlockedCount: number
  coins: number
}>()

defineEmits<{
  'show-quests': []
}>()
</script>

<template>
  <!-- Top Navigation Bar -->
  <nav class="top-nav" aria-label="導覽列">
    <div class="nav-left">
      <KawaiiIcon name="controller" size="md" class="nav-title-icon" />
      <span class="nav-title">Game Hub</span>
    </div>
    <div class="nav-right">
      <LobbyHeroSection
        :games-count="gamesCount"
        :level="level"
        :level-title="levelTitle"
        :xp-percent="xpPercent"
        :games-played="gamesPlayed"
        :unlocked-count="unlockedCount"
        :coins="coins"
      />
    </div>
  </nav>
</template>

<style scoped>
.top-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  background: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid var(--color-border-light);
  backdrop-filter: blur(var(--blur-lg));
  box-shadow: var(--shadow-sm);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.nav-title-icon {
  font-size: var(--font-size-xl);
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.nav-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .top-nav {
    padding: var(--space-3) var(--space-4);
  }
}
</style>
