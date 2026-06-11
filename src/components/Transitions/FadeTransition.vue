<script setup lang="ts">
interface Props {
  name?: string
  mode?: 'in-out' | 'out-in'
}

const props = withDefaults(defineProps<Props>(), {
  name: 'fade',
  mode: 'out-in',
})
</script>

<template>
  <Transition :name="name" :mode="mode" v-bind="$attrs">
    <slot />
  </Transition>
</template>

<style scoped>
/* Base transitions defined in App.vue */
</style>
