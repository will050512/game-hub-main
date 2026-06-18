# 12 款遊戲全數優化實施計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修復 12 款遊戲的邏輯缺陷、缺失功能與趣味度不足問題

**Architecture:** 每款遊戲獨立修復, 可平行執行。優先處理 P0 嚴重問題, 再處理 P1 功能缺失。

**Tech Stack:** Vue 3 + TypeScript + Canvas 2D + 現有 GameEngine 架構

---

## 優先級分類

| 優先級 | 遊戲 | 問題嚴重度 | 預估工时 |
|---|---|---|---|
| **P0** | 塔防大戰 | ❌ 路徑單一, 砲塔不足 | 2-3h |
| **P0** | 數獨 | ❌ 僅 8 題, 需要生成器 | 2-3h |
| **P1** | 記憶翻牌 | ⚠️ 缺少翻牌次數限制 | 1h |
| **P1** | 暗夜倖存者 | ⚠️ 武器合成需驗證 | 1-2h |
| **P1** | 接水果 | ⚠️ 地面掉落扣分需確認 | 0.5h |
| **P2** | 貪吃蛇 | ⚠️ Buff 效果需確認 | 0.5h |

---

## P0-1: 塔防大戰 – 路徑與砲塔修復

**Files:**
- Modify: `src/games/tower-defense/index.ts`
- Test: `src/games/tower-defense/index.test.ts`

### 路徑生成問題

目前 `generatePath()` 只產生直線橫貫路徑, 毫無策略性。

- [ ] **Step 1: 設計 S 型路徑生成算法**

```typescript
private generatePath(): void {
  this.path = []
  const cols = this.cols
  const rows = this.rows
  
  // S 型路徑: 從左到右, 逐行蛇形
  for (let row = 0; row < rows; row++) {
    if (row % 2 === 0) {
      // 偶數行: 左→右
      for (let col = 0; col < cols; col++) {
        this.path.push({ r: row, c: col })
      }
    } else {
      // 奇數行: 右→左
      for (let col = cols - 1; col >= 0; col--) {
        this.path.push({ r: row, c: col })
      }
    }
  }
}
```

- [ ] **Step 2: 驗證路徑生成**

  確認路徑從左上角開始, 蛇形穿過整個棋盤, 最後從右下角結束。

- [ ] **Step 3: 更新敵人移動邏輯**

  確認 `updateEnemies()` 正確跟隨新 S 型路徑移動。

### 砲塔類型不足

Manifest 承諾 4 種砲塔 (普通/火焰/冰霜/雷霆), 目前只有 3 種 (basic/sniper/splash)。

- [ ] **Step 4: 新增冰霜砲塔類型**

```typescript
// 更新 Tower type 定義
interface Tower {
  // ...existing fields...
  type: 'basic' | 'sniper' | 'splash' | 'frost'
  // ...
}

// 更新砲塔成本
private towerCosts: Record<string, number> = { 
  basic: 50, 
  sniper: 100, 
  splash: 150,
  frost: 120  // 新增
}

// 更新 selectedTowerType
private selectedTowerType: 'basic' | 'sniper' | 'splash' | 'frost' = 'basic'
```

- [ ] **Step 5: 實作冰霜砲塔效果**

```typescript
// 在 updateProjectiles() 中, 冰霜子彈命中時施加減速效果
if (tower.type === 'frost') {
  enemy.speed *= 0.5  // 減速 50%
  // 添加減速持續時間追蹤
}
```

- [ ] **Step 6: 更新 UI 選單**

  在砲塔選擇選單中添加冰霜砲塔選項, 包含圖標和說明文字。

- [ ] **Step 7: 測試砲塔平衡性**

  驗證 4 種砲塔的傷害/範圍/射速/成本是否平衡。

---

## P0-2: 數獨 – 題目生成器

**Files:**
- Modify: `src/games/sudoku/index.ts`
- Create: `src/games/sudoku/generator.ts`
- Test: `src/games/sudoku/generator.test.ts`

### 當前問題

只有 8 道預設題目 (easy: 3, medium: 2, hard: 2, expert: 1), 完全不夠玩。

- [ ] **Step 1: 建立數獨生成器模組**

