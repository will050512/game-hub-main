/**
 * Types for the Art System
 */

export type EyeEmotion =
  | 'normal'
  | 'happy'
  | 'angry'
  | 'surprised'
  | 'sleepy'
  | 'determined'
  | 'wink'
  | 'hearts'

export type MouthStyle = 'smile' | 'frown' | 'gasp' | 'grin' | 'tongue' | 'flat'

export type BodyShape = 'circle' | 'rect' | 'star' | 'heart' | 'shield' | 'arrow' | 'diamond' | 'pentagon'

export type ParticleType = 'burst' | 'trail' | 'ambient'

export interface ParticleSpec {
  count: number
  spread: number
  speed: number
  life: number // ms
  size: number
  colors: string[]
}
