# 🎮 Game Hub - 遊戲中心

<div align="center">

![Game Hub Banner](https://raw.githubusercontent.com/will050512/game-hub-main/main/public/images/fallback-thumb.png)

**12 款遊戲 · PWA 離線遊玩 · 跨平台支援 · 成就系統 · 響應式卡片排版**

[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646cff?logo=vite)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-6366f1?logo=chrome)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.6-111827?logo=capacitor)](https://capacitorjs.com/)

🌐 **即時遊玩**: https://will050512.github.io/game-hub-main/

</div>

---

## 📱 即時體驗

### Web 瀏覽器 (推薦)
直接開啟 **[https://will050512.github.io/game-hub-main/](https://will050512.github.io/game-hub-main/)**，電腦手機都能玩！

### PWA 安裝
1. 用 Chrome / Safari 開啟上述網址
2. 點擊網址列的 **➕** 或 **安裝** 按鈕
3. 遊戲會像原生 App 一樣安裝到主畫面
4. **離線也能玩** - 所有資源都會快取

---

## 🎯 功能特色

### 🎮 12 款遊戲
| 遊戲 | 分類 | 特色 |
|------|------|------|
| 🧟 暗夜倖存者 | 動作 | Roguelike 生存、武器合成、Boss 戰 |
| 🧱 打磚塊 | 休閒 | 經典打磚塊、道具系統 |
| 🟦 俄羅斯方塊 | 益智 | 經典方塊、炸彈行道具 |
| 🐍 貪吃蛇 | 休閒 | 特殊食物 Buff 系統 |
| 🔢 2048 | 益智 | 數字合併、滑動操作 |
| 🐦 Flappy Bird | 休閒 | 管道穿越、重力飛行 |
| 👾 小蜜蜂 | 動作 | 波次射擊、敵機編隊 |
| 🍎 接水果 | 休閒 | 水果配對、彈跳效果 |
| 🏰 塔防大戰 | 策略 | 砲塔放置、波次防禦 |
| ❌ 井字棋 | 棋類 | AI 對戰、三種難度 |
| 🃏 記憶翻牌 | 益智 | 配對記憶、連擊系統 |
| 🔢 數獨 | 益智 | 四種難度、提示系統 |

### ✨ 視覺效果
- **粒子系統** - 敵人死亡、得分、升級時的華麗特效
- **螢幕震動** - 重要事件時的觸覺回饋
- **COMBO 連擊** - 短時間連續操作的連擊文字
- **浮動文字** - 得分、等級提升的動態數字
- **Kenney 素材** - 17 個專業遊戲素材包

### 🏆 玩家系統
- **成就系統** - 20+ 成就，自動解鎖通知
- **每日任務** - 每日 3 個隨機任務
- **玩家等級** - 10 個等級，頭銜系統
- **金幣商店** - 解鎖皮膚與道具

### 📱 跨平台
- ✅ **Web** - 任何瀏覽器都能玩
- ✅ **PWA** - 離線遊玩，安裝到主畫面
- ✅ **iOS** - 透過 Capacitor 打包為原生 App
- ✅ **Android** - 透過 Capacitor 打包為原生 App
- ✅ **觸控操作** - 虛擬搖桿、虛擬按鈕

---

## 🚀 快速開始

```bash
# 克隆專案
git clone https://github.com/will050512/game-hub-main.git
cd game-hub-main

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 生產環境建構
npm run build

# 預覽生產版本
npm run preview
```

---

## 📁 專案結構

```
game-hub-main/
├── public/
│   ├── assets/              # Kenney 遊戲素材
│   │   ├── sprites/         # 貼圖資源 (17 個素材包)
│   │   ├── audio/           # 音效資源 (7 個音效包)
│   │   └── fonts/           # 遊戲字體
│   └── icons/               # PWA 圖標
├── src/
│   ├── engine/              # 遊戲引擎核心
│   │   ├── sprites/         # SpriteLoader, SpriteRenderer
│   │   ├── audio/           # SoundManager, SoundPresets
│   │   └── GameEngine.ts    # 核心遊戲迴圈
│   ├── games/               # 12 款遊戲實作
│   │   ├── survivor/        # 暗夜倖存者
│   │   ├── breakout/        # 打磚塊
│   │   ├── tetris/          # 俄羅斯方塊
│   │   ├── snake/           # 貪吃蛇
│   │   ├── game2048/        # 2048
│   │   ├── flappy/          # Flappy Bird
│   │   ├── invaders/        # 小蜜蜂
│   │   ├── fruit-catch/     # 接水果
│   │   ├── tower-defense/   # 塔防大戰
│   │   ├── tic-tac-toe/     # 井字棋
│   │   ├── memory/          # 記憶翻牌
│   │   └── sudoku/          # 數獨
│   ├── views/               # Vue 頁面元件
│   ├── components/          # 共用元件
│   │   ├── VirtualJoystick.vue  # 觸控搖桿
│   │   ├── VirtualButtons.vue   # 觸控按鈕
│   │   ├── AmbientParticles.vue # 背景粒子
│   │   └── Transitions/        # 頁面過場動畫
│   ├── stores/              # Pinia 狀態管理
│   ├── composables/         # Vue 組合式函數
│   ├── data/                # 遊戲資料、素材清單
│   ├── pwa/                 # PWA 更新管理
│   └── types/               # TypeScript 型別定義
├── scripts/                 # 建構與工具腳本
└── tests/                   # 測試套件
```

---

## 🛠️ 技術棧

| 類別 | 技術 |
|------|------|
| **前端框架** | Vue 3 + TypeScript + Vite 7 |
| **路由** | Vue Router 5 |
| **狀態管理** | Pinia 3 |
| **遊戲引擎** | 自製 Canvas 2D Engine |
| **素材系統** | SpriteLoader + SpriteRenderer |
| **音效系統** | SoundManager (Web Audio API) |
| **PWA** | vite-plugin-pwa + Workbox |
| **跨平台** | Capacitor 7 (iOS/Android) |
| **資料庫** | jeep-sqlite (SQLite) |
| **測試** | Vitest + Playwright |
| **樣式** | Tailwind CSS |

---

## 📱 多平台部署

### Web (GitHub Pages)
已自動部署至 `https://will050512.github.io/game-hub-main/`

### iOS
```bash
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

### Android
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

### Docker
```bash
docker compose up -d --build
# 開啟 http://localhost:8080/
```

---

## 🧪 測試

```bash
# 執行所有測試
npm test

# 執行 E2E 測試
npm run test:e2e

# 執行冒煙測試
npm run test:e2e:smoke

# 完整 CI 流程
npm run ci
```

---

## 🔄 近期更新

### v1.1.1 (2026-06-11)
- **UI 字體放大** - CSS 基礎字體從 12px 提升至 16px，Canvas HUD 從 10-12px 提升至 14-16px，新手教學字體同步加大，全面提升可讀性

### v1.1.0 (2026-06-11)
- **響應式卡片排版** - 桌面端遊戲卡片改為多欄網格布局（4欄→3欄→2欄→1欄響應式）
- **遊戲縮圖優化** - SVG 縮圖壓縮 60-84%，總大小從 170KB 降至 115KB
  - 接水果：44.6KB → 7.1KB（壓縮 84%）
  - 數獨：32.7KB → 5.6KB（壓縮 83%）
  - 暗夜倖存者：34.4KB → 17.0KB（壓縮 51%）
- **新手教學暫停** - 遊戲在新手教學期間自動暫停，教學結束後才開始
- **遊戲圖示統一** - 接水果使用籃子圖示、記憶翻牌使用卡牌圖示，一致化所有遊戲圖示

---

## 📊 專案統計

- 🎮 **12** 款完整遊戲
- 🎨 **17** 個 Kenney 素材包
- 🔊 **7** 個 Kenney 音效包
- 📦 **28** 個新增模組
- 💻 **3,500+** 行原始碼
- 🧪 **20+** 單元測試
- 🏆 **20+** 成就

---

## 📜 素材授權

遊戲素材來自 [Kenney.nl](https://kenney.nl/assets)，採用 **CC0 1.0 Universal** 授權。

---

## 📄 授權

MIT License
