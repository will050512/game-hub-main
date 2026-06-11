import type { AchievementDef } from '@/types'

export const achievementDefs: AchievementDef[] = [
  { id: 'first_game', name: '初次挑戰', description: '完成第一場遊戲', icon: 'controller', category: 'gameplay', rarity: 'common', condition: { type: 'gamesPlayed', threshold: 1 }, reward: { coins: 50 } },
  { id: 'play_10', name: '遊戲新手', description: '完成10場遊戲', icon: 'action', category: 'gameplay', rarity: 'common', condition: { type: 'gamesPlayed', threshold: 10 }, reward: { coins: 100 } },
  { id: 'play_50', name: '遊戲達人', description: '完成50場遊戲', icon: 'trophy', category: 'gameplay', rarity: 'uncommon', condition: { type: 'gamesPlayed', threshold: 50 }, reward: { coins: 300 } },
  { id: 'play_100', name: '遊戲大師', description: '完成100場遊戲', icon: 'crown', category: 'gameplay', rarity: 'rare', condition: { type: 'gamesPlayed', threshold: 100 }, reward: { coins: 500, badge: 'master_gamer' } },
  { id: 'score_1000', name: '千分高手', description: '單場獲得1000分', icon: 'star', category: 'mastery', rarity: 'common', condition: { type: 'score', threshold: 1000 }, reward: { coins: 100 } },
  { id: 'score_5000', name: '五千強者', description: '單場獲得5000分', icon: 'flame', category: 'mastery', rarity: 'uncommon', condition: { type: 'score', threshold: 5000 }, reward: { coins: 300 } },
  { id: 'score_10000', name: '萬分傳奇', description: '單場獲得10000分', icon: 'sparkle', category: 'mastery', rarity: 'rare', condition: { type: 'score', threshold: 10000 }, reward: { coins: 1000, badge: 'legendary_scorer' } },
  { id: 'coins_1000', name: '小富翁', description: '累計獲得1000金幣', icon: 'coin', category: 'collection', rarity: 'common', condition: { type: 'totalCoins', threshold: 1000 }, reward: { coins: 50 } },
  { id: 'coins_5000', name: '大富翁', description: '累計獲得5000金幣', icon: 'coin', category: 'collection', rarity: 'uncommon', condition: { type: 'totalCoins', threshold: 5000 }, reward: { coins: 200 } },
  { id: 'coins_10000', name: '億萬富翁', description: '累計獲得10000金幣', icon: 'coin', category: 'collection', rarity: 'rare', condition: { type: 'totalCoins', threshold: 10000 }, reward: { coins: 500, badge: 'tycoon' } },
  { id: 'survivor_500', name: '暗夜勇士', description: '暗夜倖存者單場500分', icon: 'action', category: 'mastery', rarity: 'uncommon', condition: { type: 'score', gameId: 'survivor', threshold: 500 }, reward: { coins: 200 } },
  { id: 'tetris_tetris', name: 'Tetris!', description: '俄羅斯方塊單場3000分', icon: 'puzzle', category: 'mastery', rarity: 'uncommon', condition: { type: 'score', gameId: 'tetris', threshold: 3000 }, reward: { coins: 200 } },
  { id: 'snake_50', name: '巨蛇傳說', description: '貪吃蛇吃到50顆蘋果', icon: 'heart', category: 'mastery', rarity: 'uncommon', condition: { type: 'score', gameId: 'snake', threshold: 500 }, reward: { coins: 200 } },
  { id: 'flappy_20', name: '飛行專家', description: 'Flappy Bird穿越20管道', icon: 'sparkle', category: 'mastery', rarity: 'uncommon', condition: { type: 'score', gameId: 'flappy', threshold: 20 }, reward: { coins: 300 } },
  { id: 'all_games', name: '全能玩家', description: '玩過所有遊戲', icon: 'sparkle', category: 'special', rarity: 'epic', condition: { type: 'gamesPlayed', threshold: 12 }, reward: { coins: 1000, badge: 'all_rounder' } },
  { id: 'win_streak_5', name: '連勝王者', description: '井字棋連勝5場', icon: 'trophy', category: 'mastery', rarity: 'rare', condition: { type: 'winStreak', threshold: 5 }, reward: { coins: 500 } },
  { id: 'memory_perfect', name: '完美記憶', description: '記憶翻牌零失誤完成', icon: 'puzzle', category: 'mastery', rarity: 'epic', condition: { type: 'perfectGame', threshold: 1 }, reward: { coins: 800, badge: 'perfect_memory' } },
  { id: 'time_1h', name: '時間管理師', description: '累計遊玩1小時', icon: 'timer', category: 'gameplay', rarity: 'common', condition: { type: 'timePlayed', threshold: 3600 }, reward: { coins: 100 } },
  { id: 'time_10h', name: '重度玩家', description: '累計遊玩10小時', icon: 'arcade', category: 'gameplay', rarity: 'rare', condition: { type: 'timePlayed', threshold: 36000 }, reward: { coins: 500, badge: 'hardcore' } },
  { id: 'tower_10', name: '塔防大師', description: '塔防建造10座砲塔', icon: 'strategy', category: 'mastery', rarity: 'uncommon', condition: { type: 'score', gameId: 'tower-defense', threshold: 1000 }, reward: { coins: 300 } },
]
