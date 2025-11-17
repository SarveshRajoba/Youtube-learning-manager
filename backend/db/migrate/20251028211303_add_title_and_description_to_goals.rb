class AddTitleAndDescriptionToGoals < ActiveRecord::Migration[8.0]
  def change
    add_column :goals, :title, :string
    add_column :goals, :description, :text
  end
end
