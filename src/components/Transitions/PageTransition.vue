<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name?: string
  mode?: 'in-out' | 'out-in'
}>(), {
  name: 'fade',
  mode: 'out-in',
})

const transitionClass = computed(() => `${props.name}-enter-active, ${props.name}-leave-active`)
</script>

<template>
  <Transition :name="name" :mode="mode" v-bind="$attrs">
    <slot />
  </Transition>
</template>

<style scoped>
/* Page-level transitions are defined in App.vue */
</style>
