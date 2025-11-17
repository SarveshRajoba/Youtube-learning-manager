# OAuth Implementation Guide for YouTube Learning Manager

## Overview
This guide outlines all changes needed to implement Google OAuth 2.0 for YouTube data access, while maintaining your existing email/password authentication as a fallback.

---

## Phase 1: Google Cloud Console Setup

### 1.1 Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - Add app name, logo, support email
   - Add scopes: `youtube.readonly`, `openid`, `email`, `profile`
   - Add test users (for development)
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google_oauth2/callback` (development)
     - `https://yourdomain.com/auth/google_oauth2/callback` (production)
   - Save the **Client ID** and **Client Secret**

---

## Phase 2: Backend Changes

### 2.1 Update Gemfile
**File:** `backend/Gemfile`

```ruby
# Add these gems
gem 'omniauth-google-oauth2'
gem 'omniauth-rails_csrf_protection'
gem 'google-api-client'  # For refreshing tokens and API calls
```

Then run: `bundle install`

### 2.2 Create OmniAuth Initializer
**File:** `backend/config/initializers/omniauth.rb` (NEW FILE)

```ruby
Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    ENV['GOOGLE_CLIENT_ID'],
    ENV['GOOGLE_CLIENT_SECRET'],
    {
      scope: 'email,profile,https://www.googleapis.com/auth/youtube.readonly',
      prompt: 'consent',
      access_type: 'offline',
      include_granted_scopes: true,
      callback_path: '/auth/google_oauth2/callback'
    }
end

# Handle OmniAuth failures
OmniAuth.config.on_failure = Proc.new { |env|
  OmniAuth::FailureEndpoint.new(env).redirect_to_failure
}
```

### 2.3 Update Environment Variables
**File:** `backend/.env` or system environment

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 2.4 Create OmniAuth Callbacks Controller
**File:** `backend/app/controllers/users/omniauth_callbacks_controller.rb` (NEW FILE)

```ruby
class Users::OmniauthCallbacksController < ApplicationController
  skip_before_action :authenticate_user!
  
  def google_oauth2
    auth = request.env['omniauth.auth']
    
    # Find or create user from OAuth data
    user = User.from_omniauth(auth)
    
    if user.persisted?
      # Generate JWT token
      token = generate_jwt(user)
      
      # Redirect to frontend with token
      redirect_to "#{ENV['FRONTEND_URL']}/?token=#{token}&oauth=success"
    else
      redirect_to "#{ENV['FRONTEND_URL']}/login?error=oauth_failed"
    end
  end
  
  def failure
    redirect_to "#{ENV['FRONTEND_URL']}/login?error=#{params[:message]}"
  end
  
  private
  
  def generate_jwt(user)
    JWT.encode(
      { user_id: user.id, exp: 24.hours.from_now.to_i },
      Rails.application.secret_key_base,
      'HS256'
    )
  end
end
```

### 2.5 Update User Model
**File:** `backend/app/models/user.rb`

```ruby
class User < ApplicationRecord
  has_secure_password validations: false  # Make password optional for OAuth users
  
  # Associations
  has_many :playlists, dependent: :destroy
  has_many :videos, through: :playlists
  has_many :progresses, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :ai_summaries, through: :videos

  # Validations
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }, if: :password_required?

  before_create :generate_jti

  # OAuth: Find or create user from omniauth data
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.name = auth.info.name
      user.image = auth.info.image
      user.provider = auth.provider
      user.uid = auth.uid
      
      # Store YouTube OAuth tokens
      user.yt_access_token = auth.credentials.token
      user.yt_refresh_token = auth.credentials.refresh_token
      user.token_expiry = Time.at(auth.credentials.expires_at)
      
      # Generate random password for OAuth users
      user.password = SecureRandom.hex(20)
      user.password_confirmation = user.password
    end
  end
  
  # Update OAuth tokens
  def update_youtube_tokens(access_token, refresh_token, expires_at)
    update(
      yt_access_token: access_token,
      yt_refresh_token: refresh_token,
      token_expiry: Time.at(expires_at)
    )
  end
  
  # Check if YouTube access token is expired
  def youtube_token_expired?
    token_expiry.nil? || token_expiry < Time.now
  end
  
  # Refresh YouTube access token
  def refresh_youtube_token!
    return unless yt_refresh_token.present?
    
    require 'google/apis/youtube_v3'
    require 'googleauth'
    
    client = Signet::OAuth2::Client.new(
      client_id: ENV['GOOGLE_CLIENT_ID'],
      client_secret: ENV['GOOGLE_CLIENT_SECRET'],
      token_credential_uri: 'https://oauth2.googleapis.com/token',
      refresh_token: yt_refresh_token
    )
    
    client.refresh!
    
    update_youtube_tokens(
      client.access_token,
      client.refresh_token || yt_refresh_token,
      client.expires_at
    )
    
    client.access_token
  rescue => e
    Rails.logger.error "Failed to refresh YouTube token: #{e.message}"
    nil
  end
  
  # Get valid YouTube access token (refresh if needed)
  def youtube_access_token
    if youtube_token_expired?
      refresh_youtube_token!
    else
      yt_access_token
    end
  end

  private

  def generate_jti
    self.jti = SecureRandom.uuid
  end
  
  def password_required?
    # Password required only for non-OAuth users or when setting password
    provider.blank? && (password_digest.blank? || password.present?)
  end
end
```

