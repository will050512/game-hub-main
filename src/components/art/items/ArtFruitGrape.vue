<!--
  ArtFruitGrape — Purple grape cluster with 3D spheres and glossy finish.
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
      <!-- Grape 3D radial gradient - individual berries -->
      <radialGradient id="grapeBerry1" cx="35%" cy="28%" r="65%">
        <stop offset="0%" stop-color="#d8b4fe"/>
        <stop offset="20%" stop-color="#a855f7"/>
        <stop offset="50%" stop-color="#9333ea"/>
        <stop offset="100%" stop-color="#581c87"/>
      </radialGradient>
      <radialGradient id="grapeBerry2" cx="35%" cy="28%" r="65%">
        <stop offset="0%" stop-color="#e9d5ff"/>
        <stop offset="20%" stop-color="#c084fc"/>
        <stop offset="50%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#6b21a8"/>
      </radialGradient>
      <!-- Stem gradient -->
      <linearGradient id="grapeStem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#84cc16"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <!-- Leaf gradient -->
      <linearGradient id="grapeLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
      <!-- Drop shadow -->
      <filter id="grapeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
        <feOffset dx="0" dy="2"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Berry highlight -->
      <radialGradient id="grapeHighlight" cx="30%" cy="25%" r="50%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Drop shadow for entire bunch -->
    <ellipse cx="16" cy="30" rx="10" ry="2.5" fill="#000" opacity="0.12"/>

    <!-- Stems connecting berries -->
    <path d="M16 6 Q15 8 14 10" stroke="url(#grapeStem)" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M16 6 Q18 8 19 10" stroke="url(#grapeStem)" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M14 10 L12 13" stroke="url(#grapeStem)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M14 10 L16 13" stroke="url(#grapeStem)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M14 10 L10 16" stroke="url(#grapeStem)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M19 10 L21 14" stroke="url(#grapeStem)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M19 10 L17 14" stroke="url(#grapeStem)" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M19 10 L22 17" stroke="url(#grapeStem)" stroke-width="1" stroke-linecap="round"/>
    <path d="M12 13 L11 17" stroke="url(#grapeStem)" stroke-width="1" stroke-linecap="round"/>
    <path d="M21 14 L20 18" stroke="url(#grapeStem)" stroke-width="1" stroke-linecap="round"/>

    <!-- Main leaf -->
    <path
      d="M16 6 Q19 4 22 5 Q25 6 24 9 Q23 12 20 11 Q17 10 16 6Z"
      fill="url(#grapeLeaf)"
      stroke="#14532d"
      stroke-width="0.7"
      stroke-linejoin="round"
    />
    <path d="M16.5 7 Q19 6.5 21.5 8" stroke="#15803d" stroke-width="0.5" stroke-linecap="round" fill="none" opacity="0.4"/>

    <!-- Grape cluster - 9 berries in a bunch -->
    <!-- Top row -->
    <circle cx="12" cy="11" r="5" fill="url(#grapeBerry1)" stroke="#581c87" stroke-width="1"/>
    <circle cx="20" cy="11" r="5" fill="url(#grapeBerry1)" stroke="#581c87" stroke-width="1"/>

    <!-- Middle row -->
    <circle cx="8" cy="16" r="4.5" fill="url(#grapeBerry2)" stroke="#6b21a8" stroke-width="0.9"/>
    <circle cx="16" cy="16" r="5" fill="url(#grapeBerry1)" stroke="#581c87" stroke-width="1"/>
    <circle cx="24" cy="16" r="4.5" fill="url(#grapeBerry2)" stroke="#6b21a8" stroke-width="0.9"/>

    <!-- Bottom row -->
    <circle cx="11" cy="22" r="4.5" fill="url(#grapeBerry1)" stroke="#6b21a8" stroke-width="0.9"/>
    <circle cx="19" cy="22" r="4.5" fill="url(#grapeBerry1)" stroke="#6b21a8" stroke-width="0.9"/>
    <circle cx="16" cy="26" r="4.5" fill="url(#grapeBerry2)" stroke="#6b21a8" stroke-width="0.9"/>

    <!-- Glossy highlights on individual berries -->
    <circle cx="12" cy="11" r="5" fill="url(#grapeHighlight)" opacity="0.7"/>
    <circle cx="20" cy="11" r="5" fill="url(#grapeHighlight)" opacity="0.7"/>
    <circle cx="16" cy="16" r="5" fill="url(#grapeHighlight)" opacity="0.6"/>
    <circle cx="24" cy="16" r="4.5" fill="url(#grapeHighlight)" opacity="0.5"/>
    <circle cx="8" cy="16" r="4.5" fill="url(#grapeHighlight)" opacity="0.5"/>

    <!-- Cute face on center berry -->
    <circle cx="15" cy="15" r="1" fill="#1c1917"/>
    <circle cx="15" cy="15" r="0.4" fill="#fff"/>
    <circle cx="17" cy="15" r="1" fill="#1c1917"/>
    <circle cx="17" cy="15" r="0.4" fill="#fff"/>
    <path d="M15 17.5 Q16 18.5 17 17.5" stroke="#4c1d95" stroke-width="0.8" stroke-linecap="round" fill="none"/>

    <!-- Berry blush -->
    <circle cx="13.5" cy="16.5" r="1.5" fill="#c084fc" opacity="0.3"/>
    <circle cx="18.5" cy="16.5" r="1.5" fill="#c084fc" opacity="0.3"/>
  </svg>
</template>
