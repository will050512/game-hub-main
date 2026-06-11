<!--
  ArtBall — 3D glossy breakout ball with radial gradient depth.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; bodyColor?: string }>(), {
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
    :width="size ?? 32"
    :height="size ?? 32"
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="ballGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
        <stop offset="18%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="35%" :stop-color="getColor()" />
        <stop offset="70%" :stop-color="getColor()" />
        <stop offset="100%" :stop-color="getDark()" stop-opacity="0.85" />
      </radialGradient>
      <radialGradient id="ballGloss" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="ballShadow" cx="65%" cy="70%" r="50%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.3" />
      </radialGradient>
    </defs>

    <circle cx="16" cy="16" r="13" fill="url(#ballGrad)" stroke="#111827" stroke-width="1.5" />
    <circle cx="16" cy="16" r="13" fill="url(#ballShadow)" />
    <ellipse cx="10" cy="9" rx="5" ry="3.5" fill="url(#ballGloss)" transform="rotate(-15 10 9)" />
    <ellipse cx="10" cy="8" rx="2" ry="1.5" fill="#ffffff" opacity="0.9" />
    <circle cx="16" cy="16" r="12.5" stroke="#ffffff" stroke-width="0.5" opacity="0.15" />
  </svg>
</template>
