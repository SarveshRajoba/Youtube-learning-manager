class AiSummarySerializer
  include JSONAPI::Serializer
  attributes :id, :title, :summary_text, :key_points, :tags, :confidence, :is_bookmarked, :generated_at, :created_at, :updated_at

  attribute :video do |summary|
    if summary.video
      {
        id: summary.video.id,
        title: summary.video.title,
        thumbnail_url: summary.video.thumbnail_url,
        duration: summary.video.duration,
        yt_id: summary.video.yt_id
      }
    else
      nil
    end
  end

  attribute :playlist do |summary|
    if summary.playlist
      {
        id: summary.playlist.id,
        title: summary.playlist.title,
        thumbnail_url: summary.playlist.thumbnail_url,
        video_count: summary.playlist.video_count,
        yt_id: summary.playlist.yt_id
      }
    elsif summary.video
      {
        id: summary.video.playlist.id,
        title: summary.video.playlist.title,
        thumbnail_url: summary.video.playlist.thumbnail_url,
        video_count: summary.video.playlist.video_count,
        yt_id: summary.video.playlist.yt_id
      }
    else
      nil
    end
  end

  attribute :parsed_key_points do |summary|
    JSON.parse(summary.key_points || '[]')
  end

  attribute :parsed_tags do |summary|
    parsed = JSON.parse(summary.tags || '[]')
    # If tags is an object (playlist summary), convert to array for compatibility
    if parsed.is_a?(Hash)
      parsed
    else
      parsed
    end
  end
  
  attribute :playlist_metadata do |summary|
    parsed_tags = JSON.parse(summary.tags || '{}')
    if parsed_tags.is_a?(Hash) && parsed_tags.key?('total_videos')
      {
        total_videos: parsed_tags['total_videos'],
        total_time: parsed_tags['total_time'],
        estimated_total_likes: parsed_tags['estimated_total_likes'],
        target_audience: parsed_tags['target_audience']
      }
    else
      nil
    end
  end
  
  attribute :is_playlist_summary do |summary|
    summary.playlist_id.present? && summary.video_id.nil?
  end
end