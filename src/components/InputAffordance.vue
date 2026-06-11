<script setup lang="ts">
import { computed } from 'vue'
import { getGameOptimizationProfile } from '@/data/gameOptimizationProfiles'
import type { GameId, GameInputMode } from '@/types'
import type { TouchPatternKind } from '@/data/gameOptimizationProfiles'
import type { VirtualButtonConfig } from '@/components/VirtualButtons.vue'
import VirtualJoystick from '@/components/VirtualJoystick.vue'
import VirtualButtons from '@/components/VirtualButtons.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'

const props = defineProps<{
  inputModes: GameInputMode[]
  gameId?: GameId
  isJoystickActive: boolean
  joystickOrigin: { x: number; y: number }
  showVisualControls?: boolean
}>()

const emit = defineEmits<{
  'joystick-move': [moveX: number, moveY: number]
  'joystick-start': []
  'joystick-end': []
  'button-press': [action: string]
  'button-release': [action: string]
}>()

const showTouchControls = computed(() => props.inputModes.includes('touch'))
const showKeyboardHint = computed(() => props.inputModes.includes('keyboard'))
const profile = computed(() => (props.gameId ? getGameOptimizationProfile(props.gameId) : null))
const touchHints = computed(() => profile.value?.touchPattern.hints ?? ['觸控操作', '依畫面提示遊玩'])
const touchPrimary = computed(() => profile.value?.touchPattern.primary ?? '依畫面提示觸控操作')
const touchPattern = computed(() => profile.value?.touchPattern.kind ?? 'tap-timing')

const showVisualControls = computed(() => {
  if (!props.showVisualControls) return false
  return showTouchControls.value && (touchPattern.value !== 'tap-placement' && touchPattern.value !== 'tap-cell' && touchPattern.value !== 'tap-card' && touchPattern.value !== 'number-pad')
})

const showVirtualJoystick = computed(() => {
  const joystickPatterns: TouchPatternKind[] = ['joystick-action', 'horizontal-action']
  return showVisualControls.value && joystickPatterns.includes(touchPattern.value)
})

const showFireButton = computed(() => {
  return showVisualControls.value && profile.value?.touchPattern.showActionButton
})

const showDirectionalButtons = computed(() => {
  const swipePatterns: TouchPatternKind[] = ['directional-swipe', 'drag-horizontal']
  return showVisualControls.value && swipePatterns.includes(touchPattern.value)
})

const directionalButtons = computed<VirtualButtonConfig[]>(() => {
  if (!showDirectionalButtons.value) return []
  const isSwipe = touchPattern.value === 'directional-swipe'
  if (isSwipe) {
    return [
      { icon: 'shield' as const, action: 'rotate', label: '旋轉' },
    ]
  }
  return []
})

const actionButtons = computed<VirtualButtonConfig[]>(() => {
  const buttons: VirtualButtonConfig[] = []
  if (showFireButton.value) {
    buttons.push({
      icon: (profile.value?.featuredIcon ?? 'action') as string,
      action: 'fire',
      label: '開火',
      color: 'var(--color-secondary, #f5a8c2)',
    })
  }
  if (directionalButtons.value.length > 0) {
    buttons.push(...directionalButtons.value)
  }
  return buttons
})
</script>

