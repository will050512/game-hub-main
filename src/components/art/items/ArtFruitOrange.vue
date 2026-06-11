<!--
  ArtFruitOrange — Orange fruit with segment texture and glossy finish.
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
      <!-- Orange body 3D radial gradient -->
      <radialGradient id="orangeBody" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#fdba74"/>
        <stop offset="25%" stop-color="#fb923c"/>
        <stop offset="55%" stop-color="#ea580c"/>
        <stop offset="100%" stop-color="#9a3412"/>
      </radialGradient>
      <!-- Stem gradient -->
      <linearGradient id="orangeStem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#65a30d"/>
        <stop offset="100%" stop-color="#166534"/>
      </linearGradient>
      <!-- Leaf gradient -->
      <linearGradient id="orangeLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
      <!-- Dimple highlight -->
      <radialGradient id="orangeDimple" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
      </radialGradient>
      <!-- Drop shadow -->
      <filter id="orangeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
        <feOffset dx="0" dy="2"/>
        <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Drop shadow -->
    <ellipse cx="16" cy="30" rx="8" ry="2" fill="#000" opacity="0.15"/>

    <!-- Stem -->
    <line x1="16" y1="10" x2="16" y2="3" stroke="url(#orangeStem)" stroke-width="2" stroke-linecap="round"/>

    <!-- Small leaf -->
    <path
      d="M16 7 Q19 5 21 6 Q23 7 22 9 Q21 11 18 10 Q16 9 16 7Z"
      fill="url(#orangeLeaf)"
      stroke="#14532d"
      stroke-width="0.7"
      stroke-linejoin="round"
    />

    <!-- Dimple (indentation at top) -->
    <ellipse cx="16" cy="10" rx="5" ry="3" fill="#ea580c" opacity="0.4"/>

    <!-- Orange body - 3D sphere -->
    <circle cx="16" cy="18" r="12" fill="url(#orangeBody)" filter="url(#orangeShadow)" stroke="#9a3412" stroke-width="1.2"/>

    <!-- Segment lines for orange texture -->
    <path d="M16 7 Q16 18 16 29" stroke="#f97316" stroke-width="0.8" stroke-linecap="round" opacity="0.3"/>
    <path d="M16 7 Q12 18 8 29" stroke="#f97316" stroke-width="0.8" stroke-linecap="round" opacity="0.25"/>
    <path d="M16 7 Q20 18 24 29" stroke="#f97316" stroke-width="0.8" stroke-linecap="round" opacity="0.25"/>
    <path d="M16 7 Q8 14 5 22" stroke="#f97316" stroke-width="0.7" stroke-linecap="round" opacity="0.2"/>
    <path d="M16 7 Q24 14 27 22" stroke="#f97316" stroke-width="0.7" stroke-linecap="round" opacity="0.2"/>

    <!-- Glossy top-left highlight -->
    <ellipse cx="11" cy="12" rx="4" ry="2.5" fill="#fff" opacity="0.5" transform="rotate(-20 11 12)"/>

    <!-- Secondary small highlight -->
    <ellipse cx="10" cy="10.5" rx="1.5" ry="1" fill="#fff" opacity="0.65" transform="rotate(-30 10 10.5)"/>

    <!-- Orange peel dots texture -->
    <circle cx="9" cy="15" r="0.3" fill="#f97316" opacity="0.4"/>
    <circle cx="12" cy="14" r="0.3" fill="#f97316" opacity="0.4"/>
    <circle cx="20" cy="15" r="0.3" fill="#f97316" opacity="0.35"/>
    <circle cx="22" cy="17" r="0.3" fill="#f97316" opacity="0.35"/>
    <circle cx="14" cy="22" r="0.3" fill="#f97316" opacity="0.3"/>
    <circle cx="18" cy="22" r="0.3" fill="#f97316" opacity="0.3"/>
    <circle cx="10" cy="20" r="0.3" fill="#f97316" opacity="0.3"/>
    <circle cx="22" cy="20" r="0.3" fill="#f97316" opacity="0.3"/>

    <!-- Cute eyes -->
    <circle cx="12" cy="17" r="1.8" fill="#1c1917"/>
    <circle cx="12" cy="17" r="0.7" fill="#fff"/>
    <circle cx="20" cy="17" r="1.8" fill="#1c1917"/>
    <circle cx="20" cy="17" r="0.7" fill="#fff"/>

    <!-- Smile -->
    <path
      d="M13 21 Q16 24 19 21"
      stroke="#9a3412"
      stroke-width="1.2"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Cheek blush -->
    <circle cx="9.5" cy="20" r="2.5" fill="#fb923c" opacity="0.25"/>
    <circle cx="22.5" cy="20" r="2.5" fill="#fb923c" opacity="0.25"/>
  </svg>
</template>
