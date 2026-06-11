<!--
  ArtCloud — Layered cloud with gradient and soft shadow.
  Korean mobile game aesthetic: multi-layered cloud segments with frosted depth.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 96"
    :height="size ? size / 2 : 48"
    viewBox="0 0 96 48"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="cloudMainGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e2e8f0" />
      </linearGradient>
      <linearGradient id="cloudHighlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#f1f5f9" stop-opacity="0.3" />
      </linearGradient>
      <linearGradient id="cloudShadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#cbd5e1" stop-opacity="0.25" />
      </linearGradient>
      <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#64748b" />
        <stop offset="100%" stop-color="#475569" />
      </linearGradient>
      <filter id="cloudShadow">
        <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#94a3b8" flood-opacity="0.3" />
      </filter>
      <filter id="softInnerShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feOffset dx="0" dy="1" result="offset" />
        <feComposite in="offset" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inverse" />
        <feFlood flood-color="#334155" flood-opacity="0.15" result="color" />
        <feComposite in="color" in2="inverse" operator="in" result="shadow" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="shadow" />
        </feMerge>
      </filter>
    </defs>

    <!-- Shadow layer -->
    <g filter="url(#cloudShadow)" opacity="0.5">
      <path d="M26 40 Q15 40 15 30 Q15 21 24 19 Q27 9 40 9 Q50 9 54 17 Q60 13 69 16 Q79 19 80 29 Q88 30 88 38 Q88 45 78 45 H26 Q18 45 15 40 Q19 41 26 40 Z" fill="url(#cloudShadow)" />
    </g>

    <!-- Back cloud segment -->
    <path d="M26 38 Q16 38 16 29 Q16 21 24 19 Q27 9 40 9 Q50 9 54 17 Q60 13 69 16 Q79 19 80 29 Q88 30 88 38 Q88 43 78 43 H26 Q18 43 16 38 Q20 39 26 38 Z" fill="#cbd5e1" opacity="0.4" />

    <!-- Main cloud body -->
    <path d="M25 38 Q14 38 14 28 Q14 20 22 18 Q25 8 38 8 Q48 8 52 16 Q58 12 67 15 Q77 18 78 28 Q86 29 86 36 Q86 43 76 43 H25 Q17 43 14 38 Q18 39 25 38 Z" fill="url(#cloudMainGrad)" stroke="#94a3b8" stroke-width="1.2" stroke-linejoin="round" />

    <!-- Inner shadow for depth -->
    <path d="M25 38 Q14 38 14 28 Q14 20 22 18 Q25 8 38 8 Q48 8 52 16 Q58 12 67 15 Q77 18 78 28 Q86 29 86 36 Q86 43 76 43 H25 Q17 43 14 38 Q18 39 25 38 Z" fill="url(#cloudShadow)" opacity="0.15" />

    <!-- Top highlight layer -->
    <path d="M30 14 Q38 7 48 8 Q56 9 60 16 Q58 13 52 12 Q44 10 38 12 Q33 14 30 14 Z" fill="#ffffff" opacity="0.7" />

    <!-- Face -->
    <circle cx="32" cy="29" r="1.8" fill="url(#faceGrad)" />
    <circle cx="52" cy="29" r="1.8" fill="url(#faceGrad)" />
    <path d="M36 34 Q42 38 48 34" stroke="url(#faceGrad)" stroke-width="1.6" stroke-linecap="round" fill="none" />

    <!-- Rosy cheeks -->
    <ellipse cx="26" cy="32" rx="4" ry="2" fill="#f472b6" opacity="0.3" />
    <ellipse cx="58" cy="32" rx="4" ry="2" fill="#f472b6" opacity="0.3" />
  </svg>
</template>
