class AddTodosToGoals < ActiveRecord::Migration[8.0]
  def change
    add_column :goals, :todos, :jsonb, default: [], null: false
    add_index :goals, :todos, using: :gin
  end
end

