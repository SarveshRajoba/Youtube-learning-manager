class ApiController < ActionController::API
  before_action :authenticate_user!
  # Add other shared methods here if needed
end
