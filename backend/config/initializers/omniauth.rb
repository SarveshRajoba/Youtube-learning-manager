require 'omniauth'
require 'omniauth-google-oauth2'

Rails.application.config.middleware.use OmniAuth::Builder do
  configure do |config|
    config.logger = Rails.logger if Rails.env.development?
  end

  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'],
  {
    name: 'google_oauth2',
    scope: 'email, profile, https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent'
  }
end

OmniAuth.config.path_prefix = '/oauth'

