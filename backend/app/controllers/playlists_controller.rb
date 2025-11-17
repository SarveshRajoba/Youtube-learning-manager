class PlaylistsController < ApiController
  before_action :authenticate_user!
  before_action :set_playlist, only: %i[show update destroy]

  # GET /playlists
  def index
    playlists = current_user.playlists.includes(:videos)
    
    # Preload all progresses for current user to avoid N+1 queries
    video_ids = playlists.flat_map { |p| p.videos.map(&:id) }
    user_progresses = current_user.progresses.where(video_id: video_ids).index_by(&:video_id)
    
    render json: { 
      data: playlists.map { |playlist| 
        PlaylistSerializer.new(
          playlist, 
          { params: { current_user: current_user, user_progresses: user_progresses } }
        ).serializable_hash[:data] 
      } 
    }
  end

  # GET /playlists/1
  def show
    playlist = current_user.playlists.includes(:videos).find(params[:id])
    
    # Preload progresses for this playlist's videos
    video_ids = playlist.videos.map(&:id)
    user_progresses = current_user.progresses.where(video_id: video_ids).index_by(&:video_id)
    
    render json: { 
      data: PlaylistSerializer.new(
        playlist, 
        { params: { current_user: current_user, user_progresses: user_progresses } }
      ).serializable_hash[:data] 
    }
  end

  # POST /playlists
  def create
    # Use find_or_create_by to handle duplicate playlists gracefully
    is_new = false
    playlist = current_user.playlists.find_or_create_by(yt_id: playlist_params[:yt_id]) do |p|
      p.assign_attributes(playlist_params)
      is_new = true
    end
    
    if playlist.persisted?
      if is_new
        render json: { data: PlaylistSerializer.new(playlist, { params: { current_user: current_user } }).serializable_hash[:data] }, status: :created
      else
        render json: { 
          data: PlaylistSerializer.new(playlist, { params: { current_user: current_user } }).serializable_hash[:data],
          message: "Playlist already exists in your library"
        }, status: :ok
      end
    else
      render json: { errors: playlist.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /playlists/1
  def update
    if @playlist.update(playlist_params)
      render json: { data: PlaylistSerializer.new(@playlist, { params: { current_user: current_user } }).serializable_hash[:data] }
    else
      render json: { errors: @playlist.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /playlists/1
  def destroy
    @playlist.destroy!
    head :no_content
  end

  private
    def set_playlist
      @playlist = current_user.playlists.find(params[:id])
    end

    def playlist_params
      params.require(:playlist).permit(:yt_id, :title, :thumbnail_url, :video_count, notes: [:id, :text, :video_number, :created_at])
    end
end
