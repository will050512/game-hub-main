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
      <!-- Body gradient: steel/silver armor -->
      <linearGradient id="playerBody" x1="15" y1="8" x2="33" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="40%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#475569"/>
      </linearGradient>
      <!-- Armor highlight -->
      <linearGradient id="armorHighlight" x1="18" y1="14" x2="30" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#cbd5e1" stop-opacity="0.2"/>
      </linearGradient>
      <!-- Cape gradient: dark blue-purple -->
      <linearGradient id="capeGrad" x1="14" y1="30" x2="34" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e3a5f"/>
        <stop offset="50%" stop-color="#2d1b4e"/>
        <stop offset="100%" stop-color="#0f0a20"/>
      </linearGradient>
      <!-- Weapon glow gradient -->
      <radialGradient id="weaponGlow" cx="50%" cy="30%" r="50%">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
      </radialGradient>
      <!-- Gold accent -->
      <linearGradient id="goldAccent" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fde68a"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="100%" stop-color="#b45309"/>
      </linearGradient>
      <!-- Hair gradient: dark -->
      <linearGradient id="hairGrad" x1="19" y1="18" x2="29" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <!-- Drop shadow filter -->
      <filter id="playerShadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
      </filter>
      <!-- Glow filter for weapon -->
      <filter id="weaponGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <!-- Eye glow -->
      <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.2" result="blur"/>
        <feFlood flood-color="#60a5fa" flood-opacity="0.6"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Inner shadow for depth -->
      <filter id="innerShadow">
        <feOffset dx="0" dy="1"/>
        <feGaussianBlur stdDeviation="1.5" result="blur"/>
        <feComposite operator="out" in="SourceGraphic" in2="blur" result="inverse"/>
        <feFlood flood-color="#000" flood-opacity="0.25" result="color"/>
        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
      </filter>
    </defs>

    <!-- Background aura -->
    <ellipse cx="24" cy="26" rx="16" ry="14" fill="#3b82f6" opacity="0.06"/>

    <!-- Cape/Cloak (behind body) -->
    <path d="M16 19 Q24 13 32 19 L34 35 Q24 45 14 35 Z" fill="url(#capeGrad)" stroke="#1a1a1a" stroke-width="1.2" stroke-linejoin="round" opacity="0.8"/>
    <!-- Cape fold lines -->
    <path d="M20 20 Q24 16 28 20" stroke="#334155" stroke-width="0.6" fill="none" opacity="0.4"/>

    <!-- Body/Armor -->
    <path d="M15 18 Q24 8 33 18 L34 32 Q24 41 14 32 Z" fill="url(#playerBody)" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round" filter="url(#playerShadow)"/>

    <!-- Armor gloss highlight (top-left) -->
    <path d="M16 19 Q24 11 32 19" fill="url(#armorHighlight)" opacity="0.6"/>

    <!-- Armor plate lines -->
    <path d="M17 24 Q24 20 31 24" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M18 28 Q24 24 30 28" stroke="#1a1a1a" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M19 32 Q24 29 29 32" stroke="#1a1a1a" stroke-width="0.6" fill="none" opacity="0.25"/>

    <!-- Gold belt/buckle -->
    <ellipse cx="24" cy="33" rx="5" ry="1.5" fill="url(#goldAccent)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="24" cy="33" r="1.2" fill="#fde68a"/>

    <!-- Hair -->
    <path d="M17 16 Q24 10 31 16 L30 14 Q24 9 18 14 Z" fill="url(#hairGrad)"/>
    <path d="M16 17 Q18 13 22 12 L18 18 Q16 19 16 17 Z" fill="#0f172a" opacity="0.7"/>
    <path d="M24 11 Q26 12 29 14 L28 17 Q26 15 24 15 Z" fill="#1e293b" opacity="0.5"/>

    <!-- Eyes (glowing blue) -->
    <g filter="url(#eyeGlow)">
      <circle cx="19" cy="25" r="4" fill="#1a1a1a" stroke="#3b82f6" stroke-width="0.5"/>
      <circle cx="29" cy="25" r="4" fill="#1a1a1a" stroke="#3b82f6" stroke-width="0.5"/>
    </g>
    <circle cx="20.4" cy="23.6" r="1.2" fill="#ffffff"/>
    <circle cx="30.4" cy="23.6" r="1.2" fill="#ffffff"/>
    <!-- Eye glow cores -->
    <circle cx="19" cy="25" r="1" fill="#60a5fa" opacity="0.5"/>
    <circle cx="29" cy="25" r="1" fill="#60a5fa" opacity="0.5"/>

    <!-- Cheek glow accents -->
    <ellipse cx="15" cy="31" rx="3.4" ry="1.8" fill="#fbbf24" opacity="0.45"/>
    <ellipse cx="33" cy="31" rx="3.4" ry="1.8" fill="#fbbf24" opacity="0.45"/>

    <!-- Mouth -->
    <path d="M20 32 Q24 35 28 32" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" fill="none"/>

    <!-- Glowing Sword (right side) -->
    <g filter="url(#weaponGlowFilter)">
      <!-- Blade glow -->
      <path d="M34 14 L38 4 L40 6 L36 16" fill="url(#weaponGlow)" opacity="0.7"/>
      <!-- Blade core -->
      <path d="M34.5 14 L37.5 5.5 L38.8 6.5 L35.5 15" fill="#fef3c7" stroke="#f59e0b" stroke-width="0.5"/>
      <path d="M35.5 14 L37.8 6 L38.2 6.3 L35.8 14.5" fill="#ffffff" opacity="0.8"/>
      <!-- Guard -->
      <ellipse cx="34.5" cy="16" rx="3" ry="1.5" fill="url(#goldAccent)" stroke="#78350f" stroke-width="0.6"/>
      <!-- Handle -->
      <path d="M34 17 L34 22" stroke="#78350f" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M34.5 18 L33.5 20" stroke="#92400e" stroke-width="0.8"/>
      <path d="M34.5 20 L33.5 22" stroke="#92400e" stroke-width="0.8"/>
    </g>

    <!-- Shield arm accent (left side) -->
    <ellipse cx="14" cy="28" rx="2" ry="5" fill="#334155" stroke="#1a1a1a" stroke-width="0.8" stroke-linejoin="round"/>
    <ellipse cx="14" cy="26" rx="1.5" ry="3" fill="url(#goldAccent)" opacity="0.7"/>

    <!-- Subtle body outline highlight -->
    <path d="M16 19 Q24 10 32 19" stroke="#ffffff" stroke-width="0.5" fill="none" opacity="0.3"/>
  </svg>
</template>
