<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  amount: number
  type?: 'coin' | 'gem' | 'star'
  animated?: boolean
}>(), {
  type: 'coin',
  animated: false,
})

const displayAmount = ref(props.amount)
const isAnimating = ref(false)
const bounce = ref(false)

const colorVar = computed(() => {
  switch (props.type) {
    case 'gem': return 'var(--color-primary)'
    case 'star': return 'var(--color-accent-light)'
    case 'coin':
    default: return 'var(--color-accent)'
  }
})

const iconPath = computed(() => {
  switch (props.type) {
    case 'gem': return 'M32 8L44 20L32 32L20 20L32 8ZM8 28L20 20L32 28L44 20L56 28L32 52L8 28Z'
    case 'star': return 'M32 10L39 24L54 20L47 33L59 41L44 45L46 58L32 50L18 58L20 45L5 41L17 33L10 20L25 24L32 10Z'
    case 'coin':
    default: return 'M32 12A20 20 0 1 0 32 52A20 20 0 1 0 32 12ZM32 20A12 12 0 1 1 32 44A12 12 0 1 1 32 20Z'
  }
})

if (props.animated) {
  watch(() => props.amount, async (newVal, oldVal) => {
    if (oldVal === undefined || oldVal === newVal) return
    isAnimating.value = true
    const startVal = oldVal ?? 0
    const diff = newVal - startVal
    const steps = Math.abs(diff)
    const stepTime = Math.max(50, Math.min(1200, 1200 / steps))

    displayAmount.value = startVal
    for (let i = 1; i <= steps; i++) {
      await nextTick()
      displayAmount.value = startVal + Math.sign(diff) * i
      await new Promise(r => setTimeout(r, stepTime))
    }
    isAnimating.value = false
  })
}

watch(() => props.amount, () => {
  bounce.value = true
  setTimeout(() => {
    bounce.value = false
  }, 400)
})

const formattedAmount = computed(() => {
  return displayAmount.value.toLocaleString()
})
</script>

<template>
  <span
    :class="[
      'kmg-currency',
      { 'kmg-animate': isAnimating, 'bounce': bounce },
    ]"
    :style="{ '--kmg-currency-color': colorVar }"
  >
    <svg class="kmg-currency__icon" viewBox="0 0 64 64" aria-hidden="true">
      <path
        :d="iconPath"
        fill="var(--kmg-currency-color)"
        stroke="var(--color-text)"
        stroke-width="2.4"
        stroke-linejoin="round"
      />
    </svg>
    <span class="kmg-currency__amount">{{ formattedAmount }}</span>
  </span>
</template>

<style scoped>
.kmg-currency {
  --kmg-currency-color: var(--color-accent);
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  color: var(--kmg-currency-color);
  white-space: nowrap;
  transition: transform var(--duration-bounce) var(--ease-bounce);
  border-radius: var(--radius-base) var(--radius-sm) var(--radius-base) var(--radius-sm);
  border: 2px solid var(--color-text);
  box-shadow: var(--shadow-md);
}

.kmg-currency__icon {
  width: var(--icon-sm);
  height: var(--icon-sm);
  flex-shrink: 0;
}

.kmg-currency.kmg-animate .kmg-currency__amount {
  animation: kmg-count-pop 200ms ease-out;
}

.kmg-currency.bounce {
  transform: scale(1.3);
}

@keyframes kmg-count-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
