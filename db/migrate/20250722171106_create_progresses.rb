class CreateProgresses < ActiveRecord::Migration[8.0]
  def change
    create_table :progresses, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :video, null: false, foreign_key: true, type: :uuid
      t.integer :current_time
      t.decimal :completion_pct
      t.datetime :last_watched
      t.boolean :completed

      t.timestamps
    end
  end
end
