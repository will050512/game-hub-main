<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 36"
    :height="size ?? 36"
    viewBox="0 0 36 36"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Body gradient: translucent green to dark green -->
      <linearGradient id="slimeBody" x1="5" y1="6" x2="31" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#34d399" stop-opacity="0.85"/>
        <stop offset="30%" stop-color="#059669" stop-opacity="0.75"/>
        <stop offset="70%" stop-color="#047857" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="#064e3b" stop-opacity="0.8"/>
      </linearGradient>
      <!-- Inner glow (toxic glow inside slime) -->
      <radialGradient id="slimeInnerGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#6ee7b7" stop-opacity="0.4"/>
        <stop offset="40%" stop-color="#34d399" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#047857" stop-opacity="0"/>
      </radialGradient>
      <!-- Glossy top highlight -->
      <linearGradient id="slimeGloss" x1="10" y1="4" x2="22" y2="14" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.7"/>
        <stop offset="60%" stop-color="#ffffff" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
      <!-- Eye glow (menacing green) -->
      <radialGradient id="slimeEyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a3e635" stop-opacity="1"/>
        <stop offset="50%" stop-color="#65a30d" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#3f6212" stop-opacity="0.3"/>
      </radialGradient>
      <!-- Eye glow filter -->
      <filter id="slimeEyeFilter" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="1" result="blur"/>
        <feFlood flood-color="#84cc16" flood-opacity="0.9"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Drop shadow -->
      <filter id="slimeShadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
      </filter>
      <!-- Outer glow for slime aura -->
      <filter id="slimeAura" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feFlood flood-color="#10b981" flood-opacity="0.15"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    <!-- Slime aura (ambient glow) -->
    <ellipse cx="18" cy="18" rx="17" ry="15" fill="#10b981" opacity="0.05" filter="url(#slimeAura)"/>

    <!-- Shadow beneath slime -->
    <ellipse cx="18" cy="31" rx="12" ry="2.5" fill="#022c22" opacity="0.25"/>

    <!-- Main body (semi-transparent gradient) -->
    <path d="M5 24 Q5 12 18 6 Q31 12 31 24 Q28 32 18 32 Q8 32 5 24 Z" fill="url(#slimeBody)" stroke="#064e3b" stroke-width="1.5" stroke-linejoin="round" filter="url(#slimeShadow)"/>

    <!-- Inner glow layer -->
    <path d="M7 23 Q7 14 18 8 Q29 14 29 23 Q27 29 18 29 Q9 29 7 23 Z" fill="url(#slimeInnerGlow)"/>

    <!-- Glossy top highlight (top-left reflection) -->
    <ellipse cx="13" cy="13" rx="8" ry="5" fill="url(#slimeGloss)" opacity="0.7"/>

    <!-- Extra glossy blob highlights -->
    <ellipse cx="10" cy="12" rx="3" ry="2" fill="#ffffff" opacity="0.15"/>
    <ellipse cx="22" cy="14" rx="1.5" ry="1" fill="#ffffff" opacity="0.1"/>

    <!-- Body surface bubbles/toxic spots -->
    <circle cx="12" cy="18" r="2" fill="#34d399" opacity="0.2"/>
    <circle cx="24" cy="20" r="1.5" fill="#6ee7b7" opacity="0.15"/>
    <circle cx="16" cy="24" r="2.5" fill="#34d399" opacity="0.12"/>

    <!-- Eye sockets -->
    <circle cx="13" cy="20" r="3" fill="#064e3b" stroke="#047857" stroke-width="0.5"/>
    <circle cx="23" cy="20" r="3" fill="#064e3b" stroke="#047857" stroke-width="0.5"/>

    <!-- Glowing eyes -->
    <circle cx="13" cy="20" r="2" fill="url(#slimeEyeGlow)" filter="url(#slimeEyeFilter)"/>
    <circle cx="23" cy="20" r="2" fill="url(#slimeEyeGlow)" filter="url(#slimeEyeFilter)"/>

    <!-- Menacing pupils -->
    <ellipse cx="13.5" cy="20" rx="0.5" ry="1.5" fill="#1a2e05"/>
    <ellipse cx="23.5" cy="20" rx="0.5" ry="1.5" fill="#1a2e05"/>

    <!-- Mouth (menacing grin) -->
    <path d="M13 25 Q18 30 23 25" stroke="#064e3b" stroke-width="1.3" stroke-linecap="round" fill="none"/>

    <!-- Menacing teeth dots in mouth -->
    <path d="M14 25.5 L15 27 L16 25.5" fill="#ecfdf5" opacity="0.7"/>
    <path d="M18 26.5 L19 28 L20 26.5" fill="#ecfdf5" opacity="0.7"/>
    <path d="M20 25.5 L21 27 L22 25.5" fill="#ecfdf5" opacity="0.7"/>

    <!-- Eye highlights -->
    <circle cx="12.5" cy="19.5" r="0.7" fill="#ffffff" opacity="0.8"/>
    <circle cx="22.5" cy="19.5" r="0.7" fill="#ffffff" opacity="0.8"/>

    <!-- Bubbles floating up (cute but toxic) -->
    <circle cx="11" cy="8" r="2" fill="#6ee7b7" opacity="0.3" stroke="#34d399" stroke-width="0.5"/>
    <circle cx="25" cy="10" r="1.5" fill="#a7f3d0" opacity="0.25" stroke="#34d399" stroke-width="0.4"/>
    <circle cx="18" cy="7" r="1.2" fill="#34d399" opacity="0.35" stroke="#6ee7b7" stroke-width="0.4"/>

    <!-- Body outline highlight -->
    <path d="M8 18 Q10 10 18 7 Q26 10 28 18" stroke="#6ee7b7" stroke-width="0.5" fill="none" opacity="0.25"/>

    <!-- Drip effect at bottom -->
    <ellipse cx="14" cy="30" rx="1.2" ry="2" fill="#10b981" opacity="0.3"/>
    <ellipse cx="22" cy="29" rx="1" ry="1.5" fill="#34d399" opacity="0.25"/>
    <ellipse cx="18" cy="30.5" rx="1.5" ry="1.8" fill="#059669" opacity="0.2"/>
  </svg>
</template>
