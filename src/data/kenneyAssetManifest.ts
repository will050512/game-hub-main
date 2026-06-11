/**
 * Kenney Asset Manifest
 *
 * Declarative mapping of all 17 Kenney asset packages in the 素材/ directory.
 * Each entry includes the package name, asset type, and file paths relative
 * to the package root.
 */

/* ------------------------------------------------------------------ */
/*  Type definitions                                                  */
/* ------------------------------------------------------------------ */

/** The category of a Kenney asset package. */
export type KenneyPackageType = 'spritesheet' | 'tilesheet' | 'particles' | 'icons' | 'audio' | 'fonts'

/** File entry within a Kenney package. */
export interface KenneyFileEntry {
  /** Relative path within the package directory. */
  path: string
  /** File type. */
  type: 'png' | 'xml' | 'txt' | 'svg' | 'ogg' | 'wav' | 'mp3' | 'ttf' | 'otf'
  /** Role of this file in the package. */
  role: 'image' | 'metadata' | 'audio' | 'font' | 'license' | 'preview'
}

/** A complete Kenney asset package. */
export interface KenneyPackage {
  /** Package identifier (matches directory name). */
  id: string
  /** Human-readable name. */
  name: string
  /** Package category. */
  type: KenneyPackageType
  /** All files in this package. */
  files: KenneyFileEntry[]
  /** Tilesheet metadata if applicable (parsed from .txt file). */
  tilesheetInfo?: {
    tileWidth: number
    tileHeight: number
    spacingX: number
    spacingY: number
    columns: number
    rows: number
    totalTiles: number
  }
}

/* ------------------------------------------------------------------ */
/*  Visual asset packages                                             */
/* ------------------------------------------------------------------ */

export const kenneyGameIcons: KenneyPackage = {
  id: 'kenney_game-icons',
  name: 'Game Icons',
  type: 'spritesheet',
  files: [
    { path: 'Spritesheet/sheet_black1x.png', type: 'png', role: 'image' },
    { path: 'Spritesheet/sheet_black1x.xml', type: 'xml', role: 'metadata' },
    { path: 'Spritesheet/sheet_black2x.png', type: 'png', role: 'image' },
    { path: 'Spritesheet/sheet_black2x.xml', type: 'xml', role: 'metadata' },
    { path: 'Spritesheet/sheet_white1x.png', type: 'png', role: 'image' },
    { path: 'Spritesheet/sheet_white1x.xml', type: 'xml', role: 'metadata' },
    { path: 'Spritesheet/sheet_white2x.png', type: 'png', role: 'image' },
    { path: 'Spritesheet/sheet_white2x.xml', type: 'xml', role: 'metadata' },
    { path: 'PNG/game_icons.png', type: 'png', role: 'image' },
    { path: 'Vector/game_icons.svg', type: 'svg', role: 'image' },
  ],
}

export const kenneyPixelPlatformer: KenneyPackage = {
  id: 'kenney_pixel-platformer',
  name: 'Pixel Platformer',
  type: 'tilesheet',
  files: [
    { path: 'Tilesheet (Characters).txt', type: 'txt', role: 'metadata' },
    { path: 'Tilesheet (Tiles).txt', type: 'txt', role: 'metadata' },
    { path: 'Tilesheet (Backgrounds).txt', type: 'txt', role: 'metadata' },
    { path: 'Tiles/Characters/characters-run.png', type: 'png', role: 'image' },
    { path: 'Tiles/Characters/characters-jump.png', type: 'png', role: 'image' },
    { path: 'Tiles/Characters/characters-stand.png', type: 'png', role: 'image' },
    { path: 'Tiles/Characters/characters-death.png', type: 'png', role: 'image' },
    { path: 'Tiles/Characters/characters-fall.png', type: 'png', role: 'image' },
    { path: 'Tiles/Characters/characters-hit.png', type: 'png', role: 'image' },
    { path: 'Tiles/Backgrounds/background.png', type: 'png', role: 'image' },
    { path: 'Tiles/Tiles/tileset.png', type: 'png', role: 'image' },
  ],
  tilesheetInfo: {
    tileWidth: 24,
    tileHeight: 24,
    spacingX: 1,
    spacingY: 1,
    columns: 9,
    rows: 3,
    totalTiles: 27,
  },
}

