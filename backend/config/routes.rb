Rails.application.routes.draw do
  # Mount ActiveStorage routes to serve images
  mount ActiveStorage::Engine => '/rails/active_storage'
  
  namespace :api do
    # Auth
    post 'signup', to: 'auth#signup'
    post 'login', to: 'auth#login'
    
    # Restaurants
    resources :restaurants do
      member do
        get 'menu', to: 'menus#show'
        post 'menu', to: 'menus#create'
        post 'update_files', to: 'restaurants#update_files' # POST route for file uploads only
        get 'analytics', to: 'analytics#show'
      end
      # Orders for restaurant owners
      resources :orders, only: [:index, :show, :update], controller: 'orders'
      # Combos
      resources :combos, only: [:index, :show, :create, :update, :destroy]
      # Promotions
      resources :promotions, only: [:index, :show, :create, :update, :destroy]
    end
    
    # Menus
    resources :menus, only: [] do
      resources :categories, only: [:create]
    end
    
    # Categories
    resources :categories, only: [:update, :destroy]
    
    # Items
    resources :categories, only: [] do
      resources :items, only: [:create], path: 'items'
    end
    resources :items, only: [:update, :destroy]
    
    # Public endpoints
    namespace :public do
      get ':slug/menu', to: 'menus#show'
      get ':slug/qrcode', to: 'menus#qrcode'
      post ':slug/orders', to: 'orders#create'
      get ':slug/reviews', to: 'reviews#index'
      post ':slug/reviews', to: 'reviews#create'
    end
  end
end
