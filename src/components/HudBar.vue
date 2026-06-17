<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import DoodleCard from '@/components/DoodleCard.vue'
import type { GameHudData } from '@/types'
import BuffIcon from '@/components/BuffIcon.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForItem } from '@/data/iconManifest'

const props = defineProps<{ stats: GameHudData }>()
const emit = defineEmits<{ 'toggle-pause': []; 'hp-change': [level: 'low' | 'normal'] }>()

const prevScore = ref(0)
const scoreDisplay = ref(0)
let scoreAnimFrame: number | null = null

function animateScore(target: number) {
  const diff = target - scoreDisplay.value
  if (Math.abs(diff) < 1) {
    scoreDisplay.value = target
    scoreAnimFrame = null
    return
  }
  scoreDisplay.value = scoreDisplay.value + Math.ceil(diff * 0.35)
  scoreAnimFrame = requestAnimationFrame(() => animateScore(target))
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const hasHpBar = computed(() => props.stats.maxHp > 0)
const hasXpBar = computed(() => props.stats.xpToNext > 0)
const isSimpleHud = computed(() => !hasHpBar.value)
const hpPercent = computed(() => {
  if (props.stats.maxHp <= 0) return 0
  return (props.stats.hp / props.stats.maxHp) * 100
})
const xpPercent = computed(() => {
  if (props.stats.xpToNext <= 0) return 0
  return (props.stats.xp / props.stats.xpToNext) * 100
})

const isLowHp = computed(() => {
  if (props.stats.maxHp <= 0) return false
  return props.stats.hp / props.stats.maxHp < 0.25
})

onMounted(() => {
  scoreDisplay.value = props.stats.score
  prevScore.value = props.stats.score
})

onBeforeUnmount(() => {
  if (scoreAnimFrame) cancelAnimationFrame(scoreAnimFrame)
})

let lastWatchedScore = -1
watch(
  () => props.stats.score,
  (newScore) => {
    if (newScore !== lastWatchedScore) {
      lastWatchedScore = newScore
      animateScore(newScore)
    }
  }
)

watch(
  () => props.stats.hp,
  () => {
    emit('hp-change', isLowHp.value ? 'low' : 'normal')
  }
)
</script>

<template>
  <div class="hud-top">
    <div class="hud-left">
      <DoodleCard v-if="hasHpBar" class="hud-panel bar-panel" tone="night" padding="sm">
        <div class="hp-bar" :class="{ 'low-hp': isLowHp }">
          <div class="hp-bg-pattern"></div>
          <div class="hp-fill" :style="{ width: hpPercent + '%' }" />
          <span class="hp-text">{{ stats.hp }}/{{ stats.maxHp }}</span>
        </div>
      </DoodleCard>
      <DoodleCard v-if="hasHpBar && hasXpBar" class="hud-panel bar-panel" tone="night" padding="sm">
        <div class="xp-bar">
          <div class="xp-bg-pattern"></div>
          <div class="xp-fill" :style="{ width: xpPercent + '%' }" />
          <span class="xp-text">Lv.{{ stats.level }}</span>
        </div>
      </DoodleCard>
      <DoodleCard v-if="isSimpleHud" class="hud-panel simple-hud-left" tone="night" padding="sm">
        <KawaiiIcon v-for="i in stats.hp" :key="i" name="heart" size="xs" class="life-dot" />
        <span class="stat-pill">Lv.{{ stats.level }}</span>
      </DoodleCard>
    </div>

    <div class="hud-right">
      <DoodleCard class="stat-pill doodle-pill" tone="night" padding="sm">
        <KawaiiIcon name="timer" size="xs" />
        {{ formatTime(stats.time) }}
      </DoodleCard>
      <DoodleCard v-if="stats.kills > 0" class="stat-pill doodle-pill" tone="night" padding="sm">
        <KawaiiIcon name="skull" size="xs" />
        {{ stats.kills }}
      </DoodleCard>
      <DoodleCard class="stat-pill doodle-pill score-pill" tone="night" padding="sm">
        <span class="score-value">{{ scoreDisplay.toLocaleString() }}</span>
      </DoodleCard>
      <button class="pause-btn" data-testid="pause-game-btn" aria-label="暫停遊戲" @click="emit('toggle-pause')">
        <span class="pause-symbol"></span>
      </button>
    </div>

    <div v-if="stats.itemSlots.length > 0" class="hud-items">
      <DoodleCard
        v-for="slot in stats.itemSlots"
        :key="slot.id"
        class="item-slot"
        tone="paper"
        padding="sm"
        :title="slot.name"
      >
        <KawaiiIcon :name="iconForItem(slot.icon)" size="sm" class="item-icon" />
        <span v-if="slot.count > 1" class="item-count">{{ slot.count }}</span>
      </DoodleCard>
    </div>

    <div v-if="stats.activeBuffs.length > 0" class="hud-buffs">
      <BuffIcon v-for="buff in stats.activeBuffs" :key="buff.id" :buff="buff" />
    </div>
  </div>
</template>

<style scoped>
.hud-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  pointer-events: none;
  z-index: 10;
}

