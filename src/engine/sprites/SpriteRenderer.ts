/**
 * SpriteRenderer — Canvas sprite rendering engine.
 *
 * Sits on top of SpriteLoader and provides a unified draw API:
 *   - Single sprite by key  (drawSprite)
 *   - Raw frame from sheet   (drawFrame)
 *   - Tiled backgrounds      (drawTiled)
 *   - Rotation / flip       (drawRotated / drawFlipped)
 *   - Animated sequences    (drawAnimated)
 *   - Effect compositing    (drawWithEffects)
 *
 * Features:
 *   - Pixel-perfect rendering (imageSmoothingEnabled = false)
 *   - Batch rendering: groups drawImage calls sharing the same source image
 *   - No `any` types — fully typed against SpriteLoader types
 */

import { SpriteLoader, SpriteAnimation, type SpriteFrame, type SpriteSheet } from './spriteLoader'

/* ------------------------------------------------------------------ */
/*  Public Types                                                       */
/* ------------------------------------------------------------------ */

/** Optional transform / visual effects applied during a single draw call. */
export interface RenderEffects {
  /** Transparency 0 (invisible) → 1 (opaque). */
  alpha?: number
  /** Horizontal scale multiplier. */
  scaleX?: number
  /** Vertical scale multiplier. */
  scaleY?: number
  /** Rotation in radians (clockwise). */
  rotation?: number
  /** Mirror horizontally. */
  flipX?: boolean
  /** Mirror vertically. */
  flipY?: boolean
  /** Solid-color tint overlay (applied via globalCompositeOperation). */
  tint?: string
  /** Glow: color + blur radius in CSS pixels. */
  glow?: { color: string; blur: number }
}

/** A single entry in the batch queue before flush. */
interface BatchEntry {
  image: HTMLImageElement
  sx: number
  sy: number
  sw: number
  sh: number
  dx: number
  dy: number
  dw: number
  dh: number
}

/** Registered sprite sheet with a logical name. */
interface RegisteredSheet {
  sheet: SpriteSheet
  /** Optional per-frame size override. */
  defaultWidth?: number
  defaultHeight?: number
}

/* ------------------------------------------------------------------ */
/*  SpriteRenderer                                                     */
/* ------------------------------------------------------------------ */

export class SpriteRenderer {
  /** Named → sheet mapping; allows game code to reference sprites by short key. */
  private sheets = new Map<string, RegisteredSheet>()

  /** When true, disable image smoothing for pixel-art crispness. */
  private pixelPerfect: boolean

  /** Current batch buffer — flushed on context restore or manual flush. */
  private batch: BatchEntry[] | null = null
  private batching = false

  /* --------------------------------------------------------------- */
  /*  Constructor                                                     */
  /* --------------------------------------------------------------- */

  public constructor(
    private loader: SpriteLoader,
    private ctx: CanvasRenderingContext2D,
    options?: { pixelPerfect?: boolean },
  ) {
    this.pixelPerfect = options?.pixelPerfect ?? true
  }

  /* --------------------------------------------------------------- */
  /*  Sheet Registration                                              */
  /* --------------------------------------------------------------- */

  /**
   * Register a SpriteSheet under a short key so drawSprite() can resolve it.
   * @param key  Logical name (e.g. 'player', 'tiles', 'effects')
   * @param sheet Loaded SpriteSheet from SpriteLoader
   * @param defaultSize Optional default draw size per frame
   */
  public registerSheet(
    key: string,
    sheet: SpriteSheet,
    defaultSize?: { width?: number; height?: number },
  ): void {
    this.sheets.set(key, {
      sheet,
      defaultWidth: defaultSize?.width,
      defaultHeight: defaultSize?.height,
    })
  }

  /** Unregister a named sheet. */
  public unregisterSheet(key: string): void {
    this.sheets.delete(key)
  }

  /** Look up a registered sheet by key. */
  private getSheet(key: string): RegisteredSheet | undefined {
    return this.sheets.get(key)
  }

  /* --------------------------------------------------------------- */
  /*  Context Helpers                                                  */
  /* --------------------------------------------------------------- */

  /** Apply pixel-perfect rendering settings to the context. */
  private applyPixelPerfect(): void {
    if (this.pixelPerfect) {
      this.ctx.imageSmoothingEnabled = false
    }
  }

  /** Flush the current batch, then clear it. */
  private flushBatch(): void {
    if (!this.batch || this.batch.length === 0) return
    for (const entry of this.batch) {
      this.ctx.drawImage(
        entry.image,
        entry.sx, entry.sy, entry.sw, entry.sh,
        entry.dx, entry.dy, entry.dw, entry.dh,
      )
    }
    this.batch.length = 0
  }

  /** Start a batch for a known source image. */
  private startBatch(image: HTMLImageElement): void {
    if (this.batch && this.batch.length > 0 && this.batch[0]!.image !== image) {
      this.flushBatch()
    }
    if (!this.batch) {
      this.batch = []
    }
    this.batching = true
  }

