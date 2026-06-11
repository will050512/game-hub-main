<!--
  ArtTetrisBlock — 3D beveled tetris block with inner shadow depth and edge highlights.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; bodyColor?: string }>(), {
  bodyColor: '#60a5fa',
})

function getColor(): string {
  return '#' + (props.bodyColor ?? '60a5fa').replace('#', '')
}

function getDark(): string {
  const map: Record<string, string> = {
    '06b6d4': '0891b2',
    'eab308': 'ca8a04',
    '8b5cf6': '7c3aed',
    '10b981': '059669',
    'ef4444': 'dc2626',
    '3b82f6': '2563eb',
    'f97316': 'ea580c',
  }
  const c = (props.bodyColor ?? '60a5fa').replace('#', '')
  return '#' + (map[c] ?? c ?? '2563eb')
}
</script>

<template>
  <svg
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tetrisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="getColor()" />
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="15%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="50%" :stop-color="getColor()" />
        <stop offset="100%" :stop-color="getDark()" stop-opacity="0.85" />
      </linearGradient>
      <radialGradient id="tetrisInnerShadow" cx="30%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="40%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
      </radialGradient>
      <linearGradient id="tetrisEdgeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="tetrisEdgeShadow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.25" />
        <stop offset="50%" stop-color="#000000" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.2" />
      </linearGradient>
    </defs>

    <rect x="1" y="1" width="30" height="30" rx="5" :fill="getColor()" stroke="#111827" stroke-width="1.6" />
    <path d="M6 5 H26" stroke="url(#tetrisEdgeHighlight)" stroke-width="2" stroke-linecap="round" />
    <path d="M5 5 V26" stroke="url(#tetrisEdgeHighlight)" stroke-width="1.5" stroke-linecap="round" opacity="0.35" />
    <path d="M6 27 H26" stroke="url(#tetrisEdgeShadow)" stroke-width="1.5" stroke-linecap="round" />
    <path d="M27 5 V26" stroke="url(#tetrisEdgeShadow)" stroke-width="1.5" stroke-linecap="round" opacity="0.25" />
    <rect x="1" y="1" width="30" height="30" rx="5" fill="url(#tetrisInnerShadow)" />
    <rect x="7" y="7" width="18" height="18" rx="4" :fill="getColor()" opacity="0.1" />
    <circle cx="5" cy="5" r="1" fill="#ffffff" opacity="0.25" />
    <circle cx="27" cy="27" r="0.8" fill="#000000" opacity="0.2" />
  </svg>
</template>