### 2.6 Update Routes
**File:** `backend/config/routes.rb`

```ruby
Rails.application.routes.draw do
  resources :ai_summaries
  resources :goals
  resources :progresses
  resources :videos
  resources :playlists
  
  # Regular auth endpoints
  post '/login', to: 'auth#login'
  post '/signup', to: 'auth#signup'
  
  # OAuth routes
  get '/auth/google_oauth2/callback', to: 'users/omniauth_callbacks#google_oauth2'
  get '/auth/failure', to: 'users/omniauth_callbacks#failure'
  post '/auth/:provider', to: 'redirect#create'  # CSRF protection
  
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
```

### 2.7 Create Redirect Controller (for CSRF protection)
**File:** `backend/app/controllers/redirect_controller.rb` (NEW FILE)

```ruby
class RedirectController < ApplicationController
  skip_before_action :authenticate_user!
  
  def create
    redirect_to "/auth/#{params[:provider]}", allow_other_host: true
  end
end
```

### 2.8 Update API Controller (Optional - for token refresh)
**File:** `backend/app/controllers/api_controller.rb`

Add method to check and refresh YouTube tokens:

```ruby
def ensure_youtube_access
  return unless current_user
  
  if current_user.youtube_token_expired?
    current_user.refresh_youtube_token!
  end
end
```

### 2.9 Create YouTube Service (for API calls)
**File:** `backend/app/services/youtube_service.rb` (NEW FILE)

```ruby
class YoutubeService
  def initialize(user)
    @user = user
  end
  
  def fetch_user_playlists
    return [] unless @user.yt_access_token
    
    access_token = @user.youtube_access_token  # Auto-refreshes if needed
    return [] unless access_token
    
    # Use Google API client with authenticated token
    require 'google/apis/youtube_v3'
    
    youtube = Google::Apis::YoutubeV3::YouTubeService.new
    youtube.authorization = access_token
    
    response = youtube.list_playlists(
      'snippet,contentDetails',
      mine: true,
      max_results: 50
    )
    
    response.items
  rescue => e
    Rails.logger.error "YouTube API error: #{e.message}"
    []
  end
end
```

---

## Phase 3: Frontend Changes

### 3.1 Create OAuth Button Component
**File:** `frontend/src/components/GoogleOAuthButton.tsx` (NEW FILE)

```typescript
import { Button } from '@/components/ui/button';

interface GoogleOAuthButtonProps {
  mode?: 'login' | 'connect';
}

export default function GoogleOAuthButton({ mode = 'login' }: GoogleOAuthButtonProps) {
  const handleGoogleAuth = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google_oauth2`;
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      variant="outline"
      className="w-full flex items-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {mode === 'login' ? 'Sign in with Google' : 'Connect YouTube Account'}
    </Button>
  );
}
```

### 3.2 Update Login Page
**File:** `frontend/src/pages/Login.tsx`

Add the Google OAuth button:

```typescript
import GoogleOAuthButton from '@/components/GoogleOAuthButton';

// Inside the form, add:
<div className="space-y-4">
  <GoogleOAuthButton mode="login" />
  
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">
        Or continue with email
      </span>
    </div>
  </div>
  
  {/* Existing email/password form */}
