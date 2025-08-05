class User < ApplicationRecord
  has_secure_password

  # Associations
  has_many :playlists, dependent: :destroy
  has_many :videos, through: :playlists
  has_many :progresses, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :ai_summaries, through: :videos

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }

  before_create :generate_jti

  private

  def generate_jti
    self.jti = SecureRandom.uuid
  end
end
