<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max?: number
  color?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
  animated?: boolean
}>(), {
  max: 100,
  color: 'var(--color-primary)',
  showLabel: false,
  size: 'md',
  animated: true,
})

const percentage = computed(() => {
  if (props.max <= 0) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
</script>

<template>
  <div :class="['progress-bar', `size-${size}`]" role="progressbar" :aria-valuenow="value" :aria-valuemax="max">
    <div class="progress-track">
      <div
        class="progress-fill"
        :class="{ animated }"
        :style="{ width: `${percentage}%`, backgroundColor: color }"
      />
      <span v-if="showLabel && size === 'md'" class="progress-label">
        {{ Math.round(percentage) }}%
      </span>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
}

.progress-track {
  position: relative;
  width: 100%;
  background: var(--color-bg-elevated);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 2px solid var(--color-text);
  box-shadow: var(--shadow-sm);
}

.size-sm .progress-track {
  height: 6px;
}

.size-md .progress-track {
  height: 10px;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  min-width: 0;
}

.progress-fill.animated {
  transition: width var(--duration-bounce) var(--ease-bounce);
}

.progress-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}
</style>
