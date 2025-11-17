class AddNotesToPlaylists < ActiveRecord::Migration[8.0]
  def change
    add_column :playlists, :notes, :jsonb, default: [], null: false
    add_index :playlists, :notes, using: :gin
  end
end
