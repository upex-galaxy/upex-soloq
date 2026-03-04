import { test } from '@playwright/test';

test.describe('Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('https://dojo.upexgalaxy.com/login', { waitUntil: 'domcontentloaded' });
  });
});
