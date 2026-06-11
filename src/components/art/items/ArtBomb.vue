<!--
  ArtBomb — 3D glossy black bomb with animated fuse and spark particles.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
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
      <radialGradient id="bombGrad" cx="38%" cy="32%" r="60%">
        <stop offset="0%" stop-color="#6b7280" stop-opacity="0.9" />
        <stop offset="20%" stop-color="#4b5563" />
        <stop offset="60%" stop-color="#1f2937" />
        <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
      </radialGradient>
      <radialGradient id="bombGloss" cx="35%" cy="28%" r="30%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="sparkleGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="1" />
        <stop offset="60%" stop-color="#f97316" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="fuseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6b7280" />
        <stop offset="100%" stop-color="#9ca3af" />
      </linearGradient>
      <filter id="bombAura" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <circle cx="15" cy="18" r="13" fill="#dc2626" opacity="0.1" filter="url(#bombAura)">
      <animate attributeName="opacity" values="0.06;0.18;0.06" dur="1.5s" repeatCount="indefinite" />
    </circle>

    <path d="M18 9 Q20 5 24 4" stroke="url(#fuseGrad)" stroke-width="2" stroke-linecap="round" fill="none" />

    <g transform="translate(25, 3.5)">
      <circle cx="0" cy="0" r="2.5" fill="url(#sparkleGrad)">
        <animate attributeName="r" values="2;3;2" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;1;0.9" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="-2" cy="-2" r="1" fill="#fbbf24" opacity="0.8">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="2.5" cy="-1" r="0.8" fill="#f97316" opacity="0.6">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
      </circle>
    </g>

    <circle cx="15" cy="19" r="11" fill="url(#bombGrad)" stroke="#0f172a" stroke-width="1.5" />
    <ellipse cx="10" cy="14" rx="4" ry="3" fill="url(#bombGloss)" />
    <ellipse cx="9.5" cy="12" rx="1.8" ry="1.2" fill="#ffffff" opacity="0.6" />
    <circle cx="8" cy="16" r="0.7" fill="#ffffff" opacity="0.3" />
    <circle cx="11" cy="25" r="0.5" fill="#ffffff" opacity="0.2" />
    <path d="M6 12 Q15 8 24 12" stroke="#ffffff" stroke-width="0.6" opacity="0.12" fill="none" />
  </svg>
</template>
