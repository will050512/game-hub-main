# Game Hub Visual Refactoring Plan

> **Status**: In Progress | **Started**: 2025-05-14 | **Style**: Kawaii/Cute Unified Art System

## Current State

### ✅ What's Working
- KawaiiIcon system — 30+ hand-drawn SVG icons with pastel palettes
- CSS Custom Properties (tokens.css) — full design token system
- Lobby/Shop polish — animated orb backgrounds, grid-pattern backgrounds
- Mascot system — rabbit with 6 expressions
- Game engine (kawaiiCanvas.ts) — procedural kawaii drawing, ObjectPool, SpatialHash
- 5 views — Lobby, GameInfo, GamePlay, GameResult, Shop

### ❌ Problems
| # | Problem | Severity |
|---|---------|----------|
| P1 | 12 games use raw canvas primitives — just colored rectangles/circles | 🔴 Critical |
| P2 | No background scenes — all games fill screen with flat fillRect | 🔴 Critical |
| P3 | Inconsistent color tokens across games — each uses hardcoded hex values | 🟠 High |
| P4 | Canvas art system is game-specific — no shared rendering pipeline | 🟠 High |
| P5 | Capacitor version mismatch (cli@7 + core@8), no android/ folder | 🟡 Medium |
| P6 | No particle system for most games | 🟡 Medium |

---

## Architecture: "The Kawaii Factory" — 5-Layer System

```
Layer 5: Overlays & Juice  (ComboText, ScreenShake, FreezeFrame)
Layer 4: Entity Rendering   (KawaiiEntity, KawaiiProp, HUD Sprites)
Layer 3: Background Scenes  (SkyLayer, GroundLayer, Parallax per-game)
Layer 2: UI Shell           (HudBar, PauseOverlay, GameResult)
Layer 1: Foundation         (Tokens, kawaiiCanvas, KawaiiIcon, Mascot)
```

---

## Implementation Phases

### Phase 1: Foundation (DONE)
- [x] Fix Capacitor version mismatch → DONE (upgraded to v8)
- [x] Create `src/engine/art/GameArtRegistry.ts`
- [x] Create `src/engine/art/KawaiiRenderer.ts`
- [x] Create `src/engine/art/BackgroundComposer.ts`
- [x] Create `src/engine/art/ParticleRenderer.ts`
- [x] Create `src/types/art.ts`
- [ ] Extend `src/engine/kawaiiCanvas.ts` with face/eye/blush drawing
- [ ] Install Capacitor plugins + add android/

### Phase 2: Visual Effects Components (In Progress)
- [ ] Create `src/components/art/ComboText.vue`
- [ ] Create `src/components/art/ScreenShakeOverlay.vue`
- [ ] Create `src/components/art/HitFreezeOverlay.vue`
- [ ] Create `src/components/art/ConfettiEffect.vue`
- [ ] Create `src/components/art/StreakAnnouncement.vue`

### Phase 3: Background Scene Components
- [ ] Create `src/components/art/scenes/SurvivorScene.vue`
- [ ] Create `src/components/art/scenes/BreakoutScene.vue`
- [ ] Create `src/components/art/scenes/TetrisScene.vue`
- [ ] Create `src/components/art/scenes/SnakeScene.vue`
- [ ] Create `src/components/art/scenes/Game2048Scene.vue`
- [ ] Create `src/components/art/scenes/FlappyScene.vue`
- [ ] Create `src/components/art/scenes/InvadersScene.vue`
- [ ] Create `src/components/art/scenes/FruitCatchScene.vue`
- [ ] Create `src/components/art/scenes/TowerDefenseScene.vue`
- [ ] Create `src/components/art/scenes/TicTacToeScene.vue`
- [ ] Create `src/components/art/scenes/MemoryScene.vue`
- [ ] Create `src/components/art/scenes/SudokuScene.vue`

### Phase 4: View Integration
- [ ] Refactor GamePlayView.vue → add background layer + effect overlays
- [ ] Refactor GameResultView.vue → extract confetti, add streak system
- [ ] Update LobbyView.vue → ambient particles, consistent theming

### Phase 5: Capacitor Android
- [ ] `npx cap add android`
- [ ] `npx cap sync`
- [ ] Verify Android Studio project structure
- [ ] Test APK build

---

## Visual Asset Plan

### Per-Game Art Palette

Each game gets a unified 3-layer visual system:
1. **Background Scene** — CSS-based animated sky/ground with ambient particles
2. **Entity Rendering** — Kawaii faces, eyes, blush on all game characters
3. **Juice Effects** — particles, shake, flash on key events

### Unified Kawaii Palette per Game

| Game | Sky | Ground | Particle Colors | Entity Style |
|------|-----|--------|-----------------|--------------|
| Survivor | Dark gradient + clouds | Green field | Fireflies (yellow-green) | Blob with determined eyes |
| Breakout | Neon grid | Checker floor | Neon sparkles | Yellow ball with happy eyes |
| Tetris | Purple void | Floating blocks | Block shapes | Colorful blocks with faces |
| Snake | Pastel gradient | Grass + flowers | Butterflies | Green snake with cute eyes |
| 2048 | Warm gradient | Soft wood | Floating numbers | Number tiles with blush |
| Flappy | Blue sky | Green hills | Cloud puffs | Pink bird with determined eyes |
| Invaders | Deep space | Nebula | Twinkling stars | Alien invaders with angry eyes |
| Fruit-Catch | Garden | Green grass | Sparkles | Red apple with smile |
| Tower Defense | Rolling hills | Dirt path | Bubbles | Tower turrets |
| Tic-Tac-Toe | Playful doodles | Grid pattern | Confetti | X/O with expressions |
| Memory | Pastel rooms | Soft floor | Sparkles | Cards with kawaii faces |
| Sudoku | Cafe warm | Wood table | Steam particles | Number tiles with expressions |

---

## Performance Budget (Mobile WebView)

| Metric | Target |
|--------|--------|
| Ambient particles (per game) | 5-10 active |
| Burst particles (per event) | 12-20 max |
| Trail particles (per entity) | 3-5 per frame |
| Screen shake | ≤200ms per event |
| Freeze frame | 60ms max |
| Total canvas draw calls/frame | <200 |
| Memory | <150MB |

---

## Quick Wins (No Architecture Changes)

1. Add kawaii eyes to all existing game entities
2. Add particle effects to survivor, breakout, tetris, snake
3. Unify HUD styling across all games
4. Improve GameResultView (extract confetti, add streak)
5. Add ambient background particles to Lobby/Shop
6. Fix Capacitor version + build android/
