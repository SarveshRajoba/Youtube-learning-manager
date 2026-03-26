import { Page } from '@playwright/test';

export const API_BASE = 'http://localhost:3000';
export const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-test-token';

export const MOCK_PROFILE = {
  data: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
    playlists_count: 3,
  },
};

export const MOCK_DASHBOARD_STATS = {
  data: {
    stats: {
      total_videos: 42,
      completed_videos: 18,
      total_watch_time: '12h 30m',
      active_goals: 3,
      weekly_progress: 65,
    },
    recent_activities: [
      {
        id: 'act-1',
        type: 'video_watched',
        title: 'Introduction to React',
        playlist: 'React Course',
        timestamp: '2 hours ago',
      },
    ],
    recent_playlists: [
      {
        id: 'playlist-1',
        title: 'React for Beginners',
        videos_count: 15,
        completed_count: 8,
        thumbnail_url: '',
        yt_id: 'PL123',
      },
    ],
  },
};

export const MOCK_PLAYLISTS = {
  data: [
    {
      id: 'playlist-1',
      attributes: {
        id: 'playlist-1',
        yt_id: 'PL123',
        title: 'React for Beginners',
        thumbnail_url: '',
        video_count: 15,
        user_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    },
    {
      id: 'playlist-2',
      attributes: {
        id: 'playlist-2',
        yt_id: 'PL456',
        title: 'Node.js Crash Course',
        thumbnail_url: '',
        video_count: 10,
        user_id: 'user-123',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    },
  ],
};

export const MOCK_GOALS = {
  data: [
    {
      id: 'goal-1',
      title: 'Finish React Course',
      description: 'Complete all React videos',
      playlist_id: 'playlist-1',
      playlist: { title: 'React for Beginners' },
      todos: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      target_date: '2024-03-01',
      status: 'in_progress',
    },
  ],
};

export const MOCK_SUMMARIES = {
  data: [
    {
      id: 'summary-1',
      attributes: {
        id: 'summary-1',
        title: 'React Hooks Explained',
        summary_text: 'A comprehensive overview of React hooks.',
        key_points: ['useState', 'useEffect', 'useContext'],
        tags: ['react', 'hooks'],
        confidence: 0.95,
        is_bookmarked: false,
        generated_at: '2024-01-01T00:00:00Z',
      },
    },
  ],
};

/** Injects a JWT token into localStorage before the page loads */
export async function setAuthToken(page: Page): Promise<void> {
  await page.addInitScript((token) => {
    localStorage.setItem('token', token);
  }, MOCK_TOKEN);
}

/** Mocks the /profile endpoint */
export async function mockProfile(page: Page): Promise<void> {
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
        body: JSON.stringify({
          data: { ...MOCK_PROFILE.data, name: 'Updated User' },
        }),
      });
    } else {
      route.continue();
    }
  });
}

/** Mocks the /profile/password endpoint */
export async function mockProfilePassword(page: Page): Promise<void> {
  await page.route(`${API_BASE}/profile/password`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Password updated successfully' }),
    });
  });
}

/** Mocks the /dashboard/stats endpoint */
export async function mockDashboardStats(page: Page): Promise<void> {
  await page.route(`${API_BASE}/dashboard/stats`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_DASHBOARD_STATS),
    });
  });
}

/** Mocks the /playlists endpoint (GET and DELETE) */
export async function mockPlaylists(page: Page): Promise<void> {
  await page.route(`${API_BASE}/playlists`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PLAYLISTS),
      });
    } else {
      route.continue();
    }
  });

  await page.route(`${API_BASE}/playlists/**`, (route) => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204 });
    } else {
      route.continue();
    }
  });
}

/** Mocks the /goals endpoint (GET and POST) */
export async function mockGoals(page: Page): Promise<void> {
  await page.route(`${API_BASE}/goals`, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_GOALS),
      });
    } else if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'goal-new',
            title: 'New Learning Goal',
            description: '',
            todos: [],
            created_at: '2024-01-03T00:00:00Z',
            updated_at: '2024-01-03T00:00:00Z',
            status: 'in_progress',
          },
        }),
      });
    } else {
      route.continue();
    }
  });

  await page.route(`${API_BASE}/goals/**`, (route) => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204 });
    } else {
      route.continue();
    }
  });
}

/** Mocks the /ai_summaries endpoint */
export async function mockSummaries(page: Page): Promise<void> {
  await page.route(`${API_BASE}/ai_summaries`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_SUMMARIES),
    });
  });
}

/**
 * Sets up auth token + profile mock for authenticated page tests.
 * Call this before page.goto().
 */
export async function setupAuthenticatedPage(page: Page): Promise<void> {
  await setAuthToken(page);
  await mockProfile(page);
}