export const kenneyPixelPlatformerBlocks: KenneyPackage = {
  id: 'kenney_pixel-platformer-blocks',
  name: 'Pixel Platformer Blocks',
  type: 'tilesheet',
  files: [
    { path: 'Tilesheet.txt', type: 'txt', role: 'metadata' },
    { path: 'Tiles/tileset.png', type: 'png', role: 'image' },
  ],
  tilesheetInfo: {
    tileWidth: 18,
    tileHeight: 18,
    spacingX: 1,
    spacingY: 1,
    columns: 9,
    rows: 9,
    totalTiles: 81,
  },
}

export const kenneyPixelPlatformerFoodExpansion: KenneyPackage = {
  id: 'kenney_pixel-platformer-food-expansion',
  name: 'Pixel Platformer Food Expansion',
  type: 'tilesheet',
  files: [
    { path: 'Tilesheet.txt', type: 'txt', role: 'metadata' },
    { path: 'Tiles/tileset.png', type: 'png', role: 'image' },
  ],
  tilesheetInfo: {
    tileWidth: 18,
    tileHeight: 18,
    spacingX: 1,
    spacingY: 1,
    columns: 16,
    rows: 7,
    totalTiles: 112,
  },
}

export const kenneyPixelShmup: KenneyPackage = {
  id: 'kenney_pixel-shmup',
  name: 'Pixel Shmup',
  type: 'tilesheet',
  files: [
    { path: 'Tilesheet (Ships).txt', type: 'txt', role: 'metadata' },
    { path: 'Tilesheet (Tiles).txt', type: 'txt', role: 'metadata' },
    { path: 'Ships/explosion.png', type: 'png', role: 'image' },
    { path: 'Ships/player1.png', type: 'png', role: 'image' },
    { path: 'Ships/player2.png', type: 'png', role: 'image' },
    { path: 'Ships/player3.png', type: 'png', role: 'image' },
    { path: 'Ships/player4.png', type: 'png', role: 'image' },
    { path: 'Ships/player5.png', type: 'png', role: 'image' },
    { path: 'Tiles/tileset.png', type: 'png', role: 'image' },
  ],
  tilesheetInfo: {
    tileWidth: 32,
    tileHeight: 32,
    spacingX: 1,
    spacingY: 1,
    columns: 4,
    rows: 6,
    totalTiles: 24,
  },
}

export const kenneyTinyDungeon: KenneyPackage = {
  id: 'kenney_tiny-dungeon',
  name: 'Tiny Dungeon',
  type: 'tilesheet',
  files: [
    { path: 'Tilesheet.txt', type: 'txt', role: 'metadata' },
    { path: 'Tiles/tileset.png', type: 'png', role: 'image' },
  ],
  tilesheetInfo: {
    tileWidth: 16,
    tileHeight: 16,
    spacingX: 1,
    spacingY: 1,
    columns: 12,
    rows: 11,
    totalTiles: 132,
  },
}

export const kenneyMonochromeRpg: KenneyPackage = {
  id: 'kenney_monochrome-rpg',
  name: 'Monochrome RPG',
  type: 'tilesheet',
  files: [
    { path: 'Default/Tilesheet.txt', type: 'txt', role: 'metadata' },
    { path: 'Dot Matrix/Tilesheet.txt', type: 'txt', role: 'metadata' },
    { path: 'Monochrome/Tilesheet.txt', type: 'txt', role: 'metadata' },
    { path: 'Default/Tiles/tileset.png', type: 'png', role: 'image' },
    { path: 'Dot Matrix/Tiles/tileset.png', type: 'png', role: 'image' },
    { path: 'Monochrome/Tiles/tileset.png', type: 'png', role: 'image' },
  ],
  tilesheetInfo: {
    tileWidth: 16,
    tileHeight: 16,
    spacingX: 1,
    spacingY: 1,
    columns: 17,
    rows: 8,
    totalTiles: 136,
  },
}

