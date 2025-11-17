# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_17_053035) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "ai_summaries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "video_id"
    t.text "summary_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.text "key_points"
    t.text "tags"
    t.integer "confidence"
    t.boolean "is_bookmarked"
    t.datetime "generated_at"
    t.uuid "playlist_id"
    t.index ["created_at"], name: "index_ai_summaries_on_created_at"
    t.index ["playlist_id"], name: "index_ai_summaries_on_playlist_id"
    t.index ["video_id"], name: "index_ai_summaries_on_video_id"
  end

  create_table "goals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "playlist_id"
    t.uuid "video_id"
    t.date "target_date"
    t.decimal "current_pct"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "title"
    t.text "description"
    t.jsonb "todos", default: [], null: false
    t.index ["playlist_id"], name: "index_goals_on_playlist_id"
    t.index ["todos"], name: "index_goals_on_todos", using: :gin
    t.index ["user_id", "status"], name: "index_goals_on_user_and_status"
    t.index ["user_id"], name: "index_goals_on_user_active", where: "((status)::text = 'active'::text)"
    t.index ["user_id"], name: "index_goals_on_user_id"
    t.index ["video_id"], name: "index_goals_on_video_id"
  end

  create_table "playlists", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "yt_id"
    t.string "title"
    t.string "thumbnail_url"
    t.integer "video_count"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "notes", default: [], null: false
    t.index ["notes"], name: "index_playlists_on_notes", using: :gin
    t.index ["user_id", "created_at"], name: "index_playlists_on_user_and_created"
    t.index ["user_id", "yt_id"], name: "index_playlists_on_user_id_and_yt_id", unique: true
    t.index ["user_id"], name: "index_playlists_on_user_id"
  end

  create_table "progresses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "video_id", null: false
    t.integer "current_time"
    t.decimal "completion_pct"
    t.datetime "last_watched"
    t.boolean "completed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["last_watched"], name: "index_progresses_on_last_watched"
    t.index ["user_id", "completed"], name: "index_progresses_on_user_and_completion"
    t.index ["user_id"], name: "index_progresses_on_user_completed", where: "(completed = true)"
    t.index ["user_id"], name: "index_progresses_on_user_id"
    t.index ["video_id", "completed"], name: "index_progresses_on_video_and_completion"
    t.index ["video_id"], name: "index_progresses_on_video_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "yt_access_token"
    t.string "yt_refresh_token"
    t.datetime "token_expiry"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "jti", null: false
    t.string "provider"
    t.string "uid"
    t.string "name"
    t.string "image"
    t.string "password_digest"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
  end

  create_table "videos", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "playlist_id", null: false
    t.string "yt_id"
    t.string "title"
    t.string "thumbnail_url"
    t.integer "duration"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["playlist_id", "position"], name: "index_videos_on_playlist_and_position"
    t.index ["playlist_id", "yt_id"], name: "index_videos_on_playlist_id_and_yt_id", unique: true
    t.index ["playlist_id"], name: "index_videos_on_playlist_id"
  end

  add_foreign_key "ai_summaries", "playlists"
  add_foreign_key "ai_summaries", "videos"
  add_foreign_key "goals", "playlists"
  add_foreign_key "goals", "users"
  add_foreign_key "goals", "videos"
  add_foreign_key "playlists", "users"
  add_foreign_key "progresses", "users"
  add_foreign_key "progresses", "videos"
  add_foreign_key "videos", "playlists"
end
