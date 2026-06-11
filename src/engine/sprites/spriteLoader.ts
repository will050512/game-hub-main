/**
 * Sprite Loader — bakes inline-SVG Vue components into ImageBitmap caches.
 *
 * Strategy:
 *   1. The sprite manifest declares a logical id, a lazy-imported Vue SVG
 *      component, a design size, pivot, and a preload bucket ('core' | 'lazy').
 *   2. At app boot we preload the 'core' group (UI glyphs reused everywhere).
 *   3. When a game scene is about to start we preload its 'lazy' group.
 *   4. Each sprite is rendered to an offscreen <canvas> (matching dpr) by:
 *        a. Mounting the Vue component to a detached <div>.
 *        b. Reading the rendered <svg> as outerHTML.
 *        c. Wrapping it into a Blob URL and drawing through Image() onto
 *           an offscreen canvas at the configured size * dpr.
 *        d. Calling createImageBitmap() to obtain a GPU-friendly bitmap.
 *   5. Bitmaps are cached by `${id}@${dpr}` so different dpr screens get
 *      crisp art without re-baking every frame.
 *   6. drawSprite() hides pivot math and dpr scaling from game code.
 *
 * Tinting: the manifest `tintable` flag is informational. Components that
 * need runtime colour expose a `color` prop and read it via inline style on
 * fills. We re-bake the bitmap with a different cache key when tinting. */
import { createApp, h, type Component } from 'vue'
import {
  spriteManifest,
  spriteById,
  coreSprites,
  lazySpritesByGame,
  type SpriteEntry,
  type SpritePivot,
} from '@/components/art/manifest'

/* ================================================================== */
/*  Existing SVG-baked sprite loader API (must remain unchanged)      */
/* ================================================================== */

interface BakedSprite {
  bitmap: ImageBitmap
  /** Pixel size on screen (already accounts for dpr). */
  width: number
  height: number
  /** Design size in CSS pixels (dpr 1 reference). */
  designWidth: number
  designHeight: number
  pivot: SpritePivot
}

const cache = new Map<string, BakedSprite>()
const inflight = new Map<string, Promise<BakedSprite>>()

/** Primary key includes dpr and any tint variant so retina + colour variants coexist. */
function cacheKey(id: string, dpr: number, variant?: string): string {
  return variant ? `${id}@${dpr}@${variant}` : `${id}@${dpr}`
}

function clampDpr(): number {
  if (typeof window === 'undefined') return 1
  const raw = window.devicePixelRatio || 1
  // Cap to 3 — beyond that the gain is invisible and memory cost spikes.
  return Math.min(3, Math.max(1, Math.round(raw * 100) / 100))
}

/**
 * Render a Vue SVG component to an SVG string by mounting it to a detached node.
 * The component must render an <svg ...> root. */
async function renderComponentToSvgString(component: Component, props?: Record<string, unknown>): Promise<string> {
  if (typeof document === 'undefined') {
    throw new Error('spriteLoader requires a browser environment')
  }
  const host = document.createElement('div')
  host.style.cssText = 'position:absolute;left:-99999px;top:0;width:0;height:0;pointer-events:none;'
  document.body.appendChild(host)

  const app = createApp({ render: () => h(component, props ?? {}) })
  try {
    app.mount(host)
    const svg = host.querySelector('svg')
    if (!svg) {
      throw new Error('Sprite component must render <svg> as root')
    }
    // Ensure xmlns is present so Image() can decode the blob URL.
    if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    return new XMLSerializer().serializeToString(svg)
  } finally {
    app.unmount()
    host.remove()
  }
}

function svgStringToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err instanceof Error ? err : new Error('Failed to decode SVG sprite'))
    }
    img.src = url
  })
}

