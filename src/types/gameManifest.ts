export const GAME_IDS = [
  'survivor',
  'breakout',
  'tetris',
  'snake',
  'game2048',
  'flappy',
  'invaders',
  'fruit-catch',
  'tower-defense',
  'tic-tac-toe',
  'memory',
  'sudoku',
] as const

export type GameId = (typeof GAME_IDS)[number]
export type GameInputMode = 'touch' | 'keyboard' | 'mouse'

export interface GameRouteIdentity {
  param: 'id'
  infoRouteName: 'game-info'
  playRouteName: 'game-play'
  resultRouteName: 'game-result'
  basePath: `/game/${string}`
}

export interface GameAssetRefs {
  thumbnail: string
  icon?: string
  audio?: {
    bgm?: string
    sfx?: string[]
  }
}

export interface GameCapabilityFlags {
  hasAudio: boolean
  hasUpgrades: boolean
  hasLeaderboard: boolean
  supportsPause: boolean
  supportsSave: boolean
  hasResultStats: boolean
}

export interface GamePersistenceHooks {
  scoreEntity: 'scores'
  supportsRunSnapshot: boolean
  saveTrigger: 'none' | 'manual' | 'auto'
}

export interface ResultPayloadField {
  key: 'score' | 'kills' | 'time' | 'level' | 'coins'
  label: string
  defaultValue: number
}

export interface GameFactoryResolution {
  modulePath: string
  exportName: string
  load: () => Promise<Record<string, unknown>>
}

export interface AdapterLifecycleRule {
  required: boolean
  contract: string
}

export interface GameAdapterLifecycleRules {
  start: AdapterLifecycleRule
  pause: AdapterLifecycleRule
  resume: AdapterLifecycleRule
  stop: AdapterLifecycleRule
  resize: AdapterLifecycleRule
  result: AdapterLifecycleRule
  reward: AdapterLifecycleRule
  save: AdapterLifecycleRule
}

export interface CanonicalGameManifest {
  gameId: GameId
  title: string
  route: GameRouteIdentity
  assets: GameAssetRefs
  capabilities: GameCapabilityFlags
  inputModes: GameInputMode[]
  persistence: GamePersistenceHooks
  resultFields: ResultPayloadField[]
  adapter: {
    factory: GameFactoryResolution
    lifecycle: GameAdapterLifecycleRules
  }
}

export interface GameFactoryModule extends Record<string, unknown> {
  default?: () => {
    start: (canvas: HTMLCanvasElement, callbacks: unknown) => void
    stop: () => void
    pause: () => void
    resume: () => void
    resize: (width: number, height: number) => void
  }
}