<template>
  <div v-if="showTouchControls || showKeyboardHint" class="input-affordances">
    <!-- Virtual Joystick (handheld/tablet only) -->
    <VirtualJoystick
      v-if="showVirtualJoystick"
      position="bottom-left"
      size="md"
      @move="(moveX, moveY) => emit('joystick-move', moveX, moveY)"
      @start="emit('joystick-start')"
      @end="emit('joystick-end')"
    />

    <!-- Action Buttons (fire, etc.) -->
    <VirtualButtons
      v-if="actionButtons.length > 0"
      :buttons="actionButtons"
      position="bottom-right"
      @press="(action: string) => emit('button-press', action)"
      @release="(action: string) => emit('button-release', action)"
    />

    <!-- Legacy Joystick Indicator (when touch tracking origin is available) -->
    <div
      v-if="!showVisualControls && showTouchControls && showVirtualJoystick && isJoystickActive"
      class="joystick-indicator"
      :style="{
        left: `${joystickOrigin.x}px`,
        top: `${joystickOrigin.y}px`,
      }"
    >
      <div class="joystick-base">
        <div class="joystick-ripple"></div>
        <div class="joystick-core"></div>
      </div>
    </div>

    <!-- Legacy Fire Button Shell -->
    <div
      v-if="!showVisualControls && showTouchControls && profile?.touchPattern.showActionButton"
      class="fire-button-shell"
    >
      <KawaiiIcon :name="profile?.featuredIcon ?? 'action'" size="xl" class="fire-button-hint" />
    </div>

    <!-- Input Companion (hint bar) -->
    <div class="input-companion" aria-hidden="true">
      <div class="companion-header">
        <KawaiiIcon :name="profile?.featuredIcon ?? (showKeyboardHint ? 'keyboard' : 'controller')" size="xs" />
        <strong>{{ touchPrimary }}</strong>
      </div>
      <div class="companion-tags">
        <span v-for="hint in touchHints.slice(0, 2)" :key="hint">{{ hint }}</span>
        <span v-if="showKeyboardHint"><KawaiiIcon name="keyboard" size="xs" /> WASD</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-affordances {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}

.joystick-indicator {
  position: absolute;
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.joystick-base {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(circle, rgba(247, 231, 255, 0.7) 0%, rgba(230, 255, 248, 0.18) 100%);
  border: 3px solid var(--color-kawaii-ink);
  box-shadow:
    0 12px 24px rgba(32, 24, 31, 0.18),
    inset 0 0 0 5px rgba(255, 255, 255, 0.18);
  animation: pulse 1.5s ease-in-out infinite;
}

.joystick-ripple,
.joystick-core {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.joystick-ripple {
  inset: 12px;
  border: 2px dashed rgba(32, 24, 31, 0.22);
}

.joystick-core {
  inset: 24px;
  background: linear-gradient(180deg, rgba(248, 183, 212, 0.95), rgba(166, 218, 216, 0.95));
  border: 3px solid var(--color-kawaii-ink);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.fire-button-shell {
  position: absolute;
  bottom: 20%;
  right: 15%;
  width: 84px;
  height: 84px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 3px solid var(--color-kawaii-ink);
  background: linear-gradient(180deg, rgba(255, 250, 248, 0.72), rgba(252, 225, 242, 0.36));
  box-shadow: 0 14px 30px rgba(32, 24, 31, 0.18);
  animation: fadeInOut 2s ease-in-out infinite;
}

.fire-button-hint {
  font-size: 2.5rem;
  opacity: 0.72;
}

.input-companion {
  position: absolute;
  right: max(10px, env(safe-area-inset-right));
  top: clamp(72px, 10dvh, 112px);
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: min(250px, calc(100vw - 20px));
  max-width: 34vw;
  padding: 8px 10px;
  pointer-events: none;
  z-index: 14;
  border: 2px solid var(--color-kawaii-ink);
  border-radius: 14px;
  background: rgba(255, 252, 247, 0.54);
  color: var(--color-kawaii-ink);
  box-shadow: 0 8px 18px rgba(32, 24, 31, 0.12);
  backdrop-filter: blur(10px);
  opacity: 0.72;
}

.companion-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.companion-header strong {
  overflow: hidden;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.companion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.companion-tags span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 20px;
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(31, 23, 28, 0.08);
  font-size: 0.58rem;
  font-weight: 800;
  line-height: 1.1;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@media (min-width: 640px) {
  .input-companion {
    top: 82px;
  }
}

@media (max-width: 420px) {
  .input-companion {
    top: 86px;
    right: 8px;
    max-width: 180px;
    padding: 7px 8px;
  }

  .companion-tags span:nth-of-type(n + 2) {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .joystick-base,
  .fire-button-shell {
    animation: none;
  }
}
</style>
