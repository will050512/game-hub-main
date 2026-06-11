<!--
  ArtPowerup — Glowing capsule power-up with pulsing aura and star emblem.
-->
<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number; bodyColor?: string }>(), {
  bodyColor: '#fbbf24',
})

function getColor(color?: string): string {
  return '#' + (color ?? 'fbbf24')
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
  return '#' + (map[color ?? 'fbbf24'] ?? color ?? 'd97706')
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
      <linearGradient id="powerupGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4" />
        <stop offset="20%" :stop-color="getColor()" />
        <stop offset="80%" :stop-color="getColor()" />
        <stop offset="100%" :stop-color="getDark()" stop-opacity="0.9" />
      </linearGradient>
      <radialGradient id="powerupGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" :stop-color="getColor()" stop-opacity="0.35" />
        <stop offset="100%" :stop-color="getColor()" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#fef3c7" />
      </linearGradient>
      <linearGradient id="powerupGloss" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <filter id="powerupAura" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <rect x="1" y="4" width="30" height="24" rx="12" fill="url(#powerupGlow)" opacity="0.7" filter="url(#powerupAura)">
      <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2s" repeatCount="indefinite" />
    </rect>

    <rect x="5" y="8" width="22" height="16" rx="8" :fill="getColor()" stroke="#111827" stroke-width="1.4" />

    <ellipse cx="10" cy="12" rx="7" ry="4" fill="url(#powerupGloss)" transform="rotate(-10 10 12)" />

    <path
      d="M16 10.5 L17.7 14 L21.5 14.5 L18.7 17.2 L19.4 21 L16 19.2 L12.6 21 L13.3 17.2 L10.5 14.5 L14.3 14 Z"
      fill="url(#starGrad)"
      stroke="#111827"
      stroke-width="0.9"
      stroke-linejoin="round"
    />

    <circle cx="9" cy="8" r="0.8" fill="#ffffff" opacity="0.7" />
    <circle cx="23" cy="10" r="0.6" fill="#ffffff" opacity="0.5" />
  </svg>
</template>
