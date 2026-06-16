# 子專案 A：Kawaii 視覺設計系統 實作計劃

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 Vue UI 元件 + Canvas 遊戲渲染共享的完整 Kawaii 設計 Token 系統與元件庫。

**Architecture:** CSS Token（`kawaii-tokens.css`）為單一來源，Vue 元件透過 CSS 變數消費；Canvas 端透過 `KawaiiTheme.ts` 橋接層從 `KawaiiPresets.ts` 讀取同一份色彩/字體/圓角定義。

**Tech Stack:** Vue 3 + TypeScript + CSS Custom Properties + Canvas 2D

**Spec 來源:** `docs/superpowers/specs/2026-06-15-visual-design-system.md`

---

### Task 1: CSS Design Token + JS Typography 常數

**Files:**
- Create: `src/styles/kawaii-tokens.css`
- Create: `src/engine/art/presets/TypographyPresets.ts`

- [ ] **Step 1: 建立 kawaii-tokens.css**

```css
/* src/styles/kawaii-tokens.css */

:root {
  /* ── 基礎色票 ── */
  --color-kawaii-pink:   #f6b7d2;
  --color-kawaii-mint:   #92d5aa;
  --color-kawaii-sky:    #a6d9f7;
  --color-kawaii-lilac:  #c7b6f5;
  --color-kawaii-butter: #f4d47a;
  --color-kawaii-peach:  #f6c4a2;
  --color-kawaii-ink:    #1d161b;
  --color-kawaii-paper:  #fffdf8;

  /* ── 語意色 ── */
  --color-text:       var(--color-kawaii-ink);
  --color-surface:    var(--color-kawaii-paper);
  --color-border:     rgba(29,22,27,0.72);
  --color-border-light: rgba(29,22,27,0.16);

  /* ── 字型 ── */
  --font-family-heading: 'Nunito', 'Segoe UI', sans-serif;
  --font-family-body:    'Nunito', 'Segoe UI', sans-serif;

  /* ── 字重 ── */
  --font-weight-normal:   600;
  --font-weight-semibold: 700;
  --font-weight-bold:     800;

  /* ── 字級 ── */
  --font-size-xs:   10px;
  --font-size-sm:   12px;
  --font-size-base: 14px;
  --font-size-lg:   18px;
  --font-size-xl:   24px;
  --font-size-2xl:  32px;
  --font-size-3xl:  44px;

  /* ── 間距 ── */
  --space-1:  4px;  --space-2:  8px;  --space-3:  12px;
  --space-4:  16px; --space-5:  20px; --space-6:  24px;
  --space-8:  32px; --space-10: 40px; --space-12: 48px;

  /* ── 圓角 ── */
  --radius-sm:   6px;
  --radius-base: 10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-full: 9999px;

  /* ── 動畫 ── */
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
  --duration-bounce: 600ms;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.22, 1, 0.36, 1);

  /* ── 陰影 ── */
  --shadow-base:   0 2px 8px rgba(29,22,27,0.10);
  --shadow-md:     0 4px 16px rgba(29,22,27,0.12);
  --shadow-lg:     0 8px 24px rgba(29,22,27,0.14);
  --shadow-float:  0 10px 0 rgba(29,22,27,0.08), 0 20px 26px rgba(29,22,27,0.10);
}

/* ── Per-game 主題色 ── */
.game-survivor       { --color-primary: #06b6d4; --color-secondary: #4ade80; --color-accent: #fbbf24; --color-bg: #0c1222; }
.game-breakout       { --color-primary: #eab308; --color-secondary: #fbbf24; --color-accent: #f472b6; --color-bg: #0f0f1e; }
.game-tetris         { --color-primary: #8b5cf6; --color-secondary: #a78bfa; --color-accent: #818cf8; --color-bg: #0c0a1e; }
.game-snake          { --color-primary: #22c55e; --color-secondary: #4ade80; --color-accent: #22d3ee; --color-bg: #166534; }
.game-game2048       { --color-primary: #f59e0b; --color-secondary: #fde68a; --color-accent: #f97316; --color-bg: #fff7ed; }
.game-flappy         { --color-primary: #0891b2; --color-secondary: #fbbf24; --color-accent: #f472b6; --color-bg: #7dd3fc; }
.game-invaders       { --color-primary: #ec4899; --color-secondary: #a78bfa; --color-accent: #f472b6; --color-bg: #07010a; }
.game-fruit-catch    { --color-primary: #ef4444; --color-secondary: #f87171; --color-accent: #34d399; --color-bg: #a7f3d0; }
.game-tower-defense  { --color-primary: #f97316; --color-secondary: #60a5fa; --color-accent: #34d399; --color-bg: #93c5fd; }
.game-tic-tac-toe    { --color-primary: #6366f1; --color-secondary: #60a5fa; --color-accent: #f472b6; --color-bg: #ede9fe; }
.game-memory         { --color-primary: #ec4899; --color-secondary: #c4b5fd; --color-accent: #818cf8; --color-bg: #ede9fe; }
.game-sudoku         { --color-primary: #14b8a6; --color-secondary: #94a3b8; --color-accent: #0d9488; --color-bg: #f0fdfa; }
```

