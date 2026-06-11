<script setup lang="ts">
import { computed } from 'vue'
import { decorAssets, getDecorForGame, type DecorAssetId } from '@/data/decorManifest'

const props = defineProps<{
  category?: string
  mood?: 'playful' | 'victory' | 'cozy' | 'action'
}>()

const moodDecor: Record<NonNullable<typeof props.mood>, DecorAssetId[]> = {
  playful: ['pixelHeart', 'kawaiiStar', 'ghostPeek'],
  victory: ['kawaiiStar', 'rabbitCorner', 'pandaToken'],
  cozy: ['chibiGirlToken', 'pixelHeart', 'pandaToken'],
  action: ['frogBadge', 'soundBubble', 'kawaiiStar'],
}

const items = computed(() => {
  const ids = props.mood ? moodDecor[props.mood] : getDecorForGame(props.category)
  return ids.map((id, index) => ({
    id,
    src: decorAssets[id],
    index,
    tone: index % 2 === 0 ? 'warm' : 'cool',
  }))
})
</script>

<template>
  <div class="kawaii-decor-layer" aria-hidden="true">
    <div
      v-for="item in items"
      :key="`${item.id}-${item.index}`"
      :class="['decor-shell', `decor-${item.index + 1}`, `tone-${item.tone}`]"
    >
      <img :src="item.src" class="decor-item" alt="" />
    </div>
  </div>
</template>

<style scoped>
.kawaii-decor-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.decor-shell {
  position: absolute;
  width: clamp(72px, 11vw, 140px);
  aspect-ratio: 1;
  padding: clamp(8px, 1.1vw, 14px);
  border: 2px solid rgba(29, 22, 27, 0.72);
  border-radius: 28px 24px 30px 22px;
  background: rgba(255, 253, 249, 0.72);
  box-shadow:
    0 10px 0 rgba(29, 22, 27, 0.08),
    0 20px 26px rgba(29, 22, 27, 0.1);
  backdrop-filter: blur(10px);
  opacity: 0.78;
  animation: decor-float 5s ease-in-out infinite;
}

.decor-shell::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 22px 18px 24px 18px;
  border: 1.5px dashed rgba(29, 22, 27, 0.16);
}

.decor-item {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: saturate(0.92) contrast(1.02);
}

.decor-1 {
  top: 8%;
  left: 4%;
  transform: rotate(-10deg);
}

.decor-2 {
  right: 5%;
  top: 14%;
  animation-delay: -1.5s;
  transform: rotate(9deg);
}

.decor-3 {
  right: 10%;
  bottom: 6%;
  animation-delay: -3s;
  transform: rotate(-6deg);
}

.tone-warm {
  background: linear-gradient(180deg, rgba(255, 248, 240, 0.78), rgba(255, 240, 246, 0.66));
}

.tone-cool {
  background: linear-gradient(180deg, rgba(243, 250, 250, 0.74), rgba(242, 240, 255, 0.66));
}

@keyframes decor-float {
  0%,
  100% {
    transform: translateY(0) rotate(-4deg);
  }
  50% {
    transform: translateY(-12px) rotate(2deg);
  }
}

@media (max-width: 640px) {
  .decor-shell {
    width: 64px;
    opacity: 0.55;
    padding: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .decor-shell {
    animation: none;
  }
}
</style>
