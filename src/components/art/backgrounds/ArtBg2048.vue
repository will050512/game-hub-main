<!--
  ArtBg2048 — Gradient mesh board with floating particles.
  Korean mobile game aesthetic: dark gradient mesh + depth particles.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 400"
    :height="size ?? 400"
    viewBox="0 0 400 400"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="mesh1" cx="0.25" cy="0.2" r="0.7">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      <radialGradient id="mesh2" cx="0.75" cy="0.3" r="0.6">
        <stop offset="0%" stop-color="#1e3a8a" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      <radialGradient id="mesh3" cx="0.5" cy="0.8" r="0.65">
        <stop offset="0%" stop-color="#4c1d95" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      <radialGradient id="mesh4" cx="0.15" cy="0.65" r="0.5">
        <stop offset="0%" stop-color="#1e40af" />
        <stop offset="100%" stop-color="#0f172a" />
      </radialGradient>
      <radialGradient id="meshHighlight" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="boardGrad" x1="0" y1="0" x2="400" y2="400">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e293b" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <filter id="particleBlur">
        <feGaussianBlur stdDeviation="0.8" />
      </filter>
      <filter id="softGlow">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Base board -->
    <rect x="1" y="1" width="398" height="398" rx="24" fill="url(#boardGrad)" stroke="#1a1a1a" stroke-width="2" />

    <!-- Gradient mesh layers -->
    <rect x="1" y="1" width="398" height="398" rx="24" fill="url(#mesh1)" opacity="0.5" />
    <rect x="1" y="1" width="398" height="398" rx="24" fill="url(#mesh2)" opacity="0.35" />
    <rect x="1" y="1" width="398" height="398" rx="24" fill="url(#mesh3)" opacity="0.3" />
    <rect x="1" y="1" width="398" height="398" rx="24" fill="url(#mesh4)" opacity="0.2" />
    <rect x="1" y="1" width="398" height="398" rx="24" fill="url(#meshHighlight)" />

    <!-- Floating particles -->
    <g opacity="0.25" filter="url(#particleBlur)">
      <circle cx="45" cy="60" r="3" fill="#60a5fa" />
      <circle cx="340" cy="45" r="2.5" fill="#a78bfa" />
      <circle cx="200" cy="30" r="2" fill="#93c5fd" />
      <circle cx="100" cy="180" r="2.8" fill="#c4b5fd" />
      <circle cx="320" cy="160" r="1.8" fill="#7dd3fc" />
      <circle cx="60" cy="300" r="2.2" fill="#818cf8" />
      <circle cx="350" cy="280" r="2.5" fill="#a5b4fc" />
      <circle cx="180" cy="350" r="1.5" fill="#93c5fd" />
      <circle cx="280" cy="370" r="2" fill="#c4b5fd" />
      <circle cx="140" cy="100" r="1.8" fill="#7dd3fc" />
      <circle cx="260" cy="80" r="2.2" fill="#60a5fa" />
      <circle cx="80" cy="220" r="1.5" fill="#a78bfa" />
      <circle cx="300" cy="220" r="2" fill="#94a3b8" />
      <circle cx="50" cy="150" r="1.2" fill="#cbd5e1" />
      <circle cx="370" cy="120" r="1.8" fill="#93c5fd" />
      <circle cx="160" cy="280" r="2.3" fill="#a78bfa" />
      <circle cx="220" cy="200" r="1.6" fill="#7dd3fc" />
      <circle cx="380" cy="340" r="2" fill="#818cf8" />
      <circle cx="120" cy="350" r="1.4" fill="#93c5fd" />
      <circle cx="240" cy="140" r="1.9" fill="#c4b5fd" />
    </g>

    <!-- Brighter sparkle particles -->
    <g opacity="0.12" filter="url(#softGlow)">
      <circle cx="70" cy="90" r="4" fill="#93c5fd" />
      <circle cx="330" cy="70" r="3.5" fill="#a78bfa" />
      <circle cx="150" cy="310" r="3" fill="#7dd3fc" />
      <circle cx="300" cy="310" r="3.5" fill="#c4b5fd" />
      <circle cx="200" cy="200" r="2.5" fill="#93c5fd" />
    </g>

    <!-- Grid cells -->
    <g fill="#fef3c7" stroke="#1a1a1a" stroke-width="1.6">
      <rect x="16" y="16" width="88" height="88" rx="14" />
      <rect x="112" y="16" width="88" height="88" rx="14" />
      <rect x="208" y="16" width="88" height="88" rx="14" />
      <rect x="304" y="16" width="80" height="88" rx="14" />
      <rect x="16" y="112" width="88" height="88" rx="14" />
      <rect x="112" y="112" width="88" height="88" rx="14" />
      <rect x="208" y="112" width="88" height="88" rx="14" />
      <rect x="304" y="112" width="80" height="88" rx="14" />
      <rect x="16" y="208" width="88" height="88" rx="14" />
      <rect x="112" y="208" width="88" height="88" rx="14" />
      <rect x="208" y="208" width="88" height="88" rx="14" />
      <rect x="304" y="208" width="80" height="88" rx="14" />
      <rect x="16" y="304" width="88" height="80" rx="14" />
      <rect x="112" y="304" width="88" height="80" rx="14" />
      <rect x="208" y="304" width="88" height="80" rx="14" />
      <rect x="304" y="304" width="80" height="80" rx="14" />
    </g>
  </svg>
</template>
