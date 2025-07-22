class CreateAiSummaries < ActiveRecord::Migration[8.0]
  def change
    create_table :ai_summaries, id: :uuid do |t|
      t.references :video, null: false, foreign_key: true, type: :uuid
      t.text :summary_text

      t.timestamps
    end
  end
end
