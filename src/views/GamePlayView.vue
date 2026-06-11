<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGameById, getGameManifestById, resolveGameFactoryById } from '@/games/registry'
import { iconForGame } from '@/data/iconManifest'
import { useCurrencyStore } from '@/stores/currencyStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useSoundManager } from '@/composables/useSoundManager'
import { useGamePlatformLayout, type SafeAreaInsets } from '@/composables/useGamePlatformLayout'
import AudioMixerPanel from '@/components/settings/AudioMixerPanel.vue'
import DoodleCard from '@/components/DoodleCard.vue'
import HudBar from '@/components/HudBar.vue'
import InputAffordance from '@/components/InputAffordance.vue'
import KawaiiDecorLayer from '@/components/KawaiiDecorLayer.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import TutorialOverlay from '@/components/TutorialOverlay.vue'
import type { GameId } from '@/types'
import type { PlayerStats, UpgradeOption, GameInstance, GameHudData, ActiveBuff, ItemSlot, ResultPayloadContract } from '@/types'

const props = defineProps<{ id: string }>()
const router = useRouter()
const currencyStore = useCurrencyStore()
const playerStore = usePlayerStore()
const game = computed(() => getGameById(props.id))
const manifest = computed(() => getGameManifestById(props.id))
const gameId = computed(() => (manifest.value?.gameId ?? props.id) as GameId)
const shellError = ref<string | null>(null)
const showStartingOverlay = ref(true)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isPaused = ref(false)
const isGameOver = ref(false)
const finalScore = ref(0)
const showUpgrade = ref(false)
const upgradeOptions = ref<UpgradeOption[]>([])
let upgradeResolver: ((picked: UpgradeOption) => void) | null = null

const stats = ref<PlayerStats>({
  hp: 100,
  maxHp: 100,
  level: 1,
  xp: 0,
  xpToNext: 100,
  kills: 0,
  time: 0,
  score: 0,
})

const activeBuffs = ref<ActiveBuff[]>([])
const itemSlots = ref<ItemSlot[]>([])
const coinsEarned = ref(0)

const hudData = computed<GameHudData>(() => ({
  ...stats.value,
  activeBuffs: activeBuffs.value,
  itemSlots: itemSlots.value,
  currency: coinsEarned.value,
}))

let gameEngine: GameInstance | null = null
let lastAudioScore = 0
let lastAudioHp = stats.value.hp
let lastAudioKills = 0
let lastAudioLevel = stats.value.level
let lastScoreSfxAt = 0

const soundManager = useSoundManager()
const { layout: platformLayout, snapshot: platformSnapshot } = useGamePlatformLayout()
const joystickActive = ref(false)
const joystickOrigin = ref({ x: 0, y: 0 })
const isPixelArt = ref(true)
const showTutorial = ref(false)

function hasSafeArea(insets: SafeAreaInsets): boolean {
  return insets.top > 0 || insets.bottom > 0 || insets.left > 0 || insets.right > 0
}

const shellClasses = computed(() => [
  'game-screen',
  platformLayout.value.shellClass,
  `game-orientation-${platformLayout.value.orientation}`,
  {
    'game-platform-native': platformLayout.value.isNativePlatform,
    'game-platform-standalone': platformLayout.value.isStandalone,
    'game-has-safe-area': hasSafeArea(platformLayout.value.safeArea),
  },
])

function playScoreFeedback(score: number) {
  const now = Date.now()
  if (score > lastAudioScore && now - lastScoreSfxAt > 120) {
    void soundManager.playGameSfx('score')
    lastScoreSfxAt = now
  }
  lastAudioScore = score
}

function playStatsFeedback(next: PlayerStats) {
  playScoreFeedback(next.score)

  if (next.hp < lastAudioHp) {
    void soundManager.playGameSfx('hurt')
  }
  if (next.kills > lastAudioKills) {
    void soundManager.playGameSfx('hit')
  }
  if (next.level > lastAudioLevel) {
    void soundManager.playGameSfx('success')
  }

  lastAudioHp = next.hp
  lastAudioKills = next.kills
  lastAudioLevel = next.level
}

