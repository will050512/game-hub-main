# 更新日誌 (CHANGELOG)

本專案的所有重要變更皆記錄於此文件。

格式依循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/) 慣例。

---

## [未發布] - 2026-03-26

### 第一階段完成：核心架構建立

---

### 新增 (Added)

#### 型別系統擴充 — `src/types/index.ts`

新增 9 個介面：

- `ActiveBuff` — 描述玩家當前生效的增益狀態
- `ItemSlot` — 道具欄位資料結構
- `GameHudData` — 遊戲抬頭顯示器（HUD）所需的資料格式
- `PowerUpDef` — 強化道具定義，描述道具屬性與效果
- `CurrencyTransaction` — 貨幣交易紀錄，追蹤金幣流向
- `UpgradeEffect` — 單一升級效果的描述結構
- `PermanentUpgrade` — 永久升級項目的完整定義
- `PlayerProfile` — 玩家個人資料，包含統計與進度
- `ExtendedScoreRecord` — 擴充版分數紀錄，附帶額外元資料

同時於 `GameCallbacks` 介面新增 3 個可選回呼（向下相容）：

- `onHudUpdate` — HUD 資料更新時觸發
- `onItemCollected` — 玩家拾取道具時觸發
- `onCurrencyEarned` — 玩家獲得貨幣時觸發

---

#### 資料庫結構擴充 — `src/composables/useDatabase.ts`

新增 3 張資料表：

- `player_profile` — 儲存玩家個人資料與累計統計
- `upgrades` — 儲存各升級項目的當前等級
- `currency_log` — 記錄所有貨幣交易歷史

新增 8 個 `DbAdapter` 方法（SQLite 與 localStorage 雙適配器均已實作）：

- `getProfile` — 讀取玩家個人資料
- `updateProfile` — 更新玩家個人資料
- `addCoins` — 增加金幣餘額
- `spendCoins` — 扣除金幣餘額
- `getBalance` — 查詢當前金幣餘額
- `getUpgradeLevel` — 查詢指定升級項目的等級
- `setUpgradeLevel` — 設定指定升級項目的等級
- `getAllUpgrades` — 取得所有升級項目的等級列表

---

#### Pinia 狀態管理商店（共 3 個）

- **`src/stores/playerStore.ts`** — 管理玩家個人資料與升級追蹤；`getEffectiveStats()` 方法可計算永久升級加成後的實際屬性數值
- **`src/stores/currencyStore.ts`** — 管理貨幣餘額，內建 8 款遊戲的倍率對照表；提供 `earnFromGame`、`settlePending`、`purchase` 等操作
- **`src/stores/settingsStore.ts`** — 管理使用者設定，並透過 localStorage 持久化儲存

---

#### 永久升級資料 — `src/data/upgrades.ts`

定義 12 個升級項目，分為 4 大類別，每個項目均包含分級費用與對應效果：

- **offense（攻擊）** — 提升玩家的攻擊相關屬性
- **defense（防禦）** — 提升玩家的防禦相關屬性
- **utility（功能）** — 提升實用性或遊戲便利度
- **economy（經濟）** — 提升貨幣獲取效率

---

#### Canvas 動態尺寸調整 — `src/engine/GameEngine.ts`

- 在父容器上掛載 `ResizeObserver`，監聽容器尺寸變化
- 採用 250ms 防抖（debounce）避免頻繁觸發重繪
- 新增 `onResize()` 虛擬方法，供子類別覆寫以實作自定義調整邏輯
- 在 `stop()` 中正確清除 `ResizeObserver`，避免記憶體洩漏

---

#### Vue 元件庫 — `src/components/`

新增 6 個可重用 UI 元件：

- **`BaseButton.vue`** — 通用按鈕，支援 `variant`、`size`、`disabled`、`loading` 屬性
- **`BaseCard.vue`** — 通用卡片容器，支援 `variant`、`clickable` 屬性與 `header`、`default`、`footer` 插槽
- **`BaseModal.vue`** — 通用對話框，支援 `open`、`title`、`closable`、`size` 屬性，含背景遮罩、ESC 鍵關閉與過場動畫
- **`ProgressBar.vue`** — 進度條，支援 `value`、`max`、`color`、`animated` 屬性
- **`GameCard.vue`** — 遊戲大廳網格用的遊戲縮圖卡片
- **`ShopItemCard.vue`** — 商店升級購買卡片，依稀有度套用對應樣式

---

### 變更 (Changed)