確認 `src/main.ts` 有 import 此檔案（或在 `index.html` 中引入）。

- [ ] **Step 2: 建立 TypographyPresets.ts**

```ts
// src/engine/art/presets/TypographyPresets.ts
export const FONT = {
  family: '"Nunito", "Segoe UI", sans-serif',
  weights: { normal: 600, semibold: 700, bold: 800 },
  sizes: {
    xs: 10, sm: 12, base: 14, lg: 18, xl: 24, xxl: 32, xxxl: 44,
  },
} as const

export const RADII = {
  sm: 6, base: 10, lg: 14, xl: 20, full: 9999,
} as const

export const SHADOW = {
  float: '0 10px 0 rgba(29,22,27,0.08), 0 20px 26px rgba(29,22,27,0.10)',
  lg:    '0 8px 24px rgba(29,22,27,0.14)',
} as const
```

- [ ] **Step 3: 確認 main.ts 載入 token CSS**

```ts
// src/main.ts — 確保 import 'kawaii-tokens.css' 存在（或透過其他方式載入）
import './styles/kawaii-tokens.css'
```

- [ ] **Step 4: 提交 Task 1**

```bash
git add src/styles/kawaii-tokens.css src/engine/art/presets/TypographyPresets.ts src/main.ts
git commit -m "feat(design): add kawaii design tokens CSS + TypographyPresets"
```

---

### Task 2: Canvas 橋接層 (KawaiiPresets + KawaiiTheme)

**Files:**
- Modify: `src/engine/art/presets/KawaiiPresets.ts`
- Create: `src/engine/art/KawaiiTheme.ts`

- [ ] **Step 1: 擴充 KawaiiPresets.ts 輸出完整 GameTheme**

在 `KawaiiPresets.ts` 中，將 `export interface GamePreset` 加上 font/radii 資訊。**注意：** 不修改 PRESETS 資料結構本身，而是在新增的 `getGameTheme(gameId)` 函數中組合回傳。

```ts
// 在 KawaiiPresets.ts 底部新增
import { FONT, RADII } from './TypographyPresets'

export interface GameTheme {
  palette: GamePalette
  entityColors: string[]
  hudColors: { hpBar: string; score: string; combo: string }
  font: typeof FONT
  radii: typeof RADII
}

export function getGameTheme(gameId: GameId): GameTheme {
  const preset = getPresetForGame(gameId)
  return {
    ...preset,
    font: FONT,
    radii: RADII,
  }
}
```

- [ ] **Step 2: 建立 KawaiiTheme.ts**

