import { test, expect, devices } from '@playwright/test'

/**
 * Multi-platform viewport tests.
 * Verifies key UI elements render correctly at common device sizes.
 */
const viewports = [
  { name: 'iPhone SE (small phone)', width: 320, height: 568, device: devices['iPhone SE'] },
  { name: 'iPhone 12 (phone)', width: 390, height: 844, device: devices['iPhone 12'] },
  { name: 'iPad Mini (tablet portrait)', width: 768, height: 1024, device: devices['iPad Mini'] },
  { name: 'iPad Pro (tablet landscape)', width: 1024, height: 768, device: devices['iPad Pro 11 inch'] },
  { name: 'Desktop (1440p)', width: 1440, height: 900, device: devices['Desktop Chrome'] },
] as const

test.describe('Multi-Platform Viewport Tests', () => {
  for (const vp of viewports) {
    test(`${vp.name} (${vp.width}x${vp.height}): lobby loads without layout issues`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.device.isMobile ?? false,
        userAgent: vp.device.userAgent,
      })
      const page = await context.newPage()
      await page.goto('/')

      // Wait for lobby to load
      await expect(page.locator('main.game-grid')).toBeVisible({ timeout: 15000 })

      // Verify game cards are visible
      const cards = page.locator('.grid-item')
      await expect(cards.first()).toBeVisible()

      // Verify cards don't overflow viewport
      const firstCard = await cards.first().boundingBox()
      expect(firstCard).not.toBeNull()
      expect(firstCard!.x).toBeGreaterThanOrEqual(0)
      expect(firstCard!.y).toBeGreaterThanOrEqual(0)
      expect(firstCard!.x + firstCard!.width).toBeLessThanOrEqual(vp.width)

      // Verify no horizontal scroll (common sign of layout overflow)
      const bodyBox = await page.locator('body').boundingBox()
      expect(bodyBox!.width).toBeLessThanOrEqual(vp.width)

      await context.close()
    })
  }

  test('navigates to game and canvas fills viewport correctly', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
      userAgent: devices['iPhone 8'].userAgent,
    })
    const page = await context.newPage()
    await page.goto('/')

    // Click first game card
    await page.locator('.grid-item').first().click()

    // Wait for game info page
    await expect(page.locator('.info-page')).toBeVisible({ timeout: 10000 })

    // Click start button
    await page.locator('button.btn-start').click()

    // Wait for canvas
    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })

    // Verify canvas dimensions are reasonable
    const canvas = page.locator('canvas.game-canvas')
    const canvasBox = await canvas.boundingBox()
    expect(canvasBox).not.toBeNull()
    expect(canvasBox!.width).toBeGreaterThan(0)
    expect(canvasBox!.height).toBeGreaterThan(0)

    // Verify canvas doesn't exceed viewport
    expect(canvasBox!.width).toBeLessThanOrEqual(375)
    expect(canvasBox!.height).toBeLessThanOrEqual(667)

    // Verify pause button is visible
    await expect(page.locator('button.pause-btn')).toBeVisible({ timeout: 5000 })

    await context.close()
  })

  test('orientation change does not break game layout', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      isMobile: true,
    })
    const page = await context.newPage()
    await page.goto('/')

    // Navigate to game
    await page.locator('.grid-item').first().click()
    await expect(page.locator('.info-page')).toBeVisible({ timeout: 10000 })
    await page.locator('button.btn-start').click()
    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })

    // Simulate orientation change (portrait → landscape)
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(500)

    // Canvas should still be visible
    await expect(page.locator('canvas.game-canvas')).toBeVisible()

    // Canvas should have resized
    const canvasBox = await page.locator('canvas.game-canvas').boundingBox()
    expect(canvasBox!.width).toBeGreaterThan(0)
    expect(canvasBox!.height).toBeGreaterThan(0)

    // Simulate orientation change back (landscape → portrait)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Canvas should still be visible
    await expect(page.locator('canvas.game-canvas')).toBeVisible()

    await context.close()
  })

  test('HudBar does not overflow on narrow screens', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 568 },
      isMobile: true,
    })
    const page = await context.newPage()
    await page.goto('/')

    // Navigate to a game with HUD
    await page.locator('.grid-item').first().click()
    await expect(page.locator('.info-page')).toBeVisible({ timeout: 10000 })
    await page.locator('button.btn-start').click()
    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })

    // Check HUD elements don't overflow
    const hudTop = page.locator('.hud-top')
    if (await hudTop.isVisible()) {
      const hudBox = await hudTop.boundingBox()
      expect(hudBox!.width).toBeLessThanOrEqual(320)
      expect(hudBox!.x).toBeGreaterThanOrEqual(0)
    }

    await context.close()
  })
})
