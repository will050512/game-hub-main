<script setup lang="ts">
import { computed } from 'vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import type { KawaiiIconId } from '@/data/iconManifest'

const props = defineProps<{
  modelValue: 'games' | 'quests' | 'achievements' | 'audio'
}>()

const emit = defineEmits<{
  'update:modelValue': [view: 'games' | 'quests' | 'achievements' | 'audio']
  'open-shop': []
}>()

const tabs: { id: string; icon: KawaiiIconId; label: string }[] = [
  { id: 'games', icon: 'controller', label: '遊戲' },
  { id: 'quests', icon: 'board', label: '每日任務' },
  { id: 'achievements', icon: 'trophy', label: '成就' },
  { id: 'audio', icon: 'star', label: '音訊' },
  { id: 'shop', icon: 'shop', label: '商店' },
]

const activeId = computed(() => props.modelValue)
</script>

<template>
  <nav class="view-tabs" role="tablist" aria-label="檢視切換">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="['view-tab', { active: activeId === tab.id }]"
      role="tab"
      :aria-selected="activeId === tab.id"
      @click="tab.id === 'shop' ? emit('open-shop') : emit('update:modelValue', tab.id as 'games' | 'quests' | 'achievements' | 'audio')"
    >
      <KawaiiIcon :name="tab.icon" size="sm" class="tab-icon" />
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.view-tabs {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
  padding: var(--space-2);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-card);
}

.view-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  font-family: var(--font-family-heading);
}

.view-tab:hover {
  background: var(--color-bg-card-hover);
  border-color: var(--color-border-subtle);
  color: var(--color-primary-dark);
}

.view-tab.active {
  background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  color: var(--color-kawaii-ink);
  border-color: var(--color-kawaii-ink);
  box-shadow: 3px 3px 0 rgba(38, 27, 34, 0.16);
}

.tab-icon {
  font-size: var(--icon-md);
}

.tab-label {
  font-weight: var(--font-weight-bold);
}

@media (max-width: 768px) {
  .view-tabs {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .view-tab {
    flex: 1 1 calc(50% - var(--space-2));
    min-width: 100px;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-sm);
  }
}
</style>
