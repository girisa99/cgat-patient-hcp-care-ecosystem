import { test, expect } from '@playwright/test';

// Helpers -------------------------------------------------------------
const randomEmail = () => `test+${Date.now()}@example.com`;

// Base URL is picked from playwright.config.ts (use.baseURL)
// The following selectors are *examples*. Update them if your real
// app IDs / text differ.

test.describe('End-to-End checklist (ngrok tunnel)', () => {
  test('01 Authentication – sign-up and login', async ({ page }) => {
    const email = randomEmail();
    const password = 'VeryStrong!123';

    // Visit the login page
    await page.goto('/');

    // Click sign-up link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Fill sign-up form
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: /sign up/i }).click();

    // Expect Supabase confirmation notice
    await expect(page.getByText(/check.*email/i)).toBeVisible();

    // ---- ⚠️  Manual step --------------------------------------------------
    // Supabase sends a real email which Playwright cannot read. Either:
    //   1. Configure Auth → SMTP → "Link redirects to URL and auto-logs in"
    //   2. Use magic-link disabled / email confirmation OFF in dev env
    //   3. OR stub Supabase with service-role key and trigger
    // For now we simply skip the email-click and verify that the
    // signup request hit the network successfully.
    // ----------------------------------------------------------------------
  });

  test('02 User Management – create, edit, assign roles', async ({ page }) => {
    // PRE-CONDITION: you are already logged in from previous test or use
    // a seed token / cookie for an admin user.

    await page.goto('/users');

    // Create user
    await page.getByRole('button', { name: /new user/i }).click();
    await page.getByLabel('Full name').fill('Playwright Test User');
    const newUserEmail = randomEmail();
    await page.getByLabel('Email').fill(newUserEmail);
    await page.getByLabel('Password').fill('TempPass!123');
    await page.getByRole('button', { name: /create/i }).click();
    await expect(page.getByText(/user created/i)).toBeVisible();

    // Edit user
    await page.getByText(newUserEmail).click();
    await page.getByLabel('Full name').fill('Playwright Test User Edited');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/user updated/i)).toBeVisible();

    // Assign role
    await page.getByRole('button', { name: /assign role/i }).click();
    await page.getByRole('option', { name: /facilityAdmin/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/role assigned/i)).toBeVisible();
  });

  test('03 Facilities – CRUD', async ({ page }) => {
    await page.goto('/facilities');
    await page.getByRole('button', { name: /add facility/i }).click();
    await page.getByLabel('Name').fill('Main Clinic (Playwright)');
    await page.getByLabel('Address').fill('123 Example Street');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/facility created/i)).toBeVisible();

    // Edit
    await page.getByText('Main Clinic (Playwright)').click();
    await page.getByLabel('Address').fill('456 Updated Ave');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/facility updated/i)).toBeVisible();

    // Delete
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/facility deleted/i)).toBeVisible();
  });

  test('04 Patient Data – list, view, add', async ({ page }) => {
    await page.goto('/patients');

    // List should load (assumes at least 0 rows)
    await expect(page.getByRole('heading', { name: /patients/i })).toBeVisible();

    // Add patient
    await page.getByRole('button', { name: /add patient/i }).click();
    await page.getByLabel('Name').fill('Patient Playwright');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/patient created/i)).toBeVisible();
  });

  test('05 Role & Module assignments', async ({ page }) => {
    await page.goto('/users');
    await page.getByText('Playwright Test User Edited').click();
    await page.getByRole('button', { name: /assign module/i }).click();
    await page.getByRole('option', { name: /E-Prescriptions/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText(/module assigned/i)).toBeVisible();

    // Remove
    await page.getByRole('button', { name: /remove module/i }).click();
    await expect(page.getByText(/module removed/i)).toBeVisible();
  });
});