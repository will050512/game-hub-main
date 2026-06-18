# 多平台響應式佈局統一重構 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 統一 Game Hub 的響應式佈局系統，修復所有跨平台元件偏移、圖標位移、HUD 重疊問題。

**Architecture:** 建立 `useResponsiveLayout` composable 作為單一真相來源，取代分散在各元件的硬編碼 px 值和 media queries。HUD 層改用 CSS Grid，VirtualControls 改用響應式尺寸，KawaiiIcon 移除 CSS transform。

**Tech Stack:** Vue 3 Composition API、CSS Grid、CSS custom properties、ResizeObserver、requestAnimationFrame

---

## 檔案變更總覽

| 檔案 | 操作 | 相關任務 |
|------|------|---------|
| `src/composables/useGamePlatformLayout.ts` | 重寫 | Task 1-2 |
| `src/composables/useBreakpoints.ts` | 新增 | Task 2 |
| `src/components/HudBar.vue` | 修改 | Task 3 |
| `src/components/VirtualJoystick.vue` | 修改 | Task 4 |
| `src/components/VirtualButtons.vue` | 修改 | Task 4 |
| `src/components/InputAffordance.vue` | 修改 | Task 5 |
| `src/components/KawaiiIcon.vue` | 修改 | Task 6 |
| `src/engine/GameEngine.ts` | 修改 | Task 7 |
| `src/components/shell/LobbyGameGrid.vue` | 修改 | Task 8 |
| `src/views/GamePlayView.vue` | 修改 | Task 9 |
| `src/composables/useGamePlatformLayout.test.ts` | 修改 | Task 2 |

---

### Task 1: 修復 `useGamePlatformLayout` NaN bug + 基礎重構

**Files:**
- Modify: `src/composables/useGamePlatformLayout.ts`
- Test: `src/composables/useGamePlatformLayout.test.ts`

- [ ] **Step 1: 修復 detectSafeArea NaN bug**

在 `useGamePlatformLayout.ts` 第 38-46 行，將 `?? 0` 改為 `|| 0`：

```typescript
function detectSafeArea(): SafeAreaInsets {
  const computedStyle = getComputedStyle(document.documentElement)
  return {
    top: parseFloat(computedStyle.getPropertyValue('--safe-top')) || 0,
    right: parseFloat(computedStyle.getPropertyValue('--safe-right')) || 0,
    bottom: parseFloat(computedStyle.getPropertyValue('--safe-bottom')) || 0,
    left: parseFloat(computedStyle.getPropertyValue('--safe-left')) || 0,
  }
}
```

**原因：** `parseFloat('')` 返回 `NaN`，`NaN ?? 0` 仍然等於 `NaN`（因為 `??` 只檢查 `null/undefined`）。`NaN || 0` 返回 `0`。

- [ ] **Step 2: 驗證修復**

在瀏覽器 Console 測試：
```javascript
parseFloat('') || 0  // → 0 ✅
parseFloat('') ?? 0  // → NaN ❌
```

- [ ] **Step 3: 執行現有測試**

```bash
npm test -- src/composables/useGamePlatformLayout.test.ts
```

Expected: 所有測試通過。如有失敗，更新測試期望值。

- [ ] **Step 4: 提交**

```bash
git add src/composables/useGamePlatformLayout.ts
git commit -m "fix: repair safe area NaN bug in useGamePlatformLayout"
```

---

### Task 2: 建立 `useBreakpoints` composable + 擴展 `useResponsiveLayout`

**Files:**
- Create: `src/composables/useBreakpoints.ts`
- Modify: `src/composables/useGamePlatformLayout.ts`
- Test: `src/composables/useGamePlatformLayout.test.ts`

- [ ] **Step 1: 建立 `useBreakpoints.ts`**

建立 `src/composables/useBreakpoints.ts`：

