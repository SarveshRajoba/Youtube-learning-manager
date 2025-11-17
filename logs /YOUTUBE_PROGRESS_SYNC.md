# YouTube Progress Sync Feature

## Overview

This feature allows the application to sync video watch progress from YouTube for authenticated users. Due to YouTube API limitations, the sync capability is restricted to what's available through the YouTube Data API v3.

## How It Works

### Backend Components

1. **YoutubeService** (`app/services/youtube_service.rb`)
   - Core service for interacting with YouTube API
   - Uses OAuth2 tokens to authenticate requests
   - Fetches user's watch history data (limited to what YouTube API provides)

2. **YoutubeSyncController** (`app/controllers/youtube_sync_controller.rb`)
   - Provides API endpoints for manual progress syncing
   - Endpoints:
     - `POST /youtube/sync_progress` - Manually sync progress from YouTube
     - `GET /youtube/playlists` - Fetch user's YouTube playlists
     - `POST /youtube/check_watched` - Check if specific videos have been watched

3. **YoutubeProgressSyncJob** (`app/jobs/youtube_progress_sync_job.rb`)
   - Background job for periodic syncing
   - Can be scheduled to run automatically
   - Syncs progress for all users with YouTube tokens

### Frontend Components

- **Sync Button** (in `Playlists` page)
  - Located in the page header next to "Import" button
  - Triggers manual sync from YouTube
  - Shows loading state during sync
  - Displays success/error toasts

## Important Limitations

### YouTube API Restrictions

⚠️ **Critical:** The YouTube Data API v3 has significant privacy restrictions:

1. **No Direct Watch History Access**
   - YouTube doesn't provide a direct API to access watch history
   - The `/history` endpoint was deprecated for privacy reasons

2. **Available Data Sources**
   The sync service can only access:
   - Videos in user's "Watch Later" playlist
   - Videos the user has rated (liked/disliked)
   - User's own playlists
   - Basic video interaction data

3. **Cannot Get Playback Position**
   - YouTube API doesn't provide current playback position for videos
   - We can only detect IF a video was watched, not HOW MUCH was watched

### Recommended Solution

For accurate progress tracking, the best approach is to:

1. **Watch Videos In-App**
   - Embed YouTube Player API in the application
   - Track progress as users watch videos within the app
   - This allows precise tracking of:
     - Current playback position
     - Completion percentage
     - Last watched timestamp

2. **Manual Progress Updates**
   - Allow users to manually mark videos as completed
   - Provide a progress slider for users to set their position

## Usage

### Manual Sync

Users can manually sync their progress by:

1. Navigate to the Playlists page
2. Click the "Sync from YouTube" button
3. Wait for the sync to complete
4. View updated progress indicators

### Automatic Sync (Setup Required)

To enable periodic automatic syncing:

```ruby
# In config/initializers/scheduler.rb or similar

# Run every 6 hours
Rails.application.config.after_initialize do
  if defined?(Sidekiq)
    # For Sidekiq
    Sidekiq::Cron::Job.create(
      name: 'Sync YouTube Progress',
      cron: '0 */6 * * *',
      class: 'YoutubeProgressSyncJob'
    )
  end
end
```

Or manually trigger for all users:

```ruby
# In Rails console
YoutubeProgressSyncJob.sync_all_users
```

## Authentication Requirements

Users must:
1. Be logged in with Google OAuth
2. Have granted YouTube API scopes:
   - `youtube.readonly` - Read access to YouTube account
   - `youtube.force-ssl` - Required for authenticated requests

## Error Handling

The sync service handles various errors:

- **Authorization Errors**: Automatically attempts token refresh
- **API Rate Limits**: Logs error and can retry later
- **Network Errors**: Gracefully fails with error message
- **Invalid Tokens**: Prompts user to reconnect YouTube account

## Performance Optimization

The playlist serializer has been optimized to avoid N+1 queries:

- Progress data is preloaded in a single query
- Uses hash lookup instead of individual database queries
- Reduces database load from ~100 queries to ~3 queries for typical playlist

## Future Improvements

To improve progress tracking:

1. **YouTube Player Integration**
   - Embed YouTube iframe player
   - Use Player API events to track progress
   - Save progress every 30 seconds or on pause

2. **Browser Extension**
   - Create a browser extension to track YouTube watch progress
   - Sync progress back to the application

3. **Periodic Reminders**
   - Send reminders to users to manually update progress
   - Provide quick-update interface

## API Reference

### Sync Progress

```bash
POST /youtube/sync_progress
Authorization: Bearer <token>

Response:
{
  "synced_count": 5,
  "message": "Successfully synced 5 videos from YouTube"
}
```

### Check Watched Status

```bash
POST /youtube/check_watched
Authorization: Bearer <token>
Content-Type: application/json

{
  "video_ids": ["uuid1", "uuid2", "uuid3"]
}

Response:
{
  "watched_videos": {
    "yt_video_id_1": {
      "watched": true,
      "watched_at": "2025-11-01T10:30:00Z",
      "completed": false
    }
  }
}
```

## Troubleshooting

### "YouTube Not Connected" Error

User needs to connect their YouTube account via Google OAuth:
1. Log out
2. Log in using "Sign in with Google"
3. Grant YouTube permissions

### Sync Returns 0 Videos

This is expected if:
- User watches videos directly on YouTube without interacting
- Videos aren't in Watch Later playlist
- User hasn't rated the videos

**Solution**: Watch videos within the app (once player is integrated) or manually mark progress.

### Token Expired

The service automatically refreshes expired tokens. If refresh fails:
1. User should log out and log back in
2. Grant permissions again during OAuth flow

## Technical Notes

- Uses `google-api-ruby-client` gem for YouTube API
- OAuth2 handled by `signet` gem
- Progress records use UUID primary keys
- All timestamps stored in UTC
- Supports bulk operations for performance

