class Goal < ApplicationRecord
  belongs_to :user
  belongs_to :playlist, optional: true
  belongs_to :video, optional: true
end
