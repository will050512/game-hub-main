<script setup lang="ts">
import { ref } from 'vue'
import DoodleCard from '@/components/DoodleCard.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForGame } from '@/data/iconManifest'
import type { GameInfo } from '@/types'

withDefaults(defineProps<{
  game: GameInfo
  highScore?: number
  playCount?: number
}>(), {
  highScore: 0,
  playCount: 0,
})

const emit = defineEmits<{
  click: []
}>()

const imgFailed = ref(false)

function onImgError() {
  imgFailed.value = true
}
</script>

<template>
  <DoodleCard tone="paper" padding="sm" interactive>
    <button
      class="game-card"
      type="button"
      :data-game-id="game.id"
      :aria-label="`開啟遊戲：${game.name}`"
      @click="emit('click')"
    >
    <div class="thumbnail" :style="{ backgroundColor: game.color }">
      <img
        v-if="game.thumbnail && !imgFailed"
        :src="game.thumbnail"
        :alt="game.name"
        class="thumbnail-img"
        @error="onImgError"
      />
      <KawaiiIcon v-else :name="iconForGame(game.id, game.category)" size="xl" class="thumbnail-icon" />
      <span class="category-badge">{{ game.category }}</span>
    </div>
    <div class="card-body">
      <div class="game-name">{{ game.name }}</div>
      <div class="game-desc">{{ game.description }}</div>
    </div>
    <div class="card-footer">
      <span class="stat"><KawaiiIcon name="trophy" size="sm" /> {{ highScore }}</span>
      <span class="stat"><KawaiiIcon name="controller" size="sm" /> {{ playCount }}</span>
    </div>
    </button>
  </DoodleCard>
</template>

<style scoped>
.game-card {
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  border: 0;
  padding: 0;
  background: transparent;
  text-align: left;
}

.game-card:focus-visible {
  outline: 3px solid rgba(52, 170, 160, 0.85);
  outline-offset: 6px;
  border-radius: var(--radius-lg);
}

.thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border-dark);
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.52), transparent 30%),
    linear-gradient(180deg, color-mix(in srgb, var(--game-survivor) 70%, white 30%) 0%, rgba(255, 249, 245, 0.84) 100%);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-icon {
  transform: scale(1.15) rotate(-4deg);
}

.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  background: rgba(255, 252, 246, 0.88);
  color: var(--color-kawaii-ink);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border: 2px solid var(--color-border-dark);
  border-radius: var(--radius-lg);
  letter-spacing: 0;
}

.card-body {
  padding: 14px 6px 8px;
}

.game-name {
  font-weight: 700;
  color: var(--color-kawaii-ink);
  margin-bottom: 4px;
  font-size: 1.05rem;
  letter-spacing: 0;
}

.game-desc {
  font-size: 0.83rem;
  color: #6b5560;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  gap: 12px;
  padding: 10px 6px 4px;
  margin-top: 8px;
  border-top: 2px dashed rgba(31, 23, 28, 0.16);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #5d4651;
  font-size: 0.88rem;
  font-weight: 700;
}
</style>
