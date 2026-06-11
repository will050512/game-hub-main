export type DecorAssetId =
  | 'ghostPeek'
  | 'pixelHeart'
  | 'kawaiiStar'
  | 'frogBadge'
  | 'pandaToken'
  | 'chibiGirlToken'
  | 'rabbitCorner'
  | 'soundBubble'

const BASE = import.meta.env.BASE_URL

function resolve(path: string): string {
  return path.startsWith('/') ? `${BASE}${path.slice(1)}` : path
}

export const decorAssets: Record<DecorAssetId, string> = {
  ghostPeek: resolve('/images/decor/ghost-peek.svg'),
  pixelHeart: resolve('/images/decor/pixel-heart.svg'),
  kawaiiStar: resolve('/images/decor/kawaii-star.svg'),
  frogBadge: resolve('/images/decor/frog-badge.svg'),
  pandaToken: resolve('/images/decor/panda-token.svg'),
  chibiGirlToken: resolve('/images/decor/chibi-girl-token.svg'),
  rabbitCorner: resolve('/images/decor/rabbit-corner.svg'),
  soundBubble: resolve('/images/decor/sound-bubble.svg'),
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
