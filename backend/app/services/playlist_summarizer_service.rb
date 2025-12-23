class PlaylistSummarizerService
  require 'google/apis/youtube_v3'
  require 'faraday'
  require 'json'
  require 'net/http'
  require 'uri'
  require 'cgi'

  def initialize(playlist_id)
    @playlist_id = playlist_id
    @youtube = Google::Apis::YoutubeV3::YouTubeService.new
    @youtube.key = ENV['YOUTUBE_API_KEY']
    @gemini_api_key = ENV['GEMINI_API_KEY']
  end

  def call
    Rails.logger.info "PlaylistSummarizerService called for playlist_id: #{@playlist_id}"
    
    # 1. Fetch Playlist Details
    playlist_details = fetch_playlist_details
    return { error: "Playlist not found" } unless playlist_details

    # 2. Determine strategy based on playlist size
    total_videos = playlist_details[:total_videos]
    
    if total_videos < 20
      # Small playlist: Fetch videos with transcripts
      videos = fetch_videos_with_transcripts(total_videos)
    else
      # Large playlist: Just metadata
      videos = fetch_first_n_videos(10)
    end
    
    # 3. Generate Summary via Gemini
    summary_data = generate_gemini_summary(playlist_details, videos, total_videos < 20)
    
    return { error: summary_data[:error] } if summary_data[:error]

    # 4. Return formatted data
    {
      playlist_info: playlist_details,
      summary: summary_data
    }
  rescue => e
    Rails.logger.error "PlaylistSummarizerService Error: #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    { error: e.message }
  end

  private

  def fetch_playlist_details
    response = @youtube.list_playlists('snippet,contentDetails', id: @playlist_id)
    return nil if response.items.empty?

    playlist = response.items.first
    {
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      total_videos: playlist.content_details.item_count,
      thumbnail_url: playlist.snippet.thumbnails.high&.url || playlist.snippet.thumbnails.default&.url
    }
  end

  def fetch_videos_with_transcripts(max_videos)
    response = @youtube.list_playlist_items(
      'snippet,contentDetails',
      playlist_id: @playlist_id,
      max_results: [max_videos, 50].min
    )
    
    # Get video IDs to fetch statistics
    video_ids = response.items.map { |item| item.content_details.video_id }
    
    # Fetch video details (duration, likes, etc.)
    video_details = fetch_video_details(video_ids)
    
    videos = []
    response.items.each_with_index do |item, idx|
      video_id = item.content_details.video_id
      transcript = fetch_transcript(video_id)
      details = video_details[video_id] || {}
      
      videos << {
        title: item.snippet.title,
        description: item.snippet.description,
        video_id: video_id,
        transcript: transcript,
        duration: details[:duration] || 0,
        like_count: details[:like_count] || 0
      }
    end
    
    videos
  end

  def fetch_first_n_videos(n)
    response = @youtube.list_playlist_items(
      'snippet,contentDetails',
      playlist_id: @playlist_id,
      max_results: n
    )
    
    # Get video IDs to fetch statistics
    video_ids = response.items.map { |item| item.content_details.video_id }
    
    # Fetch video details
    video_details = fetch_video_details(video_ids)
    
    response.items.map do |item|
      video_id = item.content_details.video_id
      details = video_details[video_id] || {}
      
      {
        title: item.snippet.title,
        description: item.snippet.description,
        video_id: video_id,
        duration: details[:duration] || 0,
        like_count: details[:like_count] || 0
      }
    end
  end

  def fetch_video_details(video_ids)
    return {} if video_ids.empty?
    
    response = @youtube.list_videos(
      'contentDetails,statistics',
      id: video_ids.join(',')
    )
    
    details = {}
    response.items.each do |video|
      duration_seconds = parse_duration(video.content_details.duration)
      
      details[video.id] = {
        duration: duration_seconds,
        like_count: video.statistics&.like_count&.to_i || 0
      }
    end
    
    details
  end

  def parse_duration(iso_duration)
    match = iso_duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    return 0 unless match
    
    hours = (match[1] || 0).to_i
    minutes = (match[2] || 0).to_i
    seconds = (match[3] || 0).to_i
    
    (hours * 3600) + (minutes * 60) + seconds
  end

  def fetch_transcript(video_id)
    # Try to fetch transcript using YouTube's timedtext API
    begin
      # First, get the video page to extract caption tracks
      video_page = Net::HTTP.get(URI("https://www.youtube.com/watch?v=#{video_id}"))
      
      # Extract caption track URL (looking for auto-generated or manual captions)
      caption_match = video_page.match(/"captionTracks":\[{"baseUrl":"([^"]+)"/)
      return nil unless caption_match
      
      caption_url = caption_match[1].gsub('\u0026', '&')
      
      # Fetch the caption XML
      caption_xml = Net::HTTP.get(URI(caption_url))
      
      # Parse XML and extract text (simple regex approach)
      text_content = caption_xml.scan(/<text[^>]*>([^<]+)<\/text>/).flatten.join(' ')
      
      # Clean up HTML entities
      text_content = CGI.unescapeHTML(text_content)
      
      # Limit to first 3000 characters to avoid huge prompts
      text_content[0..3000]
    rescue => e
      Rails.logger.warn "Could not fetch transcript for video #{video_id}: #{e.message}"
      nil
    end
  end

  def generate_gemini_summary(playlist_info, videos, has_transcripts)
    # Calculate actual statistics
    total_duration_seconds = videos.sum { |v| v[:duration] || 0 }
    total_time = format_duration(total_duration_seconds)
    
    # Calculate average likes (more representative than sum for playlists)
    like_counts = videos.map { |v| v[:like_count] || 0 }.reject(&:zero?)
    avg_likes = like_counts.any? ? (like_counts.sum / like_counts.size) : 0
    estimated_likes = format_number(avg_likes * playlist_info[:total_videos])
    
    if has_transcripts
      # Build prompt with transcripts
      video_content = videos.map.with_index do |v, i|
        content = "#{i + 1}. #{v[:title]}\n"
        content += "   Description: #{v[:description]}\n" if v[:description].present?
        content += "   Transcript: #{v[:transcript][0..500]}...\n" if v[:transcript].present?
        content
      end.join("\n")
      
      prompt = <<~PROMPT
        Analyze this YouTube playlist using the provided video transcripts and metadata.
        
        Playlist: #{playlist_info[:title]}
        Description: #{playlist_info[:description]}
        Total Videos: #{playlist_info[:total_videos]}
        
        Videos:
        #{video_content}
        
        Provide a JSON response with this structure:
        {
          "summary": "A comprehensive 200-word summary based on the actual content from transcripts.",
          "key_topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
          "target_audience": "Who is this for?",
          "difficulty_level": "Beginner/Intermediate/Advanced",
          "total_videos": #{playlist_info[:total_videos]},
          "estimated_total_likes": "Based on data"
        }
        
        IMPORTANT: Respond ONLY with valid JSON.
      PROMPT
    else
      # Metadata-only prompt
      prompt = <<~PROMPT
        Analyze this YouTube playlist metadata and provide a concise summary.
        
        Playlist: #{playlist_info[:title]}
        Description: #{playlist_info[:description]}
        Total Videos: #{playlist_info[:total_videos]}
        
        First #{videos.count} Videos:
        #{videos.map.with_index { |v, i| "#{i + 1}. #{v[:title]}" }.join("\n")}
        
        Provide a JSON response with this structure:
        {
          "summary": "A concise 150-word summary of what this playlist teaches and who it is for.",
          "key_topics": ["Topic 1", "Topic 2", "Topic 3"],
          "target_audience": "Who is this for?",
          "difficulty_level": "Beginner/Intermediate/Advanced",
          "total_videos": #{playlist_info[:total_videos]},
          "estimated_total_likes": "Based on data"
        }
        
        IMPORTANT: Respond ONLY with valid JSON.
      PROMPT
    end

    # Call Gemini API - using gemini-flash-latest model which is verified to work
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=#{URI.encode_www_form_component(@gemini_api_key)}"
    uri = URI(url)
    
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = has_transcripts ? 60 : 30
    
    request = Net::HTTP::Post.new(uri.request_uri)
    request['Content-Type'] = 'application/json'
    
    request_body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,        # High creativity for engaging summaries
        topP: 0.95,
        maxOutputTokens: 8192
      }
    }
    
    request.body = request_body.to_json
    
    response = http.request(request)
    
    unless response.code.to_i == 200
      Rails.logger.error "Gemini API call failed: #{response.code}"
      return { error: "Gemini API error: #{response.code}" }
    end

    result = JSON.parse(response.body)
    text_content = result.dig('candidates', 0, 'content', 'parts', 0, 'text')
    
    unless text_content && !text_content.empty?
      return { error: "Empty response from Gemini" }
    end

    # Calculate dynamic confidence score
    videos_sampled = videos.size
    total_videos_count = playlist_info[:total_videos]
    coverage_ratio = [videos_sampled.to_f / total_videos_count, 1.0].min
    
    # Check transcript success rate
    transcripts_found = has_transcripts ? videos.count { |v| v[:transcript].present? } : 0
    transcript_success_rate = videos_sampled > 0 ? (transcripts_found.to_f / videos_sampled) : 0
    
    # Base confidence depends on whether we have transcripts
    base_confidence = has_transcripts ? 90 : 70
    
    # Adjust based on coverage (full playlist = +10, partial = proportional)
    coverage_bonus = (coverage_ratio * 10).round
    
    # Adjust based on transcript success rate (if applicable)
    transcript_bonus = has_transcripts ? (transcript_success_rate * 5).round : 0
    
    # Calculate final confidence (cap at 98)
    calculated_confidence = [base_confidence + coverage_bonus + transcript_bonus, 98].min
    
    # Extract JSON
    json_match = text_content.match(/\{[\s\S]*\}/)
    if json_match
      parsed_data = JSON.parse(json_match[0])
      
      {
        summary: parsed_data['summary'] || text_content.strip,
        total_videos: parsed_data['total_videos'] || playlist_info[:total_videos],
        total_time: total_time,
        estimated_total_likes: estimated_likes,
        key_topics: parsed_data['key_topics'] || [],
        target_audience: parsed_data['target_audience'] || 'General learners',
        difficulty_level: parsed_data['difficulty_level'],
        confidence: calculated_confidence
      }
    else
      {
        summary: text_content.strip,
        total_videos: playlist_info[:total_videos],
        total_time: total_time,
        estimated_total_likes: estimated_likes,
        key_topics: [],
        target_audience: 'General learners',
        confidence: calculated_confidence - 10  # Lower if JSON parsing failed
      }
    end
  end

  def format_duration(seconds)
    hours = seconds / 3600
    minutes = (seconds % 3600) / 60
    
    if hours > 0
      "#{hours}h #{minutes}m"
    else
      "#{minutes}m"
    end
  end

  def format_number(num)
    case num
    when 0...1_000
      num.to_s
    when 1_000...1_000_000
      "#{(num / 1_000.0).round(1)}K"
    else
      "#{(num / 1_000_000.0).round(1)}M"
    end
  end
end
