Original prompt: 針對所有emoji都改成好看且符合以下參考檔案風格的SVG或是CSS美化，我要風格統一且完成所有遊戲的背景、角色、道具美化，修復所有遊戲得邏輯與畫面

## Current batch
- Focus: first six games only — breakout, snake, tetris, game2048, flappy, survivor.
- Goal: remove remaining canvas placeholder icon/text usage at known hotspots, keep gameplay geometry/timing stable, and verify with diagnostics/build/browser smoke.

## Notes
- `progress.md` did not previously exist; created before continuing batch work.
- Shared UI overhaul is already complete; this batch targets in-canvas overlays and sprite variants.
- Visual-engineering delegation failed due to model routing (`gemini-3-pro-preview` unavailable), so implementation continues locally.

## Completed in this batch
- Added reusable canvas doodle helpers in `src/engine/kawaiiCanvas.ts` for icon badges, inline labels, panels, buttons, and progress bars.
- Added helper tests in `src/engine/kawaiiCanvas.test.ts` and verified red → green locally.
- Extended `breakout.powerup` sprite variants in `src/components/art/manifest.ts` to tint power-up art by power-up id.
- Replaced remaining first-batch placeholder canvas icon text at these hotspots:
  - `src/games/breakout/index.ts`: power-up icon glyphs, stage subtitle icon prefix, archetype discovery floating text.
  - `src/games/snake/index.ts`: buff indicator, arena modifier indicator, arena modifier floating text.
  - `src/games/tetris/index.ts`: panel chrome, mission header/icon treatment, item buttons.
  - `src/games/game2048/index.ts`: objective indicator and item buttons.
  - `src/games/flappy/index.ts`: ready/gameover panel chrome polish.
  - `src/games/survivor/index.ts`: codex floating discovery text and HUD archetype labels.
- Expanded Playwright smoke coverage in `tests/smoke/shell-traversal.spec.ts` to open/play/pause all six first-batch games.

## Verification
- `npm test -- src/engine/kawaiiCanvas.test.ts` ✅
- `npm run type-check` ✅
- `npm run build` ✅
- `npm run test:e2e:smoke` ✅ (includes breakout, snake, tetris, game2048, flappy, survivor shell traversal)
- `lsp_diagnostics` clean on all touched source/test files ✅

## Second batch logic + verification update
- Remaining six games received logic/regression fixes:
  - `src/games/tower-defense/index.ts`: removed duplicate wave increment path so wave progression advances once per wave.
  - `src/games/sudoku/index.ts`: daily challenge puzzle selection now respects difficulty-matched `dailyChallenge.puzzleIndex` safely.
  - `src/games/tic-tac-toe/index.ts`: power cards (`swap`, `block`, `undo`) are wired into gameplay, AI move selection, board-full detection, and move history.
  - `src/games/invaders/index.ts`: player fire-rate cooldown bonus now clamps to a safe minimum.
  - `src/games/fruit-catch/index.ts`: active touch ownership no longer gets stolen by a second touch.
  - `src/games/memory/index.ts`: mismatch timeout is tracked and cleared across resets/new boards.
- Added second-batch regression tests:
  - `src/games/tower-defense/index.test.ts`
  - `src/games/sudoku/index.test.ts`
  - `src/games/tic-tac-toe/index.test.ts`
  - `src/games/invaders/index.test.ts`
  - `src/games/fruit-catch/index.test.ts`
  - `src/games/memory/index.test.ts`
- Expanded `tests/smoke/shell-traversal.spec.ts` to cover all 12 games.
- Fixed strict TypeScript issues in `src/games/tic-tac-toe/index.test.ts` so repo-wide type-check is clean again.
- Fixed smoke-test flakiness by pausing immediately after the shell becomes available in `tests/smoke/shell-traversal.spec.ts` instead of waiting long enough for snake to game over.

## Latest verification status
- `npm test -- src/games/tower-defense/index.test.ts src/games/sudoku/index.test.ts src/games/tic-tac-toe/index.test.ts src/games/invaders/index.test.ts src/games/fruit-catch/index.test.ts src/games/memory/index.test.ts` ✅
- `npm run type-check` ✅
- `npm run build` ✅
- `npm run test:e2e:smoke` ✅ (`16 passed`, all 12 game shells covered)
- `lsp_diagnostics` clean on touched smoke/test files ✅

