import { test, expect } from '@playwright/test';

test.describe('Theme Switching', () => {
  test('should switch between light and dark themes and persist the setting', async ({ page }) => {
    await page.goto('/');

    // Mock Supabase auth to return a valid session
    await page.addInitScript(() => {
      // Mock Supabase client before any modules load
      (window as any).__supabaseSession = {
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        },
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'bearer'
      };

      // Override fetch to mock Supabase auth endpoints
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0]?.toString() || '';
        
        // Mock getSession call
        if (url.includes('/auth/v1/user')) {
          return Promise.resolve(new Response(JSON.stringify((window as any).__supabaseSession.user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        return originalFetch.apply(this, args as any);
      };
    });

    // Set the session in localStorage for Supabase client
    await page.evaluate(() => {
      const session = (window as any).__supabaseSession;
      const authKey = Object.keys(localStorage).find(k => k.includes('supabase.auth.token'));
      const storageKey = authKey || 'sb-' + window.location.hostname.split('.')[0] + '-auth-token';
      
      localStorage.setItem(storageKey, JSON.stringify({
        currentSession: session,
        expiresAt: session.expires_at
      }));
    });

    await page.reload();

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
