<script setup lang="ts">
import { updateAvailable, isUpdating } from '@/pwa/update-manager'

function onReload(): void {
  location.reload()
}

function onDismiss(): void {
  window.dispatchEvent(new CustomEvent('pwa-dismiss-update'))
}
</script>

<template>
  <Transition name="prompt-fade">
    <div v-if="updateAvailable && !isUpdating" class="update-prompt">
      <div class="prompt-content">
        <span class="prompt-icon">🔄</span>
        <div class="prompt-text">
          <strong>新版本已就緒</strong>
          <span>Game Hub 有可用更新，包含功能改進和遊戲內容。</span>
        </div>
      </div>
      <div class="prompt-actions">
        <button class="prompt-btn reload" @click="onReload">重新加载</button>
        <button class="prompt-btn later" @click="onDismiss">稍後</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.update-prompt {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--color-bg-card, #1e1e2e);
  border: 1px solid var(--color-border, #333);
  border-left: 4px solid #6366f1;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(16px);
  max-width: 380px;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.prompt-icon { font-size: 1.5rem; }

.prompt-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.prompt-text strong {
  color: var(--color-text, #fff);
  font-size: 0.9rem;
}
.prompt-text span {
  color: var(--color-text-dim, #888);
  font-size: 0.75rem;
}

.prompt-actions {
  display: flex;
  gap: 8px;
}

.prompt-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.prompt-btn.reload {
  background: #6366f1;
  color: #fff;
}
.prompt-btn.reload:hover { background: #4f46e5; }
.prompt-btn.later {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-dim, #888);
}
.prompt-btn.later:hover { background: rgba(255, 255, 255, 0.15); }

.prompt-fade-enter-active { animation: promptIn 0.3s ease both; }
.prompt-fade-leave-active { animation: promptOut 0.2s ease both; }

@keyframes promptIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes promptOut { from { opacity: 1; } to { opacity: 0; } }
</style>
