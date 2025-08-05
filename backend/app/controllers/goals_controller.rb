class GoalsController < ApiController
  before_action :set_goal, only: %i[show update destroy]

  # GET /goals
  def index
    goals = current_user.goals
    render json: GoalSerializer.new(goals).serializable_hash
  end

  # GET /goals/1
  def show
    render json: GoalSerializer.new(@goal).serializable_hash
  end

  # POST /goals
  def create
    goal = current_user.goals.new(goal_params)
    if goal.save
      render json: GoalSerializer.new(goal).serializable_hash, status: :created
    else
      render json: goal.errors, status: :unprocessable_entity
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
      params.require(:goal).permit(:playlist_id, :video_id, :target_date, :current_pct, :status)
    end
end
