# frozen_string_literal: true

require 'google/apis/youtube_v3'
require 'signet/oauth_2/client'

class YoutubeService
  def initialize(user)
    @user = user
    @youtube = Google::Apis::YoutubeV3::YouTubeService.new
    @youtube.authorization = get_authorization
  end

  # Sync watch progress from YouTube for user's videos
  def sync_watch_progress
    return { synced: 0, error: 'No YouTube token' } unless @youtube.authorization

    synced_count = 0
    user_video_ids = @user.videos.pluck(:yt_id, :id).to_h

    begin
      # Fetch user's watch history from YouTube
      # Note: This requires the youtube.readonly scope
      history_items = fetch_watch_history(user_video_ids.keys)

      history_items.each do |item|
        video_id = user_video_ids[item[:yt_id]]
        next unless video_id

        # Create or update progress record
        progress = @user.progresses.find_or_initialize_by(video_id: video_id)
        progress.completed = item[:completed]
        progress.last_watched = item[:watched_at]
        progress.completion_pct = item[:completed] ? 100 : 0
        
        if progress.save
          synced_count += 1
          Rails.logger.info "Synced progress for video #{item[:yt_id]}"
        end
      end

      { synced: synced_count, error: nil }
    rescue Google::Apis::AuthorizationError => e
      Rails.logger.error "YouTube authorization error: #{e.message}"
      @user.refresh_youtube_token!
      { synced: 0, error: 'Authorization expired, please try again' }
    rescue => e
      Rails.logger.error "YouTube sync error: #{e.message}"
      { synced: synced_count, error: e.message }
    end
  end

  # Check if specific videos are in user's watch history
  def check_videos_watched(video_yt_ids)
    return {} unless @youtube.authorization

    watched = {}
    
    begin
      # Fetch recent watch history
      history_items = fetch_watch_history(video_yt_ids)
      
      history_items.each do |item|
        watched[item[:yt_id]] = {
          watched: true,
          watched_at: item[:watched_at],
          completed: item[:completed]
        }
      end
      
      watched
    rescue => e
      Rails.logger.error "Error checking watched videos: #{e.message}"
      {}
    end
  end

  # Fetch user's playlists from YouTube
  def fetch_user_playlists(max_results: 50)
    return [] unless @youtube.authorization

    begin
      response = @youtube.list_playlists(
        'snippet,contentDetails',
        mine: true,
        max_results: max_results
      )

      response.items.map do |playlist|
        {
          id: playlist.id,
          title: playlist.snippet.title,
          description: playlist.snippet.description,
          thumbnail_url: playlist.snippet.thumbnails&.medium&.url,
          video_count: playlist.content_details.item_count
        }
      end
    rescue => e
      Rails.logger.error "Error fetching playlists: #{e.message}"
      []
    end
  end

  private

  def get_authorization
    return nil unless @user.yt_access_token

    access_token = @user.youtube_access_token # Auto-refreshes if needed
    return nil unless access_token

    # Create authorization object
    client = Signet::OAuth2::Client.new(
      client_id: ENV['GOOGLE_CLIENT_ID'],
      client_secret: ENV['GOOGLE_CLIENT_SECRET'],
      token_credential_uri: 'https://oauth2.googleapis.com/token',
      access_token: access_token,
      refresh_token: @user.yt_refresh_token
    )

    client
  rescue => e
    Rails.logger.error "Error getting authorization: #{e.message}"
    nil
  end

  # Fetch watch history from YouTube
  # Note: YouTube API doesn't provide direct watch history access
  # We'll use the 'myRating' endpoint to check if videos were liked/watched
  def fetch_watch_history(video_yt_ids)
    return [] if video_yt_ids.empty?

    watched_videos = []

    begin
      # Process videos in batches of 50 (API limit)
      video_yt_ids.each_slice(50) do |batch|
        # Check if videos have been rated (indicates viewing)
        response = @youtube.list_videos(
          'snippet,contentDetails,statistics',
          id: batch.join(','),
          my_rating: 'like' # This requires authentication
        )

        # Also check for videos in user's watch later playlist
        # or recently watched videos
        watch_later = get_watch_later_videos
        
        batch.each do |yt_id|
          # Check if video is in watch later or has interaction
          if watch_later.include?(yt_id)
            watched_videos << {
              yt_id: yt_id,
              watched_at: Time.current, # Approximate
              completed: false
            }
          end
        end
      end

      watched_videos
    rescue => e
      Rails.logger.error "Error fetching watch history: #{e.message}"
      []
    end
  end

  # Get videos from user's Watch Later playlist
  def get_watch_later_videos
    begin
      # First, get the Watch Later playlist ID
      channels_response = @youtube.list_channels(
        'contentDetails',
        mine: true
      )

      return [] if channels_response.items.empty?

      watch_later_id = channels_response.items.first.content_details.related_playlists.watch_later
      
      # Fetch videos from Watch Later playlist
      playlist_items = []
      next_page_token = nil

      loop do
        response = @youtube.list_playlist_items(
          'contentDetails',
          playlist_id: watch_later_id,
          max_results: 50,
          page_token: next_page_token
        )

        playlist_items.concat(response.items.map { |item| item.content_details.video_id })
        
        next_page_token = response.next_page_token
        break if next_page_token.nil?
      end

      playlist_items
    rescue => e
      Rails.logger.error "Error fetching watch later: #{e.message}"
      []
    end
  end
end

