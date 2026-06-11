<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ShopCollectionItem } from '@/types'
import BaseButton from './BaseButton.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForItem, type KawaiiIconId } from '@/data/iconManifest'

const props = defineProps<{
  item: ShopCollectionItem
  owned: boolean
  equipped: boolean
  canAfford: boolean
}>()

const emit = defineEmits<{
  purchase: []
  equip: []
}>()

const isHovered = ref(false)
const isPurchasing = ref(false)

const iconName = computed<KawaiiIconId>(() => iconForItem(props.item.icon))

const rarityGlow = computed(() => {
  const map: Record<string, string> = {
    common: 'rgba(148, 163, 184, 0.2)',
    rare: 'rgba(96, 165, 250, 0.3)',
    epic: 'rgba(167, 139, 250, 0.35)',
    legendary: 'rgba(251, 191, 36, 0.4)',
  }
  return map[props.item.rarity] ?? 'rgba(148, 163, 184, 0.2)'
})

const rarityColor = computed(() => {
  const map: Record<string, string> = {
    common: '#94a3b8',
    rare: '#60a5fa',
    epic: '#a78bfa',
    legendary: '#fbbf24',
  }
  return map[props.item.rarity] ?? '#94a3b8'
})

const rarityGlowColor = computed(() => {
  const map: Record<string, string> = {
    common: 'rgba(148, 163, 184, 0.28)',
    rare: 'rgba(96, 165, 250, 0.35)',
    epic: 'rgba(167, 139, 250, 0.4)',
    legendary: 'rgba(251, 191, 36, 0.45)',
  }
  return map[props.item.rarity] ?? 'rgba(148, 163, 184, 0.28)'
})

function handlePurchase() {
  isPurchasing.value = true
  emit('purchase')
  setTimeout(() => { isPurchasing.value = false }, 800)
}
</script>

<template>
  <div
    :class="['collectible-card', `rarity-${item.rarity}`, { owned, equipped, hovered: isHovered, purchasing: isPurchasing }]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Hover glow -->
    <div class="card-glow" :style="{ background: `radial-gradient(circle at 50% 30%, ${rarityGlow}, transparent 65%)` }" />

    <div class="collectible-preview" :style="{ '--frame-color': item.color ?? '#8fb8ff', '--frame-glow': item.glowColor ?? 'rgba(143, 184, 255, 0.28)' }">
      <div class="preview-ring" :style="{ '--ring-glow': rarityGlowColor }">
        <KawaiiIcon :name="iconName" size="lg" class="preview-icon" />
      </div>
    </div>

    <div class="collectible-copy">
      <div class="collectible-name">{{ item.name }}</div>
      <div class="collectible-desc">{{ item.description }}</div>
    </div>

    <div class="collectible-footer">
      <span v-if="!owned" class="cost">
        <KawaiiIcon name="coin" size="xs" />
        {{ item.cost }}
      </span>
      <span v-else-if="equipped" class="owned-label equipped">
        <KawaiiIcon name="check" size="xs" />
        裝備中
      </span>
      <span v-else class="owned-label">已擁有</span>

      <BaseButton
        v-if="!owned"
        size="sm"
        variant="primary"
        :disabled="!canAfford"
        :class="{ purchasing: isPurchasing }"
        @click="handlePurchase"
      >
        <span class="btn-text">購買</span>
      </BaseButton>
      <BaseButton
        v-else
        size="sm"
        variant="secondary"
        :disabled="equipped"
        @click="emit('equip')"
      >
        <span class="btn-text">裝備</span>
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.collectible-card {
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 12px;
  min-height: 210px;
  padding: 16px;
  border: 2px solid rgba(68, 52, 61, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 26px rgba(52, 39, 47, 0.1);
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

.collectible-card:hover .card-glow {
  opacity: 1;
}

.collectible-card:hover {
  transform: translateY(-5px) scale(1.015);
  box-shadow:
    0 16px 36px rgba(52, 39, 47, 0.15),
    0 0 24px var(--rarity-glow, rgba(255, 255, 255, 0.15));
}

.collect-card:active {
  transform: scale(0.97);
}

.collectible-card.equipped {
  border-color: rgba(75, 151, 119, 0.55);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(235, 249, 242, 0.94));
}

.collectible-card.purchasing {
  animation: purchase-pop 0.6s ease-out;
}

@keyframes purchase-pop {
  0% { transform: scale(1); }
  30% { transform: scale(1.06); box-shadow: 0 0 30px rgba(75, 151, 119, 0.4); }
  100% { transform: scale(1); box-shadow: 0 10px 26px rgba(52, 39, 47, 0.1); }
}

/* Rarity borders */
.rarity-rare {
  border-top: 3px solid #6ea8d6;
}

.rarity-epic {
  border-top: 3px solid #a288d9;
}

.rarity-legendary {
  border-top: 3px solid #d79e4b;
}

/* Preview */
.collectible-preview {
  display: grid;
  place-items: center;
  min-height: 76px;
  position: relative;
  z-index: 1;
}

.preview-ring {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border: 3px solid var(--frame-color);
  border-radius: 50%;
  background: #fffaf2;
  box-shadow:
    0 0 0 8px var(--frame-glow),
    0 0 0 16px var(--ring-glow, rgba(143, 184, 255, 0.1)),
    0 10px 18px rgba(52, 39, 47, 0.12);
  transition:
    transform var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow var(--duration-normal) ease;
}

.collectible-card:hover .preview-ring {
  transform: scale(1.06);
}

.preview-icon {
  transition: transform var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.collectible-card:hover .preview-icon {
  transform: scale(1.1);
}

/* Content */
.collectible-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.collectible-name {
  color: #35272f;
  font-size: 0.98rem;
  font-weight: 900;
}

.collectible-desc {
  color: #705d66;
  font-size: 0.82rem;
  line-height: 1.45;
}

/* Footer */
.collectible-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.cost,
.owned-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #8c5a13;
  font-size: 0.86rem;
  font-weight: 800;
}

.owned-label.equipped {
  color: #336b55;
}
</style>
