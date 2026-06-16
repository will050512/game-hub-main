<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { getGameById, getGameManifestById } from "@/games/registry"
import { useDatabase } from "@/composables/useDatabase"
import { useGameAudio } from "@/composables/useGameAudio"
import KawaiiDecorLayer from "@/components/KawaiiDecorLayer.vue"
import KawaiiIcon from "@/components/KawaiiIcon.vue"
import KmgButton from "@/components/ui/KmgButton.vue"
import KmgCurrency from "@/components/ui/KmgCurrency.vue"
import BaseCard from "@/components/BaseCard.vue"
import type { ScoreRecord, AchievementDef } from "@/types"
import { achievementDefs } from "@/data/achievements"
import type { KawaiiIconId } from "@/data/iconManifest"
import { copyToClipboard } from "@/utils/share"

const props = defineProps<{ id: string }>()
const router = useRouter()
const route = useRoute()
const game = computed(() => getGameById(props.id))
const gameManifest = computed(() => getGameManifestById(props.id))
const gameAudio = computed(() => useGameAudio(gameManifest.value))

const { addScore, getTopScores, getHighScore, isReady } = useDatabase()

const score = computed(() => Number(route.query.score) || 0)
const kills = computed(() => Number(route.query.kills) || 0)
const time = computed(() => Number(route.query.time) || 0)
const level = computed(() => Number(route.query.level) || 1)
const coins = computed(() => Number(route.query.coins) || 0)

const highScore = ref(0)
const topScores = ref<ScoreRecord[]>([])
const isNewHighScore = ref(false)

const displayScore = ref(0)
const showConfetti = ref(false)
const achievedIds = ref<string[]>([])
const scorePulsing = ref(false)
const showShareToast = ref(false)
let rafId = 0

// Score count-up animation
function animateScore(target: number, duration: number) {
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(2, -10 * p)
    displayScore.value = Math.round(target * eased)
    if (p < 1) rafId = requestAnimationFrame(tick)
    else {
      displayScore.value = target
      // Pulse on final value
      scorePulsing.value = true
      setTimeout(() => { scorePulsing.value = false }, 400)
      // Unlock demo achievements based on score thresholds
      const thresholds: Record<string, number> = { first_game: 100, score_1000: 1000, score_5000: 5000, score_10000: 10000 }
      for (const [id, t] of Object.entries(thresholds)) {
        if (target >= t && !achievedIds.value.includes(id)) {
          achievedIds.value.push(id)
        }
      }
    }
  }
  if (target === 0) { displayScore.value = 0; setTimeout(() => showConfetti.value = false, 500) }
  else rafId = requestAnimationFrame(tick)
}

// Derived achievements data
const achieved = computed(() =>
  achievementDefs.filter(a => achievedIds.value.includes(a.id)).map(a => {
    const rarityColor = ({ common: "--color-info", uncommon: "--color-success", rare: "--color-primary", epic: "--color-secondary", legendary: "--color-accent" } as Record<string, string>)[a.rarity] || "--color-info"
    return { ...a, _color: rarityColor }
  })
)

onMounted(async () => {
  if (!isReady.value) return
  const prev = await getHighScore(props.id)
  highScore.value = prev
  isNewHighScore.value = score.value > prev
  await addScore(props.id, score.value)
  topScores.value = await getTopScores(props.id, 5)
  animateScore(score.value, 1200)
  if (isNewHighScore.value) {
    setTimeout(() => { showConfetti.value = true; gameAudio.value.playShellSfx("achievement") }, 500)
  }
})

onUnmounted(() => { if (rafId) cancelAnimationFrame(rafId) })

const sfx = () => gameAudio.value.playShellSfx("buttonClick")
async function playAgain() { await sfx(); router.replace({ name: "game-play", params: { id: props.id } }) }
async function goHome() { await sfx(); router.push({ name: "lobby" }) }

async function handleShare() {
  const url = `${window.location.origin}${window.location.pathname}?ref=score:${score.value}@${props.id}`
  const shareText = `我在${game.value?.name ?? '遊戲'}中獲得了${score.value}分！來挑戰我吧 🎮`
  await copyToClipboard(shareText + '\n' + url)
  showShareToast.value = true
  setTimeout(() => { showShareToast.value = false }, 2000)
}
</script>

