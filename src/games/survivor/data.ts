export interface WeaponDef {
  id: string
  name: string
  icon: string
  damage: number
  fireRate: number
  range: number
  projectileSpeed: number
  projectileSize: number
  projectileColor: string
  piercing: number
  level: number
  maxLevel: number
  synthTarget?: string
}

export interface PassiveDef {
  id: string
  name: string
  icon: string
  description: string
  level: number
  maxLevel: number
  effect: (stats: PassiveStats) => void
}

export interface PassiveStats {
  moveSpeedMult: number
  damageMult: number
  fireRateMult: number
  pickupRange: number
  maxHpBonus: number
  armor: number
  xpMult: number
  thornsMult: number
  magnetSpeedMult: number
  luckyChance: number
}

export const WEAPON_DEFS: Record<string, WeaponDef> = {
  dagger: {
    id: 'dagger',
    name: '飛刀',
    icon: 'blade',
    damage: 10,
    fireRate: 800,
    range: 250,
    projectileSpeed: 6,
    projectileSize: 4,
    projectileColor: '#94a3b8',
    piercing: 1,
    level: 1,
    maxLevel: 5,
    synthTarget: 'blade_storm',
  },
  fireball: {
    id: 'fireball',
    name: '火球',
    icon: 'flame',
    damage: 25,
    fireRate: 1500,
    range: 300,
    projectileSpeed: 4,
    projectileSize: 8,
    projectileColor: '#ef4444',
    piercing: 1,
    level: 1,
    maxLevel: 5,
    synthTarget: 'inferno',
  },
  lightning: {
    id: 'lightning',
    name: '閃電鏈',
    icon: 'speed',
    damage: 15,
    fireRate: 1200,
    range: 200,
    projectileSpeed: 10,
    projectileSize: 3,
    projectileColor: '#fbbf24',
    piercing: 3,
    level: 1,
    maxLevel: 5,
    synthTarget: 'thunderstorm',
  },
  frost: {
    id: 'frost',
    name: '冰霜',
    icon: 'ice',
    damage: 8,
    fireRate: 2000,
    range: 150,
    projectileSpeed: 3,
    projectileSize: 12,
    projectileColor: '#67e8f9',
    piercing: 10,
    level: 1,
    maxLevel: 5,
    synthTarget: 'blizzard',
  },
  blade_storm: {
    id: 'blade_storm',
    name: '刀刃風暴',
    icon: 'chaos',
    damage: 30,
    fireRate: 400,
    range: 120,
    projectileSpeed: 0,
    projectileSize: 50,
    projectileColor: '#c4b5fd',
    piercing: 99,
    level: 1,
    maxLevel: 3,
  },
  inferno: {
    id: 'inferno',
    name: '地獄火',
    icon: 'volcano',
    damage: 60,
    fireRate: 2500,
    range: 350,
    projectileSpeed: 3,
    projectileSize: 20,
    projectileColor: '#dc2626',
    piercing: 5,
    level: 1,
    maxLevel: 3,
  },
  thunderstorm: {
    id: 'thunderstorm',
    name: '雷暴',
    icon: 'storm',
    damage: 40,
    fireRate: 800,
    range: 300,
    projectileSpeed: 15,
    projectileSize: 5,
    projectileColor: '#facc15',
    piercing: 5,
    level: 1,
    maxLevel: 3,
  },
  blizzard: {
    id: 'blizzard',
    name: '暴風雪',
    icon: 'snow',
    damage: 20,
    fireRate: 1000,
    range: 200,
    projectileSpeed: 2,
    projectileSize: 30,
    projectileColor: '#22d3ee',
    piercing: 99,
    level: 1,
    maxLevel: 3,
  },
  boomerang: {
    id: 'boomerang',
    name: '迴力鏢',
    icon: 'boomerang',
    damage: 18,
    fireRate: 1400,
    range: 280,
    projectileSpeed: 5,
    projectileSize: 6,
    projectileColor: '#a78bfa',
    piercing: 3,
    level: 1,
    maxLevel: 5,
    synthTarget: 'poison_mist',
  },
  poison_mist: {
    id: 'poison_mist',
    name: '毒霧',
    icon: 'skull',
    damage: 12,
    fireRate: 1800,
    range: 180,
    projectileSpeed: 0,
    projectileSize: 60,
    projectileColor: '#84cc16',
    piercing: 99,
    level: 1,
    maxLevel: 3,
  },
}

export const BASE_WEAPONS = ['dagger', 'fireball', 'lightning', 'frost', 'boomerang']

export const PASSIVE_DEFS: Record<string, Omit<PassiveDef, 'level'>> = {
  speed_boost: {
    id: 'speed_boost',
    name: '疾風步',
    icon: 'speed',
    description: '移動速度 +10%',
    maxLevel: 5,
    effect: (s) => { s.moveSpeedMult += 0.1 },
  },
  power_up: {
    id: 'power_up',
    name: '力量提升',
    icon: 'power',
    description: '攻擊力 +15%',
    maxLevel: 5,
    effect: (s) => { s.damageMult += 0.15 },
  },
  rapid_fire: {
    id: 'rapid_fire',
    name: '急速射擊',
    icon: 'speed',
    description: '攻擊速度 +12%',
    maxLevel: 5,
    effect: (s) => { s.fireRateMult -= 0.12 },
  },
  magnet: {
    id: 'magnet',
    name: '經驗磁鐵',
    icon: 'magnet',
    description: '拾取範圍 +30',
    maxLevel: 5,
    effect: (s) => { s.pickupRange += 30 },
  },
  vitality: {
    id: 'vitality',
    name: '生命強化',
    icon: 'heart',
    description: '最大生命 +20',
    maxLevel: 5,
    effect: (s) => { s.maxHpBonus += 20 },
  },
  armor: {
    id: 'armor',
    name: '護甲',
    icon: 'shield',
    description: '減傷 +2',
    maxLevel: 5,
    effect: (s) => { s.armor += 2 },
  },
  xp_boost: {
    id: 'xp_boost',
    name: '智慧光環',
    icon: 'book',
    description: '經驗值 +15%',
    maxLevel: 5,
    effect: (s) => { s.xpMult += 0.15 },
  },
  thorns: {
    id: 'thorns',
    name: '荊棘護甲',
    icon: 'leaf',
    description: '反彈 20% 傷害給敵人',
    maxLevel: 5,
    effect: (s) => { s.thornsMult += 0.10 },
  },
  xp_magnet: {
    id: 'xp_magnet',
    name: '經驗磁場',
    icon: 'orb',
    description: '經驗磁鐵範圍 +30，吸取速度 +20%',
    maxLevel: 5,
    effect: (s) => { s.pickupRange += 15; s.magnetSpeedMult += 0.2 },
  },
  lucky_charm: {
    id: 'lucky_charm',
    name: '幸運護符',
    icon: 'lucky',
    description: '稀有選項機率 +10%',
    maxLevel: 5,
    effect: (s) => { s.luckyChance += 0.05 },
  },
}
