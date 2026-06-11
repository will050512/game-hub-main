<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 192"
    :height="size ?? 56"
    viewBox="0 0 192 56"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Wood body gradient -->
      <linearGradient id="basket-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#d4a054" />
        <stop offset="30%" stop-color="#b87832" />
        <stop offset="70%" stop-color="#8b5e34" />
        <stop offset="100%" stop-color="#6b3a1f" />
      </linearGradient>

      <!-- Basket rim highlight gradient -->
      <linearGradient id="basket-rim-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f5d89b" />
        <stop offset="50%" stop-color="#e8b960" />
        <stop offset="100%" stop-color="#c4943d" />
      </linearGradient>

      <!-- Inner shadow gradient -->
      <radialGradient id="basket-inner-shadow" cx="50%" cy="0%" r="100%">
        <stop offset="0%" stop-color="#1a0e05" stop-opacity="0.35" />
        <stop offset="60%" stop-color="#2a1a0a" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#3a2a15" stop-opacity="0" />
      </radialGradient>

      <!-- Handle gradient -->
      <linearGradient id="handle-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#c9944a" />
        <stop offset="40%" stop-color="#a07030" />
        <stop offset="100%" stop-color="#7a5525" />
      </linearGradient>

      <!-- Handle highlight -->
      <linearGradient id="handle-hl-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f0d090" stop-opacity="0.6" />
        <stop offset="50%" stop-color="#e8b960" stop-opacity="0" />
        <stop offset="100%" stop-color="#c4943d" stop-opacity="0" />
      </linearGradient>

      <!-- Drop shadow filter -->
      <filter id="basket-shadow" x="-10%" y="-5%" width="120%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#1a0e05" flood-opacity="0.3" />
      </filter>

      <!-- Glossy highlight gradient -->
      <linearGradient id="gloss-top" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.3" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>

      <!-- Weave highlight gradient -->
      <linearGradient id="weave-hl" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f0d8a0" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#f0d8a0" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Shadow cast underneath -->
    <path d="M24 50 Q96 56 168 50 L154 50 H38 Z" fill="#1a0e05" opacity="0.12" />

    <!-- Handle base -->
    <path d="M40 16 Q96 -12 152 16" stroke="url(#handle-grad)" stroke-width="5.5" stroke-linecap="round" fill="none" />

    <!-- Handle highlight -->
    <path d="M42 14 Q96 -10 150 14" stroke="url(#handle-hl-grad)" stroke-width="2" stroke-linecap="round" fill="none" />

    <!-- Handle inner highlight -->
    <path d="M52 12 Q96 -4 140 12" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.25" />

    <!-- Outer rim outline -->
    <path d="M24 16 H168 L154 50 H38 Z" fill="#8b5e34" stroke="#3d2010" stroke-width="1.8" stroke-linejoin="round" filter="url(#basket-shadow)" />

    <!-- Wood body with gradient fill -->
    <path d="M24 16 H168 L154 50 H38 Z" fill="url(#basket-body-grad)" stroke="#3d2010" stroke-width="1.8" stroke-linejoin="round" />

    <!-- Top rim gradient highlight -->
    <path d="M24 16 H168" stroke="url(#basket-rim-grad)" stroke-width="3.5" stroke-linecap="round" />

    <!-- Rim top gloss -->
    <path d="M24 16 H168" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.3" />

    <!-- Glossy sheen overlay on body -->
    <path d="M24 16 H168 L154 50 H38 Z" fill="url(#gloss-top)" />

    <!-- Inner basket area - dark interior -->
    <path d="M36 18 Q96 6 156 18 L148 44 H44 Z" fill="#3a2212" opacity="0.4" />

    <!-- Inner shadow overlay -->
    <path d="M38 20 H154 L144 46 H42 Z" fill="url(#basket-inner-shadow)" />

    <!-- Weave pattern - horizontal lines -->
    <path d="M34 22 H158 M35 28 H157 M36 34 H156 M37 40 H155 M38 46 H148" stroke="#f5d89b" stroke-width="1.2" opacity="0.25" stroke-linecap="round" />

    <!-- Weave pattern - vertical lines -->
    <path d="M47 20 Q48 35 45 48 M62 18 Q63 35 60 50 M78 17 Q79 35 76 51 M96 16 Q96 35 96 52 M114 17 Q115 35 118 51 M130 18 Q131 35 134 50 M145 20 Q146 35 149 48" stroke="#3d2010" stroke-width="1" opacity="0.3" stroke-linecap="round" />

    <!-- Weave highlight lines -->
    <path d="M47 20 Q48 35 45 48 M78 17 Q79 35 76 51 M96 16 Q96 35 96 52" stroke="url(#weave-hl)" stroke-width="1.8" opacity="0.2" stroke-linecap="round" />

    <!-- Horizontal weave highlight strokes -->
    <path d="M38 24 H154 M38 30 H154 M38 36 H154 M38 42 H148" stroke="#e8c070" stroke-width="0.6" opacity="0.35" stroke-linecap="round" />

    <!-- Eyes -->
    <circle cx="80" cy="33" r="4.2" fill="#2a1808" stroke="#3d2010" stroke-width="0.8" />
    <circle cx="112" cy="33" r="4.2" fill="#2a1808" stroke="#3d2010" stroke-width="0.8" />

    <!-- Eye highlights -->
    <circle cx="81.4" cy="31.6" r="1.2" fill="#ffffff" />
    <circle cx="113.4" cy="31.6" r="1.2" fill="#ffffff" />

    <!-- Blush -->
    <ellipse cx="66" cy="40" rx="4.5" ry="2" fill="#d4763a" opacity="0.35" />
    <ellipse cx="126" cy="40" rx="4.5" ry="2" fill="#d4763a" opacity="0.35" />

    <!-- Mouth -->
    <path d="M88 40 Q96 45 104 40" stroke="#3d2010" stroke-width="1.5" stroke-linecap="round" fill="none" />
  </svg>
</template>
