<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  outlined?: boolean
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  outlined: false,
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = 'kawaii-button'
  const variant = props.variant || 'primary'
  const size = props.size || 'md'
  const outlined = props.outlined ? 'outlined' : ''
  const disabled = props.disabled ? 'disabled' : ''
  const loading = props.loading ? 'loading' : ''
  return [base, `btn-${variant}`, `btn-${size}`, outlined, disabled, loading].filter(Boolean).join(' ')
})

function handleClick(e: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<template>
  <button :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="loading-indicator">✦</span>
    <slot />
  </button>
</template>

<style scoped>
.kawaii-button {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: var(--stroke-bold) solid var(--color-text);
  position: relative;
  overflow: hidden;
}

.kawaii-button::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255,255,255,0.35) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
}

.kawaii-button:active:not(:disabled):not(.loading)::after {
  opacity: 1;
  animation: ripple 0.6s ease-out forwards;
}

.kawaii-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.kawaii-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--shadow-base);
}

.kawaii-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary.outlined {
  background: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-secondary {
  background: var(--color-secondary);
  color: white;
}

.btn-secondary.outlined {
  background: transparent;
  color: var(--color-secondary);
  border-color: var(--color-secondary);
}

.btn-accent {
  background: var(--color-accent);
  color: white;
}

.btn-accent.outlined {
  background: transparent;
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text);
}

.loading {
  pointer-events: none;
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ripple {
  from { opacity: 1; transform: scale(0.5); }
  to { opacity: 0; transform: scale(2); }
}

.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  border-width: var(--stroke-base);
}

.btn-md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-lg);
}
</style>