function setupTouchTracking(canvas: HTMLCanvasElement) {
  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    const width = rect.width
    const height = rect.height
    
    const isFireButton = x > width * 0.7 && y > height * 0.7
    if (!isFireButton) {
      joystickActive.value = true
      joystickOrigin.value = { x, y }
    }
  }

  const onTouchEnd = () => {
    joystickActive.value = false
  }

  canvas.addEventListener('touchstart', onTouchStart, { passive: true })
  canvas.addEventListener('touchend', onTouchEnd, { passive: true })
  canvas.addEventListener('touchcancel', onTouchEnd, { passive: true })

  return () => {
    canvas.removeEventListener('touchstart', onTouchStart)
    canvas.removeEventListener('touchend', onTouchEnd)
    canvas.removeEventListener('touchcancel', onTouchEnd)
  }
}

let touchCleanup: (() => void) | null = null

onMounted(async () => {
  shellError.value = null

  try {
    if (!game.value || !manifest.value) {
      throw new Error(`找不到 gameId: ${props.id}`)
    }
    if (!canvasRef.value) {
      throw new Error('遊戲畫布初始化失敗，請重新進入遊戲。')
    }

    const canvas = canvasRef.value
    canvas.width = canvas.clientWidth * window.devicePixelRatio
    canvas.height = canvas.clientHeight * window.devicePixelRatio

    touchCleanup = setupTouchTracking(canvas)

    const factory = await resolveGameFactoryById(props.id)
    gameEngine = factory()

    // Show tutorial overlay after game initializes
    if (game.value?.instructions && game.value.instructions.length > 0) {
      setTimeout(() => {
        showTutorial.value = true
      }, 800)
    }

    await soundManager.preloadGame(gameId.value)

    gameEngine.start(canvas, {
      onScoreUpdate: (score) => {
        stats.value.score = score
        playScoreFeedback(score)
      },
      onStatsUpdate: (s) => {
        playStatsFeedback(s)
        stats.value.hp = s.hp
        stats.value.maxHp = s.maxHp
        stats.value.level = s.level
        stats.value.xp = s.xp
        stats.value.xpToNext = s.xpToNext
        stats.value.kills = s.kills
        stats.value.time = s.time
        stats.value.score = s.score
      },
      onHudUpdate: (data) => {
        playStatsFeedback(data)
        stats.value = {
          hp: data.hp,
          maxHp: data.maxHp,
          level: data.level,
          xp: data.xp,
          xpToNext: data.xpToNext,
          kills: data.kills,
          time: data.time,
          score: data.score,
        }
        activeBuffs.value = data.activeBuffs
        itemSlots.value = data.itemSlots
      },
      onItemCollected: () => {
        void soundManager.playGameSfx('powerUp')
      },
      onCurrencyEarned: () => {
        void soundManager.playShellSfx('coinCollect')
      },
      onLevelUp: (options, resolve) => {
        void soundManager.playShellSfx('levelUp')
        showUpgrade.value = true
        upgradeOptions.value = options
        upgradeResolver = resolve
      },
      onPause: () => {
        soundManager.pause()
      },
      onResume: () => {
        soundManager.resume()
      },
      onRewardEvent: (event) => {
        void soundManager.playShellSfx('coinCollect')
        currencyStore.emitRewardEvent(event)
      },
      onGameOver: async (data) => {
        void soundManager.playShellSfx('gameOver')
        soundManager.pause()
        isGameOver.value = true
        const score = typeof data === 'number' ? data : data.score
        finalScore.value = score
        const resultPayload: Partial<ResultPayloadContract> = {
          score,
          kills: typeof data === 'object' ? data.kills : stats.value.kills,
          time: typeof data === 'object' ? data.time : stats.value.time,
          level: typeof data === 'object' ? data.level : stats.value.level,
        }
        const pendingRewardEvent = currencyStore.pendingRewardEvent
        const canUsePendingRewardEvent =
          pendingRewardEvent?.gameId === gameId.value && pendingRewardEvent.score === score
        if (!canUsePendingRewardEvent) {
          currencyStore.earnFromGame(gameId.value, resultPayload)
        }
        const settled = await currencyStore.settlePending(gameId.value)
        coinsEarned.value = settled
        await playerStore.incrementGamesPlayed()
      },
    })

    // Fade out the starting overlay after the game is ready
    setTimeout(() => {
      showStartingOverlay.value = false
    }, 800)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    shellError.value = `遊戲載入失敗：${reason}`
    console.error('[GameShell] Adapter resolution failed', { gameId: props.id, reason, error })
    soundManager.stopAll()
    gameEngine = null
  }
})

