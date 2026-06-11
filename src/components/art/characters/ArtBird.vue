<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 48"
    :height="size ?? 48"
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Body gradient: warm yellow → orange for depth -->
      <radialGradient id="birdBodyGrad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="20%" stop-color="#fbbf24" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="80%" stop-color="#d97706" />
        <stop offset="100%" stop-color="#b45309" />
      </radialGradient>

      <!-- Belly gradient (lighter, softer) -->
      <radialGradient id="birdBellyGrad" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stop-color="#fef9c3" />
        <stop offset="100%" stop-color="#fef08a" />
      </radialGradient>

      <!-- Wing gradient -->
      <linearGradient id="birdWingGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>

      <!-- Beak gradient -->
      <linearGradient id="birdBeakGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#fb923c" />
        <stop offset="50%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>

      <!-- Tail feather gradient -->
      <linearGradient id="tailGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="60%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>

      <!-- Eye white gradient -->
      <radialGradient id="eyeWhiteGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#fefce8" />
      </radialGradient>

      <!-- Pupil gradient -->
      <radialGradient id="pupilGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#374151" />
        <stop offset="100%" stop-color="#111827" />
      </radialGradient>

      <!-- Glossy highlight gradient -->
      <linearGradient id="birdGloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Drop shadow -->
      <filter id="birdShadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.22" />
      </filter>
    </defs>

    <!-- Tail feathers (back layer) -->
    <path d="M10 24 Q2 20 1 26 Q3 28 6 27 Q4 29 3 32 Q10 30 12 27" fill="url(#tailGrad)" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round" />
    <path d="M10 26 Q3 25 0 30 Q2 33 5 31 Q5 35 4 38 Q12 33 13 29" fill="url(#tailGrad)" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round" opacity="0.85" />

    <!-- Wing (mid layer, behind body) -->
    <path d="M14 22 Q6 16 5 26 Q8 30 16 27 Z" fill="url(#birdWingGrad)" stroke="#1a1a1a" stroke-width="1.5" stroke-linejoin="round" />
    <!-- Wing feather detail -->
    <path d="M12 23 Q8 19 7 25" stroke="#d97706" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.6" />
    <path d="M14 24 Q10 21 9 26" stroke="#d97706" stroke-width="0.6" stroke-linecap="round" fill="none" opacity="0.4" />

    <!-- Main body with 3D gradient -->
    <ellipse cx="22" cy="25" rx="14" ry="13" fill="url(#birdBodyGrad)" stroke="#1a1a1a" stroke-width="1.8" filter="url(#birdShadow)" />

    <!-- Belly tone -->
    <ellipse cx="22" cy="31" rx="7" ry="3.5" fill="url(#birdBellyGrad)" opacity="0.5" />

    <!-- Glossy highlight arcs on body -->
    <path d="M14 18 Q22 12 30 18" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.55" />
    <path d="M17 20 Q22 16 28 20" stroke="#ffffff" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.35" />

    <!-- Head crest / tuft of feathers -->
    <path d="M16 16 Q19 8 26 14" stroke="#f59e0b" stroke-width="1.6" stroke-linecap="round" fill="none" />
    <path d="M18 15 Q21 10 26 14" stroke="#fbbf24" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.7" />

    <!-- Beak with gradient -->
    <path d="M32 22 L44 26.5 L32 30 Z" fill="url(#birdBeakGrad)" stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round" />
    <!-- Beak line detail -->
    <path d="M32 26 L42 26.5" stroke="#ea580c" stroke-width="0.8" stroke-linecap="round" opacity="0.5" />

    <!-- Anime eye: right (primary eye, facing forward-right) -->
    <circle cx="29" cy="21" r="4.5" fill="url(#eyeWhiteGrad)" stroke="#1a1a1a" stroke-width="1.4" />
    <!-- Eye inner glow -->
    <circle cx="29" cy="21" r="3.8" fill="#ffffff" opacity="0.25" />
    <!-- Iris -->
    <circle cx="29.5" cy="21.3" r="2.6" fill="url(#pupilGrad)" />
    <!-- Pupil -->
    <circle cx="29.8" cy="21.5" r="1.6" fill="#0a0a0a" />
    <!-- Large top-left highlight (anime sparkle) -->
    <circle cx="28.2" cy="20" r="1.2" fill="#ffffff" opacity="0.95" />
    <!-- Small catchlight -->
    <circle cx="31" cy="22.5" r="0.5" fill="#ffffff" opacity="0.6" />

    <!-- Anime eye: left (secondary eye, slightly smaller) -->
    <circle cx="19" cy="21" r="3.8" fill="url(#eyeWhiteGrad)" stroke="#1a1a1a" stroke-width="1.3" />
    <circle cx="19" cy="21" r="3.2" fill="#ffffff" opacity="0.25" />
    <circle cx="19.4" cy="21.2" r="2.2" fill="url(#pupilGrad)" />
    <circle cx="19.7" cy="21.4" r="1.4" fill="#0a0a0a" />
    <circle cx="18.6" cy="20.2" r="1" fill="#ffffff" opacity="0.95" />
    <circle cx="20.5" cy="22.3" r="0.4" fill="#ffffff" opacity="0.55" />

    <!-- Eyebrows (slightly angled for expression) -->
    <path d="M25 17.5 Q29 16 33 17.5" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" fill="none" />
    <path d="M16 17.5 Q19 16 22 17.5" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round" fill="none" />

    <!-- Blush (korean mobile game cute style) -->
    <ellipse cx="17" cy="28" rx="3.2" ry="1.8" fill="#fbbf24" opacity="0.45" />
    <ellipse cx="33" cy="28.5" rx="3" ry="1.6" fill="#fbbf24" opacity="0.45" />

    <!-- Mouth (happy curve) -->
    <path d="M25 28 Q28 31.5 32 28" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round" fill="none" />

    <!-- Head crest gloss -->
    <path d="M18 14 Q21 10 25 13" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.5" />
  </svg>
</template>
