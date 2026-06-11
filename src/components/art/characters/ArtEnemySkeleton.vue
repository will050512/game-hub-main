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
      <!-- Bone gradient: bone white → cream → light brown -->
      <linearGradient id="skeletonBody" x1="7" y1="4" x2="25" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fefce8"/>
        <stop offset="30%" stop-color="#fef3c7"/>
        <stop offset="70%" stop-color="#fde68a"/>
        <stop offset="100%" stop-color="#d4a574"/>
      </linearGradient>
      <!-- Bone texture variation -->
      <linearGradient id="boneTexture" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="#fef3c7" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2"/>
      </linearGradient>
      <!-- Eye socket glow: fire orange -->
      <radialGradient id="boneEyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#f97316" stop-opacity="1"/>
        <stop offset="40%" stop-color="#ea580c" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#9a3412" stop-opacity="0.3"/>
      </radialGradient>
      <!-- Skull crown glow -->
      <radialGradient id="skullAura" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#f97316" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
      </radialGradient>
      <!-- Eye glow filter -->
      <filter id="boneEyeFilter" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="1.2" result="blur"/>
        <feFlood flood-color="#f97316" flood-opacity="0.8"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Drop shadow -->
      <filter id="boneShadow" x="-20%" y="-10%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
      </filter>
      <!-- Bone pitting texture -->
      <filter id="boneTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
        <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
        <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="textured"/>
        <feComponentTransfer in="textured">
          <feFuncR type="linear" slope="1.1"/>
          <feFuncG type="linear" slope="1.05"/>
          <feFuncB type="linear" slope="0.95"/>
        </feComponentTransfer>
      </filter>
    </defs>

    <!-- Skull aura -->
    <ellipse cx="16" cy="14" rx="13" ry="11" fill="url(#skullAura)"/>

    <!-- Shadow beneath skeleton -->
    <ellipse cx="16" cy="29" rx="8" ry="2.5" fill="#000" opacity="0.2"/>

    <!-- Skull shape -->
    <path d="M7 13 Q7 4 16 4 Q25 4 25 13 Q25 21 20 23 L20 28 L12 28 L12 23 Q7 21 7 13 Z" fill="url(#skeletonBody)" stroke="#1a1a1a" stroke-width="1.4" stroke-linejoin="round" filter="url(#boneShadow)"/>

    <!-- Bone texture overlay -->
    <path d="M7 13 Q7 4 16 4 Q25 4 25 13 Q25 21 20 23 L20 28 L12 28 L12 23 Q7 21 7 13 Z" fill="url(#boneTexture)" opacity="0.5"/>

    <!-- Skull crack lines -->
    <path d="M14 5 L16 10 L15 14" stroke="#d4a574" stroke-width="0.6" fill="none" opacity="0.35"/>
    <path d="M18 6 L17 11 L18 14" stroke="#d4a574" stroke-width="0.5" fill="none" opacity="0.3"/>

    <!-- Cranium detail lines -->
    <path d="M10 6 Q16 3 22 6" stroke="#d4a574" stroke-width="0.5" fill="none" opacity="0.25"/>
    <path d="M9 9 Q16 6 23 9" stroke="#d4a574" stroke-width="0.4" fill="none" opacity="0.2"/>

    <!-- Nose cavity -->
    <path d="M14 20 L16 17 L18 20 L16 23 Z" fill="#000" opacity="0.7" stroke="#1a1a1a" stroke-width="0.4"/>

    <!-- Cheekbone indentations -->
    <path d="M10 18 Q9 20 10 22" stroke="#d4a574" stroke-width="0.4" fill="none" opacity="0.3"/>
    <path d="M22 18 Q23 20 22 22" stroke="#d4a574" stroke-width="0.4" fill="none" opacity="0.3"/>

    <!-- Eye sockets -->
    <circle cx="12" cy="15" r="3" fill="#000" stroke="#1a1a1a" stroke-width="0.6"/>
    <circle cx="20" cy="15" r="3" fill="#000" stroke="#1a1a1a" stroke-width="0.6"/>

    <!-- Glowing eyes in sockets -->
    <circle cx="12" cy="15" r="2" fill="url(#boneEyeGlow)" filter="url(#boneEyeFilter)"/>
    <circle cx="20" cy="15" r="2" fill="url(#boneEyeGlow)" filter="url(#boneEyeFilter)"/>

    <!-- Eye pupil cores -->
    <circle cx="12.5" cy="15" r="0.5" fill="#451a03"/>
    <circle cx="20.5" cy="15" r="0.5" fill="#451a03"/>

    <!-- Eye glow highlights -->
    <circle cx="11.5" cy="14.5" r="0.5" fill="#fbbf24" opacity="0.6"/>
    <circle cx="19.5" cy="14.5" r="0.5" fill="#fbbf24" opacity="0.6"/>

    <!-- Teeth row -->
    <rect x="10" y="24" width="12" height="4" rx="1.5" fill="#fefce8" stroke="#1a1a1a" stroke-width="0.8"/>
    <!-- Individual teeth -->
    <path d="M11 24 L11.5 28 L12 24" fill="#ffffff" stroke="#1a1a1a" stroke-width="0.3"/>
    <path d="M14 24 L14.5 28 L15 24" fill="#ffffff" stroke="#1a1a1a" stroke-width="0.3"/>
    <path d="M17 24 L17.5 28 L18 24" fill="#ffffff" stroke="#1a1a1a" stroke-width="0.3"/>
    <path d="M20 24 L20.5 28 L21 24" fill="#ffffff" stroke="#1a1a1a" stroke-width="0.3"/>
    <!-- Tooth spacing -->
    <line x1="13" y1="24" x2="13.2" y2="28" stroke="#1a1a1a" stroke-width="0.4"/>
    <line x1="16" y1="24" x2="16.2" y2="28" stroke="#1a1a1a" stroke-width="0.4"/>
    <line x1="19" y1="24" x2="19.2" y2="28" stroke="#1a1a1a" stroke-width="0.4"/>

    <!-- Jaw texture lines -->
    <path d="M10 26 L12 25" stroke="#d4a574" stroke-width="0.3" fill="none" opacity="0.3"/>
    <path d="M22 26 L20 25" stroke="#d4a574" stroke-width="0.3" fill="none" opacity="0.3"/>

    <!-- Forehead bone detail -->
    <path d="M14 8 L16 6 L18 8" stroke="#d4a574" stroke-width="0.5" fill="none" opacity="0.25"/>

    <!-- Bone surface pitting (natural bone texture) -->
    <circle cx="10" cy="10" r="0.5" fill="#d4a574" opacity="0.3"/>
    <circle cx="22" cy="10" r="0.4" fill="#d4a574" opacity="0.25"/>
    <circle cx="15" cy="7" r="0.3" fill="#d4a574" opacity="0.3"/>
    <circle cx="20" cy="9" r="0.5" fill="#d4a574" opacity="0.2"/>

    <!-- Skull top highlight -->
    <path d="M10 6 Q16 3 22 6" stroke="#ffffff" stroke-width="0.5" fill="none" opacity="0.2"/>

    <!-- Subtle cheek glow for spooky effect -->
    <ellipse cx="9" cy="20" rx="2" ry="1" fill="#f97316" opacity="0.1"/>
    <ellipse cx="23" cy="20" rx="2" ry="1" fill="#f97316" opacity="0.1"/>
  </svg>
</template>