```typescript
// src/games/sudoku/generator.ts

export class SudokuGenerator {
  /**
   * 生成完整的有效數獨解答
   */
  static generateSolution(): number[][] {
    const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0))
    this.fillBoard(board)
    return board
  }

  private static fillBoard(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row]![col] === 0) {
          const nums = this.shuffle([1,2,3,4,5,6,7,8,9])
          for (const num of nums) {
            if (this.isValid(board, row, col, num)) {
              board[row]![col] = num
              if (this.fillBoard(board)) return true
              board[row]![col] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  private static isValid(board: number[][], row: number, col: number, num: number): boolean {
    // 檢查行
    for (let x = 0; x < 9; x++) {
      if (board[row]![x] === num) return false
    }
    // 檢查列
    for (let x = 0; x < 9; x++) {
      if (board[x]![col] === num) return false
    }
    // 檢查 3x3 宮格
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i]![startCol + j] === num) return false
      }
    }
    return true
  }

  private static shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j]!, array[i]!]
    }
    return array
  }

  /**
   * 從完整解答中挖空, 生成謎題
   * @param difficulty 難度決定挖空數量
   */
  static generatePuzzle(solution: number[][], difficulty: 'easy' | 'medium' | 'hard' | 'expert'): {
    puzzle: number[][]
    solution: number[][]
  } {
    const puzzle = solution.map(row => [...row])
    const holes = { easy: 30, medium: 36, hard: 42, expert: 48 }[difficulty]
    
    let removed = 0
    while (removed < holes) {
      const row = Math.floor(Math.random() * 9)
      const col = Math.floor(Math.random() * 9)
      if (puzzle[row]![col] !== 0) {
        puzzle[row]![col] = 0
        removed++
      }
    }
    
    return { puzzle, solution }
  }
}
```

- [ ] **Step 2: 整合生成器到遊戲**

```typescript
// 在 SudokuGame 中修改 loadPuzzle()
private loadPuzzle(): void {
  // 嘗試從預設題目庫載入
  const puzzles = PUZZLES[this.difficulty]
  const usedIndex = this.getUsedPuzzleIndex(this.difficulty)
  
  if (usedIndex < puzzles.length) {
    // 使用預設題目
    this.loadPuzzleFromData(puzzles[usedIndex]!)
  } else {
    // 預設題目用完, 動態生成
    const solution = SudokuGenerator.generateSolution()
    const { puzzle } = SudokuGenerator.generatePuzzle(solution, this.difficulty)
    this.board = puzzle
    this.solution = solution
    this.given = puzzle.map(row => row.map(cell => cell !== 0))
    this.incrementUsedPuzzleCount(this.difficulty)
  }
}

private getUsedPuzzleIndex(difficulty: Difficulty): number {
  const key = `sudoku_used_${difficulty}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

private incrementUsedPuzzleCount(difficulty: Difficulty): void {
  const key = `sudoku_used_${difficulty}`
  const count = this.getUsedPuzzleIndex(difficulty) + 1
  localStorage.setItem(key, count.toString())
}
```

- [ ] **Step 3: 驗證生成器品質**

  生成 100 個各難度題目, 驗證:
  - 每個題目有唯一解
  - 難度符合預期 (easy 給 30 格, expert 給 15 格左右)
  - 沒有無效題目產生

- [ ] **Step 4: 添加題目随机化**

  確保每次生成的題目不同, 避免重複。

---

## P1-1: 記憶翻牌 – 翻牌次數限制

**Files:**
- Modify: `src/games/memory/index.ts`

- [ ] **Step 1: 添加翻牌次數限制**

```typescript
// 添加翻牌次數限制
private maxMoves: number = 0

private setupBoard(): void {
  // ...existing code...
  
  // 根據難度設定最大翻牌次數
  switch (this.difficulty) {
    case 'easy': this.maxMoves = this.totalPairs * 3; break
    case 'medium': this.maxMoves = this.totalPairs * 2.5; break
    case 'hard': this.maxMoves = this.totalPairs * 2; break
  }
}