```typescript
import { computed, onMounted, onUnmounted, ref } from 'vue'

export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointConfig {
  sm: 640
  md: 768
  lg: 1024
  xl: 1280
  '2xl': 1536
}

const breakpoints: BreakpointConfig = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useBreakpoints() {
  const matches = {} as Record<BreakpointName, boolean>

  for (const [name, width] of Object.entries(breakpoints) as [BreakpointName, number][]) {
    const mediaQuery = window.matchMedia(`(min-width: ${width}px)`)
    matches[name] = mediaQuery.matches
  }

  const result = computed(() => {
    const m = {} as Record<BreakpointName, boolean>
    for (const name of Object.keys(breakpoints) as BreakpointName[]) {
      m[name] = matches[name]
    }
    return m
  })

  return {
    is: result,
    isSm: computed(() => matches.sm),
    isMd: computed(() => matches.md),
    isLg: computed(() => matches.lg),
    isXl: computed(() => matches.xl),
    is2Xl: computed(() => matches['2xl']),
  }
}
```

- [ ] **Step 2: 擴展 `useGamePlatformLayout.ts` → `useResponsiveLayout`**

在 `useGamePlatformLayout.ts` 末尾，建立新的 `useResponsiveLayout` 函數。保留原有的 `useGamePlatformLayout` 作為 deprecated wrapper：

```typescript
import { useBreakpoints } from './useBreakpoints'

export function useResponsiveLayout() {
  const { layout, snapshot, refreshLayout } = useGamePlatformLayout()
  const breakpoints = useBreakpoints()

  return {
    layout,
    snapshot,
    breakpoints,
    refreshLayout,
  }
}
```

- [ ] **Step 3: 更新測試**

在 `useGamePlatformLayout.test.ts` 新增測試：

```typescript
import { describe, it, expect } from 'vitest'
import { detectSafeArea } from '@/composables/useGamePlatformLayout'

describe('detectSafeArea', () => {
  it('should return 0 for empty CSS values (NaN bug fix)', () => {
    // 模擬 document.documentElement 沒有 safe area CSS 變數的情況
    // 在 JSDOM 環境中，getComputedStyle 返回空字串
    const insets = detectSafeArea()
    // 所有值應該都是數字（不是 NaN）
    expect(Number.isNaN(insets.top)).toBe(false)
    expect(Number.isNaN(insets.right)).toBe(false)
    expect(Number.isNaN(insets.bottom)).toBe(false)
    expect(Number.isNaN(insets.left)).toBe(false)
    // 應該都是 0
    expect(insets.top).toBe(0)
    expect(insets.right).toBe(0)
    expect(insets.bottom).toBe(0)
    expect(insets.left).toBe(0)
  })
})
```

- [ ] **Step 4: 執行測試**

```bash
npm test -- src/composables/useGamePlatformLayout.test.ts
```

Expected: 所有測試通過，包含新的 NaN 測試。

- [ ] **Step 5: 提交**

```bash
git add src/composables/useBreakpoints.ts src/composables/useGamePlatformLayout.ts src/composables/useGamePlatformLayout.test.ts
git commit -m "feat: add useBreakpoints composable and useResponsiveLayout wrapper"
```

---

### Task 3: HUD 層 CSS Grid 重構

**Files:**
- Modify: `src/components/HudBar.vue`（第 138-371 行 — `<style scoped>` 區塊）

- [ ] **Step 1: 重寫 `.hud-top` 為 CSS Grid**

在 `HudBar.vue` 的 `<style scoped>` 中，取代第 139-152 行：

```css
.hud-top {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-areas:
    "bars  ... score"
    "buffs items ...";
  grid-template-rows: auto auto;
  grid-template-columns: 1fr auto;
  padding: max(8px, env(safe-area-inset-top))
           max(8px, env(safe-area-inset-right))
           max(8px, env(safe-area-inset-bottom))
           max(8px, env(safe-area-inset-left));
  gap: 6px;
  pointer-events: none;
  z-index: 10;
}

.hud-top > * { pointer-events: auto; }

.hud-left {
  grid-area: bars;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 110px;
}

.hud-right {
  grid-area: score;
  display: flex;
  align-items: center;
  gap: 5px;
}
```

