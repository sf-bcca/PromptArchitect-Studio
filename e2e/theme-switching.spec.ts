import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should switch between light and dark themes and persist the setting', async ({ page }) => {
    // Mock Supabase auth before navigating
    await page.addInitScript(() => {
      // Create a mock session
      const mockSession = {
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        },
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer'
      };

      // Set localStorage for Supabase
      const storageKey = 'sb-localhost-auth-token';
      localStorage.setItem(storageKey, JSON.stringify({
        currentSession: mockSession,
        expiresAt: mockSession.expires_at
      }));
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
