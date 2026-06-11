import { test, expect } from '@playwright/test'

test.describe('Shell Traversal Smoke Tests', () => {
  const firstBatchGames = ['breakout', 'snake', 'tetris', 'game2048', 'flappy', 'survivor'] as const
  const secondBatchGames = ['invaders', 'fruit-catch', 'tower-defense', 'tic-tac-toe', 'memory', 'sudoku'] as const
  const smokeGames = [...firstBatchGames, ...secondBatchGames] as const

  test('should navigate from lobby to game info to play and pause', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('main.game-grid')).toBeVisible()
    await expect(page.locator('.game-card').first()).toBeVisible()

    const firstGameCard = page.locator('.game-card').first()
    await firstGameCard.click()

    await expect(page.locator('.info-page')).toBeVisible()
    await expect(page.locator('.info-title')).toBeVisible()
    
    const startButton = page.locator('button.btn-start')
    await expect(startButton).toBeVisible()
    await startButton.click()

    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })
    
    const pauseButton = page.locator('button.pause-btn')
    await expect(pauseButton).toBeVisible({ timeout: 5000 })
    await pauseButton.click()

    await expect(page.locator('.pause-overlay')).toBeVisible()
  })

  test('should load lobby with games displayed', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('.hero-title')).toBeVisible()
    await expect(page.locator('.game-grid')).toBeVisible()
    
    const gameCards = page.locator('.game-card')
    const count = await gameCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should navigate to shop from lobby', async ({ page }) => {
    await page.goto('/')
    
    const shopButton = page.locator('button.nav-btn[aria-label="商店"]')
    await expect(shopButton).toBeVisible()
    await shopButton.click()

    await expect(page.locator('.shop-view')).toBeVisible({ timeout: 5000 })
  })

  test('should search for games in lobby', async ({ page }) => {
    await page.goto('/')
    
    const searchInput = page.locator('input.search-input')
    await expect(searchInput).toBeVisible()
    
    const gameCards = page.locator('.game-card')
    const initialCount = await gameCards.count()
    expect(initialCount).toBeGreaterThan(0)
    
    await searchInput.fill('tetris')
    await page.waitForTimeout(500)
    
    const filteredCount = await gameCards.count()
    
    if (filteredCount === 0) {
      const emptyState = page.locator('.empty-state')
      await expect(emptyState).toBeVisible()
    } else {
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
      
      const firstCardName = await gameCards.first().locator('.game-name').textContent()
      expect(firstCardName?.toLowerCase()).toContain('tetris')
    }
  })

  for (const gameId of smokeGames) {
    test(`should open ${gameId} info and play shell without console errors`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto(`/game/${gameId}/info`)
      await expect(page.locator('.info-page')).toBeVisible()

      await page.locator('button.btn-start').click()
      await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })
      const pauseButton = page.locator('button.pause-btn')
      await expect(pauseButton).toBeVisible({ timeout: 5000 })
      await pauseButton.click()
      await expect(page.locator('.pause-overlay')).toBeVisible()

      await page.screenshot({ path: `tests/qa-screenshots/${gameId}-play-shell.png`, fullPage: true })

      expect(consoleErrors).toEqual([])
    })
  }
})
