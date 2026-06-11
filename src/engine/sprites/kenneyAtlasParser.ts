/**
 * Kenney Atlas Parser
 *
 * Parses Kenney game asset metadata into structured SpriteFrame collections:
 *  - XML atlases  (TexturePacker format) — kenney_game-icons
 *  - TXT tilesheets — kenney_pixel-platformer, kenney_pixel-shmup, etc.
 *
 * Both formats are converted to a unified {@link SpriteFrame}[] so the
 * SpriteLoader can treat all Kenney assets identically.
 */
import type { SpriteFrame } from './spriteLoader'

/* ------------------------------------------------------------------ */
/*  Kenney XML Atlas (TexturePacker format)                           */
/* ------------------------------------------------------------------ */

export interface KenneyXmlAtlas {
  /**
   * Parsed sub-texture frames keyed by the sprite name
   * (e.g. `"arrowDown.png" -> SpriteFrame`).
   */
  frames: Record<string, SpriteFrame>
  /**
   * Relative path to the atlas image as declared in the XML
   * `imagePath` attribute on the root `<TextureAtlas>` element.
   */
  imagePath: string
  /** Total number of sub-textures in this atlas. */
  frameCount: number
}

/**
 * Parse Kenney XML atlas (TexturePacker format).
 *
 * XML structure:
 * ```xml
 * <TextureAtlas imagePath="sheet.png">
 *   <SubTexture name="arrowDown.png" x="50" y="50" width="50" height="50"/>
 *   ...
 * </TextureAtlas>
 * ```
 *
 * @param xml - Raw XML string from a `.xml` atlas file
 * @returns Structured atlas with frames and image path
 * @throws When XML is malformed or missing required elements
 */
export function parseKenneyXmlAtlas(xml: string): KenneyXmlAtlas {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`Failed to parse Kenney XML atlas: ${parseError.textContent ?? 'Unknown parse error'}`)
  }

  const atlas = doc.querySelector('TextureAtlas')
  if (!atlas) {
    throw new Error('Kenney XML atlas missing <TextureAtlas> root element')
  }

  const imagePath = atlas.getAttribute('imagePath')
  if (!imagePath) {
    throw new Error('Kenney XML atlas <TextureAtlas> missing imagePath attribute')
  }

  const frames: Record<string, SpriteFrame> = {}
  const subTextures = atlas.querySelectorAll('SubTexture')

  for (let i = 0; i < subTextures.length; i++) {
    const st = subTextures[i]
    if (!st) continue
    const name = st.getAttribute('name')
    if (!name) continue

    const x = Number.parseInt(st.getAttribute('x') ?? '0', 10)
    const y = Number.parseInt(st.getAttribute('y') ?? '0', 10)
    const width = Number.parseInt(st.getAttribute('width') ?? '0', 10)
    const height = Number.parseInt(st.getAttribute('height') ?? '0', 10)

    // Kenney XML atlases do not include rotation or trimming — all frames
    // are axis-aligned and full-size.
    frames[name] = {
      x,
      y,
      width,
      height,
      sourceX: x,
      sourceY: y,
      sourceWidth: width,
      sourceHeight: height,
      pivotX: 0,
      pivotY: 0,
    }
  }

  return { frames, imagePath, frameCount: Object.keys(frames).length }
}

/* ------------------------------------------------------------------ */
/*  Kenney TXT Tilesheet                                              */
/* ------------------------------------------------------------------ */

export interface KenneyTxtTilesheet {
  /** Pixel dimensions of each tile. */
  tileSize: { width: number; height: number }
  /** Pixel gap between adjacent tiles. */
  spacing: { horizontal: number; vertical: number }
  /** Number of tiles along the X axis. */
  columns: number
  /** Number of tiles along the Y axis. */
  rows: number
  /** Total tile count (columns × rows). */
  totalTiles: number
}