async function bakeOne(entry: SpriteEntry, dpr: number, props?: Record<string, unknown>, variant?: string): Promise<BakedSprite> {
  const mod = await entry.loader()
  const svg = await renderComponentToSvgString(mod.default, props)
  const img = await svgStringToImage(svg)

  const w = Math.max(1, Math.round(entry.size.w * dpr))
  const h = Math.max(1, Math.round(entry.size.h * dpr))
  const off = document.createElement('canvas')
  off.width = w
  off.height = h
  off.classList.add('pixelated')
  const ctx = off.getContext('2d')
  if (!ctx) throw new Error('No 2D context')
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, w, h)

  const bitmap = await createImageBitmap(off)
  const baked: BakedSprite = {
    bitmap,
    width: w,
    height: h,
    designWidth: entry.size.w,
    designHeight: entry.size.h,
    pivot: entry.pivot,
  }
  cache.set(cacheKey(entry.id, dpr, variant), baked)
  return baked
}

/** Preload a list of sprites in parallel; failures don't block the rest. */
async function preloadEntries(entries: SpriteEntry[]): Promise<void> {
  const dpr = clampDpr()
  const jobs: Array<{ entry: SpriteEntry; variant?: string; props?: Record<string, unknown> }> = []
  for (const entry of entries) {
    if (entry.variants) {
      for (const [variantKey, variantProps] of Object.entries(entry.variants)) {
        jobs.push({ entry, variant: variantKey, props: variantProps })
      }
    } else {
      jobs.push({ entry })
    }
  }
  await Promise.all(
    jobs.map(async ({ entry, variant, props }) => {
      const key = cacheKey(entry.id, dpr, variant)
      if (cache.has(key)) return
      const existing = inflight.get(key)
      if (existing) {
        await existing.catch(() => {})
        return
      }
      const promise = bakeOne(entry, dpr, props, variant).finally(() => inflight.delete(key))
      inflight.set(key, promise)
      try {
        await promise
      } catch (err) {
        console.warn(`[spriteLoader] failed to bake "${entry.id}${variant ? '@' + variant : ''}":`, err)
      }
    }),
  )
}

/** Stage 1: bake the core (UI) sprites. Call from app bootstrap. */
export function preloadCoreSprites(): Promise<void> {
  return preloadEntries(coreSprites)
}

/** Stage 2: bake one game's lazy sprites. Call from game scene init. */
export function preloadGameSprites(gameId: string): Promise<void> {
  return preloadEntries(lazySpritesByGame(gameId))
}

/** Bake a single sprite on demand (e.g. tinted variant). */
export async function getSprite(id: string, opts?: { variant?: string; props?: Record<string, unknown> }): Promise<BakedSprite> {
  const entry = spriteById[id]
  if (!entry) throw new Error(`Unknown sprite id: ${id}`)
  const dpr = clampDpr()
  const key = cacheKey(id, dpr, opts?.variant)
  const hit = cache.get(key)
  if (hit) return hit
  const inflightPromise = inflight.get(key)
  if (inflightPromise) return inflightPromise
  const promise = bakeOne(entry, dpr, opts?.props, opts?.variant).finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}

/** Synchronous lookup; returns null if not yet baked. Pair with preloadGameSprites at scene start. */
export function getSpriteSync(id: string, variant?: string): BakedSprite | null {
  return cache.get(cacheKey(id, clampDpr(), variant)) ?? null
}

/**
 * Draw a baked sprite at logical (CSS-pixel) coordinates with optional rotation/scale.
 * Coordinates are in design-pixel space; this function handles dpr internally. */
export interface DrawSpriteOptions {
  /** Logical position in design pixels. */
  x: number
  y: number
  /** Optional rotation in radians, applied around the sprite pivot. */
  rotation?: number
  /** Uniform scale (default 1). */
  scale?: number
  /** Per-axis scale (overrides `scale` when provided). */
  scaleX?: number
  scaleY?: number
  /** Override alpha (1 = opaque). */
  alpha?: number
  /** Tint variant key (must already be baked via getSprite). */
  variant?: string
  /** Mirror horizontally (e.g. flipped facing). */
  flipX?: boolean
}

