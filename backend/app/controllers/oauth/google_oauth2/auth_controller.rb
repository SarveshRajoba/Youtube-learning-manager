module OAuth
  module GoogleOauth2
    class AuthController < ActionController::Base
      # No CSRF protection needed - OAuth handles security via state parameter
      
      # Initiate OAuth flow with auto-submitting form (bypasses CSRF protection)
      def initiate
        render inline: <<~HTML
          <!DOCTYPE html>
          <html>
          <head><title>Redirecting to Google...</title></head>
          <body>
            <p>Redirecting to Google OAuth...</p>
            <form id="oauth-form" action="/oauth/google_oauth2" method="post">
              <input type="hidden" name="authenticity_token" value="#{form_authenticity_token}">
            </form>
            <script>document.getElementById('oauth-form').submit();</script>
          </body>
          </html>
        HTML
      end
      
      def callback
        begin
          auth = request.env['omniauth.auth']
          
          # Find or create user from OAuth data
          user = User.from_omniauth(auth)
          
          # Define frontend URL once
          frontend_url = ENV['FRONTEND_URL'] || 'http://localhost:8080'
          
          if user.persisted?
            # Update tokens for existing users
            user.update_youtube_tokens(
              auth.credentials.token,
              auth.credentials.refresh_token,
              auth.credentials.expires_at
            )
            
            # Generate JWT token (same as login/signup)
            token = generate_jwt(user)
            
            # Redirect to frontend with token
            redirect_to "#{frontend_url}/auth/callback?token=#{token}", allow_other_host: true
          else
            # User creation failed
            error_message = user.errors.full_messages.join(', ')
            redirect_to "#{frontend_url}/auth/failure?error=#{CGI.escape(error_message)}", allow_other_host: true
          end
          
        rescue => e
          Rails.logger.error "OAuth callback error: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
          
          frontend_url = ENV['FRONTEND_URL'] || 'http://localhost:8080'
          redirect_to "#{frontend_url}/auth/failure?error=#{CGI.escape('Authentication failed')}", allow_other_host: true
        end
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
  end
end