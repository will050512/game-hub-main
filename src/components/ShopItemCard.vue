<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PermanentUpgrade } from '@/types'
import BaseButton from './BaseButton.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForUpgrade } from '@/data/iconManifest'

const props = withDefaults(defineProps<{
  upgrade: PermanentUpgrade
  currentLevel?: number
  canAfford?: boolean
}>(), {
  currentLevel: 0,
  canAfford: false,
})

const emit = defineEmits<{
  purchase: []
}>()

const isHovered = ref(false)
const isPurchased = ref(false)

const isMaxed = computed(() => props.currentLevel >= props.upgrade.maxLevel)

const nextLevelCost = computed(() => {
  if (isMaxed.value) return null
  return props.upgrade.costs[props.currentLevel] ?? null
})

const rarityColor = computed(() => {
  const map: Record<string, string> = {
    common: 'transparent',
    rare: 'var(--color-secondary)',
    epic: 'var(--color-primary)',
    legendary: 'var(--color-accent)',
  }
  return map[props.upgrade.rarity] ?? 'transparent'
})

const rarityGlow = computed(() => {
  const map: Record<string, string> = {
    common: 'transparent',
    rare: 'var(--color-secondary-alpha)',
    epic: 'var(--color-primary-alpha)',
    legendary: 'rgba(245, 158, 11, 0.2)',
  }
  return map[props.upgrade.rarity] ?? 'transparent'
})

const rarityBorder = computed(() => {
  const map: Record<string, string> = {
    common: 'var(--color-text-dim)',
    rare: 'var(--color-secondary)',
    epic: 'var(--color-primary)',
    legendary: 'var(--color-accent)',
  }
  return map[props.upgrade.rarity] ?? 'var(--color-text-dim)'
})

const rarityBg = computed(() => {
  const map: Record<string, string> = {
    common: 'transparent',
    rare: 'rgba(245, 168, 194, 0.08)',
    epic: 'rgba(142, 207, 173, 0.08)',
    legendary: 'rgba(240, 180, 75, 0.08)',
  }
  return map[props.upgrade.rarity] ?? 'transparent'
})

function handlePurchase() {
  emit('purchase')
  isPurchased.value = true
  setTimeout(() => { isPurchased.value = false }, 600)
}
</script>

<template>
  <div
    :class="['shop-item-card', `rarity-${upgrade.rarity}`, { hovered: isHovered, maxed: isMaxed, purchased: isPurchased }]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Hover glow -->
    <div class="card-glow" :style="{ background: `radial-gradient(circle at 50% 50%, ${rarityGlow}, transparent 70%)` }" />

    <div class="item-header">
      <div class="item-icon-wrap">
        <KawaiiIcon :name="iconForUpgrade(upgrade.id)" size="lg" class="item-icon" />
      </div>
      <div class="item-info">
        <div class="item-name">{{ upgrade.name }}</div>
        <div class="item-desc">{{ upgrade.description }}</div>
      </div>
    </div>

    <div class="item-level">
      <span class="level-text">Lv.{{ currentLevel }}/{{ upgrade.maxLevel }}</span>
      <div class="level-dots">
        <span
          v-for="i in upgrade.maxLevel"
          :key="i"
          :class="['dot', { filled: i <= currentLevel }]"
          :style="{ '--dot-color': rarityColor }"
        />
      </div>
    </div>

    <div class="item-footer">
      <div v-if="isMaxed" class="maxed-badge">
        <KawaiiIcon name="check" size="xs" />
        已滿級
      </div>
      <template v-else>
        <span class="cost">
          <KawaiiIcon name="coin" size="xs" />
          {{ nextLevelCost }}
        </span>
        <BaseButton
          size="sm"
          variant="primary"
          :disabled="!canAfford"
          :class="{ purchased: isPurchased }"
          @click="handlePurchase"
        >
          <span class="btn-text">升級</span>
        </BaseButton>
      </template>
    </div>
  </div>
</template>

<style scoped>
.shop-item-card {
  position: relative;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
   padding: 16px;
   display: flex;
   flex-direction: column;
   gap: 12px;
   border: 2px solid var(--color-border);
   border-left: 3px solid var(--rarity-border, transparent);
   overflow: hidden;
   transition:
    transform var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow var(--duration-normal) ease,
    border-color var(--duration-normal) ease;
  cursor: pointer;
}

.card-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-normal) ease;
  z-index: 0;
}

.shop-item-card:hover .card-glow {
  opacity: 1;
}

.shop-item-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow:
    var(--shadow-lg),
    0 0 20px var(--rarity-glow, rgba(255, 255, 255, 0.1));
}

.shop-item-card:active {
  transform: scale(0.98) translateY(0);
}

.shop-item-card.maxed {
  opacity: 0.85;
  cursor: default;
}

.shop-item-card.purchased {
  animation: purchase-flash 0.6s ease-out;
}

@keyframes purchase-flash {
  0% { box-shadow: 0 0 0 0 var(--rarity-glow, rgba(245, 158, 11, 0.6)); }
  50% { box-shadow: 0 0 30px 8px var(--rarity-glow, rgba(245, 158, 11, 0.3)); transform: scale(1.02); }
  100% { box-shadow: 0 0 0 0 transparent; transform: scale(1); }
}

/* Rarity-specific styles */
.rarity-rare {
  --rarity-border: var(--color-secondary);
  --rarity-glow: var(--color-secondary-alpha);
}

.rarity-epic {
  --rarity-border: var(--color-primary);
  --rarity-glow: var(--color-primary-alpha);
}

.rarity-legendary {
  --rarity-border: var(--color-accent);
  --rarity-glow: rgba(245, 158, 11, 0.15);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.12);
}

.rarity-legendary:hover {
  box-shadow:
    0 0 24px rgba(245, 158, 11, 0.25),
    0 8px 24px rgba(245, 158, 11, 0.12);
}

/* Header */
.item-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.item-icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.item-icon {
  font-size: 32px;
  line-height: 1;
  transition: transform var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.shop-item-card:hover .item-icon {
  transform: scale(1.08);
}

.item-info {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.item-name {
  font-weight: 700;
  font-size: 15px;
  color: var(--color-text);
}

.item-desc {
  font-size: 13px;
  color: var(--color-text-dim);
  line-height: 1.4;
  margin-top: 2px;
}

/* Level */
.item-level {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.level-text {
  font-size: 12px;
  color: var(--color-text-dim);
  font-weight: 600;
  white-space: nowrap;
}

.level-dots {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  transition:
    background var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease,
    transform var(--duration-fast) ease;
}

.dot.filled {
  background: var(--dot-color, var(--color-accent));
  border-color: var(--dot-color, var(--color-accent));
  box-shadow: 0 0 4px var(--dot-color, rgba(240, 180, 75, 0.4));
}

/* Footer */
.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.cost {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
}

.maxed-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-success);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
