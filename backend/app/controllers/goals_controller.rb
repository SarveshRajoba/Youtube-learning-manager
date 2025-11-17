class GoalsController < ApiController
  before_action :set_goal, only: %i[show update destroy]

  # GET /goals
  def index
    goals = current_user.goals.includes(:playlist, :video)
    render json: { data: goals.map { |goal| GoalSerializer.new(goal).serializable_hash[:data] } }
  end

  # GET /goals/1
  def show
    render json: GoalSerializer.new(@goal).serializable_hash
  end

  # POST /goals
  def create
    goal = current_user.goals.new(goal_params)
    # Handle empty string playlist_id
    if goal.playlist_id.blank?
      goal.playlist_id = nil
    end
    if goal.save
      render json: { data: GoalSerializer.new(goal).serializable_hash[:data] }, status: :created
    else
      render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /goals/1
  def update
    if @goal.update(goal_params)
      render json: GoalSerializer.new(@goal).serializable_hash
    else
      render json: @goal.errors, status: :unprocessable_entity
    end
  end

  # DELETE /goals/1
  def destroy
    @goal.destroy!
    head :no_content
  end

  private
    def set_goal
      @goal = current_user.goals.find(params[:id])
    end

    def goal_params
      params.require(:goal).permit(
        :title,
        :description,
        :playlist_id,
        :video_id,
        :target_date,
        :current_pct,
        :status,
        todos: [:id, :text, :completed, :due_date]
      )
    end
end
