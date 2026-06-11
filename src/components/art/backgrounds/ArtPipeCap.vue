<!--
  ArtPipeCap — Flappy Bird pipe cap with metallic green gradient and rim highlight.
  Korean mobile game aesthetic: glossy cap with inner shadow for depth.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 128"
    :height="size ? (size * 28) / 128 : 28"
    viewBox="0 0 128 28"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#86efac" />
        <stop offset="15%" stop-color="#4ade80" />
        <stop offset="40%" stop-color="#22c55e" />
        <stop offset="70%" stop-color="#16a34a" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
      <linearGradient id="capGlossLeft" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="capShadowRight" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#022c22" stop-opacity="0" />
        <stop offset="100%" stop-color="#022c22" stop-opacity="0.3" />
      </linearGradient>
      <linearGradient id="rimGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.3" />
      </linearGradient>
      <linearGradient id="segmentLineGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#14532d" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#166534" stop-opacity="0.25" />
      </linearGradient>
      <filter id="capInnerShadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
        <feOffset dx="1" dy="1" result="offset" />
        <feComposite in="offset" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feFlood flood-color="#022c22" flood-opacity="0.25" />
        <feComposite in2="SourceGraphic" operator="over" />
      </filter>
    </defs>

    <!-- Cap base with metallic gradient -->
    <rect x="1" y="1" width="126" height="26" rx="7" fill="url(#capGrad)" stroke="#1a1a1a" stroke-width="2" filter="url(#capInnerShadow)" />

    <!-- Glossy left highlight -->
    <path d="M8 6 Q8 3 13 3 H39 V25 H13 Q8 25 8 22 Z" fill="url(#capGlossLeft)" />

    <!-- Secondary sheen -->
    <path d="M39 4 H55 V24 H39 Z" fill="#ffffff" opacity="0.12" />

    <!-- Right side shadow -->
    <path d="M92 3 H116 Q126 3 126 13 V15 Q126 25 116 25 H92 Z" fill="url(#capShadowRight)" />

    <!-- Rim highlight (white ellipse on top edge) -->
    <ellipse cx="64" cy="5" rx="52" ry="2.5" fill="url(#rimGrad)" opacity="0.6" />

    <!-- Segment lines -->
    <path d="M40 2 V26" stroke="url(#segmentLineGrad)" stroke-width="1.6" />
    <path d="M89 2 V26" stroke="url(#segmentLineGrad)" stroke-width="1.6" />

    <!-- Gloss strip -->
    <rect x="14" y="6" width="17" height="8" rx="4" fill="#ffffff" opacity="0.2" />
  </svg>
</template>
