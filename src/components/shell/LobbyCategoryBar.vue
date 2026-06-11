<script setup lang="ts">
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import type { KawaiiIconId } from '@/data/iconManifest'

const props = defineProps<{
  categories: readonly { id: string; name: string; icon: string }[]
  activeCategory: string
}>()

const emit = defineEmits<{
  'update:activeCategory': [id: string]
}>()

function categoryIcon(categoryId: string): KawaiiIconId {
  const map: Record<string, KawaiiIconId> = {
    action: 'action', arcade: 'arcade', board: 'board', casual: 'heart',
    puzzle: 'puzzle', strategy: 'strategy', all: 'controller',
  }
  return (map[categoryId] ?? 'controller') as KawaiiIconId
}
</script>

<template>
  <nav class="category-bar" aria-label="遊戲分類">
    <button
      v-for="cat in categories"
      :key="cat.id"
      :class="['cat-pill', { active: props.activeCategory === cat.id }]"
      :style="{
        '--pill-color': cat.id === 'all' ? '#06b6d4' :
          cat.id === 'action' ? '#ef4444' :
          cat.id === 'puzzle' ? '#8b5cf6' :
          cat.id === 'strategy' ? '#f59e0b' :
          cat.id === 'casual' ? '#10b981' :
          cat.id === 'board' ? '#3b82f6' :
          '#6b7280'
      }"
      @click="$emit('update:activeCategory', cat.id)"
    >
      <KawaiiIcon :name="categoryIcon(cat.id)" size="xs" class="pill-icon" />
      <span class="pill-text">{{ cat.name }}</span>
      <span class="pill-rainbow" v-if="props.activeCategory === cat.id"></span>
    </button>
  </nav>
</template>

<style scoped>
.category-bar {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
  overflow-x: auto;
  padding-bottom: var(--space-2);
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.category-bar::-webkit-scrollbar {
  height: 6px;
}

.category-bar::-webkit-scrollbar-track {
  background: transparent;
}

.category-bar::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.cat-pill {
  position: relative;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0.5rem var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: 999px;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-bounce);
  white-space: nowrap;
  font-family: var(--font-family-heading);
  overflow: hidden;
}

.cat-pill:hover {
  transform: translateY(-2px);
  border-color: var(--pill-color, var(--color-primary-light));
  background: var(--pill-color, var(--color-primary-alpha));
  box-shadow: 0 4px 12px var(--pill-color, rgba(139, 92, 246, 0.2));
}

.cat-pill.active {
  color: white;
  background: linear-gradient(135deg, var(--pill-color, #06b6d4) 0%, var(--pill-color, #06b6d4) 100%);
  border-color: var(--pill-color, #06b6d4);
  box-shadow: 0 4px 16px var(--pill-color, rgba(6, 182, 212, 0.4));
}

.cat-pill.active:hover {
  transform: translateY(-2px);
}

.pill-rainbow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--pill-color, #06b6d4), var(--pill-color, #ec4899), var(--pill-color, #eab308));
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.cat-pill.active .pill-rainbow {
  opacity: 1;
}

.pill-icon {
  font-size: var(--icon-sm);
  line-height: 1;
}

.pill-text {
  font-size: var(--font-size-xs);
  letter-spacing: 0.025em;
}

@media (max-width: 768px) {
  .category-bar {
    gap: var(--space-2);
  }

  .cat-pill {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }

  .pill-text {
    font-size: var(--font-size-xs);
  }
}
</style>
