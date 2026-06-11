<!--
  ArtFruitStar — Gold star fruit with metallic gradient and sparkle effects.
-->
<script setup lang="ts">
defineProps<{ size?: number }>()
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
      <!-- Metallic gold gradient for star -->
      <linearGradient id="starGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="25%" stop-color="#fbbf24"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="75%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
      <!-- Metallic shine overlay -->
      <linearGradient id="starShine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.5"/>
        <stop offset="40%" stop-color="#fff" stop-opacity="0"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0.15"/>
      </linearGradient>
      <!-- Star body 3D radial gradient (centered top-left) -->
      <radialGradient id="starBody" cx="30%" cy="25%" r="70%">
        <stop offset="0%" stop-color="#fef9c3"/>
        <stop offset="20%" stop-color="#fde047"/>
        <stop offset="55%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </radialGradient>
      <!-- Sparkle glow -->
      <radialGradient id="sparkleGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#fbbf24" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
      </radialGradient>
      <!-- Drop shadow -->
      <filter id="starShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.2"/>
        <feOffset dx="0" dy="1.5"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Ambient sparkle glows behind star -->
    <circle cx="5" cy="6" r="4" fill="url(#sparkleGlow)" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="27" cy="8" r="3" fill="url(#sparkleGlow)" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="26" cy="27" r="3.5" fill="url(#sparkleGlow)" opacity="0.5">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    <circle cx="6" cy="26" r="2.5" fill="url(#sparkleGlow)" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2.2s" repeatCount="indefinite"/>
    </circle>

    <!-- Sparkle cross-stars -->
    <g opacity="0.7">
      <path d="M3 6 L3.5 8 L5.5 8.5 L3.5 9 L3 11 L2.5 9 L0.5 8.5 L2.5 8 Z" fill="#fde047">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
      </path>
    </g>
    <g opacity="0.5">
      <path d="M27 5 L27.3 6.5 L29 7 L27.3 7.5 L27 9 L26.7 7.5 L25 7 L26.7 6.5 Z" fill="#fbbf24">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/>
      </path>
    </g>
    <g opacity="0.6">
      <path d="M28 26 L28.3 27.5 L30 28 L28.3 28.5 L28 30 L27.7 28.5 L26 28 L27.7 27.5 Z" fill="#fde047">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.7s" repeatCount="indefinite"/>
      </path>
    </g>

    <!-- Star shape - 5-pointed -->
    <path
      d="M16 3 L19.2 11.5 L27.8 11.8 L21.5 17.2 L23.5 25.8 L16 21.5 L8.5 25.8 L10.5 17.2 L4.2 11.8 L12.8 11.5 Z"
      fill="url(#starBody)"
      stroke="#78350f"
      stroke-width="1.2"
      stroke-linejoin="round"
      filter="url(#starShadow)"
    />

    <!-- Metallic shine overlay on star -->
    <path
      d="M16 3 L19.2 11.5 L27.8 11.8 L21.5 17.2 L23.5 25.8 L16 21.5 L8.5 25.8 L10.5 17.2 L4.2 11.8 L12.8 11.5 Z"
      fill="url(#starShine)"
    />

    <!-- Glossy top-left highlight -->
    <ellipse cx="11" cy="9" rx="4" ry="2" fill="#fff" opacity="0.45" transform="rotate(-20 11 9)"/>

    <!-- Cute face on star -->
    <circle cx="13" cy="15.5" r="1.5" fill="#78350f"/>
    <circle cx="13" cy="15.5" r="0.55" fill="#fff"/>
    <circle cx="19" cy="15.5" r="1.5" fill="#78350f"/>
    <circle cx="19" cy="15.5" r="0.55" fill="#fff"/>

    <!-- Smile -->
    <path
      d="M13.5 19.5 Q16 21.5 18.5 19.5"
      stroke="#78350f"
      stroke-width="1.1"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Cheek blush -->
    <circle cx="10.5" cy="18.5" r="2" fill="#fde047" opacity="0.35"/>
    <circle cx="21.5" cy="18.5" r="2" fill="#fde047" opacity="0.35"/>
  </svg>
</template>
