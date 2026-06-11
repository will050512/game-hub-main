/**
 * Kenney PNG Sprite Loader
 *
 * Loads Kenney pixel art PNGs (individual sprites and tilesheets) and draws
 * them onto CanvasRenderingContext2D via ctx.drawImage().
 *
 * Integration strategy:
 *   - preloadKenneySprites('invaders') loads PNGs into a global cache
 *   - drawKenneySprite(ctx, id, opts) draws a cached PNG sprite
 *   - Games call drawKenneySprite() before drawSprite() for fallback
 */

import type { DrawSpriteOptions } from './spriteLoader'

/* ------------------------------------------------------------------ */
/*  Type definitions                                                   */
/* ------------------------------------------------------------------ */

/** A preloaded PNG sprite backed by an HTMLImageElement. */
interface PngSprite {
  image: HTMLImageElement
  designWidth: number
  designHeight: number
  pivot: 'center' | 'top-left' | 'top-center' | 'bottom-center'
}

/** A single tile extracted from a tilesheet image. */
interface TilesheetTile {
  x: number
  y: number
  width: number
  height: number
}

/** Metadata for a Kenney tilesheet image. */
interface TilesheetMeta {
  tileWidth: number
  tileHeight: number
  spacingX: number
  spacingY: number
  columns: number
  rows: number
}

/* ------------------------------------------------------------------ */
/*  Tilesheet definitions                                              */
/* ------------------------------------------------------------------ */

const SHMUP_SHIPS_TILESET: TilesheetMeta = {
  tileWidth: 32,
  tileHeight: 32,
  spacingX: 1,
  spacingY: 1,
  columns: 4,
  rows: 6,
}

const SHMUP_TILES_TILESET: TilesheetMeta = {
  tileWidth: 16,
  tileHeight: 16,
  spacingX: 1,
  spacingY: 1,
  columns: 12,
  rows: 10,
}

const PLATFORMER_TILES_TILESET: TilesheetMeta = {
  tileWidth: 18,
  tileHeight: 18,
  spacingX: 1,
  spacingY: 1,
  columns: 20,
  rows: 9,
}

const PLATFORMER_CHARACTERS_TILESET: TilesheetMeta = {
  tileWidth: 24,
  tileHeight: 24,
  spacingX: 1,
  spacingY: 1,
  columns: 9,
  rows: 3,
}

const PLATFORMER_BACKGROUNDS_TILESET: TilesheetMeta = {
  tileWidth: 256,
  tileHeight: 256,
  spacingX: 0,
  spacingY: 0,
  columns: 4,
  rows: 2,
}

const PARTICLE_CIRCLE_01: TilesheetMeta = {
  tileWidth: 16,
  tileHeight: 16,
  spacingX: 0,
  spacingY: 0,
  columns: 1,
  rows: 1,
}

/** Platformer-blocks individual tile files (32×32 each, flat directory). */
const PLATFORMER_BLOCKS_INDIVIDUAL: TilesheetMeta = {
  tileWidth: 32,
  tileHeight: 32,
  spacingX: 0,
  spacingY: 0,
  columns: 1,
  rows: 1,
}

/** Platformer-food individual tile files (32×32 each, flat directory). */
const PLATFORMER_FOOD_INDIVIDUAL: TilesheetMeta = {
  tileWidth: 32,
  tileHeight: 32,
  spacingX: 0,
  spacingY: 0,
  columns: 1,
  rows: 1,
}

/** Platformer individual tile files (32×32 each, flat directory). */
const PLATFORMER_INDIVIDUAL: TilesheetMeta = {
  tileWidth: 32,
  tileHeight: 32,
  spacingX: 0,
  spacingY: 0,
  columns: 1,
  rows: 1,
}

/** Particles individual files (16×16 each, flat directory). */
const PARTICLE_INDIVIDUAL: TilesheetMeta = {
  tileWidth: 16,
  tileHeight: 16,
  spacingX: 0,
  spacingY: 0,
  columns: 1,
  rows: 1,
}

/* ------------------------------------------------------------------ */
/*  Kenney asset path helpers                                          */
/* ------------------------------------------------------------------ */