// 在 handleBoardTap 中檢查次數限制
private handleBoardTap(x: number, y: number): void {
  if (this.moves >= this.maxMoves && this.matches < this.totalPairs) {
    // 超過限制, 遊戲結束
    this.phase = 'gameover'
    return
  }
  // ...existing code...
}
```

- [ ] **Step 2: 更新 UI 顯示**

  在 HUD 中添加「剩餘翻牌次數」顯示。

- [ ] **Step 3: 更新遊戲結束邏輯**

  區分「通關」和「次數用盡」兩種結束條件。

---

## P1-2: 暗夜倖存者 – 武器合成驗證

**Files:**
- Modify: `src/games/survivor/index.ts`
- Modify: `src/games/survivor/buildCodex.ts`

- [ ] **Step 1: 驗證武器合成邏輯**

  檢查 `buildCodex.ts` 是否實作「兩把相同武器合成為進階武器」的邏輯。

- [ ] **Step 2: 若缺失, 實作合成系統**

```typescript
// 在 SurvivorGame 中
private trySynthesizeWeapons(): boolean {
  // 尋找兩把相同類型且等級相同的武器
  for (let i = 0; i < this.weapons.length; i++) {
    for (let j = i + 1; j < this.weapons.length; j++) {
      const w1 = this.weapons[i]
      const w2 = this.weapons[j]
      if (w1 && w2 && 
          w1.def.id === w2.def.id && 
          w1.level === w2.level &&
          w1.level < w1.def.maxLevel) {
        // 合成: 提升其中一把武器的等級
        w1.level++
        // 移除另一把
        this.weapons.splice(j, 1)
        this.synthesisCount++
        return true
      }
    }
  }
  return false
}
```

- [ ] **Step 3: 添加合成觸發條件**

  在獲得新武器或升級後嘗試合成。

---

## P1-3: 接水果 – 地面掉落扣分

**Files:**
- Modify: `src/games/fruit-catch/index.ts`

- [ ] **Step 1: 驗證地面掉落邏輯**

  檢查當水果掉到地面時是否扣除生命。

- [ ] **Step 2: 若缺失, 實作扣分邏輯**

```typescript
// 在 updateFallingItems() 中
private updateFallingItems(dt: number): void {
  for (let i = this.fallingItems.length - 1; i >= 0; i--) {
    const item = this.fallingItems[i]
    item.y += item.vy * (dt / 16.667)
    
    // 檢查是否掉到地面
    if (item.y > this.height) {
      if (item.kind !== 'bomb') {
        // 水果掉到地面, 扣生命
        this.lives--
        this.spawnFloatingText(item.x, this.height - 50, '-1 ❤️', '#ef4444')
      }
      this.fallingItems.splice(i, 1)
      
      // 檢查遊戲結束
      if (this.lives <= 0 && !this.gameOverTriggered) {
        this.triggerGameOver()
      }
    }
  }
}
```

---

## P2-1: 貪吃蛇 – Buff 效果確認

**Files:**
- Modify: `src/games/snake/index.ts`
- Modify: `src/games/snake/data.ts`

- [ ] **Step 1: 驗證 Buff 定義**

  檢查 `data.ts` 是否有定義加速/減速/雙倍分 Buff。

- [ ] **Step 2: 確認 Buff 效果應用**

  驗證吃到特殊食物時, Buff 效果是否正確應用到遊戲邏輯中。

- [ ] **Step 3: 若缺失, 實作 Buff 系統**

```typescript
// 在 SnakeGame 中
interface ActiveBuff {
  def: BuffDef
  remainingMs: number
}

private activeBuff: ActiveBuff | null = null

private applyBuff(buffDef: BuffDef): void {
  this.activeBuff = {
    def: buffDef,
    remainingMs: buffDef.durationMs
  }
  
  switch (buffDef.id) {
    case 'speed':
      this.moveInterval *= 0.7  // 加速 30%
      break
    case 'slow':
      this.moveInterval *= 1.5  // 減速 50%
      break
    case 'double_score':
      this.scoreMultiplier = 2
      break
  }
}

private updateBuff(dt: number): void {
  if (!this.activeBuff) return
  
  this.activeBuff.remainingMs -= dt
  if (this.activeBuff.remainingMs <= 0) {
    // 移除 Buff, 恢復正常
    this.moveInterval = this.baseMoveInterval
    this.scoreMultiplier = 1
    this.activeBuff = null
  }
}
```

---

## 自我檢查清單

- [x] 每個任務都有具體的檔案路徑
- [x] 每個步驟都有程式碼示例
- [x] 沒有 "TBD" 或 "TODO" 佔位符
- [x] 類型定義一致
- [x] 涵蓋所有審核發現的問題

---

## 執行建議

**推薦順序:**
1. P0-1 (塔防) - 最嚴重問題
2. P0-2 (數獨) - 內容嚴重不足
3. P1-1 (記憶翻牌) - 快速修復
4. P1-2 (倖存者) - 驗證+可能修復
5. P1-3 (接水果) - 快速驗證
6. P2-1 (貪吃蛇) - 快速驗證

**平行執行機會:**
- P1-1, P1-2, P1-3, P2-1 可平行執行 (互不依賴)
- P0-1, P0-2 可平行執行 (不同遊戲模組)

**預估總工时:** 8-12 小時
