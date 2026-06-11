/* ------------------------------------------------------------------ */
/*  Sprite module barrel exports                                      */
/* ------------------------------------------------------------------ */

/* SpriteLoader — SVG baked sprites (Vue components → ImageBitmap)    */
export {
  preloadCoreSprites,
  preloadGameSprites,
  getSprite,
  getSpriteSync,
  drawSprite,
  listSprites,
  clearSpriteCache,
} from './spriteLoader'
export type { DrawSpriteOptions } from './spriteLoader'

/* SpriteLoader — PNG / sprite sheet loader                            */
export { SpriteLoader, SpriteAnimation } from './spriteLoader'
export type {
  SpriteFrame,
  SpriteSheet,
  LoadProgress,
  SpriteLoaderOptions,
  LoadGridOptions,
  LoadTxtOptions,
  LoadXmlOptions,
  SpriteAnimationOptions,
  AnimationFrameInfo,
} from './spriteLoader'

/* SpriteRenderer — canvas rendering wrapper                           */
export { SpriteRenderer } from './SpriteRenderer'
export type { RenderEffects } from './SpriteRenderer'

/* Kenney Atlas Parser                                                 */
export {
  parseKenneyXmlAtlas,
  parseKenneyTxtTilesheet,
  generateFramesFromTilesheet,
} from './kenneyAtlasParser'
export type {
  KenneyXmlAtlas,
  KenneyTxtTilesheet,
} from './kenneyAtlasParser'
