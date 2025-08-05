class VideoSerializer
  include JSONAPI::Serializer
  attributes :id, :yt_id, :title, :thumbnail_url, :duration, :position, :playlist_id
end
