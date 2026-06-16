# 子專案 A：Kawaii 視覺設計系統

> **設計目標**：建立 Vue UI 元件 + Canvas 遊戲渲染共享的完整 Kawaii 設計語言，使遊戲中心具備一致的可愛風格品牌識別。

**日期**：2026-06-15
**狀態**：設計審查中

---

## 1. 系統架構

```
┌─────────────────────────────────────────────────┐
│               CSS 設計 Token (kawaii-tokens.css)  │
│  --color-kawaii-* / --space-* / --radius-*       │
│  --font-* / --duration-* / --ease-* / --shadow-* │
└────────────────────┬────────────────────────────┘
                     │ consumes
          ┌──────────┼──────────┐
          ▼          ▼          ▼
   ┌──────────┐ ┌────────┐ ┌──────────────┐
   │ Vue 元件  │ │ Canvas  │ │ KawaiiPresets│
   │ (UI層)    │ │ 渲染器   │ │ (JS 單一來源)│
   │ var(--*)  │ │(遊戲內) │ │              │
   └──────────┘ └────────┘ └──────┬───────┘
                                  │
                           ┌──────▼───────┐
                           │ KawaiiTheme.ts│
                           │ (Canvas 橋接層)│
                           └──────────────┘
```

### 1.1 三層架構

- **CSS Token 層** (`kawaii-tokens.css`)：定義所有基礎設計值
- **Vue 元件層**：所有共用 UI 元件使用 CSS 變數
- **Canvas 橋接層** (`KawaiiTheme.ts`)：JS 端渲染函數 + 主題查詢，從 `KawaiiPresets` 讀取
- **色彩單一來源**：`KawaiiPresets.ts` 同時餵給 CSS 和 Canvas，確保兩邊一致

---

## 2. 色彩 Token 系統

### 2.1 基礎色票

```
Token                      值         用途
──┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
--color-kawaii-pink     #f6b7d2   主要強調色
--color-kawaii-mint     #92d5aa   次要強調色
--color-kawaii-sky      #a6d9f7   資訊/連結色
--color-kawaii-lilac    #c7b6f5   特殊/稀有
--color-kawaii-butter   #f4d47a   金幣/獎勵
--color-kawaii-peach    #f6c4a2   警告/水果
--color-kawaii-ink      #1d161b   字體/邊框（深墨色）
--color-kawaii-paper    #fffdf8   卡片/面板底色
```

### 2.2 語意 Token

```
--color-text            var(--color-kawaii-ink)
--color-surface         var(--color-kawaii-paper)
--color-border          rgba(29,22,27,0.72)
--color-border-light    rgba(29,22,27,0.16)

--color-primary         (per-game)
--color-secondary       (per-game)
--color-accent          (per-game)
--color-bg              (per-game)
```

### 2.3 每款遊戲主題色

從 `KawaiiPresets.ts` 的 12 組 palette 生成，在 `.game-survivor` / `.game-breakout` 等 class 上設定：

```css
.game-survivor {
  --color-primary: #06b6d4;   --color-secondary: #4ade80;
  --color-accent:  #fbbf24;   --color-bg: #0c1222;
}
.game-breakout {
  --color-primary: #eab308;   --color-secondary: #fbbf24;
  --color-accent:  #f472b6;   --color-bg: #0f0f1e;
}
/* ...12 組，與 KawaiiPresets.ts 同步 */
```

---

## 3. 字體與間距 Token

### 3.1 字型

```
--font-family-heading: 'Nunito', 'Segoe UI', sans-serif;
--font-family-body:    'Nunito', 'Segoe UI', sans-serif;
--font-family-mono:    'Courier New', monospace;
```

### 3.2 字重

```
--font-weight-normal:   600    (Nunito SemiBold)
--font-weight-semibold: 700
--font-weight-bold:     800
```

### 3.3 字級階層

```
Token             值       Canvas 常數
──┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄
--font-size-xs     10px    FONT.sizes.xs
--font-size-sm     12px    FONT.sizes.sm
--font-size-base   14px    FONT.sizes.base
--font-size-lg     18px    FONT.sizes.lg
--font-size-xl     24px    FONT.sizes.xl
--font-size-2xl    32px    FONT.sizes.xxl
--font-size-3xl    44px    FONT.sizes.xxxl
```

### 3.4 間距

```
--space-1:  4px    --space-2:  8px    --space-3:  12px
--space-4:  16px   --space-5:  20px   --space-6:  24px
--space-8:  32px   --space-10: 40px   --space-12: 48px
--space-16: 64px
```

### 3.5 圓角（Kawaii 不對稱特色）

```
--radius-sm:   6px
--radius-base: 10px
--radius-lg:   14px
--radius-xl:   20px
--radius-full: 9999px
```

不對稱圓角應用範例（繼承自 `KawaiiDecorLayer` 模式）：

