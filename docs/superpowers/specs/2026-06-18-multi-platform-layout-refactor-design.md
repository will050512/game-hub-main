# 多平台響應式佈局統一重構

**日期**: 2026-06-18
**狀態**: Draft — 等待使用者審核
**作者**: Sisyphus
**觸發原因**: 跨平台元件偏移、圖標位移、HUD 重疊、橫豎屏尺寸錯位

---

## 背景

Game Hub 已有優秀的跨平台基礎架構：
- `useGamePlatformLayout` composable（platform mode 偵測）
- `tokens.css` 設計 tokens（fluid font、safe area、breakpoints）
- Capacitor 7 + PWA 雙軌支援
- 3-tier responsive breakpoints（mobile / tablet / desktop）

**但目前的實現存在分散和零散問題，導致以下 bug：**

| # | 問題 | 影響 |
|---|------|------|
| 1 | HUD 全部 `position: absolute` + 硬編碼 px 值 | 不同螢幕尺寸下 HUD 重疊 |
| 2 | `.hud-buffs` 用 `top: 55px` 絕對定位 | 和 `.hud-right` 重疊 |
| 3 | `useGamePlatformLayout` safe area `parseFloat ?? 0` NaN bug | Web 環境 safe area 值 = NaN |
| 4 | VirtualJoystick / VirtualButtons 固定 px 定位 | 小螢幕超出 viewport |
| 5 | KawaiiIcon `overflow: visible` + CSS `rotate()` | 圖標從父容器溢出 |
| 6 | Canvas ResizeObserver 100ms debounce | 橫豎屏切換時可感知延遲 |
| 7 | 橫屏手機 `100dvh` 計算邏輯 | 內容被裁切 |
| 8 | Grid 斷點散落在 8+ 個元件，各有不同 | 維護困難，斷點不一致 |

---

## 目標

建立**單一的響應式佈局系統**，所有視圖共用。達成以下保證：

1. ✅ **HUD 永不重疊** — grid 佈局自動分配空間
2. ✅ **Safe area 100% 正確** — 修復 NaN bug，CSS / JS 單一真相來源
3. ✅ **VirtualControls 不超出 viewport** — 響應式尺寸 + 碰撞檢測
4. ✅ **圖標安全渲染** — `contain: layout size` 阻止 rotate 溢出
5. ✅ **Canvas resize 無閃爍** — rAF 對齊
6. ✅ **統一斷點管理** — `auto-fill` grid 取代 8 組 media queries

---

## 範圍

**包含：**
- `src/composables/useGamePlatformLayout.ts` — 重寫為 `useResponsiveLayout`
- `src/views/GamePlayView.vue` — 改用新 composable
- `src/components/HudBar.vue` — 從 absolute → CSS Grid
- `src/components/InputAffordance.vue` — 改用 safe area ref
- `src/components/VirtualJoystick.vue` — 響應式尺寸
- `src/components/VirtualButtons.vue` — 響應式尺寸
- `src/components/KawaiiIcon.vue` — 安全化
- `src/components/shell/LobbyGameGrid.vue` — auto-fill grid
- `src/engine/GameEngine.ts` — ResizeObserver 優化

**不包含：**
- 遊戲內容本身（不修改 12 個遊戲的 game logic）
- 音效系統、資料庫、商店邏輯
- PWA service worker
- 測試文件（會更新現有測試，不寫新測試）

---

## 設計

### 1. `useResponsiveLayout` Composable

**目的：** 取代 `useGamePlatformLayout`，提供單一真相來源的響應式佈局資訊。

```typescript
export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ViewportState {
  width: number
  height: number
  dpr: number
}

export interface ResponsiveLayout {
  mode: 'handheld' | 'tablet' | 'desktop'
  orientation: 'landscape' | 'portrait'
  shellClass: string
  safeArea: SafeAreaInsets
  viewport: ViewportState
  isCoarsePointer: boolean
  isNativePlatform: boolean
  isStandalone: boolean
}

export function useResponsiveLayout(): {
  layout: Ref<ResponsiveLayout>
  applyToElement(el: HTMLElement): () => void  // cleanup function
}
```

**關鍵修復：**
- `parseFloat(val) || 0` — 取代 `?? 0`（NaN 不再是 falsy）
- safe area 從 CSS `env()` 和 JS `getComputedStyle()` 雙重來源，取最大值
- 使用 `requestAnimationFrame` 對齊 viewport 更新，消除 iOS Safari 地址列跳動
- 移除 `window.addEventListener('resize')`，改用 `visualViewport.addEventListener('resize')`

**API 使用：**
```typescript
// GamePlayView.vue
const { layout, applyToElement } = useResponsiveLayout()
onMounted(() => applyToElement(document.documentElement))
```

### 2. HUD 層 — CSS Grid 重構

**目前（broken）：**
```css
.hud-top { position: absolute; top: 0; left: 0; right: 0; padding: 10px; }
.hud-items { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); }
.hud-buffs { position: absolute; right: 10px; top: 55px; }
```

**重構後：**
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
}

