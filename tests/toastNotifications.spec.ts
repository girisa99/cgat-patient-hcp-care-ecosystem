import { test, expect } from '@playwright/test';

// Helper to wait for toast to disappear
async function expectToast(page: any) {
  const toast = page.getByRole('alert');
  await expect(toast).toBeVisible();
  // wait until it disappears (max 6 s default Radix Toast)
  await expect(toast).toBeHidden({ timeout: 8000 });
}

test.describe('Toast notifications', () => {
  const BASE = process.env.E2E_BASE_URL || 'http://localhost:5173';

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
  });

  test('Profiles / Users page', async ({ page }) => {
    await page.getByRole('link', { name: /users|profiles/i }).click();
    await page.getByRole('button', { name: /new/i }).click();
    await page.getByLabel(/first name/i).fill('Toast');
    await page.getByLabel(/last name/i).fill('Test');
    await page.getByRole('button', { name: /save/i }).click();
    await expectToast(page);
  });

  test('Facilities page', async ({ page }) => {
    await page.getByRole('link', { name: /facilities/i }).click();
    await page.getByRole('button', { name: /new/i }).click();
    await page.getByLabel(/name/i).fill('Toast Facility');
    await page.getByRole('button', { name: /save/i }).click();
    await expectToast(page);
  });

  test('Roles page', async ({ page }) => {
    await page.getByRole('link', { name: /roles/i }).click();
    await page.getByRole('button', { name: /new/i }).click();
    await page.getByLabel(/role name/i).fill('toast_role');
    await page.getByRole('button', { name: /save/i }).click();
    await expectToast(page);
  });

  test('Active Issues page', async ({ page }) => {
    await page.getByRole('link', { name: /issues/i }).click();
    await page.getByRole('button', { name: /new/i }).click();
    await page.getByLabel(/title/i).fill('Toast Issue');
    await page.getByRole('button', { name: /save/i }).click();
    await expectToast(page);
  });

  test('Issue Fixes page', async ({ page }) => {
    await page.getByRole('link', { name: /fixes/i }).click();
    await page.getByRole('button', { name: /new/i }).click();
    await page.getByLabel(/description/i).fill('Toast Fix');
    await page.getByRole('button', { name: /save/i }).click();
    await expectToast(page);
  });
});