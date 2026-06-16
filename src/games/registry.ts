import type {
  CanonicalGameManifest,
  GameAdapterLifecycleRules,
  GameFactoryModule,
  GameId,
  GameInstance,
  GameInfo,
} from '@/types'

const BASE = import.meta.env.BASE_URL

function resolveAsset(path: string): string {
  return path.startsWith('/') ? `${BASE}${path.slice(1)}` : path
}

const defaultLifecycleRules: GameAdapterLifecycleRules = {
  start: { required: true, contract: 'Adapter MUST call start(canvas, callbacks) to bootstrap loop and hooks.' },
  pause: { required: true, contract: 'Adapter MUST expose pause() for shell pause overlay and focus loss handling.' },
  resume: { required: true, contract: 'Adapter MUST expose resume() to continue simulation after pause.' },
  stop: { required: true, contract: 'Adapter MUST expose stop() and release listeners/resources idempotently.' },
  resize: { required: true, contract: 'Adapter MUST expose resize(width, height) and support viewport changes.' },
  result: { required: true, contract: 'Adapter MUST emit final score via onGameOver callback for result route payload.' },
  reward: { required: true, contract: 'Adapter MUST emit score/stats updates consumed by shell reward settlement hooks.' },
  save: { required: false, contract: 'Adapter MAY implement save hooks; shell treats missing save as no-op fallback.' },
}

const defaultResultFields = [
  { key: 'score', label: '分數', defaultValue: 0 },
  { key: 'kills', label: '達成數', defaultValue: 0 },
  { key: 'time', label: '遊玩時間', defaultValue: 0 },
  { key: 'level', label: '等級', defaultValue: 1 },
  { key: 'coins', label: '金幣', defaultValue: 0 },
] as const

