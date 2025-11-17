class PlaylistSerializer
  include JSONAPI::Serializer
  attributes :id, :yt_id, :title, :thumbnail_url, :video_count, :user_id, :created_at, :updated_at
  
  attribute :notes do |playlist|
    playlist.notes || []
  end

  attribute :videos do |playlist, params|
    user_progresses = params[:user_progresses] || {}
    
    playlist.videos.map do |video|
      # Use preloaded progresses hash to avoid N+1 queries
      progress = user_progresses[video.id]
      
      {
        id: video.id,
        title: video.title,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        position: video.position,
        yt_id: video.yt_id,
        playlist_id: video.playlist_id,
        progress: progress ? {
          current_time: progress.current_time,
          completion_pct: progress.completion_pct,
          completed: progress.completed,
          last_watched: progress.last_watched
        } : nil
      }
    end
  end
end
