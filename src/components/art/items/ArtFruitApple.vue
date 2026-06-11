<!--
  ArtFruitApple — Red apple fruit with leaf. Korean mobile game style.
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
      <!-- Apple 3D radial gradient -->
      <radialGradient id="appleBody" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#fca5a5"/>
        <stop offset="25%" stop-color="#ef4444"/>
        <stop offset="60%" stop-color="#b91c1c"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>
      <!-- Stem gradient -->
      <linearGradient id="appleStem" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#84cc16"/>
        <stop offset="100%" stop-color="#166534"/>
      </linearGradient>
      <!-- Leaf gradient -->
      <linearGradient id="appleLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#86efac"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
      <!-- Drop shadow -->
      <filter id="appleShadow" x="-20%" y="-20%" width="140%" height="140%">
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
    <ellipse cx="16" cy="30" rx="9" ry="2.5" fill="#000" opacity="0.18"/>

    <!-- Stem -->
    <path
      d="M16 10 Q15.5 6 15 3.5 Q14.8 2 15.5 1.5 Q16.2 1 16.5 2.5 Q17 5 17.5 8"
      stroke="url(#appleStem)"
      stroke-width="2.2"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Leaf -->
    <path
      d="M16 10 Q20 7 23 8 Q26 9 25 12 Q24 15 20 14 Q17 13 16 10Z"
      fill="url(#appleLeaf)"
      stroke="#14532d"
      stroke-width="0.8"
      stroke-linejoin="round"
    />
    <!-- Leaf vein -->
    <path
      d="M16.5 10.5 Q19.5 10 22 11.5"
      stroke="#15803d"
      stroke-width="0.6"
      stroke-linecap="round"
      fill="none"
      opacity="0.5"
    />

    <!-- Apple body - 3D sphere -->
    <circle cx="16" cy="19" r="12" fill="url(#appleBody)" filter="url(#appleShadow)" stroke="#7f1d1d" stroke-width="1.2"/>

    <!-- Glossy top-left highlight -->
    <ellipse cx="11" cy="13" rx="4" ry="2.8" fill="#fff" opacity="0.55" transform="rotate(-25 11 13)"/>

    <!-- Secondary small highlight -->
    <ellipse cx="10" cy="11.5" rx="1.5" ry="1" fill="#fff" opacity="0.7" transform="rotate(-30 10 11.5)"/>

    <!-- Cherry-like shine dot -->
    <circle cx="10" cy="12" r="1" fill="#fff" opacity="0.9"/>

    <!-- Eyes -->
    <circle cx="12.5" cy="18" r="1.5" fill="#1c1917"/>
    <circle cx="12.5" cy="18" r="0.6" fill="#fff"/>
    <circle cx="19.5" cy="18" r="1.5" fill="#1c1917"/>
    <circle cx="19.5" cy="18" r="0.6" fill="#fff"/>

    <!-- Smile -->
    <path
      d="M13 22 Q16 25 19 22"
      stroke="#7f1d1d"
      stroke-width="1.3"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Cheek blush -->
    <circle cx="10" cy="20" r="2.5" fill="#f43f5e" opacity="0.2"/>
    <circle cx="22" cy="20" r="2.5" fill="#f43f5e" opacity="0.2"/>
  </svg>
</template>
