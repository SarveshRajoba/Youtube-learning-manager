class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users, id: :uuid do |t|
      t.string :email
      t.string :yt_access_token
      t.string :yt_refresh_token
      t.datetime :token_expiry

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
