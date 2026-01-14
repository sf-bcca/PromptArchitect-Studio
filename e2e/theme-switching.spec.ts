import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should switch between light and dark themes and persist the setting', async ({ page }) => {
    // Intercept Supabase auth requests and mock them
    await page.route('**/auth/v1/**', async (route) => {
      const url = route.request().url();
      
      if (url.includes('/session')) {
        // Mock getSession response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: 'mock-access-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              aud: 'authenticated',
              role: 'authenticated'
            }
          })
        });
      } else if (url.includes('/user')) {
        // Mock user endpoint
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated'
          })
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/');

    // Wait for authenticated UI to load
    await page.locator('button[aria-label="Settings"]').waitFor({ state: 'visible', timeout: 15000 });

    // Open the settings panel
    await page.locator('button[aria-label="Settings"]').click();

    // Wait for settings panel to open
    await page.locator('text=Studio Settings').waitFor({ state: 'visible' });

    // Check default theme is dark
    await expect(page.locator('html')).toHaveClass('dark');

    // Switch to light mode
    await page.getByRole('button', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveClass('light');

    // Verify localStorage
    let theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('light');

    // Reload the page and check if the theme persists
    await page.reload();
    await expect(page.locator('html')).toHaveClass('light');

    // Wait for authenticated UI after reload
    await page.locator('button[aria-label="Settings"]').waitFor({ state: 'visible', timeout: 15000 });

    // Open the settings panel again
    await page.locator('button[aria-label="Settings"]').click();

    // Wait for settings panel
    await page.locator('text=Studio Settings').waitFor({ state: 'visible' });

    // Switch back to dark mode
    await page.getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass('dark');

    // Verify localStorage
    theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });
});
