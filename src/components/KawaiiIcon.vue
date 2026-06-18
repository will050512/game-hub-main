<script setup lang="ts">
import { computed } from 'vue'
import type { KawaiiIconId } from '@/data/iconManifest'

const props = withDefaults(defineProps<{
  name: KawaiiIconId
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
}>(), {
  size: 'md',
  label: '',
})

const palette = computed(() => {
  const warm = { main: '#f6b7d2', alt: '#fce7f3', accent: '#f59e0b', paper: '#fffdf8' }
  const mint = { main: '#92d5aa', alt: '#d9f7e4', accent: '#f59e0b', paper: '#fffef9' }
  const sky = { main: '#a6d9f7', alt: '#e0f2fe', accent: '#fb7185', paper: '#fffefb' }
  const lilac = { main: '#c7b6f5', alt: '#ede9fe', accent: '#f472b6', paper: '#fffefb' }
  const butter = { main: '#f4d47a', alt: '#fef3c7', accent: '#fb7185', paper: '#fffdf7' }
  const peach = { main: '#f6c4a2', alt: '#fde7d7', accent: '#f97316', paper: '#fffdf8' }
  const ink = '#1d161b'

  switch (props.name) {
    case 'heart':
    case 'apple':
    case 'flame':
      return { ...warm, ink }
    case 'shield':
    case 'preview':
    case 'search':
    case 'snow':
    case 'keyboard':
      return { ...sky, ink }
    case 'orb':
    case 'undo':
    case 'puzzle':
    case 'strategy':
      return { ...lilac, ink }
    case 'coin':
    case 'crown':
    case 'trophy':
    case 'star':
    case 'sparkle':
    case 'action':
      return { ...butter, ink }
    case 'basket':
    case 'book':
    case 'shop':
    case 'bomb':
      return { ...peach, ink }
    default:
      return { ...mint, ink }
  }
})

const isBurst = computed(() => ['action', 'star', 'sparkle'].includes(props.name))
const isArrow = computed(() => ['speed', 'boomerang'].includes(props.name))
const isControllerFamily = computed(() => ['arcade', 'controller'].includes(props.name))
</script>

