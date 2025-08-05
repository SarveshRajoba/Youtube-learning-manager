class AddPerformanceIndexes < ActiveRecord::Migration[8.0]
  def change
    # Composite indexes for common queries
    add_index :progresses, [:user_id, :completed], name: 'index_progresses_on_user_and_completion'
    add_index :progresses, [:video_id, :completed], name: 'index_progresses_on_video_and_completion'
    add_index :goals, [:user_id, :status], name: 'index_goals_on_user_and_status'
    add_index :playlists, [:user_id, :created_at], name: 'index_playlists_on_user_and_created'
    
    # Indexes for sorting and filtering
    add_index :videos, [:playlist_id, :position], name: 'index_videos_on_playlist_and_position'
    add_index :progresses, [:last_watched], name: 'index_progresses_on_last_watched'
    add_index :ai_summaries, [:created_at], name: 'index_ai_summaries_on_created_at'
    
    # Partial indexes for better performance
    add_index :progresses, :user_id, where: "completed = true", name: 'index_progresses_on_user_completed'
    add_index :goals, :user_id, where: "status = 'active'", name: 'index_goals_on_user_active'
  end
end 