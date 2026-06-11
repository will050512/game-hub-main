import { test, expect } from '@playwright/test'

test.describe('Adapter Resolution Smoke', () => {
  test('should load game adapters dynamically', async ({ page }) => {
    const consoleLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text())
      }
    })

    await page.goto('/')
    
    await expect(page.locator('.game-grid')).toBeVisible()
    
    const gameCard = page.locator('.game-card').first()
    await gameCard.click()

    await expect(page.locator('.info-page')).toBeVisible()
    
    const startButton = page.locator('button.btn-start')
    await startButton.click()

    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })

    await page.waitForTimeout(2000)
    
    const criticalErrors = consoleLogs.filter(log => 
      log.includes('Failed to load') || 
      log.includes('Cannot find module') ||
      log.includes('undefined is not')
    )
    
    expect(criticalErrors.length).toBe(0)
  })

  test('should handle missing game gracefully', async ({ page }) => {
    const response = await page.goto('/game/nonexistent-game/info')
    
    await page.waitForTimeout(1000)
    
    const bodyText = await page.locator('body').textContent()
    const hasNotFoundText = bodyText?.includes('找不到') || bodyText?.includes('not found')
    
    if (!hasNotFoundText) {
      const isRedirectedToLobby = page.url().endsWith('/') || page.url().includes('localhost:5173/#/')
      expect(isRedirectedToLobby).toBeTruthy()
    } else {
      expect(hasNotFoundText).toBeTruthy()
    }
  })
})
