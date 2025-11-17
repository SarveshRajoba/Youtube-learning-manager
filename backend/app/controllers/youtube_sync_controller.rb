# frozen_string_literal: true

class YoutubeSyncController < ApiController
  # POST /api/youtube/sync_progress
  def sync_progress
    unless current_user.yt_access_token.present?
      return render json: { 
        error: 'YouTube account not connected. Please connect your YouTube account first.' 
      }, status: :unauthorized
    end

    youtube_service = YoutubeService.new(current_user)
    result = youtube_service.sync_watch_progress

    if result[:error]
      render json: {
        synced_count: result[:synced],
        error: result[:error],
        message: "Synced #{result[:synced]} videos, but encountered an error: #{result[:error]}"
      }, status: :partial_content
    else
      render json: {
        synced_count: result[:synced],
        message: "Successfully synced #{result[:synced]} videos from YouTube"
      }, status: :ok
    end
  rescue => e
    Rails.logger.error "Sync progress error: #{e.message}"
    render json: { error: 'Failed to sync progress', details: e.message }, status: :internal_server_error
  end

  # GET /api/youtube/playlists
  def user_playlists
    unless current_user.yt_access_token.present?
      return render json: { 
        error: 'YouTube account not connected' 
      }, status: :unauthorized
    end

    youtube_service = YoutubeService.new(current_user)
    playlists = youtube_service.fetch_user_playlists

    render json: { playlists: playlists }, status: :ok
  rescue => e
    Rails.logger.error "Fetch playlists error: #{e.message}"
    render json: { error: 'Failed to fetch playlists', details: e.message }, status: :internal_server_error
  end

  # POST /api/youtube/check_watched
  # Check if specific videos have been watched on YouTube
  def check_watched
    video_ids = params[:video_ids] || []
    
    if video_ids.empty?
      return render json: { error: 'No video IDs provided' }, status: :bad_request
    end

    unless current_user.yt_access_token.present?
      return render json: { 
        error: 'YouTube account not connected' 
      }, status: :unauthorized
    end

    # Get YouTube IDs for the requested videos
    videos = current_user.videos.where(id: video_ids)
    yt_ids = videos.pluck(:yt_id)

    youtube_service = YoutubeService.new(current_user)
    watched_status = youtube_service.check_videos_watched(yt_ids)

    render json: { watched_videos: watched_status }, status: :ok
  rescue => e
    Rails.logger.error "Check watched error: #{e.message}"
    render json: { error: 'Failed to check watched status', details: e.message }, status: :internal_server_error
  end
end

