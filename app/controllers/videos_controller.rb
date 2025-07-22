class VideosController < ApiController
  before_action :set_video, only: %i[show update destroy]

  # GET /videos
  def index
    videos = Video.all
    render json: VideoSerializer.new(videos).serializable_hash
  end

  # GET /videos/1
  def show
    render json: VideoSerializer.new(@video).serializable_hash
  end

  # POST /videos
  def create
    video = Video.new(video_params)
    if video.save
      render json: VideoSerializer.new(video).serializable_hash, status: :created
    else
      render json: video.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /videos/1
  def update
    if @video.update(video_params)
      render json: VideoSerializer.new(@video).serializable_hash
    else
      render json: @video.errors, status: :unprocessable_entity
    end
  end

  # DELETE /videos/1
  def destroy
    @video.destroy!
    head :no_content
  end

  private
    def set_video
      @video = Video.find(params[:id])
    end

    def video_params
      params.require(:video).permit(:playlist_id, :yt_id, :title, :thumbnail_url, :duration, :position)
    end
end
