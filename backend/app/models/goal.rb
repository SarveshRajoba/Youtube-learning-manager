class Goal < ApplicationRecord
  belongs_to :user
  belongs_to :playlist
  belongs_to :video
end