<template>
  <div v-if="game" class="page">
    <div class="bg">
      <div class="orb o1" :style="{ background: game.color }" />
      <div class="orb o2" :style="{ background: game.color }" />
      <KawaiiDecorLayer :category="game.category" :mood="isNewHighScore ? 'victory' : 'playful'" />
    </div>

    <div v-if="showConfetti" class="confetti">
      <span v-for="i in 30" :key="i" :class="['c', `c${i % 5}`]" :style="{ animationDelay: `${Math.random() * 1.5}s` }" />
    </div>

    <header class="hdr">
      <button class="back-btn" @click="goHome"><KawaiiIcon name="back" size="sm" /></button>
      <div>
        <h1 class="title"><KawaiiIcon name="trophy" size="md" /> 遊戲結果</h1>
        <p class="sub">{{ game.name }}</p>
      </div>
      <Transition name="badge-pop">
        <KmgBadge v-if="isNewHighScore" variant="warning" size="sm" class="new-badge">
          <KawaiiIcon name="sparkle" size="sm" class="sparkle-icon" /> 新紀錄！ <KawaiiIcon name="sparkle" size="sm" class="sparkle-icon" />
        </KmgBadge>
      </Transition>
    </header>

    <main class="result-scroll">
      <div class="score-hero" :class="{ rec: isNewHighScore }">
        <div class="score-ring" :class="{ pulse: scorePulsing }">
          <div class="score-value">{{ displayScore.toLocaleString() }}</div>
          <span class="score-label">最終得分</span>
        </div>
      </div>

      <div class="rewards">
        <BaseCard v-if="coins > 0" variant="outlined" padding="sm" :class="'reward-card'" :style="{ '--detail-index': 0 }">
          <div class="reward-item">
            <KawaiiIcon name="coin" size="md" class="ri" />
            <span class="rl">金幣獎勵</span>
            <KmgCurrency :amount="coins" type="coin" />
          </div>
        </BaseCard>
        <BaseCard variant="outlined" padding="sm" :class="'reward-card'" :style="{ '--detail-index': 1 }">
          <div class="reward-item">
            <KawaiiIcon name="star" size="md" class="ri" />
            <span class="rl">經驗值</span>
            <span class="rv">{{ Math.round(coins * 1.5) }} XP</span>
          </div>
        </BaseCard>
      </div>

      <div class="detail-grid">
        <BaseCard variant="default" padding="sm" :style="{ '--detail-index': 0 }">
          <KawaiiIcon name="timer" size="lg" class="di" />
          <span class="dv">{{ time }}</span>
          <span class="dl">遊戲時間</span>
        </BaseCard>
        <BaseCard variant="default" padding="sm" :style="{ '--detail-index': 1 }">
          <KawaiiIcon name="action" size="lg" class="di" />
          <span class="dv">{{ kills }}</span>
          <span class="dl">擊殺數</span>
        </BaseCard>
        <BaseCard variant="default" padding="sm" :style="{ '--detail-index': 2 }">
          <KawaiiIcon name="star" size="lg" class="di" />
          <span class="dv">Lv.{{ level }}</span>
          <span class="dl">到達等級</span>
        </BaseCard>
        <BaseCard variant="default" padding="sm" :style="{ '--detail-index': 3 }">
          <KawaiiIcon name="crown" size="lg" class="di" />
          <span class="dv">{{ highScore.toLocaleString() }}</span>
          <span class="dl">歷史最高</span>
        </BaseCard>
      </div>

      <section v-if="achieved.length" class="achieve-sec">
        <h2 class="sec-title"><KawaiiIcon name="trophy" size="sm" /> 獲得成就</h2>
        <TransitionGroup name="achieve-stagger" tag="div" class="achieve-list">
          <BaseCard :key="a.id" variant="default" padding="sm" :class="['ach-item', a.rarity]" :style="{ '--ach-index': achievedIds.indexOf(a.id) }" v-for="a in achieved">
            <KawaiiIcon :name="a.icon as KawaiiIconId" size="lg" class="ach-icon" />
            <div class="ach-info">
              <span class="ach-name">{{ a.name }}</span>
              <span class="ach-desc">{{ a.description }}</span>
            </div>
            <KmgBadge :variant="{ common: 'default', uncommon: 'success', rare: 'info', epic: 'danger', legendary: 'warning' }[a.rarity]" size="sm">{{ a.rarity }}</KmgBadge>
          </BaseCard>
        </TransitionGroup>
      </section>

      <section v-if="topScores.length" class="lb-sec">
        <h2 class="sec-title"><KawaiiIcon name="trophy" size="sm" /> 排行榜 TOP 5</h2>
        <div class="lb">
          <div v-for="(r, i) in topScores" :key="r.id" :class="['lr', { t3: i < 3, me: r.score === score }]">
            <span class="rk">#{{ i + 1 }}</span>
            <span class="pn">{{ r.playerName }}</span>
            <span class="ps">{{ r.score.toLocaleString() }}</span>
          </div>
        </div>
      </section>

      <div class="footer">
        <KmgButton variant="primary" size="lg" block @click="playAgain">
          <KawaiiIcon name="controller" size="sm" /> 再玩一次
        </KmgButton>
        <div class="footer-row">
          <KmgButton variant="ghost" size="lg" @click="handleShare">
            <KawaiiIcon name="sparkle" size="sm" /> 分享分數
          </KmgButton>
          <KmgButton variant="ghost" size="lg" @click="goHome">
            <KawaiiIcon name="home" size="sm" /> 返回大廳
          </KmgButton>
        </div>
        <Transition name="fade">
          <div v-if="showShareToast" class="share-toast">已複製到剪貼簿！</div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #fef8f0 0%, #f8f9ff 100%);
}
.bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; pointer-events: none; }
.orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.1; animation: orb 22s ease-in-out infinite; }
.o1 { width: 400px; height: 400px; top: -80px; right: -80px; }
.o2 { width: 280px; height: 280px; bottom: 15%; left: -50px; animation-delay: -11s; }
@keyframes orb { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-40px) scale(1.1)} }

