/**
 * Game Asset Mapping
 *
 * Maps each game to its Kenney asset sources within public/assets/.
 * All paths are relative to the served root (i.e. `/assets/...`).
 */

import type { GameId } from '@/types'

/* ------------------------------------------------------------------ */
/*  Type definitions                                                  */
/* ------------------------------------------------------------------ */

/** Sound effect mapping: logical name -> asset path */
export interface SfxMap {
  [key: string]: string
}

/** Audio asset grouping for a game */
export interface GameAudio {
  sfx: SfxMap
  music: string
}

/** Sprite / image asset mapping for a game */
export interface GameSpriteMapping {
  characters: Record<string, string>
  enemies: Record<string, string>
  items: Record<string, string>
  background: string
}

/** Full asset mapping for one game */
export interface GameAssetMapping {
  gameId: GameId
  sprites: GameSpriteMapping
  audio: GameAudio
  particles: string[]
  font: string
}

/* ------------------------------------------------------------------ */
/*  Helper: asset path builder                                        */
/* ------------------------------------------------------------------ */

/** Build an absolute URL relative to the public/assets root. */
function asset(...segments: string[]): string {
  return '/assets/' + segments.filter(Boolean).join('/')
}

/* ------------------------------------------------------------------ */
/*  Per-game mappings                                                 */
/* ------------------------------------------------------------------ */

/**
 * survivor - 暗夜倖存者
 *
 * Dungeon tiles for environments, RPG/impact audio for combat.
 */