onUnmounted(() => {
  try {
    gameEngine?.stop()
  } catch (error) {
    console.error('[GameShell] Error stopping game engine', { gameId: props.id, error })
  }
  gameEngine = null
  touchCleanup?.()
  touchCleanup = null
  soundManager.dispose()
})

function togglePause() {
  void soundManager.playShellSfx('buttonClick')
  isPaused.value = !isPaused.value
  try {
    if (isPaused.value) {
      gameEngine?.pause()
    } else {
      gameEngine?.resume()
    }
  } catch (error) {
    console.error('[GameShell] Error toggling pause', { gameId: props.id, isPaused: isPaused.value, error })
  }
}

function goToResult() {
  router.push({
    name: 'game-result',
    params: { id: props.id },
    query: {
      score: (isGameOver.value ? finalScore.value : stats.value.score).toString(),
      kills: stats.value.kills.toString(),
      time: stats.value.time.toString(),
      level: stats.value.level.toString(),
      coins: coinsEarned.value.toString(),
    },
  })
}

function selectUpgrade(upgrade: UpgradeOption) {
  void soundManager.playShellSfx('buttonClick')
  showUpgrade.value = false
  upgradeResolver?.(upgrade)
  upgradeResolver = null
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div v-if="game" :class="shellClasses">
    <KawaiiDecorLayer class="play-decor" :category="game.category" mood="action" />

    <Transition name="fade">
      <div v-if="shellError" class="overlay error-overlay">
        <DoodleCard class="overlay-card" tone="paper" padding="lg">
          <h2>載入失敗</h2>
          <p class="gameover-subtitle">{{ shellError }}</p>
          <button class="btn btn-primary" @click="router.push({ name: 'game-info', params: { id: props.id } })">
            返回遊戲資訊
          </button>
          <button class="btn btn-secondary" @click="router.push({ name: 'lobby' })">
            返回大廳
          </button>
        </DoodleCard>
      </div>
    </Transition>

    <Transition name="game-start">
      <div v-if="showStartingOverlay" class="game-start-overlay">
        <div class="start-content">
          <div class="start-icon-wrapper">
            <KawaiiIcon :name="iconForGame(game.id, game.category)" size="xl" class="start-icon" />
          </div>
          <h2 class="start-title">{{ game.name }}</h2>
          <div class="start-loading">
            <span v-for="i in 3" :key="i" :class="['dot', `dot${i}`]" />
          </div>
        </div>
      </div>
    </Transition>

    <HudBar :stats="hudData" @toggle-pause="togglePause" />

    <div class="game-canvas-frame"
         :style="{
           paddingTop: platformLayout.safeArea.top + 'px',
           paddingBottom: platformLayout.safeArea.bottom + 'px',
           paddingLeft: platformLayout.safeArea.left + 'px',
           paddingRight: platformLayout.safeArea.right + 'px',
         }">
      <canvas ref="canvasRef" class="game-canvas"></canvas>
    </div>

    <InputAffordance
      v-if="manifest"
      :input-modes="manifest.inputModes"
      :game-id="gameId"
      :is-joystick-active="joystickActive"
      :joystick-origin="joystickOrigin"
      :show-visual-controls="platformLayout.mode === 'handheld' || platformLayout.mode === 'tablet'"
    />

    <TutorialOverlay
      v-if="game?.instructions"
      :visible="showTutorial"
      :instructions="game.instructions"
      :auto-advance-ms="5000"
      :animation-duration="400"
      @close="showTutorial = false"
      @complete="showTutorial = false"
    />

    <Transition name="fade">
      <div v-if="isPaused && !isGameOver" class="overlay pause-overlay">
        <DoodleCard class="overlay-card" tone="paper" padding="lg">
          <h2>遊戲暫停</h2>
          <AudioMixerPanel compact />
          <button class="btn btn-primary" @click="togglePause">繼續遊戲</button>
          <button class="btn btn-secondary" @click="goToResult">結束遊戲</button>
        </DoodleCard>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="isGameOver" class="overlay gameover-overlay">
        <DoodleCard class="overlay-card" tone="paper" padding="lg">
          <h2 class="gameover-title">遊戲結束</h2>
          <div class="final-score">{{ finalScore }}</div>
          <p class="gameover-subtitle">
            遊玩 {{ formatTime(stats.time) }}
            <template v-if="stats.kills > 0"> | {{ stats.kills }}</template>
            <template v-if="stats.level > 1"> | Lv.{{ stats.level }}</template>
          </p>
          <div v-if="coinsEarned > 0" class="coins-earned"><KawaiiIcon name="coin" size="sm" /> +{{ coinsEarned }}</div>
          <button class="btn btn-primary" @click="goToResult">查看結果</button>
        </DoodleCard>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showUpgrade" class="overlay upgrade-overlay">
        <DoodleCard class="upgrade-panel" tone="paper" padding="lg">
          <h2 class="upgrade-title">升級！選擇一個強化</h2>
          <div class="upgrade-options">
            <button
              v-for="opt in upgradeOptions"
              :key="opt.id"
              :class="['upgrade-card', `rarity-${opt.rarity}`]"
              @click="selectUpgrade(opt)"
            >
              <KawaiiIcon name="upgrade" size="lg" class="upgrade-icon" />
              <span class="upgrade-name">{{ opt.name }}</span>
              <span class="upgrade-desc">{{ opt.description }}</span>
              <span class="upgrade-type">{{ opt.type }}</span>
            </button>
          </div>
        </DoodleCard>
      </div>
    </Transition>
  </div>

  <div v-else class="not-found">
    <DoodleCard class="overlay-card" tone="paper" padding="lg">
      <h2>找不到此遊戲</h2>
      <p class="gameover-subtitle">gameId：{{ props.id }} 尚未註冊於 canonical manifest。</p>
      <button class="btn btn-secondary" @click="router.push({ name: 'lobby' })">返回大廳</button>
    </DoodleCard>
  </div>