export function drawSprite(ctx: CanvasRenderingContext2D, id: string, opts: DrawSpriteOptions): boolean {
  const sprite = getSpriteSync(id, opts.variant)
  if (!sprite) return false

  const sx = opts.scaleX ?? opts.scale ?? 1
  const sy = opts.scaleY ?? opts.scale ?? 1
  const dw = sprite.designWidth * sx * (opts.flipX ? -1 : 1)
  const dh = sprite.designHeight * sy

  let ox = 0
  let oy = 0
  switch (sprite.pivot) {
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
  // Draw with pivot offset; bitmap is in device pixels so we scale by 1/dpr.
  // Canvas users typically apply ctx.scale(dpr,dpr) once on resize, so the
  // CSS-pixel drawing API (this signature) just draws designWidth*designHeight.
  ctx.drawImage(sprite.bitmap, -ox * sx * (opts.flipX ? -1 : 1), -oy * sy, dw, dh)
  ctx.restore()
  return true
}

/** Diagnostic: list known sprite ids (handy for tests / debug overlays). */
export function listSprites(): string[] {
  return spriteManifest.map((s) => s.id)
}

/** Clear all cached bitmaps (e.g. on aggressive memory pressure). Will trigger re-bake. */
export function clearSpriteCache(): void {
  for (const baked of cache.values()) baked.bitmap.close?.()
  cache.clear()
}

/* ================================================================== */
/*  New: PNG-based SpriteLoader for game assets                       */
/* ================================================================== */

import {
  parseKenneyXmlAtlas,
  parseKenneyTxtTilesheet,
  generateFramesFromTilesheet,
  type KenneyXmlAtlas,
  type KenneyTxtTilesheet,
} from './kenneyAtlasParser'

/** A single frame extracted from a sprite sheet or atlas. */
export interface SpriteFrame {
  /** Horizontal position in the atlas image. */
  x: number
  /** Vertical position in the atlas image. */
  y: number
  /** Width of the frame. */
  width: number
  /** Height of the frame. */
  height: number
  /** Source rectangle X (usually same as x). */
  sourceX: number
  /** Source rectangle Y (usually same as y). */
  sourceY: number
  /** Source rectangle width (for trimmed sprites). */
  sourceWidth: number
  /** Source rectangle height (for trimmed sprites). */
  sourceHeight: number
  /** Pivot point X relative to frame origin. */
  pivotX: number
  /** Pivot point Y relative to frame origin. */
  pivotY: number
}

/** A complete sprite sheet with parsed frame data. */
export interface SpriteSheet {
  /** Named frames from XML atlas, or empty for uniform grids. */
  frames: Record<string, SpriteFrame>
  /** All frames as an array (for grid-based sheets). */
  frameList: SpriteFrame[]
  /** The loaded atlas image. */
  image: HTMLImageElement
  /** Base path for resolving relative image URLs. */
  basePath: string
}

/** Progress callback during batch preloading. */
export type LoadProgress = (loaded: number, total: number, key: string) => void

/** Configuration for the SpriteLoader. */
export interface SpriteLoaderOptions {
  /** Base URL prefix for asset paths (default: '/assets/'). */
  baseUrl?: string
  /** CORS attribute for cross-origin images (default: 'anonymous'). */
  crossOrigin?: string | null
}

/** Options for loading a uniform grid sprite sheet. */
export interface LoadGridOptions {
  /** Width of each tile in pixels. */
  tileWidth: number
  /** Height of each tile in pixels. */
  tileHeight: number
  /** Number of columns in the grid. */
  columns: number
  /** Number of rows in the grid. */
  rows: number
  /** Horizontal spacing between tiles (default: 0). */
  spacingX?: number
  /** Vertical spacing between tiles (default: 0). */
  spacingY?: number
  /** Optional margin around the entire sheet (default: 0). */
  margin?: number
  /** Frame name prefix (default: 'frame'). */
  namePrefix?: string
}

/** Options for loading a Kenney TXT tilesheet. */
export interface LoadTxtOptions {
  /** Path to the .txt metadata file (relative to baseUrl or absolute). */
  txtPath: string
  /** Path to the tilesheet PNG (relative to baseUrl or absolute). */
  imageRelativePath: string
  /** Optional frame name prefix (default: 'tile'). */
  namePrefix?: string
}

/** Options for loading a Kenney XML atlas. */
export interface LoadXmlOptions {
  /** Path to the .xml atlas file (relative to baseUrl or absolute). */
  xmlPath: string
  /** Optional override for the image path (relative to xml file location). */
  imageOverride?: string
}

export class SpriteLoader {
  /** Cache of loaded HTMLImageElement by resolved URL. */
  protected imageCache = new Map<string, HTMLImageElement>()
  /** In-flight image loads to prevent duplicate requests. */
  protected inflightLoads = new Map<string, Promise<HTMLImageElement>>()
  /** Loaded sprite sheets. */
  protected sheetCache = new Map<string, SpriteSheet>()
  /** Progress callback for batch operations. */
  protected progressCallback: LoadProgress | null = null

  public constructor(protected opts: SpriteLoaderOptions = {}) {}

  /** Resolve a possibly-relative path to an absolute URL. */
  protected resolvePath(path: string): string {
    if (path.startsWith('/') || path.startsWith('http')) return path
    const base = this.opts.baseUrl ?? '/assets/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    return `${normalizedBase}${path}`
  }

  /** Load a single PNG image. Results are cached. */
  public load(url: string): Promise<HTMLImageElement> {
    const resolved = this.resolvePath(url)
    const cached = this.imageCache.get(resolved)
    if (cached) return Promise.resolve(cached)

    const existing = this.inflightLoads.get(resolved)
    if (existing) return existing

    const promise = this.loadImage(resolved)
    this.inflightLoads.set(resolved, promise)
    return promise.finally(() => this.inflightLoads.delete(resolved))
  }

  /** Internal image loading with crossOrigin support. */
  protected loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      if (this.opts.crossOrigin !== undefined) {
        img.crossOrigin = this.opts.crossOrigin
      }
      img.onload = () => {
        this.imageCache.set(url, img)
        resolve(img)
        this.progressCallback?.(0, 0, url)
      }
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  /** Load a sprite sheet by manually specifying uniform grid parameters. */
  public async loadSheet(url: string, gridOpts: LoadGridOptions): Promise<SpriteSheet> {
    const img = await this.load(url)
    const frames: Record<string, SpriteFrame> = {}
    const frameList: SpriteFrame[] = []
    const spacingX = gridOpts.spacingX ?? 0
    const spacingY = gridOpts.spacingY ?? 0
    const margin = gridOpts.margin ?? 0
    const prefix = gridOpts.namePrefix ?? 'frame'

    for (let row = 0; row < gridOpts.rows; row++) {
      for (let col = 0; col < gridOpts.columns; col++) {
        const index = row * gridOpts.columns + col
        const x = margin + col * (gridOpts.tileWidth + spacingX)
        const y = margin + row * (gridOpts.tileHeight + spacingY)
        const frame: SpriteFrame = {
          x,
          y,
          width: gridOpts.tileWidth,
          height: gridOpts.tileHeight,
          sourceX: x,
          sourceY: y,
          sourceWidth: gridOpts.tileWidth,
          sourceHeight: gridOpts.tileHeight,
          pivotX: 0,
          pivotY: 0,
        }
        const name = `${prefix}_${String(index).padStart(4, '0')}`
        frames[name] = frame
        frameList.push(frame)
      }
    }

    const sheet = { frames, frameList, image: img, basePath: '' }
    this.sheetCache.set(url, sheet)
    return sheet
  }

  /** Load a Kenney XML atlas (TexturePacker format). */
  public async loadXmlAtlas(xmlPath: string, imageOverride?: string): Promise<SpriteSheet> {
    const response = await fetch(this.resolvePath(xmlPath))
    if (!response.ok) {
      throw new Error(`Failed to load Kenney XML atlas: ${xmlPath}`)
    }
    const text = await response.text()
    const atlas: KenneyXmlAtlas = parseKenneyXmlAtlas(text)

    let imageUrl = imageOverride ?? atlas.imagePath
    if (!imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
      const xmlDir = this.resolvePath(xmlPath)
      const dir = xmlDir.substring(0, xmlDir.lastIndexOf('/') + 1)
      imageUrl = dir + imageUrl
    }
    const img = await this.load(imageUrl)

    const frameList = Object.values(atlas.frames)
    const sheet = { frames: atlas.frames, frameList, image: img, basePath: '' }
    this.sheetCache.set(xmlPath, sheet)
    return sheet
  }

  /** Load a Kenney TXT tilesheet + image. */
  public async loadTxtSheet(opts: LoadTxtOptions): Promise<SpriteSheet> {
    const txtResponse = await fetch(this.resolvePath(opts.txtPath))
    if (!txtResponse.ok) {
      throw new Error(`Failed to load Kenney TXT tilesheet: ${opts.txtPath}`)
    }
    const txtText = await txtResponse.text()
    const metadata: KenneyTxtTilesheet = parseKenneyTxtTilesheet(txtText)

    let imagePath = opts.imageRelativePath
    if (!imagePath.startsWith('/') && !imagePath.startsWith('http')) {
      imagePath = this.resolvePath(imagePath)
    }
    const img = await this.load(imagePath)

    const frameList = generateFramesFromTilesheet(metadata)
    const prefix = opts.namePrefix ?? 'tile'
    const frames: Record<string, SpriteFrame> = {}
    frameList.forEach((frame, idx) => {
      const name = `${prefix}_${String(idx).padStart(4, '0')}`
      frames[name] = frame
    })

    const sheet = { frames, frameList, image: img, basePath: '' }
    this.sheetCache.set(opts.txtPath, sheet)
    return sheet
  }

  /** Get a cached image. */
  public get(url: string): HTMLImageElement | null {
    const resolved = this.resolvePath(url)
    return this.imageCache.get(resolved) ?? null
  }

  /** Get a cached sprite sheet. */
  public getSheet(key: string): SpriteSheet | null {
    return this.sheetCache.get(key) ?? null
  }

  /** Check if an image is cached. */
  public has(url: string): boolean {
    const resolved = this.resolvePath(url)
    return this.imageCache.has(resolved)
  }

  /** Preload multiple image URLs with optional progress callback. */
  public async preload(
    urls: string[],
    progress?: LoadProgress,
  ): Promise<HTMLImageElement[]> {
    this.progressCallback = progress ?? null
    const results: HTMLImageElement[] = []

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      if (!url) continue
      try {
        const img = await this.load(url)
        results.push(img)
        progress?.(i + 1, urls.length, url)
      } catch (err) {
        console.warn(`[SpriteLoader] Failed to preload ${url}:`, err)
        progress?.(i + 1, urls.length, url)
      }
    }

    this.progressCallback = null
    return results
  }

  /** Clear the image cache. */
  public clearCache(url?: string): void {
    if (url) {
      const resolved = this.resolvePath(url)
      this.imageCache.delete(resolved)
    } else {
      this.imageCache.clear()
      this.sheetCache.clear()
    }
  }

  /** Number of cached images. */
  public get cacheSize(): number {
    return this.imageCache.size
  }

  /** All cached image URLs. */
  public get cachedUrls(): string[] {
    return Array.from(this.imageCache.keys())
  }

  /** Draw a frame from a sprite sheet onto a canvas context. */
  public static drawFrame(
    ctx: CanvasRenderingContext2D,
    sheet: SpriteSheet,
    frameName: string,
    destX: number,
    destY: number,
    destWidth?: number,
    destHeight?: number,
  ): boolean {
    const frame = sheet.frames[frameName]
    if (!frame) return false

    const w = destWidth ?? frame.sourceWidth
    const h = destHeight ?? frame.sourceHeight
    ctx.drawImage(
      sheet.image,
      frame.sourceX,
      frame.sourceY,
      frame.sourceWidth,
      frame.sourceHeight,
      destX,
      destY,
      w,
      h,
    )
    return true
  }

  /** Draw a frame by index from a sprite sheet. */
  public static drawFrameByIndex(
    ctx: CanvasRenderingContext2D,
    sheet: SpriteSheet,
    frameIndex: number,
    destX: number,
    destY: number,
    destWidth?: number,
    destHeight?: number,
  ): boolean {
    const frame = sheet.frameList[frameIndex]
    if (!frame) return false

    const w = destWidth ?? frame.sourceWidth
    const h = destHeight ?? frame.sourceHeight
    ctx.drawImage(
      sheet.image,
      frame.sourceX,
      frame.sourceY,
      frame.sourceWidth,
      frame.sourceHeight,
      destX,
      destY,
      w,
      h,
    )
    return true
  }
}

