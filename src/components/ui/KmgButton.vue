<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'base' | 'lg'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}>(), {
  variant: 'primary',
  size: 'base',
  loading: false,
  disabled: false,
  block: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const rippleContainer = ref<HTMLElement | null>(null)

const isActive = computed(() => !props.disabled && !props.loading)

function handleClick(e: MouseEvent) {
  if (isActive.value) {
    emit('click', e)
  }
}

function createRipple(e: MouseEvent) {
  if (!isActive.value || !rippleContainer.value) return
  const container = rippleContainer.value
  const rect = container.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = e.clientX - rect.left - size / 2
  const y = e.clientY - rect.top - size / 2
  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  container.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

function keyboardRipple() {
  if (!isActive.value || !rippleContainer.value) return
  const container = rippleContainer.value
  const rect = container.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${rect.width / 2 - size / 2}px`
  ripple.style.top = `${rect.height / 2 - size / 2}px`
  container.appendChild(ripple)
  ripple.addEventListener('animationend', () => ripple.remove())
}

function handleFocusVisible() {
  keyboardRipple()
}

onMounted(() => {
  rippleContainer.value?.addEventListener('mousedown', createRipple)
  rippleContainer.value?.addEventListener('focusin', handleFocusVisible)
})

onUnmounted(() => {
  rippleContainer.value?.removeEventListener('mousedown', createRipple)
  rippleContainer.value?.removeEventListener('focusin', handleFocusVisible)
})
</script>

<template>
  <button
    ref="rippleContainer"
    :class="[
      'kmg-button',
      `kmg-variant-${variant}`,
      `kmg-size-${size}`,
      { loading, disabled, block },
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled"
    @click="handleClick"
  >
    <span class="kmg-button__content">
      <span v-if="loading" class="kmg-spinner" />
      <slot v-else />
    </span>
  </button>
</template>

<style scoped>
.kmg-button {
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: var(--stroke-bold) solid var(--color-text);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.kmg-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.kmg-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow:
    var(--shadow-base),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

.kmg-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.kmg-button.block {
  width: 100%;
}

/* Icon bounce on hover */
.kmg-button:hover:not(:disabled) :deep(.kawaii-icon) {
  transform: translateY(-2px) scale(1.15);
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.kmg-button__content :deep(.kawaii-icon) {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Focus-visible outline ring + ripple trigger */
.kmg-button:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

/* Ghost variant gradient border on hover */
.kmg-button.kmg-variant-ghost:hover:not(:disabled) {
  border: var(--stroke-bold) solid transparent;
  box-shadow:
    0 8px 20px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px var(--color-primary);
  background: radial-gradient(circle at 30% 20%, rgba(var(--color-primary-rgb), 0.06), transparent 60%);
}

/* Variants */
.kmg-variant-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: #fff;
}

.kmg-variant-secondary {
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark));
  color: #fff;
}

.kmg-variant-danger {
  background: linear-gradient(135deg, var(--color-danger), var(--color-danger-dark));
  color: #fff;
}

.kmg-variant-ghost {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border-light);
}

/* Sizes */
.kmg-size-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  border-width: var(--stroke-base);
}

.kmg-size-base {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  border-width: var(--stroke-bold);
}

.kmg-size-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-lg);
  border-width: var(--stroke-bold);
}

/* Ripple */
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0);
  animation: ripple-anim 500ms ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-anim {
  to {
    transform: scale(1);
    opacity: 0;
  }
}

/* Spinner */
.kmg-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: kmg-spin 600ms linear infinite;
}

.kmg-button.kmg-variant-ghost .kmg-spinner {
  border-color: rgba(0, 0, 0, 0.15);
  border-top-color: var(--color-text);
}

@keyframes kmg-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
