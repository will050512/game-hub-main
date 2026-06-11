import type { CollectibleBadge, CollectibleAvatarFrame } from '@/types'

export const badgeDefs: CollectibleBadge[] = [
  { id: 'first_game', name: '初次挑戰', description: '完成第一場遊戲', icon: 'controller', rarity: 'common', source: 'achievement:first_game' },
  { id: 'master_gamer', name: '遊戲大師', description: '完成100場遊戲', icon: 'crown', rarity: 'rare', source: 'achievement:play_100' },
  { id: 'legendary_scorer', name: '萬分傳奇', description: '單場獲得10000分', icon: 'star', rarity: 'rare', source: 'achievement:score_10000' },
  { id: 'tycoon', name: '億萬富翁', description: '累計獲得10000金幣', icon: 'coin', rarity: 'rare', source: 'achievement:coins_10000' },
  { id: 'all_rounder', name: '全能玩家', description: '玩過所有遊戲', icon: 'sparkle', rarity: 'epic', source: 'achievement:all_games' },
  { id: 'perfect_memory', name: '完美記憶', description: '記憶翻牌零失誤', icon: 'puzzle', rarity: 'epic', source: 'achievement:memory_perfect' },
  { id: 'hardcore', name: '重度玩家', description: '累計遊玩10小時', icon: 'arcade', rarity: 'rare', source: 'achievement:time_10h' },
]

export const avatarFrameDefs: CollectibleAvatarFrame[] = [
  { id: 'frame_bronze', name: '青銅邊框', color: '#cd7f32', glowColor: 'rgba(205,127,50,0.3)', source: 'level:3' },
  { id: 'frame_silver', name: '銀色邊框', color: '#c0c0c0', glowColor: 'rgba(192,192,192,0.3)', source: 'level:5' },
  { id: 'frame_gold', name: '金色邊框', color: '#ffd700', glowColor: 'rgba(255,215,0,0.4)', source: 'level:7' },
  { id: 'frame_diamond', name: '鑽石邊框', color: '#b9f2ff', glowColor: 'rgba(185,242,255,0.5)', source: 'level:10' },
]
