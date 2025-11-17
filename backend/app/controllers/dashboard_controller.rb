# frozen_string_literal: true

class DashboardController < ApiController

  def stats
    # Get user's playlists and videos
    return render json: { error: 'Authentication required' }, status: :unauthorized unless current_user
    
    playlists = current_user.playlists.includes(:videos)
    progresses = current_user.progresses

    # Calculate real statistics
    total_videos = current_user.videos.count
    completed_videos = progresses.where(completed: true).count
    total_watch_time = calculate_total_watch_time(progresses)
    
    # Get active goals
    active_goals = current_user.goals.where(status: 'active').count
    
    # Calculate weekly progress (videos completed this week)
    week_start = 1.week.ago.beginning_of_day
    week_end = Time.current.end_of_day
    weekly_completed = progresses.where(completed: true, last_watched: week_start..week_end).count
    weekly_total = progresses.where(last_watched: week_start..week_end).count
    weekly_progress = weekly_total > 0 ? (weekly_completed.to_f / weekly_total * 100).round : 0

    # Recent activity (last 5 completed videos)
    recent_activities = progresses
      .where(completed: true)
      .includes(video: :playlist)
      .order(last_watched: :desc)
      .limit(5)

    # Recent playlists (last 3 playlists with progress)
    recent_playlists = playlists
      .order(created_at: :desc)
      .limit(3)
      .map do |playlist|
        {
          id: playlist.id,
          title: playlist.title,
          videos_count: playlist.videos.count,
          completed_count: playlist.videos.joins(:progresses).where(progresses: { completed: true, user_id: current_user.id }).count,
          thumbnail: playlist.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
          thumbnail_url: playlist.thumbnail_url,
          yt_id: playlist.yt_id
        }
      end

    render json: {
      data: {
        stats: {
          total_videos: total_videos,
          completed_videos: completed_videos,
          total_watch_time: total_watch_time,
          active_goals: active_goals,
          weekly_progress: weekly_progress
        },
        recent_activities: recent_activities.map do |progress|
          {
            id: progress.id,
            type: 'completed',
            title: progress.video.title,
            playlist: progress.video.playlist.title,
            timestamp: time_ago_in_words(progress.last_watched) + ' ago'
          }
        end,
        recent_playlists: recent_playlists
      }
    }
  end

  private

  def calculate_total_watch_time(progresses)
    # Sum up all current_time from progresses (in seconds)
    total_seconds = progresses.sum(:current_time) || 0
    
    # Convert to hours and minutes
    hours = total_seconds / 3600
    minutes = (total_seconds % 3600) / 60
    
    if hours > 0
      "#{hours}h #{minutes}m"
    else
      "#{minutes}m"
    end
  end

  def time_ago_in_words(time)
    return 'unknown' unless time
    
    distance = Time.current - time
    
    case distance
    when 0..59
      'less than a minute'
    when 60..3599
      "#{(distance / 60).round} minutes"
    when 3600..86399
      "#{(distance / 3600).round} hours"
    when 86400..2591999
      "#{(distance / 86400).round} days"
    else
      "#{(distance / 2592000).round} months"
    end
  end
end
