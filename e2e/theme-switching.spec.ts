import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should switch between light and dark themes and persist the setting', async ({ page }) => {
    // By-pass login by setting a dummy session
    await page.goto('/');
    await page.evaluate(() => {
      const session = {
        user: { id: 'test-user-id', email: 'test@example.com' },
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      };
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    });
    await page.reload();

    // Open the settings panel
    await page.locator('button[aria-label="Settings"]').waitFor({ state: 'visible' });
    await page.locator('button[aria-label="Settings"]').click();

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

    // Open the settings panel again
    await page.getByRole('button', { name: 'Settings' }).click();

    // Switch back to dark mode
    await page.getByRole('button', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveClass('dark');

    // Verify localStorage
    theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });
});
