# Debugging Blank Screen on Playlist Detail Page

## Quick Fix Steps

### Step 1: Check Browser Console

1. Open your browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors (red text)
4. Take a screenshot and share it

Common errors:
- `Cannot read property 'videos' of undefined`
- `TypeError: playlist is null`
- `Failed to fetch`

### Step 2: Check Network Tab

1. In DevTools, go to **Network** tab
2. Click on the playlist link
3. Look for the request to `/playlists/{id}`
4. Click on it
5. Check the **Response** tab

**What should you see:**
```json
{
  "data": {
    "id": "...",
    "attributes": {
      "title": "...",
      "videos": [...]
    }
  }
}
```

### Step 3: Check Response Structure

The issue might be that the response structure doesn't match what the frontend expects.

**Backend returns:**
```json
{
  "data": {
    "id": "uuid",
    "type": "playlist",
    "attributes": {
      "id": "uuid",
      "yt_id": "PLxxx",
      "title": "My Playlist",
      "videos": [
        {
          "id": "video-uuid",
          "title": "Video 1",
          ...
        }
      ]
    }
  }
}
```

**Frontend expects:**
```typescript
{
  data: {
    id: string;
    title: string;
    videos: Video[];
    ...
  }
}
```

## Potential Causes

### 1. JSONAPI Serializer Structure

The backend uses `jsonapi-serializer` which nests data under `attributes`.

**Frontend needs to access:**
```typescript
response.data.data.attributes  // Not response.data.data
```

### 2. Videos Array Position

Videos might be at:
- `response.data.data.attributes.videos` (JSONAPI)
- `response.data.data.videos` (simple JSON)

### 3. Null/Undefined Playlist

If playlist is null, the frontend shows blank screen.

## The Fix

We need to adjust how the frontend accesses the data.

