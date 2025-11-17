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
      user.token_expiry = Time.at(auth.credentials.expires_at) if auth.credentials.expires_at
      
      # Generate random password for OAuth users
      user.password = SecureRandom.hex(20)
      user.password_confirmation = user.password
    end
  end
  
  # Update OAuth tokens for existing users
  def update_youtube_tokens(access_token, refresh_token, expires_at)
    update(
      yt_access_token: access_token,
      yt_refresh_token: refresh_token,
      token_expiry: expires_at ? Time.at(expires_at) : nil
    )
  end
  
  # Check if YouTube access token is expired
  def youtube_token_expired?
    token_expiry.nil? || token_expiry < Time.now
  end
  
  # Refresh YouTube access token
  def refresh_youtube_token!
    return unless yt_refresh_token.present?
    
    require 'signet/oauth_2/client'
    
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
