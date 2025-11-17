class MakePlaylistAndVideoOptionalInGoals < ActiveRecord::Migration[8.0]
  def change
    change_column_null :goals, :playlist_id, true
    change_column_null :goals, :video_id, true
  end
end