const canonicalGameManifests: CanonicalGameManifest[] = [
  {
    gameId: 'survivor',
    title: '暗夜倖存者',
    description: '在無盡的黑夜中生存！自動攻擊敵人、收集經驗值升級，合成強大武器擊退怪物潮。結合吸血鬼倖存者的自動戰鬥與武器合成系統，打造你的專屬Build！',
    category: 'action',
    color: '#8b5cf6',
    icon: 'action',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/survivor',
    },
    assets: { thumbnail: resolveAsset('/images/survivor-thumb.svg'), audio: { bgm: resolveAsset('/audio/survivor/bgm.mp3') } },
    capabilities: {
      hasAudio: true,
      hasUpgrades: true,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'auto' },
    resultFields: [...defaultResultFields],
    instructions: [
      '使用虛擬搖桿或觸控拖曳控制角色移動',
      '角色會自動發射武器攻擊附近的敵人',
      '擊殺敵人掉落經驗寶石，收集升級',
      '升級時可選擇新武器、被動技能或武器合成',
      '兩把相同武器可合成為更強的進階武器',
      '存活越久，敵人越強，分數越高',
      '生命值歸零則遊戲結束',
    ],
    controls: '觸控拖曳 / 虛擬搖桿移動角色，升級時點選選項',
    adapter: {
      factory: {
        modulePath: '@/games/survivor/index',
        exportName: 'createSurvivorGame',
        load: () => import('@/games/survivor/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'breakout',
    title: '打磚塊',
    description: '經典打磚塊遊戲！控制底部擋板反彈球體，擊碎所有磚塊通關。收集道具強化能力，解鎖修飾符組合獲得永久加成。6種關卡變體與Boss磚塊挑戰等你征服！',
    category: 'casual',
    color: '#f59e0b',
    icon: 'arcade',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/breakout',
    },
    assets: { thumbnail: resolveAsset('/images/breakout-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: true,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'auto' },
    resultFields: [...defaultResultFields],
    instructions: [
      '左右移動底部擋板來反彈球',
      '球碰到磚塊會將其擊碎並得分',
      '不同顏色的磚塊分數不同，越上方分數越高',
      '收集掉落的道具獲得臨時強化效果',
      '擊碎磚塊累積修飾符進度，解鎖永久加成',
      '每6關遭遇Boss磚塊，需多次擊打才能摧毀',
      '關卡變體包含：標準、金字塔、邊緣、堡壘、混沌、Boss',
      '球落到擋板下方會失去一條命，共有 3 條命',
      '擊碎所有磚塊即可進入下一關',
      '失去所有生命則遊戲結束',
    ],
    controls: '左右方向鍵 / A、D 鍵 / 觸控左右半邊移動擋板',
    adapter: {
      factory: {
        modulePath: '@/games/breakout/index',
        exportName: 'createBreakoutGame',
        load: () => import('@/games/breakout/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'tetris',
    title: '俄羅斯方塊',
    description: '永恆經典的俄羅斯方塊！操控七種不同形狀的方塊，旋轉、移動並堆疊它們。消除完整的一行得分，同時消除越多行分數越高。速度會隨等級提升，你能堅持多久？',
    category: 'puzzle',
    color: '#06b6d4',
    icon: 'puzzle',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/tetris',
    },
    assets: { thumbnail: resolveAsset('/images/tetris-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'manual' },
    resultFields: [...defaultResultFields],
    instructions: [
      '左右移動方塊調整位置',
      '旋轉方塊找到最佳放置角度',
      '向下加速落下或直接硬降到底',
      '填滿一整行即可消除得分',
      '同時消除多行可獲得更高分數（最多4行 = Tetris）',
      '每消除 10 行提升一個等級，落下速度加快',
      '方塊堆到頂部則遊戲結束',
    ],
    controls: '方向鍵 / WASD 移動旋轉，空白鍵硬降 / 觸控點擊左中右區域操作',
    adapter: {
      factory: {
        modulePath: '@/games/tetris/index',
        exportName: 'createTetrisGame',
        load: () => import('@/games/tetris/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'snake',
    title: '貪吃蛇',
    description: '經典貪吃蛇遊戲！控制蛇在格子中移動，吃掉蘋果讓蛇身成長。隨著蛇越來越長，躲避自己身體的難度也越來越高。看看你能長到多長！',
    category: 'casual',
    color: '#22c55e',
    icon: 'heart',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/snake',
    },
    assets: { thumbnail: resolveAsset('/images/snake-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'auto' },
    resultFields: [...defaultResultFields],
    instructions: [
      '使用方向鍵或滑動控制蛇的移動方向',
      '吃到紅色蘋果蛇身會增長一格並得分',
      '每吃 5 顆蘋果提升一個等級，速度加快',
      '撞到牆壁或自己的身體則遊戲結束',
      '蛇越長分數越高，挑戰最高紀錄！',
    ],
    controls: '方向鍵 / WASD / 觸控滑動改變方向',
    adapter: {
      factory: {
        modulePath: '@/games/snake/index',
        exportName: 'createSnakeGame',
        load: () => import('@/games/snake/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'game2048',
    title: '2048',
    description: '風靡全球的數字益智遊戲！滑動合併相同數字的方塊，目標是合成 2048。每次滑動後會出現新方塊，棋盤填滿且無法合併時遊戲結束。考驗你的策略思維！',
    category: 'puzzle',
    color: '#eab308',
    icon: 'puzzle',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/game2048',
    },
    assets: { thumbnail: resolveAsset('/images/2048-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'auto' },
    resultFields: [...defaultResultFields],
    instructions: [
      '上下左右滑動讓所有方塊向該方向移動',
      '兩個相同數字的方塊碰撞會合併為更大的數字',
      '每次移動後會隨機出現一個新方塊（2或4）',
      '目標是合成 2048 甚至更大的數字',
      '棋盤填滿且無法合併時遊戲結束',
      '合併產生的數字越大，得分越高',
    ],
    controls: '方向鍵 / WASD / 觸控滑動方向',
    adapter: {
      factory: {
        modulePath: '@/games/game2048/index',
        exportName: 'create2048Game',
        load: () => import('@/games/game2048/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'flappy',
    title: 'Flappy Bird',
    description: '簡單卻令人上癮的飛行遊戲！點擊螢幕讓小鳥飛起，穿越一對對管道之間的縫隙。看似簡單，實則需要精準的時機掌控。你能飛多遠？',
    category: 'casual',
    color: '#38bdf8',
    icon: 'sparkle',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/flappy',
    },
    assets: { thumbnail: resolveAsset('/images/flappy-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: false,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: false, saveTrigger: 'none' },
    resultFields: [...defaultResultFields],
    instructions: [
      '點擊螢幕或按空白鍵讓小鳥向上飛',
      '鬆開後小鳥會因重力下墜',
      '穿越管道間的縫隙得 1 分',
      '碰到管道、地面或天花板則遊戲結束',
      '管道間距會隨分數增加而縮小',
      '掌握節奏是關鍵！',
    ],
    controls: '點擊螢幕 / 空白鍵 / 上鍵讓小鳥飛起',
    adapter: {
      factory: {
        modulePath: '@/games/flappy/index',
        exportName: 'createFlappyGame',
        load: () => import('@/games/flappy/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'invaders',
    title: '小蜜蜂',
    description: '致敬經典太空侵略者！操控戰機左右移動，射擊從天而降的外星人軍團。收集道具組合解鎖戰術配置，獲得永久加成。6種陣型變化與護盾破壞系統，越後面的波次越困難！',
    category: 'action',
    color: '#a855f7',
    icon: 'action',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/invaders',
    },
    assets: { thumbnail: resolveAsset('/images/invaders-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: true,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'auto' },
    resultFields: [...defaultResultFields],
    instructions: [
      '左右移動控制戰機位置',
      '按射擊鍵發射子彈消滅外星人',
      '不同行的外星人分數不同，越上方越高分',
      '收集掉落的道具獲得臨時強化（急速射擊、三重射擊、護盾等）',
      '收集特定道具組合解鎖戰術配置，獲得永久加成',
      '每波外星人採用不同陣型：標準、V字、菱形、楔形、散佈、城牆',
      '利用護盾掩體抵擋敵方子彈，但會逐漸損壞',
      '外星人會隨機發射子彈，注意躲避',
      '消滅所有外星人進入下一波',
      '外星人越少移動越快，碰到底部遊戲結束',
      '共有 3 條命，被擊中會失去一條命',
    ],
    controls: '左右鍵 / A、D 鍵移動，空白鍵射擊 / 觸控左右移動，點擊射擊',
    adapter: {
      factory: {
        modulePath: '@/games/invaders/index',
        exportName: 'createInvadersGame',
        load: () => import('@/games/invaders/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'fruit-catch',
    title: '接水果',
    description: '輕鬆有趣的休閒遊戲！移動籃子接住從天而降的各種水果，不同水果分數不同。小心炸彈！接到會扣命，水果漏接也會扣命。看你能接到幾分！',
    category: 'casual',
    color: '#ef4444',
    icon: 'basket',
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/fruit-catch',
    },
    assets: { thumbnail: resolveAsset('/images/fruit-catch-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: false,
      hasResultStats: true,
    },
    inputModes: ['touch', 'keyboard'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: false, saveTrigger: 'none' },
    resultFields: [...defaultResultFields],
    instructions: [
      '左右移動籃子接住掉落的',
      '不同水果分數不同：蘋果10、橘子15、葡萄20、西瓜30、金星50',
      '小心黑色炸彈！接到會失去一條命',
      '水果掉到地面也會失去一条命',
      '每 100 分提升一個等級，速度加快',
      '共有 5 條命，全部失去遊戲結束',
    ],
    controls: '左右鍵 / A、D 鍵 / 觸控左右半邊移動籃子',
    adapter: {
      factory: {
        modulePath: '@/games/fruit-catch/index',
        exportName: 'createFruitCatchGame',
        load: () => import('@/games/fruit-catch/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'tower-defense',
    title: '塔防大戰',
    description: '經典策略塔防遊戲！在敵人路徑旁放置砲塔，阻止敵人抵達終點。多種砲塔類型、敵人波次、升級系統。策略佈局是勝利的關鍵！',
    category: 'strategy',
    color: '#f97316',
    icon: 'strategy',
    difficulty: 'medium',
    tags: ['塔防', '策略', '砲塔', '波次'],
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/tower-defense',
    },
    assets: { thumbnail: resolveAsset('/images/tower-defense-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'manual' },
    resultFields: [...defaultResultFields],
    instructions: [
      '點擊空白格子放置砲塔',
      '每種砲塔有不同的攻擊範圍和傷害',
      '擊殺敵人獲得金幣，用於建造更多砲塔',
      '敵人會沿固定路徑前進，阻止它們抵達終點',
      '每波敵人越來越強，合理分配資源',
      '砲塔可以升級，提升攻擊力和範圍',
      '終點被突破太多次則遊戲結束',
    ],
    controls: '點擊格子放置/升級砲塔，長按查看砲塔資訊',
    adapter: {
      factory: {
        modulePath: '@/games/tower-defense/index',
        exportName: 'createTowerDefenseGame',
        load: () => import('@/games/tower-defense/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'tic-tac-toe',
    title: '井字棋',
    description: '經典棋類遊戲！在 3x3 棋盤上與 AI 對戰，率先連成一線者獲勝。提供三種難度，挑戰你的策略思維！',
    category: 'board',
    color: '#6366f1',
    icon: 'board',
    difficulty: 'easy',
    tags: ['棋類', 'AI', '策略', '雙人'],
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/tic-tac-toe',
    },
    assets: { thumbnail: resolveAsset('/images/tic-tac-toe-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: false,
      hasResultStats: true,
    },
    inputModes: ['touch', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: false, saveTrigger: 'none' },
    resultFields: [...defaultResultFields],
    instructions: [
      '玩家使用 X，AI 使用 O',
      '輪流在空格放置符號',
      '率先在橫、直或斜連成三子者獲勝',
      '棋盤填滿則平手',
      '可選擇簡單、普通、困難三種難度',
      '困難難度 AI 幾乎不會犯錯',
    ],
    controls: '點擊空格放置符號 / 觸控點擊',
    adapter: {
      factory: {
        modulePath: '@/games/tic-tac-toe/index',
        exportName: 'createTicTacToeGame',
        load: () => import('@/games/tic-tac-toe/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'memory',
    title: '記憶翻牌',
    description: '考驗記憶力的配對遊戲！翻開兩張相同的卡片即可消除。在限定翻牌次數內消除所有配對。連擊可獲得額外分數！',
    category: 'puzzle',
    color: '#ec4899',
    icon: 'cards',
    difficulty: 'easy',
    tags: ['記憶', '配對', '連擊', '益智'],
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/memory',
    },
    assets: { thumbnail: resolveAsset('/images/memory-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: false,
      hasResultStats: true,
    },
    inputModes: ['touch', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: false, saveTrigger: 'none' },
    resultFields: [...defaultResultFields],
    instructions: [
      '每次翻開兩張卡片',
      '如果兩張相同則消除並得分',
      '如果不同則翻回去，記住位置',
      '連續配對成功可獲得連擊加分',
      '在限定翻牌次數內消除所有配對',
      '難度越高，卡片越多，配對越困難',
      '用最少次數完成可獲得三星評價',
    ],
    controls: '點擊卡片翻開 / 觸控點擊',
    adapter: {
      factory: {
        modulePath: '@/games/memory/index',
        exportName: 'createMemoryGame',
        load: () => import('@/games/memory/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
  {
    gameId: 'sudoku',
    title: '數獨',
    description: '經典數字邏輯遊戲！在 9x9 棋盤中填入 1-9，使每行、每列、每宮都不重複。提供多種難度，鍛鍊你的邏輯思維！',
    category: 'puzzle',
    color: '#14b8a6',
    icon: 'puzzle',
    difficulty: 'medium',
    tags: ['數獨', '邏輯', '數字', '益智'],
    route: {
      param: 'id',
      infoRouteName: 'game-info',
      playRouteName: 'game-play',
      resultRouteName: 'game-result',
      basePath: '/game/sudoku',
    },
    assets: { thumbnail: resolveAsset('/images/sudoku-thumb.svg') },
    capabilities: {
      hasAudio: true,
      hasUpgrades: false,
      hasLeaderboard: true,
      supportsPause: true,
      supportsSave: true,
      hasResultStats: true,
    },
    inputModes: ['touch', 'mouse'],
    persistence: { scoreEntity: 'scores', supportsRunSnapshot: true, saveTrigger: 'manual' },
    resultFields: [...defaultResultFields],
    instructions: [
      '在 9x9 棋盤中填入數字 1-9',
      '每行、每列、每宮（3x3）都不能有重複數字',
      '已填入的數字不能修改',
      '使用提示功能可獲得提示（消耗金幣）',
      '錯誤次數有限，超過則遊戲結束',
      '完成速度越快，分數越高',
      '可選擇簡單、普通、困難、專家四種難度',
    ],
    controls: '點擊格子選擇數字，或使用提示/清除功能',
    adapter: {
      factory: {
        modulePath: '@/games/sudoku/index',
        exportName: 'createSudokuGame',
        load: () => import('@/games/sudoku/index') as Promise<GameFactoryModule>,
      },
      lifecycle: defaultLifecycleRules,
    },
  },
]

export const gameRegistry: GameInfo[] = canonicalGameManifests.map((manifest) => ({
  id: manifest.gameId,
  name: manifest.title,
  description: manifest.description,
  category: manifest.category,
  thumbnail: manifest.assets.thumbnail,
  color: manifest.color,
  icon: manifest.icon,
  instructions: manifest.instructions,
  controls: manifest.controls,
  difficulty: manifest.difficulty,
  tags: manifest.tags,
}))

export const gameManifestRegistry: Record<GameId, CanonicalGameManifest> = canonicalGameManifests.reduce(
  (acc, manifest) => {
    acc[manifest.gameId] = manifest
    return acc
  },
  {} as Record<GameId, CanonicalGameManifest>,
)

export function getGameById(id: string): GameInfo | undefined {
  return gameRegistry.find((g) => g.id === id)
}

export function getGameManifestById(id: string): CanonicalGameManifest | undefined {
  return gameManifestRegistry[id as GameId]
}

export async function resolveGameFactoryById(id: string): Promise<() => GameInstance> {
  const manifest = getGameManifestById(id)
  if (!manifest) {
    throw new Error(`[GameManifest] Missing manifest entry for gameId: "${id}"`)
  }

  const mod = await manifest.adapter.factory.load()
  const factory = mod[manifest.adapter.factory.exportName]
  if (typeof factory !== 'function') {
    throw new Error(
      `[GameManifest] Missing factory export "${manifest.adapter.factory.exportName}" for gameId "${id}" from ${manifest.adapter.factory.modulePath}`,
    )
  }

  return factory as () => GameInstance
}

export function getGamesByCategory(category: string): GameInfo[] {
  if (category === 'all') return gameRegistry
  return gameRegistry.filter((g) => g.category === category)
}

export const categories = [
  { id: 'all', name: '全部', icon: 'controller' },
  { id: 'action', name: '動作', icon: 'action' },
  { id: 'puzzle', name: '益智', icon: 'puzzle' },
  { id: 'strategy', name: '策略', icon: 'strategy' },
  { id: 'casual', name: '休閒', icon: 'heart' },
  { id: 'board', name: '棋類', icon: 'board' },
] as const
