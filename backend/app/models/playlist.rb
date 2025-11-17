class Playlist < ApplicationRecord
  belongs_to :user
  has_many :videos, dependent: :destroy
  has_many :ai_summaries, dependent: :destroy
end
