<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { useMetaProgression } from '@/composables/useMetaProgression'
import { dailyQuestPool } from '@/data/dailyQuests'
import type { DailyQuestDef, DailyQuestProgress } from '@/types'
import ProgressBar from '@/components/ProgressBar.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForQuest } from '@/data/iconManifest'

const playerStore = usePlayerStore()
const metaProgression = useMetaProgression()

const emit = defineEmits<{ claimed: [questId: string] }>()

const dailyQuests = computed(() => playerStore.dailyQuests)

const questsWithDefs = computed(() => {
  return dailyQuests.value.quests.map(progress => {
    const def = dailyQuestPool.find(q => q.id === progress.questId)
    return { progress, def }
  }).filter(q => q.def)
})

const stats = computed(() => metaProgression.getDailyQuestStats())

function getPercent(quest: DailyQuestDef, progress: DailyQuestProgress): number {
  return Math.min(100, (progress.current / quest.target) * 100)
}

async function claimReward(questId: string) {
  const success = await metaProgression.claimDailyQuestReward(questId)
  if (success) {
    emit('claimed', questId)
  }
}
</script>

<template>
  <div class="daily-quests-section">
    <div class="section-header">
      <h3 class="section-title"><KawaiiIcon name="board" size="sm" /> 每日任務</h3>
      <div class="quest-summary">
        <span class="summary-text">{{ stats.completed }} / {{ stats.total }} 完成</span>
        <ProgressBar :value="stats.progress" :max="100" :show-label="false" />
      </div>
    </div>

    <div v-if="questsWithDefs.length > 0" class="quest-list">
      <div
        v-for="{ progress, def } in questsWithDefs"
        :key="progress.questId"
        :class="['quest-card', { completed: progress.completed, claimed: progress.claimed }]"
      >
        <KawaiiIcon :name="iconForQuest(def!.id)" size="lg" class="quest-icon" />
        <div class="quest-content">
          <div class="quest-name">{{ def!.name }}</div>
          <div class="quest-desc">{{ def!.description }}</div>
          <div class="quest-progress-bar">
            <ProgressBar
              :value="getPercent(def!, progress)"
              :max="100"
              :show-label="true"
              :label="`${progress.current}/${def!.target}`"
            />
          </div>
          <div class="quest-footer">
            <div class="quest-reward">
              <span class="reward-item"><KawaiiIcon name="coin" size="xs" /> {{ def!.reward.coins }}</span>
              <span class="reward-item"><KawaiiIcon name="star" size="xs" /> {{ def!.reward.xp }} XP</span>
            </div>
            <button
              v-if="progress.completed && !progress.claimed"
              class="claim-btn"
              @click="claimReward(progress.questId)"
            >
              領取獎勵
            </button>
            <span v-else-if="progress.claimed" class="claimed-badge"><KawaiiIcon name="check" size="xs" /> 已領取</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <KawaiiIcon name="board" size="xl" class="empty-icon" />
      <p>今日沒有任務</p>
      <p class="empty-hint">明天再回來看看！</p>
    </div>
  </div>
</template>

<style scoped>
.daily-quests-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.quest-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.summary-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  min-width: 80px;
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quest-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  transition: all 0.2s ease;
}

.quest-card:hover {
  border-color: var(--color-primary-light);
  box-shadow: var(--shadow-sm);
}

.quest-card.completed {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.05);
}

.quest-card.claimed {
  opacity: 0.7;
}

.quest-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.quest-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quest-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.quest-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.quest-progress-bar {
  margin: 0.25rem 0;
}

.quest-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-light);
}

.quest-reward {
  display: flex;
  gap: 0.75rem;
}

.reward-item {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent);
}

.claim-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.claim-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.claim-btn:active {
  transform: translateY(0);
}

.claimed-badge {
  font-size: 0.8rem;
  font-weight: 700;
  color: #22c55e;
  padding: 0.5rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--radius-md);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.empty-hint {
  font-size: 0.85rem;
  color: var(--color-text-dim);
  font-weight: 400;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .quest-summary {
    width: 100%;
  }

  .quest-card {
    flex-direction: column;
  }

  .quest-icon {
    align-self: flex-start;
  }

  .quest-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .claim-btn {
    width: 100%;
  }
}
</style>
