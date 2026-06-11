<!--
  ArtBrick — 3D bevel breakout brick with linear gradient depth.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ width?: number; height?: number; bodyColor?: string }>(), {
  bodyColor: '#f87171',
})

function getColor(color?: string): string {
  return '#' + (color ?? 'f87171')
}

function getDark(color?: string): string {
  const map: Record<string, string> = {
    'f87171': 'dc2626',
    '60a5fa': '2563eb',
    'fbbf24': 'd97706',
    'a78bfa': '7c3aed',
    '34d399': '059669',
    'fb7185': 'e11d48',
  }
  return '#' + (map[color ?? 'f87171'] ?? color ?? 'dc2626')
}
</script>

<template>
  <svg
    :width="width ?? 80"
    :height="height ?? 32"
    viewBox="0 0 80 32"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="brickGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" :stop-color="getColor()" stop-opacity="1" />
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="15%" stop-color="#ffffff" stop-opacity="0.15" />
        <stop offset="50%" :stop-color="getColor()" />
        <stop offset="100%" :stop-color="getDark()" stop-opacity="0.8" />
      </linearGradient>
      <linearGradient id="brickHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.5" />
      </linearGradient>
      <linearGradient id="brickShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.2" />
      </linearGradient>
    </defs>

    <rect x="2" y="3" width="76" height="26" rx="6" :fill="getColor()" stroke="#111827" stroke-width="1.6" />
    <path d="M8 7 H72" stroke="url(#brickHighlight)" stroke-width="2" stroke-linecap="round" />
    <path d="M8 27 H72" stroke="url(#brickShadow)" stroke-width="1.5" stroke-linecap="round" />
    <path d="M6 5 V27" stroke="#000000" stroke-width="0.8" opacity="0.08" />
    <path d="M74 5 V27" stroke="#000000" stroke-width="0.8" opacity="0.08" />
    <rect x="10" y="9" width="60" height="14" rx="4" :fill="getColor()" opacity="0.12" />
  </svg>
</template>
