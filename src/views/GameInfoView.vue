<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { getGameById, getGameManifestById } from "@/games/registry"
import { useDatabase } from "@/composables/useDatabase"
import { useGameAudio } from "@/composables/useGameAudio"
import { getGameOptimizationProfile } from "@/data/gameOptimizationProfiles"
import KawaiiDecorLayer from "@/components/KawaiiDecorLayer.vue"
import KawaiiIcon from "@/components/KawaiiIcon.vue"
import KmgButton from "@/components/ui/KmgButton.vue"
import BaseCard from "@/components/BaseCard.vue"
import AmbientParticles from "@/components/AmbientParticles.vue"
import { iconForGame } from "@/data/iconManifest"
import { getGameIdentityColors, PARTICLE_CSS } from "@/composables/useGameIdentity"
import type { ScoreRecord } from "@/types"

const props = defineProps<{ id: string }>()
const router = useRouter()
const { getHighScore, getTopScores, getAllUpgrades, initDatabase, isReady } = useDatabase()
const gameManifest = computed(() => getGameManifestById(props.id))
const gameAudio = computed(() => useGameAudio(gameManifest.value))
const game = computed(() => getGameById(props.id))
const optimizationProfile = computed(() => game.value ? getGameOptimizationProfile(game.value.id) : null)

const highScore = ref(0)
const playCount = ref(0)
const topScores = ref<ScoreRecord[]>([])
const totalUpgradeLevel = ref(0)
const thumbFailed = ref(false)

/**
 * Convert hex color to rgba string.
 */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * Derive ambient particle colors from game identity tokens.
 */
const identityColors = computed(() => props.id ? getGameIdentityColors(props.id) : null)

const particleColors = computed((): string[] => {
  const id = identityColors.value
  if (!id) return ['rgba(200,200,255,0.2)']

  const colors: string[] = []

  // Surface tones
  const surfaceMatch = id.surface.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/)
  if (surfaceMatch) {
    const [_, sr, sg, sb] = surfaceMatch
    colors.push(`rgba(${sr},${sg},${sb},0.25)`)
    colors.push(`rgba(${sr},${sg},${sb},0.12)`)
  }

  // Accent tones
  if (id.accent.startsWith('#')) {
    colors.push(hexToRgba(id.accent, 0.25))
    colors.push(hexToRgba(id.accent, 0.10))
  }

  // White glow
  colors.push('rgba(255,255,255,0.15)')

  return colors.length >= 3 ? colors : ['rgba(200,200,255,0.2)']
})

const particleChar = computed(() => {
  const id = identityColors.value
  if (!id) return null
  return PARTICLE_CSS[id.particle] ?? null
})

const difficultyBadge = computed(() => {
  const d = game.value?.difficulty
  if (d === "easy") return { variant: "success" as const, label: "簡單" }
  if (d === "medium") return { variant: "warning" as const, label: "普通" }
  if (d === "hard") return { variant: "danger" as const, label: "困難" }
  return { variant: "default" as const, label: "" }
})

const stats = computed(() => [
  { label: "最高分", icon: "crown" as const, value: highScore.value.toLocaleString("zh-TW") },
  { label: "遊戲次數", icon: "controller" as const, value: String(playCount.value) },
  { label: "總升級", icon: "upgrade" as const, value: String(totalUpgradeLevel.value) },
  { label: "排行紀錄", icon: "trophy" as const, value: String(topScores.value.length) },
])

onMounted(async () => {
  if (!isReady.value) await initDatabase()
  const [hs, scores, upgrades] = await Promise.all([
    getHighScore(props.id),
    getTopScores(props.id, 5),
    getAllUpgrades(),
  ])
  highScore.value = hs
  topScores.value = scores
  playCount.value = (await getTopScores(props.id, 9999)).length
  totalUpgradeLevel.value = Object.values(upgrades).reduce((s, l) => s + l, 0)
})

const sfx = () => gameAudio.value.playShellSfx("buttonClick")
async function startGame() { await sfx(); router.push({ name: "game-play", params: { id: props.id } }) }
async function goBack() { await sfx(); router.push({ name: "lobby" }) }
function onThumbError() { thumbFailed.value = true }
</script>