- **`src/types/index.ts`** — `GameCallbacks` 介面新增 3 個可選回呼屬性（`onHudUpdate`、`onItemCollected`、`onCurrencyEarned`），維持完整向下相容性，現有實作無需修改
- **`src/engine/GameEngine.ts`** — 整合 `ResizeObserver`，支援裝置像素比（DPR）感知的畫布尺寸計算

---

### 驗證狀態 (Verification)

| 檢查項目 | 結果 |
|---|---|
| `npx vue-tsc --noEmit` 型別檢查 | ✅ 零錯誤通過 |

---

---

### 第二階段完成：核心系統

---

### 新增 (Added)

#### PowerUpSystem 抽象引擎 — `src/engine/PowerUpSystem.ts`

- 提供遊戲內道具的生成（`rollDrop`）、拾取（`activate`）、效果套用（`applyEffect`/`removeEffect`）、計時更新（`update`）、清除（`clearAll`）等核心流程
- 子類別僅需實作 `applyEffect()` 與 `removeEffect()` 即可完成道具邏輯
- 支援加權隨機道具生成與多道具同時生效
- 注意：Tier A/B 遊戲最終選擇了 inline 道具系統（自行管理 Canvas HUD），未繼承此類

#### 貨幣流水線整合 — `src/views/GamePlayView.vue`

- `onGameOver` 回呼改為 `async`，支援非同步金幣結算
- 遊戲結束時自動呼叫 `currencyStore.earnFromGame(gameId, score)`
- 結算金幣數傳入 GameResultView 路由參數

#### HUD 重構 — `src/components/HudBar.vue` + `src/components/BuffIcon.vue`

- **HudBar.vue** — 頂部遊戲資訊顯示列，顯示分數、生命值、等級、金幣等
- **BuffIcon.vue** — 增益狀態圖示元件，顯示 buff 圖示與剩餘時間進度條
- 透過 `onHudUpdate` 回呼即時更新 HUD 資料

#### PWA 設定 — `vite.config.ts` + `index.html` + `public/icons/`

- 安裝並配置 `vite-plugin-pwa`，啟用 `generateSW` 模式
- Manifest 包含應用名稱、圖示（SVG）、主題色、顯示模式
- Service Worker 自動預快取所有靜態資源
- `index.html` 加入 PWA 必要 meta 標籤（theme-color、apple-mobile-web-app-capable 等）

#### 永久升級商店 — `src/views/ShopView.vue` + `src/router/index.ts`

- 完整商店頁面，展示 12 個永久升級項目（分 4 類：攻擊/防禦/功能/經濟）
- 使用 `ShopItemCard.vue` 元件呈現各升級項目
- 購買確認 Modal（使用 `BaseModal.vue`），顯示升級詳情、費用與效果
- 購買成功/失敗回饋動畫
- 路由 `/shop` 已註冊

### 變更 (Changed)

- **`src/views/GamePlayView.vue`** — `onGameOver` 改為 async，整合貨幣結算流程；新增 HudBar 與 BuffIcon 元件整合
- **`vite.config.ts`** — 新增 VitePWA 插件配置

### 驗證狀態 (Verification)

| 檢查項目 | 結果 |
|---|---|
| `npx vue-tsc --noEmit` 型別檢查 | ✅ 零錯誤通過 |
| `npm run build` 生產建置 | ✅ 34 precache entries, 590.61 KiB |

---

### 第三階段完成：各遊戲道具系統

---

### 新增 (Added)

#### Tier A 遊戲（完整道具系統）

##### 暗夜倖存者 (Survivor) 擴展 — `src/games/survivor/`

- **4 種新敵人類型**：蝙蝠（快速移動）、史萊姆（分裂）、骷髏弓箭手（遠程攻擊）、Boss（每 5 分鐘生成）
- **敵人投射物系統**：骷髏弓箭手與 Boss 可發射子彈攻擊玩家
- **迴旋鏢武器**：發射後自動返回，可合成毒霧
- **毒霧合成武器**：在原地釋放持續傷害區域
- **3 個新被動技能**：荊棘（反彈傷害）、經驗磁鐵（加速吸引經驗寶石）、幸運符（提升稀有選項機率）

##### 打磚塊 (Breakout) 道具系統 — `src/games/breakout/`

