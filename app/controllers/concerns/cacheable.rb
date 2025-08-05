module Cacheable
  extend ActiveSupport::Concern

  included do
    before_action :set_cache_headers
  end

  private

  def set_cache_headers
    # Cache public data for 5 minutes
    response.headers['Cache-Control'] = 'public, max-age=300' if action_name.in?(['index', 'show'])
  end

  def cache_key_for_collection(collection, prefix = nil)
    key = "#{prefix || collection.model.name.downcase}/#{collection.maximum(:updated_at)&.to_i}"
    "api/#{key}"
  end

  def cache_key_for_record(record)
    "api/#{record.class.name.downcase}/#{record.id}/#{record.updated_at.to_i}"
  end

  def cache_with_etag(record, &block)
    fresh_when(record, etag: cache_key_for_record(record), last_modified: record.updated_at)
  end
end 