```ts
// src/engine/art/KawaiiTheme.ts
import { getGameTheme, type GameTheme } from './presets/KawaiiPresets'
import type { GameId } from '@/types'

export type { GameTheme }

export function getTheme(gameId: GameId): GameTheme {
  return getGameTheme(gameId)
}

/* ── 共用渲染函數 ── */

export interface KawaiiPanelOpts {
  fill?: string
  stroke?: string
  radius?: number
  accent?: string
  borderWidth?: number
}

export function drawKawaiiPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  opts: KawaiiPanelOpts = {},
): void {
  const r = opts.radius ?? 6
  const bw = opts.borderWidth ?? 1.5

  ctx.save()
  // 填滿背景
  ctx.fillStyle = opts.fill ?? 'rgba(30,20,50,0.85)'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()

  // 外框
  if (opts.stroke) {
    ctx.strokeStyle = opts.stroke
    ctx.lineWidth = bw
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    ctx.stroke()
  }

  // 左側 accent 裝飾條
  if (opts.accent) {
    ctx.fillStyle = opts.accent
    ctx.beginPath()
    ctx.roundRect(x, y + 4, 3, h - 8, 1.5)
    ctx.fill()
  }
  ctx.restore()
}

export interface KawaiiProgressOpts {
  fill?: string
  trackFill?: string
  radius?: number
  height?: number
}

export function drawKawaiiProgress(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  ratio: number,
  opts: KawaiiProgressOpts = {},
): void {
  const r = opts.radius ?? (h / 2)
  const clamped = Math.max(0, Math.min(1, ratio))

  // 軌道
  ctx.fillStyle = opts.trackFill ?? 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()

  // 進度
  ctx.fillStyle = opts.fill ?? '#ef4444'
  ctx.beginPath()
  ctx.roundRect(x, y, w * clamped, h, r)
  ctx.fill()
}

export interface KawaiiTextOpts {
  color?: string
  size?: number
  weight?: number
  align?: CanvasTextAlign
  shadowColor?: string
  shadowBlur?: number
}

export function drawKawaiiText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number,
  opts: KawaiiTextOpts = {},
): void {
  const theme = null as GameTheme | null // caller sets theme
  ctx.save()
  ctx.font = `${opts.weight ?? 700} ${opts.size ?? 14}px "Nunito", "Segoe UI", sans-serif`
  ctx.textAlign = opts.align ?? 'left'
  ctx.textBaseline = 'middle'
  if (opts.shadowColor) {
    ctx.shadowColor = opts.shadowColor
    ctx.shadowBlur = opts.shadowBlur ?? 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
  }
  ctx.fillStyle = opts.color ?? '#ffffff'
  ctx.fillText(text, x, y)
  ctx.restore()
}
```

- [ ] **Step 3: 提交 Task 2**

```bash
git add src/engine/art/presets/KawaiiPresets.ts src/engine/art/KawaiiTheme.ts
git commit -m "feat(design): add KawaiiTheme Canvas bridge + shared render functions"
```

---

### Task 3: KawaiiButton 強化

**Files:**
- Modify: `src/components/KawaiiButton.vue`

- [ ] **Step 1: 新增 click 波紋效果 CSS**

```vue
<style scoped>
/* 在既有樣式後追加 */
.kawaii-button {
  position: relative;
  overflow: hidden;
}

/* 波紋效果 */
.kawaii-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--ripple-x, 50%) var(--ripple-y, 50%), rgba(255,255,255,0.35) 0%, transparent 60%);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast);
}

.kawaii-button:active::after {
  opacity: 1;
  transition: opacity 0s;
}

/* 新增 disabled 骨頭動畫（ZZZ） */
.btn-loading {
  cursor: wait;
  position: relative;
}

.btn-loading::before {
  content: '✦';
  position: absolute;
  right: calc(var(--space-2) * -1);
  top: calc(var(--space-2) * -1);
  font-size: 12px;
  animation: kawaii-spin 1s linear infinite;
}

@keyframes kawaii-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
```

- [ ] **Step 2: 新增 loading prop 與 logic**

```ts
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  outlined?: boolean
  disabled?: boolean
  loading?: boolean   // ← 新增
}>(), {
  variant: 'primary',
  size: 'md',
  outlined: false,
  disabled: false,
  loading: false,     // ← 新增
})
```

```vue
<template>
  <button
    :class="[buttonClasses, { 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
```

- [ ] **Step 3: 提交 Task 3**

```bash
git add src/components/KawaiiButton.vue
git commit -m "feat(design): enhance KawaiiButton with ripple + loading state"
```

---

### Task 4: KmgBadge + KmgCurrency（彈跳動畫）

**Files:**
- Modify: `src/components/KmgBadge.vue`
- Modify: `src/components/KmgCurrency.vue`

- [ ] **Step 1: KmgBadge — 不對稱圓角 + bounce 動畫**