- [ ] **Step 2: 移除 `.hud-items` 絕對定位**

取代第 314-321 行：

```css
.hud-items {
  grid-area: items;
  justify-self: center;
  display: flex;
  gap: 6px;
}
```

- [ ] **Step 3: 移除 `.hud-buffs` 絕對定位**

取代第 355-362 行：

```css
.hud-buffs {
  grid-area: buffs;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
```

- [ ] **Step 4: 本地驗證**

```bash
npm run dev
```

開啟 http://localhost:5173，進入任意遊戲。確認：
- HP/XP bar 在左上方
- 計時器/分數在右上方
- Items 在底部中央
- Buffs 在左下方
- 任何區域互不重疊

- [ ] **Step 5: 提交**

```bash
git add src/components/HudBar.vue
git commit -m "refactor: convert HudBar from absolute positioning to CSS Grid"
```

---

### Task 4: VirtualControls 響應式尺寸

**Files:**
- Modify: `src/components/VirtualJoystick.vue`（第 197-256 行）
- Modify: `src/components/VirtualButtons.vue`

- [ ] **Step 1: 修改 VirtualJoystick 尺寸**

在 `VirtualJoystick.vue` 中，修改第 46-52 行的 `baseStyle` computed：

```typescript
const baseStyle = computed(() => {
  const size = joystickBaseSize.value
  // 響應式：最大 128px，最小 96px，偏好 25vw
  const responsiveSize = Math.min(size, Math.max(96, Math.round(window.innerWidth * 0.25)))
  return {
    width: `${responsiveSize}px`,
    height: `${responsiveSize}px`,
  }
})
```

- [ ] **Step 2: 修改 VirtualJoystick 位置**

修改第 71-82 行的 `containerPosition` computed：

```typescript
const containerPosition = computed(() => {
  const safeBottom = `max(8px, env(safe-area-inset-bottom, 8px))`
  const safeLeft = `max(8px, env(safe-area-inset-left, 8px))`
  const safeRight = `max(8px, env(safe-area-inset-right, 8px))`

  switch (props.position) {
    case 'right':
      return { bottom: safeBottom, right: safeRight, left: 'auto' }
    case 'bottom-left':
      return { bottom: safeBottom, left: safeLeft }
    case 'bottom-right':
      return { bottom: safeBottom, right: safeRight }
    default:
      return { bottom: safeBottom, left: safeLeft }
  }
})
```

- [ ] **Step 3: 修改 VirtualButtons 尺寸**

在 `VirtualButtons.vue` 中，找到按鈕的 CSS（或 inline style），改為：

```css
.action-button {
  width: min(72px, clamp(56px, 14vw, 88px));
  height: min(72px, clamp(56px, 14vw, 88px));
}
```

如果按鈕尺寸是透過 props 控制，修改 computed 加入 `Math.min(size, Math.max(56, Math.round(window.innerWidth * 0.14)))`。

- [ ] **Step 4: 本地驗證**

```bash
npm run dev
```

在瀏覽器 DevTools 切換不同 viewport 尺寸：
- 375px（iPhone SE）— 搖桿不應超出螢幕
- 768px（iPad）— 搖桿和按鈕有適當間距
- 1920px（Desktop）— 不顯示觸控控制

- [ ] **Step 5: 提交**

```bash
git add src/components/VirtualJoystick.vue src/components/VirtualButtons.vue
git commit -m "refactor: make VirtualControls responsive with viewport-based sizing"
```

---

### Task 5: InputAffordance 改用 safe area ref

**Files:**
- Modify: `src/components/InputAffordance.vue`

- [ ] **Step 1: 引入 `useResponsiveLayout`**

在 `<script setup>` 頂部新增：

```typescript
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
```

取代目前的：
```typescript
// 移除或註解掉舊的 import
// import { useGamePlatformLayout } from '@/composables/useGamePlatformLayout'
```

- [ ] **Step 2: 改用 safe area ref**

找到 `.input-companion` 的 CSS，第 126-144 行，修改定位：

