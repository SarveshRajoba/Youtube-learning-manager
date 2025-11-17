class AddPlaylistIdToAiSummaries < ActiveRecord::Migration[8.0]
  def change
    # Make video_id nullable to allow playlist summaries
    change_column_null :ai_summaries, :video_id, true
    
    # Add playlist_id column
    add_column :ai_summaries, :playlist_id, :uuid
    
    # Add index for playlist_id
    add_index :ai_summaries, :playlist_id
    
    # Add foreign key constraint
    add_foreign_key :ai_summaries, :playlists, type: :uuid
  end
end