.confetti { position: fixed; inset: 0; pointer-events: none; z-index: 1000; }
.c { position: absolute; width: 8px; height: 12px; border-radius: 2px; animation: cfall 3s ease-in-out forwards; }
.c0 { background: var(--color-primary); }
.c1 { background: var(--color-secondary); }
.c2 { background: var(--color-accent); }
.c3 { background: var(--color-success); }
.c4 { background: var(--color-danger); }
@keyframes cfall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }

.hdr {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: clamp(0.6rem, 2vw, 1rem);
  width: min(920px, 100%);
  padding: max(0.75rem, env(safe-area-inset-top)) clamp(0.75rem, 3vw, 1.25rem) 0.35rem;
}
.back-btn { width: 44px; height: 44px; border-radius: 50%; background: var(--color-bg-card); color: var(--color-text); display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast) var(--ease-out); border: 2px solid var(--color-border); cursor: pointer; flex-shrink: 0; }
.back-btn:hover { background: var(--color-bg-elevated); border-color: var(--color-primary-light); transform: translateY(-2px); }
.title { margin: 0; font-size: clamp(1.25rem, 4.5vw, var(--font-size-3xl)); font-weight: var(--font-weight-black); color: var(--color-text); letter-spacing: 0; }
.sub { margin: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); }
.new-badge { background: linear-gradient(135deg, var(--color-accent-alpha), var(--color-accent)) !important; border-color: var(--color-accent) !important; animation: np 0.5s var(--ease-bounce) both; }
.sparkle-icon { animation: spk 1s ease-in-out infinite alternate; display: inline-block; }
@keyframes spk { 0%{transform:scale(1)} 100%{transform:scale(1.2) rotate(15deg)} }
@keyframes np { 0%{transform:scale(0)} 100%{transform:scale(1)} }

.result-scroll {
  position: relative;
  z-index: 1;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 clamp(0.75rem, 3vw, 1.25rem) max(1rem, env(safe-area-inset-bottom));
}

.score-hero { position: relative; z-index: 1; width: 100%; max-width: 320px; margin: clamp(0.45rem, 2.4dvh, 1.5rem) 0; display: flex; justify-content: center; }
.score-ring { display: flex; flex-direction: column; align-items: center; width: min(100%, 320px); padding: clamp(1rem, 4dvh, 2rem); border-radius: var(--radius-2xl); border: 2px solid var(--gc); box-shadow: 0 0 30px var(--gc), var(--shadow-xl); background: linear-gradient(135deg, var(--color-bg-card), var(--color-bg-elevated)); }
.page.rec .score-ring { animation: ringPulse 2s ease-in-out infinite; }
@keyframes ringPulse { 0%,100%{box-shadow:0 0 30px var(--gc),var(--shadow-xl)} 50%{box-shadow:0 0 60px var(--gc),0 0 80px var(--gc)} }
.score-value { font-size: clamp(2rem, 9vw, 3rem); font-weight: var(--font-weight-black); background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; font-variant-numeric: tabular-nums; }
.score-label { font-size: var(--font-size-sm); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); margin-top: 0.5rem; }

