<!--
  ArtSpecialFood — Magical diamond power-up food (slow / wall_pass / shrink / golden_apple).
  Tintable: drawSprite passes variant→ propsByVariant maps a base color.
  Korean mobile game aesthetic: pulsing glow, orbiting sparkles, radial magic aura.
-->
<script setup lang="ts">
defineProps<{ size?: number; color?: string }>()
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
      <!-- Main body gradient -->
      <radialGradient id="foodGrad" cx="50%" cy="35%" r="50%">
        <stop offset="0%" stop-color="white" stop-opacity="0.9" />
        <stop offset="25%" stop-color="currentColor" stop-opacity="0.95" />
        <stop offset="100%" stop-color="currentColor" stop-opacity="1" />
      </radialGradient>

      <!-- Glow pulse filter -->
      <filter id="foodGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="
          1 0 0 0 0.6
          0 1 0 0 0.4
          0 0 1 0 0.3
          0 0 0 1 0
        " result="glowColor" />
        <feMerge>
          <feMergeNode in="glowColor" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Soft outer glow -->
      <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" />
      </filter>

      <!-- Inner facet gradient -->
      <linearGradient id="facetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="white" stop-opacity="0.8" />
        <stop offset="100%" stop-color="white" stop-opacity="0.1" />
      </linearGradient>
    </defs>

    <!-- Outer pulsing glow aura (animated) -->
    <circle cx="16" cy="16" r="14" fill="currentColor" opacity="0.12" filter="url(#softGlow)">
      <animate attributeName="r" values="13;15.5;13" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Mid glow ring -->
    <circle cx="16" cy="16" r="12" :stroke="color ?? '#a78bfa'" stroke-width="1.5" opacity="0.3" filter="url(#foodGlow)">
      <animate attributeName="opacity" values="0.2;0.45;0.2" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Outer decorative ring with dash animation -->
    <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="0.6" stroke-dasharray="3 4" opacity="0.4">
      <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="12s" repeatCount="indefinite" />
    </circle>

    <!-- Diamond shape with gradient -->
    <path
      d="M16 4 L26 16 L16 28 L6 16 Z"
      :fill="color ?? '#a78bfa'"
      stroke="#0f0f2d"
      stroke-width="1.2"
      stroke-linejoin="round"
    />

    <!-- Diamond body overlay for 3D shading -->
    <path
      d="M16 4 L26 16 L16 28 L6 16 Z"
      :stroke="color ?? '#a78bfa'"
      stroke-width="0.8"
      fill="url(#facetGrad)"
    />

    <!-- Inner facets (crystal cut lines) -->
    <path d="M16 4 L20 16 L16 28" stroke="white" stroke-width="0.8" opacity="0.6" />
    <path d="M6 16 L26 16" stroke="white" stroke-width="0.8" opacity="0.5" />
    <path d="M16 4 L12 16" stroke="white" stroke-width="0.6" opacity="0.35" />

    <!-- Top-left highlight facet -->
    <path d="M16 4 L16 16 L6 16 L10 10 Z" fill="white" opacity="0.15" />

    <!-- Glossy top highlight -->
    <ellipse cx="12.5" cy="10" rx="2.2" ry="3" fill="white" opacity="0.75" transform="rotate(-25 12.5 10)" />

    <!-- Bottom shadow facet -->
    <path d="M6 16 L16 28 L26 16 L16 16 Z" fill="#0f0f2d" opacity="0.15" />

    <!-- Orbiting sparkle 1 (top-right) -->
    <g opacity="0.9">
      <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="6s" repeatCount="indefinite" />
      <g transform="translate(27, 16)">
        <path d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" fill="#fef3c7">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
        </path>
      </g>
    </g>

    <!-- Orbiting sparkle 2 (bottom-left, counter-rotating) -->
    <g opacity="0.8">
      <animateTransform attributeName="transform" type="rotate" from="360 16 16" to="0 16 16" dur="8s" repeatCount="indefinite" />
      <g transform="translate(9, 25)">
        <path d="M0 -2.5 L0.6 -0.6 L2.5 0 L0.6 0.6 L0 2.5 L-0.6 0.6 L-2.5 0 L-0.6 -0.6 Z" fill="#fef9c3">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1.4s" repeatCount="indefinite" />
        </path>
      </g>
    </g>

    <!-- Tiny twinkle top-right -->
    <circle cx="23" cy="8" r="1" fill="#fef3c7">
      <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
    </circle>

    <!-- Tiny twinkle bottom-left -->
    <circle cx="7" cy="23" r="0.8" fill="#fef3c7">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.2s" repeatCount="indefinite" />
    </circle>

    <!-- Tiny twinkle mid-left -->
    <circle cx="8" cy="14" r="0.6" fill="white" opacity="0.6">
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.9s" repeatCount="indefinite" />
    </circle>
  </svg>
</template>
