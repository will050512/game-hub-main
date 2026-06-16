import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  parseKenneyXmlAtlas,
  parseKenneyTxtTilesheet,
  generateFramesFromTilesheet,
} from './kenneyAtlasParser'
import {
  SpriteLoader,
  SpriteAnimation,
  type SpriteFrame,
  type SpriteSheet,
} from './spriteLoader'

/* ================================================================== */
/*  Kenney XML Atlas Parser                                           */
/* ================================================================== */

describe('parseKenneyXmlAtlas', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<TextureAtlas imagePath="sheet.png">
  <SubTexture name="arrowDown.png" x="50" y="50" width="50" height="50"/>
  <SubTexture name="arrowUp.png" x="0" y="400" width="50" height="50"/>
  <SubTexture name="star.png" x="100" y="450" width="50" height="50"/>
</TextureAtlas>`

  it('parses valid XML atlas correctly', () => {
    const result = parseKenneyXmlAtlas(sampleXml)

    expect(result.imagePath).toBe('sheet.png')
    expect(result.frameCount).toBe(3)
    expect(result.frames).toHaveProperty('arrowDown.png')
    expect(result.frames).toHaveProperty('arrowUp.png')
    expect(result.frames).toHaveProperty('star.png')
  })

  it('extracts correct frame coordinates', () => {
    const result = parseKenneyXmlAtlas(sampleXml)
    const arrowDown = result.frames['arrowDown.png']!

    expect(arrowDown.x).toBe(50)
    expect(arrowDown.y).toBe(50)
    expect(arrowDown.width).toBe(50)
    expect(arrowDown.height).toBe(50)
    expect(arrowDown.sourceX).toBe(50)
    expect(arrowDown.sourceY).toBe(50)
    expect(arrowDown.sourceWidth).toBe(50)
    expect(arrowDown.sourceHeight).toBe(50)
    expect(arrowDown.pivotX).toBe(0)
    expect(arrowDown.pivotY).toBe(0)
  })

  it('extracts star frame at correct position', () => {
    const result = parseKenneyXmlAtlas(sampleXml)
    const star = result.frames['star.png']!

    expect(star.x).toBe(100)
    expect(star.y).toBe(450)
  })

  it('throws on malformed XML', () => {
    expect(() => parseKenneyXmlAtlas('not xml at all')).toThrow()
  })

  it('throws on missing TextureAtlas element', () => {
    expect(() => parseKenneyXmlAtlas('<root></root>')).toThrow(
      'missing <TextureAtlas> root element',
    )
  })

  it('throws on missing imagePath attribute', () => {
    expect(() =>
      parseKenneyXmlAtlas('<TextureAtlas><SubTexture name="a.png" x="0" y="0" width="10" height="10"/></TextureAtlas>'),
    ).toThrow('missing imagePath attribute')
  })
})

/* ================================================================== */
/*  Kenney TXT Tilesheet Parser                                       */
/* ================================================================== */

describe('parseKenneyTxtTilesheet', () => {
  const sampleTxt = `Tilesheet information:

Tile size                 •  24px × 24px
Space between tiles       •  1px × 1px
---
Total tiles (horizontal)  •  9 tiles
Total tiles (vertical)    •  3 tiles
---
Total tiles in sheet      •  27 tiles`

  it('parses valid TXT tilesheet correctly', () => {
    const result = parseKenneyTxtTilesheet(sampleTxt)

    expect(result.tileSize.width).toBe(24)
    expect(result.tileSize.height).toBe(24)
    expect(result.spacing.horizontal).toBe(1)
    expect(result.spacing.vertical).toBe(1)
    expect(result.columns).toBe(9)
    expect(result.rows).toBe(3)
    expect(result.totalTiles).toBe(27)
  })

  it('throws on invalid format', () => {
    expect(() => parseKenneyTxtTilesheet('garbage data')).toThrow(
      'Invalid Kenney TXT tilesheet format',
    )
  })

  it('handles tilesheet with no spacing', () => {
    const noSpacing = `Tilesheet information:

Tile size                 •  16px × 16px
---
Total tiles (horizontal)  •  12 tiles
Total tiles (vertical)    •  10 tiles
---
Total tiles in sheet      •  120 tiles`

    const result = parseKenneyTxtTilesheet(noSpacing)
    expect(result.spacing.horizontal).toBe(0)
    expect(result.spacing.vertical).toBe(0)
    expect(result.totalTiles).toBe(120)
  })
})

/* ================================================================== */
/*  Frame Generation                                                  */
/* ================================================================== */

describe('generateFramesFromTilesheet', () => {
  it('generates correct number of frames', () => {
    const metadata = {
      tileSize: { width: 16, height: 16 },
      spacing: { horizontal: 1, vertical: 1 },
      columns: 4,
      rows: 3,
      totalTiles: 12,
    }
    const frames = generateFramesFromTilesheet(metadata)
    expect(frames).toHaveLength(12)
  })

  it('generates correct coordinates for first row', () => {
    const metadata = {
      tileSize: { width: 32, height: 32 },
      spacing: { horizontal: 1, vertical: 1 },
      columns: 3,
      rows: 1,
      totalTiles: 3,
    }
    const frames = generateFramesFromTilesheet(metadata)

    expect(frames[0]!.x).toBe(0)
    expect(frames[0]!.y).toBe(0)
    expect(frames[1]!.x).toBe(33)
    expect(frames[1]!.y).toBe(0)
    expect(frames[2]!.x).toBe(66)
    expect(frames[2]!.y).toBe(0)
  })

  it('generates correct coordinates for multiple rows', () => {
    const metadata = {
      tileSize: { width: 16, height: 16 },
      spacing: { horizontal: 1, vertical: 1 },
      columns: 2,
      rows: 2,
      totalTiles: 4,
    }
    const frames = generateFramesFromTilesheet(metadata)

    expect(frames[0]!.x).toBe(0)
    expect(frames[0]!.y).toBe(0)
    expect(frames[1]!.x).toBe(17)
    expect(frames[1]!.y).toBe(0)
    expect(frames[2]!.x).toBe(0)
    expect(frames[2]!.y).toBe(17)
    expect(frames[3]!.x).toBe(17)
    expect(frames[3]!.y).toBe(17)
  })
})

/* ================================================================== */
/*  SpriteLoader                                                      */
/* ================================================================== */

describe('SpriteLoader', () => {
  let loader: SpriteLoader

  beforeEach(() => {
    loader = new SpriteLoader({ baseUrl: '/test-assets/' })
  })

  it('resolves relative paths with baseUrl', () => {
    const resolved = (loader as any).resolvePath('sprite.png')
    expect(resolved).toBe('/test-assets/sprite.png')
  })

  it('passes through absolute paths', () => {
    const resolved = (loader as any).resolvePath('/absolute/path.png')
    expect(resolved).toBe('/absolute/path.png')
  })

  it('passes through HTTP URLs', () => {
    const resolved = (loader as any).resolvePath('https://example.com/sprite.png')
    expect(resolved).toBe('https://example.com/sprite.png')
  })

  it('handles baseUrl with trailing slash', () => {
    const loaderWithSlash = new SpriteLoader({ baseUrl: '/test-assets/' })
    const resolved = (loaderWithSlash as any).resolvePath('sprite.png')
    expect(resolved).toBe('/test-assets/sprite.png')
  })

  it('imageCache starts empty', () => {
    const cache = (loader as any).imageCache
    expect(cache.size).toBe(0)
  })

  it('clearCache removes all entries', () => {
    const img = new Image()
    const cache = (loader as any).imageCache
    cache.set('/test-assets/a.png', img)
    expect(cache.size).toBe(1)

    ;(loader as any).clearCache?.()
    expect(cache.size).toBe(0)
  })

  it('clearCache removes single entry and has() reflects cache state', () => {
    const cache = (loader as any).imageCache
    cache.set('/test-assets/a.png', new Image())
    cache.set('/test-assets/b.png', new Image())
    expect(loader.cacheSize).toBe(2)

    loader.clearCache('a.png')
    expect(loader.cacheSize).toBe(1)
    expect(loader.has('b.png')).toBe(true)
    expect(loader.has('a.png')).toBe(false)
  })

  it('has returns false for uncached images', () => {
    expect(loader.has('nonexistent.png')).toBe(false)
  })

  it('get returns null for uncached images', () => {
    expect(loader.get('nonexistent.png')).toBeNull()
  })

  it('getSheet returns null for uncached sheets', () => {
    expect(loader.getSheet('nonexistent')).toBeNull()
  })
})

/* ================================================================== */
/*  SpriteSheet structure                                             */
/* ================================================================== */

describe('SpriteSheet structure', () => {
  const mockImage = new Image()

  const createSheet = (): SpriteSheet => {
    const frames: Record<string, SpriteFrame> = {
      'frame_0000': {
        x: 0,
        y: 0,
        width: 32,
        height: 32,
        sourceX: 0,
        sourceY: 0,
        sourceWidth: 32,
        sourceHeight: 32,
        pivotX: 0,
        pivotY: 0,
      },
      'frame_0001': {
        x: 32,
        y: 0,
        width: 32,
        height: 32,
        sourceX: 32,
        sourceY: 0,
        sourceWidth: 32,
        sourceHeight: 32,
        pivotX: 0,
        pivotY: 0,
      },
    }
    return { frames, frameList: Object.values(frames), image: mockImage, basePath: '' }
  }

  it('creates sheet with correct frame count', () => {
    const sheet = createSheet()
    expect(Object.keys(sheet.frames).length).toBe(2)
    expect(sheet.frameList.length).toBe(2)
  })
})

/* ================================================================== */
/*  SpriteAnimation                                                   */
/* ================================================================== */

describe('SpriteAnimation', () => {
  const createSheet = (): SpriteSheet => {
    const frames: Record<string, SpriteFrame> = {
      'frame_0000': {
        x: 0, y: 0, width: 32, height: 32,
        sourceX: 0, sourceY: 0, sourceWidth: 32, sourceHeight: 32,
        pivotX: 0, pivotY: 0,
      },
      'frame_0001': {
        x: 32, y: 0, width: 32, height: 32,
        sourceX: 32, sourceY: 0, sourceWidth: 32, sourceHeight: 32,
        pivotX: 0, pivotY: 0,
      },
      'frame_0002': {
        x: 64, y: 0, width: 32, height: 32,
        sourceX: 64, sourceY: 0, sourceWidth: 32, sourceHeight: 32,
        pivotX: 0, pivotY: 0,
      },
    }
    return {
      frames,
      frameList: Object.values(frames),
      image: new Image(),
      basePath: '',
    }
  }

  it('starts at frame 0', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    expect(anim.currentFrameName).toBe('frame_0000')
    expect(anim.currentFrameIndex).toBe(0)
  })

  it('advances frames based on fps', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    anim.update(100)
    expect(anim.currentFrameName).toBe('frame_0001')
    anim.update(100)
    expect(anim.currentFrameName).toBe('frame_0002')
  })

  it('loops back to start', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    anim.update(300)
    expect(anim.currentFrameName).toBe('frame_0000')
  })

  it('stops at last frame when not looping', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: false,
    })
    anim.update(500)
    expect(anim.currentFrameName).toBe('frame_0002')
    expect(anim.currentFrameIndex).toBe(2)
  })

  it('resets to beginning', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    anim.update(200)
    expect(anim.currentFrameName).toBe('frame_0002')
    anim.reset()
    expect(anim.currentFrameName).toBe('frame_0000')
  })

  it('toggles loop behavior', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    expect(anim.isLooping).toBe(true)
    anim.setLoop(false)
    expect(anim.isLooping).toBe(false)
  })

  it('getCurrentFrameInfo returns correct data', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001', 'frame_0002'],
      fps: 10,
      loop: true,
    })
    anim.update(100)
    const info = anim.getCurrentFrameInfo()
    expect(info.name).toBe('frame_0001')
    expect(info.index).toBe(1)
    expect(info.total).toBe(3)
  })

  it('fromRange creates animation from frame indices', () => {
    const sheet = createSheet()
    const anim = SpriteAnimation.fromRange(sheet, 0, 2, 10, true)
    expect(anim.currentFrameName).toBeDefined()
    expect(anim.isLooping).toBe(true)
  })

  it('draw returns true for valid frame', () => {
    const anim = new SpriteAnimation(createSheet(), {
      frames: ['frame_0000', 'frame_0001'],
      fps: 10,
      loop: true,
    })
    const mockCtx = { drawImage: vi.fn() } as unknown as CanvasRenderingContext2D
    const result = anim.draw(mockCtx, 10, 10)
    expect(result).toBe(true)
    expect(mockCtx.drawImage).toHaveBeenCalledTimes(1)
  })
})
