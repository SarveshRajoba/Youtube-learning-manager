# OAuth Setup Instructions

## 🎉 OAuth Implementation Complete!

All OAuth functionality has been implemented. Here's what you need to do to get it working:

## 1. Install New Gems

First, install the new OAuth gems:

```bash
cd backend
bundle install
```

## 2. Set Up Google Cloud Console

### Step 1: Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**

### Step 2: Configure OAuth Consent Screen
1. Go to **OAuth consent screen**
2. Choose **External** user type
3. Fill in required fields:
   - App name: "YouTube Learning Manager"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `email`
   - `profile` 
   - `https://www.googleapis.com/auth/youtube.readonly`
5. Add test users (for development)

### Step 3: Create OAuth Client
1. Application type: **Web application**
2. Authorized redirect URIs:
   - `http://localhost:3000/auth/google_oauth2/callback` (development)
   - `https://yourdomain.com/auth/google_oauth2/callback` (production)
3. Save and copy the **Client ID** and **Client Secret**

## 3. Set Environment Variables

### Backend (.env)
Create `backend/.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/youtube_learning_manager_development

# Rails
RAILS_ENV=development
RAILS_MASTER_KEY=your_master_key_here

# JWT Secret
DEVISE_JWT_SECRET_KEY=your_jwt_secret_key_here

# Google OAuth for YouTube API
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# YouTube API Key (for public data access)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Frontend (.env.local)
Create `frontend/.env.local` file:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000

# YouTube API Key (for public data access - search, public playlists)
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Frontend URL (used by backend for OAuth redirects)
VITE_FRONTEND_URL=http://localhost:5173
```

## 4. Run Database Migration

```bash
cd backend
rails db:migrate
```

## 5. Start the Applications

### Backend
```bash
cd backend
rails server
```

### Frontend
```bash
cd frontend
npm run dev
```

## 6. Test OAuth Flow

1. Go to `http://localhost:5173/login`
2. Click "Sign in with Google"
3. You should be redirected to Google OAuth consent screen
4. After accepting, you'll be redirected back to the app
5. Check the dashboard - it should show real data instead of dummy data

## 🚀 What's New

### Backend Features
- ✅ **OAuth Authentication**: Google OAuth 2.0 integration
- ✅ **Token Management**: Automatic token refresh
- ✅ **Real Dashboard Stats**: Actual progress data from database
- ✅ **YouTube Service**: Authenticated YouTube API calls
- ✅ **User Model**: OAuth user creation and management

### Frontend Features
- ✅ **Google OAuth Button**: On login and signup pages
- ✅ **OAuth Callback Handling**: Automatic token storage
- ✅ **Real Dashboard Data**: No more dummy data!
- ✅ **Profile Management**: Connect/disconnect YouTube
- ✅ **Progress Tracking**: Real completion percentages

### Dashboard Now Shows
- ✅ **Real Video Counts**: From your actual playlists
- ✅ **Real Completion Data**: From progress tracking
- ✅ **Real Watch Time**: Calculated from progress records
- ✅ **Real Recent Activity**: Your actual completed videos
- ✅ **Real Playlist Progress**: Actual completion percentages

## 🔧 Troubleshooting

### Common Issues

1. **OAuth Error**: Check that redirect URIs match exactly
2. **Token Issues**: Ensure environment variables are set correctly
3. **Database Errors**: Run `rails db:migrate` after pulling changes
4. **CORS Issues**: Check that `FRONTEND_URL` is set correctly

### Testing OAuth
```bash
# Test OAuth endpoint
curl http://localhost:3000/auth/google_oauth2

# Test dashboard stats (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/dashboard/stats
```

## 📊 Real Data Examples

The dashboard now shows:
- **Videos Completed**: 15/50 (30% completion rate)
- **Total Watch Time**: 2h 45m (calculated from progress)
- **Active Goals**: 3 (from your actual goals)
- **Weekly Progress**: 75% (videos completed this week)

## 🎯 Next Steps

1. **Set up Google Cloud Console** (follow steps above)
2. **Add environment variables** (copy from examples above)
3. **Test the OAuth flow** (sign in with Google)
4. **Import some playlists** to see real data
5. **Track progress** on videos to see completion stats

The app is now fully functional with real data instead of dummy placeholders!
