<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { KawaiiIconId } from '@/data/iconManifest'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import KawaiiDecorLayer from '@/components/KawaiiDecorLayer.vue'
import AmbientParticles from '@/components/AmbientParticles.vue'

const props = defineProps<{
  gamesCount: number
  level: number
  levelTitle: string
  xpPercent: number
  gamesPlayed: number
  unlockedCount: number
}>()

const emit = defineEmits<{
  'show-quests': []
  'mascot-click': []
}>()

const isHovered = ref(false)
const mascotWave = ref(false)
const sparkleVisible = ref(false)
let sparkleTimeout: ReturnType<typeof setTimeout>

function triggerSparkle(): void {
  sparkleVisible.value = true
  mascotWave.value = true
  clearTimeout(sparkleTimeout)
  sparkleTimeout = setTimeout(() => {
    sparkleVisible.value = false
    mascotWave.value = false
  }, 1500)
}

function handleMascotClick(): void {
  emit('mascot-click')
  triggerSparkle()
}

// Floating badge animation positions
const badgePositions = computed(() => {
  return [
    { top: '12%', left: '8%', delay: '0s' },
    { top: '20%', right: '12%', delay: '-1.5s' },
    { bottom: '15%', left: '5%', delay: '-3s' },
    { top: '18%', right: '6%', delay: '-4s' },
  ]
})

onMounted(() => {
  // Auto sparkle on mount for first impression
  setTimeout(() => triggerSparkle(), 800)
})

onUnmounted(() => {
  clearTimeout(sparkleTimeout)
})
</script>

<template>
  <section class="hero-section" aria-label="遊戲中心首頁">
    <!-- Decorative Layer -->
    <KawaiiDecorLayer mood="playful" />

    <!-- Ambient Particles -->
    <AmbientParticles :count="20" :speed="0.3" />

    <!-- Floating Decorative Elements -->
    <div class="hero-floaters" aria-hidden="true">
      <div
        v-for="(pos, i) in badgePositions"
        :key="i"
        class="floater"
        :class="`floater-${i + 1}`"
        :style="{ '--anim-delay': pos.delay }"
        v-bind="pos"
      >
        <KawaiiIcon
  :name="['star', 'heart', 'sparkle', 'star'][i] as KawaiiIconId"
          size="sm"
          class="floater-icon"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div class="hero-content" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
      <!-- Mascot -->
      <div class="mascot-area">
        <button
          type="button"
          class="mascot-bubble"
          :class="{ waving: mascotWave, sparkling: sparkleVisible }"
          @click="handleMascotClick"
          aria-label="點擊吉祥物"
        >
          <div class="mascot-inner">
            <KawaiiIcon name="heart" size="lg" class="mascot-icon" />
          </div>
          <!-- Wave arms -->
          <div class="mascot-arm-left" :class="{ wave: mascotWave }"></div>
          <div class="mascot-arm-right" :class="{ wave: mascotWave }"></div>
          <!-- Sparkle burst -->
          <Transition name="sparkle-fade">
            <div v-if="sparkleVisible" class="sparkle-burst">
              <KawaiiIcon name="sparkle" size="sm" class="sparkle-particle" />
              <KawaiiIcon name="star" size="sm" class="sparkle-particle" />
              <KawaiiIcon name="sparkle" size="xs" class="sparkle-particle" />
              <KawaiiIcon name="star" size="xs" class="sparkle-particle" />
            </div>
          </Transition>
        </button>
      </div>

      <!-- Title -->
      <div class="title-area">
        <h1 class="hero-title">
          <span class="title-line welcome-text">Welcome to</span>
          <span class="title-main hero-brand">
            <span class="brand-glow"></span>
            Game Hub
          </span>
        </h1>
        <p class="hero-subtitle">
          <span class="game-count-badge">{{ gamesCount }}</span>
          <span>款遊戲等你來挑戰</span>
        </p>
      </div>
    </div>

    <!-- Player Stats Row -->
    <div class="hero-stats">
      <!-- Level Card (clickable to show quests) -->
      <button
        class="stat-card stat-card--level"
        @click="emit('show-quests')"
        aria-label="查看每日任務"
      >
        <div class="stat-card__icon-wrap">
          <KawaiiIcon name="star" size="md" class="stat-icon" />
          <div class="level-ring">
            <svg viewBox="0 0 36 36" class="xp-ring">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="url(#xpGradient)"
                stroke-width="2.5"
                stroke-dasharray="100"
                :stroke-dashoffset="100 - xpPercent"
                stroke-linecap="round"
                class="xp-ring__fill"
              />
              <defs>
                <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="var(--color-primary)" />
                  <stop offset="50%" stop-color="var(--color-accent)" />
                  <stop offset="100%" stop-color="var(--color-secondary)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div class="stat-card__info">
          <span class="stat-value stat-value--level">Lv.{{ level }}</span>
          <span class="stat-title">{{ levelTitle }}</span>
          <div class="xp-bar">
            <div class="xp-fill" :style="{ width: xpPercent + '%' }" />
          </div>
        </div>
        <span class="stat-card__hover-glow"></span>
      </button>

      <!-- Games Played -->
      <div class="stat-card" aria-label="已遊玩場次">
        <div class="stat-card__icon-wrap">
          <KawaiiIcon name="controller" size="md" class="stat-icon" />
        </div>
        <div class="stat-card__info">
          <span class="stat-value">{{ gamesPlayed }}</span>
          <span class="stat-label">已遊玩</span>
        </div>
      </div>

      <!-- Achievements -->
      <div class="stat-card" aria-label="成就解鎖數">
        <div class="stat-card__icon-wrap">
          <KawaiiIcon name="trophy" size="md" class="stat-icon" />
        </div>
        <div class="stat-card__info">
          <span class="stat-value">{{ unlockedCount }}</span>
          <span class="stat-label">成就</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  margin-bottom: var(--space-10);
  padding: var(--space-10) var(--space-8) var(--space-8);
  border: 2px solid var(--color-kawaii-ink);
  border-radius: var(--radius-3xl);
  background: var(--color-gradient-hero);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

