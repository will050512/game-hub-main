<script setup lang="ts">
interface Props {
  scale?: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 0.8,
  duration: 400,
})
</script>

<template>
  <Transition
    :name="`scale-fade`"
    mode="out-in"
    v-bind="$attrs"
  >
    <slot />
  </Transition>
</template>

<style scoped>
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition:
    transform var(--duration-slow) cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity var(--duration-slow) cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}

.scale-fade-enter-from {
  transform: scale(v-bind(scale));
  opacity: 0;
}

.scale-fade-leave-to {
  transform: scale(1.1);
  opacity: 0;
}
</style>
