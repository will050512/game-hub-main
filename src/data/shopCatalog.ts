import type { ShopCollectionItem } from '@/types'
import { avatarFrameDefs, badgeDefs } from '@/data/collections'

const badgeCosts: Record<string, number> = {
  first_game: 50,
  master_gamer: 300,
  legendary_scorer: 400,
  tycoon: 500,
  all_rounder: 650,
  perfect_memory: 600,
  hardcore: 400,
}

const frameCosts: Record<string, number> = {
  frame_bronze: 60,
  frame_silver: 180,
  frame_gold: 400,
  frame_diamond: 800,
}

export const shopBadgeItems: ShopCollectionItem[] = badgeDefs.map((badge) => ({
  id: badge.id,
  type: 'badge',
  name: badge.name,
  description: badge.description,
  icon: badge.icon,
  rarity: badge.rarity,
  cost: badgeCosts[badge.id] ?? 900,
}))

export const shopAvatarFrameItems: ShopCollectionItem[] = avatarFrameDefs.map((frame) => ({
  id: frame.id,
  type: 'avatarFrame',
  name: frame.name,
  description: `個人檔案外框 · ${frame.source}`,
  icon: 'crown',
  rarity: frame.id === 'frame_diamond' ? 'legendary' : frame.id === 'frame_gold' ? 'epic' : 'rare',
  cost: frameCosts[frame.id] ?? 900,
  color: frame.color,
  glowColor: frame.glowColor,
}))

export const shopCollectionItems: ShopCollectionItem[] = [
  ...shopBadgeItems,
  ...shopAvatarFrameItems,
]
