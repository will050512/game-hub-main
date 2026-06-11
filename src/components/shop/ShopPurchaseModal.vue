<script setup lang="ts">
import type { PermanentUpgrade } from '@/types'
import { iconForUpgrade } from '@/data/iconManifest'
import BaseModal from '@/components/BaseModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { ref, computed } from 'vue'

interface Props {
  open: boolean
  upgrade: PermanentUpgrade | null
  currentLevel: number
  cost: number
  canAfford: boolean
  effectPreview: string
  isPurchasing: boolean
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  upgrade: null,
  currentLevel: 0,
  cost: 0,
  canAfford: false,
  effectPreview: '',
  isPurchasing: false,
  closable: true,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleClose() {
  if (props.closable && !props.isPurchasing) {
    emit('cancel')
  }
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

// Rarity glow for modal accent
const rarityGlow = computed(() => {
  if (!props.upgrade) return 'transparent'
  const map: Record<string, string> = {
    common: 'transparent',
    rare: 'var(--color-secondary-alpha)',
    epic: 'var(--color-primary-alpha)',
    legendary: 'rgba(245, 158, 11, 0.15)',
  }
  return map[props.upgrade.rarity] ?? 'transparent'
})

const rarityBorder = computed(() => {
  if (!props.upgrade) return 'var(--color-border)'
  const map: Record<string, string> = {
    common: 'var(--color-text-dim)',
    rare: 'var(--color-secondary)',
    epic: 'var(--color-primary)',
    legendary: 'var(--color-accent)',
  }
  return map[props.upgrade.rarity] ?? 'var(--color-text-dim)'
})
</script>

<template>
  <BaseModal
    :open="props.open"
    :title="props.upgrade ? `購買 ${props.upgrade.name}` : '確認購買'"
    :closable="props.closable"
    size="sm"
    @close="handleClose"
  >
    <div v-if="props.upgrade" class="modal-content">
      <!-- Rarity accent bar -->
      <div class="rarity-bar" :style="{ background: rarityBorder }" />

      <KawaiiIcon :name="iconForUpgrade(props.upgrade.id) as any" size="xl" class="upgrade-icon" />
      <div class="upgrade-name">{{ props.upgrade.name }}</div>
      <div class="upgrade-desc">{{ props.upgrade.description }}</div>

      <div class="upgrade-details">
        <div class="detail-row">
          <span class="detail-label">升級等級</span>
          <span class="detail-value">Lv.{{ currentLevel }} → Lv.{{ currentLevel + 1 }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">購買費用</span>
          <span class="detail-value cost-value">
            <KawaiiIcon name="coin" size="xs" />
            {{ cost.toLocaleString('zh-TW') }}
          </span>
        </div>
        <div class="detail-row" v-if="effectPreview">
          <span class="detail-label">效果預覽</span>
          <span class="detail-value effect-value">{{ effectPreview }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="isPurchasing"
          @click="handleCancel"
        >
          取消
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :disabled="!canAfford || isPurchasing"
          :loading="isPurchasing"
          @click="handleConfirm"
        >
          確認購買
          <KawaiiIcon name="coin" size="xs" />
          {{ cost.toLocaleString('zh-TW') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.modal-content {
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
  position: relative;
}

.rarity-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  transition: background 0.3s ease;
}

.upgrade-icon {
  width: 56px;
  height: 56px;
  margin-top: 6px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upgrade-icon:hover {
  transform: scale(1.1) rotate(-5deg);
}

.upgrade-name {
  font-size: var(--font-size-lg);
  font-weight: 900;
  color: #35272f;
}

.upgrade-desc {
  font-size: var(--font-size-sm);
  color: #6c5963;
  line-height: 1.45;
}

.upgrade-details {
  display: grid;
  gap: 8px;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(68, 52, 61, 0.14);
  border-radius: var(--radius-base);
  background: rgba(248, 250, 252, 0.76);
  margin-top: 8px;
}

.detail-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px;
  align-items: start;
  text-align: left;
}

.detail-label {
  color: #705d66;
  font-size: var(--font-size-sm);
  font-weight: 800;
}

.detail-value {
  color: #35272f;
  font-size: var(--font-size-sm);
  font-weight: 800;
}

.cost-value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #8c5a13;
}

.effect-value {
  color: #275f4e;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
</style>
