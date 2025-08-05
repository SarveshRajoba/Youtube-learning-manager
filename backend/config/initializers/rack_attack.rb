class Rack::Attack
  # Rate limiting for API endpoints
  throttle('api/ip', limit: 300, period: 5.minutes) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # Stricter rate limiting for authentication endpoints
  throttle('auth/ip', limit: 5, period: 5.minutes) do |req|
    req.ip if req.path.in?(['/login', '/signup'])
  end

  # YouTube API endpoint rate limiting
  throttle('youtube_api/ip', limit: 100, period: 1.hour) do |req|
    req.ip if req.path.include?('youtube')
  end

  # Block suspicious requests
  blocklist('blocklist') do |req|
    # Block requests with suspicious patterns
    req.path.include?('wp-admin') || 
    req.path.include?('phpmyadmin') ||
    req.user_agent&.include?('bot')
  end

  # Custom response for rate limited requests
  self.blocklisted_response = lambda do |env|
    [429, {'Content-Type' => 'application/json'}, [{error: 'Rate limit exceeded'}.to_json]]
  end

  self.throttled_response = lambda do |env|
    [429, {'Content-Type' => 'application/json'}, [{error: 'Too many requests'}.to_json]]
  end
end 