<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}>(), {
  position: 'top',
})

const isHovered = ref(false)
</script>

<template>
  <div
    class="kmg-tooltip__wrapper"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @focusin="isHovered = true"
    @focusout="isHovered = false"
  >
    <slot />
    <Transition name="kmg-tooltip-fade">
      <div
        v-if="isHovered || isHovered"
        :class="[
          'kmg-tooltip',
          `kmg-tooltip-${position}`,
        ]"
        role="tooltip"
      >
        <span class="kmg-tooltip__text">{{ content }}</span>
        <span class="kmg-tooltip__arrow" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.kmg-tooltip__wrapper {
  position: relative;
  display: inline-flex;
}

.kmg-tooltip {
  position: absolute;
  z-index: var(--z-tooltip);
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-family-base);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  white-space: nowrap;
  pointer-events: none;
  border-radius: var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-sm);
  background: var(--color-glass-bg-elevated);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid var(--color-text);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  animation: scaleIn var(--duration-base) var(--ease-out);
}

.kmg-tooltip--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(0);
}

.kmg-tooltip-fade-enter-active,
.kmg-tooltip-fade-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.kmg-tooltip-fade-enter-from,
.kmg-tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

.kmg-tooltip__text {
  display: block;
}

.kmg-tooltip__arrow {
  position: absolute;
  width: 8px;
  height: 4px;
  overflow: hidden;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.kmg-tooltip__arrow::before {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--color-glass-bg-elevated);
  transform: rotate(45deg);
  border: 1px solid var(--color-glass-border);
  border-top: none;
  border-left: none;
}

.kmg-tooltip--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.kmg-tooltip--bottom .kmg-tooltip__arrow::before {
  transform: rotate(225deg);
}

.kmg-tooltip--left {
  top: 50%;
  transform: translateY(-50%) translateX(0);
  right: calc(100% + 8px);
}

.kmg-tooltip--right {
  top: 50%;
  transform: translateY(-50%);
  left: calc(100% + 8px);
}
</style>