/* ================================================================== */
/*  Animation Player                                                  */
/* ================================================================== */

/** Configuration for a sprite animation. */
export interface SpriteAnimationOptions {
  /** Frames to play in sequence. */
  frames: string[]
  /** Frames per second (default: 12). */
  fps?: number
  /** Loop back to start (default: true). */
  loop?: boolean
}

/** Current frame information during playback. */
export interface AnimationFrameInfo {
  /** Name of the current frame. */
  name: string
  /** Index in the animation sequence. */
  index: number
  /** Total number of frames in the sequence. */
  total: number
}

/** Plays a sequence of frames from a SpriteSheet at a given framerate. */
export class SpriteAnimation {
  protected currentTime = 0
  protected _frameIndex = 0

  public constructor(protected sheet: SpriteSheet, protected opts: Required<SpriteAnimationOptions>) {
    this.opts = { fps: opts.fps ?? 12, loop: opts.loop ?? true, frames: opts.frames }
  }

  /** Advance animation by the given delta time in milliseconds. */
  public update(deltaMs: number): void {
    this.currentTime += deltaMs
    const frameDuration = 1000 / this.opts.fps
    const totalFrames = this.opts.frames.length
    const totalFramesPlayed = Math.floor(this.currentTime / frameDuration)
    this._frameIndex = this.opts.loop
      ? totalFramesPlayed % totalFrames
      : Math.min(totalFramesPlayed, totalFrames - 1)
  }

