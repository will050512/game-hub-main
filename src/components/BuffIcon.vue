<script setup lang="ts">
import { computed } from 'vue'
import type { ActiveBuff } from '@/types'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForItem } from '@/data/iconManifest'

const props = defineProps<{
  buff: ActiveBuff
}>()

const progress = computed(() => {
  if (props.buff.totalMs <= 0) return 0
  return Math.max(0, Math.min(1, props.buff.remainingMs / props.buff.totalMs))
})

/* SVG circle math: radius=14, circumference=2πr ≈ 87.96 */
const circumference = 2 * Math.PI * 14
const dashOffset = computed(() => circumference * (1 - progress.value))
</script>

<template>
  <div class="buff-icon" :title="buff.name">
    <svg class="buff-ring" viewBox="0 0 36 36">
      <circle
        class="ring-track"
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke-width="3"
      />
      <circle
        class="ring-fill"
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke-width="3"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div class="buff-core">
      <KawaiiIcon :name="iconForItem(buff.icon)" size="sm" class="buff-emoji" />
    </div>
  </div>
</template>

<style scoped>
.buff-icon {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.buff-ring {
  width: 36px;
  height: 36px;
  transform: rotate(-90deg);
}

.ring-track {
  stroke: rgba(29, 22, 27, 0.18);
}

.ring-fill {
  stroke: var(--color-accent);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
}

.buff-core {
  position: absolute;
  inset: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(180deg, var(--color-kawaii-warm-paper) 0%, var(--color-kawaii-warm-alt) 100%);
  border: 2px solid rgba(29, 22, 27, 0.64);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.buff-emoji {
  pointer-events: none;
}
</style>
