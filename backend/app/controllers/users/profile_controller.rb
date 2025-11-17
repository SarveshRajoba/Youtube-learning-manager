class Users::ProfileController < ApiController
  before_action :authenticate_user!

  # GET /profile
  def show
    user = current_user
    render json: {
      data: {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@').first,
        created_at: user.created_at,
        playlists_count: user.playlists.count
      }
    }
  end

  # PATCH /profile
  def update
    if current_user.update(profile_params)
      render json: {
        data: {
          id: current_user.id,
          email: current_user.email,
          name: current_user.name || current_user.email.split('@').first,
          created_at: current_user.created_at,
          playlists_count: current_user.playlists.count
        }
      }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /profile/password
  def update_password
    unless current_user.authenticate(params[:current_password])
      return render json: { error: 'Current password is incorrect' }, status: :unauthorized
    end

    if params[:password] != params[:password_confirmation]
      return render json: { error: 'New passwords do not match' }, status: :unprocessable_entity
    end

    if current_user.update(password: params[:password], password_confirmation: params[:password_confirmation])
      render json: { message: 'Password updated successfully' }
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:user).permit(:name)
  end
end