```css
.kawaii-card {
  border-radius: 28px 24px 30px 22px; /* 四個角故意不同 */
}
```

### 3.6 動畫 Token

```
--duration-fast:   150ms
--duration-base:   250ms
--duration-slow:   400ms
--duration-bounce: 600ms

--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1)
--ease-spring: cubic-bezier(0.22, 1, 0.36, 1)

--shadow-base:   0 2px 8px rgba(29,22,27,0.10)
--shadow-md:     0 4px 16px rgba(29,22,27,0.12)
--shadow-lg:     0 8px 24px rgba(29,22,27,0.14)
--shadow-float:  0 10px 0 rgba(29,22,27,0.08), 0 20px 26px rgba(29,22,27,0.10)
```

---

## 4. Core Component Redesign

### 4.1 改造原則

| 原則 | 說明 |
|------|------|
| **雙層邊框** | 外層實線 + 內層虛線（現有 decor-layer 模式） |
| **不對稱圓角** | 四個角數值不同，製造手繪感 |
| **浮舉陰影** | 使用 `--shadow-float` 讓元件像貼紙浮在紙上 |
| **彈跳互動** | hover: translateY(-2px) + `--ease-bounce`，active 回彈 |
| **柔軟漸層** | 背景採用微漸層而非純色 |

### 4.2 各元件規格

#### KawaiiButton（已存在，強化）

**新增**：
- click 波紋效果：`::after` pseudo-element radial gradient animation
- loading 狀態：spin animation + disabled
- disabled：灰化 + 透明度 0.5

**原有行為保留**：variant/size/outlined、hover 上移、active 回彈

#### KmgBadge

**改造**：
- 圓角改為不對稱（如 `12px 8px 14px 8px`）
- 加入 `--shadow-float`
- 數值變化時觸發 scale(1.2) → scale(1) bounce 動畫
- 使用 `--ease-bounce`

#### KmgCurrency

**改造**：
- 金幣圖示使用 `KawaiiIcon` 的 `coin` variant
- 數值增加時觸發彈跳 + 旋轉動畫（`rotate(-5deg) → rotate(0)`）
- 文字使用 `--font-size-base` + per-game `--color-accent` 色

#### KmgTabBar

**改造**：
- 選中標籤改為 pill 造型（`--radius-full`）
- 底部指示條改為滑動 + bounce 動畫
- 未選中標籤：`opacity: 0.5`
- 標籤之間使用 `--space-2` 間距

#### KmgSkeleton

**改造**：
- 改為柔和 pulse：`opacity 1 → 0.6 → 1` 搭配 `--duration-slow`
- 圓角使用 `--radius-base`
- 顏色使用 `--color-border-light`

#### KmgTooltip

**改造**：
- 氣泡造型：`--radius-lg` + `::before` 三角尾巴
- 出現動畫：`scale(0.9) → scale(1)` with `--ease-bounce`
- 背景使用 `--color-kawaii-paper` + `--shadow-md`

#### BaseCard / BaseModal

**BaseCard 改造**：
- 雙層邊框：外框 `border` + 內層 `box-shadow` inset 虛線
- 圓角不對稱
- hover：`translateY(-4px)` + `--shadow-lg`

**BaseModal 改造**：
- 背景遮罩：`rgba(29,22,27,0.5)` + `backdrop-filter: blur(4px)`
- Modal 本體：`scale(0.92) → scale(1)` + `--ease-bounce`
- 關閉按鈕使用 `KawaiiIcon` 的 close

#### InputAffordance

**改造**：
- 觸控提示圖示改為 Kawaii 風格手指
- 閃爍改為呼吸動畫：`scale(1) → scale(1.08)` + `opacity 0.7 → 1`
- 使用 `--ease-spring`

#### ProgressBar

**改造**：
- 全圓角 pill 造型（`--radius-full`）
- 進度條填滿顏色使用 per-game `--color-primary`
- 背景軌道使用 `--color-border-light`
- 值變化時使用 `--ease-bounce` 動畫

### 4.3 LobbyGameCard（大廳卡片）

```
┌─────────────────────────────────┐
│  ┌─────────┐  打磚塊             │
│  │ 縮圖區域 │  🕹️ 休閒   ⭐ 3200  │
│  │ (SVG)   │                    │
│  │         │    [遊玩]          │
│  └─────────┘                    │
└─────────────────────────────────┘
```

- **外框**：雙層邊框 + 不對稱圓角
- **縮圖區域**：圓角不對稱、hover `scale(1.03)`
- **遊戲圖示**：`KawaiiIcon` 對應遊戲類型
- **分類標籤**：pill 造型，顏色對應分類（action→pink、puzzle→lilac、casual→mint）
- **遊玩按鈕**：`KawaiiButton` primary variant
- **hover**：整個卡片 `translateY(-4px)` + `--shadow-float`
- **分類 hover 顏色對應**：