```css
.input-companion {
  position: absolute;
  right: max(10px, env(safe-area-inset-right, 0px));
  top: clamp(72px, 10dvh, 112px);
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: min(250px, calc(100vw - 20px));
  max-width: 34vw;
  padding: 8px 10px;
  pointer-events: none;
  z-index: 14;
  border: 2px solid var(--color-text);
  border-radius: var(--radius-full);
  background: rgba(255, 252, 247, 0.54);
  color: var(--color-kawaii-ink);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(10px);
  opacity: 0.72;
  animation: breathe 2s var(--ease-spring) infinite;
}
```

- [ ] **Step 3: 驗證並提交**

```bash
npm run dev
git add src/components/InputAffordance.vue
git commit -m "refactor: InputAffordance uses env() safe area with proper fallbacks"
```

---

### Task 6: KawaiiIcon 安全化

**Files:**
- Modify: `src/components/KawaiiIcon.vue`（第 294-344 行 — `<style scoped>`）

- [ ] **Step 1: 添加 `contain` 並移除 CSS rotate**

在 `KawaiiIcon.vue` 的 `<style scoped>` 中：

```css
.icon-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  contain: layout size;  /* ← 阻止 transform 影響父元素佈局 */
  filter: drop-shadow(0 2px 0 rgba(27, 21, 26, 0.12));
}

.kawaii-icon {
  --icon-size: 24px;
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: var(--icon-size);
  height: var(--icon-size);
  vertical-align: middle;
  /* transform: rotate(var(--icon-tilt, -2deg)); ← 移除 */
  /* tilt 效果改為 SVG viewBox 內建，不需 CSS transform */
}
```

- [ ] **Step 2: 移除 tilt class 定義**

移除第 319-343 行的所有 `.kawaii-icon-heart`、`.kawaii-icon-coin` 等的 `--icon-tilt` 定義。

- [ ] **Step 3: 驗證並提交**

```bash
npm run dev
```

確認所有圖標在狹窄容器（如 HUD stat-pill）中不溢出。

```bash
git add src/components/KawaiiIcon.vue
git commit -m "fix: prevent KawaiiIcon overflow with contain and remove CSS rotate"
```

---

### Task 7: Canvas ResizeObserver → rAF 對齊

**Files:**
- Modify: `src/engine/GameEngine.ts`（第 82-92 行）

- [ ] **Step 1: 取代 setTimeout 為 rAF**

在 `GameEngine.ts` 的 `start()` 方法中，第 82-92 行，替換為：

```typescript
let pendingResize = false
this.resizeObserver = new ResizeObserver(() => {
  if (!pendingResize) {
    pendingResize = true
    requestAnimationFrame(() => {
      pendingResize = false
      this.syncCanvasToParent()
      this.onResize(this.width, this.height)
    })
  }
})
```

- [ ] **Step 2: 移除 `resizeTimer` 屬性**

刪除第 22 行的 `private resizeTimer = 0` 和 `clearTimeout(this.resizeTimer)`。

- [ ] **Step 3: 驗證並提交**

```bash
npm run dev
```

橫豎屏切換時確認無閃爍。

```bash
git add src/engine/GameEngine.ts
git commit -m "perf: replace ResizeObserver setTimeout with rAF for smoother canvas resize"
```

---

### Task 8: LobbyGameGrid auto-fill grid

**Files:**
- Modify: `src/components/shell/LobbyGameGrid.vue`（第 190-195 行、344-377 行）

- [ ] **Step 1: 替換 grid-template-columns**

在第 190-195 行，將所有硬編碼的 `repeat(3, 1fr)` 改為 auto-fill：

```css
.games-container.view-grid > .games-list {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr)) !important;
  gap: var(--space-6);
}
```

- [ ] **Step 2: 移除 5 組 media queries**

刪除第 344-377 行的所有 `@media` query（包含 responsive grid breakpoint 定義）。

保留第 379-388 行的 `@media (max-width: 768px)`（toolbar 樣式）。

- [ ] **Step 3: 驗證並提交**

```bash
npm run dev
```

