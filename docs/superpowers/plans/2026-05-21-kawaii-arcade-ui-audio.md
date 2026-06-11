# Kawaii Arcade UI Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the confirmed Kawaii Arcade visual system and complete generated-audio mixer controls.

**Architecture:** Persist mixer state in `settingsStore`, route generated audio through channel-aware gain calculation, expose controls through a reusable Vue component, and let global CSS tokens carry most visual unification across the app. Keep game logic untouched.

**Tech Stack:** Vue 3 Composition API, Pinia, TypeScript, WebAudio, Vitest, Vite CSS.

---

### Task 1: Mixer Settings

**Files:**
- Modify: `src/stores/settingsStore.ts`
- Modify: `src/stores/settingsStore.test.ts`

- [ ] **Step 1: Write failing tests**

Add assertions that defaults include `masterVolume: 0.85` and `uiVolume: 0.65`, that setters clamp values, and that persistence includes all four mixer values.

- [ ] **Step 2: Run red test**

Run: `cmd /c npm test -- src/stores/settingsStore.test.ts`
Expected: fail because `masterVolume`, `uiVolume`, `setMasterVolume`, and `setUiVolume` do not exist.

- [ ] **Step 3: Implement store fields**

Add `masterVolume`, `uiVolume`, setters, clamping, load migration, persistence, and return them from the Pinia setup store.

- [ ] **Step 4: Run green test**

Run: `cmd /c npm test -- src/stores/settingsStore.test.ts`
Expected: pass.

### Task 2: Generated Audio Routing

**Files:**
- Modify: `src/composables/useGameAudio.ts`
- Modify: `src/games/survivor/audio.ts`

- [ ] **Step 1: Apply mixer math**

Route shell/UI SFX through `masterVolume * uiVolume`, route gameplay SFX through `masterVolume * soundVolume`, and route survivor music through `masterVolume * musicVolume`.

- [ ] **Step 2: Preserve existing unlock behavior**

Keep browser gesture unlock and survivor fallback behavior unchanged.

- [ ] **Step 3: Verify with tests/build**

Run: `cmd /c npm test -- src/stores/settingsStore.test.ts src/composables/useGamePlatformLayout.test.ts`
Expected: pass.

### Task 3: Audio Settings Component

**Files:**
- Create: `src/components/settings/AudioMixerPanel.vue`
- Modify: `src/views/GamePlayView.vue`

- [ ] **Step 1: Create component**

Create a focused component with four sliders: main, SFX, music, UI. It reads `settingsStore` and calls explicit setters on input.

- [ ] **Step 2: Use in pause overlay**

Replace local pause overlay slider markup in `GamePlayView.vue` with `<AudioMixerPanel compact />`.

- [ ] **Step 3: Verify build**

Run: `cmd /c npm run build-only`
Expected: pass.

### Task 4: Kawaii Arcade Tokens

**Files:**
- Modify: `src/assets/styles/tokens.css`
- Modify: `src/App.vue`
- Modify: `src/assets/main.css`

- [ ] **Step 1: Update global design tokens**

Set paper, ink, mint, pink, butter, peach, arcade shadows, 8px card radius, and readable body/display fonts while preserving existing variable names.

- [ ] **Step 2: Remove dominant neon/pixel base feel**

Keep game accent variables but make global body/app background warm paper with subtle grid texture rather than dark neon.

- [ ] **Step 3: Verify build**

Run: `cmd /c npm run build-only`
Expected: pass.

### Task 5: Shell Polish

**Files:**
- Modify: `src/views/LobbyView.vue`
- Modify: `src/views/GamePlayView.vue`
- Modify: `src/components/HudBar.vue`

- [ ] **Step 1: Lobby**

Use paper surface, ink borders, tactile cards, and arcade tabs without changing data flow.

- [ ] **Step 2: Game shell**

Use warm loading overlay, inked modals, tactile buttons, and darker but coherent in-game HUD.

- [ ] **Step 3: HUD**

Tune HUD pills and pause button to the shared Kawaii Arcade style while keeping mobile hit targets stable.

- [ ] **Step 4: Verify**

Run: `cmd /c npm run build-only`
Expected: pass.

### Task 6: Final Verification

**Files:**
- Modify: `progress.md`

- [ ] **Step 1: Unit tests**

Run: `cmd /c npm test -- src/stores/settingsStore.test.ts src/composables/useGamePlatformLayout.test.ts`
Expected: pass.

- [ ] **Step 2: Build**

Run: `cmd /c npm run build-only`
Expected: pass.

- [ ] **Step 3: Local browser attempt**

Run: `cmd /c npm run dev -- --host 127.0.0.1 --port 5173`
Expected: either Vite starts and can be inspected, or document the existing `listen UNKNOWN` environment blocker.