## Second batch visual polish update
- Extended `src/engine/kawaiiCanvas.ts` icon coverage for second-batch render chrome so remaining games can use shared doodle icons instead of text placeholders:
  - added mappings/support for `basket`, `block`, `rocket`, plus item ids such as `big_basket`, `double_score`, `repair`, `sparkle`, `swap`, and `triple`
- Applied second-batch visual polish to the remaining six games without changing gameplay rules:
  - `src/games/invaders/index.ts`
    - replaced text-based power-up icons with `drawKawaiiCanvasIcon`
    - upgraded HUD/effect readouts to `drawKawaiiPanel` + `drawKawaiiInlineLabel` + `drawKawaiiProgressBar`
  - `src/games/fruit-catch/index.ts`
    - replaced plain HUD/weather/effect rectangles with shared doodle panels/progress bars
    - replaced effect icon text glyphs with shared canvas icons
  - `src/games/tower-defense/index.ts`
    - upgraded menu/start button, bottom HUD, and tower purchase controls to shared doodle button/panel chrome
  - `src/games/tic-tac-toe/index.ts`
    - upgraded menu chrome and in-game status chrome to shared doodle panels/buttons
    - surfaced power cards as visible chip controls with proper tap targets
  - `src/games/memory/index.ts`
    - switched card backs/faces to `memory.card-back` / `memory.card-face`
    - removed placeholder `?` back rendering and wrapped menu/status chrome in shared doodle panels/buttons
  - `src/games/sudoku/index.ts`
    - switched board cells to `sudoku.cell`
    - upgraded menu, top info band, number pad, action buttons, and assist toggles to shared doodle controls

## Final verification after second-batch visuals
- `lsp_diagnostics` clean on all touched visual files ✅
- `npm run type-check` ✅
- `npm run build` ✅
- `npm run test:e2e:smoke` ✅ (`16 passed`, full 12-game shell traversal)

## TODO
- Spot-check for any remaining minor in-canvas placeholder text/icon hacks that were not part of this batch's targeted hotspots.

## Audio volume + multi-platform game layout update
- Added normalized sound/music volume settings to `src/stores/settingsStore.ts`, with persistence and clamping.
- Added `src/composables/useGamePlatformLayout.ts` to classify handheld/tablet/desktop layout from viewport, pointer type, standalone PWA, and native Capacitor runtime.
- Updated generated WebAudio feedback in `src/composables/useGameAudio.ts` to route through a shared gain node controlled by sound volume.
- Updated survivor-specific audio in `src/games/survivor/audio.ts` so generated/sample SFX use sound volume and loop music uses music volume.
- Refactored `src/views/GamePlayView.vue` to:
  - drive layout from platform classes instead of width-only media queries,
  - wrap the canvas in a dedicated frame so game engines measure the actual play area,
  - keep phone and phone-landscape layouts fullscreen instead of moving the HUD into a side rail,
  - expose sound/music sliders in the pause menu.
- Added failing-first tests, now passing:
  - `src/stores/settingsStore.test.ts`
  - `src/composables/useGamePlatformLayout.test.ts`
- Verification so far:
  - `cmd /c npm test -- src/stores/settingsStore.test.ts src/composables/useGamePlatformLayout.test.ts` ✅
  - `cmd /c npm test -- src/stores/settingsStore.test.ts src/composables/useGamePlatformLayout.test.ts src/engine/GameEngine.test.ts` ✅ (`GameEngine.test.ts` path has no matching file; Vitest ran the two new suites)
  - `cmd /c npm run build-only` ✅
  - `cmd /c npm run type-check` blocked by pre-existing project errors in `src/engine/kawaiiCanvas.ts`, `src/games/game2048/index.ts`, `src/games/snake/index.ts`, `src/games/tetris/index.ts`, and `src/views/LobbyView.vue`; touched files were not listed.
  - `cmd /c npx eslint ...touched files...` blocked because `vue-eslint-parser` is missing from installed dependencies.
  - Local browser/mobile verification blocked because Vite cannot listen on `127.0.0.1` or `0.0.0.0` in this environment (`listen UNKNOWN`); first attempt also showed a Console Ninja local connection failure.

## Kawaii Arcade unified UI/UX + full mixer update
- Confirmed visual direction with static mockups:
  - `.superpowers/brainstorm/static-ux-audio-options.html`
  - `.superpowers/brainstorm/static-ux-audio-a-arcade.html`
- Added design/implementation docs:
  - `docs/superpowers/specs/2026-05-21-kawaii-arcade-ui-audio-design.md`
  - `docs/superpowers/plans/2026-05-21-kawaii-arcade-ui-audio.md`
