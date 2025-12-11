class Api::ItemsController < ApplicationController
  before_action :set_item, only: [:update, :destroy]
  
  def create
    category = Category.find(params[:category_id])
    menu = category.menu
    unless menu.restaurant.user_id == current_user.id
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end
    
    @item = category.items.build(item_params)
    @item.position = category.items.maximum(:position).to_i + 1
    @item.is_available = true unless params[:is_available].present?
    
    if @item.save
      @item.image.attach(params[:image]) if params[:image].present?
      render json: item_json(@item), status: :created
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    if @item.update(item_params)
      @item.image.attach(params[:image]) if params[:image].present?
      render json: item_json(@item)
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @item.destroy
    head :no_content
  end
  
  private
  
  def set_item
    @item = Item.find(params[:id])
    category = @item.category
    menu = category.menu
    unless menu.restaurant.user_id == current_user.id
      render json: { error: 'Unauthorized' }, status: :unauthorized
      return
    end
  end
  
  def item_params
    params.permit(:name, :price, :description, :is_available, :position)
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

