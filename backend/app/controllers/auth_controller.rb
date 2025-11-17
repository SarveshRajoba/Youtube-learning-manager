class AuthController < ActionController::API
  wrap_parameters false

  def login
    email = params[:user] ? params[:user][:email] : params[:email]
    password = params[:user] ? params[:user][:password] : params[:password]
    user = User.find_by(email: email)
    if user&.authenticate(password)
      token = generate_jwt(user)
      render json: {
        status: { code: 200, message: 'Logged in successfully.' },
        data: { user: UserSerializer.new(user).serializable_hash[:data][:attributes] },
        token: token
      }
    else
      render json: { 
        error: 'Authentication failed',
        message: 'Invalid email or password. Please check your credentials and try again.',
        status: 401
      }, status: :unauthorized
    end
  end

  def signup
    user = User.new(user_params)
    if user.save
      token = generate_jwt(user)
      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: { user: UserSerializer.new(user).serializable_hash[:data][:attributes] },
        token: token
      }
    else
      error_messages = user.errors.full_messages
      render json: { 
        error: 'Validation failed',
        message: error_messages.join(', '),
        details: user.errors.as_json,
        status: 422
      }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params[:user] ? params.require(:user).permit(:email, :password, :password_confirmation) : params.permit(:email, :password, :password_confirmation)
  end

  def generate_jwt(user)
    JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base, 'HS256')
  end
end 