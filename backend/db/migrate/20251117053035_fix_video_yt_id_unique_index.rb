class FixVideoYtIdUniqueIndex < ActiveRecord::Migration[8.0]
  def change
    # Remove the global unique index on yt_id
    remove_index :videos, :yt_id
    
    # Add a composite unique index scoped to playlist_id and yt_id
    add_index :videos, [:playlist_id, :yt_id], unique: true
  end
end
