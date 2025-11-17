class AiSummary < ApplicationRecord
  belongs_to :video, optional: true
  belongs_to :playlist, optional: true
  
  validates :video_id, presence: true, unless: -> { playlist_id.present? }
  validates :playlist_id, presence: true, unless: -> { video_id.present? }
end
