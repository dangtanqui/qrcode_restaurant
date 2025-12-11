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
      end
      # Orders for restaurant owners
      resources :orders, only: [:index, :show, :update], controller: 'orders'
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
    end
  end
end
