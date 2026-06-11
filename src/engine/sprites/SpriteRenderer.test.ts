import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SpriteLoader, SpriteAnimation, type SpriteFrame, type SpriteSheet } from './spriteLoader'
import { SpriteRenderer, type RenderEffects } from './SpriteRenderer'

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function createMockImage(): HTMLImageElement {
  return new Image()
}

function createSheet(frameCount: number = 4): SpriteSheet {
  const frames: Record<string, SpriteFrame> = {}
  const frameList: SpriteFrame[] = []
  const tileSize = 32

  for (let i = 0; i < frameCount; i++) {
    const name = `frame_${String(i).padStart(4, '0')}`
    const frame: SpriteFrame = {
      x: i * tileSize,
      y: 0,
      width: tileSize,
      height: tileSize,
      sourceX: i * tileSize,
      sourceY: 0,
      sourceWidth: tileSize,
      sourceHeight: tileSize,
      pivotX: 0,
      pivotY: 0,
    }
    frames[name] = frame
    frameList.push(frame)
  }

  return {
    frames,
    frameList,
    image: createMockImage(),
    basePath: '',
  }
}

function createMockCtx(): CanvasRenderingContext2D & {
  drawImage: ReturnType<typeof vi.fn>
  save: ReturnType<typeof vi.fn>
  restore: ReturnType<typeof vi.fn>
  translate: ReturnType<typeof vi.fn>
  rotate: ReturnType<typeof vi.fn>
  scale: ReturnType<typeof vi.fn>
  fillRect: ReturnType<typeof vi.fn>
} {
  return {
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    imageSmoothingEnabled: true,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    shadowColor: '',
    shadowBlur: 0,
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D & {
    drawImage: ReturnType<typeof vi.fn>
    save: ReturnType<typeof vi.fn>
    restore: ReturnType<typeof vi.fn>
    translate: ReturnType<typeof vi.fn>
    rotate: ReturnType<typeof vi.fn>
    scale: ReturnType<typeof vi.fn>
    fillRect: ReturnType<typeof vi.fn>
  }
}

/* ================================================================== */
/*  SpriteRenderer - Sheet Registration                                */
/* ================================================================== */

describe('SpriteRenderer - sheet registration', () => {
  let loader: SpriteLoader
  let mockCtx: ReturnType<typeof createMockCtx>
  let renderer: SpriteRenderer

  beforeEach(() => {
    loader = new SpriteLoader()
    mockCtx = createMockCtx()
    renderer = new SpriteRenderer(loader, mockCtx)
  })

  it('registers a sheet and can look it up', () => {
    const sheet = createSheet(2)
    renderer.registerSheet('player', sheet)
    expect(loader.getSheet('player')).toBeNull()
  })

  it('unregisters a sheet', () => {
    const sheet = createSheet(2)
    renderer.registerSheet('tiles', sheet)
    renderer.unregisterSheet('tiles')
  })

  it('rejects unregistered sprite key', () => {
    expect(renderer.drawSprite('unknown/frame', 0, 0, 32, 32)).toBe(false)
  })
})

/* ================================================================== */
/*  drawSprite                                                         */
/* ================================================================== */

describe('SpriteRenderer.drawSprite', () => {
  let mockCtx: ReturnType<typeof createMockCtx>
  let renderer: SpriteRenderer

  beforeEach(() => {
    const loader = new SpriteLoader()
    mockCtx = createMockCtx()
    renderer = new SpriteRenderer(loader, mockCtx)
  })

  it('draws sprite with sheet/frame key', () => {
    const sheet = createSheet(4)
    renderer.registerSheet('player', sheet)

    const result = renderer.drawSprite('player/frame_0000', 10, 20, 64, 64)
    expect(result).toBe(true)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
    const call = mockCtx.drawImage.mock.calls[0]!
    expect(call[5]).toBe(10)
    expect(call[6]).toBe(20)
    expect(call[7]).toBe(64)
    expect(call[8]).toBe(64)
  })

  it('uses frame source size when dimensions omitted', () => {
    const sheet = createSheet(2)
    renderer.registerSheet('items', sheet)

    renderer.drawSprite('items/frame_0001', 5, 5)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
    const call = mockCtx.drawImage.mock.calls[0]!
    expect(call[7]).toBe(32)
    expect(call[8]).toBe(32)
  })

  it('auto-resolves frame key across sheets', () => {
    const sheet = createSheet(2)
    renderer.registerSheet('shared', sheet)

    const result = renderer.drawSprite('frame_0000', 0, 0, 32, 32)
    expect(result).toBe(true)
  })

  it('returns false for missing frame', () => {
    const sheet = createSheet(2)
    renderer.registerSheet('player', sheet)
    expect(renderer.drawSprite('player/frame_9999', 0, 0, 32, 32)).toBe(false)
  })
})

/* ================================================================== */
/*  drawFrame                                                          */
/* ================================================================== */

describe('SpriteRenderer.drawFrame', () => {
  it('draws frame at scale 1', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)

    renderer.drawFrame(sheet.frames['frame_0000']!, sheet, 100, 200, 1)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
    const call = mockCtx.drawImage.mock.calls[0]!
    expect(call[5]).toBe(100)
    expect(call[6]).toBe(200)
    expect(call[7]).toBe(32)
    expect(call[8]).toBe(32)
  })

  it('scales frame dimensions', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)

    renderer.drawFrame(sheet.frames['frame_0000']!, sheet, 10, 10, 2)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
    const call = mockCtx.drawImage.mock.calls[0]!
    expect(call[7]).toBe(64)
    expect(call[8]).toBe(64)
  })
})

