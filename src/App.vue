<script setup lang="ts">
import { RouterView } from 'vue-router'
import OfflineBanner from '@/components/OfflineBanner.vue'
import UpdatePrompt from '@/components/UpdatePrompt.vue'
import '@/assets/styles/tokens.css'
</script>

<template>
  <OfflineBanner />
  <RouterView v-slot="{ Component, route }">
    <Transition :name="route.meta.transition as string || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <UpdatePrompt />
</template>

<style>
/* ===== Global Reset ===== */

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 100%;
  width: 100%;
  height: 100%;
}

body {
  width: 100%;
  height: 100%;
  font-family: var(--font-family-base);
  background:
    linear-gradient(90deg, rgba(38, 27, 34, 0.035) 1px, transparent 1px),
    linear-gradient(rgba(38, 27, 34, 0.035) 1px, transparent 1px),
    linear-gradient(180deg, #fff6e8 0%, #fbe8ef 54%, #fffaf2 100%);
  background-size: 20px 20px, 20px 20px, auto;
  color: var(--color-text);
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  image-rendering: auto;
}

/* Kawaii arcade paper grain */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.36), transparent 18%),
    radial-gradient(circle at 82% 8%, rgba(240, 180, 75, 0.1), transparent 20%),
    radial-gradient(circle at 75% 82%, rgba(142, 207, 173, 0.12), transparent 24%);
  pointer-events: none;
  z-index: 0;
}

/* Pixel-style scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #2a2a5a;
  border-radius: 0;
}
::-webkit-scrollbar-thumb:hover {
  background: #4a4a8a;
}

#app {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding-top: var(--safe-top, 0px);
  padding-right: var(--safe-right, 0px);
  padding-bottom: var(--safe-bottom, 0px);
  padding-left: var(--safe-left, 0px);
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

a {
  text-decoration: none;
  color: inherit;
}

/* ===== Transition Animations ===== */

/* --- Fade --- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- Slide Left --- */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}
.slide-left-enter-from {
  transform: translateX(60px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-60px);
  opacity: 0;
}

/* --- Slide Right --- */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}
.slide-right-enter-from {
  transform: translateX(-60px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(60px);
  opacity: 0;
}

/* --- Zoom Fade (dramatic reveal) --- */
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}
.zoom-fade-enter-from {
  transform: scale(0.8);
  opacity: 0;
}
.zoom-fade-leave-to {
  transform: scale(1.2);
  opacity: 0;
}

/* --- Fade Slide Up --- */
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}
.fade-slide-up-enter-from {
  transform: translateY(30px);
  opacity: 0;
}
.fade-slide-up-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

/* === NEW: Confetti Fade (GameResult) === */
.confetti-fade-enter-active,
.confetti-fade-leave-active {
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}
.confetti-fade-enter-from {
  transform: scale(0.5) rotate(-8deg);
  opacity: 0;
}
.confetti-fade-leave-to {
  transform: scale(1.3) rotate(8deg);
  opacity: 0;
}

/* === NEW: Pop In (GameInfo) === */
.pop-in-enter-active,
.pop-in-leave-active {
  transition:
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}
.pop-in-enter-from {
  transform: scale(0.7) translateY(40px);
  opacity: 0;
}
.pop-in-leave-to {
  transform: scale(1.1) translateY(-20px);
  opacity: 0;
}

/* === NEW: Slide Up (Lobby → Info) === */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
}
.slide-up-enter-from {
  transform: translateY(80px);
  opacity: 0;
}
.slide-up-leave-to {
  transform: translateY(-80px);
  opacity: 0;
}

/* === NEW: Page Flip (complex multi-step) === */
.page-flip-enter-active {
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  transform-origin: center center;
}
.page-flip-leave-active {
  transition: transform 0.4s cubic-bezier(0.55, 0, 1, 0.45),
              opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  transform-origin: center center;
}
.page-flip-enter-from {
  transform: perspective(800px) rotateY(30deg) scale(0.85);
  opacity: 0;
}
.page-flip-leave-to {
  transform: perspective(800px) rotateY(-30deg) scale(0.85);
  opacity: 0;
}

/* --- Focus-visible for accessibility --- */
:focus-visible {
  outline: 2px solid var(--color-accent, #00ff88);
  outline-offset: 2px;
}
</style>