```vue
<!-- KmgBadge.vue 主要改動 -->
<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 12px 8px 14px 8px;               /* 不對稱圓角 */
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-float);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  color: var(--color-text);
  transition: transform var(--duration-bounce) var(--ease-bounce);
}

.badge.bounce {
  animation: badge-bounce var(--duration-bounce) var(--ease-bounce);
}

@keyframes badge-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
```

script 部分：使用 `watch` 監聽 value prop 變化來觸發 bounce class。

```ts
const isBouncing = ref(false)
watch(() => props.value, () => {
  isBouncing.value = true
  setTimeout(() => { isBouncing.value = false }, 600)
})
```

`isBouncing` 動態綁定到 `.badge` 的 `bounce` class。

- [ ] **Step 2: KmgCurrency — 數值變化 bounce + 旋轉動畫**

```vue
<style scoped>
.currency-value {
  transition: transform var(--duration-bounce) var(--ease-bounce);
}
.currency-value.bounce {
  animation: coin-bounce var(--duration-bounce) var(--ease-bounce);
}
@keyframes coin-bounce {
  0%   { transform: scale(1) rotate(0deg); }
  30%  { transform: scale(1.25) rotate(-8deg); }
  60%  { transform: scale(0.95) rotate(4deg); }
  100% { transform: scale(1) rotate(0deg); }
}
</style>
```

```ts
// 監聽 amount prop
const isBouncing = ref(false)
watch(() => props.amount, () => {
  isBouncing.value = true
  setTimeout(() => { isBouncing.value = false }, 600)
})
```

- [ ] **Step 3: 提交 Task 4**

```bash
git add src/components/KmgBadge.vue src/components/KmgCurrency.vue
git commit -m "feat(design): add bounce animations to KmgBadge + KmgCurrency"
```

---

### Task 5: KmgTabBar + KmgSkeleton

**Files:**
- Modify: `src/components/shell/KmgTabBar.vue`（或 LobbyViewTabs.vue — 以實際檔案名稱為準）
- Modify: `src/components/KmgSkeleton.vue`

先確認實際路徑：

- [ ] **Step 0: 確認 TabBar 元件路徑**

```bash
grep -r "KmgTabBar\|lobby-tabs\|view-tabs" src/components/ --include="*.vue" -l
```

如果 TabBar 是 `LobbyViewTabs.vue`，則修改該檔案。

- [ ] **Step 1: TabBar — pill 造型 + 滑動指示條**

```vue
<style scoped>
.tab-bar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
}

.tab {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  opacity: 0.5;
  transition: all var(--duration-fast) var(--ease-out);
  cursor: pointer;
  border: none;
  background: transparent;
}

.tab.active {
  opacity: 1;
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.tab:hover:not(.active) {
  opacity: 0.8;
  background: var(--color-border-light);
}
</style>
```

- [ ] **Step 2: KmgSkeleton — 柔和 pulse】

```vue
<style scoped>
.skeleton {
  background: var(--color-border-light);
  border-radius: var(--radius-base);
  animation: kawaii-pulse var(--duration-slow) ease-in-out infinite;
}

@keyframes kawaii-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
```

- [ ] **Step 3: 提交 Task 5**

```bash
git add src/components/shell/LobbyViewTabs.vue src/components/KmgSkeleton.vue
# 或使用實際檔案路徑
git commit -m "feat(design): pill-style tabs + soft pulse skeleton"
```

---

### Task 6: KmgTooltip + BaseCard + BaseModal

**Files:**
- Modify: `src/components/KmgTooltip.vue`
- Modify: `src/components/BaseCard.vue`
- Modify: `src/components/BaseModal.vue`

- [ ] **Step 1: KmgTooltip — 氣泡造型 + scale-in**

```vue
<style scoped>
.tooltip {
  position: absolute;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-3);
  box-shadow: var(--shadow-md);
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  transform-origin: top center;
  animation: tooltip-enter var(--duration-base) var(--ease-bounce);
  z-index: 100;
}

/* 三角尾巴 */
.tooltip::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  margin-left: -6px;
  width: 12px;
  height: 12px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-right: none;
  border-bottom: none;
  transform: rotate(45deg);
}

@keyframes tooltip-enter {
  from { transform: scale(0.9); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
```

