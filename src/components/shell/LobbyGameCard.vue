<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { GameInfo } from '@/types'
import GameCard from '@/components/GameCard.vue'
import { iconForGame } from '@/data/iconManifest'
import { getGameIdentityColors, PARTICLE_CSS } from '@/composables/useGameIdentity'

const props = defineProps<{
  game: GameInfo
  highScore: number
}>()

const identity = computed(() => getGameIdentityColors(props.game.id))
const particle = computed(() => PARTICLE_CSS[identity.value.particle])
const particleCount = computed(() => {
  // More particles for certain types, fewer for subtle ones
  switch (identity.value.particle) {
    case 'firefly': return 3
    case 'sparkle': return 4
    case 'butterfly': return 2
    case 'cloud': return 2
    case 'star': return 3
    case 'leaf': return 3
    case 'petal': return 3
    case 'bubble': return 3
    case 'steam': return 2
    case 'confetti': return 5
  }
  return 3
})

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
    :style="{
      '--game-color': game.color,
      '--game-ui-surface': identity.surface,
      '--game-ui-accent': identity.accent,
      '--game-particle-character': particle.character,
      '--game-particle-color': particle.color,
      '--game-particle-size': particle.size + 'px',
      '--game-particle-anim': particle.animation,
    }"
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

    <!-- Ambient particle decorations -->
    <div class="card-particles" aria-hidden="true">
      <span
        v-for="i in particleCount"
        :key="i"
        :class="['card-particle', `p-${i}`]"
        :style="{ '--p-delay': `-${i * 2.3}s` }"
      >{{ particle.character }}</span>
    </div>
  </div>
</template>

<style scoped>
.lobby-game-card-wrapper {
  position: relative;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  perspective: 1200px;
  transition: transform var(--duration-slow) var(--ease-bounce);
}

.lobby-game-card {
  position: relative;
  width: 100%;
  min-height: 320px;
  transform-style: preserve-3d;
  transition: transform var(--duration-base) var(--ease-out), filter var(--duration-normal) var(--ease-out);
  will-change: transform;
}

/* 3D Tilt */
.lobby-game-card.tilted {
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1.03);
}

/* Hover Lift */
.lobby-game-card-wrapper:hover .lobby-game-card {
  transform: translateY(-6px);
}

.lobby-game-card-wrapper:hover .lobby-game-card.tilted {
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) scale(1.03) translateY(-6px);
}

.lobby-game-card-wrapper:hover .card-face {
  box-shadow: 0 0 0 2px var(--color-border-light), 0 12px 0 var(--color-border), 0 16px 32px rgba(0,0,0,0.15);
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
  border-radius: var(--radius-xl) var(--radius-sm) var(--radius-xl) var(--radius-sm);
  overflow: hidden;
  border: none;
  background: var(--color-gradient-card);
  box-shadow: 0 0 0 2px var(--color-border-light), 0 8px 0 var(--color-border);
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

/* Ambient Particle Decorations */
.card-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-out);
}

.lobby-game-card-wrapper:hover .card-particles {
  opacity: 0.35;
}

.card-particle {
  position: absolute;
  font-size: var(--game-particle-size, 4px);
  color: var(--game-particle-color, #fde68a);
  filter: blur(0.3px);
  will-change: transform;
}

.card-particle.p-1 { top: 12%; left: 8%;  animation: var(--game-particle-anim, particle-float) 4s ease-in-out var(--p-delay, 0s) infinite; }
.card-particle.p-2 { top: 70%; left: 85%; animation: var(--game-particle-anim, particle-float) 5s ease-in-out calc(var(--p-delay, 0s) - 1.6s) infinite; }
.card-particle.p-3 { top: 45%; left: 55%; animation: var(--game-particle-anim, particle-float) 3.5s ease-in-out calc(var(--p-delay, 0s) - 3.2s) infinite; }
.card-particle.p-4 { top: 20%; left: 75%; animation: var(--game-particle-anim, particle-float) 4.5s ease-in-out calc(var(--p-delay, 0s) - 0.8s) infinite; }
.card-particle.p-5 { top: 80%; left: 15%; animation: var(--game-particle-anim, particle-float) 3.8s ease-in-out calc(var(--p-delay, 0s) - 2.4s) infinite; }

/* Wrapper Hover Effect */
.lobby-game-card-wrapper:hover {
  filter: drop-shadow(0 8px 24px color-mix(in srgb, var(--game-color, #6366f1) 30%, transparent));
}

.lobby-game-card-wrapper:active {
  transform: scale(0.98);
}

/* ==================== Particle Keyframes ==================== */
@keyframes particle-float {
  0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  20% { opacity: 0.7; }
  50% { transform: translateY(-20px) translateX(8px) scale(1.1); }
  80% { opacity: 0.5; }
}
@keyframes particle-sparkle {
  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
  30% { transform: scale(1) rotate(90deg); opacity: 0.8; }
  60% { transform: scale(0.6) rotate(180deg); opacity: 0.4; }
  100% { transform: scale(0) rotate(270deg); opacity: 0; }
}
@keyframes particle-flutter {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
  20% { opacity: 0.6; }
  50% { transform: translate(15px, -18px) scale(0.9); }
  80% { transform: translate(-10px, -8px) scale(1.05); opacity: 0.3; }
}
@keyframes particle-drift {
  0%, 100% { transform: translateX(0) scale(1); opacity: 0; }
  30% { opacity: 0.3; }
  70% { transform: translateX(25px) scale(1.3); opacity: 0.15; }
}
@keyframes particle-twinkle {
  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
  40% { transform: scale(1.2) rotate(90deg); opacity: 0.7; }
  70% { transform: scale(0.5) rotate(180deg); opacity: 0.3; }
}
@keyframes particle-fall {
  0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
  20% { opacity: 0.5; }
  80% { opacity: 0.3; }
  100% { transform: translateY(30px) rotate(60deg); opacity: 0; }
}
@keyframes particle-rise {
  0% { transform: translateY(10px) scale(0); opacity: 0; }
  30% { transform: translateY(0) scale(1); opacity: 0.4; }
  100% { transform: translateY(-25px) scale(0.5); opacity: 0; }
}
@keyframes particle-confetti {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 0.6; }
  50% { transform: translateY(-15px) rotate(180deg); }
  80% { transform: translateY(-5px) rotate(360deg); opacity: 0.2; }
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

  .flip-hint {
    display: none;
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