/* Allow hero to shrink on short screens instead of forcing overflow */
@media (max-height: 500px) {
  .hero-section {
    margin-bottom: var(--space-6);
    padding: var(--space-6) var(--space-4) var(--space-4);
    gap: var(--space-4);
  }

  .title-main {
    font-size: var(--font-size-2xl) !important;
  }

  .hero-stats {
    gap: var(--space-2);
  }

  .stat-card {
    padding: var(--space-2);
    gap: var(--space-2);
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    padding: 5px;
  }
}

/* ==================== Hero Content ==================== */
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  max-width: 28rem;
  width: 100%;
}

/* Mascot Bubble */
.mascot-area {
  position: relative;
  margin-bottom: var(--space-1);
}

.mascot-bubble {
  position: relative;
  width: 80px;
  height: 80px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--duration-slow) var(--ease-bounce);
}

.mascot-bubble:hover {
  transform: translateY(-6px) scale(1.05);
}

.mascot-bubble.waving {
  animation: mascot-bounce 0.6s ease-in-out;
}

.mascot-bubble.sparkling .mascot-icon {
  filter: drop-shadow(0 0 12px var(--color-accent)) drop-shadow(0 0 24px var(--color-secondary));
}

.mascot-inner {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 8px 0 rgba(38, 27, 34, 0.08)) drop-shadow(0 12px 16px rgba(38, 27, 34, 0.12));
}

.mascot-icon {
  animation: mascot-idle-bob 2.5s ease-in-out infinite;
}

.mascot-arm-left,
.mascot-arm-right {
  position: absolute;
  width: 14px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-kawaii-warm-paper);
  border: 2px solid var(--color-kawaii-ink);
  z-index: 1;
  transition: transform 0.3s ease;
}

