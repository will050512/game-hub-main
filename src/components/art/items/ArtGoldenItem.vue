<!--
  ArtGoldenItem — Golden gem with metallic finish, pulsing glow and crown detail.
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
      <!-- Golden metallic radial gradient -->
      <radialGradient id="goldBody" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="15%" stop-color="#fde047"/>
        <stop offset="40%" stop-color="#f59e0b"/>
        <stop offset="70%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </radialGradient>
      <!-- Gold body 3D gradient for sphere -->
      <radialGradient id="goldSphere" cx="30%" cy="25%" r="70%">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="10%" stop-color="#fef3c7"/>
        <stop offset="30%" stop-color="#fbbf24"/>
        <stop offset="60%" stop-color="#d97706"/>
        <stop offset="85%" stop-color="#b45309"/>
        <stop offset="100%" stop-color="#78350f"/>
      </radialGradient>
      <!-- Crown / laurel metallic gradient -->
      <linearGradient id="crownMetal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
      <!-- Red gem on crown -->
      <radialGradient id="redGem" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="40%" stop-color="#ef4444"/>
        <stop offset="100%" stop-color="#991b1b"/>
      </radialGradient>
      <!-- Blue gem on crown -->
      <radialGradient id="blueGem" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#93c5fd"/>
        <stop offset="40%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#1e3a8a"/>
      </radialGradient>
      <!-- Pulsing glow filter -->
      <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="glow"/>
        <feFlood flood-color="#fbbf24" flood-opacity="0.5" result="color"/>
        <feComposite in="color" in2="glow" operator="in" result="coloredGlow"/>
        <feMerge>
          <feMergeNode in="coloredGlow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Drop shadow -->
      <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
        <feOffset dx="0" dy="2"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Diamond faceted shine -->
      <linearGradient id="diamondShine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.6"/>
        <stop offset="30%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0.1"/>
      </linearGradient>
    </defs>

    <!-- Pulsing outer glow -->
    <circle cx="18" cy="18" r="16" fill="#fbbf24" opacity="0.12" filter="url(#goldGlow)">
      <animate attributeName="r" values="15;18;15" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite"/>
    </circle>

    <!-- Sparkle particles -->
    <g opacity="0.6">
      <path d="M4 6 L4.5 7.5 L6 8 L4.5 8.5 L4 10 L3.5 8.5 L2 8 L3.5 7.5 Z" fill="#fef08a">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.3s" repeatCount="indefinite"/>
      </path>
    </g>
    <g opacity="0.5">
      <path d="M32 5 L32.3 6.5 L34 7 L32.3 7.5 L32 9 L31.7 7.5 L30 7 L31.7 6.5 Z" fill="#fde047">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.7s" repeatCount="indefinite"/>
      </path>
    </g>
    <g opacity="0.4">
      <path d="M33 28 L33.3 29.5 L35 30 L33.3 30.5 L33 32 L32.7 30.5 L31 30 L32.7 29.5 Z" fill="#fef08a">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
      </path>
    </g>

    <!-- Golden gem shape - diamond -->
    <path
      d="M18 4 L28 14 L18 32 L8 14 Z"
      fill="url(#goldSphere)"
      stroke="#92400e"
      stroke-width="2"
      stroke-linejoin="round"
      filter="url(#goldShadow)"
    />

    <!-- Facet lines on diamond -->
    <path d="M8 14 L28 14" stroke="#fff" stroke-width="1.2" opacity="0.45"/>
    <path d="M18 4 L8 14" stroke="#fff" stroke-width="1" opacity="0.35"/>
    <path d="M18 4 L28 14" stroke="#fff" stroke-width="1" opacity="0.35"/>
    <path d="M18 4 L18 32" stroke="#fff" stroke-width="1" opacity="0.2"/>
    <path d="M8 14 L18 32" stroke="#fff" stroke-width="1" opacity="0.2"/>
    <path d="M28 14 L18 32" stroke="#fff" stroke-width="1" opacity="0.2"/>
    <path d="M18 4 L13 14" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
    <path d="M18 4 L23 14" stroke="#fff" stroke-width="0.8" opacity="0.3"/>

    <!-- Diamond shine overlay -->
    <path
      d="M18 4 L28 14 L18 32 L8 14 Z"
      fill="url(#diamondShine)"
    />

    <!-- Glossy top-left highlight -->
    <path d="M10 10 L16 7 L12 13 L6 12 Z" fill="#fff" opacity="0.4" transform="rotate(-15 12 10)"/>

    <!-- Crown on top -->
    <path
      d="M13 7 L12 2 L15 5 L18 1 L21 5 L24 2 L23 7 Z"
      fill="url(#crownMetal)"
      stroke="#92400e"
      stroke-width="0.8"
      stroke-linejoin="round"
    />
    <!-- Crown base -->
    <rect x="11.5" y="7" width="13" height="2.5" rx="0.8" fill="url(#crownMetal)" stroke="#92400e" stroke-width="0.7"/>

    <!-- Crown gems -->
    <circle cx="15" cy="5" r="1.8" fill="url(#redGem)" stroke="#991b1b" stroke-width="0.5"/>
    <circle cx="18" cy="3" r="2" fill="url(#redGem)" stroke="#991b1b" stroke-width="0.5"/>
    <circle cx="21" cy="5" r="1.8" fill="url(#blueGem)" stroke="#1e3a8a" stroke-width="0.5"/>

    <!-- Red gem sparkle -->
    <path d="M18 0.5 L18.3 1.5 L19.3 1.8 L18.3 2.1 L18 3 L17.7 2.1 L16.7 1.8 L17.7 1.5 Z" fill="#fff" opacity="0.8"/>

    <!-- Cute face on diamond -->
    <circle cx="15" cy="16" r="1.3" fill="#78350f"/>
    <circle cx="15" cy="16" r="0.45" fill="#fff"/>
    <circle cx="21" cy="16" r="1.3" fill="#78350f"/>
    <circle cx="21" cy="16" r="0.45" fill="#fff"/>

    <!-- Smile -->
    <path
      d="M15.5 20 Q18 22.5 20.5 20"
      stroke="#92400e"
      stroke-width="1.1"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Cheek blush -->
    <circle cx="12.5" cy="19" r="2.2" fill="#fbbf24" opacity="0.3"/>
    <circle cx="23.5" cy="19" r="2.2" fill="#fbbf24" opacity="0.3"/>
  </svg>
</template>
