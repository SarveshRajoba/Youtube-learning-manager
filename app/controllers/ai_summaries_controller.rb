class AiSummariesController < ApiController
  before_action :set_ai_summary, only: %i[show update destroy]

  # GET /ai_summaries
  def index
    ai_summaries = AiSummary.all
    render json: AiSummarySerializer.new(ai_summaries).serializable_hash
  end

  # GET /ai_summaries/1
  def show
    render json: AiSummarySerializer.new(@ai_summary).serializable_hash
  end

  # POST /ai_summaries
  def create
    ai_summary = AiSummary.new(ai_summary_params)
    if ai_summary.save
      render json: AiSummarySerializer.new(ai_summary).serializable_hash, status: :created
    else
      render json: ai_summary.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /ai_summaries/1
  def update
    if @ai_summary.update(ai_summary_params)
      render json: AiSummarySerializer.new(@ai_summary).serializable_hash
    else
      render json: @ai_summary.errors, status: :unprocessable_entity
    end
  end

  # DELETE /ai_summaries/1
  def destroy
    @ai_summary.destroy!
    head :no_content
  end

  private
    def set_ai_summary
      @ai_summary = AiSummary.find(params[:id])
    end

    def ai_summary_params
      params.require(:ai_summary).permit(:video_id, :summary_text)
    end
end
