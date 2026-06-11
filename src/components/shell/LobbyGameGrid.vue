<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import KawaiiIcon from '@/components/KawaiiIcon.vue'
import LobbyGameCard from '@/components/shell/LobbyGameCard.vue'

import type { GameInfo } from '@/types'

const props = withDefaults(defineProps<{
  games: GameInfo[]
  highScores: Record<string, number>
  searchQuery?: string
}>(), {
  games: () => [],
  highScores: () => ({}),
  searchQuery: '',
})

const emit = defineEmits<{
  playGame: [gameId: string]
  infoGame: [gameId: string]
}>()

type ViewMode = 'grid' | 'list'
const viewMode = ref<ViewMode>('grid')

function toggleView(): void {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

function isActiveGame(gameId: string, query: string): boolean {
  return query.trim().length > 0 &&
    (props.highScores[gameId] ?? 0) > 0
}
</script>

<template>
  <main class="game-grid" aria-label="遊戲列表">
    <!-- Toolbar -->
    <div class="grid-toolbar">
      <span class="game-count">
        <KawaiiIcon name="controller" size="sm" />
        顯示 {{ games.length }} 款遊戲
      </span>
      <div class="view-toggle">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
          aria-label="網格視圖"
        >
          <KawaiiIcon name="block" size="xs" />
        </button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
          aria-label="列表視圖"
        >
          <KawaiiIcon name="board" size="xs" />
        </button>
      </div>
    </div>

    <!-- Game Cards -->
    <div
      :class="[
        'games-container',
        `view-${viewMode}`,
        { 'has-search': props.searchQuery.trim().length > 0 }
      ]"
    >
      <TransitionGroup
        name="game-slide"
        tag="div"
        class="games-list"
      >
        <div
          v-for="(game, index) in games"
          :key="game.id"
          class="grid-item"
          :class="{
            'highlighted': isActiveGame(game.id, props.searchQuery),
            'search-matched': props.searchQuery.trim().length > 0 && (
              game.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
              game.description.toLowerCase().includes(props.searchQuery.toLowerCase())
            )
          }"
          :style="{ '--anim-delay': `${index * 0.05}s`, '--game-color': game.color }"
        >
          <LobbyGameCard
            :game="game"
            :high-score="highScores[game.id] ?? 0"
            @click="emit('playGame', game.id)"
          />
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="games.length === 0" class="empty-state">
        <div class="empty-illustration">
          <KawaiiIcon name="search" size="xl" class="empty-icon" />
          <div class="empty-sparkles">
            <KawaiiIcon name="sparkle" size="sm" class="empty-particle" />
            <KawaiiIcon name="star" size="sm" class="empty-particle" />
            <KawaiiIcon name="sparkle" size="xs" class="empty-particle" />
          </div>
        </div>
        <p class="empty-title">找不到符合的遊戲</p>
        <p class="empty-hint">試試其他關鍵字或分類</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game-grid {
  position: relative;
  margin-bottom: var(--space-12);
}

/* Toolbar */
.grid-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  padding: 0 var(--space-1);
}

.game-count {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  font-family: var(--font-family-heading);
}

.view-toggle {
  display: flex;
  gap: var(--space-1);
  padding: 3px;
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.toggle-btn:hover {
  color: var(--color-primary-dark);
  background: var(--color-primary-alpha);
}

.toggle-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-kawaii-ink);
  box-shadow: 2px 2px 0 rgba(38, 27, 34, 0.15);
}

/* Container */
.games-container {
  position: relative;
}

.games-container.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}

.games-container.view-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 720px;
  margin: 0 auto;
}

.games-container.has-search .grid-item.search-matched {
  animation: search-pulse 1.5s ease-in-out 2;
}

/* Grid Items */
.grid-item {
  animation: card-enter var(--duration-slower) var(--ease-bounce) backwards;
  animation-delay: var(--anim-delay, 0s);
  transform-style: preserve-3d;
  will-change: transform, opacity;
}

.games-container.view-list .grid-item {
  animation: list-enter 0.4s var(--ease-out) backwards;
  animation-delay: var(--anim-delay, 0s);
}

.games-container.view-list .lobby-game-card-wrapper {
  border-radius: var(--radius-lg);
}

/* Highlighted (high score) */
.grid-item.highlighted {
  box-shadow: 0 0 0 2px var(--color-accent);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) var(--space-8);
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-illustration {
  position: relative;
  margin-bottom: var(--space-6);
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.4;
  animation: empty-bob 3s ease-in-out infinite;
}

.empty-sparkles {
  position: absolute;
  inset: -20px;
}

.empty-particle {
  position: absolute;
  opacity: 0.3;
}

.empty-particle:nth-child(1) { top: 0; left: 10%; animation: sparkle-float 2s ease-in-out infinite; }
.empty-particle:nth-child(2) { top: 30%; right: 0; animation: sparkle-float 2.5s ease-in-out infinite 0.5s; }
.empty-particle:nth-child(3) { bottom: 0; left: 30%; animation: sparkle-float 2s ease-in-out infinite 1s; }

.empty-title {
  margin: 0 0 var(--space-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-heading);
}

.empty-hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* Search Highlight */
@keyframes search-pulse {
  0%, 100% { filter: drop-shadow(0 0 0 transparent); }
  50% { filter: drop-shadow(0 0 12px var(--color-accent)); }
}

/* Game Slide Transitions */
.game-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-slide-leave-active {
  transition: all 0.2s ease;
}

.game-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.game-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}

.game-slide-move {
  transition: transform 0.3s ease;
}

/* Card Enter Animation */
@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes list-enter {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes empty-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes sparkle-float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-10px) scale(1.2); opacity: 0.6; }
}

/* Responsive */
@media (max-width: 768px) {
  .games-container.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--space-4);
  }

  .grid-toolbar {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .game-count {
    font-size: var(--font-size-xs);
  }
}

@media (min-width: 1200px) {
  .games-container.view-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-7);
  }
}
</style>
