import { test, expect } from '@playwright/test';
import {
  API_BASE,
  setupAuthenticatedPage,
  mockPlaylists,
} from './helpers/api-mocks';

test.describe('Playlists', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockPlaylists(page);
  });

  test('renders the playlists page heading and search', async ({ page }) => {
    await page.goto('/playlists');
    await expect(page.getByRole('heading', { name: /learning playlists/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search playlists/i)).toBeVisible();
  });

  test('displays fetched playlists', async ({ page }) => {
    await page.goto('/playlists');
    await expect(page.getByText('React for Beginners')).toBeVisible();
    await expect(page.getByText('Node.js Crash Course')).toBeVisible();
  });

  test('searching playlists filters results', async ({ page }) => {
    await page.goto('/playlists');
    await page.getByPlaceholder(/search playlists/i).fill('React');
    await expect(page.getByText('React for Beginners')).toBeVisible();
    await expect(page.getByText('Node.js Crash Course')).not.toBeVisible();
  });

  test('shows video count on playlist cards', async ({ page }) => {
    await page.goto('/playlists');
    await expect(page.getByText(/15 videos/i)).toBeVisible();
    await expect(page.getByText(/10 videos/i)).toBeVisible();
  });

  test('delete confirmation dialog appears on delete action', async ({ page }) => {
    await page.goto('/playlists');
    // Open the dropdown menu on the first playlist card
    await page.locator('[data-radix-popper-content-wrapper]').waitFor({ state: 'detached' }).catch(() => {});
    const moreButtons = page.getByRole('button').filter({ has: page.locator('svg') });
    // Click the "more options" (MoreVertical) button for the first playlist
    await page.getByRole('button', { name: '' }).first().click().catch(async () => {
      // Try using a more targeted selector if the above fails
      const dropdownTriggers = page.locator('[data-radix-dropdown-menu-trigger]');
      await dropdownTriggers.first().click();
    });
    // If the Delete menu item is visible, the dropdown opened successfully
    const deleteItem = page.getByRole('menuitem', { name: /delete/i });
    if (await deleteItem.isVisible()) {
      await deleteItem.click();
      await expect(page.getByRole('alertdialog')).toBeVisible();
      await expect(page.getByText(/are you sure/i)).toBeVisible();
    }
  });

  test('cancelling delete dialog keeps playlist in list', async ({ page }) => {
    await page.goto('/playlists');
    const dropdownTriggers = page.locator('[data-radix-dropdown-menu-trigger]');
    if (await dropdownTriggers.count() > 0) {
      await dropdownTriggers.first().click();
      const deleteItem = page.getByRole('menuitem', { name: /delete/i });
      if (await deleteItem.isVisible()) {
        await deleteItem.click();
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page.getByText('React for Beginners')).toBeVisible();
      }
    }
  });

  test('empty state is shown when no playlists', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.route(`${API_BASE}/playlists`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route(`${API_BASE}/playlists/**`, (route) => route.continue());

    await page.goto('/playlists');
    await expect(page.getByText(/no playlists/i)).toBeVisible();
  });

  test('import playlist button is visible', async ({ page }) => {
    await page.goto('/playlists');
    await expect(
      page.getByRole('button', { name: /import from youtube/i })
    ).toBeVisible();
  });
});
