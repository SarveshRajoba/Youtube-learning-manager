class Video < ApplicationRecord
  belongs_to :playlist
  has_many :progresses, dependent: :destroy
  has_many :ai_summaries, dependent: :destroy
end
