class GoalSerializer
  include JSONAPI::Serializer
  attributes :id, :user_id, :playlist_id, :video_id, :target_date, :current_pct, :status
end
