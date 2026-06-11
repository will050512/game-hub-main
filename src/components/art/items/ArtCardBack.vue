<!--
  ArtCardBack — Frosted glass panel with ornate geometric back pattern.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 80"
    :height="size ?? 80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Border gradient: deep blue → purple → violet -->
      <linearGradient id="cardBackBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="50%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#6d28d9" />
      </linearGradient>
      <!-- Inner frosted glass overlay -->
      <linearGradient id="cardFrost" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
        <stop offset="50%" stop-color="#f1f5f9" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.15" />
      </linearGradient>
      <!-- Center shimmer -->
      <radialGradient id="cardShimmer" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <!-- Outer glow -->
      <filter id="cardGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feFlood flood-color="#8b5cf6" flood-opacity="0.35" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Shadow -->
    <rect x="4" y="5" width="72" height="72" rx="12" fill="#000000" opacity="0.15" />

    <!-- Outer gradient border -->
    <rect x="3" y="3" width="74" height="74" rx="12" fill="url(#cardBackBorder)" stroke="#1e1b4b" stroke-width="2" filter="url(#cardGlow)" />

    <!-- Frosted glass inner -->
    <rect x="7" y="7" width="66" height="66" rx="9" fill="url(#cardFrost)" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.5" />

    <!-- Noise / frosted texture overlay -->
    <rect x="7" y="7" width="66" height="66" rx="9" fill="#ffffff" opacity="0.08" />

    <!-- Ornate geometric pattern - interlocking diamonds -->
    <g opacity="0.6">
      <path d="M40 14 L52 26 L40 38 L28 26 Z" fill="url(#cardShimmer)" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />
      <path d="M40 42 L52 54 L40 66 L28 54 Z" fill="url(#cardShimmer)" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />
      <path d="M14 40 L26 28 L38 40 L26 52 Z" fill="url(#cardShimmer)" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />
      <path d="M54 40 L66 28 L78 40 L66 52 Z" fill="url(#cardShimmer)" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.4" />
    </g>

    <!-- Corner ornaments -->
    <g opacity="0.5">
      <circle cx="16" cy="16" r="2" fill="#ffffff" stroke="#a78bfa" stroke-width="0.6" />
      <circle cx="64" cy="16" r="2" fill="#ffffff" stroke="#a78bfa" stroke-width="0.6" />
      <circle cx="16" cy="64" r="2" fill="#ffffff" stroke="#a78bfa" stroke-width="0.6" />
      <circle cx="64" cy="64" r="2" fill="#ffffff" stroke="#a78bfa" stroke-width="0.6" />
    </g>

    <!-- Center emblem - small diamond -->
    <path d="M40 33 L47 40 L40 47 L33 40 Z" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="1.2" stroke-linejoin="round" opacity="0.7" />
    <circle cx="40" cy="40" r="3" fill="#ffffff" stroke="#a78bfa" stroke-width="1" opacity="0.8" />

    <!-- Decorative lines -->
    <path d="M20 40 H30 M50 40 H60 M40 20 V30 M40 50 V60" stroke="#a78bfa" stroke-width="1.2" stroke-linecap="round" opacity="0.35" />

    <!-- Edge glow dots -->
    <g opacity="0.3">
      <circle cx="40" cy="8" r="1.2" fill="#c4b5fd" />
      <circle cx="40" cy="72" r="1.2" fill="#c4b5fd" />
      <circle cx="8" cy="40" r="1.2" fill="#c4b5fd" />
      <circle cx="72" cy="40" r="1.2" fill="#c4b5fd" />
    </g>
  </svg>
</template>
