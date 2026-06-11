<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 80"
    :height="size ?? 80"
    viewBox="0 0 80 80"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <!-- Main body dark gradient -->
      <linearGradient id="bossBody" x1="13" y1="9" x2="67" y2="76" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#991b1b"/>
        <stop offset="30%" stop-color="#7f1d1d"/>
        <stop offset="70%" stop-color="#450a0a"/>
        <stop offset="100%" stop-color="#1c0a00"/>
      </linearGradient>
      <!-- Body inner dark shadow -->
      <radialGradient id="bossBodyShadow" cx="50%" cy="35%" r="50%">
        <stop offset="50%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
      </radialGradient>
      <!-- Aura glow around boss -->
      <radialGradient id="bossAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#dc2626" stop-opacity="0.25"/>
        <stop offset="40%" stop-color="#991b1b" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
      </radialGradient>
      <!-- Aura pulse -->
      <radialGradient id="bossAuraPulse" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#991b1b" stop-opacity="0"/>
      </radialGradient>
      <!-- Crown/gold gradient -->
      <linearGradient id="goldCrown" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fde68a"/>
        <stop offset="25%" stop-color="#fbbf24"/>
        <stop offset="50%" stop-color="#f59e0b"/>
        <stop offset="75%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#92400e"/>
      </linearGradient>
      <!-- Crown highlight -->
      <linearGradient id="goldHighlight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fef3c7"/>
        <stop offset="50%" stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <!-- Horns gradient -->
      <linearGradient id="bossHorn" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#94a3b8"/>
        <stop offset="40%" stop-color="#6b7280"/>
        <stop offset="100%" stop-color="#1f2937"/>
      </linearGradient>
      <!-- Eye glow: menacing red -->
      <radialGradient id="bossEyeGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="1"/>
        <stop offset="30%" stop-color="#dc2626" stop-opacity="0.9"/>
        <stop offset="70%" stop-color="#991b1b" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#7f1d1d" stop-opacity="0.1"/>
      </radialGradient>
      <!-- Eye glow filter -->
      <filter id="bossEyeFilter" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feFlood flood-color="#ef4444" flood-opacity="0.9"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Aura glow filter -->
      <filter id="bossAuraFilter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feFlood flood-color="#dc2626" flood-opacity="0.2"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <!-- Body drop shadow -->
      <filter id="bossShadow" x="-15%" y="-5%" width="130%" height="135%">
        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000" flood-opacity="0.4"/>
      </filter>
      <!-- Chest armor highlight -->
      <linearGradient id="bossArmorHighlight" x1="26" y1="18" x2="54" y2="30" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
        <stop offset="50%" stop-color="#fca5a5" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
      </linearGradient>
      <!-- Background gradient for aura -->
      <radialGradient id="bgAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#dc2626" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
      </radialGradient>
    </defs>

    <!-- Large ambient aura -->
    <ellipse cx="40" cy="40" rx="38" ry="34" fill="url(#bossAura)" filter="url(#bossAuraFilter)"/>

    <!-- Outer aura ring -->
    <ellipse cx="40" cy="40" rx="36" ry="30" fill="url(#bossAuraPulse)"/>

    <!-- Body shadow -->
    <ellipse cx="40" cy="72" rx="22" ry="6" fill="#1c0a00" opacity="0.25"/>

    <!-- Main imposing body -->
    <path d="M13 31 Q15 9 40 9 Q65 9 67 31 L61 62 Q40 76 19 62 Z" fill="url(#bossBody)" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round" filter="url(#bossShadow)"/>

    <!-- Body dark overlay -->
    <path d="M13 31 Q15 9 40 9 Q65 9 67 31 L61 62 Q40 76 19 62 Z" fill="url(#bossBodyShadow)"/>

    <!-- Chest armor highlight (top-left gloss) -->
    <path d="M26 18 Q40 8 54 18 L51 25 Q40 20 29 25 Z" fill="url(#bossArmorHighlight)" opacity="0.8"/>

    <!-- Chest armor plate lines -->
    <path d="M25 22 Q40 16 55 22" stroke="#450a0a" stroke-width="1" fill="none" opacity="0.4"/>
    <path d="M24 28 Q40 22 56 28" stroke="#450a0a" stroke-width="1" fill="none" opacity="0.35"/>
    <path d="M24 34 Q40 28 56 34" stroke="#450a0a" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M25 40 Q40 35 55 40" stroke="#450a0a" stroke-width="0.7" fill="none" opacity="0.25"/>

    <!-- Vertical armor seams -->
    <path d="M40 16 L40 58" stroke="#450a0a" stroke-width="0.8" fill="none" opacity="0.3"/>
    <path d="M32 17 L30 56" stroke="#450a0a" stroke-width="0.5" fill="none" opacity="0.2"/>
    <path d="M48 17 L50 56" stroke="#450a0a" stroke-width="0.5" fill="none" opacity="0.2"/>

    <!-- Crown/Horns with gold gradient -->
    <!-- Left horn/crown spike -->
    <path d="M28 14 L15 3 L22 14" fill="url(#goldCrown)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M22 14 L10 1 L20 15" fill="url(#goldHighlight)" stroke="#78350f" stroke-width="1" stroke-linejoin="round"/>

    <!-- Right horn/crown spike -->
    <path d="M52 14 L65 3 L58 14" fill="url(#goldCrown)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M58 14 L70 1 L60 15" fill="url(#goldHighlight)" stroke="#78350f" stroke-width="1" stroke-linejoin="round"/>

    <!-- Center crown spike -->
    <path d="M35 12 L40 1 L45 12" fill="url(#goldCrown)" stroke="#78350f" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M40 8 L40 1 L42 5" fill="url(#goldHighlight)" stroke="#78350f" stroke-width="0.8" stroke-linejoin="round"/>

    <!-- Crown base band -->
    <path d="M24 15 Q40 10 56 15 L54 20 Q40 16 26 20 Z" fill="url(#goldCrown)" stroke="#78350f" stroke-width="1" stroke-linejoin="round"/>

    <!-- Crown gems -->
    <circle cx="40" cy="13" r="2.5" fill="#ef4444" stroke="#991b1b" stroke-width="0.6"/>
    <circle cx="40" cy="13" r="1.2" fill="#fca5a5"/>
    <circle cx="30" cy="15" r="1.5" fill="#ef4444" stroke="#991b1b" stroke-width="0.4"/>
    <circle cx="30" cy="15" r="0.5" fill="#fca5a5"/>
    <circle cx="50" cy="15" r="1.5" fill="#ef4444" stroke="#991b1b" stroke-width="0.4"/>
    <circle cx="50" cy="15" r="0.5" fill="#fca5a5"/>

    <!-- Horn texture lines -->
    <path d="M22 10 L18 5" stroke="#6b7280" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M58 10 L62 5" stroke="#6b7280" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M40 6 L40 3" stroke="#6b7280" stroke-width="0.5" fill="none" opacity="0.4"/>

    <!-- Eye sockets -->
    <circle cx="29" cy="37" r="7" fill="#000" stroke="#1a1a1a" stroke-width="1"/>
    <circle cx="51" cy="37" r="7" fill="#000" stroke="#1a1a1a" stroke-width="1"/>

    <!-- Glowing red eyes (menacing, large) -->
    <circle cx="29" cy="37" r="5.5" fill="url(#bossEyeGlow)" filter="url(#bossEyeFilter)"/>
    <circle cx="51" cy="37" r="5.5" fill="url(#bossEyeGlow)" filter="url(#bossEyeFilter)"/>

    <!-- Eye pupil cores -->
    <ellipse cx="29.5" cy="37" rx="0.8" ry="3.5" fill="#000" opacity="0.8"/>
    <ellipse cx="51.5" cy="37" rx="0.8" ry="3.5" fill="#000" opacity="0.8"/>

    <!-- Eye highlights -->
    <circle cx="28" cy="35.5" r="1.8" fill="#fca5a5" opacity="0.5"/>
    <circle cx="50" cy="35.5" r="1.8" fill="#fca5a5" opacity="0.5"/>

    <!-- Cheek marks (menacing warpaint) -->
    <path d="M25 44 Q27 42 29 44" stroke="#dc2626" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.5"/>
    <path d="M51 44 Q53 42 55 44" stroke="#dc2626" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.5"/>

    <!-- Mouth (menacing grin) -->
    <path d="M31 53 Q40 61 49 53" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" fill="none"/>

    <!-- Boss teeth (menacing fangs) -->
    <path d="M32 53 L33 57 L34 53" fill="#f87171" stroke="#991b1b" stroke-width="0.5"/>
    <path d="M36 55 L37 59 L38 55" fill="#fca5a5" stroke="#991b1b" stroke-width="0.5"/>
    <path d="M40 56 L40 60 L41 56" fill="#fca5a5" stroke="#991b1b" stroke-width="0.5"/>
    <path d="M42 55 L43 59 L44 55" fill="#fca5a5" stroke="#991b1b" stroke-width="0.5"/>
    <path d="M46 53 L47 57 L48 53" fill="#f87171" stroke="#991b1b" stroke-width="0.5"/>

    <!-- Jaw/neck details -->
    <path d="M34 58 Q40 62 46 58" stroke="#450a0a" stroke-width="0.8" fill="none" opacity="0.4"/>
    <path d="M32 62 Q40 66 48 62" stroke="#450a0a" stroke-width="0.6" fill="none" opacity="0.3"/>

    <!-- Decorative border elements -->
    <circle cx="20" cy="28" r="3" fill="#78350f" stroke="#fbbf24" stroke-width="0.8"/>
    <circle cx="20" cy="28" r="1" fill="#fbbf24"/>
    <circle cx="60" cy="28" r="3" fill="#78350f" stroke="#fbbf24" stroke-width="0.8"/>
    <circle cx="60" cy="28" r="1" fill="#fbbf24"/>

    <!-- Side boss ornamentation -->
    <path d="M17 35 L13 30 L19 34" fill="#78350f" stroke="#92400e" stroke-width="0.5"/>
    <path d="M63 35 L67 30 L61 34" fill="#78350f" stroke="#92400e" stroke-width="0.5"/>

    <!-- Decorative border line around body -->
    <path d="M15 30 Q17 12 40 11 Q63 12 65 30 L60 60 Q40 74 20 60 Z" stroke="#fbbf24" stroke-width="1" fill="none" opacity="0.25"/>

    <!-- Chest emblem (decorative) -->
    <path d="M40 28 L37 34 L40 40 L43 34 Z" fill="url(#goldCrown)" stroke="#78350f" stroke-width="0.8"/>
    <circle cx="40" cy="33" r="2" fill="#ef4444" opacity="0.7"/>

    <!-- Shoulder spikes -->
    <path d="M17 22 L10 16 L20 20" fill="#4b5563" stroke="#1f2937" stroke-width="0.6"/>
    <path d="M63 22 L70 16 L60 20" fill="#4b5563" stroke="#1f2937" stroke-width="0.6"/>

    <!-- Lower body armor lines -->
    <path d="M22 45 L20 58" stroke="#450a0a" stroke-width="0.6" fill="none" opacity="0.2"/>
    <path d="M58 45 L60 58" stroke="#450a0a" stroke-width="0.6" fill="none" opacity="0.2"/>
    <path d="M30 50 L28 62" stroke="#450a0a" stroke-width="0.5" fill="none" opacity="0.15"/>
    <path d="M50 50 L52 62" stroke="#450a0a" stroke-width="0.5" fill="none" opacity="0.15"/>

    <!-- Body texture (armor plating marks) -->
    <path d="M30 38 L30 55" stroke="#450a0a" stroke-width="0.4" fill="none" opacity="0.15"/>
    <path d="M50 38 L50 55" stroke="#450a0a" stroke-width="0.4" fill="none" opacity="0.15"/>

    <!-- Underbody shadow -->
    <ellipse cx="40" cy="65" rx="18" ry="6" fill="#1c0a00" opacity="0.2"/>

    <!-- Subtle face glow -->
    <ellipse cx="40" cy="37" rx="16" ry="12" fill="#dc2626" opacity="0.03"/>
  </svg>
</template>
