<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'default'
  size?: 'sm' | 'base'
  icon?: string
}>(), {
  variant: 'default',
  size: 'base',
  icon: '',
})
</script>

<template>
  <span :class="['kmg-badge', `kmg-variant-${variant}`, `kmg-size-${size}`]">
    <span v-if="icon || $slots.icon" class="kmg-badge__icon">
      <slot name="icon">
        <span class="kawaii-icon">{{ icon }}</span>
      </slot>
    </span>
    <slot />
  </span>
</template>

<style scoped>
.kmg-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-2);
  border-radius: var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-sm);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  white-space: nowrap;
  border: 2px solid var(--color-text);
  transition: filter 200ms ease, transform var(--duration-bounce) var(--ease-bounce);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

/* Inner glow overlay */
.kmg-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
}

/* Hover brighten */
.kmg-badge:hover {
  filter: brightness(1.15);
  transform: scale(1.1);
}

.kmg-badge:active {
  transform: scale(0.95);
  filter: brightness(0.95);
}

/* Icon slot */
.kmg-badge__icon {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  line-height: 1;
}

/* Variants */
.kmg-variant-default {
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
}

.kmg-variant-info {
  background: var(--color-info-alpha);
  color: var(--color-info-light);
  border-color: var(--color-info-dark);
}

.kmg-variant-success {
  background: var(--color-success-alpha);
  color: var(--color-success-light);
  border-color: var(--color-success-dark);
}

.kmg-variant-warning {
  background: var(--color-accent-alpha);
  color: var(--color-accent-light);
  border-color: var(--color-accent-dark);
}

.kmg-variant-danger {
  background: var(--color-danger-alpha);
  color: var(--color-danger-light);
  border-color: var(--color-danger-dark);
}

/* Sizes */
.kmg-size-sm {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-2);
}

.kmg-size-base {
  font-size: var(--font-size-xs);
  padding: 2px var(--space-3);
}
</style>
