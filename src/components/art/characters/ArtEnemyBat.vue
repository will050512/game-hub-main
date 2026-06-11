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
      <!-- Wing membrane gradient: dark purple to deep violet -->
      <linearGradient id="batWingLeft" x1="3" y1="8" x2="14" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="#6d28d9" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#4c1d95" stop-opacity="0.6"/>
      </linearGradient>
      <linearGradient id="batWingRight" x1="14" y1="8" x2="25" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="#6d28d9" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#4c1d95" stop-opacity="0.6"/>
      </linearGradient>
      <!-- Wing bone highlight -->
      <linearGradient id="wingBone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#d4d4d8"/>
        <stop offset="100%" stop-color="#a1a1aa"/>
      </linearGradient>
      <!-- Body gradient -->
      <radialGradient id="batBody" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#5b21b6"/>
        <stop offset="60%" stop-color="#3b0764"/>
        <stop offset="100%" stop-color="#1e0a3c"/>
      </radialGradient>
      <!-- Wing membrane vein gradient -->
      <linearGradient id="wingVein" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4c1d95" stop-opacity="0.1"/>
      </linearGradient>
      <!-- Eye glow -->
      <radialGradient id="batEyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="1"/>
        <stop offset="60%" stop-color="#dc2626"/>
        <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0.3"/>
      </radialGradient>
      <!-- Glow filter -->
      <filter id="batEyeFilter" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="1.2" result="blur"/>
        <feFlood flood-color="#ef4444" flood-opacity="0.8"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Drop shadow -->
      <filter id="batShadow" x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="1" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>

    <!-- Ambient glow -->
    <ellipse cx="14" cy="14" rx="13" ry="11" fill="#8b5cf6" opacity="0.04"/>

    <!-- LEFT WING (behind body) -->
    <path d="M12 13 Q8 7 3 10 Q2 12 3 13 Q7 13 12 12" fill="url(#batWingLeft)" stroke="#1e1b4b" stroke-width="1" stroke-linejoin="round"/>
    <!-- Left wing membrane veins -->
    <path d="M11 13 L4 11" stroke="#8b5cf6" stroke-width="0.3" opacity="0.4"/>
    <path d="M11 13.5 L3.5 12.5" stroke="#8b5cf6" stroke-width="0.3" opacity="0.3"/>
    <!-- Left wing bone structure -->
    <path d="M12 12 L4 8" stroke="url(#wingBone)" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>

    <!-- RIGHT WING -->
    <path d="M16 13 Q20 7 25 10 Q26 12 25 13 Q21 13 16 12" fill="url(#batWingRight)" stroke="#1e1b4b" stroke-width="1" stroke-linejoin="round"/>
    <!-- Right wing membrane veins -->
    <path d="M17 13 L24 11" stroke="#8b5cf6" stroke-width="0.3" opacity="0.4"/>
    <path d="M17 13.5 L24.5 12.5" stroke="#8b5cf6" stroke-width="0.3" opacity="0.3"/>
    <!-- Right wing bone structure -->
    <path d="M16 12 L24 8" stroke="url(#wingBone)" stroke-width="0.8" stroke-linecap="round" opacity="0.6"/>

    <!-- Body -->
    <path d="M10 12 Q14 6 18 12 L17 21 Q14 26 11 21 Z" fill="url(#batBody)" stroke="#1a1a1a" stroke-width="1.3" stroke-linejoin="round" filter="url(#batShadow)"/>

    <!-- Body highlight (top-left gloss) -->
    <path d="M12 10 Q14 7 16 10 L15 13 Q14 12 13 13 Z" fill="#ffffff" opacity="0.25"/>

    <!-- Wing membrane detail (inner membrane texture) -->
    <path d="M5 10 Q7 12 9 14" stroke="#7c3aed" stroke-width="0.5" fill="none" opacity="0.3"/>
    <path d="M23 10 Q21 12 19 14" stroke="#7c3aed" stroke-width="0.5" fill="none" opacity="0.3"/>

    <!-- Head -->
    <ellipse cx="14" cy="13" rx="3.5" ry="3" fill="#3b0764" stroke="#1a1a1a" stroke-width="1"/>

    <!-- Horns/ears on bat head -->
    <path d="M10.5 10.5 L9 7 L12 10" fill="#3b0764" stroke="#1a1a1a" stroke-width="0.6"/>
    <path d="M17.5 10.5 L19 7 L16 10" fill="#3b0764" stroke="#1a1a1a" stroke-width="0.6"/>

    <!-- Glowing red eyes -->
    <circle cx="12" cy="13" r="1.8" fill="url(#batEyeGlow)" filter="url(#batEyeFilter)"/>
    <circle cx="16" cy="13" r="1.8" fill="url(#batEyeGlow)" filter="url(#batEyeFilter)"/>

    <!-- Pupil slits -->
    <ellipse cx="12" cy="13" rx="0.4" ry="1.3" fill="#000" opacity="0.7"/>
    <ellipse cx="16" cy="13" rx="0.4" ry="1.3" fill="#000" opacity="0.7"/>

    <!-- Fangs mouth -->
    <path d="M12 16 Q14 18 16 16" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" fill="none"/>
    <!-- Sharp fangs -->
    <path d="M12.5 16 L13 19 L13.5 16" fill="#e5e7eb"/>
    <path d="M14.5 16 L15 19 L15.5 16" fill="#e5e7eb"/>

    <!-- Body texture (bat fur lines) -->
    <path d="M11 18 Q14 20 17 18" stroke="#4c1d95" stroke-width="0.4" fill="none" opacity="0.3"/>
    <path d="M12 20 Q14 21 16 20" stroke="#4c1d95" stroke-width="0.4" fill="none" opacity="0.25"/>

    <!-- Body outline highlight -->
    <path d="M11 12 Q14 8 17 12" stroke="#a78bfa" stroke-width="0.4" fill="none" opacity="0.3"/>
  </svg>
</template>