```ts
categoryColorMap: Record<string, string> = {
  action:   'var(--color-kawaii-pink)',
  puzzle:   'var(--color-kawaii-lilac)',
  strategy: 'var(--color-kawaii-sky)',
  casual:   'var(--color-kawaii-mint)',
  board:    'var(--color-kawaii-butter)',
}
```

---

## 5. Canvas 橋接層

### 5.1 KawaiiTheme.ts

位置：`src/engine/art/KawaiiTheme.ts`

#### GameTheme 介面

```ts
export interface GameTheme {
  palette: GamePalette       // 來自 KawaiiPresets（primary, secondary, accent, bg, ink...）
  font: {
    family: string           // 'Nunito, Segoe UI, sans-serif'
    sizes: { xs:10 sm:12 base:14 lg:18 xl:24 xxl:32 xxxl:44 }
    weights: { normal:600 semibold:700 bold:800 }
  }
  radii: { sm:6 base:10 lg:14 xl:20 full:9999 }
}
```

#### 匯出函數

```ts
export function getTheme(gameId: GameId): GameTheme
export function drawKawaiiPanel(ctx, x, y, w, h, opts): void
export function drawKawaiiProgress(ctx, x, y, w, h, ratio, opts): void
export function drawKawaiiButton(ctx, x, y, w, h, label, opts): void
export function drawKawaiiText(ctx, text, x, y, opts): void
export function drawKawaiiBadge(ctx, x, y, text, opts): void
```

### 5.2 drawKawaiiPanel

將 survivor 中的 `drawKawaiiPanel` 提升至此，供所有遊戲使用：

```ts
function drawKawaiiPanel(ctx, x, y, w, h, {
  fill = 'rgba(30,20,50,0.85)',
  stroke = 'rgba(255,255,255,0.1)',
  radius = 6,
  accent = '#ec4899',
  borderWidth = 1.5,
}) {
  // 1. 填滿背景（圓角矩形）
  // 2. 外框 stroke
  // 3. 左側 accent 裝飾條（可選）
}
```

### 5.3 取代硬編碼（逐步進行）

以 survivor 為例（子專案 C 逐步擴展到所有遊戲）：

```ts
// 改造前
drawKawaiiPanel(ctx, padding, padding, barWidth, barHeight, {
  fill: 'rgba(30,20,50,0.85)', accent: '#ec4899', radius: 6 * scale,
})

// 改造後
const theme = getTheme('survivor')
drawKawaiiPanel(ctx, padding, padding, barWidth, barHeight, {
  fill: theme.palette.bg + 'd9',       // 原有色 + alpha
  accent: theme.palette.accent,
  radius: theme.radii.sm * dpr,
})
```

---

## 6. 檔案結構

### 新增檔案

| 檔案 | 內容 |
|------|------|
| `src/styles/kawaii-tokens.css` | 完整 CSS Token 定義 |
| `src/engine/art/presets/TypographyPresets.ts` | JS 端字體 Token |
| `src/engine/art/KawaiiTheme.ts` | Canvas 橋接層 + 共用渲染函數 |

### 修改檔案

| 檔案 | 改動 |
|------|------|
| `src/engine/art/presets/KawaiiPresets.ts` | 擴充輸出 (radii, font) |
| `src/components/KawaiiButton.vue` | 波紋效果、loading 狀態 |
| `src/components/KmgBadge.vue` | 不對稱圓角、bounce 動畫 |
| `src/components/KmgCurrency.vue` | 數值 bounce 動畫 |
| `src/components/KmgTabBar.vue` | pill 造型、滑動指示條 |
| `src/components/KmgSkeleton.vue` | 柔和 pulse |
| `src/components/KmgTooltip.vue` | 氣泡造型、scale-in |
| `src/components/BaseCard.vue` | 雙層邊框 |
| `src/components/BaseModal.vue` | backdrop-filter、scale-in |
| `src/components/InputAffordance.vue` | 呼吸動畫 |
| `src/components/ProgressBar.vue` | pill 造型、bounce |
| `src/components/shell/LobbyGameCard.vue` | 雙層邊框、hover 微互動 |
| `src/games/survivor/index.ts` | KawaiiTheme 試點 |

---

## 7. 實作順序

```
Step 1: 建立 kawaii-tokens.css
Step 2: 建立 TypographyPresets.ts
Step 3: 擴充 KawaiiPresets.ts（輸出完整 GameTheme）
Step 4: 建立 KawaiiTheme.ts（Canvas 橋接層）
Step 5: 改造共用 UI 元件（依賴度由低到高）
Step 6: 改造 LobbyGameCard
Step 7: 改造 survivor（KawaiiTheme 試點驗證）
```
