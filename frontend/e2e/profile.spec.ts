import { test, expect } from '@playwright/test';
import {
  API_BASE,
  MOCK_PROFILE,
  setupAuthenticatedPage,
} from './helpers/api-mocks';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
  });

  test('renders the profile page heading', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByRole('heading', { name: /profile settings/i })).toBeVisible();
  });

  test('displays user email in the email field', async ({ page }) => {
    await page.goto('/profile');
    // Email is in a disabled input element; check its value via Playwright's input value assertion
    await expect(page.locator('#email')).toHaveValue(MOCK_PROFILE.data.email);
  });

  test('displays user name in the profile section', async ({ page }) => {
    await page.goto('/profile');
    // Name shown under the avatar in the Basic Information card
    const profileSection = page.locator('[class*="card"]').filter({ hasText: 'Basic Information' });
    await expect(profileSection.getByText(MOCK_PROFILE.data.name)).toBeVisible();
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
    await page.getByRole('button', { name: 'Edit' }).click();
    // The CardHeader "Edit" button becomes "Cancel"; Save Changes button also appears in the card content
    const basicInfoCard = page.locator('[class*="card"]').filter({ hasText: 'Basic Information' });
    // First Cancel button in the card is the CardHeader toggle
    await expect(basicInfoCard.getByRole('button', { name: 'Cancel' }).first()).toBeVisible();
    await expect(basicInfoCard.getByRole('button', { name: /save changes/i })).toBeVisible();
  });

  test('cancel button exits edit mode', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Edit' }).click();
    // Use the first Cancel button (CardHeader toggle button)
    const basicInfoCard = page.locator('[class*="card"]').filter({ hasText: 'Basic Information' });
    await basicInfoCard.getByRole('button', { name: 'Cancel' }).first().click();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
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
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Full Name').fill('Updated User');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText('Profile updated').first()).toBeVisible({ timeout: 8000 });
  });

  test('security section with change password option is visible', async ({ page }) => {
    await page.goto('/profile');
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
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('currentpass');
    await passwordInputs.nth(1).fill('newpass123');
    await passwordInputs.nth(2).fill('differentpass');
    await page.getByRole('button', { name: /update password/i }).click();
    await expect(page.getByText(/passwords don't match/i)).toBeVisible({ timeout: 8000 });
  });
});
