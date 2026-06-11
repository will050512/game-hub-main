import { test, expect } from '@playwright/test'

test.describe('Wrapper Resilience Smoke', () => {
  test('should handle rapid navigation without crashing', async ({ page }) => {
    const consoleLogs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text())
      }
    })

    await page.goto('/')
    await expect(page.locator('.game-grid')).toBeVisible()

    for (let i = 0; i < 3; i++) {
      const gameCard = page.locator('.game-card').nth(i % 2)
      await gameCard.click()
      
      await expect(page.locator('.info-page')).toBeVisible()
      
      const backButton = page.locator('button.back-btn')
      await backButton.click()
      
      await expect(page.locator('.game-grid')).toBeVisible()
    }

    await page.waitForTimeout(1000)
    
    const criticalErrors = consoleLogs.filter(log => 
      log.includes('Cannot read properties of null') || 
      log.includes('Cannot read properties of undefined') ||
      log.includes('is not a function') ||
      log.includes('Failed to fetch')
    )
    
    expect(criticalErrors.length).toBe(0)
  })

  test('should handle game state cleanup on navigation', async ({ page }) => {
    await page.goto('/')
    
    const gameCard = page.locator('.game-card').first()
    await gameCard.click()

    await expect(page.locator('.info-page')).toBeVisible()
    
    const startButton = page.locator('button.btn-start')
    await startButton.click()

    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })
    
    await page.goBack()
    
    await page.waitForTimeout(1000)
    
    await expect(page.locator('.info-page')).toBeVisible()
  })

  test('should handle window resize gracefully', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.game-grid')).toBeVisible()

    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    
    await expect(page.locator('.game-grid')).toBeVisible()
  })
})
