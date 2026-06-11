<!--
  ArtGround — Gradient ground platform with grass texture.
  Korean mobile game aesthetic: layered earth tones with grass strip and pattern overlay.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 256"
    :height="size ? (size * 88) / 256 : 88"
    viewBox="0 0 256 88"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4ade80" />
        <stop offset="40%" stop-color="#22c55e" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
      <linearGradient id="dirtGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#92400e" />
        <stop offset="30%" stop-color="#78350f" />
        <stop offset="100%" stop-color="#451a03" />
      </linearGradient>
      <linearGradient id="grassStripe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#86efac" />
        <stop offset="100%" stop-color="#4ade80" />
      </linearGradient>
      <linearGradient id="topsoilGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#166534" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
      <pattern id="grassPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M4 0 L2 5 M4 0 L4 6 M4 0 L6 5" stroke="#22c55e" stroke-width="0.6" opacity="0.35" stroke-linecap="round" />
      </pattern>
      <pattern id="dirtPattern" x="0" y="24" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect x="1" y="2" width="4" height="1.5" rx="0.5" fill="#451a03" opacity="0.2" />
        <rect x="7" y="6" width="3" height="1" rx="0.5" fill="#7c2d12" opacity="0.15" />
        <rect x="3" y="10" width="5" height="1.2" rx="0.5" fill="#451a03" opacity="0.18" />
      </pattern>
      <filter id="groundTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" />
        <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
        <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" />
      </filter>
      <linearGradient id="grassEdge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#4ade80" />
        <stop offset="20%" stop-color="#86efac" />
        <stop offset="50%" stop-color="#4ade80" />
        <stop offset="80%" stop-color="#22c55e" />
        <stop offset="100%" stop-color="#15803d" />
      </linearGradient>
    </defs>

    <!-- Dirt base -->
    <path d="M1 23 H255 V87 H1 Z" fill="url(#dirtGrad)" stroke="#1a1a1a" stroke-width="2" />

    <!-- Dirt texture pattern overlay -->
    <path d="M1 23 H255 V87 H1 Z" fill="url(#dirtPattern)" />

    <!-- Dirt detail lines -->
    <path d="M10 20 L20 8 L31 20 L43 6 L56 20 L69 9 L82 20 L95 7 L109 20 L123 8 L136 20 L150 6 L164 20 L178 9 L191 20 L205 7 L219 20 L233 8 L246 20" fill="url(#grassEdge)" />

    <!-- Grass surface strip -->
    <rect x="1" y="1" width="254" height="22" rx="5" fill="url(#grassGrad)" stroke="#1a1a1a" stroke-width="2" />

    <!-- Grass pattern overlay -->
    <rect x="1" y="1" width="254" height="22" rx="5" fill="url(#grassPattern)" />

    <!-- Grass edge highlight -->
    <path d="M1 23 L255 23" stroke="url(#topsoilGrad)" stroke-width="1.8" />

    <!-- Grass tufts for texture -->
    <path d="M15 23 Q16 16 14 12 Q17 16 18 23" fill="#22c55e" opacity="0.7" />
    <path d="M45 23 Q46 15 44 10 Q47 15 48 23" fill="#4ade80" opacity="0.6" />
    <path d="M75 23 Q76 17 74 13 Q77 17 78 23" fill="#22c55e" opacity="0.75" />
    <path d="M105 23 Q106 14 104 9 Q107 14 108 23" fill="#86efac" opacity="0.5" />
    <path d="M135 23 Q136 16 134 12 Q137 16 138 23" fill="#4ade80" opacity="0.65" />
    <path d="M165 23 Q166 15 164 11 Q167 15 168 23" fill="#22c55e" opacity="0.7" />
    <path d="M195 23 Q196 17 194 13 Q197 17 198 23" fill="#4ade80" opacity="0.55" />
    <path d="M225 23 Q226 14 224 10 Q227 14 228 23" fill="#22c55e" opacity="0.6" />

    <!-- Soil layer lines -->
    <path d="M1 23 H255" stroke="#15803d" stroke-width="1.2" opacity="0.6" />
    <path d="M25 37 H54 M76 53 H112 M137 35 H165 M185 62 H225" stroke="#7c2d12" stroke-width="2" stroke-linecap="round" opacity="0.65" />
    <path d="M18 70 H39 M61 38 H88 M115 67 H148 M171 45 H207 M220 76 H242" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" opacity="0.7" />

    <!-- Pebbles and texture dots -->
    <circle cx="45" cy="53" r="4" fill="#854d0e" opacity="0.72" />
    <circle cx="154" cy="57" r="5" fill="#854d0e" opacity="0.72" />
    <circle cx="214" cy="36" r="3.5" fill="#854d0e" opacity="0.72" />
    <circle cx="90" cy="75" r="2.5" fill="#451a03" opacity="0.5" />
    <circle cx="180" cy="48" r="2" fill="#7c2d12" opacity="0.45" />
    <circle cx="130" cy="72" r="1.8" fill="#92400e" opacity="0.4" />
  </svg>
</template>
