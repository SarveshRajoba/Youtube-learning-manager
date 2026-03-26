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
  });

  test('create goal button opens dialog', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: /create goal/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create new goal/i })).toBeVisible();
    await expect(page.getByLabel(/goal title/i)).toBeVisible();
  });

  test('shows validation error when creating goal without title', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: /create goal/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Clicking submit with an empty required input triggers browser native validation
    // The dialog should remain open because submission is blocked
    await page.getByRole('dialog').getByRole('button', { name: /create goal/i }).click();
    // Dialog stays open when submission fails
    await expect(page.getByRole('dialog')).toBeVisible();
    // The title input should have a validation message (HTML5 required validation)
    const titleInput = page.getByRole('dialog').locator('#title');
    const validationMessage = await titleInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('successfully creates a new goal', async ({ page }) => {
    await page.goto('/goals');
    await page.getByRole('button', { name: /create goal/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/goal title/i).fill('New Learning Goal');
    await page.getByRole('dialog').getByRole('button', { name: /create goal/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8000 });
  });
});

test.describe('Goals - Empty State', () => {
  test('shows empty state when no goals exist', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockPlaylists(page);
    await page.route(`${API_BASE}/goals`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.route(`${API_BASE}/goals/**`, (route) => {
      route.fulfill({ status: 204 });
    });

    await page.goto('/goals');
    await expect(page.getByText(/no goals yet/i)).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/create your first goal/i).first()).toBeVisible();
  });
});
