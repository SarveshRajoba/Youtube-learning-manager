class ProgressSerializer
  include JSONAPI::Serializer
  attributes :id, :user_id, :video_id, :current_time, :completion_pct, :last_watched, :completed
end
