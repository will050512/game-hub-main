<!--
  ArtSnakeHead — Chibi snake head, faces +X (right) by default.
  Korean mobile game aesthetic: 3D gradient fills, anime eyes, glossy highlights.
  Caller rotates via drawSprite({rotation}) for direction changes.
  Design viewport 32×32 centered. Stroke 1.6.
-->
<script setup lang="ts">
defineProps<{ size?: number; bodyColor?: string }>()
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
      <!-- Head gradient: emerald → dark green for 3D depth -->
      <radialGradient id="snakeHeadGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#6ee7a0" />
        <stop offset="40%" stop-color="#22c55e" />
        <stop offset="85%" stop-color="#15803d" />
        <stop offset="100%" stop-color="#166534" />
      </radialGradient>

      <!-- Body tail gradient -->
      <radialGradient id="snakeBodyGrad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#6ee7a0" />
        <stop offset="40%" stop-color="#22c55e" />
        <stop offset="85%" stop-color="#15803d" />
        <stop offset="100%" stop-color="#166534" />
      </radialGradient>

      <!-- Belly gradient: light mint -->
      <radialGradient id="snakeBellyGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#d9f99d" />
        <stop offset="100%" stop-color="#a7f3d0" />
      </radialGradient>

      <!-- Eye white gradient for depth -->
      <radialGradient id="eyeWhiteGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f0fdf4" />
      </radialGradient>

      <!-- Pupil gradient -->
      <radialGradient id="pupilGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#374151" />
        <stop offset="100%" stop-color="#111827" />
      </radialGradient>

      <!-- Glossy highlight gradient -->
      <linearGradient id="headGloss" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Fang gradient -->
      <linearGradient id="fangGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#fde68a" />
      </linearGradient>

      <!-- Tongue gradient -->
      <linearGradient id="tongueGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f87171" />
        <stop offset="100%" stop-color="#ef4444" />
      </linearGradient>

      <!-- Drop shadow -->
      <filter id="snakeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#000" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- Scales pattern overlay -->
    <defs>
      <pattern id="snakeScales" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" opacity="0.06" />
      </pattern>
    </defs>

    <!-- Tail-side rounding (subtle, behind head) -->
    <circle cx="11" cy="16" r="9" fill="url(#snakeBodyGrad)" stroke="#1a1a1a" stroke-width="1.6" filter="url(#snakeShadow)" />
    <!-- Main head, slightly forward to suggest motion -->
    <ellipse cx="18" cy="16" rx="10" ry="9" fill="url(#snakeHeadGrad)" stroke="#1a1a1a" stroke-width="1.6" filter="url(#snakeShadow)" />

    <!-- Scales overlay on head -->
    <ellipse cx="18" cy="16" rx="10" ry="9" fill="url(#snakeScales)" stroke="none" />

    <!-- Belly tone -->
    <ellipse cx="18" cy="20.5" rx="7" ry="3" fill="url(#snakeBellyGrad)" opacity="0.9" />

    <!-- Glossy highlight arc on top of head -->
    <path d="M12 10.5 Q18 6 25 10.5" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6" />
    <path d="M14 12 Q18 9 23 12" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.35" />

    <!-- Anime eyes: right (primary eye) -->
    <!-- Eye white base -->
    <circle cx="22" cy="13" r="3.5" fill="url(#eyeWhiteGrad)" stroke="#1a1a1a" stroke-width="1.3" />
    <!-- Eye inner glow -->
    <circle cx="22" cy="13" r="3" fill="#ffffff" opacity="0.3" />
    <!-- Iris (colorful) -->
    <circle cx="22.4" cy="13.2" r="2.2" fill="url(#pupilGrad)" />
    <!-- Dark pupil center -->
    <circle cx="22.6" cy="13.4" r="1.3" fill="#0a0a0a" />
    <!-- Large top-left highlight -->
    <circle cx="21.2" cy="12.2" r="1" fill="#ffffff" opacity="0.95" />
    <!-- Small bottom-right catchlight -->
    <circle cx="23.4" cy="14.2" r="0.45" fill="#ffffff" opacity="0.7" />

    <!-- Anime eyes: left (secondary eye, slightly smaller for perspective) -->
    <circle cx="14" cy="13" r="3" fill="url(#eyeWhiteGrad)" stroke="#1a1a1a" stroke-width="1.2" />
    <circle cx="14" cy="13" r="2.5" fill="#ffffff" opacity="0.3" />
    <circle cx="14.3" cy="13.2" r="1.8" fill="url(#pupilGrad)" />
    <circle cx="14.5" cy="13.4" r="1.1" fill="#0a0a0a" />
    <circle cx="13.5" cy="12.5" r="0.8" fill="#ffffff" opacity="0.95" />
    <circle cx="15" cy="14" r="0.35" fill="#ffffff" opacity="0.6" />

    <!-- Blush -->
    <ellipse cx="11" cy="19" rx="2.2" ry="1.2" fill="#fbbf24" opacity="0.5" />
    <ellipse cx="25" cy="19.2" rx="2.2" ry="1.2" fill="#fbbf24" opacity="0.5" />

    <!-- Mouth line -->
    <path d="M19 18 Q22 20.5 25.5 18.5" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round" fill="none" />

    <!-- Fang / tooth details -->
    <path d="M21 18.8 L22 21.5 L23 18.8" fill="url(#fangGrad)" stroke="#1a1a1a" stroke-width="0.5" />
    <path d="M24 18.8 L25 21 L26 18.8" fill="url(#fangGrad)" stroke="#1a1a1a" stroke-width="0.5" />

    <!-- Forked tongue -->
    <path d="M27 18.5 L31 17.3" stroke="url(#tongueGrad)" stroke-width="1.3" stroke-linecap="round" />
    <path d="M27 18.5 L31 19.3" stroke="url(#tongueGrad)" stroke-width="1.3" stroke-linecap="round" />
    <!-- Tongue dots -->
    <circle cx="30.5" cy="17.3" r="0.5" fill="#ef4444" />
    <circle cx="30.5" cy="19.3" r="0.5" fill="#ef4444" />
  </svg>
</template>