.rewards { position: relative; z-index: 1; width: 100%; max-width: 400px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
.reward-item { display: flex; align-items: center; gap: 0.75rem; }
.ri { flex-shrink: 0; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.rv { font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-accent); }
.rewards .base-card { background: var(--color-bg-card); border: 2px solid var(--color-border-light); border-radius: var(--radius-lg); }

.detail-grid { position: relative; z-index: 1; width: 100%; max-width: 400px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
.di { font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.dv { font-size: 1.25rem; font-weight: var(--font-weight-bold); color: var(--color-text); display: block; margin-top: 0.5rem; line-height: 1; }
.dl { font-size: var(--font-size-xs); color: var(--color-text-secondary); font-weight: var(--font-weight-medium); display: block; margin-top: 0.25rem; }

.achieve-sec { position: relative; z-index: 1; width: 100%; max-width: 400px; margin-bottom: 1rem; }
.sec-title { margin: 0 0 0.75rem; font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); display: flex; align-items: center; gap: 0.5rem; }
.achieve-list { display: flex; flex-direction: column; gap: 0.5rem; }
.ach-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem !important; border: 1.5px solid var(--color-border-light); border-radius: var(--radius-md); background: var(--color-bg-card); transition: all var(--duration-fast) var(--ease-out); }
.ach-item:hover { transform: translateX(4px); border-color: var(--color-primary-light); }
.ach-item.common { --ach-border: var(--color-info); }
.ach-item.uncommon { --ach-border: var(--color-success); border-color: var(--color-success) !important; }
.ach-item.rare { --ach-border: var(--color-primary); border-color: var(--color-primary) !important; }
.ach-item.epic { --ach-border: var(--color-secondary); border-color: var(--color-secondary) !important; }
.ach-item.legendary { --ach-border: var(--color-accent); border-color: var(--color-accent) !important; }
.ach-icon { flex-shrink: 0; font-size: 2rem; filter: drop-shadow(0 0 8px var(--ach-border, var(--color-info))); animation: ap 0.6s var(--ease-bounce) both; transition: filter 0.3s; }
.ach-item:hover .ach-icon { filter: drop-shadow(0 0 16px var(--ach-border, var(--color-info))); }
@keyframes ap { 0%{transform:scale(0)} 100%{transform:scale(1)} }
.ach-info { flex: 1; min-width: 0; }
.ach-name { display: block; font-size: 0.9375rem; font-weight: var(--font-weight-semibold); color: var(--color-text); }
.ach-desc { display: block; font-size: var(--font-size-xs); color: var(--color-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.achieve-stagger-enter-active { transition: all 0.4s var(--ease-bounce); }
.achieve-stagger-leave-active { transition: 0.2s ease; }
.achieve-stagger-enter-from { opacity: 0; transform: scale(0.3) translateY(20px); }
.achieve-stagger-leave-to { opacity: 0; transform: scale(0.8); }
.achieve-stagger-move { transition: all 0.3s ease; }

.lb-sec { position: relative; z-index: 1; width: 100%; max-width: 400px; margin-bottom: 1rem; }
.lb { display: flex; flex-direction: column; gap: 0.5rem; }
.lr { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; background: var(--color-bg-elevated); border: 1.5px solid var(--color-border-light); border-radius: var(--radius-md); transition: all var(--duration-fast) var(--ease-out); }
.lr:hover { border-color: var(--color-primary-light); transform: translateX(4px); }
.lr.t3 { background: linear-gradient(135deg, var(--color-bg-accent-lemon), var(--color-bg-accent-peach)); border-color: var(--color-accent); }
.lr.me { background: var(--color-primary-alpha); border-color: var(--color-primary); }
.rk { font-size: 1.125rem; font-weight: var(--font-weight-bold); min-width: 32px; text-align: center; }
.pn { flex: 1; font-size: 0.9375rem; font-weight: var(--font-weight-semibold); color: var(--color-text); }
.ps { font-size: 0.9375rem; font-weight: var(--font-weight-bold); color: var(--color-primary); font-variant-numeric: tabular-nums; }

.footer { position: relative; z-index: 1; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 0.75rem; padding: clamp(0.5rem, 2dvh, 1rem) 0 0; }
.footer-row { display: flex; justify-content: center; gap: 0.75rem; }

.share-toast {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.25rem;
  background: var(--color-bg-card);
  border: 2px solid var(--color-success);
  border-radius: var(--radius-lg);
  color: var(--color-success);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-lg);
  z-index: 10;
}

.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }

.badge-pop-enter-active { transition: all 0.4s var(--ease-bounce); }
.badge-pop-leave-active { transition: 0.2s ease; }
.badge-pop-enter-from { opacity: 0; transform: scale(0.5) translateY(-10px); }
.badge-pop-leave-to { opacity: 0; transform: scale(0.8); }

@media (max-width: 768px) {
  .rewards { grid-template-columns: 1fr; }
  .detail-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-height: 680px) {
  .hdr { padding-top: 0.5rem; }
  .sub,
  .score-label,
  .dl {
    font-size: 0.72rem;
  }
  .back-btn {
    width: 38px;
    height: 38px;
  }
  .score-hero,
  .rewards,
  .detail-grid,
  .achieve-sec,
  .lb-sec {
    margin-bottom: 0.55rem;
  }
  .di {
    font-size: 1.45rem;
  }
  .dv {
    font-size: 1rem;
    margin-top: 0.25rem;
  }
}

@media (max-height: 620px) and (min-width: 640px) {
  .rewards,
  .detail-grid,
  .achieve-sec,
  .lb-sec,
  .footer {
    max-width: 760px;
  }
  .detail-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
