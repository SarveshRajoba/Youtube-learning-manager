import { test, expect } from '@playwright/test';
import {
  API_BASE,
  MOCK_PROFILE,
  setupAuthenticatedPage,
  mockProfilePassword,
} from './helpers/api-mocks';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('renders the profile page heading', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /profile settings/i })).toBeVisible();
  });

  test('displays user email and name', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(MOCK_PROFILE.data.email)).toBeVisible();
    await expect(page.getByText(MOCK_PROFILE.data.name)).toBeVisible();
  });

  test('displays member since date', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(/member since/i)).toBeVisible();
  });

  test('displays total playlists count', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(/total playlists/i)).toBeVisible();
    await expect(page.getByText(String(MOCK_PROFILE.data.playlists_count))).toBeVisible();
  });

  test('edit button toggles edit mode', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('cancel button exits edit mode', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
  });

  test('successfully saves profile changes', async ({ page }) => {
    await page.route(`${API_BASE}/profile`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_PROFILE),
        });
      } else if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { ...MOCK_PROFILE.data, name: 'Updated User' } }),
        });
      } else {
        route.continue();
      }
    });

    await page.goto('/profile');
    await page.getByRole('button', { name: /edit/i }).click();
    const nameInput = page.getByLabel(/display name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Updated User');
    }
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test('security section with change password option is visible', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText(/security/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /change password/i })).toBeVisible();
  });

  test('change password form appears when button clicked', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: /change password/i }).click();
    await expect(page.getByRole('button', { name: /update password/i })).toBeVisible();
  });

  test('shows error when new passwords do not match', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: /change password/i }).click();
    const passwordInputs = page.getByRole('textbox');
    // Fill current password, new password, and mismatched confirm
    const allInputs = page.locator('input[type="password"]');
    await allInputs.nth(0).fill('currentpass');
    await allInputs.nth(1).fill('newpass123');
    await allInputs.nth(2).fill('differentpass');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByText(/passwords don't match/i)).toBeVisible();
  });
});
