<script setup lang="ts">
import type { KawaiiIconId } from '@/data/iconManifest'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { ref, watch, computed } from 'vue'

interface ShelfItem { key: 'upgrades'|'collection'; label: string; icon: KawaiiIconId }
interface CatItem { key: string; label: string; icon: KawaiiIconId }

const p = defineProps<{ balance: number; shelves: ShelfItem[]; categories: CatItem[]; activeShelf: string; activeCategory: string }>()
const emit = defineEmits<{ back: []; 'update:activeShelf': [string]; 'update:activeCategory': [string] }>()

const displayBalance = ref(0)
const targetBalance = ref(0)
let animFrame: number | null = null

function animateBalance(target: number) {
  targetBalance.value = target
  if (animFrame) cancelAnimationFrame(animFrame)

  function step() {
    const diff = targetBalance.value - displayBalance.value
    if (Math.abs(diff) < 1) {
      displayBalance.value = targetBalance.value
      animFrame = null
      return
    }
    displayBalance.value += Math.ceil(diff * 0.25)
    animFrame = requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(() => p.balance, (newVal) => {
  animateBalance(newVal)
}, { immediate: true })

// Category tab sliding indicator
const activeTab = ref(0)
function updateActiveTab(key: string) {
  const idx = p.categories.findIndex(c => c.key === key)
  if (idx >= 0) activeTab.value = idx
}

// Balance pulse on change
const balancePulse = ref(false)
let lastBalance = -1
watch(() => p.balance, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal > oldVal) {
    balancePulse.value = true
    setTimeout(() => { balancePulse.value = false }, 500)
  }
})
</script>

<template>
  <header class="svh">
    <div class="svh-top">
      <button class="svh-back" @click="emit('back')">
        <KawaiiIcon name="back" size="sm" />
        返回
      </button>
      <div class="svh-balance" :class="{ pulse: balancePulse }">
        <KawaiiIcon name="coin" size="sm" class="coin-icon" />
        <span class="balance-amount">{{ displayBalance.toLocaleString('zh-TW') }}</span>
      </div>
    </div>

    <!-- Shelf tabs -->
    <nav class="svh-tabs svh-tabs-shelf" aria-label="分類">
      <div class="tab-slider" :style="{ left: `${(activeShelf === 'upgrades' ? 0 : 100)}%` }" />
      <button
        v-for="s in p.shelves"
        :key="s.key"
        :class="['svh-btn', { active: p.activeShelf === s.key }]"
        @click="emit('update:activeShelf', s.key)"
      >
        <KawaiiIcon :name="s.icon" size="sm" />
        {{ s.label }}
      </button>
    </nav>

    <!-- Category tabs with sliding indicator -->
    <nav class="svh-tabs" aria-label="篩選">
      <div class="tab-indicator" :style="{ left: `${(activeTab / (p.categories.length - 1 || 1)) * 100}%`, width: `${100 / (p.categories.length || 1)}%` }" />
      <button
        v-for="c in p.categories"
        :key="c.key"
        :class="['svh-btn', { active: p.activeCategory === c.key }]"
        @click="updateActiveTab(c.key); emit('update:activeCategory', c.key)"
      >
        <KawaiiIcon :name="c.icon" size="sm" />
        {{ c.label }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.svh {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
}

.svh-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.svh-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 14px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-card);
  color: var(--color-text);
  font-weight: 800;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition:
    transform var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    background var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease;
  box-shadow: var(--shadow-card);
}

.svh-back:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-md);
}

.svh-back:active {
  transform: translateY(0);
}

.svh-balance {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 16px;
  border: 2px solid rgba(191, 134, 31, 0.25);
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #fff7d8 0%, #ffe9a7 100%);
  color: #74440b;
  box-shadow: 0 10px 22px rgba(181, 118, 21, 0.14);
  transition:
    transform var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease;
}

.svh-balance.pulse {
  animation: balance-pulse 0.5s ease-out;
}

@keyframes balance-pulse {
  0% { transform: scale(1); }
  30% { transform: scale(1.06); box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
  100% { transform: scale(1); box-shadow: 0 10px 22px rgba(181, 118, 21, 0.14); }
}

.coin-icon {
  transition: transform var(--duration-fast) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.svh-balance:hover .coin-icon {
  transform: rotate(-15deg) scale(1.15);
}

.balance-amount {
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

/* Tabs */
.svh-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  position: relative;
}

.svh-tabs::-webkit-scrollbar {
  height: 4px;
}

.svh-tabs::-webkit-scrollbar-track {
  background: transparent;
}

.svh-tabs::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

/* Sliding indicator */
.tab-indicator {
  position: absolute;
  bottom: -2px;
  height: 3px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: left var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1),
              width var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;
}

.svh-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 16px;
  border: 2px solid rgba(68, 52, 61, 0.2);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.86);
  color: #3f3138;
  font-weight: 800;
  font-size: var(--font-size-sm);
  box-shadow: 0 8px 20px rgba(52, 39, 47, 0.08);
  cursor: pointer;
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    background 120ms ease,
    box-shadow 120ms ease;
  white-space: nowrap;
  position: relative;
}

.svh-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(58, 130, 110, 0.4);
}

.svh-btn.active {
  border-color: rgba(58, 130, 110, 0.55);
  background: linear-gradient(180deg, #eaf9f2 0%, #d7f1e7 100%);
  color: #22463c;
}
</style>
