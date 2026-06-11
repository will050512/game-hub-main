<!--
  ArtApple — 3D red sphere with radial gradient, stem, leaf, glossy highlight.
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
      <!-- Apple body radial gradient: pink highlight → red → dark red -->
      <radialGradient id="appleBody" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#fca5a5" />
        <stop offset="25%" stop-color="#ef4444" />
        <stop offset="60%" stop-color="#dc2626" />
        <stop offset="100%" stop-color="#991b1b" />
      </radialGradient>
      <!-- Stem gradient -->
      <linearGradient id="appleStem" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#84cc16" />
        <stop offset="100%" stop-color="#65a30d" />
      </linearGradient>
      <!-- Leaf gradient -->
      <linearGradient id="appleLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4ade80" />
        <stop offset="100%" stop-color="#16a34a" />
      </linearGradient>
      <!-- Glossy highlight -->
      <radialGradient id="appleGloss" cx="30%" cy="30%" r="40%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <!-- Bottom shadow -->
      <radialGradient id="appleShadow" cx="70%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#7f1d1d" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0" />
      </radialGradient>
      <!-- Cheek blush gradient -->
      <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f472b6" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#f472b6" stop-opacity="0" />
      </radialGradient>
    </defs>

    <!-- Stem -->
    <rect x="13" y="2" width="2.2" height="5" rx="1" fill="url(#appleStem)" />

    <!-- Leaf -->
    <path d="M15 3 Q21 2 20 8 Q15 7.5 15 3 Z" fill="url(#appleLeaf)" />
    <path d="M15 4 Q18 3.5 19 6" stroke="#15803d" stroke-width="0.6" fill="none" opacity="0.4" />

    <!-- Apple body -->
    <path
      d="M14 6 Q6 7 5.5 15 Q5 24 14 24 Q23 24 22.5 15 Q22 6 14 6 Z"
      fill="url(#appleBody)"
    />

    <!-- Bottom shadow overlay -->
    <path
      d="M14 6 Q6 7 5.5 15 Q5 24 14 24 Q23 24 22.5 15 Q22 6 14 6 Z"
      fill="url(#appleShadow)"
    />

    <!-- Glossy highlight -->
    <ellipse cx="10" cy="11" rx="3" ry="2.5" fill="url(#appleGloss)" />

    <!-- Tiny face -->
    <circle cx="11" cy="17" r="1" fill="#7f1d1d" />
    <circle cx="17" cy="17" r="1" fill="#7f1d1d" />
    <path d="M12 19.5 Q14 21.2 16 19.5" stroke="#7f1d1d" stroke-width="0.9" stroke-linecap="round" fill="none" />

    <!-- Cheek blush -->
    <ellipse cx="9" cy="19.5" rx="2" ry="1.2" fill="url(#cheekBlush)" />
    <ellipse cx="19" cy="19.5" rx="2" ry="1.2" fill="url(#cheekBlush)" />
  </svg>
</template>
