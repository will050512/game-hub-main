<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title?: string
  closable?: boolean
  size?: 'sm' | 'md' | 'lg' | 'fullscreen'
}>(), {
  closable: true,
  size: 'md',
})

const emit = defineEmits<{
  close: []
}>()

function onBackdropClick() {
  emit('close')
}

function onPanelClick(event: MouseEvent) {
  event.stopPropagation()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-backdrop"
        @click="closable ? onBackdropClick() : undefined"
      >
        <div :class="['modal-panel', `size-${size}`]" @click="onPanelClick">
          <div v-if="title" class="modal-header">
            <span class="modal-title">{{ title }}</span>
            <button v-if="closable" class="modal-close" @click="emit('close')">×</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.modal-panel {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.size-sm {
  max-width: 320px;
}
.size-md {
  max-width: 480px;
}
.size-lg {
  max-width: 640px;
}
.size-fullscreen {
  max-width: none;
  width: 100%;
  height: 100%;
  max-height: 100%;
  border-radius: 0;
  border: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 0;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text-dim);
  font-size: 20px;
  cursor: pointer;
  transition: background 100ms ease;
}

.modal-close:hover {
  background: var(--color-bg-elevated);
}

.modal-body {
  padding: 20px;
  flex: 1;
}

.modal-footer {
  padding: 0 20px 20px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  margin-top: 4px;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 200ms ease, opacity 200ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  transform: scale(0.9);
  opacity: 0;
}

.modal-leave-to .modal-panel {
  transform: scale(0.9);
  opacity: 0;
}
</style>
