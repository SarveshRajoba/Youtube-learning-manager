class ApiController < ActionController::API
  before_action :authenticate_request

  private

  def authenticate_request
    token = request.headers['Authorization']&.split(' ')&.last
    if token
      begin
        decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: 'HS256')[0]
        @current_user = User.find(decoded["user_id"])
      rescue JWT::DecodeError
        @current_user = nil
      end
    else
      @current_user = nil
    end
  end

  def current_user
    @current_user
  end

  def authenticate_user!
    unless current_user
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end
end
