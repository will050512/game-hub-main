<script setup lang="ts">
import { computed } from 'vue'
import type { GameInfo } from '@/types'
import { iconForGame } from '@/data/iconManifest'

const props = defineProps<{
  game: GameInfo
  highScore: number
}>()

const emit = defineEmits<{
  click: []
}>()

const badge = computed(() => {
  if ((props.highScore ?? 0) > 10000) return { text: 'HOT', color: '#ef4444' } as const
  return null
})
</script>

<template>
  <div class="lobby-game-card-wrapper">
    <div class="lobby-game-card" @click="emit('click')">
      <!-- Front Face Only -->
      <div class="card-face">
        <!-- Category Glow Bar -->
        <div class="category-glow" :style="{ background: `linear-gradient(180deg, ${game.color}, transparent)` }"></div>

        <!-- Badge -->
        <Transition name="badge-pop">
          <div v-if="badge" class="game-badge" :style="{ background: badge.color, borderColor: badge.color }">
            {{ badge.text }}
          </div>
        </Transition>

        <!-- Thumbnail Area -->
        <div class="card-thumbnail" :style="{ backgroundColor: game.color }">
          <img
            v-if="game.thumbnail"
            :src="game.thumbnail"
            :alt="game.name"
            class="thumbnail-img"
          />
          <KawaiiIcon
            v-else
            :name="iconForGame(game.id, game.category)"
            size="xl"
            class="thumbnail-icon"
          />
          <span class="category-badge">{{ game.category }}</span>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <div class="game-name">{{ game.name }}</div>
          <div class="game-desc">{{ game.description }}</div>
        </div>

        <!-- Footer with high score -->
        <div class="card-footer">
          <span class="stat stat--score">
            <KawaiiIcon name="trophy" size="sm" />
            <span class="score-value">{{ highScore.toLocaleString() }}</span>
          </span>
          <span class="play-hint">
            <KawaiiIcon name="controller" size="sm" /> 點擊開始
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-game-card-wrapper {
  position: relative;
  border-radius: var(--radius-2xl);
  overflow: hidden;
}

.lobby-game-card {
  position: relative;
  width: 100%;
  min-height: 320px;
  transition: transform var(--duration-base) var(--ease-out);
  cursor: pointer;
}

.lobby-game-card-wrapper:hover .lobby-game-card {
  transform: translateY(-6px);
}

.lobby-game-card-wrapper:active .lobby-game-card {
  transform: scale(0.98) translateY(0);
}

/* Card Face */
.card-face {
  position: relative;
  border-radius: var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-sm);
  overflow: hidden;
  background: var(--color-gradient-card);
  box-shadow: 0 0 0 2px var(--color-border-light), 0 8px 0 var(--color-border);
  display: flex;
  flex-direction: column;
}

.lobby-game-card-wrapper:hover .card-face {
  box-shadow: 0 0 0 2px var(--color-border-light), 0 12px 0 var(--color-border), 0 16px 32px rgba(0,0,0,0.15);
}

/* Category Glow Bar */
.category-glow {
  position: absolute;
  top: 0;
  left: -3px;
  width: 5px;
  height: 100%;
  opacity: 0.6;
  border-radius: var(--radius-xl) 0 0 var(--radius-xl);
  transition: opacity var(--duration-normal) var(--ease-out),
              width var(--duration-normal) var(--ease-out);
  z-index: 1;
  pointer-events: none;
}

.lobby-game-card-wrapper:hover .category-glow {
  opacity: 1;
  width: 6px;
}

/* Badge */
.game-badge {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  z-index: 5;
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: white;
  border: 2px solid;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  text-transform: uppercase;
  font-family: var(--font-family-heading);
  pointer-events: none;
}

.badge-pop-enter-active, .badge-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-enter-from { opacity: 0; transform: scale(0) rotate(-15deg); }
.badge-pop-leave-to { opacity: 0; transform: scale(0) rotate(15deg); }

/* Thumbnail */
.card-thumbnail {
  position: relative;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  border-bottom: 2px solid var(--color-border);
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.52), transparent 30%),
    linear-gradient(180deg, color-mix(in srgb, var(--game-color, #6366f1) 70%, white 30%) 0%, rgba(255, 249, 245, 0.84) 100%);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--duration-slower) var(--ease-out);
}

.lobby-game-card-wrapper:hover .thumbnail-img {
  transform: scale(1.08);
}

.thumbnail-icon {
  transform: scale(1.15) rotate(-4deg);
  transition: transform var(--duration-slow) var(--ease-bounce);
}

.lobby-game-card-wrapper:hover .thumbnail-icon {
  transform: scale(1.25) rotate(-8deg);
}

.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  background: rgba(255, 252, 246, 0.92);
  color: var(--color-kawaii-ink);
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  border: 2px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
  pointer-events: none;
}

/* Body */
.card-body {
  padding: var(--space-3) var(--space-4) var(--space-2);
}

.game-name {
  font-weight: 700;
  color: var(--color-kawaii-ink);
  margin-bottom: 4px;
  font-size: 1.05rem;
  letter-spacing: 0;
  font-family: var(--font-family-heading);
}

.game-desc {
  font-size: 0.8rem;
  color: #6b5560;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4) var(--space-3);
  margin-top: auto;
  border-top: 2px dashed rgba(31, 23, 28, 0.12);
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #5d4651;
}

.stat--score {
  color: var(--color-accent-dark);
}

.score-value {
  font-weight: 800;
  font-size: 0.9rem;
}

.play-hint {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Entrance animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.lobby-game-card-wrapper {
  animation: fadeInUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}

/* Responsive */
@media (max-width: 480px) {
  .lobby-game-card {
    min-height: 240px;
  }

  .card-thumbnail {
    aspect-ratio: 16 / 10;
  }

  .card-body {
    padding: var(--space-2) var(--space-3) var(--space-1);
  }

  .game-name {
    font-size: 0.9rem;
  }

  .game-desc {
    font-size: 0.75rem;
    -webkit-line-clamp: 1;
  }

  .card-footer {
    padding: var(--space-1) var(--space-3) var(--space-2);
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .lobby-game-card {
    min-height: 280px;
  }

  .card-body {
    padding: var(--space-2) var(--space-3) var(--space-1);
  }

  .game-name {
    font-size: 0.95rem;
  }
}
</style>
