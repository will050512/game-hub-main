<script setup lang="ts">
import { computed, ref } from 'vue'
import { isOnline, reconnecting, reconnectAttempts } from '@/pwa/offline-detector'

const dismissed = ref(false)

const show = computed(() => !isOnline.value && !dismissed.value)

function close(): void {
  dismissed.value = true
}

function retry(): void {
  window.location.reload()
}

const statusText = computed(() => {
  if (reconnecting.value) {
    return `嘗試重新連線中... (第 ${reconnectAttempts.value} 次)`
  }
  return '你目前離線'
})
</script>

<template>
  <Transition name="banner-slide">
    <div v-if="show" class="offline-banner">
      <span class="banner-icon">📡</span>
      <span class="banner-text">{{ statusText }}</span>
      <button v-if="!reconnecting" class="banner-btn" @click="retry">重新連線</button>
      <button class="banner-close" aria-label="關閉" @click="close">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.offline-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #1a1a1a;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.banner-icon { font-size: 1.2rem; }
.banner-text { flex: 1; }

.banner-btn {
  padding: 5px 14px;
  background: rgba(0, 0, 0, 0.15);
  border: none;
  border-radius: 6px;
  color: #1a1a1a;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.banner-btn:hover {
  background: rgba(0, 0, 0, 0.25);
}

.banner-close {
  background: transparent;
  color: rgba(0, 0, 0, 0.5);
  font-size: 1.2rem;
  padding: 2px 6px;
  border: none;
  cursor: pointer;
  line-height: 1;
}
.banner-close:hover { color: #1a1a1a; }

.banner-slide-enter-active { animation: bannerSlideDown 0.3s ease both; }
.banner-slide-leave-active { animation: bannerSlideUp 0.25s ease both; }

@keyframes bannerSlideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
@keyframes bannerSlideUp { from { transform: translateY(0); } to { transform: translateY(-100%); } }
</style>