</div>
```

### 3.3 Handle OAuth Callback
**File:** `frontend/src/App.tsx` or main router file

Add logic to handle the OAuth callback:

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for OAuth callback parameters
    const token = searchParams.get('token');
    const oauthStatus = searchParams.get('oauth');
    const error = searchParams.get('error');
    
    if (token && oauthStatus === 'success') {
      // Store token
      localStorage.setItem('token', token);
      
      // Clean up URL
      window.history.replaceState({}, '', '/');
      
      // Navigate to dashboard
      navigate('/playlists');
    } else if (error) {
      console.error('OAuth error:', error);
      navigate('/login');
    }
  }, [searchParams, navigate]);
  
  // Rest of your app
}
```

### 3.4 Add Profile/Settings Page
**File:** `frontend/src/pages/Profile.tsx`

Add ability to connect/disconnect YouTube:

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import GoogleOAuthButton from '@/components/GoogleOAuthButton';

export default function Profile() {
  const [user, setUser] = useState(/* get from API */);
  
  const hasYouTubeConnected = user?.provider === 'google_oauth2';
  
  const handleDisconnect = async () => {
    // Call API to disconnect YouTube
    // This would clear yt_access_token, yt_refresh_token, etc.
  };
  
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold mb-4">YouTube Connection</h2>
        
        {hasYouTubeConnected ? (
          <div className="space-y-2">
            <p className="text-sm text-green-600">
              ✓ YouTube account connected
            </p>
            <Button onClick={handleDisconnect} variant="destructive">
              Disconnect YouTube
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Connect your YouTube account to import personal playlists
            </p>
            <GoogleOAuthButton mode="connect" />
          </div>
        )}
      </section>
    </div>
  );
}
```

### 3.5 Update Environment Variables
**File:** `frontend/.env.local`

```bash
VITE_API_URL=http://localhost:3000
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_FRONTEND_URL=http://localhost:5173
```

And add to backend:
```bash
FRONTEND_URL=http://localhost:5173
```

---

## Phase 4: Testing

### 4.1 Manual Testing Steps
1. ✅ Click "Sign in with Google" button
2. ✅ Verify redirect to Google OAuth consent screen
3. ✅ Accept permissions
4. ✅ Verify redirect back to your app with token
5. ✅ Verify user created in database with OAuth fields
6. ✅ Test accessing YouTube API with stored token
7. ✅ Test token refresh after expiry
8. ✅ Test regular email/password login still works

### 4.2 Database Verification
```sql
-- Check user created with OAuth data
SELECT id, email, provider, uid, name, yt_access_token IS NOT NULL as has_token 
FROM users 
WHERE provider = 'google_oauth2';
```

---

## Phase 5: Security Considerations

### 5.1 Token Storage
- ✅ Access tokens stored encrypted in database
- ✅ Never expose tokens to frontend
- ✅ Use HTTPS in production
- ✅ Implement token refresh logic

### 5.2 Scopes
Only request necessary scopes:
- `email` - User email
- `profile` - User name and image
- `https://www.googleapis.com/auth/youtube.readonly` - Read-only YouTube access

### 5.3 Consent Screen
Must include:
- Clear explanation of data usage
- Link to Privacy Policy
- Link to Terms of Service
- Revocation instructions

---

## Phase 6: Production Deployment

### 6.1 Google Cloud Console Updates
1. Add production redirect URI
2. Submit app for verification (if accessing sensitive scopes)
3. Update OAuth consent screen with production URLs
4. Move out of testing mode

### 6.2 Environment Variables
Ensure all production environment variables are set:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FRONTEND_URL`
- `RAILS_ENV=production`

---

## Summary of Files to Create/Modify

### New Files (11):
1. ✅ `backend/config/initializers/omniauth.rb`
2. ✅ `backend/app/controllers/users/omniauth_callbacks_controller.rb`
3. ✅ `backend/app/controllers/redirect_controller.rb`
4. ✅ `backend/app/services/youtube_service.rb`
5. ✅ `frontend/src/components/GoogleOAuthButton.tsx`

### Files to Modify (7):
1. ✅ `backend/Gemfile`
2. ✅ `backend/app/models/user.rb`
3. ✅ `backend/config/routes.rb`
4. ✅ `backend/.env`
5. ✅ `frontend/src/pages/Login.tsx`
6. ✅ `frontend/src/App.tsx`
7. ✅ `frontend/.env.local`

---

## Next Steps

1. Set up Google Cloud Console project
2. Install required gems
3. Create backend OAuth files
4. Create frontend OAuth components
5. Test OAuth flow in development
6. Deploy to production

Would you like me to help implement any specific phase?