- **新增 `data.ts`**：定義 `BreakoutPowerUpDef` 介面與 8 種道具
- **8 種道具**：加寬擋板、多球、黏性擋板、雷射、減速球、額外生命、縮小擋板、加速球
- **道具掉落**：12% 機率從磚塊掉落
- **互斥效果系統**：加寬↔縮小、減速↔加速自動互斥
- **多球系統**：單球轉為 `balls: Ball[]` 陣列
- **雷射系統**：黏性擋板與發射-釋放機制
- **圓弧進度條**：顯示計時道具的剩餘時間

##### 小蜜蜂 (Invaders) 道具系統 — `src/games/invaders/`

- **新增 `data.ts`**：定義 `InvadersPowerUpDef` 介面與 6 種道具
- **6 種道具**：快速射擊、三連射、護盾、炸彈（清除所有敵方子彈）、追蹤飛彈、修復（回復生命）
- **道具掉落**：15% 機率從擊殺掉落
- **護盾系統**：吸收 1 次傷害後消失
- **追蹤飛彈**：自動尋找最近敵人，可重新鎖定
- **效果跨波次持續**：波次切換時道具效果不中斷

#### Tier B 遊戲（中等道具系統）

##### 接水果 (Fruit-Catch) 道具系統 — `src/games/fruit-catch/`

- **新增 `data.ts`**：定義 `FruitCatchItemDef` 介面與 4 種道具
- **4 種道具**：大籃子（加寬）、磁鐵（吸引水果）、雙倍分數、護盾（擋炸彈）
- **金色道具掉落**：定時生成金色六角星道具
- **加權隨機**：依道具權重抽取
- **計時效果系統**：效果到期自動還原
- **磁鐵吸附**：非炸彈物品自動被吸引向籃子
- **護盾閃光**：護盾生效時籃子有外發光效果
- **效果指示器**：畫面上方顯示當前生效道具圖示與剩餘時間條

##### 貪吃蛇 (Snake) 特殊食物 — `src/games/snake/`

- **新增 `data.ts`**：定義 `SpecialFoodDef` 介面與 4 種特殊食物
- **4 種特殊食物**：減速果（降低移動速度）、穿牆果（可穿越邊界環繞）、縮小果（蛇身縮短）、黃金蘋果（高分獎勵）
- **20% 生成機率**：吃到普通食物後有機率出現
- **單 Buff 限制**：同時只能有 1 個效果生效
- **視覺回饋**：特殊食物彩色發光脈衝效果，蛇頭依 Buff 類型染色
- **10 秒存在期限**：特殊食物未收集會自動消失
- **Buff 狀態條**：顯示圖示、名稱、剩餘時間、進度條

#### Tier C 遊戲（極簡道具）

##### 俄羅斯方塊 (Tetris) 里程碑道具 — `src/games/tetris/index.ts`

- **炸彈行**：每清除 20 行累計獲得 1 次（最多 3 次），按 B 鍵或點擊側欄按鈕啟用，瞬間清除最底部一行
- **預覽+**：每清除 15 行累計獲得 1 次（最多 2 次），按 V 鍵或點擊側欄按鈕啟用，60 秒內顯示下 3 個方塊預覽
- **3 格深度預覽佇列**：取代原本單一 nextPiece，內部始終維護 3 個預覽方塊
- **側欄道具 HUD**：顯示道具圖示與次數（💣 ×N  👁 ×N）
- **觸控支援**：側欄道具按鈕可觸控點擊

##### 2048 消耗輔助道具 — `src/games/game2048/index.ts`

- **撤回**：每局 2 次，還原前一步的棋盤狀態與分數（深拷貝保存）
- **移除方塊**：每局 1 次，進入選取模式，點擊非空格子將其移除
- **選取模式視覺指示**：啟用時棋盤外框脈衝發光
- **棋盤下方道具按鈕**：「撤回 ×N」「移除 ×N」，次數用完自動灰化
- **防連續撤回**：撤回後清除快照，不可連續撤回

#### 無道具遊戲

##### Flappy Bird — `src/games/flappy/index.ts`

- **無任何道具系統**，僅透過貨幣流水線賺取金幣
- 驗證確認：`onGameOver` 與 `onStatsUpdate` 正確報告 `PlayerStats`，無需修改

### 驗證狀態 (Verification)

| 檢查項目 | 結果 |
|---|---|
| `npx vue-tsc --noEmit` 型別檢查 | ✅ 零錯誤通過 |
| `npm run build` 生產建置 | ✅ 34 precache entries, 626.70 KiB |

**建置大小演進**：590.61 KiB (Phase 2) → 609.00 KiB (Batch 1) → 618.79 KiB (Batch 2) → 626.70 KiB (Batch 3)

