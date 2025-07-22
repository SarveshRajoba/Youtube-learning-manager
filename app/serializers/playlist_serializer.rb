class PlaylistSerializer
  include JSONAPI::Serializer
  attributes :id, :yt_id, :title, :thumbnail_url, :video_count, :user_id
end
