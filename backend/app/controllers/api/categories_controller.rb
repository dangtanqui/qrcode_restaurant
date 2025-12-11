class Api::CategoriesController < ApplicationController
  before_action :set_category, only: [:update, :destroy]
  
  def create
    menu = Menu.find(params[:menu_id])
    @category = menu.categories.build(category_params)
    @category.position = menu.categories.maximum(:position).to_i + 1
    
    if @category.save
      render json: category_json(@category), status: :created
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    if @category.update(category_params)
      render json: category_json(@category)
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @category.destroy
    head :no_content
  end
  
  private
  
  def set_category
    @category = Category.find(params[:id])
    menu = @category.menu
    unless menu.restaurant.user_id == current_user.id
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end
  end
  
  def category_params
    params.permit(:name, :position)
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