<template>
  <div v-if="game" class="page">
    <div class="bg">
      <AmbientParticles
        :count="15"
        :colors="particleColors"
        :speed="0.3"
        :max-size="5"
        :min-size="2"
      />
      <div class="orb o1" :style="{ background: game.color }" />
      <div class="orb o2" :style="{ background: game.color }" />
      <KawaiiDecorLayer :category="game.category" mood="cozy" />
      <span
        v-for="i in 6" :key="i"
        :class="['pt', 'p' + i]"
        :style="{
          '--gc': game.color,
          '--pc': particleChar?.character ?? '✦',
          '--ps': (particleChar?.size ?? 4) + 'px',
          '--pc-color': particleChar?.color ?? game.color,
        }"
      />
    </div>

    <header class="hdr">
      <button class="back-btn" @click="goBack">
        <KawaiiIcon name="back" size="sm" />
      </button>
      <h1 class="title">{{ game.name }}</h1>
      <div class="badges">
        <KmgBadge variant="info" size="sm">{{ game.category }}</KmgBadge>
        <KmgBadge v-if="difficultyBadge.variant !== 'default'" :variant="difficultyBadge.variant" size="sm">{{ difficultyBadge.label }}</KmgBadge>
      </div>
    </header>

    <div class="content">
      <div class="left">
        <div class="thumb" :style="{ '--gc': game.color }">
          <div class="thumb-pattern" />
          <img
            v-if="game.thumbnail && !thumbFailed"
            :src="game.thumbnail"
            :alt="`${game.name} 縮圖`"
            class="thumb-img"
            @error="onThumbError"
          />
          <KawaiiIcon v-else :name="iconForGame(game.id, game.category)" size="xl" class="thumb-icon" />
          <div class="thumb-glow" :style="{ background: game.color }" />
        </div>

        <BaseCard variant="elevated" padding="md">
          <h2 class="sec-title"><KawaiiIcon name="star" size="sm" /> 玩家數據</h2>
          <div class="stats">
            <div v-for="(s, idx) in stats" :key="s.label" class="stat" :style="{ '--stat-index': idx }">
              <KawaiiIcon :name="s.icon" size="lg" class="si" />
              <span class="sv">{{ s.value }}</span>
              <span class="sl">{{ s.label }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard variant="default" padding="md">
          <h2 class="sec-title"><KawaiiIcon name="trophy" size="sm" /> 排行榜 TOP 5</h2>
          <div v-if="topScores.length" class="lb">
            <div v-for="(r, i) in topScores" :key="r.id ?? i" :class="['lr', { t3: i < 3 }]" :style="{ '--lr-index': i }">
              <span class="rk">#{{ i + 1 }}</span>
              <span class="pn">{{ r.playerName }}</span>
              <span class="ps">{{ r.score.toLocaleString() }}</span>
            </div>
          </div>
          <div v-else class="lb-empty">暂无排行榜資料</div>
        </BaseCard>
      </div>

      <div class="right">
        <BaseCard variant="default" padding="md">
          <h2 class="sec-title"><KawaiiIcon name="sparkle" size="sm" /> 遊戲介紹</h2>
          <p class="txt">{{ game.description }}</p>
        </BaseCard>

        <BaseCard variant="default" padding="md">
          <h2 class="sec-title"><KawaiiIcon name="keyboard" size="sm" /> 遊戲操控</h2>
          <div class="ctrl-box">{{ game.controls }}</div>
          <div v-if="optimizationProfile" class="control-chips">
            <span v-for="chip in optimizationProfile.controlChips" :key="chip" class="control-chip">{{ chip }}</span>
          </div>
        </BaseCard>

        <BaseCard variant="default" padding="md">
          <h2 class="sec-title"><KawaiiIcon name="board" size="sm" /> 攻略技巧</h2>
          <ol class="ins">
            <li v-for="(step, i) in game.instructions" :key="i">
              <span class="sn">{{ i + 1 }}</span>
              <span class="st">{{ step }}</span>
            </li>
          </ol>
        </BaseCard>

        <BaseCard v-if="optimizationProfile" variant="default" padding="md">
          <h2 class="sec-title"><KawaiiIcon :name="optimizationProfile.featuredIcon" size="sm" /> B+C 重構確認</h2>
          <p class="txt">{{ optimizationProfile.thumbnailFocus }}</p>
          <div class="audit-grid">
            <div class="audit-block">
              <h3 class="audit-title">玩法合理性</h3>
              <ul class="audit-list">
                <li v-for="item in optimizationProfile.playabilityChecks" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="audit-block">
              <h3 class="audit-title">深度優化</h3>
              <ul class="audit-list">
                <li v-for="item in optimizationProfile.deepPolish" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </BaseCard>

        <div v-if="game.tags?.length" class="tags">
          <span v-for="t in game.tags" :key="t" class="tag">{{ t }}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <KmgButton variant="primary" size="lg" block @click="startGame">
        <KawaiiIcon name="sparkle" size="sm" /> 開始遊戲
      </KmgButton>
    </div>
  </div>

  <div v-else class="not-found">
    <p>找不到遊戲</p>
    <KmgButton variant="secondary" size="lg" @click="goBack">返回大廳</KmgButton>
  </div>
</template>

<style scoped>
.page { position: relative; display: flex; flex-direction: column; height: 100%; overflow-y: auto; background: linear-gradient(180deg, #fef8f0 0%, #f8f9ff 100%); }
.bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1; animation: orb 22s ease-in-out infinite; }
.o1 { width: 400px; height: 400px; top: -80px; right: -80px; }
.o2 { width: 280px; height: 280px; bottom: 15%; left: -50px; animation-delay: -11s; }
@keyframes orb { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.1)} }