  /** Get the current frame name. */
  public get currentFrameName(): string {
    return this.opts.frames[this._frameIndex] ?? ''
  }

  /** Get the current frame index. */
  public get currentFrameIndex(): number {
    return this._frameIndex
  }

  /** Whether the animation is set to loop. */
  public get isLooping(): boolean {
    return this.opts.loop
  }

  /** Set looping behavior. */
  public setLoop(loop: boolean): void {
    this.opts = { ...this.opts, loop }
  }

  /** Get the current frame info. */
  public getCurrentFrameInfo(): AnimationFrameInfo {
    return {
      name: this.opts.frames[this._frameIndex] ?? '',
      index: this._frameIndex,
      total: this.opts.frames.length,
    }
  }

  /** Reset to the beginning. */
  public reset(): void {
    this.currentTime = 0
    this._frameIndex = 0
  }

  /** Draw the current frame at the specified position. */
  public draw(ctx: CanvasRenderingContext2D, destX: number, destY: number, destWidth?: number, destHeight?: number): boolean {
    return SpriteLoader.drawFrame(ctx, this.sheet, this.currentFrameName, destX, destY, destWidth, destHeight)
  }

  /** Factory: create an animation from a frame index range. */
  public static fromRange(sheet: SpriteSheet, start: number, end: number, fps: number = 12, loop: boolean = true): SpriteAnimation {
    const frames: string[] = []
    for (let i = start; i <= end && i < sheet.frameList.length; i++) {
      const frame = sheet.frameList[i]
      const key = Object.keys(sheet.frames).find((k) => sheet.frames[k] === frame)
      if (key) frames.push(key)
    }
    return new SpriteAnimation(sheet, { frames, fps, loop })
  }
}
