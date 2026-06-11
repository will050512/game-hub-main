<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import KawaiiIcon from '@/components/KawaiiIcon.vue'

withDefaults(defineProps<{
  compact?: boolean
}>(), {
  compact: false,
})

const settingsStore = useSettingsStore()

const channels = computed(() => [
  {
    id: 'master',
    label: '主音量',
    icon: 'star',
    value: settingsStore.masterVolume,
    set: settingsStore.setMasterVolume,
  },
  {
    id: 'sound',
    label: '遊戲音效',
    icon: 'sparkle',
    value: settingsStore.soundVolume,
    set: settingsStore.setSoundVolume,
  },
  {
    id: 'music',
    label: '背景音樂',
    icon: 'timer',
    value: settingsStore.musicVolume,
    set: settingsStore.setMusicVolume,
  },
  {
    id: 'ui',
    label: '介面音',
    icon: 'controller',
    value: settingsStore.uiVolume,
    set: settingsStore.setUiVolume,
  },
] as const)

function setVolume(setter: (value: number) => void, event: Event) {
  const input = event.target as HTMLInputElement
  setter(Number(input.value))
}

function volumeLabel(value: number) {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <section :class="['audio-mixer-panel', { compact }]" aria-label="音效與音量設定">
    <header class="audio-header">
      <div class="audio-title-row">
        <KawaiiIcon name="star" size="sm" class="audio-title-icon" />
        <div>
          <h3 class="audio-title">音效與音量</h3>
          <p v-if="!compact" class="audio-subtitle">調整遊戲回饋、背景音樂和介面提示音。</p>
        </div>
      </div>
    </header>

    <div class="audio-channel-list">
      <label v-for="channel in channels" :key="channel.id" class="audio-channel">
        <span class="channel-label">
          <KawaiiIcon :name="channel.icon" size="xs" />
          {{ channel.label }}
        </span>
        <input
          class="channel-range"
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="channel.value"
          @input="setVolume(channel.set, $event)"
        />
        <span class="channel-value">{{ volumeLabel(channel.value) }}</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.audio-mixer-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  width: 100%;
  color: var(--color-kawaii-ink);
}

.audio-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.audio-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.audio-title-icon {
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  padding: 7px;
  border: 2px solid var(--color-kawaii-ink);
  border-radius: var(--radius-lg);
  background: var(--color-kawaii-butter-main);
  box-shadow: 3px 3px 0 rgba(36, 27, 34, 0.18);
}

.audio-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  line-height: 1.2;
}

.audio-subtitle {
  margin: 4px 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.audio-channel-list {
  display: grid;
  gap: var(--space-3);
}

.audio-channel {
  display: grid;
  grid-template-columns: minmax(92px, 0.58fr) minmax(112px, 1fr) 46px;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: 2px solid var(--color-kawaii-ink);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 248, 0.82);
  box-shadow: 3px 3px 0 rgba(36, 27, 34, 0.1);
}

.channel-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.channel-range {
  width: 100%;
  min-width: 0;
  accent-color: var(--color-kawaii-mint-main);
}

.channel-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-black);
  text-align: right;
  color: var(--color-accent-dark);
}

.compact {
  gap: var(--space-3);
}

.compact .audio-title-icon {
  width: 30px;
  height: 30px;
  padding: 5px;
}

.compact .audio-title {
  font-size: var(--font-size-base);
}

.compact .audio-channel {
  grid-template-columns: 78px minmax(96px, 1fr) 42px;
  padding: var(--space-2);
}

@media (max-width: 420px) {
  .audio-channel,
  .compact .audio-channel {
    grid-template-columns: 1fr 42px;
  }

  .channel-label {
    grid-column: 1 / -1;
  }
}
</style>