- Expanded audio settings in `src/stores/settingsStore.ts`:
  - added `masterVolume` and `uiVolume`
  - kept `soundVolume` and `musicVolume`
  - all four clamp to 0-1 and persist to `game_hub_settings`
- Updated generated audio routing:
  - `src/composables/useGameAudio.ts` now applies `masterVolume * uiVolume` for shell/UI sounds and `masterVolume * soundVolume` for gameplay sounds.
  - `src/games/survivor/audio.ts` now applies `masterVolume` at the master gain and keeps `musicVolume` on generated music.
- Added shared mixer UI:
  - `src/components/settings/AudioMixerPanel.vue` with four sliders: 主音量, 遊戲音效, 背景音樂, 介面音.
  - Game pause overlay now uses the shared mixer.
  - Lobby now has an 音訊 tab using the shared mixer.
- Applied Kawaii Arcade visual unification:
  - `src/assets/styles/tokens.css` moved global tokens from dominant dark neon/pixel to warm paper, ink border, mint/pink/butter accents, 8px card radii, and tactile arcade shadows.
  - `src/App.vue` / `src/assets/main.css` now use warm paper grid/background instead of dark neon base.
  - `src/components/DoodleCard.vue`, `src/components/GameCard.vue`, `src/components/HudBar.vue`, `src/components/shell/LobbyHeroSection.vue`, `src/components/shell/LobbyViewTabs.vue`, and `src/views/LobbyView.vue` were tuned to the confirmed direction.
  - Removed visible emoji stat icons in `LobbyHeroSection.vue` in favor of shared `KawaiiIcon`.
- Type cleanup in touched lobby files:
  - fixed `LobbyView.vue` date string narrowing.
  - fixed `LobbyCategoryBar.vue` readonly category prop compatibility.
- Verification:
  - `cmd /c npm test -- src/stores/settingsStore.test.ts src/composables/useGamePlatformLayout.test.ts` ✅ (`2 passed`, `6 passed`)
  - `cmd /c npm run build-only` ✅
  - `cmd /c npm run type-check` still blocked by pre-existing errors in `src/engine/kawaiiCanvas.ts`, `src/games/game2048/index.ts`, `src/games/snake/index.ts`, and `src/games/tetris/index.ts`; no touched files are listed now.
  - `cmd /c npm run dev -- --host 127.0.0.1 --port 5173` still blocked by local Node/Console Ninja networking (`connect UNKNOWN 127.0.0.1:13424`), so no dev server is left running.

## Shop collectibles + purchase ledger completion update
- Completed the missing collection-shop path:
  - `src/views/ShopView.vue` now has two shop shelves: ability upgrades and collectible cosmetics.
  - `ShopCollectibleCard` is wired into the shop for badges and avatar frames from `src/data/shopCatalog.ts`.
  - Badge/frame purchase calls now use the database transaction path, refresh coin balance, reload player collection state, and update recent transaction history.
  - Owned collectibles can be equipped immediately from the shop; equipped badge/frame state is shown in the side panel.
- Generalized shop transaction persistence in `src/composables/useDatabase.ts`:
  - Bumped schema version to 2.
  - SQLite `shop_purchases` now records `item_type`, `item_id`, nullable `upgrade_id`, `level`, `cost`, and `purchased_at`.
  - Added migration from the old upgrade-only `shop_purchases` schema, including old `upgrade_id NOT NULL` tables.
  - Added SQLite `purchaseCollectionItem()` with one transaction for coin spend + collection update + purchase ledger insert.
  - Exposed `purchaseCollectionItem()` from `useDatabase()`.
  - Saved web SQLite store after collection/equip writes.
- Improved shop UX:
  - Fixed class mismatches by styling the actual `shop-view`, `tab-btn`, `shop-grid`, and balance controls used by the template.
  - Recent transactions now display readable names for upgrades, badges, and avatar frames.
  - Added sticky shop controls with shelf tabs and category filters that work on mobile and desktop.

## Verification after shop collectibles + purchase ledger update
- `cmd /c npm run type-check` ✅
- `cmd /c npm test` ✅ (`8 passed`, `22 passed`)
- `cmd /c npm run build` ✅
- `cmd /c npm run lint` ✅ (`0 errors`, `50 warnings`; warnings are existing project warnings at the configured limit)
- `cmd /c npm run test:e2e:smoke` blocked by local Node networking again: Playwright webServer fails before tests with `connect UNKNOWN 127.0.0.1:<port>`, matching the previously recorded environment issue.
- `cmd /c npm run dev -- --host 127.0.0.1 --port 5173` also blocked by the same local Node networking layer: Vite exits with `listen UNKNOWN: unknown error 127.0.0.1:5173`, so no dev server is left running.

