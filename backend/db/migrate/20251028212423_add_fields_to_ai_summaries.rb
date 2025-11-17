class AddFieldsToAiSummaries < ActiveRecord::Migration[8.0]
  def change
    add_column :ai_summaries, :title, :string
    add_column :ai_summaries, :key_points, :text
    add_column :ai_summaries, :tags, :text
    add_column :ai_summaries, :confidence, :integer
    add_column :ai_summaries, :is_bookmarked, :boolean
    add_column :ai_summaries, :generated_at, :datetime
  end
end
