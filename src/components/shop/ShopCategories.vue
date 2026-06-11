<script setup lang="ts">
import type { KawaiiIconId } from '@/data/iconManifest'

export interface CategoryItem {
  key: string
  label: string
  icon: KawaiiIconId
}

interface Props {
  categories: CategoryItem[]
  modelValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectCategory(key: string) {
  emit('update:modelValue', key)
}
</script>

<template>
  <nav class="shop-categories" aria-label="分類篩選">
    <button
      v-for="cat in props.categories"
      :key="cat.key"
      :class="['cat-btn', { active: modelValue === cat.key }]"
      @click="selectCategory(cat.key)"
    >
      <KawaiiIcon :name="cat.icon" size="sm" />
      <span>{{ cat.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.shop-categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.shop-categories::-webkit-scrollbar {
  height: 4px;
}

.shop-categories::-webkit-scrollbar-track {
  background: transparent;
}

.shop-categories::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.cat-btn {
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
  transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
  white-space: nowrap;
}

.cat-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(58, 130, 110, 0.4);
}

.cat-btn.active {
  border-color: rgba(58, 130, 110, 0.55);
  background: linear-gradient(180deg, #eaf9f2 0%, #d7f1e7 100%);
  color: #22463c;
}
</style>