export const kenneyParticlePack: KenneyPackage = {
  id: 'kenney_particle-pack',
  name: 'Particle Pack',
  type: 'particles',
  files: [
    { path: 'PNG (Transparent)/circle_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/circle_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/circle_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/circle_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/circle_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/dirt_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/dirt_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/dirt_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/fire_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/fire_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flame_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flame_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flame_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flame_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flame_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flame_06.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/flare_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/light_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/light_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/light_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/magic_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/magic_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/magic_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/magic_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/magic_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/muzzle_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/muzzle_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/muzzle_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/muzzle_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/muzzle_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/scorch_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/scorch_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/scorch_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/scratch_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/slash_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/slash_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/slash_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/slash_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_06.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_07.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_08.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_09.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/smoke_10.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_06.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/spark_07.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_06.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_07.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_08.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/star_09.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/symbol_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/symbol_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_04.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_05.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_06.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/trace_07.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/twirl_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/twirl_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/twirl_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/window_01.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/window_02.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/window_03.png', type: 'png', role: 'image' },
    { path: 'PNG (Transparent)/window_04.png', type: 'png', role: 'image' },
  ],
}

export const kenneyUiPack: KenneyPackage = {
  id: 'kenney_ui-pack',
  name: 'UI Pack',
  type: 'icons',
  files: [
    { path: 'Sample.png', type: 'png', role: 'preview' },
    { path: 'PNG/Blue/Default/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Blue/Double/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Green/Default/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Green/Double/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Grey/Default/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Grey/Double/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Red/Default/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Red/Double/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Yellow/Default/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Yellow/Double/ui.png', type: 'png', role: 'image' },
    { path: 'PNG/Extra/extra.png', type: 'png', role: 'image' },
  ],
}

/* ------------------------------------------------------------------ */
/*  Audio-only packages (no visual assets)                            */
/* ------------------------------------------------------------------ */

export const kenneyAudioPackages: KenneyPackage[] = [
  {
    id: 'kenney_casino-audio',
    name: 'Casino Audio',
    type: 'audio',
    files: [],
  },
  {
    id: 'kenney_digital-audio',
    name: 'Digital Audio',
    type: 'audio',
    files: [],
  },
  {
    id: 'kenney_impact-sounds',
    name: 'Impact Sounds',
    type: 'audio',
    files: [],
  },
  {
    id: 'kenney_music-jingles',
    name: 'Music Jingles',
    type: 'audio',
    files: [],
  },
  {
    id: 'kenney_rpg-audio',
    name: 'RPG Audio',
    type: 'audio',
    files: [],
  },
  {
    id: 'kenney_sci-fi-sounds',
    name: 'Sci-Fi Sounds',
    type: 'audio',
    files: [],
  },
  {
    id: 'kenney_ui-audio',
    name: 'UI Audio',
    type: 'audio',
    files: [],
  },
]

/* ------------------------------------------------------------------ */
/*  Font packages                                                     */
/* ------------------------------------------------------------------ */

export const kenneyFonts: KenneyPackage = {
  id: 'kenney_kenney-fonts',
  name: 'Kenney Fonts',
  type: 'fonts',
  files: [],
}

/* ------------------------------------------------------------------ */
/*  Complete package registry                                         */
/* ------------------------------------------------------------------ */

/** All 17 Kenney asset packages. */
export const allKenneyPackages: KenneyPackage[] = [
  kenneyGameIcons,
  kenneyPixelPlatformer,
  kenneyPixelPlatformerBlocks,
  kenneyPixelPlatformerFoodExpansion,
  kenneyPixelShmup,
  kenneyTinyDungeon,
  kenneyMonochromeRpg,
  kenneyParticlePack,
  kenneyUiPack,
  ...kenneyAudioPackages,
  kenneyFonts,
]

/** Visual-only packages (spritesheets, tilesheets, particles, icons). */
export const visualKenneyPackages = allKenneyPackages.filter(
  (pkg) => pkg.type !== 'audio' && pkg.type !== 'fonts',
)

/** Audio-only packages. */
export const audioKenneyPackages = allKenneyPackages.filter(
  (pkg) => pkg.type === 'audio',
)

/** Find a package by its ID. */
export function getKenneyPackage(id: string): KenneyPackage | undefined {
  return allKenneyPackages.find((pkg) => pkg.id === id)
}

/** Get all image file paths for a package. */
export function getPackageImagePaths(pkg: KenneyPackage): string[] {
  return pkg.files.filter((f) => f.role === 'image').map((f) => f.path)
}

/** Base directory path for a Kenney package (relative to 素材/). */
export function getPackageBasePath(pkgId: string): string {
  return `素材/${pkgId}`
}

/** Full path to a file within a Kenney package. */
export function getPackageFilePath(pkgId: string, filePath: string): string {
  return `${getPackageBasePath(pkgId)}/${filePath}`
}