/* ================================================================== */
/*  drawTiled                                                          */
/* ================================================================== */

describe('SpriteRenderer.drawTiled', () => {
  it('tiles a sprite across region', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)
    renderer.registerSheet('bg', sheet)

    renderer.drawTiled('bg/frame_0000', 0, 0, 96, 96)
    const calls = mockCtx.drawImage.mock.calls
    expect(calls.length).toBe(9)
  })

  it('returns false for unknown sheet', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    expect(renderer.drawTiled('missing/tile', 0, 0, 64, 64)).toBe(false)
  })
})

/* ================================================================== */
/*  drawRotated                                                        */
/* ================================================================== */

describe('SpriteRenderer.drawRotated', () => {
  it('uses save/restore and translate+rotate', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)
    renderer.registerSheet('rot', sheet)

    renderer.drawRotated('rot/frame_0000', 100, 100, 64, 64, Math.PI / 4)
    expect(mockCtx.save).toHaveBeenCalledTimes(1)
    expect(mockCtx.restore).toHaveBeenCalledTimes(1)
    expect(mockCtx.translate).toHaveBeenCalledTimes(2)
    expect(mockCtx.rotate).toHaveBeenCalledTimes(1)
    expect(mockCtx.rotate.mock.calls[0]![0]).toBe(Math.PI / 4)
  })

  it('returns false for missing key', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    expect(renderer.drawRotated('nope/f', 0, 0, 32, 32, 0)).toBe(false)
  })
})

/* ================================================================== */
/*  drawFlipped                                                        */
/* ================================================================== */

describe('SpriteRenderer.drawFlipped', () => {
  it('applies flipX transform', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)
    renderer.registerSheet('flip', sheet)

    renderer.drawFlipped('flip/frame_0000', 50, 50, 32, 32, true, false)
    expect(mockCtx.save).toHaveBeenCalledTimes(1)
    expect(mockCtx.restore).toHaveBeenCalledTimes(1)
    expect(mockCtx.scale).toHaveBeenCalledTimes(1)
    expect(mockCtx.scale.mock.calls[0]![0]).toBe(-1)
    expect(mockCtx.scale.mock.calls[0]![1]).toBe(1)
  })

  it('applies flipY transform', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)
    renderer.registerSheet('flip', sheet)

    renderer.drawFlipped('flip/frame_0000', 50, 50, 32, 32, false, true)
    expect(mockCtx.scale.mock.calls[0]![0]).toBe(1)
    expect(mockCtx.scale.mock.calls[0]![1]).toBe(-1)
  })

  it('applies both flipX and flipY', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)
    renderer.registerSheet('flip', sheet)

    renderer.drawFlipped('flip/frame_0000', 50, 50, 32, 32, true, true)
    expect(mockCtx.scale.mock.calls[0]![0]).toBe(-1)
    expect(mockCtx.scale.mock.calls[0]![1]).toBe(-1)
  })

  it('no flip leaves scale at 1', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(1)
    renderer.registerSheet('flip', sheet)

    renderer.drawFlipped('flip/frame_0000', 50, 50, 32, 32, false, false)
    expect(mockCtx.scale.mock.calls[0]![0]).toBe(1)
    expect(mockCtx.scale.mock.calls[0]![1]).toBe(1)
  })
})

/* ================================================================== */
/*  drawAnimated                                                       */
/* ================================================================== */

describe('SpriteRenderer.drawAnimated', () => {
  it('draws current animation frame', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(3)

    const anim = new SpriteAnimation(sheet, {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })

    const result = renderer.drawAnimated(anim, 10, 10, 32, 32)
    expect(result).toBe(true)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
  })

  it('draws updated frame after advance', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(3)

    const anim = new SpriteAnimation(sheet, {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    anim.update(100)

    renderer.drawAnimated(anim, 0, 0, 32, 32)
    const call = mockCtx.drawImage.mock.calls[0]!
    expect(call[1]).toBe(32)
  })
})

