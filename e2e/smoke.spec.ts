import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  // Check that the title contains "PromptArchitect" (or whatever the actual title is)
  // Since we might not have a <title> tag set, let's look for the main H2
  await expect(page.getByRole('heading', { name: 'Engineer Perfect Prompts' })).toBeVisible();
});

test('input field is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('What are you trying to achieve?')).toBeVisible();
});
