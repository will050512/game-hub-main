<!--
  Art2048Tile — Gradient tile with inner shadow, gold trim for high values.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; bodyColor?: string; value?: number }>(), {
  bodyColor: '#fef3c7',
})

function getColor(color?: string): string {
  return '#' + (color ?? 'fef3c7')
}

function getMid(color?: string): string {
  const map: Record<string, string> = {
    'fef3c7': 'fde68a',
    'fde68a': 'fbbf24',
    'f59e0b': 'd97706',
    'ea580c': 'c2410c',
    'dc2626': 'b91c1c',
    '991b1b': '7f1d1d',
  }
  return '#' + (map[color ?? 'fef3c7'] ?? color ?? 'fde68a')
}

function getDark(color?: string): string {
  const map: Record<string, string> = {
    'fef3c7': 'f59e0b',
    'fde68a': 'd97706',
    'fbbf24': 'b45309',
    'f59e0b': '9a3412',
    'ea580c': '881337',
    'dc2626': '7f1d1d',
    '991b1b': '450a0a',
  }
  return '#' + (map[color ?? 'fef3c7'] ?? color ?? 'f59e0b')
}
</script>

<template>
  <svg
    :width="size ?? 96"
    :height="size ?? 96"
    viewBox="0 0 96 96"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tileGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="getColor()" />
        <stop offset="50%" :stop-color="getMid()" />
        <stop offset="100%" :stop-color="getDark()" stop-opacity="0.8" />
      </linearGradient>
      <radialGradient id="tileInnerShadow" cx="40%" cy="35%" r="80%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
        <stop offset="30%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.2" />
      </radialGradient>
      <linearGradient id="tileShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.3" />
      </linearGradient>
      <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fde68a" />
        <stop offset="50%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
      <filter id="tileShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.15" />
      </filter>
    </defs>

    <rect x="3" y="3" width="90" height="90" rx="16" :fill="getColor()" stroke="#111827" stroke-width="2.5" filter="url(#tileShadow)" />

    <rect
      v-if="value && value >= 64"
      x="1"
      y="1"
      width="94"
      height="94"
      rx="18"
      stroke="url(#goldTrim)"
      stroke-width="2"
      fill="none"
      opacity="0.7"
    />

    <path d="M16 16 H80" stroke="url(#tileShine)" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    <path d="M18 80 H78" stroke="#000000" stroke-width="2" stroke-linecap="round" opacity="0.1" />
    <rect x="3" y="3" width="90" height="90" rx="16" fill="url(#tileInnerShadow)" />
    <rect x="18" y="24" width="60" height="48" rx="10" :fill="getColor()" opacity="0.08" />
    <circle cx="14" cy="14" r="2" fill="#ffffff" opacity="0.15" />
  </svg>
</template>
