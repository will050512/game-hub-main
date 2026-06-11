# 12 Game B+C Restructure Design

## Goal

Upgrade all 12 games with the combined B+C scope: every game must have clearer thumbnails, clearer controls, and reviewed gameplay reasonableness, while games that need it can receive deeper onboarding, pacing, or rule adjustments.

## Scope

- All registered games are in scope: survivor, breakout, tetris, snake, game2048, flappy, invaders, fruit-catch, tower-defense, tic-tac-toe, memory, and sudoku.
- The lobby and game info pages must communicate each game's visual identity, controls, and tuning focus before play.
- The game shell must provide input affordances that match each game's actual input pattern instead of showing a generic action button for every touch game.
- Per-game changes should prefer tuning constants, control clarity, hitbox forgiveness, pacing, and feedback over large rewrites.

## Architecture

- Add a single `gameOptimizationProfiles` data module keyed by `GameId`. It is the coverage contract for the 12-game audit and stores thumbnail focus, control hints, and tuning notes.
- Add tests that require every `GAME_IDS` entry to have a complete optimization profile and existing thumbnail asset.
- Update `GameInfoView` to use the real registered thumbnail image and profile content, replacing the current generic icon preview.
- Update `InputAffordance` and `GamePlayView` so touch hints are selected per game: directional, swipe, tap, action, placement, or number-pad workflows.
- Apply targeted gameplay tuning in individual game modules when the current constants make onboarding or fair play weaker.

## Acceptance Criteria

- All 12 games have a complete optimization profile.
- All 12 thumbnail paths resolve to files under `public`.
- Game info pages show the real thumbnail, control chips, tuning notes, and deeper B+C focus.
- Touch affordance no longer shows a misleading fire button for games that do not use one.
- Targeted tuning changes are covered by unit tests where the game exposes a testable rule or by smoke/build verification when behavior is canvas-only.
- Existing build and type-check remain clean.

## Verification

- `npm test -- src/data/gameOptimizationProfiles.test.ts`
- `npm run type-check`
- `npm run build`
- `npm run test:e2e:smoke` if the local Node networking layer can bind a dev server; otherwise record the existing `listen UNKNOWN` blocker.
