class AuthController < ActionController::API

  def login
    user = User.find_by(email: params[:user][:email])
    if user&.authenticate(params[:user][:password])
      token = generate_jwt(user)
      render json: {
        status: { code: 200, message: 'Logged in successfully.' },
        data: { user: UserSerializer.new(user).serializable_hash[:data][:attributes] },
        token: token
      }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
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
      render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end

  def generate_jwt(user)
    JWT.encode({ user_id: user.id, exp: 24.hours.from_now.to_i }, Rails.application.secret_key_base, 'HS256')
  end
end 