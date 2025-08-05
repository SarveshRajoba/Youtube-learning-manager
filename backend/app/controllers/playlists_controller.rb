class PlaylistsController < ApiController
  before_action :authenticate_user!
  before_action :set_playlist, only: %i[show update destroy]

  # GET /playlists
  def index
    playlists = current_user.playlists
    render json: PlaylistSerializer.new(playlists).serializable_hash
  end

  # GET /playlists/1
  def show
    render json: PlaylistSerializer.new(@playlist).serializable_hash
  end

  # POST /playlists
  def create
    playlist = current_user.playlists.new(playlist_params)
    if playlist.save
      render json: PlaylistSerializer.new(playlist).serializable_hash, status: :created
    else
      render json: playlist.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /playlists/1
  def update
    if @playlist.update(playlist_params)
      render json: PlaylistSerializer.new(@playlist).serializable_hash
    else
      render json: @playlist.errors, status: :unprocessable_entity
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
      params.require(:playlist).permit(:yt_id, :title, :thumbnail_url, :video_count)
    end
end