function kenneyPath(pkg: string, rel: string): string {
  return `素材/${pkg}/${rel}`
}

/** Resolve a sprite source path: use absolute paths as-is, otherwise prepend kenney package prefix. */
function resolveSpriteUrl(pkg: string, imgRel: string): string {
  if (imgRel.startsWith('/') || imgRel.startsWith('http')) {
    return imgRel
  }
  return kenneyPath(pkg, imgRel)
}

/* ------------------------------------------------------------------ */
/*  Sprite ID → PNG source mapping                                     */
/* ------------------------------------------------------------------ */

type SpriteSource =
  | { type: 'tilesheet'; pkg: string; imgRel: string; meta: TilesheetMeta; tileIndex: number }
  | { type: 'png'; pkg: string; imgRel: string; width: number; height: number }

interface SpriteIdMapEntry {
  source: SpriteSource
  pivot: 'center' | 'top-left' | 'top-center' | 'bottom-center'
  /** Optional tile source rect (for trimmed sprites). If omitted, uses full tile. */
  sourceRect?: { x: number; y: number; width: number; height: number }
}

/** Maps logical sprite IDs to their Kenney PNG source. */
const spriteIdMap: Record<string, SpriteIdMapEntry> = {
  // ===== INVADERS =====
  'invaders.player': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 6, // player ship
    },
    pivot: 'center',
  },
  'invaders.alien-squid': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 4, // squid-like enemy
    },
    pivot: 'center',
  },
  'invaders.alien-crab': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 10, // crab-like enemy
    },
    pivot: 'center',
  },
  'invaders.alien-octopus': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 14, // octopus-like enemy
    },
    pivot: 'center',
  },
  'invaders.bullet-player': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 1, // green projectile
    },
    pivot: 'center',
  },
  'invaders.bullet-alien': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 5, // red projectile
    },
    pivot: 'center',
  },
  'invaders.shield-block': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 8, // shield block
    },
    pivot: 'top-left',
  },
  'invaders.missile': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 3, // missile / rocket
    },
    pivot: 'center',
  },
  'invaders.explosion': {
    source: {
      type: 'png',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Ships/explosion.png',
      width: 64,
      height: 64,
    },
    pivot: 'center',
  },

  // ===== FLAPPY =====
  'flappy.bird': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer',
      imgRel: 'Tiles/Characters/characters-stand.png',
      meta: PLATFORMER_CHARACTERS_TILESET,
      tileIndex: 0, // character stand frame 0
    },
    pivot: 'center',
  },
  'flappy.pipe-body': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 20, // pipe / obstacle
    },
    pivot: 'top-left',
  },
  'flappy.pipe-cap': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 21, // pipe cap
    },
    pivot: 'top-left',
  },
  'flappy.ground': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer',
      imgRel: 'Tiles/tile_0000.png',
      meta: PLATFORMER_TILES_TILESET,
      tileIndex: 0, // ground tile
    },
    pivot: 'top-left',
  },
  'flappy.cloud': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 22, // cloud tile
    },
    pivot: 'center',
  },
  'flappy.ring': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-shmup',
      imgRel: 'Tiles/tile_0000.png',
      meta: SHMUP_TILES_TILESET,
      tileIndex: 23, // ring / collectible
    },
    pivot: 'center',
  },

  // ===== BREAKOUT =====
  'breakout.ball': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-particles',
      imgRel: 'transparent/circle_01.png',
      meta: PARTICLE_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'breakout.paddle': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer',
      imgRel: 'tile_0000.png',
      meta: PLATFORMER_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'breakout.brick-red': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0000.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.brick-blue': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0001.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.brick-green': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0002.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.brick-yellow': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0003.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.brick-purple': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0004.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.brick-cyan': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0005.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.brick-orange': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0006.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'breakout.particle': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-particles',
      imgRel: 'transparent/spark_01.png',
      meta: PARTICLE_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'breakout.laser': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-particles',
      imgRel: 'transparent/flame_01.png',
      meta: PARTICLE_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'breakout.powerup': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-food',
      imgRel: 'tile_0000.png',
      meta: PLATFORMER_FOOD_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },

  // ===== SNAKE =====
  'snake.head': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer',
      imgRel: 'Characters/tile_0000.png',
      meta: PLATFORMER_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'snake.body': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer',
      imgRel: 'tile_0000.png',
      meta: PLATFORMER_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'snake.apple': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-food',
      imgRel: 'tile_0000.png',
      meta: PLATFORMER_FOOD_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'snake.golden-apple': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-food',
      imgRel: 'tile_0010.png',
      meta: PLATFORMER_FOOD_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'snake.special-food': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-food',
      imgRel: 'tile_0005.png',
      meta: PLATFORMER_FOOD_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },
  'snake.portal': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-particles',
      imgRel: 'transparent/magic_01.png',
      meta: PARTICLE_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },

  // ===== TETRIS =====
  'tetris.block-I': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0000.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.block-O': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0001.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.block-T': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0002.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.block-S': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0003.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.block-Z': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0004.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.block-J': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0005.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.block-L': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0006.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.grid-bg': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-platformer-blocks',
      imgRel: 'tile_0007.png',
      meta: PLATFORMER_BLOCKS_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'top-left',
  },
  'tetris.line-clear': {
    source: {
      type: 'tilesheet',
      pkg: 'kenney_pixel-particles',
      imgRel: 'transparent/star_01.png',
      meta: PARTICLE_INDIVIDUAL,
      tileIndex: 0,
    },
    pivot: 'center',
  },

  // ===== FRUIT-CATCH =====
  'fruit-catch.apple': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0056.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.orange': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0068.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.grape': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0080.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.watermelon': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0052.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.star': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0108.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.bomb': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0096.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.golden': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/platformer-food/tile_0104.png', width: 32, height: 32 },
    pivot: 'center',
  },
  'fruit-catch.basket': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-icons/Black/1x/basket.png', width: 32, height: 32 },
    pivot: 'bottom-center',
  },

  // ===== 2048 =====
  '2048.tile-2': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Grey/Default/button_square_gradient.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-4': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Blue/Default/button_square_gradient.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-8': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Red/Default/button_square_gradient.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-16': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Blue/Default/button_square_gloss.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-32': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Green/Default/button_square_gradient.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-64': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Red/Default/button_square_gloss.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-128': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Yellow/Default/button_square_gradient.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-256': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Yellow/Default/button_square_gloss.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-512': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Green/Default/button_square_gloss.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-1024': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Blue/Default/button_square_flat.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
  '2048.tile-2048': {
    source: { type: 'png', pkg: '', imgRel: '/assets/sprites/ui-pack/Red/Default/button_square_flat.png', width: 32, height: 32 },
    pivot: 'top-left',
  },
}

