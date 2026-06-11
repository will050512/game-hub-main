import { test, expect } from '@playwright/test'

test.describe('Asset Fallback Smoke', () => {
  test('should display fallback icons when images fail to load', async ({ page }) => {
    await page.route('**/*.png', route => route.abort())
    await page.route('**/*.jpg', route => route.abort())
    await page.route('**/*.svg', route => route.abort())

    await page.goto('/')
    
    await expect(page.locator('.game-grid')).toBeVisible()
    
    const gameCards = page.locator('.game-card')
    const count = await gameCards.count()
    expect(count).toBeGreaterThan(0)
    
    const firstCard = gameCards.first()
    await expect(firstCard).toBeVisible()
    
    const thumbnailIcon = firstCard.locator('.thumbnail-icon')
    await expect(thumbnailIcon).toBeVisible()
    
    const iconText = await thumbnailIcon.textContent()
    expect(iconText).toBeTruthy()
    expect(iconText?.trim().length).toBeGreaterThan(0)
  })

  test('should handle missing game thumbnails gracefully', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('.game-grid')).toBeVisible()
    
    const gameCards = page.locator('.game-card')
    await expect(gameCards.first()).toBeVisible()
    
    const thumbnails = page.locator('.thumbnail')
    const thumbnailCount = await thumbnails.count()
    expect(thumbnailCount).toBeGreaterThan(0)
  })

  test('should load app shell even with network errors', async ({ page }) => {
    await page.route('**/api/**', route => route.abort())

    await page.goto('/')
    
    await expect(page.locator('.lobby')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.nav-title')).toBeVisible()
  })

  test('should handle font loading failures', async ({ page }) => {
    await page.route('**/*.woff', route => route.abort())
    await page.route('**/*.woff2', route => route.abort())
    await page.route('**/*.ttf', route => route.abort())

    await page.goto('/')
    
    await expect(page.locator('.game-grid')).toBeVisible()
    await expect(page.locator('.hero-title')).toBeVisible()
  })
})
