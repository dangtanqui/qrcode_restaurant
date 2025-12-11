class Api::MenusController < ApplicationController
  before_action :set_restaurant, only: [:show, :create]
  
  def show
    menu = @restaurant.menu
    if menu.nil?
      # Create menu if it doesn't exist
      menu = @restaurant.create_menu
      if menu.persisted?
        render json: menu_json(menu), status: :created
      else
        render json: { errors: menu.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: menu_json(menu)
    end
  end
  
  def create
    menu = @restaurant.build_menu
    if menu.save
      render json: menu_json(menu), status: :created
    else
      render json: { errors: menu.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_restaurant
    @restaurant = current_user.restaurants.find_by(id: params[:id])
    unless @restaurant
      render json: { error: 'Restaurant not found' }, status: :not_found
      return
    end
  end
  
  def menu_json(menu)
    {
      id: menu.id,
      restaurant_id: menu.restaurant_id,
      categories: menu.categories.order(:position).map { |cat| category_json(cat) }
    }
  end
  
  def category_json(category)
    {
      id: category.id,
      name: category.name,
      position: category.position,
      items: category.items.ordered.map { |item| item_json(item) }
    }
  end
  
  def item_json(item)
    {
      id: item.id,
      name: item.name,
      price: item.price.to_f,
      description: item.description,
      is_available: item.is_available,
      position: item.position,
      image_url: item.image.attached? ? url_for(item.image) : nil
    }
  end
end



