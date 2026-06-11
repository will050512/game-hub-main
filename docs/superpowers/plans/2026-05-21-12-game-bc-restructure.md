# 12 Game B+C Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete B+C optimization coverage for all 12 games: thumbnails, controls, and gameplay reasonableness with deeper targeted polish.

**Architecture:** Add a typed per-game optimization profile as the audit contract, render it in the info and play shell, and tune individual games where the profile identifies unfair or unclear behavior. Keep existing game adapters and registry intact.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vitest, Playwright smoke tests, canvas game modules.

---

### Task 1: 12-Game Optimization Profile Contract

**Files:**
- Create: `src/data/gameOptimizationProfiles.ts`
- Create: `src/data/gameOptimizationProfiles.test.ts`

- [ ] **Step 1: Write failing tests**

Create tests that import `GAME_IDS`, `gameOptimizationProfiles`, and `getGameOptimizationProfile`. Assert every game has thumbnail focus text, three or more control chips, three or more tuning notes, and an existing thumbnail file under `public`.

- [ ] **Step 2: Run red test**

Run: `cmd /c npm test -- src/data/gameOptimizationProfiles.test.ts`
Expected: fail because the module does not exist.

- [ ] **Step 3: Implement profiles**

Create a typed profile object keyed by all 12 `GameId` values. Include `thumbnailFocus`, `controlChips`, `playabilityChecks`, `deepPolish`, and `touchPattern`.

- [ ] **Step 4: Run green test**

Run: `cmd /c npm test -- src/data/gameOptimizationProfiles.test.ts`
Expected: pass.

### Task 2: Game Info Thumbnail And B+C Audit UI

**Files:**
- Modify: `src/views/GameInfoView.vue`

- [ ] **Step 1: Use real thumbnails**

Render `game.thumbnail` in the large preview, with the current icon preview as fallback.

- [ ] **Step 2: Render profile content**

Add B+C sections for control chips, playability checks, and deeper polish focus.

- [ ] **Step 3: Verify Vue integration**

Run: `cmd /c npm run type-check`
Expected: pass.

### Task 3: Per-Game Input Affordances

**Files:**
- Modify: `src/components/InputAffordance.vue`
- Modify: `src/views/GamePlayView.vue`

- [ ] **Step 1: Pass game id into affordance component**

Use the existing `gameId` computed value in `GamePlayView`.

- [ ] **Step 2: Map touch hints by profile**

Use `touchPattern` from `gameOptimizationProfiles` to show the right hint labels and to hide action controls for games that do not use them.

- [ ] **Step 3: Verify Vue integration**

Run: `cmd /c npm run type-check`
Expected: pass.

### Task 4: Targeted Gameplay Reasonableness Tuning

**Files:**
- Modify: `src/games/flappy/index.ts`
- Modify: `src/games/fruit-catch/index.ts`
- Modify: `src/games/tetris/index.ts`
- Modify: `src/games/survivor/index.ts`

- [ ] **Step 1: Flappy**

Make early pipe gaps less punishing, slow the first few pipes slightly, and keep hitbox forgiveness readable.

- [ ] **Step 2: Fruit Catch**

Make early basket control more forgiving and reduce early spawn pressure while keeping later score scaling.

- [ ] **Step 3: Tetris**

Add a slightly longer early fall interval and clearer mobile gesture threshold so accidental rotations are reduced.

- [ ] **Step 4: Survivor**

Clamp early enemy speed/damage growth so first waves give players enough space to learn movement and auto-attack.

- [ ] **Step 5: Verify build**

Run: `cmd /c npm run build`
Expected: pass.

### Task 5: Full Verification And Progress Log

**Files:**
- Modify: `progress.md`

- [ ] **Step 1: Unit profile tests**

Run: `cmd /c npm test -- src/data/gameOptimizationProfiles.test.ts`
Expected: pass.

- [ ] **Step 2: Type-check**

Run: `cmd /c npm run type-check`
Expected: pass.

- [ ] **Step 3: Build**

Run: `cmd /c npm run build`
Expected: pass.

- [ ] **Step 4: Smoke test attempt**

Run: `cmd /c npm run test:e2e:smoke`
Expected: pass if local Node can bind a dev server; otherwise document the known `listen UNKNOWN` blocker in `progress.md`.
