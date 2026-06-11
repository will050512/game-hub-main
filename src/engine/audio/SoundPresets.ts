import type { SoundChannel } from './SoundManager'

// ─── Kenney Asset Base Path ─────────────────────────────────

/**
 * Base URL prefix for all Kenney OGG assets.
 *
 * Default assumes files are served from `/audio/kenney_<pack>/Audio/`.
 * Override this constant before calling any preload method if your
 * asset pipeline places files elsewhere (e.g. Vite build output, CDN).
 */
export let SOUND_BASE_PATH = '/audio/'

function digital(name: string): string {
  return `${SOUND_BASE_PATH}kenney_digital-audio/Audio/${name}`
}

function ui(name: string): string {
  return `${SOUND_BASE_PATH}kenney_ui-audio/Audio/${name}`
}

function impact(name: string): string {
  return `${SOUND_BASE_PATH}kenney_impact-sounds/Audio/${name}`
}

function sciFi(name: string): string {
  return `${SOUND_BASE_PATH}kenney_sci-fi-sounds/Audio/${name}`
}

function rpg(name: string): string {
  return `${SOUND_BASE_PATH}kenney_rpg-audio/Audio/${name}`
}

function jingles8bit(name: string): string {
  return `${SOUND_BASE_PATH}kenney_music-jingles/Audio/8-Bit jingles/${name}`
}

function jinglesHit(name: string): string {
  return `${SOUND_BASE_PATH}kenney_music-jingles/Audio/Hit jingles/${name}`
}

function casino(name: string): string {
  return `${SOUND_BASE_PATH}kenney_casino-audio/Audio/${name}`
}

// ─── Event Type ─────────────────────────────────────────────

export type SoundEvent =
  | 'click'
  | 'select'
  | 'error'
  | 'success'
  | 'gameOver'
  | 'score'
  | 'levelUp'
  | 'powerUp'
  | 'explosion'
  | 'hit'
  | 'collect'
  | 'shoot'
  | 'death'
  | 'start'
  | 'pause'
  | 'resume'
  | 'menu'
  | 'flip'
  | 'slide'
  | 'place'

export interface SoundEventDef {
  paths: string[]
  channel: SoundChannel
  volume?: number
  pitch?: number
  loop?: boolean
}

// ─── Shared Event Map (Used by all games) ───────────────────

/**
 * Maps sound event names to Kenney audio file paths.
 * Each event can have multiple variants; the manager picks randomly.
 */
export const soundEventMap: Record<SoundEvent, SoundEventDef> = {
  click: {
    paths: [ui('click1.ogg'), ui('click2.ogg'), ui('click3.ogg'), ui('click4.ogg'), ui('click5.ogg')],
    channel: 'ui',
    volume: 0.6,
  },
  select: {
    paths: [ui('switch1.ogg'), ui('switch2.ogg'), ui('switch3.ogg')],
    channel: 'ui',
    volume: 0.55,
  },
  error: {
    paths: [digital('lowDown.ogg'), digital('lowRandom.ogg')],
    channel: 'ui',
    volume: 0.5,
  },
  success: {
    paths: [digital('pepSound1.ogg'), digital('pepSound2.ogg'), digital('pepSound3.ogg')],
    channel: 'ui',
    volume: 0.6,
  },
  gameOver: {
    paths: [digital('phaseJump5.ogg'), digital('phaserDown3.ogg')],
    channel: 'music',
    volume: 0.7,
  },
  score: {
    paths: [digital('tone1.ogg'), digital('twoTone1.ogg'), digital('twoTone2.ogg')],
    channel: 'sfx',
    volume: 0.5,
  },
  levelUp: {
    paths: [digital('highUp.ogg'), digital('phaserUp1.ogg')],
    channel: 'sfx',
    volume: 0.6,
  },
  powerUp: {
    paths: [digital('powerUp1.ogg'), digital('powerUp2.ogg'), digital('powerUp3.ogg'), digital('powerUp4.ogg')],
    channel: 'sfx',
    volume: 0.6,
  },
  explosion: {
    paths: [sciFi('explosionCrunch_000.ogg'), sciFi('explosionCrunch_001.ogg'), sciFi('explosionCrunch_002.ogg')],
    channel: 'sfx',
    volume: 0.7,
  },
  hit: {
    paths: [impact('impactPunch_heavy_000.ogg'), impact('impactPunch_heavy_001.ogg'), impact('impactPunch_medium_000.ogg')],
    channel: 'sfx',
    volume: 0.55,
  },
  collect: {
    paths: [digital('coinCollect.ogg'), rpg('handleCoins.ogg'), rpg('handleCoins2.ogg')],
    channel: 'sfx',
    volume: 0.5,
  },
  shoot: {
    paths: [digital('laser1.ogg'), digital('laser2.ogg'), digital('laser3.ogg'), digital('laser4.ogg')],
    channel: 'sfx',
    volume: 0.5,
  },
  death: {
    paths: [digital('lowDown.ogg'), sciFi('explosionCrunch_003.ogg')],
    channel: 'sfx',
    volume: 0.6,
  },
  start: {
    paths: [jingles8bit('jingles_NES00.ogg'), jingles8bit('jingles_NES01.ogg')],
    channel: 'music',
    volume: 0.7,
  },
  pause: {
    paths: [ui('switch10.ogg'), ui('switch11.ogg')],
    channel: 'ui',
    volume: 0.4,
  },
  resume: {
    paths: [ui('switch12.ogg'), ui('switch13.ogg')],
    channel: 'ui',
    volume: 0.4,
  },
  menu: {
    paths: [ui('rollover1.ogg'), ui('rollover2.ogg'), ui('rollover3.ogg')],
    channel: 'ui',
    volume: 0.35,
  },
  flip: {
    paths: [rpg('bookFlip1.ogg'), rpg('bookFlip2.ogg'), rpg('bookFlip3.ogg')],
    channel: 'sfx',
    volume: 0.45,
  },
  slide: {
    paths: [casino('card-slide-1.ogg'), casino('card-slide-2.ogg'), casino('card-slide-3.ogg')],
    channel: 'sfx',
    volume: 0.45,
  },
  place: {
    paths: [casino('card-place-1.ogg'), casino('card-place-2.ogg'), casino('chips-stack-1.ogg')],
    channel: 'sfx',
    volume: 0.5,
  },
}

