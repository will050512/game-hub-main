<!--
  ArtXpGem — Hexagonal crystal gem with glass effect.
  Korean mobile game aesthetic: radial cyan→blue gradient, faceted hexagonal shape,
  internal reflections, pulsing glow aura, orbital sparkle particles.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 20"
    :height="size ?? 20"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Radial crystal body gradient -->
      <radialGradient id="gemBody" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stop-color="#a5f3fc" />
        <stop offset="30%" stop-color="#22d3ee" />
        <stop offset="60%" stop-color="#0891b2" />
        <stop offset="85%" stop-color="#164e63" />
        <stop offset="100%" stop-color="#083344" />
      </radialGradient>

      <!-- Top facet bright reflection -->
      <linearGradient id="gemTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ecfeff" stop-opacity="0.95" />
        <stop offset="50%" stop-color="#67e8f9" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.1" />
      </linearGradient>

      <!-- Left facet (lighter) -->
      <linearGradient id="gemLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#67e8f9" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#0891b2" stop-opacity="0.9" />
      </linearGradient>

      <!-- Right facet (darker) -->
      <linearGradient id="gemRight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0891b2" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#164e63" stop-opacity="0.9" />
      </linearGradient>

      <!-- Bottom facet shadow -->
      <linearGradient id="gemBottom" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#164e63" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#083344" stop-opacity="0.95" />
      </linearGradient>

      <!-- Glass refraction highlight -->
      <radialGradient id="glassRefraction" cx="40%" cy="30%" r="40%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="30%" stop-color="#cffafe" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
      </radialGradient>

      <!-- Inner facet line highlight -->
      <linearGradient id="facetLine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#67e8f9" stop-opacity="0.2" />
      </linearGradient>

      <!-- Outer glow filter -->
      <filter id="gemGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="
          0.5 0 0 0 0.3
          0.8 0 0 0 0.5
          1   0 0 0 0.8
          0   0 0 1 0
        " />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Soft ambient glow -->
      <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
    </defs>

    <!-- Outer pulsing glow aura -->
    <circle cx="10" cy="10" r="9.5" fill="#22d3ee" opacity="0.2" filter="url(#softGlow)">
      <animate attributeName="opacity" values="0.12;0.3;0.12" dur="2s" repeatCount="indefinite" />
      <animate attributeName="r" values="8.5;10;8.5" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Mid glow ring -->
    <circle cx="10" cy="10" r="8.5" fill="#06b6d4" opacity="0.15">
      <animate attributeName="opacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Hexagonal gem body (6 facets for 3D crystal look) -->
    <!-- Top facet -->
    <path d="M10 1.5 L15.2 5.5 L15.2 11 L10 11 L7 11 L7 5.5 Z"
      fill="url(#gemTop)"
      stroke="#0e7490"
      stroke-width="0.6"
      stroke-linejoin="round"
    />

    <!-- Top-right facet -->
    <path d="M15.2 5.5 L18.5 10 L15.2 11 Z"
      fill="#06b6d4"
      stroke="#0891b2"
      stroke-width="0.5"
      stroke-linejoin="round"
      opacity="0.85"
    />

    <!-- Right facet (shadowed) -->
    <path d="M15.2 11 L18.5 15 L15.2 17 L10 17 Z"
      fill="#0891b2"
      stroke="#164e63"
      stroke-width="0.5"
      stroke-linejoin="round"
      opacity="0.8"
    />

    <!-- Bottom facet -->
    <path d="M10 17 L7 17 L3.5 15 L3.5 10 L7 5.5 L7 11 Z"
      fill="url(#gemBottom)"
      stroke="#164e63"
      stroke-width="0.6"
      stroke-linejoin="round"
      opacity="0.85"
    />

    <!-- Left facet (lit side) -->
    <path d="M7 5.5 L3.5 10 L7 11 L10 11 L10 1.5 Z"
      fill="url(#gemLeft)"
      stroke="#06b6d4"
      stroke-width="0.5"
      stroke-linejoin="round"
    />

    <!-- Full body overlay for smooth gradient -->
    <path d="M10 1.5 L18.5 10 L15.2 17 L4.8 17 L1.5 10 L4.8 3 Z"
      fill="url(#gemBody)"
      stroke="#0e7490"
      stroke-width="0.8"
      stroke-linejoin="round"
    />

    <!-- Glass refraction overlay -->
    <path d="M10 1.5 L18.5 10 L15.2 17 L4.8 17 L1.5 10 L4.8 3 Z"
      fill="url(#glassRefraction)"
      opacity="0.6"
    />

    <!-- Internal facet lines for crystalline structure -->
    <line x1="10" y1="1.5" x2="10" y2="17" stroke="white" stroke-width="0.4" opacity="0.4" />
    <line x1="1.5" y1="10" x2="18.5" y2="10" stroke="white" stroke-width="0.3" opacity="0.3" />
    <line x1="10" y1="1.5" x2="4.8" y2="17" stroke="white" stroke-width="0.3" opacity="0.2" />
    <line x1="10" y1="1.5" x2="15.2" y2="17" stroke="white" stroke-width="0.3" opacity="0.2" />

    <!-- Bright edge highlight on left facets -->
    <path d="M10 1.5 L1.5 10 L4.8 17"
      stroke="#ecfeff"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.5"
    />

    <!-- Top edge specular highlight -->
    <path d="M7 5.5 L10 1.5 L15.2 5.5"
      stroke="#ffffff"
      stroke-width="1"
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity="0.6"
    />

    <!-- Glass reflection streak (diagonal) -->
    <path d="M5.5 4 L13.5 14"
      stroke="#ffffff"
      stroke-width="0.8"
      stroke-linecap="round"
      opacity="0.35"
    />

    <!-- Glossy spot on upper-left facet -->
    <ellipse cx="7" cy="6" rx="2" ry="2.5"
      fill="white"
      opacity="0.35"
      transform="rotate(-30 7 6)"
    />

    <!-- Central sparkle point -->
    <circle cx="10" cy="5.5" r="1.2" fill="#ffffff" opacity="0.8" filter="url(#gemGlow)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
    </circle>

    <!-- Orbiting sparkle 1 (top-right) -->
    <circle cx="17" cy="4" r="1" fill="#cffafe" opacity="0.7">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      <animate attributeName="cy" values="4;3;4" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Orbiting sparkle 2 (bottom-left) -->
    <circle cx="4" cy="16" r="0.8" fill="#a5f3fc" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.3s" repeatCount="indefinite" />
      <animate attributeName="cy" values="16;15;16" dur="2.2s" repeatCount="indefinite" />
    </circle>

    <!-- Tiny twinkle bottom-right -->
    <circle cx="15" cy="15" r="0.5" fill="#67e8f9" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.7;0.2" dur="0.9s" repeatCount="indefinite" />
    </circle>
  </svg>
</template>