  /** Queue a drawImage call into the current batch. */
  private queueDraw(
    image: HTMLImageElement,
    sx: number, sy: number, sw: number, sh: number,
    dx: number, dy: number, dw: number, dh: number,
  ): void {
    if (!this.batch) {
      // No batch active — draw immediately
      this.applyPixelPerfect()
      this.ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
      return
    }
    // If batch image changed, flush first
    if (this.batch.length > 0 && this.batch[0]!.image !== image) {
      this.flushBatch()
    }
    this.batch.push({ image, sx, sy, sw, sh, dx, dy, dw, dh })
  }

  /* --------------------------------------------------------------- */
  /*  Public Draw Methods                                              */
  /* --------------------------------------------------------------- */

  /**
   * Draw a single sprite identified by `<sheetKey>/<frameKey>`.
   * If only one key is given, it tries registered sheets in order.
   *
   * @param spriteKey  Either "sheet/frame" or just a frame name
   * @param x          Destination X
   * @param y          Destination Y
   * @param width      Destination width (uses frame sourceWidth if omitted)
   * @param height     Destination height (uses frame sourceHeight if omitted)
   */
  public drawSprite(
    spriteKey: string,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ): boolean {
    let sheetKey: string | undefined
    let frameKey: string

    const slashIndex = spriteKey.indexOf('/')
    if (slashIndex > -1) {
      sheetKey = spriteKey.substring(0, slashIndex)
      frameKey = spriteKey.substring(slashIndex + 1)
    } else {
      // Try to find the frame in any registered sheet
      frameKey = spriteKey
      let found = false
      for (const [key, reg] of this.sheets) {
        const frame = reg.sheet.frames[frameKey]
        if (frame) {
          sheetKey = key
          found = true
          break
        }
      }
      if (!found) return false
    }

    const reg = this.getSheet(sheetKey!)
    if (!reg) return false
    const frame = reg.sheet.frames[frameKey]
    if (!frame) return false

    const dw = width ?? frame.sourceWidth ?? reg.defaultWidth ?? frame.width
    const dh = height ?? frame.sourceHeight ?? reg.defaultHeight ?? frame.height

    this.applyPixelPerfect()
    this.startBatch(reg.sheet.image)
    this.queueDraw(
      reg.sheet.image,
      frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
      x, y, dw, dh,
    )
    this.flushBatch()
    return true
  }

  /**
   * Draw a raw SpriteFrame at position with optional uniform scale.
   * Requires the caller to pass the owning Sheet so we have the image.
   */
  public drawFrame(
    frame: SpriteFrame,
    sheet: SpriteSheet,
    x: number,
    y: number,
    scale: number = 1,
  ): void {
    const dw = Math.round(frame.sourceWidth * scale)
    const dh = Math.round(frame.sourceHeight * scale)

    this.applyPixelPerfect()
    this.startBatch(sheet.image)
    this.queueDraw(
      sheet.image,
      frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
      x, y, dw, dh,
    )
    this.flushBatch()
  }

  /**
   * Tile a sprite across a rectangular region.
   * spriteKey resolution is the same as drawSprite().
   */
  public drawTiled(
    spriteKey: string,
    x: number,
    y: number,
    regionWidth: number,
    regionHeight: number,
  ): boolean {
    const reg = this.resolveFirst(spriteKey)
    if (!reg) return false

    const frameKeys = Object.keys(reg.sheet.frames)
    if (frameKeys.length === 0) return false

    // Find matching frame
    let frame: SpriteFrame | undefined
    const slashIndex = spriteKey.indexOf('/')
    if (slashIndex > -1) {
      const fKey = spriteKey.substring(slashIndex + 1)
      frame = reg.sheet.frames[fKey]
    } else if (frameKeys.length > 0) {
      // Use first frame of the sheet as tile
      frame = reg.sheet.frames[frameKeys[0]!]
    }
    if (!frame) return false

    const tileW = frame.sourceWidth
    const tileH = frame.sourceHeight

    this.applyPixelPerfect()
    this.startBatch(reg.sheet.image)

    for (let ty = y; ty < y + regionHeight; ty += tileH) {
      for (let tx = x; tx < x + regionWidth; tx += tileW) {
        this.queueDraw(
          reg.sheet.image,
          frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
          tx, ty, tileW, tileH,
        )
      }
    }
    this.flushBatch()
    return true
  }

  /**
   * Draw a sprite rotated around its center.
   */
  public drawRotated(
    spriteKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    angle: number,
  ): boolean {
    const reg = this.resolveFirst(spriteKey)
    if (!reg) return false
    const frame = this.resolveFrame(reg, spriteKey)
    if (!frame) return false

    this.ctx.save()
    this.applyPixelPerfect()

    const cx = x + width / 2
    const cy = y + height / 2
    this.ctx.translate(cx, cy)
    this.ctx.rotate(angle)
    this.ctx.translate(-width / 2, -height / 2)

    this.startBatch(reg.sheet.image)
    this.queueDraw(
      reg.sheet.image,
      frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
      0, 0, width, height,
    )
    this.flushBatch()
    this.ctx.restore()
    return true
  }

