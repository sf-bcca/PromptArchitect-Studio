import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Check using a less strict text match
  await expect(page.locator('h2').getByText('Engineer Perfect Prompts')).toBeVisible();
});

test('input field is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('textbox', { name: 'Your Input' })).toBeVisible();
});
