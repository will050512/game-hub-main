<script setup lang="ts">
import KawaiiIcon from '@/components/KawaiiIcon.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="search-bar">
    <KawaiiIcon name="search" size="sm" class="search-icon" />
    <input
      :value="modelValue"
      type="text"
      placeholder="搜尋遊戲名稱、類型..."
      class="search-input"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      class="search-clear"
      aria-label="清除搜尋"
      @click="emit('update:modelValue', '')"
    >
      ×
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  max-width: 31.25rem;
  margin: 0 auto var(--space-8);
}

.search-input {
  width: 100%;
  padding: var(--space-3, 0.875rem) var(--space-10, 3rem) var(--space-3, 0.875rem) var(--space-10, 3rem);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  outline: none;
  transition: all var(--duration-normal) var(--ease-out);
  box-shadow: var(--shadow-sm);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: var(--pill-color, var(--color-primary));
  box-shadow: 0 0 0 3px var(--color-primary-alpha), var(--shadow-md);
  background: var(--color-bg-elevated);
  transform: translateY(-1px);
}

.search-icon {
  position: absolute;
  left: var(--space-4, 1rem);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-lg);
  pointer-events: none;
  opacity: 0.5;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.search-input:focus + .search-icon,
.search-bar:focus-within .search-icon {
  opacity: 0.8;
}

.search-clear {
  position: absolute;
  right: var(--space-3, 0.75rem);
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-border-light);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: all var(--duration-fast) var(--ease-out);
  line-height: 1;
  padding: 0;
}

.search-clear:hover {
  background: var(--color-danger-alpha);
  color: var(--color-danger);
  transform: translateY(-50%) scale(1.1);
}
</style>