.mascot-arm-left {
  left: 2px;
  top: 22px;
  transform-origin: top center;
  transform: rotate(15deg);
}

.mascot-arm-right {
  right: 2px;
  top: 22px;
  transform-origin: top center;
  transform: rotate(-15deg);
}

.mascot-arm-left.wave {
  animation: arm-wave-left 0.6s ease-in-out;
}

.mascot-arm-right.wave {
  animation: arm-wave-right 0.6s ease-in-out;
}

/* Sparkle Burst */
.sparkle-burst {
  position: absolute;
  inset: -20px;
  z-index: 3;
  pointer-events: none;
}

.sparkle-particle {
  position: absolute;
  animation: sparkle-spin 1s ease-in-out infinite;
}

.sparkle-particle:nth-child(1) { top: -10px; left: 50%; transform: translateX(-50%); animation-delay: 0s; }
.sparkle-particle:nth-child(2) { top: 50%; right: -10px; animation-delay: 0.2s; }
.sparkle-particle:nth-child(3) { bottom: -10px; left: 30%; animation-delay: 0.4s; }
.sparkle-particle:nth-child(4) { bottom: -10px; right: 30%; animation-delay: 0.6s; }

.sparkle-fade-enter-active, .sparkle-fade-leave-active {
  transition: opacity 0.3s ease;
}
.sparkle-fade-enter-from, .sparkle-fade-leave-to {
  opacity: 0;
}

/* Title Area */
.title-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.hero-title {
  margin: 0;
  line-height: var(--line-height-tight);
}

.title-line {
  display: block;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.title-main {
  display: block;
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-black);
  position: relative;
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-accent-dark), var(--color-secondary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-glow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(ellipse at center, var(--color-primary-alpha), transparent 70%);
  filter: blur(12px);
  opacity: 0.5;
  z-index: -1;
  animation: brand-glow-pulse 3s ease-in-out infinite;
}

.hero-subtitle {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.game-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  padding: 0.15rem 0.6rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-black);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-kawaii-ink);
  box-shadow: var(--shadow-sm);
}

/* ==================== Floating Decorations ==================== */
.hero-floaters {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.floater {
  position: absolute;
  animation: floater-float 6s ease-in-out infinite;
  opacity: 0.6;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.floater-icon {
  color: var(--color-accent);
  animation: floater-icon-spin 8s linear infinite;
}

.floater-1 { top: 8%; left: 6%; }
.floater-2 { top: 15%; right: 8%; animation-delay: -1.5s; }
.floater-3 { bottom: 12%; left: 4%; animation-delay: -3s; }
.floater-4 { top: 10%; right: 4%; animation-delay: -4.5s; }

/* ==================== Stats Cards ==================== */
.hero-stats {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  max-width: 48rem;
  width: 100%;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-4);
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--duration-slow) var(--ease-bounce);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  font-family: var(--font-family-heading);
}

.stat-card:hover {
  border-color: var(--color-primary-dark);
  transform: translateY(-6px) scale(1.02);
  box-shadow: var(--shadow-float);
}

.stat-card:active {
  transform: scale(0.98) translateY(0);
}

.stat-card__icon-wrap {
  position: relative;
  flex-shrink: 0;
}

.stat-icon {
  width: 42px;
  height: 42px;
  padding: 7px;
  border: 2px solid var(--color-kawaii-ink);
  border-radius: var(--radius-lg);
  background: var(--color-kawaii-butter-main);
  box-shadow: var(--shadow-sm);
}

/* XP Ring (Level Card) */
.level-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  animation: ring-rotate 8s linear infinite;
}

.xp-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.xp-ring__fill {
  transition: stroke-dashoffset 0.5s ease;
}

.stat-card--level {
  border-color: var(--color-primary);
  background: linear-gradient(135deg, rgba(142, 207, 173, 0.12), rgba(245, 168, 194, 0.08));
}

.stat-card--level:hover {
  border-color: var(--color-primary-dark);
  box-shadow: 0 0 20px var(--color-primary-alpha), var(--shadow-float);
}