.pt {
  position: absolute;
  width: var(--ps, 5px);
  height: var(--ps, 5px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  animation: fp 10s ease-in-out infinite;
  pointer-events: none;
}
.pt::after {
  content: var(--pc, '✦');
  font-size: var(--ps, 14px);
  color: var(--pc-color, var(--gc, var(--color-primary)));
  line-height: 1;
  filter: blur(0.5px);
}
.p1 { top: 18%; left: 12%; animation-delay: 0; }
.p2 { top: 65%; left: 80%; animation-delay: -2s; }
.p3 { top: 40%; left: 55%; animation-delay: -4s; }
.p4 { top: 82%; left: 28%; animation-delay: -6s; }
.p5 { top: 10%; left: 72%; animation-delay: -1s; }
.p6 { top: 50%; left: 40%; animation-delay: -8s; }
@keyframes fp {
  0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(15deg); opacity: 0.7; }
}

.hdr { position: relative; z-index: 1; display: flex; align-items: center; gap: 1rem; padding: 1rem 1rem 0.5rem; }
.back-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--color-bg-card); color: var(--color-text); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast) var(--ease-out); border: 2px solid var(--color-border); cursor: pointer; flex-shrink: 0; }
.back-btn:hover { background: var(--color-bg-elevated); border-color: var(--color-primary-light); transform: translateY(-2px); }
.title { flex: 1; margin: 0; font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); color: var(--color-text); letter-spacing: -0.02em; }
.badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.content { position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; flex: 1; }
.left, .right { display: flex; flex-direction: column; gap: 1rem; }

.thumb { position: relative; height: 200px; background: linear-gradient(135deg, var(--color-bg-card), var(--color-bg-elevated)); border: 2px solid var(--gc); border-radius: 20px; overflow: hidden; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 24px var(--gc), var(--shadow-lg); }
.thumb-pattern { position: absolute; inset: 0; background-image: linear-gradient(45deg,var(--color-border-subtle) 25%,transparent 25%),linear-gradient(-45deg,var(--color-border-subtle) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--color-border-subtle) 75%),linear-gradient(-45deg,transparent 75%,var(--color-border-subtle) 75%); background-size: 40px 40px; background-position: 0 0,0 20px,20px -20px,-20px 0px; opacity: 0.25; }
.thumb-img { position: relative; z-index: 2; width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb-icon { position: relative; z-index: 2; font-size: 5rem; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15)); animation: iconPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both, if 3s ease-in-out infinite; }
@keyframes iconPop { from { transform: scale(0) rotate(-20deg); } }
@keyframes if { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.thumb-glow { position: absolute; inset: 25%; border-radius: 50%; filter: blur(50px); opacity: 0.2; z-index: 1; }

.sec-title { margin: 0 0 0.75rem; font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); display: flex; align-items: center; gap: 0.5rem; }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 0.875rem; background: var(--color-bg-elevated); border: 1.5px solid var(--color-border-light); border-radius: 12px; transition: all var(--duration-fast) var(--ease-out); animation: statFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; animation-delay: calc(var(--stat-index, 0) * 80ms); }
.stat:hover { border-color: var(--color-primary-light); transform: translateY(-2px); box-shadow: var(--shadow-md); }
@keyframes statFadeIn { from { opacity: 0; transform: translateY(15px) scale(0.95); } }
.si { font-size: 1.75rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.sv { font-size: 1.375rem; font-weight: var(--font-weight-bold); color: var(--color-text); line-height: 1; }
.sl { font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }

.lb { display: flex; flex-direction: column; gap: 0.5rem; }
.lr { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--color-bg-elevated); border: 1.5px solid var(--color-border-light); border-radius: 10px; transition: all var(--duration-fast) var(--ease-out); animation: lrSlideIn 0.3s ease backwards; animation-delay: calc(var(--lr-index, 0) * 60ms); }
.lr:hover { border-color: var(--color-primary-light); transform: translateX(4px); }
@keyframes lrSlideIn { from { opacity: 0; transform: translateX(-20px); } }
.lr.t3 { background: linear-gradient(135deg, var(--color-bg-accent-lemon), var(--color-bg-accent-peach)); border-color: var(--color-accent); }
.rk { font-size: 1.125rem; font-weight: var(--font-weight-bold); min-width: 32px; text-align: center; }
.pn { flex: 1; font-size: 0.9375rem; font-weight: var(--font-weight-semibold); color: var(--color-text); }
.ps { font-size: 0.9375rem; font-weight: var(--font-weight-bold); color: var(--color-primary); font-variant-numeric: tabular-nums; }
.lb-empty { padding: 1.5rem; text-align: center; color: var(--color-text-muted); font-size: 0.875rem; }

