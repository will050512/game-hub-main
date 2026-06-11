<!--
  ArtPortal — Swirling vortex portal for arena 'portal_zone' modifier.
  Korean mobile game aesthetic: radiant center glow, orbiting particles, pulsing aura.
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
      <!-- Radiant center glow -->
      <radialGradient id="portalCenter" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ede9fe" stop-opacity="1" />
        <stop offset="20%" stop-color="#e9d5ff" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.6" />
        <stop offset="80%" stop-color="#5b21b6" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
      </radialGradient>

      <!-- Outer aura glow -->
      <radialGradient id="portalAura" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stop-color="#7c3aed" stop-opacity="0" />
        <stop offset="85%" stop-color="#a78bfa" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#c4b5fd" stop-opacity="0.15" />
      </radialGradient>

      <!-- Swirl arm gradient -->
      <linearGradient id="swirlGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f5f3ff" stop-opacity="0.9" />
        <stop offset="30%" stop-color="#e9d5ff" stop-opacity="0.7" />
        <stop offset="70%" stop-color="#8b5cf6" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#5b21b6" stop-opacity="0" />
      </linearGradient>

      <linearGradient id="swirlGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f9a8d4" stop-opacity="0.8" />
        <stop offset="40%" stop-color="#c084fc" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#7c3aed" stop-opacity="0" />
      </linearGradient>

      <!-- Portal glow filter -->
      <filter id="portalGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <!-- Deep void gradient -->
      <radialGradient id="voidGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0f0a20" />
        <stop offset="60%" stop-color="#1a1035" />
        <stop offset="100%" stop-color="#0f0a20" />
      </radialGradient>
    </defs>

    <!-- Outer pulsing aura -->
    <circle cx="18" cy="18" r="17" fill="url(#portalAura)">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
    </circle>

    <!-- Soft glow background -->
    <circle cx="18" cy="18" r="16" fill="#8b5cf6" opacity="0.15" filter="url(#portalGlow)">
      <animate attributeName="r" values="15;16.5;15" dur="3s" repeatCount="indefinite" />
    </circle>

    <!-- Rotating particle ring 1 (clockwise) -->
    <g opacity="0.7">
      <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="8s" repeatCount="indefinite" />
      <circle cx="32" cy="18" r="1.5" fill="#e9d5ff" filter="url(#portalGlow)" />
      <circle cx="6" cy="18" r="1" fill="#f9a8d4" />
      <circle cx="18" cy="4" r="0.8" fill="#c4b5fd" />
    </g>

    <!-- Rotating particle ring 2 (counter-clockwise, faster) -->
    <g opacity="0.6">
      <animateTransform attributeName="transform" type="rotate" from="360 18 18" to="0 18 18" dur="5s" repeatCount="indefinite" />
      <circle cx="28" cy="26" r="1.2" fill="#f5f3ff" filter="url(#portalGlow)" />
      <circle cx="10" cy="10" r="0.9" fill="#e9d5ff" />
      <circle cx="14" cy="30" r="0.7" fill="#c084fc" />
    </g>

    <!-- Outer ring -->
    <circle cx="18" cy="18" r="14" fill="none" stroke="#a78bfa" stroke-width="1.8" opacity="0.6">
      <animate attributeName="stroke-opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite" />
    </circle>

    <!-- Inner ring -->
    <circle cx="18" cy="18" r="11" fill="none" stroke="#c084fc" stroke-width="1.2" opacity="0.4" />

    <!-- Swirl arm 1 (upper) -->
    <path
      d="M18 6 A12 12 0 0 1 30 18"
      stroke="url(#swirlGrad1)"
      stroke-width="1.8"
      stroke-linecap="round"
      fill="none"
    >
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite" />
    </path>

    <!-- Swirl arm 2 (lower) -->
    <path
      d="M18 30 A12 12 0 0 1 6 18"
      stroke="url(#swirlGrad2)"
      stroke-width="1.8"
      stroke-linecap="round"
      fill="none"
    >
      <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" begin="1s" repeatCount="indefinite" />
    </path>

    <!-- Swirl arm 3 (right side) -->
    <path
      d="M30 18 A12 12 0 0 1 18 30"
      stroke="url(#swirlGrad1)"
      stroke-width="1.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.5"
    >
      <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="-360 18 18" dur="12s" repeatCount="indefinite" />
    </path>

    <!-- Center void -->
    <circle cx="18" cy="18" r="6" fill="url(#voidGrad)" stroke="#4c1d95" stroke-width="1" />

    <!-- Inner glow ring around void -->
    <circle cx="18" cy="18" r="5.5" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5" filter="url(#portalGlow)">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite" />
    </circle>

    <!-- Center bright core -->
    <circle cx="18" cy="18" r="2.5" fill="#fef3c7" opacity="0.9" filter="url(#portalGlow)">
      <animate attributeName="r" values="2;3.2;2" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
    </circle>

    <!-- Center sparkle star -->
    <path d="M18 13 L18.5 17 L22 17.5 L18.5 18 L18 22 L17.5 18 L14 17.5 L17.5 17 Z" fill="#fef3c7" opacity="0.8">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.2s" repeatCount="indefinite" />
    </path>

    <!-- Orbital sparkles -->
    <circle cx="14" cy="14" r="0.8" fill="white" opacity="0.7">
      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="23" cy="21" r="0.6" fill="#e9d5ff" opacity="0.6">
      <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.1s" repeatCount="indefinite" />
    </circle>
    <circle cx="13" cy="22" r="0.5" fill="#f9a8d4" opacity="0.5">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="0.9s" repeatCount="indefinite" />
    </circle>
  </svg>
</template>