- [ ] **Step 2: BaseCard — 雙層邊框**

```vue
<style scoped>
.kawaii-card {
  position: relative;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 28px 24px 30px 22px;   /* 不對稱圓角 */
  padding: var(--space-4);
  box-shadow: var(--shadow-float);
  transition: transform var(--duration-base) var(--ease-bounce),
              box-shadow var(--duration-base) var(--ease-out);
}

.kawaii-card::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 22px 18px 24px 18px;
  border: 1.5px dashed var(--color-border-light);
  pointer-events: none;
}

.kawaii-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
</style>
```

- [ ] **Step 3: BaseModal — backdrop-filter + scale-in**

```vue
<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(29,22,27,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: overlay-fadein var(--duration-base) ease-out;
}

.modal-content {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
  animation: modal-enter var(--duration-bounce) var(--ease-bounce);
}

@keyframes overlay-fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes modal-enter {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
```

- [ ] **Step 4: 提交 Task 6**

```bash
git add src/components/KmgTooltip.vue src/components/BaseCard.vue src/components/BaseModal.vue
git commit -m "feat(design): kawaii tooltip, double-border card, blur modal"
```

---

### Task 7: InputAffordance + ProgressBar

**Files:**
- Modify: `src/components/InputAffordance.vue`
- Modify: `src/components/ProgressBar.vue`

- [ ] **Step 1: InputAffordance — 呼吸動畫**

```vue
<style scoped>
.affordance-icon {
  animation: breathe var(--duration-slow) var(--ease-spring) infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50%      { transform: scale(1.08); opacity: 1; }
}
</style>
```

- [ ] **Step 2: ProgressBar — pill 造型 + bounce**

```vue
<style scoped>
.progress-track {
  background: var(--color-border-light);
  border-radius: var(--radius-full);
  height: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  transition: width var(--duration-bounce) var(--ease-bounce);
}
</style>
```

- [ ] **Step 3: 提交 Task 7**

```bash
git add src/components/InputAffordance.vue src/components/ProgressBar.vue
git commit -m "feat(design): breathing affordance + pill progress bar"
```

---

### Task 8: LobbyGameCard 改造

**Files:**
- Modify: `src/components/shell/LobbyGameCard.vue`

- [ ] **Step 1: 讀取現有 LobbyGameCard.vue 了解結構**

```bash
cat src/components/shell/LobbyGameCard.vue
```

- [ ] **Step 2: 套用雙層邊框 + hover 微互動**

```vue
<style scoped>
.game-card {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 28px 24px 30px 22px;
  overflow: hidden;
  box-shadow: var(--shadow-float);
  transition: transform var(--duration-base) var(--ease-bounce),
              box-shadow var(--duration-base) var(--ease-out);
  cursor: pointer;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.game-card::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 22px 18px 24px 18px;
  border: 1.5px dashed var(--color-border-light);
  pointer-events: none;
  z-index: 1;
}

/* 分類標籤 */
.category-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: var(--color-border-light);
  color: var(--color-text);
}
</style>
```

**分類對應顏色（inline style 動態綁定）：**
```ts
const categoryColorMap: Record<string, string> = {
  action:   'var(--color-kawaii-pink)',
  puzzle:   'var(--color-kawaii-lilac)',
  strategy: 'var(--color-kawaii-sky)',
  casual:   'var(--color-kawaii-mint)',
  board:    'var(--color-kawaii-butter)',
}
```

- [ ] **Step 3: 提交 Task 8**

```bash
git add src/components/shell/LobbyGameCard.vue
git commit -m "feat(design): kawaii lobby game card with double border + hover lift"
```

---

### Task 9: Survivor 試點（KawaiiTheme 整合）

**Files:**
- Modify: `src/games/survivor/index.ts`

- [ ] **Step 1: 引入 KawaiiTheme + 取代 HUD 硬編碼**

```ts
// 在 survivor/index.ts 頂部
import { getTheme, drawKawaiiPanel, drawKawaiiProgress } from '@/engine/art/KawaiiTheme'
```

在 class 中儲存 theme：
```ts
private theme = getTheme('survivor')
```

