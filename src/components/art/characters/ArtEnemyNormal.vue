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
      <!-- Body gradient: dark gray to very dark gray -->
      <linearGradient id="normalBody" x1="6" y1="3" x2="26" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#6b7280"/>
        <stop offset="40%" stop-color="#4b5563"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>
      <!-- Glossy highlight -->
      <linearGradient id="normalHighlight" x1="10" y1="6" x2="22" y2="16" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#e5e7eb" stop-opacity="0.1"/>
      </linearGradient>
      <!-- Eye glow: blood red -->
      <radialGradient id="redEyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="1"/>
        <stop offset="40%" stop-color="#dc2626" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0.2"/>
      </radialGradient>
      <!-- Inner body shadow -->
      <radialGradient id="normalInnerShadow" cx="50%" cy="30%" r="50%">
        <stop offset="50%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
      </radialGradient>
      <!-- Eye glow filter -->
      <filter id="redGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feFlood flood-color="#ef4444" flood-opacity="0.7"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Drop shadow -->
      <filter id="normalShadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- Body shadow beneath -->
    <ellipse cx="16" cy="28" rx="8" ry="2.5" fill="#1f2937" opacity="0.3"/>

    <!-- Main body (dark monster shape) -->
    <path d="M6 13 Q16 3 26 13 L25 25 Q16 31 7 25 Z" fill="url(#normalBody)" stroke="#111827" stroke-width="1.6" stroke-linejoin="round" filter="url(#normalShadow)"/>

    <!-- Body inner shadow (bottom) -->
    <path d="M7 20 Q16 28 25 20 L25 25 Q16 31 7 25 Z" fill="url(#normalInnerShadow)"/>

    <!-- Glossy highlight (top-left) -->
    <path d="M10 12 Q16 7 22 12 L21 15 Q16 13 11 15 Z" fill="url(#normalHighlight)"/>

    <!-- Body texture lines (menacing cracks) -->
    <path d="M12 10 Q16 8 20 10" stroke="#374151" stroke-width="0.6" fill="none" opacity="0.4"/>
    <path d="M10 16 L12 20" stroke="#374151" stroke-width="0.5" fill="none" opacity="0.3"/>
    <path d="M22 16 L20 20" stroke="#374151" stroke-width="0.5" fill="none" opacity="0.3"/>

    <!-- Glow aura around body -->
    <ellipse cx="16" cy="18" rx="14" ry="12" fill="#ef4444" opacity="0.04"/>

    <!-- Eye sockets -->
    <circle cx="12" cy="17" r="2.7" fill="#111827" stroke="#7f1d1d" stroke-width="0.6"/>
    <circle cx="20" cy="17" r="2.7" fill="#111827" stroke="#7f1d1d" stroke-width="0.6"/>

    <!-- Glowing red eyes -->
    <circle cx="12" cy="17" r="1.8" fill="url(#redEyeGlow)" filter="url(#redGlow)"/>
    <circle cx="20" cy="17" r="1.8" fill="url(#redEyeGlow)" filter="url(#redGlow)"/>

    <!-- Eye pupil slits (menacing cat-eye shape) -->
    <ellipse cx="12" cy="17" rx="0.4" ry="1.5" fill="#000" opacity="0.8"/>
    <ellipse cx="20" cy="17" rx="0.4" ry="1.5" fill="#000" opacity="0.8"/>

    <!-- Mouth (menacing) -->
    <path d="M12 23 Q14 25 16 23 Q18 25 20 23" stroke="#111827" stroke-width="1.1" stroke-linecap="round" fill="none"/>

    <!-- Fangs -->
    <path d="M13 23 L13.5 25 L14 23" fill="#f3f4f6"/>
    <path d="M18 23 L18.5 25 L19 23" fill="#f3f4f6"/>

    <!-- Spikes on top -->
    <path d="M10 11 L9 6 L13 10" fill="#4b5563" stroke="#374151" stroke-width="0.5"/>
    <path d="M16 6 L16 3 L19 10" fill="#4b5563" stroke="#374151" stroke-width="0.5"/>
    <path d="M22 11 L23 6 L19 10" fill="#4b5563" stroke="#374151" stroke-width="0.5"/>

    <!-- Subtle cheek glow -->
    <ellipse cx="9" cy="21" rx="2" ry="1" fill="#ef4444" opacity="0.2"/>
    <ellipse cx="23" cy="21" rx="2" ry="1" fill="#ef4444" opacity="0.2"/>

    <!-- Body outline highlight -->
    <path d="M7 14 Q16 5 25 14" stroke="#ffffff" stroke-width="0.4" fill="none" opacity="0.2"/>
  </svg>
</template>