/* ------------------------------------------------------------------ */
/*  Cache                                                              */
/* ------------------------------------------------------------------ */

/** Cache of preloaded PNG sprites keyed by sprite ID. */
const pngCache = new Map<string, PngSprite>()

/** Cache of raw tilesheet images keyed by resolved URL. */
const tilesheetCache = new Map<string, HTMLImageElement>()

/** In-flight loads to prevent duplicate requests. */
const inflightLoads = new Map<string, Promise<HTMLImageElement>>()

/* ------------------------------------------------------------------ */
/*  Core functions                                                     */
/* ------------------------------------------------------------------ */

function getTileCoords(meta: TilesheetMeta, index: number): TilesheetTile {
  const col = index % meta.columns
  const row = Math.floor(index / meta.columns)
  const x = col * (meta.tileWidth + meta.spacingX)
  const y = row * (meta.tileHeight + meta.spacingY)
  return { x, y, width: meta.tileWidth, height: meta.tileHeight }
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const cached = tilesheetCache.get(url)
  if (cached) return cached

  const existing = inflightLoads.get(url)
  if (existing) {
    await existing
    return tilesheetCache.get(url) ?? (undefined as unknown as HTMLImageElement)
  }

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`)
      return res.blob()
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob)
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          tilesheetCache.set(url, img)
          resolve(img)
        }
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          reject(new Error(`Failed to decode image: ${url}`))
        }
        img.src = objectUrl
      })
    })
    .finally(() => inflightLoads.delete(url))

  inflightLoads.set(url, promise)
  return promise
}

/**
 * Preload all Kenney PNG sprites for a given game.
 * Call from game init() before first render.
 */
export async function preloadKenneySprites(gameId: string): Promise<void> {
  const promises: Promise<void>[] = []

  for (const [id, entry] of Object.entries(spriteIdMap)) {
    if (!id.startsWith(gameId + '.')) continue

    const cached = pngCache.get(id)
    if (cached) continue

    const promise = (async () => {
      const { source, pivot } = entry

      let image: HTMLImageElement
      let designWidth: number
      let designHeight: number

      if (source.type === 'png') {
        const url = resolveSpriteUrl(source.pkg, source.imgRel)
        image = await loadImage(url)
        designWidth = source.width
        designHeight = source.height
      } else {
        const url = resolveSpriteUrl(source.pkg, source.imgRel)
        image = await loadImage(url)
        const tile = getTileCoords(source.meta, source.tileIndex)
        designWidth = tile.width
        designHeight = tile.height
      }

      pngCache.set(id, { image, designWidth, designHeight, pivot })
    })().catch((err) => {
      console.warn(`[kenneySpriteLoader] failed to preload "${id}":`, err)
    })

    promises.push(promise)
  }

  await Promise.all(promises)
}

/** Synchronous lookup; returns null if not yet preloaded. */
export function getKenneySprite(id: string): PngSprite | null {
  return pngCache.get(id) ?? null
}

/**
 * Draw a Kenney PNG sprite at logical coordinates.
 * Returns true if the sprite was drawn, false if not loaded.
 */
export function drawKenneySprite(
  ctx: CanvasRenderingContext2D,
  id: string,
  opts: DrawSpriteOptions,
): boolean {
  const sprite = pngCache.get(id)
  if (!sprite) return false

  const entry = spriteIdMap[id]
  if (!entry) return false

  const { source, pivot: spritePivot } = entry

  const sx = opts.scaleX ?? opts.scale ?? 1
  const sy = opts.scaleY ?? opts.scale ?? 1
  const dw = sprite.designWidth * sx
  const dh = sprite.designHeight * sy

  let ox = 0
  let oy = 0
  const p = spritePivot ?? sprite.pivot
  switch (p) {
    case 'top-left':
      break
    case 'top-center':
      ox = sprite.designWidth / 2
      oy = 0
      break
    case 'bottom-center':
      ox = sprite.designWidth / 2
      oy = sprite.designHeight
      break
    case 'center':
    default:
      ox = sprite.designWidth / 2
      oy = sprite.designHeight / 2
      break
  }

  ctx.save()
  ctx.imageSmoothingEnabled = false
  if (opts.alpha !== undefined && opts.alpha !== 1) ctx.globalAlpha = opts.alpha
  ctx.translate(opts.x, opts.y)
  if (opts.rotation) ctx.rotate(opts.rotation)
  if (opts.flipX) {
    ctx.translate(dw, 0)
    ctx.scale(-1, 1)
  }

  if (source.type === 'png') {
    ctx.drawImage(
      sprite.image,
      -ox * sx,
      -oy * sy,
      dw,
      dh,
    )
  } else {
    const tile = getTileCoords(source.meta, source.tileIndex)
    const srcRect = entry.sourceRect ?? tile
    ctx.drawImage(
      sprite.image,
      srcRect.x,
      srcRect.y,
      srcRect.width,
      srcRect.height,
      -ox * sx,
      -oy * sy,
      dw,
      dh,
    )
  }

  ctx.restore()
  return true
}

/** Clear all cached images. */
export function clearKenneyCache(): void {
  pngCache.clear()
  tilesheetCache.clear()
}

/** Get list of sprite IDs available for a game. */
export function listKenneySprites(gameId: string): string[] {
  return Object.keys(spriteIdMap).filter((id) => id.startsWith(gameId + '.'))
}