---

---

### 第四階段完成：UI/UX 全面翻新

---

### 新增 (Added)

#### 大廳 Grid 重新設計 — `src/views/LobbyView.vue`

- **頂部導航列**：sticky + `backdrop-filter: blur(16px)`，左側「🎮 Game Hub」漸層標題，右側金幣餘額（🪙 即時顯示）與商店按鈕（🛒 連結至 `/shop`）
- **遊戲卡片 Grid**：使用 `GameCard.vue` 元件，響應式欄數（手機 2 欄 / 平板 3 欄 / 桌面 4 欄）
- **交錯入場動畫**：每張卡片 `0.06s` 延遲的 `fadeUp` 動畫
- **高分載入**：`onMounted` 從資料庫載入各遊戲最高分顯示於卡片

#### GameInfoView 改版 — `src/views/GameInfoView.vue`

- **📊 我的紀錄區塊**：顯示最高分與遊玩次數，2 格統計卡片帶 hover 效果
- **🏆 排行榜（前 5 名）**：使用 `getTopScores()`，顯示排名獎牌（🥇🥈🥉）、玩家名、分數、⭐ 永久升級總等級
- **響應式佈局**：手機單欄堆疊，640px+ 雙欄（左=橫幅+統計+排行榜，右=說明+操作+玩法）
- **區塊入場動畫**：各區塊依序 fadeIn from below

#### GameResultView 改版 — `src/views/GameResultView.vue`

- **分數滾動動畫**：`requestAnimationFrame` + `easeOutExpo` 曲線，1.5 秒從 0 滾動至最終分數
- **金幣獎勵動畫**：分數計算完成 200ms 後，「🪙 +N 金幣」以 scale + fade 動畫出現
- **新紀錄脈衝發光**：`glowBadge` 動畫（脈衝光暈 + 縮放）
- **3 個動作按鈕**：「🔄 再來一局」（主色）、「🛒 前往商店」（金色漸層）、「🏠 回大廳」（次要）
- **排行榜改良**：交替行背景、當前分數高亮光暈

#### 全域 Responsive 佈局 — `src/views/ShopView.vue` + `src/views/GamePlayView.vue`

##### ShopView 響應式
- **手機**：2 欄 Grid，橫向滾動分類標籤
- **平板（640px+）**：3 欄 Grid，分類標籤自動換行
- **桌面（1024px+）**：4 欄 Grid + 右側固定面板（金幣餘額、升級總等級、可購買數量），`max-width: 1200px` 置中

##### GamePlayView 響應式
- **手機**：全螢幕 Canvas，HUD overlay 覆蓋在上方
- **平板（640px+）**：Flex 佈局，Canvas 填滿剩餘空間，HUD 變為 180px 側邊面板（使用 `:deep()` 覆寫 HudBar 定位）
- **桌面（1024px+）**：`max-width: 1200px` 置中，側邊 HUD 加寬至 220px，升級卡片 hover 效果

### 變更 (Changed)

- **`src/views/LobbyView.vue`** — 完全重寫：列表式佈局改為 Grid 卡片佈局，新增頂部導航列與金幣顯示
- **`src/views/GameInfoView.vue`** — 新增我的紀錄與排行榜區塊，響應式雙欄佈局
- **`src/views/GameResultView.vue`** — 新增分數滾動動畫、金幣獎勵動畫、商店按鈕
- **`src/views/ShopView.vue`** — 新增桌面側邊面板，響應式 Grid 欄數調整
- **`src/views/GamePlayView.vue`** — 平板/桌面時 HUD 從 overlay 改為側邊面板

### 驗證狀態 (Verification)

| 檢查項目 | 結果 |
|---|---|
| `npx vue-tsc --noEmit` 型別檢查 | ✅ 零錯誤通過 |
| `npm run build` 生產建置 | ✅ 34 precache entries, 639.88 KiB |

**建置大小演進**：626.70 KiB (Phase 3) → 639.88 KiB (Phase 4)

---

### 下一步 (Next Steps)

**第五階段目標：內容擴展與數值平衡**

- **各遊戲內容擴展** — 新磚塊類型、新敵人、新地圖變體、新模式
- **數值平衡** — 校準各遊戲金幣/分鐘收益至 300-500 範圍
- **動畫與轉場打磨** — Vue Transition 頁面切換、金幣獲得動畫、升級成功動畫

---

*此日誌由開發團隊維護，記錄 game-hub 專題各階段的功能里程碑。*
