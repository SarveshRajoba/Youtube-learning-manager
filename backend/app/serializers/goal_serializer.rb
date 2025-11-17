class GoalSerializer
  include JSONAPI::Serializer
  attributes :id, :user_id, :playlist_id, :video_id, :target_date, :current_pct, :status, :title, :description
  
  attribute :todos do |goal|
    goal.todos || []
  end
  
  belongs_to :playlist, optional: true
  belongs_to :video, optional: true
end