/**
 * Parse Kenney TXT tilesheet metadata.
 *
 * TXT structure:
 * ```
 * Tilesheet information:
 *
 * Tile size                 •  24px × 24px
 * Space between tiles       •  1px × 1px
 * ---
 * Total tiles (horizontal)  •  9 tiles
 * Total tiles (vertical)    •  3 tiles
 * ---
 * Total tiles in sheet      •  27 tiles
 * ```
 *
 * @param text - Raw text content of a `.txt` tilesheet file
 * @returns Structured tilesheet metadata
 * @throws When the TXT format is unrecognized
 */
export function parseKenneyTxtTilesheet(text: string): KenneyTxtTilesheet {
  const tileSizeMatch = text.match(/Tile size\s+•\s+(\d+)px\s*×\s*(\d+)px/)
  const spacingMatch = text.match(/Space between tiles\s+•\s+(\d+)px\s*×\s*(\d+)px/)
  const colsMatch = text.match(/Total tiles \(horizontal\)\s+•\s+(\d+)\s+tiles?/)
  const rowsMatch = text.match(/Total tiles \(vertical\)\s+•\s+(\d+)\s+tiles?/)
  const totalMatch = text.match(/Total tiles in sheet\s+•\s+(\d+)\s+tiles?/)

  if (!tileSizeMatch || !colsMatch || !rowsMatch) {
    throw new Error('Invalid Kenney TXT tilesheet format')
  }

  const tileSize = {
    width: Number.parseInt(tileSizeMatch[1] ?? '0', 10),
    height: Number.parseInt(tileSizeMatch[2] ?? '0', 10),
  }
  const spacing = {
    horizontal: spacingMatch ? Number.parseInt(spacingMatch[1] ?? '0', 10) : 0,
    vertical: spacingMatch ? Number.parseInt(spacingMatch[2] ?? '0', 10) : 0,
  }
  const columns = Number.parseInt(colsMatch[1] ?? '0', 10)
  const rows = Number.parseInt(rowsMatch[1] ?? '0', 10)
  const totalTiles = totalMatch ? Number.parseInt(totalMatch[1] ?? '0', 10) : columns * rows

  return { tileSize, spacing, columns, rows, totalTiles }
}

/**
 * Generate uniform SpriteFrames from Kenney TXT tilesheet metadata.
 *
 * Produces a contiguous grid of equally-sized frames with 1px spacing
 * as is standard for Kenney pixel art tilesheets.
 *
 * @param metadata - Parsed tilesheet metadata from `parseKenneyTxtTilesheet`
 * @returns Array of SpriteFrames indexed by tile index (row-major order)
 */
export function generateFramesFromTilesheet(metadata: KenneyTxtTilesheet): SpriteFrame[] {
  const { tileSize, spacing, columns, rows } = metadata
  const frames: SpriteFrame[] = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col
      const x = col * (tileSize.width + spacing.horizontal)
      const y = row * (tileSize.height + spacing.vertical)

      frames.push({
        x,
        y,
        width: tileSize.width,
        height: tileSize.height,
        sourceX: x,
        sourceY: y,
        sourceWidth: tileSize.width,
        sourceHeight: tileSize.height,
        pivotX: 0,
        pivotY: 0,
      })
    }
  }

  return frames
}

/**
 * Load a Kenney XML atlas from a URL and parse it.
 *
 * @param url - URL pointing to the `.xml` atlas file
 * @returns Resolved atlas with frames, image path, and frame count
 */
export async function loadKenneyXmlAtlas(url: string): Promise<KenneyXmlAtlas> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load Kenney XML atlas: ${url} (${response.status} ${response.statusText})`)
  }
  const text = await response.text()
  return parseKenneyXmlAtlas(text)
}

/**
 * Load a Kenney TXT tilesheet from a URL and parse it.
 *
 * @param url - URL pointing to the `.txt` tilesheet metadata file
 * @returns Resolved tilesheet metadata
 */
export async function loadKenneyTxtTilesheet(url: string): Promise<KenneyTxtTilesheet> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load Kenney TXT tilesheet: ${url} (${response.status} ${response.statusText})`)
  }
  const text = await response.text()
  return parseKenneyTxtTilesheet(text)
}
