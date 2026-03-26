import { test, expect } from '@playwright/test';
import {
  API_BASE,
  setupAuthenticatedPage,
  mockDashboardStats,
  mockPlaylists,
  mockGoals,
  mockSummaries,
} from './helpers/api-mocks';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockDashboardStats(page);
  });

  test('navigation bar is visible on dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: /youtube learning manager/i })).toBeVisible();
  });

  test('nav links are present for all main sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /playlists/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /progress/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /goals/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /ai summaries/i })).toBeVisible();
  });

  test('clicking Playlists nav link navigates to /playlists', async ({ page }) => {
    await mockPlaylists(page);
    await page.goto('/');
    await page.getByRole('link', { name: /playlists/i }).click();
    await expect(page).toHaveURL('/playlists');
  });

  test('clicking Progress nav link navigates to /progress', async ({ page }) => {
    await mockPlaylists(page);
    await page.goto('/');
    await page.getByRole('link', { name: /progress/i }).click();
    await expect(page).toHaveURL('/progress');
  });

  test('clicking Goals nav link navigates to /goals', async ({ page }) => {
    await mockGoals(page);
    await mockPlaylists(page);
    await page.goto('/');
    await page.getByRole('link', { name: /goals/i }).click();
    await expect(page).toHaveURL('/goals');
  });

  test('clicking AI Summaries nav link navigates to /summaries', async ({ page }) => {
    await mockSummaries(page);
    await mockPlaylists(page);
    await page.goto('/');
    await page.getByRole('link', { name: /ai summaries/i }).click();
    await expect(page).toHaveURL('/summaries');
  });

  test('logo link navigates to dashboard', async ({ page }) => {
    await mockPlaylists(page);
    await page.goto('/playlists');
    await page.getByRole('link', { name: /youtube learning manager/i }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('404 page shows for unknown route', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
    await expect(page.getByText(/oops! page not found/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /return to home/i })).toBeVisible();
  });

  test('Return to Home link on 404 page goes to /', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await page.route(`${API_BASE}/dashboard/stats`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            stats: { total_videos: 0, completed_videos: 0, total_watch_time: '0h', active_goals: 0, weekly_progress: 0 },
            recent_activities: [],
            recent_playlists: [],
          },
        }),
      });
    });
    await page.getByRole('link', { name: /return to home/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('privacy policy page renders correctly', async ({ page }) => {
    await page.goto('/privacy');
    await expect(
      page.getByRole('heading', { name: /privacy policy/i })
    ).toBeVisible();
    await expect(page.getByText(/information we collect/i)).toBeVisible();
  });

  test('terms of service page renders correctly', async ({ page }) => {
    await page.goto('/terms');
    await expect(
      page.getByRole('heading', { name: /terms of service/i })
    ).toBeVisible();
    await expect(page.getByText(/use of the app/i)).toBeVisible();
  });

  test('OAuth callback page redirects on missing params', async ({ page }) => {
    await page.goto('/auth/callback');
    // Should redirect somewhere (likely login) since no token param
    await page.waitForURL((url) => !url.pathname.startsWith('/auth'));
  });

  test('OAuth failure page renders', async ({ page }) => {
    await page.goto('/auth/failure');
    await expect(page.getByText(/failed/i).or(page.getByText(/error/i)).or(page.getByText(/login/i))).toBeVisible();
  });
});
