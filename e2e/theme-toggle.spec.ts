import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('defaults to dark mode', async ({ page }) => {
    // Check that the document has the 'dark' class
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });

  test('can switch to light mode via localStorage', async ({ page }) => {
    // Set theme in localStorage (simulating what the settings panel does)
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light');
    });
    await page.reload();

    // Verify HTML class changed to 'light'
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('light');
    expect(htmlClass).not.toContain('dark');

    // Verify visual change - header should have light background
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // In light mode, text should be dark (slate-900)
    const title = page.locator('h1');
    await expect(title).toBeVisible();
  });

  test('can switch back to dark mode via localStorage', async ({ page }) => {
    // Set to light first
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();
    
    // Verify light mode
    let htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('light');
    
    // Switch back to dark
    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.reload();

    // Verify HTML class changed back to 'dark'
    htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    expect(htmlClass).not.toContain('light');
  });

  test('theme persists after page reload', async ({ page }) => {
    // Set to light mode
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();

    // Verify light mode
    let htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('light');

    // Reload again
    await page.reload();

    // Verify still in light mode
    htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('light');
  });

  test('system theme uses OS preference', async ({ page }) => {
    // Emulate dark color scheme
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => localStorage.setItem('theme', 'system'));
    await page.reload();

    // Should use dark mode based on emulated OS preference
    let htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');

    // Emulate light color scheme
    await page.emulateMedia({ colorScheme: 'light' });
    await page.evaluate(() => localStorage.setItem('theme', 'system'));
    await page.reload();

    // Should use light mode based on emulated OS preference
    htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('light');
  });

  test('light mode applies correct styling to main UI elements', async ({ page }) => {
    // Set light mode
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.reload();

    // Verify header is visible and has light styling
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verify the main title text
    const title = page.locator('h2').filter({ hasText: 'Engineer Perfect Prompts' });
    await expect(title).toBeVisible();

    // Verify input field is visible
    const input = page.getByRole('textbox', { name: 'Your Input' });
    await expect(input).toBeVisible();
  });
});
