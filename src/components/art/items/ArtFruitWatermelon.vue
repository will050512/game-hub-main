<!--
  ArtFruitWatermelon — Half-slice watermelon with 3D depth, seeds, and glossy finish.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 36"
    :height="size ?? 36"
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Watermelon rind gradient (dark green outer) -->
      <linearGradient id="melonRind" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4ade80"/>
        <stop offset="30%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <!-- Watermelon flesh gradient (red, lighter at center) -->
      <radialGradient id="melonFlesh" cx="50%" cy="70%" r="70%">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="20%" stop-color="#f87171"/>
        <stop offset="50%" stop-color="#ef4444"/>
        <stop offset="80%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#b91c1c"/>
      </radialGradient>
      <!-- Glossy overlay -->
      <radialGradient id="melonGloss" cx="30%" cy="20%" r="60%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <!-- Drop shadow -->
      <filter id="melonShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.8"/>
        <feOffset dx="0" dy="2.5"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Drop shadow -->
    <ellipse cx="18" cy="33" rx="12" ry="2.5" fill="#000" opacity="0.15"/>

    <!-- Outer rind - half circle shape -->
    <path
      d="M4 26 Q18 4 32 26 Q18 3 4 26Z"
      fill="url(#melonRind)"
      stroke="#15803d"
      stroke-width="2"
      stroke-linejoin="round"
      filter="url(#melonShadow)"
    />

    <!-- White border between rind and flesh -->
    <path
      d="M7 25 Q18 7 29 25 Q18 5 7 25Z"
      fill="#f0fdf4"
      opacity="0.9"
    />

    <!-- Red flesh inner -->
    <path
      d="M9 24.5 Q18 10 27 24.5 Q18 8 9 24.5Z"
      fill="url(#melonFlesh)"
      stroke="#dc2626"
      stroke-width="0.8"
      stroke-linejoin="round"
    />

    <!-- Glossy overlay on flesh -->
    <path
      d="M9 24.5 Q18 10 27 24.5 Q18 8 9 24.5Z"
      fill="url(#melonGloss)"
    />

    <!-- Black seeds -->
    <ellipse cx="15" cy="19" rx="0.8" ry="1.5" fill="#1c1917" transform="rotate(-15 15 19)"/>
    <ellipse cx="21" cy="19" rx="0.8" ry="1.5" fill="#1c1917" transform="rotate(15 21 19)"/>
    <ellipse cx="18" cy="23" rx="0.8" ry="1.5" fill="#1c1917"/>
    <ellipse cx="13" cy="21.5" rx="0.7" ry="1.3" fill="#1c1917" transform="rotate(-10 13 21.5)"/>
    <ellipse cx="23" cy="21.5" rx="0.7" ry="1.3" fill="#1c1917" transform="rotate(10 23 21.5)"/>
    <ellipse cx="18" cy="15" rx="0.8" ry="1.5" fill="#1c1917" transform="rotate(5 18 15)"/>

    <!-- Cute face on watermelon -->
    <circle cx="14.5" cy="17" r="1.2" fill="#1c1917"/>
    <circle cx="14.5" cy="17" r="0.45" fill="#fff"/>
    <circle cx="21.5" cy="17" r="1.2" fill="#1c1917"/>
    <circle cx="21.5" cy="17" r="0.45" fill="#fff"/>

    <!-- Cute smile -->
    <path
      d="M16 20 Q18 22 20 20"
      stroke="#7f1d1d"
      stroke-width="1"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Cheek blush -->
    <circle cx="12.5" cy="19.5" r="2" fill="#f87171" opacity="0.3"/>
    <circle cx="23.5" cy="19.5" r="2" fill="#f87171" opacity="0.3"/>

    <!-- Glossy highlight on rind -->
    <path
      d="M8 22 Q12 14 16 12"
      stroke="#fff"
      stroke-width="2.5"
      stroke-linecap="round"
      opacity="0.3"
      fill="none"
    />
  </svg>
</template>
