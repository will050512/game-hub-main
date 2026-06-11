<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'paper' | 'mist' | 'night'
  padding?: 'sm' | 'md' | 'lg'
  interactive?: boolean
}>(), {
  tone: 'paper',
  padding: 'md',
  interactive: false,
})
</script>

<template>
  <div :class="['doodle-card', `tone-${tone}`, `pad-${padding}`, { interactive }]">
    <slot />
  </div>
</template>

<style scoped>
.doodle-card {
  position: relative;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-kawaii-ink);
  background: linear-gradient(180deg, var(--color-kawaii-warm-paper) 0%, var(--color-kawaii-warm-alt) 100%);
  box-shadow:
    4px 4px 0 rgba(32, 23, 29, 0.14),
    0 14px 28px rgba(32, 23, 29, 0.12);
  overflow: hidden;
}

.doodle-card::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: calc(var(--radius-lg) - 2px);
  border: 1px dashed rgba(32, 23, 29, 0.18);
  pointer-events: none;
  transition: border-color 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.doodle-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

.tone-paper {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.85), transparent 28%),
    linear-gradient(180deg, var(--color-kawaii-warm-paper) 0%, #fff7ee 100%);
}

.tone-mist {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.6), transparent 30%),
    linear-gradient(180deg, var(--color-kawaii-lilac-alt) 0%, var(--color-kawaii-mint-alt) 100%);
}

.tone-night {
  color: var(--color-kawaii-warm-paper);
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 24%),
    linear-gradient(180deg, #2f2330 0%, #1b1520 100%);
  box-shadow:
    4px 4px 0 rgba(13, 9, 13, 0.36),
    0 18px 32px rgba(8, 5, 9, 0.32);
}

.tone-night::before {
  border-color: rgba(255, 245, 250, 0.18);
}

.pad-sm { padding: 12px; }
.pad-md { padding: 18px; }
.pad-lg { padding: 24px; }

.interactive {
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms cubic-bezier(0.34, 1.56, 0.64, 1), border-color 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.interactive:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 18px 0 rgba(32, 23, 29, 0.12),
    0 28px 36px rgba(32, 23, 29, 0.22);
  border-color: var(--color-kawaii-mint);
}

.interactive:hover::after {
  opacity: 1;
}

.interactive:active {
  transform: scale(0.97) translateY(0);
  box-shadow:
    0 6px 0 rgba(32, 23, 29, 0.15),
    0 12px 20px rgba(32, 23, 29, 0.1);
}
</style>
