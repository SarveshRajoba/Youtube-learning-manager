# YouTube Learning Manager

## Overview
A platform to manage, track, and summarize your YouTube learning journey. Features include playlist/video import, AI-powered video summarization, progress tracking, and learning goals.

## MVP Feature Scope
- User authentication (Devise + JWT)
- Import YouTube playlists and videos
- Track progress on videos (time, completion)
- Set learning goals for playlists/videos
- AI-generated video summaries (Gemini API planned)
- RESTful API for all resources

## Backend Stack
- Ruby on Rails 8 (API-only with session support for Devise)
- PostgreSQL
- Devise + Devise-JWT for authentication
- JSON:API serialization
- Dockerized for deployment

## Frontend Stack
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui for styling
- React Router for navigation
- Axios for API communication
- React Query for state management

## Database Schema (Simplified)
- **User**: id, email, encrypted_password, yt_access_token, yt_refresh_token, token_expiry, jti, timestamps
- **Playlist**: id, user_id, yt_id, title, thumbnail_url, video_count, timestamps
- **Video**: id, playlist_id, yt_id, title, thumbnail_url, duration, position, timestamps
- **Progress**: id, user_id, video_id, current_time, completion_pct, last_watched, completed, timestamps
- **Goal**: id, user_id, playlist_id, video_id, target_date, current_pct, status, timestamps
- **AiSummary**: id, video_id, summary_text, timestamps

## API Endpoints
### Auth
- POST `/signup` – Register
- POST `/login` – Login
- DELETE `/logout` – Logout

### Core Resources
- `/playlists` (CRUD)
- `/videos` (CRUD)
- `/progresses` (CRUD)
- `/goals` (CRUD)
- `/ai_summaries` (CRUD)

All endpoints require JWT authentication except signup/login.

### Example Payloads
- **User**: `{ email, password }`
- **Playlist**: `{ yt_id, title, thumbnail_url, video_count }`
- **Video**: `{ playlist_id, yt_id, title, thumbnail_url, duration, position }`
- **Progress**: `{ video_id, current_time, completion_pct, last_watched, completed }`
- **Goal**: `{ playlist_id, video_id, target_date, current_pct, status }`
- **AiSummary**: `{ video_id, summary_text }`

## Authentication
- Uses Devise and Devise-JWT
- Register: `POST /signup` (returns JWT in response body)
- Login: `POST /login` (returns JWT in response body)
- Logout: `DELETE /logout` (invalidates JWT)
- All other endpoints require `Authorization: Bearer <token>`
- Session middleware configured for API-only mode

## YouTube API Integration
- YouTube Data API v3 key configured
- Frontend service for playlist/video search and import
- Backend endpoints for storing imported playlists and videos
- [YouTube Data API Implementation Guide](https://developers.google.com/youtube/v3/guides/implementation)

## Setup & Development
### Prerequisites
- Ruby 3.4.2
- PostgreSQL
- Node.js 18+
- Docker (optional, for containerized setup)

### Backend Setup
```sh
cd backend
bin/setup
```

### Frontend Setup
```sh
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env.local` in frontend directory:
```
VITE_API_URL=http://localhost:3000
VITE_YOUTUBE_API_KEY=AIzaSyA2kjNUPiDxZEfgB6pGj29K4q6Zk22aRFI
```

**Backend Environment Variables:**
```bash
export DEVISE_JWT_SECRET_KEY=$(openssl rand -hex 64)
```

### Database
- Configured in `backend/config/database.yml`
- Uses separate DBs for development, test, and production

### Docker
- Build: `docker build -t backend .`
- Run: `docker run -d -p 80:80 -e RAILS_MASTER_KEY=... --name backend backend`

## Current Progress
### ✅ Completed
- Backend Rails API with Devise-JWT authentication
- Database schema and migrations
- Frontend React app with TypeScript
- Authentication pages (Login/Signup) connected to backend
- API service layer with JWT token management
- YouTube API integration for playlist search and import
- Playlists page with real backend data
- YouTube import modal with search functionality
- Session middleware configuration for API-only mode
- CORS configuration for frontend-backend communication
- User serializer fixed (removed non-existent 'name' attribute)
- **Authentication system fully functional** ✅
- **API endpoints working correctly** ✅
- **User-Playlist associations configured** ✅
- Debug component added for troubleshooting
- Basic routing and UI components

### 🚧 In Progress
- Frontend pages for videos, progress, goals, summaries
- Error handling and user feedback improvements
- Video detail page with progress tracking

### 📋 Next Steps
- [ ] Connect remaining frontend pages to backend APIs
- [ ] Add Gemini API for video summarization
- [ ] Implement progress tracking functionality
- [ ] Add goal setting and management
- [ ] Test all endpoints and error handling
- [ ] Set up CI/CD and deployment
- [ ] Polish docs and usage instructions

## Features Implemented
### Authentication ✅
- User registration and login with JWT tokens
- Automatic token storage and request authentication
- Protected routes and API endpoints
- Session support in API-only mode
- **Status: Fully working**

### YouTube Integration
- Search YouTube playlists by keyword
- Import playlists with all videos and metadata
- Store playlist and video data in backend
- View imported playlists in the app

### API Communication
- Centralized API service with axios
- Automatic JWT token management
- Error handling and user feedback
- Loading states and progress indicators
- CORS configuration for cross-origin requests

## Troubleshooting
### Common Issues
1. **Session Error**: Fixed by adding session middleware to API-only Rails app
2. **CORS Issues**: Configured CORS to allow frontend origins
3. **Authentication**: JWT tokens properly handled in request/response interceptors
4. **User Serializer**: Fixed by removing non-existent 'name' attribute
5. **Frontend Token Storage**: Updated to handle tokens from response body
6. **User Associations**: Added missing playlists association to User model

### Debug Tools
- **AuthDebug Component**: Added to frontend for troubleshooting authentication
- **Console Logging**: Check browser console for API request/response details
- **Network Tab**: Monitor API calls in browser developer tools

### Testing Authentication
You can test the authentication endpoints directly:
```bash
# Signup
curl -X POST http://localhost:3000/signup \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"test@example.com","password":"password123"}}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"test@example.com","password":"password123"}}'

# Test protected endpoint
curl -X GET http://localhost:3000/playlists \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Current Status
1. **Authentication**: ✅ Working correctly
2. **API Endpoints**: ✅ All endpoints accessible with proper authentication
3. **Frontend-Backend Communication**: ✅ JWT tokens being sent and received correctly
4. **Database Associations**: ✅ User-Playlist associations configured
5. **Dummy Data**: 🚧 Some frontend components still use mock data

## Progress Log
See `readme_progress.md` for a detailed project log and status table.

## Further Reading
- [Rails API Authentication: A Guide to Devise and Devise-JWT Integration (Medium)](https://medium.com/@alaminkhanshakil/rails-api-authentication-a-guide-to-devise-and-devise-jwt-integration-3626710e24c1)
- [YouTube Data API Implementation Guide](https://developers.google.com/youtube/v3/guides/implementation)

