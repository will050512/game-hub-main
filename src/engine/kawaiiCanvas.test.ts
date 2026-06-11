import { describe, expect, it } from 'vitest'

import { canvasIconKindForItem, formatCanvasCountLabel } from './kawaiiCanvas'

describe('canvasIconKindForItem', () => {
  it('maps known gameplay icon ids to stable doodle icon kinds', () => {
    expect(canvasIconKindForItem('heart')).toBe('heart')
    expect(canvasIconKindForItem('preview')).toBe('preview')
    expect(canvasIconKindForItem('target')).toBe('target')
    expect(canvasIconKindForItem('laser')).toBe('laser')
    expect(canvasIconKindForItem('chaos')).toBe('orb')
    expect(canvasIconKindForItem('refresh')).toBe('undo')
  })

  it('falls back to spark for unknown ids', () => {
    expect(canvasIconKindForItem('made-up-icon')).toBe('spark')
  })
})

describe('formatCanvasCountLabel', () => {
  it('renders compact charge labels without placeholder glyph prefixes', () => {
    expect(formatCanvasCountLabel('撤回', 2)).toBe('撤回 2')
    expect(formatCanvasCountLabel('炸彈行', 1)).toBe('炸彈行 1')
  })

  it('omits counts when the count is not positive', () => {
    expect(formatCanvasCountLabel('預覽+', 0)).toBe('預覽+')
  })
})