</template>

<style scoped>
/* === Game Start Overlay === */
.game-start-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(38, 27, 34, 0.78);
  backdrop-filter: blur(12px);
  z-index: 30;
}

.start-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.start-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 5px 5px 0 rgba(38, 27, 34, 0.22), 0 20px 40px rgba(38, 27, 34, 0.24);
  background: linear-gradient(135deg, var(--color-kawaii-butter-main), var(--color-kawaii-warm-main));
  border: 2px solid var(--color-kawaii-ink);
}

.start-icon {
  font-size: 3rem;
}

.start-title {
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-align: center;
  letter-spacing: 0.02em;
}

.start-loading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #a05424;
}

.dot.dot1 {
  animation: dotPulse 1.4s ease-in-out infinite 0s;
}

.dot.dot2 {
  animation: dotPulse 1.4s ease-in-out infinite 0.2s;
}

.dot.dot3 {
  animation: dotPulse 1.4s ease-in-out infinite 0.4s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.35;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* === game-start Transition === */
.game-start-enter-active,
.game-start-leave-active {
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.game-start-enter-from,
.game-start-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.game-start-enter-to,
.game-start-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* === Mobile-first (< 640px): full-screen canvas, HUD overlay === */
.game-screen {
  position: relative;
  width: 100%;
  height: calc(100dvh - var(--safe-top, 0px) - var(--safe-bottom, 0px));
  min-height: 100%;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(255, 246, 232, 0.16), transparent 32%),
    linear-gradient(180deg, #261b22 0%, #171219 100%);
}

.play-decor {
  opacity: 0.42;
  mix-blend-mode: normal;
}

.game-canvas-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.game-canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(38, 27, 34, 0.72);
  z-index: 20;
  backdrop-filter: blur(10px);
}

.overlay-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 260px;
  max-width: 90vw;
}

.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #000;
}

.gameover-title {
  font-size: 1.5rem;
  color: var(--color-secondary-dark);
}

.final-score {
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-accent-dark);
}

.gameover-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.coins-earned {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent-dark);
}

.btn {
  padding: 12px;
  border-radius: var(--radius-lg);
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  border: 2px solid rgba(31, 23, 28, 0.72);
  box-shadow: 0 10px 18px rgba(31, 23, 28, 0.12);
}

.btn-primary {
  background: linear-gradient(180deg, var(--color-primary-light) 0%, var(--color-primary) 100%);
  color: var(--color-kawaii-ink);
}

.btn-secondary {
  background: linear-gradient(180deg, var(--color-bg-card) 0%, var(--color-bg-secondary) 100%);
  color: var(--color-text-secondary);
}

.upgrade-panel {
  width: 90%;
  max-width: 400px;
}

.upgrade-title {
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #8b4c63;
}

.upgrade-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upgrade-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px;
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgba(255, 251, 246, 0.96), rgba(251, 236, 245, 0.92));
  border: 2px solid rgba(31, 23, 28, 0.72);
  color: #271b23;
  text-align: center;
  gap: 4px;
  transition: all 0.15s ease;
  box-shadow: 0 10px 20px rgba(31, 23, 28, 0.1);
}

