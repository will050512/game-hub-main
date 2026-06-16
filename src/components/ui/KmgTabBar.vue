<script setup lang="ts">
import { computed, watch, ref } from 'vue'

export interface TabItem {
  label: string
  id: string
}

const props = withDefaults(defineProps<{
  tabs: TabItem[]
  modelValue?: string
}>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const activeId = ref(props.modelValue || (props.tabs[0]?.id ?? ''))

watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) activeId.value = newVal
})

function activateTab(tabId: string) {
  activeId.value = tabId
  emit('update:modelValue', tabId)
}

const activeTab = computed(() => activeId.value)
</script>

<template>
  <div class="kmg-tab-bar" role="tablist">
    <div class="kmg-tab-bar__track">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="[
          'kmg-tab-bar__tab',
          { active: activeId === tab.id },
        ]"
        role="tab"
        :aria-selected="activeId === tab.id"
        :aria-controls="`panel-${tab.id}`"
        :tabindex="activeId === tab.id ? 0 : -1"
        @click="activateTab(tab.id)"
        @keydown.enter="activateTab(tab.id)"
        @keydown.space.prevent="activateTab(tab.id)"
      >
        <span class="kmg-tab-bar__label">{{ tab.label }}</span>
        <span v-if="activeId === tab.id" class="kmg-tab-bar__indicator" />
      </div>
      <div class="kmg-tab-bar__indicator-track" />
    </div>
    <div
      v-for="tab in tabs"
      :key="tab.id"
      :id="`panel-${tab.id}`"
      role="tabpanel"
      :class="['kmg-tab-bar__panel', { hidden: activeId !== tab.id }]"
    >
      <slot :name="tab.id" v-bind="tab" />
    </div>
  </div>
</template>

<style scoped>
.kmg-tab-bar {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.kmg-tab-bar::-webkit-scrollbar {
  display: none;
}

.kmg-tab-bar__track {
  display: flex;
  position: relative;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--color-glass-bg);
  border-radius: var(--radius-full);
  border: var(--stroke-thin) solid var(--color-glass-border);
  backdrop-filter: blur(var(--color-glass-blur));
  -webkit-backdrop-filter: blur(var(--color-glass-blur));
  box-shadow: var(--shadow-md);
  width: fit-content;
  min-width: 100%;
  justify-content: center;
}

.kmg-tab-bar__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-family-heading);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  opacity: 0.6;
  border: 2px solid var(--color-text);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--duration-base) var(--ease-out);
  user-select: none;
  white-space: nowrap;
}

.kmg-tab-bar__tab:hover {
  opacity: 1;
}

.kmg-tab-bar__tab.active {
  background: var(--color-primary);
  color: white;
  opacity: 1;
}

.kmg-tab-bar__label {
  pointer-events: none;
}

.kmg-tab-bar__indicator-track {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
}

.kmg-tab-bar__indicator {
  position: absolute;
  bottom: 0;
  left: var(--space-1);
  height: 3px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transition: width var(--duration-normal) var(--ease-out),
             left var(--duration-normal) var(--ease-out);
}

.kmg-tab-bar__panel.hidden {
  display: none;
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .kmg-tab-bar__track {
    gap: 0;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 0;
  }

  .kmg-tab-bar__tab {
    flex: 1;
    justify-content: center;
    padding: var(--space-3) var(--space-2);
    border-radius: 0;
  }

  .kmg-tab-bar__tab.active {
    background: var(--color-primary-alpha);
  }
}
</style>