  /**
   * Draw a sprite with optional horizontal/vertical flip.
   */
  public drawFlipped(
    spriteKey: string,
    x: number,
    y: number,
    width: number,
    height: number,
    flipX: boolean,
    flipY: boolean,
  ): boolean {
    const reg = this.resolveFirst(spriteKey)
    if (!reg) return false
    const frame = this.resolveFrame(reg, spriteKey)
    if (!frame) return false

    this.ctx.save()
    this.applyPixelPerfect()

    // Flip transform
    const dx = flipX ? x + width : x
    const dy = flipY ? y + height : y
    this.ctx.translate(dx, dy)
    this.ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)

    this.startBatch(reg.sheet.image)
    this.queueDraw(
      reg.sheet.image,
      frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
      0, 0, width, height,
    )
    this.flushBatch()
    this.ctx.restore()
    return true
  }

  /**
   * Draw the current frame of a SpriteAnimation.
   */
  public drawAnimated(
    animation: SpriteAnimation,
    x: number,
    y: number,
    width: number,
    height: number,
  ): boolean {
    const frameName = animation.currentFrameName
    // We need the sheet the animation was created from
    const sheet = (animation as unknown as { sheet: SpriteSheet }).sheet as SpriteSheet
    const frame = sheet.frames[frameName]
    if (!frame) return false

    this.applyPixelPerfect()
    this.startBatch(sheet.image)
    this.queueDraw(
      sheet.image,
      frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
      x, y, width, height,
    )
    this.flushBatch()
    return true
  }

  /**
   * Draw a sprite with a composite set of effects.
   * Combines alpha, scale, rotation, flip, tint, and glow in one call.
   */
  public drawWithEffects(
    key: string,
    x: number,
    y: number,
    w: number,
    h: number,
    effects: RenderEffects,
  ): boolean {
    const reg = this.resolveFirst(key)
    if (!reg) return false
    const frame = this.resolveFrame(reg, key)
    if (!frame) return false

    this.ctx.save()

    // Alpha
    if (effects.alpha !== undefined && effects.alpha !== 1) {
      this.ctx.globalAlpha = effects.alpha
    }

    // Glow (must be set BEFORE translate so shadow follows the sprite)
    if (effects.glow) {
      this.ctx.shadowColor = effects.glow.color
      this.ctx.shadowBlur = effects.glow.blur
    }

    // Compute transform center
    const scaleX = effects.scaleX ?? 1
    const scaleY = effects.scaleY ?? 1
    const drawW = w * scaleX
    const drawH = h * scaleY

    let tx = x
    let ty = y
    if (effects.flipX) tx = x + drawW
    if (effects.flipY) ty = y + drawH

    this.ctx.translate(tx, ty)
    if (effects.rotation && effects.rotation !== 0) {
      this.ctx.rotate(effects.rotation)
    }
    this.ctx.scale(
      effects.flipX ? -scaleX : scaleX,
      effects.flipY ? -scaleY : scaleY,
    )

    this.applyPixelPerfect()

    // Draw the sprite
    this.startBatch(reg.sheet.image)
    this.queueDraw(
      reg.sheet.image,
      frame.sourceX, frame.sourceY, frame.sourceWidth, frame.sourceHeight,
      0, 0, drawW, drawH,
    )

    // Tint overlay
    if (effects.tint) {
      this.flushBatch()
      this.ctx.globalCompositeOperation = 'source-in'
      this.ctx.fillStyle = effects.tint
      this.ctx.fillRect(0, 0, drawW, drawH)
      this.ctx.globalCompositeOperation = 'source-over'
    }

    this.flushBatch()
    this.ctx.restore()
    return true
  }

  /**
   * Flush any pending batched draws.
   * Call this before context restore or other non-batched drawing.
   */
  public flush(): void {
    this.flushBatch()
    this.batch = null
    this.batching = false
  }

  /* --------------------------------------------------------------- */
  /*  Private Resolution Helpers                                      */
  /* --------------------------------------------------------------- */

  /** Resolve spriteKey to first matching registered sheet. */
  private resolveFirst(spriteKey: string): RegisteredSheet | undefined {
    const slashIndex = spriteKey.indexOf('/')
    if (slashIndex > -1) {
      const sheetKey = spriteKey.substring(0, slashIndex)
      return this.getSheet(sheetKey)
    }

    // Search all sheets for a matching frame
    for (const reg of this.sheets.values()) {
      if (reg.sheet.frames[spriteKey]) return reg
    }
    return undefined
  }

  /** Resolve frame within a known registered sheet. */
  private resolveFrame(reg: RegisteredSheet, spriteKey: string): SpriteFrame | undefined {
    const slashIndex = spriteKey.indexOf('/')
    const frameKey = slashIndex > -1 ? spriteKey.substring(slashIndex + 1) : spriteKey
    return reg.sheet.frames[frameKey]
  }
}
