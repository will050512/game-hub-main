<!--
  ArtGoldenApple — Metallic gold sphere with pulsing glow, stem, gold leaf, sparkle.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 28"
    :height="size ?? 28"
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Gold body radial gradient: light gold → gold → bronze -->
      <radialGradient id="goldenBody" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="20%" stop-color="#fbbf24" />
        <stop offset="55%" stop-color="#d97706" />
        <stop offset="100%" stop-color="#92400e" />
      </radialGradient>
      <!-- Pulsing glow filter -->
      <filter id="goldenGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feFlood flood-color="#f59e0b" flood-opacity="0.7" result="color" />
        <feComposite in="color" in2="blur" operator="in" result="glow" />
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <!-- Stem gradient -->
      <linearGradient id="goldenStem" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#84cc16" />
        <stop offset="100%" stop-color="#65a30d" />
      </linearGradient>
      <!-- Gold leaf gradient -->
      <linearGradient id="goldenLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#a3e635" />
        <stop offset="100%" stop-color="#4d7c0f" />
      </linearGradient>
      <!-- Glossy highlight -->
      <radialGradient id="goldenGloss" cx="30%" cy="30%" r="40%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <!-- Bottom shadow -->
      <radialGradient id="goldenShadow" cx="70%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#78350f" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#78350f" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Pulsing glow behind apple -->
    <path
      d="M14 6 Q7 7 6.5 15 Q6 24 14 24 Q22 24 21.5 15 Q21 6 14 6 Z"
      fill="#f59e0b"
      opacity="0.25"
      filter="url(#goldenGlow)"
    >
      <animate attributeName="opacity" values="0.2;0.35;0.2" dur="2s" repeatCount="indefinite" />
    </path>

    <!-- Star sparkle behind -->
    <g opacity="0.7">
      <path d="M14 0 L15 4.5 L19 5 L15.5 7 L15 11 L13.5 7 L10 5 L14 4.5 Z" fill="#fef3c7">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
      </path>
    </g>

    <!-- Stem -->
    <rect x="13" y="2" width="2.2" height="5" rx="1" fill="url(#goldenStem)" />

    <!-- Gold leaf -->
    <path d="M15 3 Q21 2 20 8 Q15 7.5 15 3 Z" fill="url(#goldenLeaf)" />
    <path d="M15 4 Q18.5 3.5 19.5 6" stroke="#365314" stroke-width="0.6" fill="none" opacity="0.4" />

    <!-- Apple body -->
    <path
      d="M14 7 Q7 8 6.5 15.5 Q6 23.5 14 23.5 Q22 23.5 21.5 15.5 Q21 7 14 7 Z"
      fill="url(#goldenBody)"
    />

    <!-- Bottom shadow overlay -->
    <path
      d="M14 7 Q7 8 6.5 15.5 Q6 23.5 14 23.5 Q22 23.5 21.5 15.5 Q21 7 14 7 Z"
      fill="url(#goldenShadow)"
    />

    <!-- Glossy highlight -->
    <ellipse cx="10.5" cy="11.5" rx="3" ry="2.5" fill="url(#goldenGloss)" />

    <!-- Sparkle on body -->
    <path d="M19.5 14 L20 15.5 L21.5 16 L20 16.5 L19.5 18 L19 16.5 L17.5 16 L19 15.5 Z" fill="#ffffff" opacity="0.85">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
    </path>

    <!-- Face -->
    <circle cx="11" cy="18" r="1" fill="#78350f" />
    <circle cx="17" cy="18" r="1" fill="#78350f" />
    <path d="M12 20.5 Q14 22 16 20.5" stroke="#78350f" stroke-width="0.9" stroke-linecap="round" fill="none" />

    <!-- Extra sparkle dots -->
    <circle cx="8" cy="10" r="0.6" fill="#ffffff" opacity="0.6">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite" />
    </circle>
    <circle cx="20" cy="20" r="0.5" fill="#ffffff" opacity="0.5">
      <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2.8s" repeatCount="indefinite" />
    </circle>
  </svg>
</template>
