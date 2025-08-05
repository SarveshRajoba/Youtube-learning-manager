class CreatePlaylists < ActiveRecord::Migration[8.0]
  def change
    create_table :playlists, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :yt_id
      t.string :title
      t.string :thumbnail_url
      t.integer :video_count

      t.timestamps
    end
    add_index :playlists, :yt_id, unique: true
  end
end
