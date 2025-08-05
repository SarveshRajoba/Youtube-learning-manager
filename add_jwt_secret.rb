# Generate a secure random key for JWT
jwt_secret = SecureRandom.hex(64)

# Add to credentials
Rails.application.credentials.devise_jwt_secret_key = jwt_secret

puts "JWT secret key added to credentials: #{jwt_secret[0..20]}..." 