改造 `renderKawaiiHud` 方法：

```ts
// 改造前
drawKawaiiPanel(ctx, padding, padding, barWidth + padding * 4, barHeight + padding * 2, {
  fill: 'rgba(30,20,50,0.85)',
  accent: '#ec4899',
  stroke: '#374151',
  radius: Math.floor(6 * scale),
})
drawKawaiiProgress(ctx, padding + padding * 2, padding + padding * 0.5, barWidth, barHeight,
  this.playerHp / this.playerMaxHp,
  { fill: '#ef4444', trackFill: '#991b1b' },
)

// 改造後
const t = this.theme
drawKawaiiPanel(ctx, padding, padding, barWidth + padding * 4, barHeight + padding * 2, {
  fill: t.palette.bg + 'd9',
  accent: t.palette.accent,
  radius: 6 * this.dpr,
})
drawKawaiiProgress(ctx, padding + padding * 2, padding + padding * 0.5, barWidth, barHeight,
  this.playerHp / this.playerMaxHp,
  { fill: t.hudColors.hpBar, trackFill: t.palette.ink + '66' },
)

// Level badge
const badgeY = padding * 2
const badgeX = barWidth + padding * 4.5
drawKawaiiPanel(ctx, badgeX, badgeY, Math.floor(70 * this.dpr), Math.floor(32 * this.dpr), {
  fill: t.palette.palette.accent + '26',    // 15% opacity
  accent: t.palette.accent,
  radius: 8 * this.dpr,
})
drawKawaiiText(ctx, `Lv.${this.level}`,
  badgeX + Math.floor(35 * this.dpr), badgeY + Math.floor(16 * this.dpr),
  { color: t.hudColors.score, size: 14 * this.dpr, align: 'center' },
)

// Time & Score — 使用 drawKawaiiText
drawKawaiiText(ctx, `${mins}:${secs}`, this.width - padding, padding + 14 * this.dpr,
  { color: t.palette.primary, size: 12 * this.dpr, align: 'right' })
drawKawaiiText(ctx, `Score: ${hud.score}`, this.width - padding, padding + 28 * this.dpr,
  { color: t.hudColors.score, size: 10 * this.dpr, align: 'right' })
```

- [ ] **Step 2: 確認 `ctx.roundRect` 可用性**

```bash
# 檢查程式碼中是否有其他 roundRect 用法，確認無相容性問題
grep -r "roundRect" src/ --include="*.ts"
```

如果 target 瀏覽器不支援，需要 polyfill 或 fallback：

```ts
// KawaiiTheme.ts 頂部加入 polyfill
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    // 簡單 fallback: 使用 regular rect（不完美但安全）
    this.rect(x, y, w, h)
  }
}
```

- [ ] **Step 3: 執行 LSP 檢查**

```bash
npx vue-tsc --noEmit --skipLibCheck
```

- [ ] **Step 4: 提交 Task 9**

```bash
git add src/games/survivor/index.ts src/engine/art/KawaiiTheme.ts
git commit -m "feat(design): survivor pilot with KawaiiTheme HUD"
```

---

## 自我審查

**1. Spec 覆蓋率：**
- Task 1 → Section 2 (色彩 Token) + Section 3 (字體/間距) ✓
- Task 2 → Section 5 (Canvas 橋接層) ✓
- Task 3-8 → Section 4 (元件改造) ✓
- Task 9 → Section 5.3 (survivor 試點) ✓

**2. 佔位符檢查：** 所有 step 包含完整程式碼，無 TBD/TODO。

**3. 型別一致性：** `getGameTheme` / `getTheme` / `getPresetForGame` 命名一致，回傳型別匹配。

**4. 執行順序檢查：** Task 1→2 (基礎設施) → Task 3-8 (元件，可平行) → Task 9 (試點驗證，依賴 Task 2) ✓

---

## 執行交接

**Plan complete and saved to `docs/superpowers/plans/2026-06-15-visual-design-system.md`。** 

兩種執行方式：

1. **Subagent-Driven（推薦）** — 每個 Task 派一個獨立 subagent，task 間有審查點，快速迭代
2. **Inline Execution** — 在此 session 中依序執行，批次後審查

請問要用哪種方式？
