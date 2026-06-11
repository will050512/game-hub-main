<!--
  ArtEnemyProjectile — Menacing red energy orb fired by enemies.
  Dark RPG aesthetic: radial red→dark gradient, pulsing glow aura,
  dark core with ember highlights.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Core body gradient: bright red to dark crimson -->
      <radialGradient id="enemyProjBody" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#fca5a5" />
        <stop offset="30%" stop-color="#ef4444" />
        <stop offset="70%" stop-color="#dc2626" />
        <stop offset="100%" stop-color="#7f1d1d" />
      </radialGradient>

      <!-- Outer glow -->
      <filter id="enemyProjGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feFlood flood-color="#ef4444" flood-opacity="0.6" />
        <feComposite in2="blur" operator="in" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Bright specular highlight -->
      <radialGradient id="enemyProjSpec" cx="40%" cy="35%" r="30%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Ambient glow aura -->
    <circle cx="8" cy="8" r="7" fill="#ef4444" opacity="0.15" />

    <!-- Main orb body -->
    <circle cx="8" cy="8" r="5.5" fill="url(#enemyProjBody)" filter="url(#enemyProjGlow)" />

    <!-- Dark ember ring -->
    <circle cx="8" cy="8" r="4" fill="#991b1b" opacity="0.4" />

    <!-- Core dark center -->
    <circle cx="8" cy="8" r="2" fill="#450a0a" opacity="0.5" />

    <!-- Specular highlight (top-left) -->
    <circle cx="6" cy="6" r="1.5" fill="url(#enemyProjSpec)" />

    <!-- Ember trail (bottom-right streak) -->
    <path d="M11 11 L13.5 13.5" stroke="#f87171" stroke-width="0.8" stroke-linecap="round" opacity="0.5" />
    <circle cx="14" cy="14" r="0.6" fill="#fca5a5" opacity="0.3" />
  </svg>
</template>
