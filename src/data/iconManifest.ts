export type KawaiiIconId =
  | 'action'
  | 'apple'
  | 'arcade'
  | 'back'
  | 'basket'
  | 'block'
  | 'board'
  | 'bomb'
  | 'book'
  | 'boomerang'
  | 'cards'
  | 'coin'
  | 'controller'
  | 'crown'
  | 'check'
  | 'flame'
  | 'heart'
  | 'home'
  | 'keyboard'
  | 'laser'
  | 'magnet'
  | 'lock'
  | 'orb'
  | 'pill'
  | 'preview'
  | 'puzzle'
  | 'search'
  | 'shield'
  | 'shop'
  | 'skull'
  | 'snow'
  | 'speed'
  | 'sparkle'
  | 'star'
  | 'strategy'
  | 'timer'
  | 'trophy'
  | 'undo'
  | 'upgrade'

export const categoryIconMap: Record<string, KawaiiIconId> = {
  action: 'action',
  arcade: 'arcade',
  board: 'board',
  casual: 'heart',
  puzzle: 'puzzle',
  strategy: 'strategy',
}

export const gameIconMap: Record<string, KawaiiIconId> = {
  survivor: 'action',
  breakout: 'arcade',
  tetris: 'puzzle',
  snake: 'heart',
  game2048: 'puzzle',
  flappy: 'sparkle',
  invaders: 'action',
  'fruit-catch': 'basket',
  'tower-defense': 'strategy',
  'tic-tac-toe': 'board',
  memory: 'cards',
  sudoku: 'puzzle',
}

export const achievementIconMap: Record<string, KawaiiIconId> = {
  first_game: 'controller',
  play_10: 'action',
  play_50: 'trophy',
  play_100: 'crown',
  score_1000: 'star',
  score_5000: 'flame',
  score_10000: 'sparkle',
  coins_1000: 'coin',
  coins_5000: 'coin',
  coins_10000: 'coin',
  survivor_500: 'action',
  tetris_tetris: 'puzzle',
  snake_50: 'heart',
  flappy_20: 'sparkle',
  all_games: 'sparkle',
  win_streak_5: 'trophy',
  memory_perfect: 'puzzle',
  time_1h: 'timer',
  time_10h: 'arcade',
  tower_10: 'strategy',
}

export const questIconMap: Record<string, KawaiiIconId> = {
  play_3: 'controller',
  play_5: 'timer',
  score_500: 'action',
  score_1000: 'star',
  survivor_play: 'action',
  tetris_play: 'puzzle',
  earn_500: 'coin',
  upgrade_1: 'upgrade',
  win_3: 'trophy',
  snake_play: 'heart',
  flappy_play: 'sparkle',
  memory_play: 'board',
}

export const upgradeIconMap: Record<string, KawaiiIconId> = {
  damage_boost: 'action',
  fire_rate: 'flame',
  critical_strike: 'sparkle',
  extra_life: 'heart',
  shield_start: 'shield',
  damage_reduction: 'shield',
  movement_speed: 'timer',
  item_magnet: 'star',
  lucky_drop: 'sparkle',
  slow_start: 'timer',
  coin_boost: 'coin',
  score_boost: 'star',
}

export const itemIconMap: Record<string, KawaiiIconId> = {
  action: 'action',
  apple: 'apple',
  arcade: 'arcade',
  ball: 'arcade',
  basket: 'basket',
  blade: 'action',
  block: 'block',
  bomb: 'bomb',
  book: 'book',
  boomerang: 'boomerang',
  brick: 'block',
  burst: 'sparkle',
  cards: 'cards',
  chaos: 'orb',
  coin: 'coin',
  crown: 'crown',
  flame: 'flame',
  fortress: 'strategy',
  heart: 'heart',
  ice: 'snow',
  laser: 'laser',
  leaf: 'sparkle',
  lucky: 'sparkle',
  magnet: 'magnet',
  narrow: 'block',
  orb: 'orb',
  pill: 'pill',
  power: 'upgrade',
  preview: 'preview',
  pyramid: 'strategy',
  puzzle: 'puzzle',
  refresh: 'undo',
  remove: 'block',
  repair: 'upgrade',
  rocket: 'speed',
  shield: 'shield',
  skull: 'skull',
  slow: 'timer',
  snow: 'snow',
  speed: 'speed',
  stats: 'star',
  storm: 'flame',
  swap: 'undo',
  target: 'action',
  triple: 'laser',
  undo: 'undo',
  volcano: 'flame',
  wide: 'upgrade',
}

export function iconForGame(gameId: string, category?: string): KawaiiIconId {
  return gameIconMap[gameId] ?? (category ? categoryIconMap[category] : undefined) ?? 'sparkle'
}

export function iconForAchievement(achievementId: string): KawaiiIconId {
  return achievementIconMap[achievementId] ?? 'trophy'
}

export function iconForQuest(questId: string): KawaiiIconId {
  return questIconMap[questId] ?? 'board'
}

export function iconForUpgrade(upgradeId: string): KawaiiIconId {
  return upgradeIconMap[upgradeId] ?? 'star'
}

export function iconForItem(iconId: string): KawaiiIconId {
  return itemIconMap[iconId] ?? 'sparkle'
}
