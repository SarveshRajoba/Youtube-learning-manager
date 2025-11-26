class ProgressesController < ApiController
  before_action :set_progress, only: %i[show update destroy]

  # GET /progresses
  def index
    progresses = current_user.progresses
    render json: ProgressSerializer.new(progresses).serializable_hash
  end

  # GET /progresses/1
  def show
    render json: ProgressSerializer.new(@progress).serializable_hash
  end

  # POST /progresses
  def create
    # Find existing progress for this video or initialize new one
    progress = current_user.progresses.find_or_initialize_by(video_id: progress_params[:video_id])
    
    # Update attributes
    progress.assign_attributes(progress_params)
    
    if progress.save
      render json: ProgressSerializer.new(progress).serializable_hash, status: :ok
    else
      render json: progress.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /progresses/1
  def update
    if @progress.update(progress_params)
      render json: ProgressSerializer.new(@progress).serializable_hash
    else
      render json: @progress.errors, status: :unprocessable_entity
    end
  end

  # DELETE /progresses/1
  def destroy
    @progress.destroy!
    head :no_content
  end

  private
    def set_progress
      @progress = current_user.progresses.find(params[:id])
    end

    def progress_params
      params.require(:progress).permit(:video_id, :current_time, :completion_pct, :last_watched, :completed)
    end
end
