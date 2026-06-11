<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'left',
  distance: 60,
  duration: 350,
})

const enterFrom = computed(() => {
  const base = { opacity: 0 }
  switch (props.direction) {
    case 'left': return { ...base, transform: `translateX(${props.distance}px)` }
    case 'right': return { ...base, transform: `translateX(-${props.distance}px)` }
    case 'up': return { ...base, transform: `translateY(${props.distance}px)` }
    case 'down': return { ...base, transform: `translateY(-${props.distance}px)` }
  }
  return base
})

const leaveTo = computed(() => {
  const base = { opacity: 0 }
  switch (props.direction) {
    case 'left': return { ...base, transform: `translateX(-${props.distance}px)` }
    case 'right': return { ...base, transform: `translateX(${props.distance}px)` }
    case 'up': return { ...base, transform: `translateY(-${props.distance}px)` }
    case 'down': return { ...base, transform: `translateY(${props.distance}px)` }
  }
  return base
})
</script>

<template>
  <Transition
    :css="false"
    @enter="onEnter"
    @leave="onLeave"
    v-bind="$attrs"
  >
    <slot />
  </Transition>
</template>

<script lang="ts">
function onEnter(el: Element) {
  const h = el as HTMLElement
  h.style.opacity = '0'
  const distance = `translateX(${60}px)`
  h.style.transform = distance
  requestAnimationFrame(() => {
    h.style.transition = `transform ${350}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${350}ms cubic-bezier(0.34, 1.56, 0.64, 1)`
    h.style.opacity = '1'
    h.style.transform = 'translateX(0)'
  })
}

function onLeave(el: Element) {
  const h = el as HTMLElement
  h.style.transition = `transform ${300}ms ease-in, opacity ${300}ms ease-in`
  h.style.transform = 'translateX(-60px)'
  h.style.opacity = '0'
}
</script>

<style scoped>
/* Uses inline transitions */
</style>
