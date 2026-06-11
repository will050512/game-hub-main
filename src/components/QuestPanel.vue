<script setup lang="ts">
import { computed } from 'vue'
import type { DailyQuestDef, DailyQuestProgress } from '@/types'
import ProgressBar from '@/components/ProgressBar.vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import { iconForQuest } from '@/data/iconManifest'

const props = defineProps<{
  quests: DailyQuestDef[]
  progress: DailyQuestProgress[]
}>()

const emit = defineEmits<{ claim: [questId: string] }>()

const questMap = computed(() => {
  const map = new Map<string, DailyQuestProgress>()
  props.progress.forEach(p => map.set(p.questId, p))
  return map
})

function getProgress(questId: string): DailyQuestProgress | undefined {
  return questMap.value.get(questId)
}

function getPercent(quest: DailyQuestDef, prog?: DailyQuestProgress): number {
  if (!prog) return 0
  return Math.min(100, (prog.current / quest.target) * 100)
}
</script>

<template>
  <div class="quest-panel">
    <h3 class="panel-title"><KawaiiIcon name="board" size="xs" /> 每日任務</h3>
    <div class="quest-list">
      <div v-for="quest in quests" :key="quest.id" class="quest-card">
        <div class="quest-header">
          <KawaiiIcon :name="iconForQuest(quest.id)" size="md" class="quest-icon" />
          <div class="quest-info">
            <span class="quest-name">{{ quest.name }}</span>
            <span class="quest-desc">{{ quest.description }}</span>
          </div>
        </div>
        <div class="quest-progress">
          <ProgressBar
            :value="getPercent(quest, getProgress(quest.id))"
            :max="100"
            :show-label="true"
            :label="`${getProgress(quest.id)?.current ?? 0}/${quest.target}`"
          />
        </div>
        <div class="quest-footer">
          <span class="quest-reward"><KawaiiIcon name="coin" size="xs" /> {{ quest.reward.coins }} | <KawaiiIcon name="star" size="xs" /> {{ quest.reward.xp }}XP</span>
          <button
            v-if="getProgress(quest.id)?.completed && !getProgress(quest.id)?.claimed"
            class="claim-btn"
            @click="emit('claim', quest.id)"
          >
            領取
          </button>
          <span v-else-if="getProgress(quest.id)?.claimed" class="claimed-badge"><KawaiiIcon name="check" size="xs" /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quest-panel {
  background: var(--pixel-dark);
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 3px solid var(--pixel-purple);
}

.panel-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--pixel-cyan);
  margin-bottom: 12px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  text-shadow: 2px 2px 0 var(--pixel-magenta);
}

.quest-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quest-card {
  background: var(--pixel-black);
  border-radius: var(--radius-md);
  padding: 12px;
  border: 2px solid var(--pixel-gray);
}

.quest-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.quest-icon { font-size: 1.3rem; }

.quest-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quest-name { font-size: 0.85rem; font-weight: 700; color: var(--pixel-white); font-family: 'VT323', monospace; font-size: 18px; }
.quest-desc { font-size: 0.7rem; color: var(--pixel-gray); }

.quest-progress { margin-bottom: 8px; }

.quest-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quest-reward { font-size: 0.7rem; color: var(--pixel-yellow); font-weight: 600; font-family: 'VT323', monospace; font-size: 16px; }

.claim-btn {
  padding: 6px 14px;
  background: var(--pixel-green);
  color: var(--pixel-black);
  font-size: 11px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  font-size: 9px;
}

.claimed-badge {
  font-size: 0.8rem;
  color: var(--pixel-green);
  font-weight: 800;
}
</style>
