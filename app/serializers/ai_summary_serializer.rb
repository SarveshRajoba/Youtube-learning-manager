class AiSummarySerializer
  include JSONAPI::Serializer
  attributes :id, :video_id, :summary_text
end
