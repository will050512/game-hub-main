# Kawaii Arcade UI And Audio Design

## Goal

Unify Game Hub around the confirmed A direction: warm hand-drawn Kawaii Arcade visuals with stronger game feel, plus complete volume controls for generated audio.

## Visual Direction

The app should feel like a polished handheld arcade toy box, not a generic dashboard and not a dark neon-only arcade. The base surface is warm paper, controls use dark ink outlines, cards use tight 8px corners, and interaction states should feel tactile through offset shadows and pressed states. Each game can keep its identity color, but shared UI chrome should come from one system.

## UI/UX Scope

- Global tokens move away from dominant neon pixel styling toward Kawaii Arcade tokens: paper backgrounds, ink borders, mint/pink/butter accents, and solid arcade shadows.
- Lobby, shop, game info, result, and reusable cards/buttons should inherit the shared token treatment where possible.
- Game play keeps fullscreen canvas on handheld devices and uses a compact HUD overlay or side rail only when platform layout allows it.
- Pause menus include complete audio controls so players can tune sound without leaving the game.

## Audio Scope

Audio remains generated in code. The mixer has four normalized controls:

- `masterVolume`: global multiplier for all app audio.
- `soundVolume`: gameplay event SFX such as score, hit, hurt, power-up, success/fail, and game over.
- `musicVolume`: generated/background music.
- `uiVolume`: shell interaction SFX such as clicks, notifications, coins, and achievements.

The settings are persisted in `localStorage` through `settingsStore`. Existing sound/music enabled toggles remain intact.

## Architecture

- `settingsStore` owns persisted mixer state and clamping.
- `useGameAudio` owns generated shell/game SFX routing and applies `masterVolume * channelVolume`.
- `survivor/audio.ts` applies the same mixer rules to survivor-specific sample/generated audio.
- A new reusable Vue audio settings component renders sliders and emits through the settings store actions.
- Global CSS tokens carry most of the visual unification so existing views improve without deep rewrites.

## Verification

- Unit tests cover mixer defaults, clamping, and persistence.
- Build verifies Vue/CSS integration.
- Browser verification is attempted when the local Node networking layer allows Vite to listen. If still blocked by `listen UNKNOWN`, document the blocker.