.stat-card__info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  line-height: 1;
}

.stat-value--level {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.xp-bar {
  width: 100%;
  height: 6px;
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-1);
  border: 1px solid var(--color-border-subtle);
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-secondary));
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px var(--color-primary-alpha);
}

.stat-card__hover-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-primary-alpha) 0%, transparent 60%);
  opacity: 0;
  transition: opacity var(--duration-normal) ease;
  pointer-events: none;
  z-index: 0;
}

.stat-card:hover .stat-card__hover-glow {
  opacity: 1;
}

.stat-card__info,
.stat-card__icon-wrap {
  position: relative;
  z-index: 1;
}

/* ==================== Animations ==================== */
@keyframes mascot-bounce {
  0% { transform: translateY(0) scale(1); }
  20% { transform: translateY(-16px) scale(1.08); }
  40% { transform: translateY(-4px) scale(1.04); }
  60% { transform: translateY(-8px) scale(1.06); }
  80% { transform: translateY(-2px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes mascot-idle-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-6px) rotate(1deg); }
}

@keyframes arm-wave-left {
  0%, 100% { transform: rotate(15deg); }
  25% { transform: rotate(-30deg) translateX(-4px); }
  50% { transform: rotate(15deg); }
  75% { transform: rotate(-20deg) translateX(-2px); }
}

@keyframes arm-wave-right {
  0%, 100% { transform: rotate(-15deg); }
  25% { transform: rotate(30deg) translateX(4px); }
  50% { transform: rotate(-15deg); }
  75% { transform: rotate(20deg) translateX(2px); }
}

@keyframes sparkle-spin {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  30% { transform: scale(1.2) rotate(120deg); opacity: 1; }
  100% { transform: scale(0.5) rotate(360deg); opacity: 0; }
}

@keyframes brand-glow-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes floater-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-12px) rotate(5deg); }
  50% { transform: translateY(-4px) rotate(-3deg); }
  75% { transform: translateY(-16px) rotate(2deg); }
}

@keyframes floater-icon-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==================== Responsive ==================== */

/* Landscape phones / short viewports - reduce hero to fit */
@media (max-height: 480px) {
  .hero-section {
    min-height: auto !important;
    padding: var(--space-4) var(--space-4) var(--space-3);
    margin-bottom: var(--space-6);
    gap: var(--space-3);
  }

  .mascot-area {
    margin-bottom: 0;
  }

  .mascot-bubble {
    width: 56px !important;
    height: 56px !important;
  }

  .title-area {
    gap: var(--space-1);
  }

  .hero-title {
    font-size: var(--font-size-2xl) !important;
  }

  .title-line {
    font-size: var(--font-size-sm) !important;
  }

  .hero-subtitle {
    font-size: var(--font-size-sm) !important;
  }

  .hero-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2);
  }

  .stat-card {
    padding: var(--space-2) var(--space-2);
    gap: var(--space-2);
  }

  .stat-icon {
    width: 28px !important;
    height: 28px !important;
    padding: 4px !important;
  }

  .stat-value {
    font-size: var(--font-size-base) !important;
  }

  .stat-label,
  .stat-title {
    font-size: var(--font-size-xs) !important;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-6) var(--space-4) var(--space-6);
    min-height: auto;
  }

  .title-main {
    font-size: var(--font-size-3xl) !important;
  }

  .hero-stats {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .stat-card {
    padding: var(--space-3) var(--space-3);
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    font-size: 1.25rem;
  }

  .mascot-bubble {
    width: 64px;
    height: 64px;
  }

  .game-count-badge {
    font-size: var(--font-size-base);
  }
}

@media (min-width: 1200px) {
  .hero-section {
    padding: var(--space-12) var(--space-12) var(--space-10);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .mascot-icon,
  .floater-icon,
  .brand-glow,
  .xp-ring {
    animation: none !important;
  }

  .stat-card,
  .mascot-bubble {
    transition: none;
  }
}
</style>
