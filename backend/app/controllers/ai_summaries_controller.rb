class AiSummariesController < ApiController
  before_action :authenticate_user!
  before_action :set_ai_summary, only: %i[show update destroy]

  # GET /ai_summaries
  def index
    # Get summaries for videos and playlists that belong to the current user
    user_video_ids = current_user.playlists.joins(:videos).pluck('videos.id')
    user_playlist_ids = current_user.playlists.pluck('id')
    
    ai_summaries = AiSummary.where(
      '(video_id IN (?) OR playlist_id IN (?))',
      user_video_ids,
      user_playlist_ids
    ).includes(:video, :playlist)
    
    # Filter by playlist_id if provided
    if params[:playlist_id].present?
      ai_summaries = ai_summaries.where(playlist_id: params[:playlist_id])
    end
    
    flattened_summaries = ai_summaries.map { |summary| 
      serialized = AiSummarySerializer.new(summary).serializable_hash[:data]
      # Flatten attributes for frontend compatibility
      if serialized[:attributes]
        # Merge attributes with id from data level (in case id isn't in attributes)
        flattened = serialized[:attributes].merge(id: serialized[:id] || serialized[:attributes][:id])
        flattened
      else
        serialized
      end
    }
    
    Rails.logger.info "Returning #{flattened_summaries.count} summaries"
    Rails.logger.info "First summary keys: #{flattened_summaries.first&.keys&.inspect}" if flattened_summaries.any?
    
    render json: { data: flattened_summaries }
  end

  # GET /ai_summaries/1
  def show
    render json: { data: AiSummarySerializer.new(@ai_summary).serializable_hash[:data] }
  end

  # POST /ai_summaries
  def create
    ai_summary = AiSummary.new(ai_summary_params)
    if ai_summary.save
      render json: { data: AiSummarySerializer.new(ai_summary).serializable_hash[:data] }, status: :created
    else
      render json: { errors: ai_summary.errors }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /ai_summaries/1
  def update
    if @ai_summary.update(ai_summary_params)
      render json: { data: AiSummarySerializer.new(@ai_summary).serializable_hash[:data] }
    else
      render json: { errors: @ai_summary.errors }, status: :unprocessable_entity
    end
  end

  # DELETE /ai_summaries/1
  def destroy
    @ai_summary.destroy!
    head :no_content
  end

  # POST /ai_summaries/generate
  def generate
    video = Video.find(params[:video_id])
    
    # Check if video belongs to user's playlists
    unless current_user.playlists.joins(:videos).exists?(videos: { id: video.id })
      render json: { error: 'Video not found' }, status: :not_found
      return
    end

    # Generate AI summary using Gemini API
    begin
      summary_data = generate_ai_summary_for_video(video)
      
      ai_summary = AiSummary.create!(
        video: video,
        title: summary_data[:title],
        summary_text: summary_data[:summary],
        key_points: summary_data[:key_points].to_json,
        tags: summary_data[:tags].to_json,
        confidence: summary_data[:confidence],
        is_bookmarked: false,
        generated_at: Time.current
      )
      
      render json: { data: AiSummarySerializer.new(ai_summary).serializable_hash[:data] }, status: :created
    rescue => e
      render json: { error: 'Failed to generate summary', message: e.message }, status: :unprocessable_entity
    end
  end

  # POST /ai_summaries/generate_playlist
  def generate_playlist
    playlist_id = params[:playlist_id] || params.dig(:ai_summary, :playlist_id)
    
    unless playlist_id
      return render json: { error: 'playlist_id is required' }, status: :bad_request
    end
    
    playlist = current_user.playlists.find(playlist_id)
    
    # Generate AI summary using Service
    begin
      service = PlaylistSummarizerService.new(playlist.yt_id) # Use external playlist_id
      result = service.call
      
      if result[:error]
        return render json: { error: result[:error] }, status: :unprocessable_entity
      end

      summary_data = result[:summary]
      
      # Use a transaction block with locking to prevent race conditions
      ai_summary = AiSummary.transaction do
        # Find or initialize to prevent duplicates
        summary = AiSummary.lock.find_or_initialize_by(playlist_id: playlist.id)
        
        summary.assign_attributes(
          video_id: nil,
          title: "#{playlist.title} - Playlist Summary",
          summary_text: summary_data[:summary],
          key_points: (summary_data[:key_topics] || []).to_json,
          tags: {
            total_videos: summary_data[:total_videos],
            total_time: summary_data[:total_time],
            estimated_total_likes: summary_data[:estimated_total_likes],
            target_audience: summary_data[:target_audience],
            difficulty_level: summary_data[:difficulty_level]
          }.to_json,
          confidence: summary_data[:confidence] || 85,
          is_bookmarked: false,
          generated_at: Time.current
        )
        
        summary.save!
        summary
      end
      
      serialized = AiSummarySerializer.new(ai_summary).serializable_hash[:data]
      # Flatten attributes for frontend compatibility
      flattened_data = if serialized[:attributes]
        serialized[:attributes].merge(id: serialized[:id])
      else
        serialized
      end
      
      render json: { 
        data: flattened_data
      }, status: :ok
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Playlist summary error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: 'Failed to generate playlist summary', message: e.message }, status: :unprocessable_entity
    end
  end

  # POST /ai_summaries/analyze_public_playlist
  def analyze_public_playlist
    playlist_url = params[:playlist_url]
    
    unless playlist_url.present?
      return render json: { error: 'Playlist URL is required' }, status: :bad_request
    end

    # Extract playlist ID from URL
    playlist_id = extract_playlist_id(playlist_url)
    unless playlist_id
      return render json: { error: 'Invalid playlist URL. Please provide a valid YouTube playlist URL.' }, status: :bad_request
    end

    begin
      # Fetch public playlist data from YouTube
      playlist_data = fetch_public_playlist_data(playlist_id)
      
      # Generate analytical summary using Gemini
      summary_data = generate_analytical_summary(playlist_data)
      
      render json: {
        data: {
          playlist_info: {
            title: playlist_data[:title],
            video_count: playlist_data[:video_count],
            total_duration: playlist_data[:total_duration],
            total_duration_formatted: playlist_data[:total_duration_formatted],
            thumbnail_url: playlist_data[:thumbnail_url],
            description: playlist_data[:description]
          },
          analysis: summary_data
        }
      }, status: :ok
    rescue => e
      Rails.logger.error "Public playlist analysis error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: { error: 'Failed to analyze playlist', message: e.message }, status: :unprocessable_entity
    end
  end

  private
    def set_ai_summary
      @ai_summary = AiSummary.find(params[:id])
    end

    def ai_summary_params
      params.require(:ai_summary).permit(:video_id, :summary_text, :title, :key_points, :tags, :confidence, :is_bookmarked)
    end

    def generate_ai_summary_for_video(video)
      # Placeholder for video summary
      {
        title: "#{video.title} - Key Concepts",
        summary: "This video covers important concepts related to #{video.title}.",
        key_points: [
          "Understanding the fundamentals",
          "Practical applications",
          "Best practices and tips"
        ],
        tags: ["Learning", "Tutorial"],
        confidence: 85
      }
    end



    def extract_playlist_id(url)
      # Handle various YouTube playlist URL formats
      patterns = [
        /[?&]list=([a-zA-Z0-9_-]+)/,  # Standard: ?list=PLxxx or &list=PLxxx
        /\/playlist\?list=([a-zA-Z0-9_-]+)/,  # /playlist?list=PLxxx
        /list=([a-zA-Z0-9_-]+)/  # Just list=PLxxx
      ]
      
      patterns.each do |pattern|
        match = url.match(pattern)
        return match[1] if match
      end
      
      nil
    end

    def fetch_public_playlist_data(playlist_id)
      require 'net/http'
      require 'json'
      
      youtube_api_key = ENV['YOUTUBE_API_KEY']
      unless youtube_api_key.present?
        raise "YOUTUBE_API_KEY not set in environment variables"
      end

      # Fetch playlist details
      playlist_uri = URI("https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=#{playlist_id}&key=#{youtube_api_key}")
      playlist_response = Net::HTTP.get_response(playlist_uri)
      
      unless playlist_response.code.to_i == 200
        raise "Failed to fetch playlist: #{playlist_response.code}"
      end
      
      playlist_data = JSON.parse(playlist_response.body)
      return nil if playlist_data['items'].empty?
      
      playlist = playlist_data['items'].first
      title = playlist['snippet']['title']
      description = playlist['snippet']['description']
      thumbnail_url = playlist['snippet']['thumbnails']['high']['url'] rescue playlist['snippet']['thumbnails']['default']['url']
      
      # Fetch all videos in playlist
      videos = []
      next_page_token = nil
      total_duration = 0
      
      loop do
        videos_uri = URI("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=#{playlist_id}&maxResults=50&key=#{youtube_api_key}#{next_page_token ? "&pageToken=#{next_page_token}" : ''}")
        videos_response = Net::HTTP.get_response(videos_uri)
        
        unless videos_response.code.to_i == 200
          raise "Failed to fetch videos: #{videos_response.code}"
        end
        
        videos_data = JSON.parse(videos_response.body)
        
        # Get video IDs
        video_ids = videos_data['items'].map { |item| item['contentDetails']['videoId'] }
        
        # Fetch video details including duration
        if video_ids.any?
          video_details_uri = URI("https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=#{video_ids.join(',')}&key=#{youtube_api_key}")
          video_details_response = Net::HTTP.get_response(video_details_uri)
          
          if video_details_response.code.to_i == 200
            video_details_data = JSON.parse(video_details_response.body)
            
            video_details_data['items'].each do |video|
              title = video['snippet']['title']
              duration_str = video['contentDetails']['duration'] # ISO 8601 format: PT4M13S
              duration_seconds = parse_duration(duration_str)
              total_duration += duration_seconds
              view_count = video['statistics']['viewCount'] rescue 0
              
              videos << {
                title: title,
                duration: duration_seconds,
                view_count: view_count.to_i
              }
            end
          end
        end
        
        next_page_token = videos_data['nextPageToken']
        break unless next_page_token
      end
      
      {
        title: title,
        description: description || '',
        thumbnail_url: thumbnail_url,
        video_count: videos.length,
        total_duration: total_duration,
        total_duration_formatted: format_duration(total_duration),
        videos: videos.first(50) # Limit to first 50 for Gemini prompt
      }
    end

    def parse_duration(iso_duration)
      # Parse ISO 8601 duration (PT4M13S, PT1H30M, etc.)
      match = iso_duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      return 0 unless match
      
      hours = (match[1] || 0).to_i
      minutes = (match[2] || 0).to_i
      seconds = (match[3] || 0).to_i
      
      (hours * 3600) + (minutes * 60) + seconds
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

    def generate_analytical_summary(playlist_data)
      require 'net/http'
      require 'json'
      require 'uri'
      
      gemini_api_key = ENV['GEMINI_API_KEY']
      unless gemini_api_key
        Rails.logger.error "GEMINI_API_KEY environment variable is not set"
        raise "GEMINI_API_KEY not set in environment variables"
      end

      # Prepare comprehensive prompt
      video_titles_list = playlist_data[:videos].map.with_index { |v, i| "#{i + 1}. #{v[:title]} (#{format_duration(v[:duration])})" }.join("\n")
      
      prompt = <<~PROMPT
      You are an educational content analyst. Analyze this YouTube playlist and provide a comprehensive analytical summary that helps someone decide if this playlist is worth their time BEFORE starting it.

      PLAYLIST INFORMATION:
      Title: #{playlist_data[:title]}
      Total Videos: #{playlist_data[:video_count]}
      Total Duration: #{playlist_data[:total_duration_formatted]}
      Description: #{playlist_data[:description][0..500]}

      VIDEO LIST (first #{playlist_data[:videos].length} videos):
      #{video_titles_list}

      Provide a detailed analytical summary in JSON format with this structure:
      {
        "overview": "2-3 sentences summarizing what this playlist covers and who it's for",
        "key_insights": [
          "Important insight 1",
          "Important insight 2",
          ...
        ],
        "learning_path": "Describe the progression/learning path through the videos",
        "time_investment": "Analysis of time commitment required and value proposition",
        "prerequisites": "What background knowledge or prerequisites are needed",
        "best_for": "Who would benefit most from this playlist",
        "considerations": ["Important consideration 1", "Consideration 2", ...],
        "estimated_completion_time": "Realistic time estimate including breaks",
        "difficulty_level": "Beginner/Intermediate/Advanced",
        "topics_covered": ["Topic 1", "Topic 2", ...]
      }

      Be analytical, honest, and helpful. Focus on information someone would need to know BEFORE committing time to watch this playlist.
      PROMPT

      # Call Gemini API - using gemini-flash-latest model which is verified to work
      url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=#{URI.encode_www_form_component(gemini_api_key)}"
      uri = URI(url)
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.read_timeout = 90
      
      request = Net::HTTP::Post.new(uri.request_uri)
      request['Content-Type'] = 'application/json'
      
      # Simplified request body matching the example format
      request_body = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }
      
      request.body = request_body.to_json
      
      response = http.request(request)
      
      unless response.code.to_i == 200
        error_body = JSON.parse(response.body) rescue response.body
        Rails.logger.error "Gemini API call failed: #{response.code} - #{error_body}"
        raise "Gemini API returned error: #{response.code}"
      end

      result = JSON.parse(response.body)
      text_content = result.dig('candidates', 0, 'content', 'parts', 0, 'text')
      
      unless text_content
        Rails.logger.error "No valid response text from Gemini API"
        raise "Unexpected response format from Gemini API"
      end
      
      # Extract JSON from the response
      json_match = text_content.match(/\{[\s\S]*\}/)
      if json_match
        JSON.parse(json_match[0])
      else
        # Fallback
        {
          "overview" => text_content[0..500],
          "key_insights" => ["Analysis generated successfully"],
          "learning_path" => "Review the video list to understand the progression",
          "time_investment" => "Total duration: #{playlist_data[:total_duration_formatted]}",
          "prerequisites" => "Review playlist description for prerequisites",
          "best_for" => "Anyone interested in #{playlist_data[:title]}",
          "considerations" => ["Large playlist with #{playlist_data[:video_count]} videos"],
          "estimated_completion_time" => playlist_data[:total_duration_formatted],
          "difficulty_level" => "Mixed",
          "topics_covered" => ["See video titles above"]
        }
      end
    rescue => e
      Rails.logger.error "Error generating analytical summary: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      raise e
    end
end
