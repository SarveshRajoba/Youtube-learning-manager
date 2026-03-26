import { test, expect } from '@playwright/test';
import {
  API_BASE,
  setupAuthenticatedPage,
  mockPlaylists,
  MOCK_PLAYLISTS,
} from './helpers/api-mocks';

test.describe('Progress', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockPlaylists(page);
  });

  test('renders the progress page heading', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByRole('heading', { name: /learning progress/i })).toBeVisible();
  });

  test('search input is visible', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByPlaceholder(/search playlists/i)).toBeVisible();
  });

  test('displays playlists with their titles', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByText('React for Beginners')).toBeVisible();
    await expect(page.getByText('Node.js Crash Course')).toBeVisible();
  });

  test('searching filters playlists', async ({ page }) => {
    await page.goto('/progress');
    await page.getByPlaceholder(/search playlists/i).fill('React');
    await expect(page.getByText('React for Beginners')).toBeVisible();
    await expect(page.getByText('Node.js Crash Course')).not.toBeVisible();
  });

  test('empty state shown when no playlists', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.route(`${API_BASE}/playlists`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route(`${API_BASE}/playlists/**`, (route) => route.continue());

    await page.goto('/progress');
    await expect(page.getByText(/no playlists yet/i)).toBeVisible();
    await expect(page.getByText(/import your first playlist/i)).toBeVisible();
  });

  test('search empty state shown when search has no matches', async ({ page }) => {
    await page.goto('/progress');
    await page.getByPlaceholder(/search playlists/i).fill('nonexistentxyz');
    await expect(page.getByText(/no playlists found/i)).toBeVisible();
  });
});