<template>
  <span
    :class="['kawaii-icon', `kawaii-icon-${size}`, `kawaii-icon-${name}`]"
    :aria-label="label"
    :aria-hidden="!label"
    role="img"
  >
    <svg class="icon-svg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g v-if="isBurst">
        <path
          d="M32 7L39 20L54 16L47 29L59 37L44 41L46 56L32 49L18 56L20 41L5 37L17 29L10 16L25 20Z"
          :fill="palette.main"
          :stroke="palette.ink"
          stroke-width="4.2"
          stroke-linejoin="round"
        />
        <circle cx="32" cy="32" r="7" :fill="palette.alt" :stroke="palette.ink" stroke-width="3" />
        <circle v-if="name === 'sparkle'" cx="45" cy="17" r="3.5" fill="#fff" :stroke="palette.ink" stroke-width="2.2" />
        <path v-if="name === 'action'" d="M32 21v22M21 32h22" :stroke="palette.ink" stroke-width="3.4" stroke-linecap="round" />
      </g>

      <g v-else-if="isControllerFamily">
        <path
          d="M14 35c0-7 5-13 12-13h12c7 0 12 6 12 13v5c0 6-4 10-10 10-4 0-7-2-8-5-1 3-4 5-8 5-6 0-10-4-10-10z"
          :fill="palette.paper"
          :stroke="palette.ink"
          stroke-width="4"
          stroke-linejoin="round"
        />
        <rect v-if="name === 'arcade'" x="18" y="9" width="28" height="17" rx="6" :fill="palette.main" :stroke="palette.ink" stroke-width="4" />
        <circle v-if="name === 'arcade'" cx="32" cy="18" r="3.4" :fill="palette.alt" :stroke="palette.ink" stroke-width="2.4" />
        <path d="M23 32v10M18 37h10" :stroke="palette.ink" stroke-width="3.4" stroke-linecap="round" />
        <circle cx="42" cy="34" r="3.2" :fill="palette.main" :stroke="palette.ink" stroke-width="2.4" />
        <circle cx="48" cy="39" r="3.2" :fill="palette.alt" :stroke="palette.ink" stroke-width="2.4" />
      </g>

      <g v-else-if="name === 'board'">
        <rect x="10" y="10" width="44" height="44" rx="10" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" />
        <path d="M25 14v36M39 14v36M14 25h36M14 39h36" :stroke="palette.main" stroke-width="4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'puzzle'">
        <path
          d="M17 15h15c0 4 2 6 6 6 5 0 7-3 7-8h2c0 8 0 16 0 24-4 0-6 2-6 6 0 5 4 7 8 7v1H17c0-5-2-7-6-7-5 0-7 4-7 8h-1V27h2c0 4 2 7 7 7 4 0 6-2 6-6 0-5-4-7-8-7v-6c2 0 4 0 7 0z"
          :fill="palette.main"
          :stroke="palette.ink"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </g>

      <g v-else-if="name === 'strategy'">
        <circle cx="32" cy="32" r="19" :fill="palette.alt" :stroke="palette.ink" stroke-width="4" />
        <circle cx="32" cy="32" r="10" fill="none" :stroke="palette.main" stroke-width="4" />
        <path d="M32 14v8M32 42v8M14 32h8M42 32h8" :stroke="palette.ink" stroke-width="3.2" stroke-linecap="round" />
        <path d="M39 16l9 3-7 6z" :fill="palette.main" :stroke="palette.ink" stroke-width="3" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'heart'">
        <path d="M32 53C24 45 13 37 13 25c0-6 5-11 11-11 4 0 7 2 8 5 2-3 6-5 10-5 6 0 11 5 11 11 0 12-11 20-21 28z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'trophy'">
        <path d="M20 13h24v9c0 9-5 16-12 18-7-2-12-9-12-18z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M18 17h-5c0 8 3 12 10 12M46 17h5c0 8-3 12-10 12" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <path d="M28 39h8v8h8v6H20v-6h8z" :fill="palette.alt" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'crown'">
        <path d="M10 47l4-24 14 13 6-19 8 19 12-13 4 24z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M13 47h38" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <circle cx="18" cy="26" r="3.4" :fill="palette.alt" :stroke="palette.ink" stroke-width="2.2" />
        <circle cx="33" cy="18" r="3.4" :fill="palette.alt" :stroke="palette.ink" stroke-width="2.2" />
        <circle cx="46" cy="26" r="3.4" :fill="palette.alt" :stroke="palette.ink" stroke-width="2.2" />
      </g>

      <g v-else-if="name === 'coin'">
        <ellipse cx="32" cy="32" rx="20" ry="18" :fill="palette.main" :stroke="palette.ink" stroke-width="4" />
        <ellipse cx="32" cy="32" rx="11" ry="10" :fill="palette.alt" :stroke="palette.ink" stroke-width="3" />
        <path d="M32 24v16M25 32h14" :stroke="palette.ink" stroke-width="3.4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'shop'">
        <path d="M15 27h34l-3 24H18z" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M19 27c0-7 5-11 13-11s13 4 13 11" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <path d="M21 34h22" :stroke="palette.main" stroke-width="4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'home'">
        <path d="M12 30l20-16 20 16v20H12z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M24 50V35h16v15" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'search'">
        <circle cx="28" cy="28" r="14" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" />
        <path d="M39 39l10 10" :stroke="palette.ink" stroke-width="5" stroke-linecap="round" />
        <circle cx="24" cy="23" r="3" fill="#fff" />
      </g>

      <g v-else-if="name === 'check'">
        <path d="M14 34l10 10 25-24" fill="none" :stroke="palette.ink" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'lock'">
        <rect x="17" y="27" width="30" height="24" rx="7" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" />
        <path d="M22 27v-5c0-6 4-10 10-10s10 4 10 10v5" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <circle cx="32" cy="38" r="3.5" :fill="palette.main" :stroke="palette.ink" stroke-width="2.4" />
      </g>

      <g v-else-if="name === 'timer'">
        <circle cx="32" cy="34" r="18" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" />
        <path d="M26 13h12" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <path d="M32 34V23M32 34l8 4" :stroke="palette.ink" stroke-width="3.6" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'keyboard'">
        <rect x="10" y="19" width="44" height="26" rx="8" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" />
        <g :fill="palette.ink">
          <circle cx="19" cy="28" r="2.1" />
          <circle cx="28" cy="28" r="2.1" />
          <circle cx="37" cy="28" r="2.1" />
          <circle cx="46" cy="28" r="2.1" />
          <rect x="19" y="34" width="26" height="4" rx="2" />
        </g>
      </g>

      <g v-else-if="name === 'flame'">
        <path d="M35 11c2 7-2 11 5 17 6 5 8 10 8 15 0 10-7 17-17 17s-17-7-17-17c0-11 9-15 13-23 2 4 6 6 8-9z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M32 31c5 4 7 7 7 11 0 5-3 8-8 8s-8-3-8-8c0-4 2-7 9-11z" :fill="palette.alt" :stroke="palette.ink" stroke-width="3" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'shield'">
        <path d="M32 10l17 6v13c0 13-7 22-17 27-10-5-17-14-17-27V16z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M32 18v27" :stroke="palette.paper" stroke-width="4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'skull'">
        <path d="M20 34c-4-3-6-8-6-13 0-10 8-18 18-18s18 8 18 18c0 5-2 10-6 13v11H20z" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <ellipse cx="25" cy="23" rx="4" ry="5" :fill="palette.ink" />
        <ellipse cx="39" cy="23" rx="4" ry="5" :fill="palette.ink" />
        <path d="M28 37h8M24 42h16" :stroke="palette.ink" stroke-width="3.2" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'upgrade'">
        <path d="M32 10l13 14h-7v18h-12V24h-7z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M18 48h28" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'back'">
        <path d="M47 18L18 32l29 14" fill="none" :stroke="palette.ink" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'apple'">
        <path d="M32 55c-10 0-16-7-16-16 0-8 5-14 12-16 1-7 8-10 14-8 6 2 10 8 8 16 5 2 8 7 8 12 0 7-5 12-12 12z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M33 17c1-5 4-8 8-9" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <path d="M38 14c6-2 9 1 11 5-4 0-8 1-12-1z" :fill="palette.alt" :stroke="palette.ink" stroke-width="3" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'basket'">
        <path d="M17 28h30l-4 22H21z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M23 28c1-7 4-11 9-11s8 4 9 11" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <path d="M24 34v12M32 32v15M40 34v12" :stroke="palette.ink" stroke-width="3" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'bomb'">
        <circle cx="29" cy="35" r="15" :fill="palette.ink" :stroke="palette.paper" stroke-width="1.2" />
        <path d="M40 23l6-6" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <path d="M48 14c2 2 4 5 3 8-2-1-5-1-7 0" :fill="palette.main" :stroke="palette.ink" stroke-width="3" stroke-linejoin="round" />
        <circle cx="23" cy="29" r="3" fill="#fff" />
      </g>

      <g v-else-if="name === 'laser'">
        <path d="M11 35h30" :stroke="palette.main" stroke-width="7" stroke-linecap="round" />
        <path d="M36 26l16 9-16 9z" :fill="palette.alt" :stroke="palette.ink" stroke-width="3" stroke-linejoin="round" />
      </g>

      <g v-else-if="name === 'magnet'">
        <path d="M20 18v14c0 7 5 12 12 12s12-5 12-12V18" fill="none" :stroke="palette.ink" stroke-width="7" stroke-linecap="round" />
        <path d="M20 18h10M34 18h10" :stroke="palette.main" stroke-width="8" stroke-linecap="round" />
        <path d="M20 28h6M38 28h6" :stroke="palette.alt" stroke-width="7" stroke-linecap="round" />
      </g>

      <g v-else-if="isArrow">
        <path d="M15 41c17-2 20-13 20-23 3 7 8 10 16 10-5 4-8 8-10 15-6-4-14-4-26-2z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path v-if="name === 'speed'" d="M18 23h14M15 29h12" :stroke="palette.ink" stroke-width="3" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'orb'">
        <circle cx="32" cy="32" r="19" :fill="palette.main" :stroke="palette.ink" stroke-width="4" />
        <path d="M23 21c4-4 14-4 18 0-7 0-12 2-18 0z" fill="#fff" opacity="0.8" />
        <circle cx="26" cy="27" r="4" fill="#fff" opacity="0.7" />
      </g>

      <g v-else-if="name === 'snow'">
        <path d="M32 10v44M14 20l36 24M50 20L14 44M18 12l28 40M46 12L18 52" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
        <circle cx="32" cy="32" r="4" :fill="palette.main" :stroke="palette.ink" stroke-width="2.4" />
      </g>

      <g v-else-if="name === 'pill'">
        <rect x="14" y="24" width="36" height="16" rx="8" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" transform="rotate(-25 32 32)" />
        <path d="M25 20l14 24" :stroke="palette.main" stroke-width="6" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'preview'">
        <path d="M8 32c7-10 15-15 24-15s17 5 24 15c-7 10-15 15-24 15S15 42 8 32z" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <circle cx="32" cy="32" r="8" :fill="palette.main" :stroke="palette.ink" stroke-width="3" />
        <circle cx="32" cy="32" r="3" :fill="palette.ink" />
      </g>

      <g v-else-if="name === 'undo'">
        <path d="M21 24l-9 8 9 8" fill="none" :stroke="palette.ink" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M17 32h14c7 0 12 3 12 10" fill="none" :stroke="palette.ink" stroke-width="4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'cards'">
        <rect x="14" y="16" width="24" height="32" rx="6" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" transform="rotate(-6 26 32)" />
        <rect x="28" y="18" width="24" height="32" rx="6" :fill="palette.main" :stroke="palette.ink" stroke-width="4" transform="rotate(8 40 34)" />
      </g>

      <g v-else-if="name === 'block'">
        <path d="M18 15h28v34H18z" :fill="palette.main" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M18 28h28M32 15v34" :stroke="palette.alt" stroke-width="4" stroke-linecap="round" />
      </g>

      <g v-else-if="name === 'book'">
        <path d="M16 16h16c4 0 8 2 10 4 2-2 6-4 10-4h0v32h0c-4 0-8 2-10 4-2-2-6-4-10-4H16z" :fill="palette.paper" :stroke="palette.ink" stroke-width="4" stroke-linejoin="round" />
        <path d="M32 20v28" :stroke="palette.ink" stroke-width="3" stroke-linecap="round" />
        <path d="M20 24h8M36 24h8" :stroke="palette.main" stroke-width="3" stroke-linecap="round" />
      </g>
    </svg>
  </span>
</template>

<style scoped>
.kawaii-icon {
  --icon-size: 24px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: var(--icon-size);
  height: var(--icon-size);
  vertical-align: middle;
}

.icon-svg {
  width: 100%;
  height: 100%;
  overflow: hidden;
  contain: layout size;
  filter: drop-shadow(0 2px 0 rgba(27, 21, 26, 0.12));
}

.kawaii-icon-xs { --icon-size: 14px; }
.kawaii-icon-sm { --icon-size: 18px; }
.kawaii-icon-md { --icon-size: 24px; }
.kawaii-icon-lg { --icon-size: 36px; }
.kawaii-icon-xl { --icon-size: 56px; }
</style>
