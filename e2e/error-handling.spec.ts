import { test, expect } from '@playwright/test';

test.describe('Error Handling & Notifications', () => {
  test('displays error toast when LLM service returns 503', async ({ page }) => {
    await page.goto('/');
    
    // Intercept the Edge Function call
    await page.route('**/functions/v1/engineer-prompt', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ 
            error: 'The AI service is currently unavailable.',
            errorCode: 'LLM_SERVICE_UNAVAILABLE' 
        }),
      });
    });

    // Fill input and submit
    await page.getByRole('textbox', { name: 'Your Input' }).fill('Test prompt');
    await page.getByRole('button', { name: 'Transform' }).click();

    // Check for toast notification
    await expect(page.locator('.fixed.bottom-4.right-4').getByText('The AI service is currently unavailable')).toBeVisible();
    
    // Also check for inline error display
    await expect(page.locator('.bg-red-50').getByText('The AI service is currently unavailable')).toBeVisible();
  });

  test('displays validation error for invalid input format', async ({ page }) => {
    await page.goto('/');
    
    await page.route('**/functions/v1/engineer-prompt', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
            error: 'Invalid input length.',
            errorCode: 'VALIDATION_ERROR' 
        }),
      });
    });

    await page.getByRole('textbox', { name: 'Your Input' }).fill('Too short');
    await page.getByRole('button', { name: 'Transform' }).click();

    // Validation errors might not show a toast (depending on App.tsx logic), 
    // but they should show the inline error.
    await expect(page.locator('text=Invalid input length')).toBeVisible();
  });
});