## UI/UX, audio, shop, and DB integration update
- Added a shared synthetic WebAudio feedback layer in `src/composables/useGameAudio.ts` so every registered game has score, hit, hurt, power-up, success/fail, shell, coin, level-up, and game-over feedback without requiring per-game audio files.
- Wired common game shell callbacks in `src/views/GamePlayView.vue` to trigger audio feedback from score/stats/HUD/item/currency/game-over events across all 12 games.
- Marked every canonical game manifest as audio-capable in `src/games/registry.ts`.
- Reworked shop persistence in `src/composables/useDatabase.ts`:
  - added `shop_purchases` / `gamehub_shop_purchases`
  - added `purchaseUpgrade()` for one-step spend + upgrade write + purchase ledger
  - added `getShopPurchases()` for recent transaction reads
- Updated `src/stores/currencyStore.ts` and `src/views/ShopView.vue` so purchases use the DB transaction path and the shop shows recent transactions.
- Improved shop responsive layout and removed visible decorative orb background in favor of a quieter patterned surface.
- Made `vite-plugin-vue-devtools` opt-in via `VITE_ENABLE_DEVTOOLS=true` and made Vite host default to `127.0.0.1`; use `VITE_HOST_ALL=true` for LAN binding.
- Added a test-safe fallback for `ctx.measureText` in `src/engine/kawaiiCanvas.ts`.
- Removed a no-op pivot assignment in `src/engine/sprites/spriteLoader.ts` so lint has no errors.

## Verification after UI/UX/audio/shop/DB update
- `npm run type-check` ✅
- `npm test` ✅ (`8 passed`, `22 passed`)
- `npm run lint` ✅ (`0 errors`, `50 warnings`; the warning count is at the configured limit and predates this batch)
- `npm run build` ✅ after setting `TEMP` and `TMP` to `C:\Users\s1568\AppData\Local\Temp`
- `npm run test:e2e:smoke` blocked by local Node networking: even `node -e "http.createServer(...).listen(...)"` fails with `listen UNKNOWN` on `127.0.0.1`, so Playwright cannot start or reuse a local web server in this shell.

## 12-game B+C restructure and optimization update
- User selected combined scope B+C for all 12 games.
- Added visual companion fallback mockup because the brainstorming server and direct HTML open both failed in this Windows environment:
  - `.superpowers/brainstorm/2026-05-21-12-game-restructure-scope.html`
- Added design and implementation plan:
  - `docs/superpowers/specs/2026-05-21-12-game-bc-restructure-design.md`
  - `docs/superpowers/plans/2026-05-21-12-game-bc-restructure.md`
- Added the 12-game optimization coverage contract:
  - `src/data/gameOptimizationProfiles.ts`
  - `src/data/gameOptimizationProfiles.test.ts`
  - Covers thumbnail focus, control chips, playability checks, deep polish notes, touch pattern, and featured icon for every `GAME_IDS` entry.
  - Test verifies all 12 games are covered and every registry thumbnail maps to an asset under `public/images`.
- Updated game information UX in `src/views/GameInfoView.vue`:
  - Real registered thumbnail image is now used in the large preview, with icon fallback.
  - Added control chips, gameplay reasonableness checks, and deeper B+C polish focus.
- Updated play-shell input hints:
  - `src/components/InputAffordance.vue` now reads each game's touch pattern profile.
  - `src/views/GamePlayView.vue` passes the canonical `gameId`.
  - The generic fire/action button is hidden for games that do not use action input.
- Applied targeted gameplay reasonableness tuning:
  - `src/games/flappy/index.ts`: gentler gravity/flap speed, slower early pipe pace, wider early gaps, smaller collision hit radius.
  - `src/games/fruit-catch/index.ts`: wider/faster basket, slower early falling speed, longer spawn interval, gentler early storm penalty.
  - `src/games/tetris/index.ts`: slower early fall interval and clearer swipe/tap threshold handling for mobile.
  - `src/games/survivor/index.ts`: reset spawn state cleanly on init, slower first waves, lower early enemy pressure.
