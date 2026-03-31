import { test, expect } from '@playwright/test'

test('shows vinyl placeholder when cover image returns 404', async ({ page }) => {
  // Intercept TSF Jazz metadata and provide a cover URL that will 404
  await page.route('**/proxy/www.tsfjazz.com/player/qect', async (route) => {
    const now = Math.floor(Date.now() / 1000)
    const body = {
      current: {
        title: 'Image Fail Title',
        artist: 'Image Fail Artist',
        cover: 'https://example.com/missing-cover.jpg',
        start_time: now - 10,
        duration: 120,
      },
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })

  // Intercept the image request and return 404
  await page.route('**/missing-cover.jpg', async (route) => {
    await route.fulfill({ status: 404, contentType: 'image/jpeg', body: '' })
  })

  // Open the app
  await page.goto('http://localhost:5174/diapason/')

  // Select TSF Jazz station
  await page.getByRole('button', { name: 'TSF Jazz' }).click()

  // Wait for the vinyl placeholder text to appear (the SVG contains the text "DIAPASON")
  await expect(page.getByText('DIAPASON')).toBeVisible({ timeout: 3000 })

  // Ensure the image element for the cover is not visible
  const img = page.locator('img[alt^="Pochette de"]')
  await expect(img).toBeHidden()
})
