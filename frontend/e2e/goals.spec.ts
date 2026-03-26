import { test, expect } from '@playwright/test';
import {
  API_BASE,
  setupAuthenticatedPage,
  mockGoals,
  mockPlaylists,
} from './helpers/api-mocks';

test.describe('Goals', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockGoals(page);
    await mockPlaylists(page);
  });

  test('renders the goals page heading', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.getByRole('heading', { name: /goals & todos/i })).toBeVisible();
    await expect(page.getByText(/manage your learning goals/i)).toBeVisible();
  });

  test('displays existing goals', async ({ page }) => {
    await page.goto('/goals');
    await expect(page.getByText('Finish React Course')).toBeVisible();
    await expect(page.getByText('Complete all React videos')).toBeVisible();
  });

  test('create goal button opens dialog', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: /create goal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create new goal/i })).toBeVisible();
    await expect(page.getByLabel(/goal title/i)).toBeVisible();
  });

  test('shows validation error when creating goal without title', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: /create goal/i }).click();
    await page.getByRole('button', { name: /create goal/i, exact: true }).last().click();
    await expect(page.getByText(/please enter a title/i)).toBeVisible();
  });

  test('successfully creates a new goal', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: /create goal/i }).first().click();
    await page.getByLabel(/goal title/i).fill('New Learning Goal');
    await page.getByRole('button', { name: /create goal/i }).last().click();
    // The new goal should appear (mock returns it, page re-fetches)
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('shows empty state when no goals exist', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.route(`${API_BASE}/goals`, (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] }),
        });
      } else {
        route.continue();
      }
    });
    await page.route(`${API_BASE}/goals/**`, (route) => route.continue());
    await mockPlaylists(page);

    await page.goto('/goals');
    await expect(page.getByText(/no goals yet/i)).toBeVisible();
    await expect(page.getByText(/create your first goal/i)).toBeVisible();
  });
});