.hud-left { grid-area: bars; }
.hud-right { grid-area: score; }
.hud-items { grid-area: items; justify-self: center; }
.hud-buffs { grid-area: buffs; }
```

**保證：** 四個區域永不重疊，安全距離由 CSS `env()` 自動處理。

### 3. VirtualControls 碰撞檢測

**Joystick 尺寸：**
```css
.joystick-base {
  width: min(128px, clamp(96px, 25vw, 160px));
  height: min(128px, clamp(96px, 25vw, 160px));
}
```

**Button 尺寸：**
```css
.action-button {
  width: min(72px, clamp(56px, 14vw, 88px));
  height: min(72px, clamp(56px, 14vw, 88px));
}
```

**JS 碰撞檢測（InputAffordance.vue）：**
```typescript
// 當 joystick + buttons 總寬 > viewport 寬度的 45%
// → 自動縮小尺寸並縮小間距
const maxControlWidth = viewport.width * 0.45
const joystickSize = Math.min(128, maxControlWidth * 0.6)
const buttonSize = Math.min(72, maxControlWidth * 0.4)
```

### 4. KawaiiIcon 安全化

```css
.icon-svg {
  overflow: visible;
  contain: layout size;  /* ← 阻止 rotate 影響父元素 */
  filter: drop-shadow(0 2px 0 rgba(27, 21, 26, 0.12));
}

.kawaii-icon {
  transform: none;  /* ← 移除 CSS rotate */
  /* SVG 路徑內建 tilt，不需 CSS transform */
}
```

**效果：** 圖標在狹窄容器（HUD stat-pill）中不再溢出。

### 5. Canvas ResizeObserver 優化

```typescript
// BEFORE
this.resizeTimer = window.setTimeout(() => {
  this.syncCanvasToParent()
}, 100)

// AFTER
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

### 6. 統一斷點管理

**建立 `useBreakpoints.ts`：**
```typescript
export function useBreakpoints() {
  const breakpoints = {} as Record<string, Ref<boolean>>
  for (const [name, width] of Object.entries({
    sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536
  })) {
    breakpoints[name] = computed(() =>
      window.matchMedia(`(min-width: ${width}px)`).matches
    )
  }
  return breakpoints
}
```

**Grid auto-fill 取代 media queries：**
```css
.games-container.view-grid > .games-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: var(--space-4);
}
```

**移除：** `LobbyGameGrid.vue` 中 5 組 `@media` query（344-377 行）。

---

## 檔案變更清單

| 檔案 | 操作 | 說明 |
|------|------|------|
| `src/composables/useGamePlatformLayout.ts` | 重寫 | → `useResponsiveLayout`，修復 NaN bug |
| `src/composables/useBreakpoints.ts` | 新增 | 統一斷點 composable |
| `src/views/GamePlayView.vue` | 修改 | 改用 `useResponsiveLayout` |
| `src/components/HudBar.vue` | 修改 | absolute → CSS Grid |
| `src/components/InputAffordance.vue` | 修改 | 改用 safe area ref |
| `src/components/VirtualJoystick.vue` | 修改 | 響應式尺寸 |
| `src/components/VirtualButtons.vue` | 修改 | 響應式尺寸 |
| `src/components/KawaiiIcon.vue` | 修改 | 安全化 (contain + 移除 rotate) |
| `src/components/shell/LobbyGameGrid.vue` | 修改 | auto-fill grid |
| `src/engine/GameEngine.ts` | 修改 | ResizeObserver → rAF |

---

## 驗證方法

每段重構後執行：
1. `npm run dev` — 本地開發伺服器
2. 使用 Playwright device emulation：
   - iPhone SE (375x667)
   - iPhone 15 Pro (393x852)
   - iPad Air (820x1180)
   - Desktop (1920x1080)
   - Landscape mode
3. 確認 HUD 不重疊、VirtualControls 不超出 viewport、圖標不溢出

---

## 風險緩解

| 風險 | 緩解 |
|------|------|
| CSS Grid 在舊版 Android WebView 不支援 | 專案已用 Capacitor 7，最低支援 Android 6+（Grid 支援良好） |
| `env(safe-area-inset-*)` 在純 Web 環境回退 | 已有 `0px` fallback，且 `max(8px, 0)` = `8px` |
| `contain: layout size` 兼容性 | 支援率 95%+，專案目標為現代瀏覽器 |
| 橫屏手機 `dvh` 行為 | 改用 `min(100dvh, 100vh)` 確保穩定值 |

---

## 成功標準

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
| Phase 1 | `useResponsiveLayout` + `useBreakpoints` | 1 天 |
| Phase 2 | HUD 層 CSS Grid 重構 | 0.5 天 |
| Phase 3 | VirtualControls 響應式 | 0.5 天 |
| Phase 4 | KawaiiIcon 安全化 + Canvas rAF | 0.5 天 |
| Phase 5 | LobbyGameGrid auto-fill | 0.5 天 |
| Phase 6 | 驗證 + Playwright 迴歸測試 | 1 天 |
| **總計** | | **4 天** |
