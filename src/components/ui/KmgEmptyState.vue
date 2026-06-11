<script setup lang="ts">
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import KmgButton from './KmgButton.vue'

withDefaults(defineProps<{
  title: string
  description: string
  actionText?: string
}>(), {
  actionText: '',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="kmg-empty-state">
    <div class="kmg-empty-state__illustration">
      <KawaiiIcon name="orb" size="xl" />
    </div>
    <h3 class="kmg-empty-state__title">
      <slot name="title">{{ title }}</slot>
    </h3>
    <p class="kmg-empty-state__description">
      <slot name="description">{{ description }}</slot>
    </p>
    <div v-if="$slots.action || actionText" class="kmg-empty-state__action">
      <KmgButton v-if="actionText" variant="primary" size="base" @click="emit('action')">
        {{ actionText }}
      </KmgButton>
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.kmg-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-10) var(--space-4);
  text-align: center;
}

.kmg-empty-state__illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: kmg-float 3s ease-in-out infinite;
}

.kmg-empty-state__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin: 0;
  line-height: var(--line-height-tight);
}

.kmg-empty-state__description {
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  color: var(--color-text-dim);
  margin: 0;
  max-width: 280px;
  line-height: var(--line-height-relaxed);
}

.kmg-empty-state__action {
  margin-top: var(--space-2);
}

@keyframes kmg-float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
