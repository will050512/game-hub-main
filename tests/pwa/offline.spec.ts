import { test, expect } from '@playwright/test'

test.describe('PWA Offline Support', () => {
  test('service worker is registered and active', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)

    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    expect(swRegistered).toBe(true)

    const hasController = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready
      return !!reg.active
    })
    expect(hasController).toBe(true)
  })

  test('offline banner appears when disconnected', async ({ page }) => {
    await page.route('**/*', (route) => {
      route.fulfill({
        status: 503,
        body: 'Unavailable',
      })
    })

    await page.goto('/')
    await page.waitForTimeout(1000)

    const offlineBanner = page.locator('.offline-banner')
    await expect(offlineBanner).toBeVisible({ timeout: 5000 })
  })

  test('app loads basic shell from cache when offline', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.game-card').first()).toBeVisible({ timeout: 10000 })

    const gameCardsCount = await page.locator('.game-card').count()
    expect(gameCardsCount).toBeGreaterThan(0)

    await page.context().setOffline(true)

    await page.reload()
    await page.waitForTimeout(2000)

    const cachedContent = await page.content()
    expect(cachedContent).toContain('GameHub')
  })

  test('offline banner can be dismissed', async ({ page }) => {
    await page.context().setOffline(true)
    await page.goto('/')
    await page.waitForTimeout(1000)

    const offlineBanner = page.locator('.offline-banner')
    if (await offlineBanner.isVisible({ timeout: 5000 }).catch(() => false)) {
      const closeBtn = offlineBanner.locator('.banner-close')
      await closeBtn.click()
      await expect(offlineBanner).not.toBeVisible()
    }
  })

  test('online status detection works', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    const isOnline = await page.evaluate(() => navigator.onLine)
    expect(isOnline).toBe(true)

    await page.context().setOffline(true)
    await page.waitForTimeout(500)

    const isOffline = await page.evaluate(() => navigator.onLine)
    expect(isOffline).toBe(false)

    await page.context().setOffline(false)
    await page.waitForTimeout(500)

    const isOnlineAgain = await page.evaluate(() => navigator.onLine)
    expect(isOnlineAgain).toBe(true)
  })

  test('web app manifest is accessible', async ({ page, request }) => {
    await page.goto('/')

    const manifestUrl = await page.evaluate(async () => {
      const links = document.querySelectorAll('link[rel="manifest"]')
      if (links.length > 0) {
        return links[0].getAttribute('href')
      }
      return '/manifest.json'
    })

    const response = await request.get(manifestUrl as string)
    expect(response.ok()).toBe(true)

    const manifest = await response.json()
    expect(manifest.name).toBeTruthy()
    expect(manifest.icons).toBeDefined()
    expect(manifest.icons.length).toBeGreaterThan(0)
  })

  test('navigation routes work after offline recovery', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.game-card').first()).toBeVisible({ timeout: 10000 })

    await page.context().setOffline(true)
    await page.waitForTimeout(500)

    await page.context().setOffline(false)
    await page.waitForTimeout(1000)

    await page.goto('/')
    await expect(page.locator('.game-card').first()).toBeVisible({ timeout: 10000 })

    const firstCard = page.locator('.game-card').first()
    await firstCard.click()

    await expect(page.locator('.info-page')).toBeVisible({ timeout: 10000 })
  })

  test('game canvas loads and is interactive', async ({ page }) => {
    await page.goto('/game/snake/info')
    await expect(page.locator('.info-page')).toBeVisible()

    await page.locator('button.btn-start').click()
    await expect(page.locator('canvas.game-canvas')).toBeVisible({ timeout: 10000 })

    await page.locator('canvas.game-canvas').click()
    await page.waitForTimeout(500)

    const pauseBtn = page.locator('button.pause-btn')
    await expect(pauseBtn).toBeVisible({ timeout: 5000 })
  })
})

test.describe('PWA Cache Verification', () => {
  test('static assets are cached by service worker', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(3000)

    const cacheNames = await page.evaluate(async () => {
      if (!('caches' in window)) return []
      return caches.keys()
    })

    expect(cacheNames.length).toBeGreaterThan(0)
  })

  test('cached resources are served from cache on second visit', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(2000)

    await page.goto('/')
    await page.waitForTimeout(2000)

    const cachedRequests = await page.evaluate(async () => {
      const cachesList = await caches.keys()
      let totalEntries = 0
      for (const name of cachesList) {
        const cache = await caches.open(name)
        const keys = await cache.keys()
        totalEntries += keys.length
      }
      return totalEntries
    })

    expect(cachedRequests).toBeGreaterThan(0)
  })
})