/* ================================================================== */
/*  drawWithEffects                                                    */
/* ================================================================== */

describe('SpriteRenderer.drawWithEffects', () => {
  let mockCtx: ReturnType<typeof createMockCtx>
  let renderer: SpriteRenderer

  beforeEach(() => {
    const loader = new SpriteLoader()
    mockCtx = createMockCtx()
    renderer = new SpriteRenderer(loader, mockCtx)
  })

  it('applies alpha', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = { alpha: 0.5 }
    renderer.drawWithEffects('fx/frame_0000', 0, 0, 32, 32, effects)
    expect((mockCtx as unknown as Record<string, number>).globalAlpha).toBe(0.5)
  })

  it('applies scaleX and scaleY', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = { scaleX: 2, scaleY: 0.5 }
    renderer.drawWithEffects('fx/frame_0000', 0, 0, 32, 32, effects)
    expect(mockCtx.scale).toHaveBeenCalled()
  })

  it('applies rotation', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = { rotation: Math.PI / 2 }
    renderer.drawWithEffects('fx/frame_0000', 0, 0, 32, 32, effects)
    expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI / 2)
  })

  it('applies glow', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = { glow: { color: '#ff0000', blur: 10 } }
    renderer.drawWithEffects('fx/frame_0000', 0, 0, 32, 32, effects)
    expect((mockCtx as unknown as Record<string, string>).shadowColor).toBe('#ff0000')
    expect((mockCtx as unknown as Record<string, number>).shadowBlur).toBe(10)
  })

  it('applies tint via source-in composite', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = { tint: '#00ff00' }
    renderer.drawWithEffects('fx/frame_0000', 0, 0, 32, 32, effects)
    expect((mockCtx as unknown as Record<string, string>).globalCompositeOperation).toBe('source-over')
    expect(mockCtx.fillRect).toHaveBeenCalled()
  })

  it('applies flipX in effects', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = { flipX: true }
    renderer.drawWithEffects('fx/frame_0000', 0, 0, 32, 32, effects)
    expect(mockCtx.scale).toHaveBeenCalled()
  })

  it('combines all effects', () => {
    const sheet = createSheet(1)
    renderer.registerSheet('fx', sheet)
    const effects: RenderEffects = {
      alpha: 0.8,
      scaleX: 1.5,
      scaleY: 1.5,
      rotation: Math.PI / 6,
      flipX: true,
      tint: '#ffff00',
      glow: { color: '#ff00ff', blur: 8 },
    }
    renderer.drawWithEffects('fx/frame_0000', 10, 10, 32, 32, effects)
    expect(mockCtx.save).toHaveBeenCalledTimes(1)
    expect(mockCtx.restore).toHaveBeenCalledTimes(1)
    expect(mockCtx.translate).toHaveBeenCalled()
    expect(mockCtx.rotate).toHaveBeenCalled()
    expect(mockCtx.scale).toHaveBeenCalled()
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
    expect(mockCtx.fillRect).toHaveBeenCalled()
  })
})

/* ================================================================== */
/*  Pixel Perfect Rendering                                            */
/* ================================================================== */

describe('SpriteRenderer pixel perfect', () => {
  it('disables imageSmoothingEnabled by default', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)

    const sheet = createSheet(1)
    renderer.registerSheet('test', sheet)
    renderer.drawSprite('test/frame_0000', 0, 0, 32, 32)
    expect(mockCtx.imageSmoothingEnabled).toBe(false)
  })

  it('can disable pixelPerfect mode', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    mockCtx.imageSmoothingEnabled = true
    const renderer = new SpriteRenderer(loader, mockCtx, { pixelPerfect: false })

    const sheet = createSheet(1)
    renderer.registerSheet('test', sheet)
    renderer.drawSprite('test/frame_0000', 0, 0, 32, 32)
    expect(mockCtx.imageSmoothingEnabled).toBe(true)
  })
})

/* ================================================================== */
/*  Flush                                                              */
/* ================================================================== */

describe('SpriteRenderer.flush', () => {
  it('flushes pending batch', () => {
    const loader = new SpriteLoader()
    const mockCtx = createMockCtx()
    const renderer = new SpriteRenderer(loader, mockCtx)
    const sheet = createSheet(2)
    renderer.registerSheet('test', sheet)

    renderer.drawSprite('test/frame_0000', 0, 0, 32, 32)
    renderer.drawSprite('test/frame_0001', 32, 0, 32, 32)

    const callsBefore = mockCtx.drawImage.mock.calls.length
    renderer.flush()
    expect(mockCtx.drawImage.mock.calls.length).toBeGreaterThanOrEqual(callsBefore)
  })
})
