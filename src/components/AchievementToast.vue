<script setup lang="ts">
import type { AchievementDef } from '@/types'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForAchievement } from '@/data/iconManifest'
import { ref, onMounted } from 'vue'

const props = defineProps<{
  achievement: AchievementDef
}>()

const emit = defineEmits<{ close: [] }>()

const isVisible = ref(false)
const isClosing = ref(false)

onMounted(() => {
  requestAnimationFrame(() => { isVisible.value = true })
})

function handleClose() {
  isClosing.value = true
  setTimeout(() => emit('close'), 300)
}

setTimeout(() => {
  if (!isClosing.value) handleClose()
}, 4000)

// Rarity glow color
const rarityGlow: Record<string, string> = {
  common: 'rgba(148, 163, 184, 0.3)',
  uncommon: 'rgba(34, 197, 94, 0.3)',
  rare: 'rgba(59, 130, 246, 0.4)',
  epic: 'rgba(139, 92, 246, 0.5)',
  legendary: 'rgba(245, 158, 11, 0.6)',
}

const rarityGlowStrong: Record<string, string> = {
  common: 'rgba(148, 163, 184, 0.15)',
  uncommon: 'rgba(34, 197, 94, 0.15)',
  rare: 'rgba(59, 130, 246, 0.2)',
  epic: 'rgba(139, 92, 246, 0.25)',
  legendary: 'rgba(245, 158, 11, 0.3)',
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

const rarityLabel: Record<string, string> = {
  common: '普通',
  uncommon: '普通',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
}
</script>

<template>
  <Transition
    name="toast"
    @before-leave="isClosing = true"
  >
    <div
      v-if="isVisible && !isClosing"
      class="achievement-toast"
      :class="`rarity-${achievement.rarity}`"
      :style="{
        '--rarity-glow': rarityGlow[achievement.rarity],
        '--rarity-glow-strong': rarityGlowStrong[achievement.rarity],
      }"
    >
      <div class="toast-glow" />

      <div class="toast-icon-wrap">
        <KawaiiIcon :name="iconForAchievement(achievement.id)" size="lg" class="toast-icon" />
        <div class="icon-pulse" />
      </div>

      <div class="toast-content">
        <div class="toast-header">
          <span class="toast-title">
            <KawaiiIcon name="trophy" size="xs" />
            成就解鎖！
          </span>
          <span
            class="rarity-label"
            :style="{ backgroundColor: rarityBadgeBg[achievement.rarity], color: rarityBadgeColor[achievement.rarity] }"
          >
            {{ rarityLabel[achievement.rarity] }}
          </span>
        </div>
        <div class="toast-name">{{ achievement.name }}</div>
        <div class="toast-desc">{{ achievement.description }}</div>
        <div class="toast-reward">
          <KawaiiIcon name="coin" size="xs" />
          +{{ achievement.reward.coins }} 金幣
        </div>
      </div>

      <button class="toast-close" aria-label="關閉成就通知" @click="handleClose">
        <KawaiiIcon name="search" size="xs" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.achievement-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-notification);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    0 0 20px var(--rarity-glow, rgba(255, 255, 255, 0.1));
  max-width: 340px;
  backdrop-filter: blur(16px);
  overflow: hidden;
  animation: toast-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.toast-glow {
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-lg);
  background: radial-gradient(
    circle at 30% 30%,
    var(--rarity-glow-strong, rgba(245, 158, 11, 0.15)),
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
}

.toast-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.toast-icon {
  font-size: 2rem;
  position: relative;
  z-index: 1;
}

.icon-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid var(--rarity-glow-strong, rgba(245, 158, 11, 0.2));
  animation: icon-ring 1.5s ease-out infinite;
  z-index: 0;
}

@keyframes toast-bounce {
  0% {
    transform: translateX(120%) scale(0.3);
    opacity: 0;
  }
  60% {
    transform: translateX(-4%) scale(1.03);
    opacity: 1;
  }
  80% {
    transform: translateX(2%) scale(0.98);
  }
  100% {
    transform: translateX(0) scale(1);
  }
}

@keyframes icon-ring {
  0% { transform: scale(0.8); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 0; }
  100% { transform: scale(0.8); opacity: 0; }
}

.toast-content {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.toast-header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.toast-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rarity-label {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

.toast-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-text);
  margin-top: 2px;
}

.toast-desc {
  font-size: 0.75rem;
  color: var(--color-text-dim);
  margin-top: 2px;
  line-height: 1.3;
}

.toast-reward {
  font-size: 0.8rem;
  color: var(--color-accent);
  font-weight: 700;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(38, 27, 34, 0.06);
  color: var(--color-text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--duration-fast) ease;
  z-index: 2;
}

.toast-close:hover {
  background: rgba(255, 68, 68, 0.1);
  color: var(--color-danger);
}

/* Toast slide transitions */
.toast-enter-active {
  animation: toast-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.toast-leave-active {
  animation: toast-slide-out 0.25s ease-in both;
}

@keyframes toast-slide-in {
  0% {
    transform: translateX(120%) scale(0.5);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateX(120%) scale(0.7);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .achievement-toast {
    left: 10px;
    right: 10px;
    max-width: calc(100% - 20px);
  }
}
</style>