- Cleaned up existing canvas effects type mismatches so verification is reliable:
  - `src/engine/kawaiiCanvas.ts`
  - `src/games/game2048/index.ts`
  - `src/games/snake/index.ts`
  - `src/games/tetris/index.ts`

## Verification after 12-game B+C update
- `cmd /c npm test -- src/data/gameOptimizationProfiles.test.ts` ✅ (`3 passed`)
- `cmd /c npm run type-check` ✅
- `cmd /c npm run build` ✅
- `cmd /c npm test` ✅ (`15 passed`, `49 passed`)
- `cmd /c npm run test:e2e:smoke` blocked by the known local Node networking layer: Playwright webServer exits with `connect UNKNOWN 127.0.0.1:13424`.

## Breakout playability fix
- User reported Breakout was not normally playable: bricks were too small and the gameplay rules felt unreasonable.
- Root causes found in `src/games/breakout/index.ts`:
  - Brick width was capped at `14 * dpr`, making blocks tiny on normal screens.
  - `serveTimer` was set but no longer drove a launch flow, so balls could stay at zero velocity.
  - Power-up ids in the game logic no longer matched `src/games/breakout/data.ts`, so several effects could not activate.
- Added regression tests in `src/games/breakout/index.test.ts` for:
  - playable brick sizing,
  - upward launch velocity,
  - current power-up id normalization.
- Reworked Breakout internals:
  - Added `computeBreakoutBrickMetrics()` with larger readable bricks, sane gaps, and top-down layout.
  - Added `createBreakoutLaunchVelocity()` and restored serve-to-launch behavior.
  - Restored sticky-ball release behavior using fire/action/up input.
  - Fixed boss brick hp handling instead of destroying bosses in one hit.
  - Reconnected power-up spawning and current ids: `wide_paddle`, `sticky_paddle`, `laser`, `narrow_paddle`, `slow_ball`, `speed_ball`, `extra_life`.
  - Switched power-up rendering to shared canvas icons.

## Verification after Breakout playability fix
- `cmd /c npm test -- src/games/breakout/index.test.ts` ✅ (`3 passed`)
- `cmd /c npm test -- src/games/breakout/index.test.ts src/data/gameOptimizationProfiles.test.ts` ✅ (`6 passed`)
- `cmd /c npm run type-check` ✅
- `cmd /c npm run build` ✅
- `cmd /c npm test` ✅ (`16 passed`, `52 passed`)
- `cmd /c npm run test:e2e:smoke` still blocked by local dev server binding: `listen UNKNOWN: unknown error 127.0.0.1:5173`.

## Tutorial, Survivor scale, and louder audio fix
- User reported every game's instruction overlay would not disappear, Survivor looked too small, and sound effects/background music still needed more volume.
- Fixed shared tutorial timing in `src/components/TutorialOverlay.vue`:
  - starts auto-advance even when mounted with `visible=true`;
  - keeps the final instruction visible for one full timer duration;
  - completes and hides one-step tutorials instead of leaving them open indefinitely;
  - manual tap on the final step now completes through the same path.
- Added regression coverage in `src/components/TutorialOverlay.test.ts`.
- Enlarged Survivor readability in `src/games/survivor/index.ts`:
  - added `SURVIVOR_VISUAL_TUNING`;
  - increased player/enemy/projectile/pickup visual scale;
  - applied a closer world render scale so the playfield no longer reads as tiny;
  - migrated older saved player radius values up to the new readable baseline.
- Added Survivor visual tuning coverage in `src/games/survivor/index.test.ts`.
- Raised audio loudness:
  - `src/stores/settingsStore.ts` defaults now use louder master/SFX/music/UI levels.
  - Previous quiet default mixer values in localStorage migrate to the louder baseline, while custom user-set values are preserved.
  - `src/games/survivor/audio.ts` raises Survivor music bus gain and sample/synth gain multipliers.
- Added audio/settings coverage in:
  - `src/stores/settingsStore.test.ts`
  - `src/games/survivor/audio.test.ts`

## Verification after tutorial, Survivor, and audio fix
- `cmd /c npx vitest run src/components/TutorialOverlay.test.ts src/games/survivor/index.test.ts src/games/survivor/audio.test.ts src/stores/settingsStore.test.ts` ✅ (`8 passed`)
- `cmd /c npm test` ✅ (`19 passed`, `58 passed`)
- `cmd /c npm run type-check` ✅
- `cmd /c npm run build` ✅
- `cmd /c npm run test:e2e:smoke` still blocked by local dev server binding: `listen UNKNOWN: unknown error 127.0.0.1:5173`.

