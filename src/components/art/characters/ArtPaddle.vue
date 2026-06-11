<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 192"
    :height="size ?? 32"
    viewBox="0 0 192 32"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Metallic bar gradient: steel → chrome -->
      <linearGradient id="paddleBar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#e5e7eb" />
        <stop offset="25%" stop-color="#d1d5db" />
        <stop offset="50%" stop-color="#9ca3af" />
        <stop offset="100%" stop-color="#4b5563" />
      </linearGradient>
      <!-- Chrome edge gradient -->
      <linearGradient id="paddleEdge" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6b7280" />
        <stop offset="50%" stop-color="#f3f4f6" />
        <stop offset="100%" stop-color="#6b7280" />
      </linearGradient>
      <!-- Glossy top highlight ellipse gradient -->
      <linearGradient id="paddleTopHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7" />
        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.2" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </linearGradient>
      <!-- Neon accent glow -->
      <linearGradient id="paddleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#a855f7" />
        <stop offset="50%" stop-color="#06b6d4" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
      <!-- Drop shadow -->
      <filter id="paddleShadow" x="-5%" y="-10%" width="110%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#1f1b4e" flood-opacity="0.35" />
      </filter>
      <!-- Neon glow -->
      <filter id="paddleNeonGlow" x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Neon ambient glow underneath -->
    <rect x="12" y="10" width="168" height="18" rx="9" fill="url(#paddleGlow)" opacity="0.2" filter="url(#paddleNeonGlow)" />

    <!-- Main paddle bar with metallic gradient -->
    <rect x="8" y="6" width="176" height="20" rx="10" fill="url(#paddleBar)" stroke="#374151" stroke-width="1.5" />

    <!-- Bevel: lighter top edge -->
    <rect x="10" y="7" width="172" height="4" rx="2" fill="#f9fafb" opacity="0.5" />

    <!-- Bevel: darker bottom edge -->
    <rect x="10" y="21" width="172" height="3" rx="1.5" fill="#374151" opacity="0.3" />

    <!-- Glossy top highlight (long ellipse sheen) -->
    <rect x="14" y="8" width="164" height="6" rx="3" fill="url(#paddleTopHighlight)" opacity="0.7" />

    <!-- Thin neon outline -->
    <rect x="9" y="7" width="174" height="18" rx="9" stroke="url(#paddleGlow)" stroke-width="0.8" opacity="0.4" />

    <!-- Eyes (dark, for character) -->
    <circle cx="62" cy="16" r="3.8" fill="#1f2937" stroke="#374151" stroke-width="0.8" />
    <circle cx="130" cy="16" r="3.8" fill="#1f2937" stroke="#374151" stroke-width="0.8" />
    <!-- Eye reflections -->
    <circle cx="63.5" cy="14.5" r="1.2" fill="#ffffff" />
    <circle cx="131.5" cy="14.5" r="1.2" fill="#ffffff" />

    <!-- Mouth (frown/neutral) -->
    <path d="M86 20 Q96 25 106 20" stroke="#374151" stroke-width="1.5" stroke-linecap="round" fill="none" />

    <!-- Shadow beneath paddle -->
    <ellipse cx="96" cy="30" rx="75" ry="3" fill="#1f1b4e" opacity="0.15" />
  </svg>
</template>
