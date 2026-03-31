import { test, expect } from '@playwright/test'

test('metadata caching for TSF Jazz', async ({ page }) => {
  // Counters for intercepted requests
  let tsfCount = 0
  let grrifCount = 0

  // Intercept TSF Jazz metadata POST (proxied in dev)
  await page.route('**/proxy/www.tsfjazz.com/player/qect', async (route) => {
    tsfCount++
    const nowSec = Math.floor(Date.now() / 1000)
    const body = {
      current: {
        title: 'Test Title',
        artist: 'Test Artist',
        cover: 'https://example.com/cover.jpg',
        start_time: nowSec - 10,
        duration: 120,
      },
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })

  // Intercept GRRIF requests (return empty array)
  await page.route('**/proxy/www.grrif.ch/live/covers.json', async (route) => {
    grrifCount++
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  // Open app
  await page.goto('http://localhost:5174/diapason/')

  // Select TSF Jazz station by clicking the station button
  await page.getByRole('button', { name: 'TSF Jazz' }).click()

  // Wait until cache helper exposes at least one cached entry
  await page.waitForFunction(() => {
    // @ts-ignore
    return (
      typeof window.__getAllCachedMetadata === 'function' &&
      Object.keys(window.__getAllCachedMetadata()).length > 0
    )
  })

  // Ensure we observed at least one TSF request and cache contains tsfjazz
  expect(tsfCount).toBeGreaterThanOrEqual(1)

  const cache = await page.evaluate(() => {
    // @ts-ignore
    return window.__getAllCachedMetadata ? window.__getAllCachedMetadata() : {}
  })

  expect(cache.tsfjazz).toBeTruthy()
  const track = cache.tsfjazz
  expect(track.startedAt).toBeDefined()
  expect(track.duration).toBeDefined()
  const now = Math.floor(Date.now() / 1000)
  expect(track.startedAt + track.duration).toBeGreaterThan(now)

  // Remember how many TSF requests happened so far
  const initialTsfCount = tsfCount

  // Switch away to GRRIF then quickly back to TSF Jazz
  await page.getByRole('button', { name: 'GRRIF' }).click()
  await page.getByRole('button', { name: 'TSF Jazz' }).click()

  // Small delay to allow any additional requests
  await page.waitForTimeout(500)

  // TSF request count should not have increased (cache used)
  expect(tsfCount).toBe(initialTsfCount)
})
