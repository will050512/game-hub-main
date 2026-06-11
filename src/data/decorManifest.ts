export type DecorAssetId =
  | 'ghostPeek'
  | 'pixelHeart'
  | 'kawaiiStar'
  | 'frogBadge'
  | 'pandaToken'
  | 'chibiGirlToken'
  | 'rabbitCorner'
  | 'soundBubble'

export const decorAssets: Record<DecorAssetId, string> = {
  ghostPeek: '/images/decor/ghost-peek.svg',
  pixelHeart: '/images/decor/pixel-heart.svg',
  kawaiiStar: '/images/decor/kawaii-star.svg',
  frogBadge: '/images/decor/frog-badge.svg',
  pandaToken: '/images/decor/panda-token.svg',
  chibiGirlToken: '/images/decor/chibi-girl-token.svg',
  rabbitCorner: '/images/decor/rabbit-corner.svg',
  soundBubble: '/images/decor/sound-bubble.svg',
}

export const gameDecorByCategory = {
  action: ['frogBadge', 'kawaiiStar'],
  puzzle: ['pandaToken', 'pixelHeart'],
  casual: ['rabbitCorner', 'ghostPeek'],
  strategy: ['chibiGirlToken', 'kawaiiStar'],
  board: ['pandaToken', 'ghostPeek'],
} as const

export function getDecorForGame(category?: string): readonly DecorAssetId[] {
  if (category && category in gameDecorByCategory) {
    return gameDecorByCategory[category as keyof typeof gameDecorByCategory]
  }
  return ['pixelHeart', 'kawaiiStar']
}
