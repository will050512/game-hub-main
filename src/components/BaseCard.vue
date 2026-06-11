<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'default' | 'elevated' | 'outlined'
  clickable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}>(), {
  variant: 'default',
  clickable: false,
  padding: 'md',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<template>
  <div
    :class="['base-card', `variant-${variant}`, `padding-${padding}`, { clickable }]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="handleClick"
  >
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.base-card {
  border-radius: var(--radius-lg);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Variants */
.variant-default {
  background: var(--color-bg-card);
}

.variant-elevated {
  background: var(--color-bg-elevated);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.08);
}

.variant-outlined {
  background: transparent;
  border: 1px solid var(--color-border);
}

/* Padding */
.padding-none {
  padding: 0;
}
.padding-sm {
  padding: 12px;
}
.padding-md {
  padding: 16px;
}
.padding-lg {
  padding: 24px;
}

/* Clickable */
.clickable {
  cursor: pointer;
}

.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.clickable:hover.variant-outlined {
  border-color: var(--color-primary);
}

.clickable:active {
  transform: scale(0.98) translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Header / Footer */
.card-header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 12px;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
  margin-top: 12px;
}
</style>
