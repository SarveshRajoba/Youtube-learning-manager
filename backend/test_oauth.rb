#!/usr/bin/env ruby
# Quick OAuth test script
# Run with: rails runner test_oauth.rb

require 'ostruct'

puts "🧪 Testing OAuth User Creation..."
puts "=" * 50

# Simulate Google OAuth response
auth = OpenStruct.new(
  provider: 'google_oauth2',
  uid: '123456789',
  info: OpenStruct.new(
    email: 'test@gmail.com',
    name: 'Test User',
    image: 'https://lh3.googleusercontent.com/a/test'
  ),
  credentials: OpenStruct.new(
    token: 'ya29.test_access_token',
    refresh_token: '1//test_refresh_token',
    expires_at: Time.now.to_i + 3600
  )
)

# Test user creation
user = User.from_omniauth(auth)

if user.persisted?
  puts "✅ SUCCESS! User created/found"
  puts ""
  puts "User Details:"
  puts "  📧 Email: #{user.email}"
  puts "  👤 Name: #{user.name}"
  puts "  🔑 Provider: #{user.provider}"
  puts "  🆔 UID: #{user.uid}"
  puts "  🎥 YouTube Access Token: #{user.yt_access_token.present? ? '✅ Present' : '❌ Missing'}"
  puts "  🔄 YouTube Refresh Token: #{user.yt_refresh_token.present? ? '✅ Present' : '❌ Missing'}"
  puts "  ⏰ Token Expiry: #{user.token_expiry}"
  puts ""
  
  # Test JWT generation
  token = JWT.encode(
    { user_id: user.id, exp: 24.hours.from_now.to_i }, 
    Rails.application.secret_key_base, 
    'HS256'
  )
  puts "🎫 Generated JWT Token:"
  puts "  #{token[0..50]}..."
  puts ""
  
  # Decode to verify
  decoded = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: 'HS256' })
  puts "✅ Token decoded successfully!"
  puts "  User ID: #{decoded[0]['user_id']}"
  puts "  Expires: #{Time.at(decoded[0]['exp'])}"
else
  puts "❌ FAILED! User not created"
  puts "Errors: #{user.errors.full_messages.join(', ')}"
end

puts "=" * 50
puts "✅ OAuth test complete!"
