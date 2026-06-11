<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import DoodleCard from '@/components/DoodleCard.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'

const props = withDefaults(defineProps<{
  instructions: string[]
  /** Whether the tutorial overlay is visible */
  visible: boolean
  /** Seconds before auto-advancing to next step (default: 5) */
  autoAdvanceMs?: number
  /** Step animation duration in ms (default: 400) */
  animationDuration?: number
}>(), {
  autoAdvanceMs: 5000,
  animationDuration: 400,
})

const emit = defineEmits<{
  close: []
  'step-change': [step: number]
  complete: []
}>()

const currentStep = ref(0)
const isAnimating = ref(false)
const progressWidth = ref(0)

let autoTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const totalSteps = computed(() => props.instructions.length)
const currentInstruction = computed(() => props.instructions[currentStep.value] ?? '')
const isLastStep = computed(() => currentStep.value >= totalSteps.value - 1)
const stepPercentage = computed(() => totalSteps.value > 0 ? ((currentStep.value + 1) / totalSteps.value) * 100 : 0)

function startAutoAdvance() {
  stopTimers()
  progressWidth.value = 0

  if (!props.visible || totalSteps.value <= 0) return

  const tickMs = 32
  const ticks = props.autoAdvanceMs / tickMs

  countdownTimer = setInterval(() => {
    progressWidth.value = Math.min(100, progressWidth.value + 100 / ticks)
  }, tickMs)

  autoTimer = setTimeout(() => {
    if (isLastStep.value) {
      complete()
    } else {
      advance()
    }
  }, props.autoAdvanceMs)
}

function stopTimers() {
  if (autoTimer) { clearTimeout(autoTimer); autoTimer = null }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

function advance() {
  if (isAnimating.value || isLastStep.value) return
  isAnimating.value = true
  stopTimers()

  setTimeout(() => {
    currentStep.value++
    emit('step-change', currentStep.value)
    isAnimating.value = false
    startAutoAdvance()
  }, props.animationDuration)
}

function complete() {
  stopTimers()
  emit('complete')
}

function skip() {
  stopTimers()
  emit('close')
}

function handleTap() {
  if (isLastStep.value) {
    complete()
  } else {
    advance()
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    currentStep.value = 0
    startAutoAdvance()
  } else {
    stopTimers()
  }
})

onMounted(() => {
  if (props.visible) {
    startAutoAdvance()
  }
})

onBeforeUnmount(() => {
  stopTimers()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="tutorial-fade">
      <div v-if="visible" class="tutorial-overlay" @click="handleTap">
        <div class="tutorial-backdrop" />

        <div class="tutorial-content">
          <!-- Progress bar -->
          <div class="tutorial-progress-track">
            <div class="tutorial-progress-fill" :style="{ width: `${progressWidth}%` }" />
          </div>

          <!-- Step card -->
          <Transition name="tutorial-slide" mode="out-in">
            <DoodleCard :key="currentStep" class="tutorial-card" tone="paper" padding="lg">
              <div class="tutorial-step-header">
                <div class="tutorial-step-badge">
                  <span class="step-number">{{ currentStep + 1 }}</span>
                  <span class="step-total">/{{ totalSteps }}</span>
                </div>
                <KawaiiIcon name="sparkle" size="sm" class="tutorial-sparkle" />
              </div>

              <p class="tutorial-instruction">{{ currentInstruction }}</p>

              <div class="tutorial-step-footer">
                <div class="step-dots">
                  <span
                    v-for="i in totalSteps"
                    :key="i"
                    :class="['dot', { active: i <= currentStep + 1 }]"
                  />
                </div>
                <button class="tutorial-skip-btn" @click.stop="skip">
                  跳過
                </button>
              </div>
            </DoodleCard>
          </Transition>

          <!-- Step navigation hint -->
          <div class="tutorial-hint">
            <span v-if="!isLastStep">點擊下一步驟</span>
            <span v-else>點擊開始遊戲</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(14, 10, 16, 0.6);
  backdrop-filter: blur(6px);
}

.tutorial-content {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* === Progress Track === */
.tutorial-progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  overflow: hidden;
}

.tutorial-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a78bfa, #38bdf8);
  border-radius: 999px;
  transition: width 32ms linear;
}

/* === Step Card === */
.tutorial-card {
  width: 100%;
  cursor: default;
}

.tutorial-step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.tutorial-step-badge {
  display: flex;
  align-items: baseline;
  gap: 2px;
  background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.3);
}

.step-number {
  font-size: 1.1rem;
}

.step-total {
  font-size: 0.8rem;
  opacity: 0.8;
}

.tutorial-sparkle {
  margin-left: auto;
  opacity: 0.6;
  animation: sparkle-spin 3s linear infinite;
}

@keyframes sparkle-spin {
  0%, 100% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
}

.tutorial-instruction {
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--color-kawaii-ink);
  text-align: center;
  margin: 0;
  padding: 0 8px;
  min-height: 3.2em;
}

.tutorial-step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  gap: 12px;
}

.step-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(32, 24, 31, 0.15);
  transition: all 0.3s ease;
}

.dot.active {
  background: linear-gradient(135deg, #a78bfa, #38bdf8);
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(167, 139, 250, 0.4);
}

.tutorial-skip-btn {
  padding: 6px 14px;
  border: 2px solid rgba(31, 23, 28, 0.4);
  border-radius: 999px;
  background: rgba(255, 252, 247, 0.8);
  color: var(--color-kawaii-ink);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tutorial-skip-btn:hover {
  background: rgba(255, 252, 247, 0.95);
  border-color: rgba(31, 23, 28, 0.6);
}

.tutorial-skip-btn:active {
  transform: scale(0.95);
}

/* === Navigation Hint === */
.tutorial-hint {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.05em;
  animation: hint-blink 2s ease-in-out infinite;
}

@keyframes hint-blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

/* === Transitions === */
.tutorial-fade-enter-active,
.tutorial-fade-leave-active {
  transition: opacity 0.3s ease;
}

.tutorial-fade-enter-from,
.tutorial-fade-leave-to {
  opacity: 0;
}

.tutorial-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tutorial-slide-leave-active {
  transition: all 0.2s ease-in;
}

.tutorial-slide-enter-from {
  transform: translateY(30px) scale(0.95);
  opacity: 0;
}

.tutorial-slide-leave-to {
  transform: translateY(-20px) scale(0.95);
  opacity: 0;
}

/* === Reduced Motion === */
@media (prefers-reduced-motion: reduce) {
  .tutorial-sparkle,
  .tutorial-hint {
    animation: none;
  }

  .tutorial-slide-enter-active,
  .tutorial-slide-leave-active {
    transition: opacity 0.15s ease;
  }

  .tutorial-slide-enter-from {
    transform: none;
  }
}

/* === Tablet === */
@media (min-width: 640px) {
  .tutorial-content {
    max-width: 480px;
  }

  .tutorial-instruction {
    font-size: 1.3rem;
  }
}
</style>
