import { test, expect, type ConsoleMessage } from '@playwright/test'

test.describe('Manual QA Audit - Shell Navigation', () => {
  let consoleErrors: ConsoleMessage[] = []
  let consoleWarnings: ConsoleMessage[] = []

  test.beforeEach(async ({ page }) => {
    consoleErrors = []
    consoleWarnings = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg)
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg)
      }
    })

    page.on('pageerror', (error) => {
      console.error('Page error:', error.message)
    })
  })

  test('QA Audit: Verify lobby loads without console errors', async ({ page }) => {
    console.log('\n=== QA TEST 1: Lobby Load ===')
    
    await page.goto('/', { waitUntil: 'networkidle' })
    
    await expect(page.locator('.game-grid')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('.hero-title')).toBeVisible()
    
    await page.screenshot({ path: 'tests/qa-screenshots/lobby.png', fullPage: true })
    
    const gameCards = page.locator('.game-card')
    const count = await gameCards.count()
    console.log(`Found ${count} game cards`)
    expect(count).toBeGreaterThan(0)
    
    console.log(`Console errors: ${consoleErrors.length}`)
    console.log(`Console warnings: ${consoleWarnings.length}`)
    
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((msg, i) => {
        console.error(`Error ${i + 1}:`, msg.text())
      })
    }
    
    expect(consoleErrors.length).toBe(0)
  })

  test('QA Audit: Navigate to 3 different games and verify info pages', async ({ page }) => {
    console.log('\n=== QA TEST 2: Game Navigation ===')
    
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.game-grid')).toBeVisible({ timeout: 10000 })
    
    const gameCards = page.locator('.game-card')
    const totalGames = await gameCards.count()
    const gamesToTest = Math.min(3, totalGames)
    
    console.log(`Testing navigation to ${gamesToTest} games out of ${totalGames} available`)
    
    for (let i = 0; i < gamesToTest; i++) {
      consoleErrors = []
      
      if (i > 0) {
        await page.goto('/', { waitUntil: 'networkidle' })
        await expect(page.locator('.game-grid')).toBeVisible()
      }
      
      const gameCard = page.locator('.game-card').nth(i)
      const gameName = await gameCard.locator('.game-name').textContent()
      console.log(`\nNavigating to game ${i + 1}: ${gameName}`)
      
      await gameCard.click()
      
      await expect(page.locator('.info-page')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('.info-title')).toBeVisible()
      
      const startButton = page.locator('button.btn-start')
      await expect(startButton).toBeVisible()
      
      await page.screenshot({ 
        path: `tests/qa-screenshots/game-${i + 1}-info.png`,
        fullPage: true 
      })
      
      console.log(`✓ Info page loaded for: ${gameName}`)
      
      if (consoleErrors.length > 0) {
        console.error(`Errors during ${gameName} navigation:`)
        consoleErrors.forEach((msg, idx) => {
          console.error(`  Error ${idx + 1}:`, msg.text())
        })
      }
      
      expect(consoleErrors.length).toBe(0)
    }
    
    console.log(`\n✓ Successfully navigated to ${gamesToTest} games`)
  })

  test('QA Audit: Verify shop loads in lobby', async ({ page }) => {
    console.log('\n=== QA TEST 3: Shop Navigation ===')
    
    consoleErrors = []
    
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator('.game-grid')).toBeVisible({ timeout: 10000 })
    
    const shopButton = page.locator('button.nav-btn[aria-label="商店"]')
    await expect(shopButton).toBeVisible()
    
    console.log('Clicking shop button...')
    await shopButton.click()
    
    await expect(page.locator('.shop-view')).toBeVisible({ timeout: 5000 })
    
    await page.screenshot({ 
      path: 'tests/qa-screenshots/shop.png',
      fullPage: true 
    })
    
    console.log('✓ Shop loaded successfully')
    
    if (consoleErrors.length > 0) {
      console.error('Errors during shop navigation:')
      consoleErrors.forEach((msg, i) => {
        console.error(`  Error ${i + 1}:`, msg.text())
      })
    }
    
    expect(consoleErrors.length).toBe(0)
  })

  test.afterAll(async () => {
    console.log('\n=== QA AUDIT COMPLETE ===')
    console.log('Screenshots saved to tests/qa-screenshots/')
    console.log('Check console output above for any issues')
  })
})
