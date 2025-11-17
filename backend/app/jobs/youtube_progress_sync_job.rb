# frozen_string_literal: true

class YoutubeProgressSyncJob < ApplicationJob
  queue_as :default

  # Sync YouTube progress for a specific user
  def perform(user_id)
    user = User.find_by(id: user_id)
    return unless user&.yt_access_token.present?

    Rails.logger.info "Starting YouTube progress sync for user #{user.email}"

    youtube_service = YoutubeService.new(user)
    result = youtube_service.sync_watch_progress

    if result[:error]
      Rails.logger.warn "YouTube sync for user #{user.email} completed with errors: #{result[:error]}"
    else
      Rails.logger.info "YouTube sync for user #{user.email} completed successfully. Synced #{result[:synced]} videos."
    end

    result
  rescue => e
    Rails.logger.error "YouTube progress sync failed for user #{user_id}: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    raise e
  end

  # Schedule sync for all users with YouTube tokens
  def self.sync_all_users
    User.where.not(yt_access_token: nil).find_each do |user|
      YoutubeProgressSyncJob.perform_later(user.id)
    end
  end
end

