import { test, expect } from '@playwright/test';
import {
  API_BASE,
  MOCK_DASHBOARD_STATS,
  setupAuthenticatedPage,
  mockDashboardStats,
} from './helpers/api-mocks';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockDashboardStats(page);
  });

  test('displays stats cards with data', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Videos Completed')).toBeVisible();
    await expect(page.getByText('Total Watch Time')).toBeVisible();
    await expect(page.getByText('Active Goals')).toBeVisible();
    const { stats } = MOCK_DASHBOARD_STATS.data;
    await expect(page.getByText(`${stats.completed_videos}/${stats.total_videos}`)).toBeVisible();
    await expect(page.getByText(stats.total_watch_time)).toBeVisible();
    await expect(page.getByText(String(stats.active_goals))).toBeVisible();
  });

  test('displays recent activity section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText('Introduction to React')).toBeVisible();
    await expect(page.getByText('React Course')).toBeVisible();
    await expect(page.getByText('2 hours ago')).toBeVisible();
  });

  test('displays recent playlists section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Recent Playlists')).toBeVisible();
    await expect(page.getByText('React for Beginners')).toBeVisible();
  });

  test('shows quick action buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /import playlist/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /view progress/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /set goals/i })).toBeVisible();
  });

  test('welcome message is displayed', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/welcome back/i)).toBeVisible();
    await expect(page.getByText(/here's your learning progress overview/i)).toBeVisible();
  });

  test('quick action links navigate to the correct pages', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockDashboardStats(page);
    // Mock playlists for the /playlists redirect
    await page.route(`${API_BASE}/playlists`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.goto('/');
    await page.getByRole('link', { name: /import playlist/i }).click();
    await expect(page).toHaveURL('/playlists');
  });

  test('view all playlists link works', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockDashboardStats(page);
    await page.route(`${API_BASE}/playlists`, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.goto('/');
    await page.getByRole('link', { name: /view all/i }).click();
    await expect(page).toHaveURL('/playlists');
  });

  test('unauthenticated user is redirected to login on 401', async ({ page }) => {
    await page.route(`${API_BASE}/dashboard/stats`, (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      });
    });

    await page.goto('/');
    await page.waitForURL('/login');
    await expect(page).toHaveURL('/login');
  });

  test('/dashboard route also renders the dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Videos Completed')).toBeVisible();
  });
});
