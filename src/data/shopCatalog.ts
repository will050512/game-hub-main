import type { ShopCollectionItem } from '@/types'
import { avatarFrameDefs, badgeDefs } from '@/data/collections'

const badgeCosts: Record<string, number> = {
  first_game: 180,
  master_gamer: 1200,
  legendary_scorer: 1500,
  tycoon: 1800,
  all_rounder: 2600,
  perfect_memory: 2400,
  hardcore: 1600,
}

const frameCosts: Record<string, number> = {
  frame_bronze: 240,
  frame_silver: 720,
  frame_gold: 1600,
  frame_diamond: 3200,
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
