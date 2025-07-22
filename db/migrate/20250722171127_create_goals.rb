class CreateGoals < ActiveRecord::Migration[8.0]
  def change
    create_table :goals, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :playlist, null: false, foreign_key: true, type: :uuid
      t.references :video, null: false, foreign_key: true, type: :uuid
      t.date :target_date
      t.decimal :current_pct
      t.string :status

      t.timestamps
    end
  end
end
