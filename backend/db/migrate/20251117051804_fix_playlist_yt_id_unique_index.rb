class FixPlaylistYtIdUniqueIndex < ActiveRecord::Migration[8.0]
  def change
    # Remove the global unique index on yt_id
    remove_index :playlists, :yt_id
    
    # Add a composite unique index scoped to user_id and yt_id
    add_index :playlists, [:user_id, :yt_id], unique: true
  end
end