.upgrade-card:active {
  transform: scale(0.97);
}

.rarity-common { border-color: #7aa1a8; }
.rarity-rare { border-color: #6ea8d6; }
.rarity-epic { border-color: #a288d9; }
.rarity-legendary { border-color: #d79e4b; }

.upgrade-icon {
  font-size: 1.5rem;
}

.upgrade-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.upgrade-desc {
  font-size: 0.8rem;
  color: #6f5964;
}

.upgrade-type {
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #8d7281;
  letter-spacing: 0.05em;
}

/* === Tablet (640px+): larger modal controls while preserving fullscreen canvas === */
@media (min-width: 640px) {
  .overlay-card {
    max-width: 400px;
  }

  .upgrade-panel {
    max-width: 480px;
  }

  .upgrade-options {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .upgrade-card {
    flex: 1 1 140px;
    max-width: 200px;
  }
}

/* === Desktop (1024px+): centered wide shell with side HUD when space allows === */
@media (min-width: 1024px) {
  .game-screen.game-layout-wide {
    display: flex;
    flex-direction: row;
    width: 100vw;
    max-width: none;
    margin: 0 auto;
  }

  .game-layout-wide .game-canvas-frame {
    flex: 1;
    min-width: 0;
    height: 100%;
    order: 0;
  }

  .game-layout-wide :deep(.hud-top) {
    position: static;
    order: 1;
    width: clamp(176px, 17vw, 220px);
    flex-shrink: 0;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 20px 16px;
    gap: 16px;
    background: var(--color-bg-card);
    border-left: 1px solid var(--color-border);
    overflow-y: auto;
    pointer-events: auto;
  }

  .game-layout-wide :deep(.hud-left) {
    min-width: unset;
    width: 100%;
  }

  .game-layout-wide :deep(.hud-right) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .game-layout-wide :deep(.stat-pill) {
    text-align: center;
  }

  .game-layout-wide :deep(.pause-btn) {
    align-self: center;
  }

  .upgrade-panel {
    max-width: 560px;
    padding: 32px 24px;
  }

  .upgrade-card {
    flex: 1 1 160px;
    max-width: 220px;
    padding: 18px;
  }

  .upgrade-card:hover {
    border-color: #5e9b7e;
    background: linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(231, 247, 240, 0.94));
  }
}

/* === Tablet Landscape (640px-1023px, landscape) === */
@media (min-width: 640px) and (max-width: 1023px) and (orientation: landscape) {
  .game-screen.game-layout-tablet.game-orientation-landscape {
    display: flex;
    flex-direction: row;
  }

  .game-layout-tablet.game-orientation-landscape .game-canvas-frame {
    flex: 1;
    min-width: 0;
  }

  .game-layout-tablet.game-orientation-landscape :deep(.hud-top) {
    position: static;
    width: clamp(140px, 15vw, 180px);
    flex-shrink: 0;
    order: 1;
    flex-direction: column;
    align-items: stretch;
    padding: 12px 10px;
    gap: 12px;
    background: var(--color-bg-card);
    border-left: 1px solid var(--color-border);
  }

  .game-layout-tablet.game-orientation-landscape .overlay {
    padding: var(--safe-top, 0px) var(--safe-right, 0px) var(--safe-bottom, 0px) var(--safe-left, 0px);
  }
}

/* === Phone Landscape (< 640px, landscape) === */
@media (max-width: 639px) and (orientation: landscape) {
  .game-screen.game-orientation-landscape {
    height: calc(100dvh - var(--safe-left, 0px) - var(--safe-right, 0px));
  }

  .game-layout-handheld.game-orientation-landscape .game-canvas-frame {
    padding-left: max(8px, var(--safe-left, 0px));
    padding-right: max(8px, var(--safe-right, 0px));
  }

  .game-layout-handheld.game-orientation-landscape .overlay {
    padding-left: var(--safe-left, 0px);
    padding-right: var(--safe-right, 0px);
  }
}

/* === Safe Area Aware Layout === */
.game-has-safe-area .game-canvas {
  /* Canvas content stays within safe area via parent padding */
}

.game-has-safe-area .overlay {
  padding-top: var(--safe-top, 0px);
  padding-bottom: var(--safe-bottom, 0px);
  padding-left: var(--safe-left, 0px);
  padding-right: var(--safe-right, 0px);
}
</style>