.txt { margin: 0; font-size: var(--font-size-base); line-height: 1.6; color: var(--color-text-secondary); }
.ctrl-box { padding: 0.75rem; background: var(--color-bg-elevated); border: 1.5px solid var(--color-border-light); border-radius: 10px; font-size: 0.9375rem; color: var(--color-text-secondary); line-height: 1.6; }
.control-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
.control-chip { display: inline-flex; align-items: center; min-height: 30px; padding: 0.25rem 0.7rem; border: 2px solid var(--color-kawaii-ink); border-radius: 999px; background: rgba(255, 252, 246, 0.92); color: var(--color-kawaii-ink); font-size: 0.78rem; font-weight: 800; box-shadow: 2px 2px 0 rgba(31, 23, 28, 0.14); }
.ins { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.ins li { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.625rem; background: var(--color-bg-elevated); border: 1.5px solid var(--color-border-light); border-radius: 10px; transition: all var(--duration-fast) var(--ease-out); }
.ins li:hover { border-color: var(--color-secondary-light); transform: translateX(4px); }
.sn { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; flex-shrink: 0; background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark)); color: white; font-size: 0.75rem; font-weight: var(--font-weight-bold); border-radius: 50%; box-shadow: 0 2px 6px rgba(6,182,212,0.3); }
.st { flex: 1; font-size: 0.875rem; line-height: 1.5; color: var(--color-text-secondary); }

.audit-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-top: 0.75rem; }
.audit-block { padding: 0.875rem; border: 2px solid var(--color-border); border-radius: var(--radius-lg); background: rgba(255, 252, 246, 0.78); }
.audit-title { margin: 0 0 0.5rem; font-size: 0.9rem; color: var(--color-kawaii-ink); }
.audit-list { display: grid; gap: 0.45rem; margin: 0; padding-left: 1rem; color: var(--color-text-secondary); font-size: 0.82rem; line-height: 1.45; }

.tags { display: flex; flex-wrap: wrap; gap: 0.375rem; padding: 0.75rem; background: var(--color-bg-card); border: 2px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); }
.tag { padding: 0.25rem 0.75rem; background: var(--color-bg-elevated); border: 1.5px solid var(--color-border); border-radius: var(--radius-full); font-size: 0.75rem; font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); transition: all var(--duration-fast) var(--ease-out); }
.tag:hover { background: var(--color-primary-alpha); border-color: var(--color-primary); color: var(--color-primary); }

.footer { position: relative; z-index: 1; display: flex; padding: 1rem; background: rgba(255,255,255,0.85); border-top: 1px solid var(--color-border-light); backdrop-filter: blur(16px); animation: fu 0.5s ease 0.5s both; }
@keyframes fu { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1rem; padding: 2rem; background: linear-gradient(180deg, #fef8f0 0%, #f8f9ff 100%); }
.not-found p { font-size: 1.125rem; font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); margin: 0; }

@media (max-width: 768px) {
  .content { grid-template-columns: 1fr; gap: 0.75rem; padding: 0.75rem; }
  .thumb { height: 160px; }
  .thumb-icon { font-size: 3.5rem; }
  .stats { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
  .audit-grid { grid-template-columns: 1fr; }
  .stat { padding: 0.75rem; }
  .si { font-size: 1.375rem; }
  .sv { font-size: 1.125rem; }
  .footer { flex-direction: column; }
}
</style>
