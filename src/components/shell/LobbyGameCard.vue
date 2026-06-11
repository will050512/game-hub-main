<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { GameInfo } from '@/types'
import GameCard from '@/components/GameCard.vue'
import { iconForGame } from '@/data/iconManifest'

const props = defineProps<{
  game: GameInfo
  highScore: number
}>()

const emit = defineEmits<{
  click: []
}>()

const isFlipped = ref(false)
const isHovered = ref(false)
const tiltX = ref(0)
const tiltY = ref(0)
const cardStyle = ref<Record<string, string>>({})

const cardRef = ref<HTMLElement | null>(null)

// Badge logic
const badge = computed(() => {
  const daysSinceRelease = Math.floor((Date.now() - Date.now()) / (1000 * 60 * 60 * 24))
  if (daysSinceRelease <= 7) return { text: 'NEW', color: '#06b6d4' } as const
  if ((props.highScore ?? 0) > 10000) return { text: 'HOT', color: '#ef4444' } as const
  return null
})

// Track mouse for tilt effect
function handleMouseMove(e: MouseEvent): void {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width
  const y = (e.clientY - rect.top) / rect.height
  tiltX.value = (y - 0.5) * 12
  tiltY.value = (x - 0.5) * -12
}

function handleMouseLeave(): void {
  isHovered.value = false
  tiltX.value = 0
  tiltY.value = 0
  cardStyle.value = {}
}

function handleCardClick(): void {
  if (!isFlipped.value) {
    emit('click')
  }
}

function handleCardDblClick(): void {
  isFlipped.value = !isFlipped.value
}

onMounted(() => {
  const el = cardRef.value
  if (el) {
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
    el.addEventListener('dblclick', handleCardDblClick)
  }
})

onUnmounted(() => {
  const el = cardRef.value
  if (el) {
    el.removeEventListener('mousemove', handleMouseMove)
    el.removeEventListener('mouseleave', handleMouseLeave)
    el.removeEventListener('dblclick', handleCardDblClick)
  }
})
</script>

<template>
  <div
    class="lobby-game-card-wrapper"
    :style="{ '--game-color': game.color }"
    @mouseenter="isHovered = true"
  >
    <div
      ref="cardRef"
      class="lobby-game-card"
      :class="{ flipped: isFlipped, tilted: isHovered && !isFlipped }"
      :style="cardStyle"
      @click="handleCardClick"
    >
      <!-- Front Face -->
      <div class="card-face card-face--front">
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

        <!-- Flip hint -->
        <div class="flip-hint">雙擊翻轉查看詳情</div>
      </div>

      <!-- Back Face -->
      <div class="card-face card-face--back" :style="{ borderColor: game.color }">
        <div class="back-content">
          <div class="back-title" :style="{ color: game.color }">{{ game.name }}</div>
          <p class="back-description">{{ game.description }}</p>
          <div class="back-meta">
            <div class="meta-item">
              <KawaiiIcon name="trophy" size="sm" />
              <span>最高分 {{ highScore.toLocaleString() }}</span>
            </div>
            <div class="meta-item">
              <KawaiiIcon name="tag" size="sm" />
              <span>{{ game.category }}</span>
            </div>
          </div>
          <button class="back-play-btn" :style="{ background: game.color, borderColor: game.color }" @click.stop="emit('click')">
            <KawaiiIcon name="play" size="sm" />
            立即遊玩
          </button>
        </div>
      </div>
    </div>

    <!-- Reflection -->
    <div class="card-reflection" :style="{ background: game.color }"></div>
  </div>
</template>

<style scoped>
.lobby-game-card-wrapper {
  position: relative;
  border-radius: var(--radius-2xl);
  overflow: visible;
  perspective: 1200px;
  transition: transform var(--duration-slow) var(--ease-bounce);
}

.lobby-game-card {
  position: relative;
  width: 100%;
  min-height: 320px;
  transform-style: preserve-3d;
  transition: transform var(--duration-slow) var(--ease-bounce), filter var(--duration-normal) var(--ease-out);
  will-change: transform;
}

/* 3D Tilt */
.lobby-game-card.tilted {
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1.03);
}

/* Flip */
.lobby-game-card.flipped {
  transform: rotateY(180deg);
}

/* Card Faces */
.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  border: 2px solid var(--color-border);
  background: var(--color-gradient-card);
  box-shadow: var(--shadow-card);
}

.card-face--back {
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.back-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  max-width: 280px;
}

.back-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
  font-family: var(--font-family-heading);
  margin: 0;
}

.back-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}

.back-meta {
  display: flex;
  gap: var(--space-4);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.back-play-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-base);
  border: 2px solid;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-bounce);
  font-family: var(--font-family-heading);
}

.back-play-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

/* Front Face */
.card-face--front {
  display: flex;
  flex-direction: column;
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
              height var(--duration-normal) var(--ease-elastic),
              width var(--duration-normal) var(--ease-out);
  z-index: 1;
  pointer-events: none;
}

/* Glow bar expands on hover */
.lobby-game-card-wrapper:hover .category-glow {
  opacity: 1;
  height: calc(100% - 16px);
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

.flip-hint {
  position: absolute;
  bottom: -18px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity var(--duration-fast) ease;
  white-space: nowrap;
  pointer-events: none;
}

.lobby-game-card-wrapper:hover .flip-hint {
  opacity: 0.7;
}

/* Reflection */
.card-reflection {
  position: absolute;
  bottom: -4px;
  left: 10%;
  width: 80%;
  height: 12px;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(8px);
  transform: scaleY(0.3);
  transition: opacity var(--duration-normal) ease;
  pointer-events: none;
}

.lobby-game-card-wrapper:hover .card-reflection {
  opacity: 0.3;
}

/* Wrapper Hover Effect */
.lobby-game-card-wrapper:hover {
  filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--game-color, #6366f1) 30%, transparent));
}

.lobby-game-card-wrapper:active {
  transform: scale(0.98);
}

/* Staggered entrance */
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
@media (max-width: 768px) {
  .lobby-game-card {
    min-height: 280px;
  }

  .card-body {
    padding: var(--space-2) var(--space-3) var(--space-1);
  }

  .game-name {
    font-size: 0.95rem;
  }

  .flip-hint {
    display: none;
  }

  .card-face--back {
    padding: var(--space-4);
  }

  .back-meta {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>
