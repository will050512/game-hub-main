<!--
  ArtPipeBody — Flappy Bird pipe body with metallic green gradient.
  Korean mobile game aesthetic: layered metallic sheen + segment lines + glossy edge.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 112"
    :height="size ? (size * 64) / 112 : 64"
    viewBox="0 0 112 64"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="pipeBodyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#86efac" />
        <stop offset="20%" stop-color="#4ade80" />
        <stop offset="50%" stop-color="#22c55e" />
        <stop offset="80%" stop-color="#16a34a" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
      <linearGradient id="pipeGlossLeft" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="pipeShadowRight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#064e3b" stop-opacity="0" />
        <stop offset="100%" stop-color="#022c22" stop-opacity="0.35" />
      </linearGradient>
      <linearGradient id="pipeMidHighlight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.2" />
        <stop offset="30%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="segmentLineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#14532d" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#166534" stop-opacity="0.3" />
      </linearGradient>
      <filter id="pipeInnerShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
        <feOffset dx="2" dy="1" result="offset" />
        <feComposite in="offset" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feFlood flood-color="#022c22" flood-opacity="0.2" />
        <feComposite in2="SourceGraphic" operator="over" />
      </filter>
    </defs>

    <!-- Base pipe body with metallic gradient -->
    <rect x="1" y="1" width="110" height="62" rx="7" fill="url(#pipeBodyGrad)" stroke="#1a1a1a" stroke-width="2" filter="url(#pipeInnerShadow)" />

    <!-- Glossy left edge highlight -->
    <path d="M14 2 H30 V62 H14 Z" fill="url(#pipeGlossLeft)" />

    <!-- Secondary mid-left sheen -->
    <path d="M30 2 H48 V62 H30 Z" fill="url(#pipeMidHighlight)" opacity="0.4" />

    <!-- Right side shadow -->
    <path d="M82 2 H103 Q110 2 110 9 V55 Q110 62 103 62 H82 Z" fill="url(#pipeShadowRight)" />

    <!-- Horizontal segment lines -->
    <path d="M38 1 V63" stroke="url(#segmentLineGrad)" stroke-width="1.6" />
    <path d="M80 1 V63" stroke="url(#segmentLineGrad)" stroke-width="1.6" />

    <!-- Extra gloss strip -->
    <rect x="8" y="9" width="13" height="46" rx="4" fill="#ffffff" opacity="0.25" />
  </svg>
</template>
