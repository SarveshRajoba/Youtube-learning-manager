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

ActiveRecord::Schema[8.0].define(version: 2025_07_22_175310) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"
  enable_extension "pgcrypto"

  create_table "ai_summaries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "video_id", null: false
    t.text "summary_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["video_id"], name: "index_ai_summaries_on_video_id"
  end

  create_table "goals", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.uuid "playlist_id", null: false
    t.uuid "video_id", null: false
    t.date "target_date"
    t.decimal "current_pct"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["playlist_id"], name: "index_goals_on_playlist_id"
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
    t.index ["user_id"], name: "index_playlists_on_user_id"
    t.index ["yt_id"], name: "index_playlists_on_yt_id", unique: true
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
    t.index ["user_id"], name: "index_progresses_on_user_id"
    t.index ["video_id"], name: "index_progresses_on_video_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "email"
    t.string "yt_access_token"
    t.string "yt_refresh_token"
    t.datetime "token_expiry"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "jti", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
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
    t.index ["playlist_id"], name: "index_videos_on_playlist_id"
    t.index ["yt_id"], name: "index_videos_on_yt_id", unique: true
  end

  add_foreign_key "ai_summaries", "videos"
  add_foreign_key "goals", "playlists"
  add_foreign_key "goals", "users"
  add_foreign_key "goals", "videos"
  add_foreign_key "playlists", "users"
  add_foreign_key "progresses", "users"
  add_foreign_key "progresses", "videos"
  add_foreign_key "videos", "playlists"
end