## 12-game UI/UX, shop, responsive layout, and audio polish update
- User reported broad UI/UX issues across all 12 games, missing shop system, poor responsive behavior, dull sound/music, bottom annotations blocking gameplay, and grid games with disconnected or abnormal layout.
- Restored shop visibility and fixed shop wiring:
  - `src/components/shell/LobbyViewTabs.vue` now includes a visible `商店` entry.
  - `src/views/LobbyView.vue` routes the shop entry to `/shop`.
  - `src/views/ShopView.vue` now wires shelf/category changes into `useShopLogic()` instead of discarding them.
  - `src/views/ShopView.vue` now passes real recent purchases and purchasing state to side/modal UI.
  - `src/composables/useShopLogic.ts` uses Chinese shelf labels (`強化`, `收藏`).
- Reworked in-game operation hints:
  - `src/components/InputAffordance.vue` replaces the large bottom instruction pills with a compact visual companion panel.
  - The keyboard hint is folded into the same companion and no longer blocks the lower playfield.
- Improved responsive gameplay shell:
  - `src/views/GamePlayView.vue` no longer caps desktop play width at 1200px.
  - Desktop HUD side rail now uses a responsive width clamp to leave more canvas room.
- Added shared grid layout safety:
  - `src/games/shared/responsiveGridLayout.ts`
  - Used by `src/games/memory/index.ts`, `src/games/tic-tac-toe/index.ts`, and `src/games/sudoku/index.ts`.
  - `src/games/game2048/index.ts` clamps board size/position better on short viewports.
- Upgraded shared audio:
  - `src/composables/useGameAudio.ts` now exports `SHELL_AUDIO_TUNING`.
  - Non-Survivor games now get a lightweight generated background music loop instead of silence.
  - Shared SFX now use an added overtone layer and louder gain boost so events are less plain.
- Added regression coverage:
  - `src/components/shell/LobbyViewTabs.test.ts`
  - `src/components/InputAffordance.test.ts`
  - `src/views/ShopView.test.ts`
  - `src/games/shared/responsiveGridLayout.test.ts`
  - `src/composables/useGameAudio.test.ts`

## Verification after 12-game UI/UX/shop/responsive/audio update
- `cmd /c npx vitest run src/components/shell/LobbyViewTabs.test.ts src/components/InputAffordance.test.ts src/games/shared/responsiveGridLayout.test.ts src/views/ShopView.test.ts src/composables/useGameAudio.test.ts src/games/memory/index.test.ts src/games/tic-tac-toe/index.test.ts src/games/sudoku/index.test.ts` ✅ (`12 passed`)
- `cmd /c npm run type-check` ✅
- `cmd /c npm test` ✅ (`24 passed`, `63 passed`)
- `cmd /c npm run build` ✅
- `cmd /c npm run test:e2e:smoke` still blocked by the known local dev server binding failure: `listen UNKNOWN: unknown error 127.0.0.1:5173`.
- Manual dev server retry with `cmd /c npm run dev -- --host 0.0.0.0 --port 5174` also failed with `listen UNKNOWN: unknown error 0.0.0.0:5174`, so no local URL was left running.

## Shop integration and adaptive result screen update
- User reported shop functionality needed real integration and the result screen required zooming to see the full page.
- Added shop integration coverage in `src/composables/useShopLogic.test.ts`:
  - upgrade purchase flow deducts coins, updates player upgrade level, and writes recent purchase history;
  - collection purchase flow deducts coins, adds item to collection, equips it, and writes recent purchase history.
- Updated result page responsiveness in `src/views/GameResultView.vue`:
  - page is now a fixed `100dvh` viewport shell with a dedicated `.result-scroll` content region;
  - score block, header, details, footer, and short-height layouts use `clamp()` and compact breakpoints;
  - landscape/short viewports can show more details per row without browser zoom.
- Added result page structure coverage in `src/views/GameResultView.test.ts`.

## Verification after shop integration and result screen update
- `cmd /c npx vitest run src/views/GameResultView.test.ts src/composables/useShopLogic.test.ts` ✅ (`3 passed`)
- `cmd /c npm run type-check` ✅
- `cmd /c npm test` ✅ (`26 passed`, `66 passed`)
- `cmd /c npm run build` ✅
- `cmd /c npm run test:e2e:smoke` still blocked by the known local dev server binding failure: `listen UNKNOWN: unknown error 127.0.0.1:5173`.
