import { test, expect } from '@playwright/test';
import {
  API_BASE,
  MOCK_TOKEN,
  MOCK_PROFILE,
  MOCK_DASHBOARD_STATS,
  setupAuthenticatedPage,
  mockDashboardStats,
} from './helpers/api-mocks';

test.describe('Authentication', () => {
  test('login page renders all required elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /welcome to youtube-manager/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('signup page renders all required elements', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /join learntube/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('login link on signup page navigates to login', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('signup link on login page navigates to signup', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('successful login stores token and redirects to dashboard', async ({ page }) => {
    await page.route(`${API_BASE}/login`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'Logged in.' },
          token: MOCK_TOKEN,
          data: { email: 'test@example.com' },
        }),
      });
    });
    await mockDashboardStats(page);
    await page.route(`${API_BASE}/profile`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PROFILE),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await page.waitForURL('/');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBe(MOCK_TOKEN);
  });

  test('failed login shows error toast', async ({ page }) => {
    await page.route(`${API_BASE}/login`, (route) => {
      // Use 422 (not 401) so the api.ts 401 interceptor does not trigger a page reload
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid email or password.' }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByText('Login Failed')).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL('/login');
  });

  test('successful signup stores token and redirects to dashboard', async ({ page }) => {
    await page.route(`${API_BASE}/signup`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 200, message: 'Signed up.' },
          token: MOCK_TOKEN,
          data: { email: 'newuser@example.com' },
        }),
      });
    });
    await mockDashboardStats(page);
    await page.route(`${API_BASE}/profile`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PROFILE),
      });
    });

    await page.goto('/signup');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');
    await page.getByRole('button', { name: /sign up/i }).click();

    await page.waitForURL('/');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBe(MOCK_TOKEN);
  });

  test('signup shows error when passwords do not match', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password', { exact: true }).fill('password123');
    await page.getByLabel('Confirm Password').fill('different456');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    await expect(page).toHaveURL('/signup');
  });

  test('logout clears token and redirects to login', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockDashboardStats(page);
    await page.goto('/');

    await page.waitForSelector('nav');
    // Open user avatar dropdown
    await page.locator('nav').getByRole('button', { name: '' }).last().click();
    await page.getByRole('menuitem', { name: /logout/i }).click();

    await expect(page).toHaveURL('/login');
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });
});