確認大廳卡片在 375px、768px、1024px、1920px 下都正常排列。

```bash
git add src/components/shell/LobbyGameGrid.vue
git commit -m "refactor: replace 5 media queries with auto-fill grid in LobbyGameGrid"
```

---

### Task 9: GamePlayView 改用 `useResponsiveLayout`

**Files:**
- Modify: `src/views/GamePlayView.vue`（第 69 行、79-88 行、405-412 行）

- [ ] **Step 1: 更新 import**

第 9 行，修改為：

```typescript
import { useResponsiveLayout } from '@/composables/useResponsiveLayout'
```

如果 `useResponsiveLayout` 是從 `useGamePlatformLayout` 重新匯出的，保持原 import 路徑但改用新函數名。

- [ ] **Step 2: 更新 composable 呼叫**

第 69 行，修改為：

```typescript
const { layout: platformLayout, snapshot: platformSnapshot } = useResponsiveLayout()
```

- [ ] **Step 3: 驗證並提交**

```bash
npm run dev
npm test
```

確認所有 12 款遊戲正常運作。

```bash
git add src/views/GamePlayView.vue
git commit -m "refactor: GamePlayView uses useResponsiveLayout for unified layout"
```

---

### Task 10: 最終驗證 + 迴歸測試

**Files:** 無新增檔案

- [ ] **Step 1: 執行完整測試套件**

```bash
npm test
```

Expected: 所有測試通過。如有失敗，修復後重試。

- [ ] **Step 2: 執行 Lint**

```bash
npx eslint src/composables/useBreakpoints.ts src/composables/useGamePlatformLayout.ts src/components/HudBar.vue src/components/VirtualJoystick.vue src/components/VirtualButtons.vue src/components/InputAffordance.vue src/components/KawaiiIcon.vue src/engine/GameEngine.ts src/components/shell/LobbyGameGrid.vue src/views/GamePlayView.vue
```

Expected: 無 error 級別的 lint 錯誤。

- [ ] **Step 3: 執行 Playwright E2E 測試**

```bash
npm run test:e2e
```

Expected: 所有 E2E 測試通過。

- [ ] **Step 4: 手動 device emulation 驗證**

使用 Playwright MCP 或瀏覽器 DevTools，在以下裝置上驗證：

| 裝置 | 尺寸 | 驗證項目 |
|------|------|---------|
| iPhone SE | 375×667 | HUD 不重疊、搖桿不超出 |
| iPhone 15 Pro | 393×852 | 同上 |
| iPhone 15 Pro Landscape | 852×393 | Canvas 高度正確 |
| iPad Air | 820×1180 | Grid 2-3 欄、HUD 適當 |
| Desktop | 1920×1080 | 側邊 HUD、不顯示觸控控制 |

- [ ] **Step 5: 最終提交**

```bash
git add -A
git commit -m "ci: verify multi-platform layout refactor passes all tests"
```

---

## 成功標準回顧

- ✅ 12 款遊戲在所有 5 個測試裝置上無 HUD 重疊
- ✅ 橫豎屏切換無可感知的 Canvas 閃爍（<16ms）
- ✅ 虛擬搖桿和按鈕在任何螢幕尺寸下都不超出 viewport
- ✅ KawaiiIcon 在任何容器大小下都不溢出
- ✅ Safe area 在所有平台上返回正確數值（無 NaN）
- ✅ 現有測試全部通過（`npm test`）

---

## 排程

| 階段 | 任務 | 預估 |
|------|------|------|
| Phase 1 | Task 1-2: composable 基礎 | 1 天 |
| Phase 2 | Task 3: HUD CSS Grid | 0.5 天 |
| Phase 3 | Task 4-5: VirtualControls 響應式 | 0.5 天 |
| Phase 4 | Task 6-7: KawaiiIcon + Canvas rAF | 0.5 天 |
| Phase 5 | Task 8: LobbyGameGrid auto-fill | 0.5 天 |
| Phase 6 | Task 9-10: 整合 + 驗證 | 1 天 |
| **總計** | | **4 天** |