.hud-top > * { pointer-events: auto; }

.hud-left {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 110px;
}

.simple-hud-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.life-dot { font-size: 0.85rem; }

.hud-panel {
  min-width: 120px;
}

.bar-panel {
  padding: 9px 11px;
  border-radius: var(--radius-lg);
}

/* ===== HP / XP Bars ===== */
.hp-bar,
.xp-bar {
  position: relative;
  height: 16px;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.hp-bg-pattern,
.xp-bg-pattern {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px,
      transparent 12px,
      rgba(255, 255, 255, 0.06) 12px,
      rgba(255, 255, 255, 0.06) 14px
    );
  pointer-events: none;
  z-index: 1;
}

.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-danger), var(--color-danger-light));
  border-radius: 8px;
  transition: width var(--duration-slow) var(--ease-out);
  position: relative;
  z-index: 2;
}

.xp-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-secondary), #67e8f9);
  border-radius: 8px;
  transition: width var(--duration-slow) var(--ease-out);
  position: relative;
  z-index: 2;
}

/* Low HP pulse */
.hp-bar.low-hp .hp-fill {
  animation: hp-pulse 1s ease-in-out infinite;
}

@keyframes hp-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Level-up flash */
.xp-bar.level-up {
  animation: xp-flash 0.6s ease-out;
}

@keyframes xp-flash {
  0% { box-shadow: 0 0 0 0 rgba(245, 168, 194, 0.6); }
  50% { box-shadow: 0 0 20px 4px rgba(245, 168, 194, 0.4); }
  100% { box-shadow: 0 0 0 0 rgba(245, 168, 194, 0); }
}

.hp-text,
.xp-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  z-index: 3;
}

.hud-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.doodle-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 38px;
  color: #fffaf6;
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.score-pill {
  color: var(--color-accent);
}

.score-value {
  font-weight: 900;
  font-variant-numeric: tabular-nums;
}

.pause-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, var(--color-kawaii-butter-main), var(--color-accent));
  color: var(--color-kawaii-ink);
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(31, 23, 28, 0.72);
  box-shadow: 3px 3px 0 rgba(31, 23, 28, 0.28);
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.pause-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 rgba(31, 23, 28, 0.3);
}

.pause-symbol {
  width: 12px;
  height: 14px;
  display: block;
  background: linear-gradient(90deg, currentColor 0 35%, transparent 35% 65%, currentColor 65% 100%);
  border-radius: 2px;
}

/* ===== Item Slots ===== */
.hud-items {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.item-slot {
  position: relative;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px;
  cursor: pointer;
}

.item-icon { font-size: 1rem; }

.item-count {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--color-kawaii-ink);
  color: #fffaf6;
  font-size: var(--font-size-xs);
  font-weight: 700;
  min-width: 13px;
  height: 13px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 2px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* ===== Buffs ===== */
.hud-buffs {
  position: absolute;
  right: 10px;
  top: 55px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ===== Responsive ===== */
@media (min-width: 640px) {
  .hud-top { padding: 12px; }
  .hp-bar, .xp-bar { height: 18px; }
  .stat-pill { font-size: var(--font-size-base); padding: 4px 10px; }
  .pause-btn { width: 48px; height: 48px; }
}
</style>