const survivorMapping: GameAssetMapping = {
  gameId: 'survivor',
  sprites: {
    characters: {
      player: asset('sprites/dungeon/tileset.png'),
    },
    enemies: {
      basic: asset('sprites/dungeon/tileset.png'),
      elite: asset('sprites/dungeon/tileset.png'),
      boss: asset('sprites/dungeon/tileset.png'),
    },
    items: {
      health: asset('sprites/dungeon/tileset.png'),
      weapon: asset('sprites/dungeon/tileset.png'),
      shield: asset('sprites/dungeon/tileset.png'),
    },
    background: asset('sprites/dungeon/tileset.png'),
  },
  audio: {
    sfx: {
      attack: asset('audio/impact/Hit Impacts 01.ogg'),
      hit: asset('audio/rpg/Melee Combat Hit 1.ogg'),
      levelUp: asset('audio/rpg/Item Pickup 1.ogg'),
      death: asset('audio/impact/Explosion Impacts 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/spark_01.png'),
    asset('sprites/particles/transparent/flame_01.png'),
    asset('sprites/particles/transparent/star_01.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * breakout - 打磚塊
 *
 * Platformer ball/paddle sprites, block tiles, digital impact sounds.
 */
const breakoutMapping: GameAssetMapping = {
  gameId: 'breakout',
  sprites: {
    characters: {
      ball: asset('sprites/platformer/tileset.png'),
      paddle: asset('sprites/platformer/tileset.png'),
    },
    enemies: {},
    items: {
      wide: asset('sprites/platformer-blocks/tileset.png'),
      multi: asset('sprites/platformer-blocks/tileset.png'),
      speed: asset('sprites/platformer-blocks/tileset.png'),
    },
    background: asset('sprites/platformer/tileset.png'),
  },
  audio: {
    sfx: {
      hit: asset('audio/digital/Retro Game Hits 01.ogg'),
      brickBreak: asset('audio/impact/Glass Sounds 01.ogg'),
      powerUp: asset('audio/digital/Retro Game Power-Up 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/spark_03.png'),
    asset('sprites/particles/transparent/light_01.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * tetris - 俄國方塊
 *
 * Platformer blocks for pieces, digital audio for UI.
 */
const tetrisMapping: GameAssetMapping = {
  gameId: 'tetris',
  sprites: {
    characters: {},
    enemies: {},
    items: {
      I: asset('sprites/platformer-blocks/tileset.png'),
      O: asset('sprites/platformer-blocks/tileset.png'),
      T: asset('sprites/platformer-blocks/tileset.png'),
      S: asset('sprites/platformer-blocks/tileset.png'),
      Z: asset('sprites/platformer-blocks/tileset.png'),
      J: asset('sprites/platformer-blocks/tileset.png'),
      L: asset('sprites/platformer-blocks/tileset.png'),
    },
    background: asset('sprites/platformer-blocks/tileset.png'),
  },
  audio: {
    sfx: {
      drop: asset('audio/digital/Retro Game Hits 01.ogg'),
      clear: asset('audio/digital/Retro Game Power-Up 01.ogg'),
      gameOver: asset('audio/digital/Retro Game Game Over 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/light_02.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * snake - 貪吃蛇
 *
 * Platformer tiles for snake body, food expansion pack, digital sounds.
 */
const snakeMapping: GameAssetMapping = {
  gameId: 'snake',
  sprites: {
    characters: {
      head: asset('sprites/platformer/tileset.png'),
      body: asset('sprites/platformer/tileset.png'),
    },
    enemies: {},
    items: {
      apple: asset('sprites/platformer-food/tileset.png'),
      banana: asset('sprites/platformer-food/tileset.png'),
      special: asset('sprites/platformer-food/tileset.png'),
    },
    background: asset('sprites/platformer/tileset.png'),
  },
  audio: {
    sfx: {
      eat: asset('audio/digital/Retro Game Hits 01.ogg'),
      death: asset('audio/digital/Retro Game Game Over 01.ogg'),
      special: asset('audio/digital/Retro Game Power-Up 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/star_01.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * game2048 - 2048
 *
 * UI pack tiles for number tiles, casino/digital sounds.
 */
const game2048Mapping: GameAssetMapping = {
  gameId: 'game2048',
  sprites: {
    characters: {},
    enemies: {},
    items: {
      tile_2: asset('sprites/ui-pack/Yellow/Default/ui.png'),
      tile_4: asset('sprites/ui-pack/Grey/Default/ui.png'),
      tile_8: asset('sprites/ui-pack/Red/Default/ui.png'),
      tile_16: asset('sprites/ui-pack/Blue/Default/ui.png'),
      tile_32: asset('sprites/ui-pack/Green/Default/ui.png'),
      tile_64: asset('sprites/ui-pack/Extra/Default/ui.png'),
    },
    background: asset('sprites/ui-pack/Grey/Default/ui.png'),
  },
  audio: {
    sfx: {
      merge: asset('audio/casino/Chip Click 1.ogg'),
      newTile: asset('audio/digital/Retro Game Hits 01.ogg'),
      win: asset('audio/digital/Retro Game Power-Up 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/light_01.png'),
    asset('sprites/particles/transparent/star_03.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * flappy - Flappy Bird
 *
 * Shmup birds, platformer pipes, scifi audio.
 */
const flappyMapping: GameAssetMapping = {
  gameId: 'flappy',
  sprites: {
    characters: {
      bird: asset('sprites/shmup/ships/player1.png'),
    },
    enemies: {},
    items: {
      pipe: asset('sprites/platformer/tileset.png'),
      coin: asset('sprites/ui-icons/White/1x/coins.png'),
    },
    background: asset('sprites/platformer/Backgrounds/background.png'),
  },
  audio: {
    sfx: {
      flap: asset('audio/scifi/Flying 02.ogg'),
      score: asset('audio/scifi/Laser Gun 01.ogg'),
      hit: asset('audio/scifi/Explosion 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/trace_01.png'),
  ],
  font: asset('fonts/Kenney Future.ttf'),
}

/**
 * invaders - 小蜜蜂
 *
 * Shmup ships for invaders and projectiles, scifi/digital audio.
 */
const invadersMapping: GameAssetMapping = {
  gameId: 'invaders',
  sprites: {
    characters: {
      player: asset('sprites/shmup/ships/player1.png'),
    },
    enemies: {
      row1: asset('sprites/shmup/ships/player2.png'),
      row2: asset('sprites/shmup/ships/player3.png'),
      row3: asset('sprites/shmup/ships/player4.png'),
    },
    items: {
      bullet: asset('sprites/shmup/tileset.png'),
      powerUp: asset('sprites/shmup/tileset.png'),
    },
    background: asset('sprites/shmup/tileset.png'),
  },
  audio: {
    sfx: {
      shoot: asset('audio/scifi/Laser Gun 01.ogg'),
      enemyShoot: asset('audio/scifi/Laser Gun 03.ogg'),
      enemyDeath: asset('audio/scifi/Explosion 01.ogg'),
      playerDeath: asset('audio/impact/Explosion Impacts 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/muzzle_01.png'),
    asset('sprites/particles/transparent/explosion_01.png'),
    asset('sprites/particles/transparent/spark_05.png'),
  ],
  font: asset('fonts/Kenney Future.ttf'),
}

/**
 * fruit-catch - 接水果
 *
 * Platformer food expansion for fruits, digital sounds.
 */
const fruitCatchMapping: GameAssetMapping = {
  gameId: 'fruit-catch',
  sprites: {
    characters: {
      basket: asset('sprites/ui-icons/White/1x/cup.png'),
    },
    enemies: {},
    items: {
      apple: asset('sprites/platformer-food/tileset.png'),
      banana: asset('sprites/platformer-food/tileset.png'),
      orange: asset('sprites/platformer-food/tileset.png'),
      bomb: asset('sprites/platformer-blocks/tileset.png'),
    },
    background: asset('sprites/platformer/Backgrounds/background.png'),
  },
  audio: {
    sfx: {
      catch: asset('audio/digital/Retro Game Hits 01.ogg'),
      miss: asset('audio/digital/Retro Game Game Over 01.ogg'),
      bomb: asset('audio/impact/Explosion Impacts 01.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/star_01.png'),
    asset('sprites/particles/transparent/circle_01.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * tower-defense - 塔防大戰
 *
 * Dungeon tiles for towers, monochrome RPG for enemies, RPG impact audio.
 */
const towerDefenseMapping: GameAssetMapping = {
  gameId: 'tower-defense',
  sprites: {
    characters: {
      archer: asset('sprites/dungeon/tileset.png'),
      mage: asset('sprites/dungeon/tileset.png'),
      cannon: asset('sprites/dungeon/tileset.png'),
    },
    enemies: {
      goblin: asset('sprites/rpg-monochrome/monochrome/Tiles/tile_0000.png'),
      orc: asset('sprites/rpg-monochrome/monochrome/Tiles/tile_0001.png'),
      boss: asset('sprites/rpg-monochrome/monochrome/Tiles/tile_0002.png'),
    },
    items: {
      upgrade: asset('sprites/dungeon/tileset.png'),
    },
    background: asset('sprites/dungeon/tileset.png'),
  },
  audio: {
    sfx: {
      shoot: asset('audio/rpg/Archery Attack 1.ogg'),
      explosion: asset('audio/impact/Explosion Impacts 01.ogg'),
      build: asset('audio/rpg/Item Pickup 1.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/muzzle_01.png'),
    asset('sprites/particles/transparent/flame_01.png'),
    asset('sprites/particles/transparent/magic_01.png'),
  ],
  font: asset('fonts/Kenney Blocks.ttf'),
}

/**
 * tic-tac-toe - 井字棋
 *
 * UI pack for board, casino audio for tile placement.
 */
const ticTacToeMapping: GameAssetMapping = {
  gameId: 'tic-tac-toe',
  sprites: {
    characters: {},
    enemies: {},
    items: {
      board: asset('sprites/ui-pack/Grey/Default/ui.png'),
      x: asset('sprites/ui-icons/White/1x/x.png'),
      o: asset('sprites/ui-icons/White/1x/circle.png'),
    },
    background: asset('sprites/ui-pack/Grey/Default/ui.png'),
  },
  audio: {
    sfx: {
      place: asset('audio/casino/Chip Click 1.ogg'),
      win: asset('audio/casino/Dice Throw 2.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [],
  font: asset('fonts/Kenney Mini Square.ttf'),
}

/**
 * memory - 記憶翻牌
 *
 * Casino UI for cards, casino/UI audio.
 */
const memoryMapping: GameAssetMapping = {
  gameId: 'memory',
  sprites: {
    characters: {},
    enemies: {},
    items: {
      card: asset('sprites/ui-pack/Grey/Default/ui.png'),
      cardBack: asset('sprites/ui-pack/Blue/Default/ui.png'),
    },
    background: asset('sprites/ui-pack/Grey/Default/ui.png'),
  },
  audio: {
    sfx: {
      flip: asset('audio/ui/Switches and Toggles 01.ogg'),
      match: asset('audio/casino/Dice Throw 2.ogg'),
      mismatch: asset('audio/ui/Button 31.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [
    asset('sprites/particles/transparent/star_03.png'),
  ],
  font: asset('fonts/Kenney Mini Square.ttf'),
}

/**
 * sudoku - 數獨
 *
 * UI pack for grid and numbers, UI/digital audio.
 */
const sudokuMapping: GameAssetMapping = {
  gameId: 'sudoku',
  sprites: {
    characters: {},
    enemies: {},
    items: {
      grid: asset('sprites/ui-pack/Grey/Default/ui.png'),
      highlight: asset('sprites/ui-pack/Yellow/Default/ui.png'),
    },
    background: asset('sprites/ui-pack/Grey/Default/ui.png'),
  },
  audio: {
    sfx: {
      select: asset('audio/ui/Button 31.ogg'),
      place: asset('audio/digital/Retro Game Hits 01.ogg'),
      error: asset('audio/ui/Button Error 1.ogg'),
    },
    music: asset('audio/music/8-Bit jingles/Hit_01.ogg'),
  },
  particles: [],
  font: asset('fonts/Kenney Mini Square.ttf'),
}

/* ------------------------------------------------------------------ */
/*  Registry                                                          */
/* ------------------------------------------------------------------ */

/** Complete asset mapping for all games. */
export const gameAssetMappings: Record<GameId, GameAssetMapping> = {
  survivor: survivorMapping,
  breakout: breakoutMapping,
  tetris: tetrisMapping,
  snake: snakeMapping,
  game2048: game2048Mapping,
  flappy: flappyMapping,
  invaders: invadersMapping,
  'fruit-catch': fruitCatchMapping,
  'tower-defense': towerDefenseMapping,
  'tic-tac-toe': ticTacToeMapping,
  memory: memoryMapping,
  sudoku: sudokuMapping,
}

/** Look up a game's asset mapping by GameId. */
export function getAssetMapping(gameId: GameId): GameAssetMapping {
  return gameAssetMappings[gameId]
}

/**
 * Check if an asset path exists in the public/assets directory.
 * Useful for lazy-loading and fallback handling.
 */
export function assetExists(path: string): boolean {
  return path.startsWith('/assets/')
}