// ─── Per-Game Presets ───────────────────────────────────────

export type GameId =
  | 'survivor'
  | 'breakout'
  | 'tetris'
  | 'snake'
  | 'game2048'
  | 'flappy'
  | 'invaders'
  | 'fruit-catch'
  | 'tower-defense'
  | 'tic-tac-toe'
  | 'memory'
  | 'sudoku'

export interface GameSoundPreset {
  /** Sound events that should be registered for this game */
  events: SoundEvent[]
  /** Background music jingle variants (optional) */
  music?: string[]
  /** Default channel for game SFX */
  defaultChannel: SoundChannel
}

export const gameSoundPresets: Record<GameId, GameSoundPreset> = {
  survivor: {
    events: ['shoot', 'explosion', 'hit', 'collect', 'powerUp', 'levelUp', 'score', 'gameOver', 'death'],
    music: [jingles8bit('jingles_NES02.ogg'), jingles8bit('jingles_NES03.ogg')],
    defaultChannel: 'sfx',
  },
  breakout: {
    events: ['hit', 'score', 'powerUp', 'explosion', 'collect', 'gameOver', 'levelUp'],
    defaultChannel: 'sfx',
  },
  tetris: {
    events: ['place', 'score', 'success', 'gameOver', 'levelUp', 'flip'],
    defaultChannel: 'sfx',
  },
  snake: {
    events: ['collect', 'score', 'hit', 'death', 'gameOver', 'powerUp'],
    defaultChannel: 'sfx',
  },
  game2048: {
    events: ['place', 'score', 'success', 'select', 'click', 'levelUp'],
    defaultChannel: 'sfx',
  },
  flappy: {
    events: ['score', 'hit', 'death', 'gameOver', 'collect'],
    defaultChannel: 'sfx',
  },
  invaders: {
    events: ['shoot', 'explosion', 'hit', 'score', 'powerUp', 'gameOver', 'death'],
    defaultChannel: 'sfx',
  },
  'fruit-catch': {
    events: ['collect', 'score', 'success', 'powerUp', 'gameOver'],
    defaultChannel: 'sfx',
  },
  'tower-defense': {
    events: ['shoot', 'explosion', 'hit', 'collect', 'powerUp', 'score', 'gameOver', 'levelUp'],
    defaultChannel: 'sfx',
  },
  'tic-tac-toe': {
    events: ['place', 'click', 'success', 'error', 'gameOver'],
    defaultChannel: 'ui',
  },
  memory: {
    events: ['flip', 'click', 'success', 'score', 'gameOver', 'levelUp'],
    defaultChannel: 'sfx',
  },
  sudoku: {
    events: ['place', 'click', 'select', 'success', 'error', 'score', 'gameOver'],
    defaultChannel: 'ui',
  },
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Get a random audio path for a sound event.
 */
export function getRandomPath(event: SoundEvent): string | null {
  const def = soundEventMap[event]
  if (!def || def.paths.length === 0) return null
  const index = Math.floor(Math.random() * def.paths.length)
  return def.paths[index] ?? null
}

/**
 * Build a preload map for all events in a game's preset.
 * Returns { key: path } pairs where key is `<gameId>/<event>/<variantIndex>`.
 */
export function buildPreloadMap(gameId: GameId): Record<string, string> {
  const preset = gameSoundPresets[gameId]
  if (!preset) return {}

  const map: Record<string, string> = {}
  for (const event of preset.events) {
    const def = soundEventMap[event]
    if (!def) continue
    for (let i = 0; i < def.paths.length; i++) {
      map[`${gameId}/${event}/${i}`] = def.paths[i]!
    }
  }
  return map
}

/**
 * Build a preload map for ALL games (useful for full asset preloading).
 */
export function buildFullPreloadMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const gameId of Object.keys(gameSoundPresets) as GameId[]) {
    Object.assign(map, buildPreloadMap(gameId))
  }
  return map
}
