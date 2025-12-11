class Api::RestaurantsController < ApplicationController
  before_action :set_restaurant, only: [:show, :update, :destroy]
  
  def index
    @restaurants = current_user.restaurants
    render json: @restaurants.map { |r| restaurant_json(r) }
  end
  
  def create
    @restaurant = current_user.restaurants.build(restaurant_params)
    
    if @restaurant.save
      @restaurant.logo.attach(params[:logo]) if params[:logo].present?
      render json: restaurant_json(@restaurant), status: :created
    else
      render json: { errors: @restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def show
    render json: restaurant_json(@restaurant)
  end
  
  def update
    if @restaurant.update(restaurant_params)
      @restaurant.logo.attach(params[:logo]) if params[:logo].present?
      render json: restaurant_json(@restaurant)
    else
      render json: { errors: @restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @restaurant.destroy
    head :no_content
  end
  
  private
  
  def set_restaurant
    @restaurant = current_user.restaurants.find(params[:id])
  end
  
  def restaurant_params
    params.permit(:name, :address, :currency, :exchange_rate)
  end
  
  def restaurant_json(restaurant)
    {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      slug: restaurant.slug,
      currency: restaurant.currency || 'VND',
      exchange_rate: restaurant.exchange_rate&.to_f || 25000.0,
      logo_url: restaurant.logo.attached? ? url_for(restaurant.logo) : nil,
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at
    }
  end
end

