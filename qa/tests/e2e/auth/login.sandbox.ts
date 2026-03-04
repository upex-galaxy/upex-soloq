import { expect, test } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://dojo.upexgalaxy.com/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    const emailInput = page.getByTestId('lgin-email-inputo');
    await emailInput.fill('testuser@upex.dev');
    const passwordInput = page.getByTestId('login-password-input');
    await passwordInput.fill('Test123!');
    const submitButton = page.getByTestId('login-submit-button');
    await submitButton.click();
    await page.waitForURL('https://dojo.upexgalaxy.com/dashboard');
    await expect(page).toHaveURL('https://dojo.upexgalaxy.com/dashboard');
  });
});
