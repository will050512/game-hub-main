import type { GameId } from '@/types'
import type { KawaiiIconId } from '@/data/iconManifest'

export type TouchPatternKind =
  | 'joystick-action'
  | 'horizontal-action'
  | 'directional-swipe'
  | 'tap-timing'
  | 'drag-horizontal'
  | 'tap-placement'
  | 'tap-cell'
  | 'tap-card'
  | 'number-pad'

export interface GameTouchPattern {
  kind: TouchPatternKind
  primary: string
  hints: string[]
  showActionButton: boolean
}

export interface GameOptimizationProfile {
  gameId: GameId
  thumbnailFocus: string
  controlChips: string[]
  playabilityChecks: string[]
  deepPolish: string[]
  touchPattern: GameTouchPattern
  featuredIcon: KawaiiIconId
}

export const gameOptimizationProfiles: Record<GameId, GameOptimizationProfile> = {
  survivor: {
    gameId: 'survivor',
    thumbnailFocus: '突出角色被敵群包圍、自動攻擊與經驗寶石，讓玩家一眼理解生存割草玩法。',
    controlChips: ['虛擬搖桿移動', '自動攻擊', '升級點選', '拾取經驗'],
    playabilityChecks: ['前 60 秒敵群密度要可讀', '升級選項不能遮住危險區', '敵人速度成長需保留逃生空間'],
    deepPolish: ['第一波敵人節奏偏教學，不立即壓迫玩家', 'Boss 與菁英敵需要更明顯血條和出場提示'],
    touchPattern: {
      kind: 'joystick-action',
      primary: '拖曳左半邊移動，升級時點選卡片',
      hints: ['左側拖曳移動', '靠近經驗寶石拾取', '升級時點卡片'],
      showActionButton: false,
    },
    featuredIcon: 'action',
  },
  breakout: {
    gameId: 'breakout',
    thumbnailFocus: '呈現擋板、彈球、彩色磚塊與掉落道具，縮圖要能看出反彈路徑。',
    controlChips: ['左右移動', '黏球釋放', '道具接取', 'Boss 磚塊'],
    playabilityChecks: ['前幾關球速不過快', '道具圖示與危險/增益清楚區分', '磚塊配置不得產生過長空窗'],
    deepPolish: ['關卡變體保留節奏差異', '失誤後重開球需要短暫安全時間'],
    touchPattern: {
      kind: 'horizontal-action',
      primary: '按住左右半邊移動擋板，右下按鈕釋放黏球',
      hints: ['左半邊向左', '右半邊向右', '右下釋放黏球'],
      showActionButton: true,
    },
    featuredIcon: 'arcade',
  },
  tetris: {
    gameId: 'tetris',
    thumbnailFocus: '用清楚的棋盤、當前方塊與下一塊預告，讓縮圖直接傳達堆疊消行。',
    controlChips: ['左右移動', '滑上旋轉', '滑下軟降', '點按硬降'],
    playabilityChecks: ['初期落下速度給足反應時間', '觸控旋轉不被小滑動誤觸', '下一塊資訊保持可見'],
    deepPolish: ['前兩級偏教學節奏', '任務與特殊列不干擾核心消行判斷'],
    touchPattern: {
      kind: 'directional-swipe',
      primary: '左右滑移動，上滑旋轉，下滑加速',
      hints: ['左右滑移動', '上滑旋轉', '下滑軟降'],
      showActionButton: false,
    },
    featuredIcon: 'puzzle',
  },
  snake: {
    gameId: 'snake',
    thumbnailFocus: '清楚顯示蛇頭方向、食物與格線邊界，避免只像一般角色圖。',
    controlChips: ['方向滑動', '轉向緩衝', '特殊食物', '速度成長'],
    playabilityChecks: ['連續轉向不能吃掉玩家輸入', '食物不可生成在蛇身', '速度提升要有明確階段感'],
    deepPolish: ['失敗前的轉向與碰撞回饋更明確', '特殊食物用顏色與形狀雙重識別'],
    touchPattern: {
      kind: 'directional-swipe',
      primary: '朝想移動的方向滑動，避免反向撞身',
      hints: ['上下左右滑動', '不能直接反向', '吃特殊食物加成'],
      showActionButton: false,
    },
    featuredIcon: 'heart',
  },
  game2048: {
    gameId: 'game2048',
    thumbnailFocus: '強調 4x4 棋盤、合併中的數字磚與最大目標磚，讓策略玩法清楚。',
    controlChips: ['四向滑動', '相同合併', '棋盤規劃', '保留角落'],
    playabilityChecks: ['滑動閾值不過高', '合併結果與分數同步', '無可動時才結束'],
    deepPolish: ['新增可動方向提示，降低新手卡住感', '高數字磚需要更強層級差異'],
    touchPattern: {
      kind: 'directional-swipe',
      primary: '上下左右滑動整個棋盤合併數字',
      hints: ['四向滑動', '相同數字合併', '保持最大磚角落'],
      showActionButton: false,
    },
    featuredIcon: 'puzzle',
  },
  flappy: {
    gameId: 'flappy',
    thumbnailFocus: '突出小鳥、管道缺口與節奏感，缺口必須在縮圖中清楚可見。',
    controlChips: ['點擊拍翅', '穿越缺口', '收集圓環', '節奏控制'],
    playabilityChecks: ['前幾根管道缺口較寬', '碰撞盒略小於視覺角色', '速度成長不能突然跳升'],
    deepPolish: ['起步階段保留更多安全高度', '圓環獎勵放在可達但不強迫的位置'],
    touchPattern: {
      kind: 'tap-timing',
      primary: '點擊或按空白鍵拍翅，短促連點控制高度',
      hints: ['點擊拍翅', '對準管道缺口', '收集安全圓環'],
      showActionButton: true,
    },
    featuredIcon: 'sparkle',
  },
  invaders: {
    gameId: 'invaders',
    thumbnailFocus: '呈現玩家戰機、敵方陣型、子彈與護盾，讓射擊與躲避目標清楚。',
    controlChips: ['左右移動', '點擊射擊', '護盾掩體', '收集道具'],
    playabilityChecks: ['敵彈密度與玩家射速公平', '護盾破損狀態可讀', '火力強化冷卻不會降到失控'],
    deepPolish: ['前兩波偏準星教學節奏', '不同陣型需要能看出安全路徑'],
    touchPattern: {
      kind: 'horizontal-action',
      primary: '左右拖曳移動，右下按鈕射擊',
      hints: ['左右移動戰機', '右下射擊', '躲在護盾後方'],
      showActionButton: true,
    },
    featuredIcon: 'action',
  },
  'fruit-catch': {
    gameId: 'fruit-catch',
    thumbnailFocus: '強調籃子、不同水果、炸彈與掉落方向，縮圖需要能分辨好壞物件。',
    controlChips: ['左右移動', '接水果', '避炸彈', '天氣干擾'],
    playabilityChecks: ['初期掉落速度不壓迫', '炸彈辨識比水果更醒目', '漏接扣命與接炸彈回饋不同'],
    deepPolish: ['初期籃子較寬，後期再增加壓力', '天氣效果要有預告，不突然懲罰'],
    touchPattern: {
      kind: 'drag-horizontal',
      primary: '按住並水平拖曳籃子接水果',
      hints: ['水平拖曳籃子', '接水果得分', '避開炸彈'],
      showActionButton: false,
    },
    featuredIcon: 'basket',
  },
  'tower-defense': {
    gameId: 'tower-defense',
    thumbnailFocus: '顯示路徑、砲塔射程、敵人波次與基地，讓策略放置目標清楚。',
    controlChips: ['點格建塔', '點塔升級', '守住路線', '管理金幣'],
    playabilityChecks: ['可建造格與路徑清楚分離', '第一波給足建塔時間', '升級成本與收益要能比較'],
    deepPolish: ['塔種用途用顏色和射程呈現', '波次開始前保留決策空檔'],
    touchPattern: {
      kind: 'tap-placement',
      primary: '點擊空白格建塔，再點同一座塔升級',
      hints: ['點格建塔', '點塔升級', '保護終點'],
      showActionButton: false,
    },
    featuredIcon: 'strategy',
  },
  'tic-tac-toe': {
    gameId: 'tic-tac-toe',
    thumbnailFocus: '突出 3x3 棋盤、X/O 對戰與特殊卡片，讓它不像普通圖示。',
    controlChips: ['點格落子', '觀察威脅', '使用卡片', 'AI 難度'],
    playabilityChecks: ['AI 難度有明顯區分', '特殊卡不能破壞棋盤公平性', '勝負線即時標示'],
    deepPolish: ['特殊卡使用前要看得懂效果', '平手與勝負回饋需要一眼可讀'],
    touchPattern: {
      kind: 'tap-cell',
      primary: '點擊空格落子，必要時先選特殊卡',
      hints: ['點空格落子', '先擋二連線', '可用特殊卡'],
      showActionButton: false,
    },
    featuredIcon: 'board',
  },
  memory: {
    gameId: 'memory',
    thumbnailFocus: '用翻開與蓋牌並存的卡片呈現配對目標，讓記憶玩法清楚。',
    controlChips: ['點牌翻開', '一次兩張', '記位置', '連擊加分'],
    playabilityChecks: ['翻牌動畫不拖慢判斷', '錯配停留時間足夠記憶', '步數限制符合牌組大小'],
    deepPolish: ['不同難度逐步增加牌量', '配對成功需要清楚消除與加分回饋'],
    touchPattern: {
      kind: 'tap-card',
      primary: '點兩張牌翻開，相同就配對消除',
      hints: ['點牌翻開', '記住位置', '連續配對加分'],
      showActionButton: false,
    },
    featuredIcon: 'cards',
  },
  sudoku: {
    gameId: 'sudoku',
    thumbnailFocus: '顯示 9x9 宮格、選取格與數字列，讓玩家理解是邏輯填數。',
    controlChips: ['點格選取', '點數填入', '筆記模式', '提示/清除'],
    playabilityChecks: ['選取格、同列同宮高亮清楚', '錯誤提示不遮住棋盤', '題目難度與錯誤次數匹配'],
    deepPolish: ['數字鍵盤保持固定位置', '提示消耗與錯誤限制需要清楚展示'],
    touchPattern: {
      kind: 'number-pad',
      primary: '先點棋盤格，再點下方數字或功能鍵',
      hints: ['點格選取', '點數字填入', '可切換筆記'],
      showActionButton: false,
    },
    featuredIcon: 'puzzle',
  },
}

export function getGameOptimizationProfile(gameId: GameId): GameOptimizationProfile {
  return gameOptimizationProfiles[gameId]
}
