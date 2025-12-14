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
    update_params = item_params
    # Đảm bảo quantity được update ngay cả khi là 0
    if params.key?(:quantity)
      if params[:quantity].to_s.strip.empty?
        update_params[:quantity] = nil
      else
        update_params[:quantity] = params[:quantity].to_i
      end
    end
    
    # Nếu có category_id mới, cần kiểm tra quyền truy cập
    if update_params[:category_id].present? && update_params[:category_id].to_i != @item.category_id
      new_category = Category.find(update_params[:category_id])
      menu = new_category.menu
      unless menu.restaurant.user_id == current_user.id
        render json: { error: 'Unauthorized' }, status: :unauthorized
        return
      end
      # Cập nhật position trong category mới
      update_params[:position] = new_category.items.maximum(:position).to_i + 1
    end
    
    if @item.update(update_params)
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
    permitted = params.permit(:name, :price, :description, :is_available, :position, :quantity, :status, :is_visible, :category_id)
    # Xử lý quantity: nếu là empty string thì set thành nil, nếu có giá trị thì convert sang integer
    if params[:quantity].present?
      if params[:quantity].to_s.strip.empty?
        permitted[:quantity] = nil
      else
        permitted[:quantity] = params[:quantity].to_i
      end
    end
    permitted
  end
  
  def item_json(item)
    {
      id: item.id,
      name: item.name,
      price: item.price.to_f,
      description: item.description,
      is_available: item.is_available,
      position: item.position,
      image_url: item.image.attached? ? url_for(item.image) : nil,
      quantity: item.quantity,
      status: item.status || 'in_stock',
      is_visible: item.is_visible.nil? ? true : item.is_visible
    }
  end
end

