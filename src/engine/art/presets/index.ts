export { PRESETS, getPresetForGame, getRandomEntityColor } from './KawaiiPresets'
export type { GamePalette, GamePreset } from './KawaiiPresets'

export { PARTICLE_PRESETS, getParticleColor, getMaxLifetime } from './ParticlePresets'
export type { ParticleConfig } from './ParticlePresets'

export {
  BACKGROUND_PRESETS,
  getBackgroundForGame,
  drawBackgroundPreset,
} from './BackgroundPresets'
export type { BackgroundPreset } from './BackgroundPresets'

export {
  TRANSITION_PRESETS,
  EASING,
  EasingFunctions,
  interpolatePreset,
} from './TransitionPresets'
export type { TransitionPreset } from './TransitionPresets'
