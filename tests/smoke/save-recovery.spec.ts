import { test, expect } from '@playwright/test'

test.describe('Save Recovery Smoke', () => {
  test('should persist high scores across page reloads', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('.game-grid')).toBeVisible()
    
    const gameCard = page.locator('.game-card').first()
    await gameCard.click()

    await expect(page.locator('.info-page')).toBeVisible()
    
    const highScoreElement = page.locator('.stat-value').first()
    const initialHighScore = await highScoreElement.textContent()

    await page.reload()
    
    await expect(page.locator('.info-page')).toBeVisible()
    
    const reloadedHighScore = await page.locator('.stat-value').first().textContent()
    expect(reloadedHighScore).toBe(initialHighScore)
  })

  test('should maintain currency balance across sessions', async ({ page }) => {
    await page.goto('/')
    
    const coinDisplay = page.locator('.coin-amount')
    await expect(coinDisplay).toBeVisible()
    
    const initialBalance = await coinDisplay.textContent()

    await page.reload()
    
    const reloadedBalance = await page.locator('.coin-amount').textContent()
    expect(reloadedBalance).toBe(initialBalance)
  })

  test('should handle database initialization', async ({ page }) => {
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text().toLowerCase()
      const type = msg.type()
      if (type === 'error' || type === 'warning') {
        consoleLogs.push(msg.text())
      }
    })

    await page.goto('/')
    
    await expect(page.locator('.game-grid')).toBeVisible()
    
    const criticalErrors = consoleLogs.filter(log => {
      const lower = log.toLowerCase()
      return (
        lower.includes('wasm') ||
        lower.includes('database') ||
        lower.includes('sqlite') ||
        lower.includes('compile') ||
        lower.includes('instantiate')
      )
    })
    
    expect(criticalErrors).toEqual([])
  })

  test('should handle storage quota exceeded gracefully', async ({ page }) => {
    await page.goto('/')
    
    await page.evaluate(() => {
      try {
        const largeData = 'x'.repeat(5 * 1024 * 1024)
        localStorage.setItem('test-large-data', largeData)
      } catch (e) {
        console.log('Storage quota test:', e)
      }
    })

    await page.reload()
    
    await expect(page.locator('.game-grid')).toBeVisible()
  })
})
