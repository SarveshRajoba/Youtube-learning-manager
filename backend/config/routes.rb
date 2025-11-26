Rails.application.routes.draw do
  resources :ai_summaries do
    collection do
      post :generate
      post :generate_playlist
      post :analyze_public_playlist
    end
  end
  resources :goals
  resources :progresses
  resources :videos
  resources :playlists
  
  # Dashboard endpoint
  get '/dashboard/stats', to: 'dashboard#stats'
  
  # YouTube sync endpoints
  post '/youtube/sync_progress', to: 'youtube_sync#sync_progress'
  get '/youtube/playlists', to: 'youtube_sync#user_playlists'
  post '/youtube/check_watched', to: 'youtube_sync#check_watched'
  
  # Regular auth endpoints
  post '/login', to: 'auth#login'
  post '/signup', to: 'auth#signup'
  
  # OAuth endpoints
  get '/auth/google', to: 'oauth/google_oauth2/auth#initiate'
  namespace :oauth do
    namespace :google_oauth2 do
      get '/callback', to: 'auth#callback'
    end
  end
  
  # Profile endpoints
  get '/profile', to: 'users/profile#show'
  patch '/profile', to: 'users/profile#update'
  patch '/profile/password', to: 'users/profile#update_password'
  
  
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"


end
