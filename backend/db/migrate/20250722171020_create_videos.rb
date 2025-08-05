class CreateVideos < ActiveRecord::Migration[8.0]
  def change
    create_table :videos, id: :uuid do |t|
      t.references :playlist, null: false, foreign_key: true, type: :uuid
      t.string :yt_id
      t.string :title
      t.string :thumbnail_url
      t.integer :duration
      t.integer :position

      t.timestamps
    end
    add_index :videos, :yt_id, unique: true
  end
end
