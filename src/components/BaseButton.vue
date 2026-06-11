<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: string
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="['base-button', `variant-${variant}`, `size-${size}`, { loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner" />
    <span v-else-if="icon" class="icon">{{ icon }}</span>
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: transform 100ms ease, opacity 100ms ease, filter 100ms ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.base-button:active:not(:disabled) {
  transform: scale(0.96);
}

.base-button:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Variants */
.variant-primary {
  background: var(--color-primary);
  color: #fff;
}

.variant-secondary {
  background: var(--color-bg-elevated);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.variant-danger {
  background: var(--color-danger);
  color: #fff;
}

.variant-ghost {
  background: transparent;
  color: var(--color-text-dim);
  border: none;
}

/* Sizes */
.size-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.size-md {
  padding: 10px 20px;
  font-size: 15px;
}

.size-lg {
  padding: 14px 28px;
  font-size: 17px;
}

/* Loading spinner */
.loading {
  pointer-events: none;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.icon {
  font-size: 1em;
  line-height: 1;
}
</style>
