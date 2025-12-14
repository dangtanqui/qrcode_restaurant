class Api::CombosController < ApplicationController
  before_action :set_restaurant
  before_action :set_combo, only: [:show, :update, :destroy]
  
  def index
    @combos = @restaurant.combos.includes(combo_items: :item).order(created_at: :desc)
    render json: @combos.map { |combo| combo_json(combo) }
  end
  
  def show
    render json: combo_json(@combo)
  end
  
  def create
    combo_params = permit_combo_params
    
    @combo = @restaurant.combos.build(combo_params)
    
    if @combo.save
      # Handle items
      if params[:items].present?
        items_data = JSON.parse(params[:items])
        items_data.each do |item_data|
          item_id = item_data['item_id'] || item_data[:item_id]
          quantity = (item_data['quantity'] || item_data[:quantity] || 1).to_i
          @combo.combo_items.create!(
            item_id: item_id,
            quantity: quantity
          )
        end
        @combo.reload
      end
      
      # Handle image
      if params[:image].present?
        @combo.image.attach(params[:image])
      end
      
      render json: combo_json(@combo.reload), status: :created
    else
      render json: { errors: @combo.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    combo_params = permit_combo_params
    
    if @combo.update(combo_params)
      # Handle items update
      if params[:items].present?
        items_data = JSON.parse(params[:items])
        @combo.combo_items.destroy_all
        items_data.each do |item_data|
          item_id = item_data['item_id'] || item_data[:item_id]
          quantity = (item_data['quantity'] || item_data[:quantity] || 1).to_i
          @combo.combo_items.create!(
            item_id: item_id,
            quantity: quantity
          )
        end
        @combo.reload
      end
      
      # Handle image update
      if params[:image].present?
        @combo.image.attach(params[:image])
      end
      
      render json: combo_json(@combo.reload)
    else
      render json: { errors: @combo.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @combo.destroy
    head :no_content
  end
  
  private
  
  def set_restaurant
    @restaurant = current_user.restaurants.find(params[:restaurant_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Restaurant not found' }, status: :not_found
  end
  
  def set_combo
    @combo = @restaurant.combos.includes(combo_items: :item).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Combo not found' }, status: :not_found
  end
  
  def permit_combo_params
    params.permit(:name, :description, :price, :is_available)
          .tap do |permitted|
            # Convert is_available string to boolean if present
            if permitted[:is_available].present?
              permitted[:is_available] = permitted[:is_available] == 'true' || permitted[:is_available] == true
            end
          end
  end
  
  def combo_json(combo)
    {
      id: combo.id,
      restaurant_id: combo.restaurant_id,
      name: combo.name,
      description: combo.description,
      price: combo.price.to_f,
      image_url: combo.image.attached? ? url_for(combo.image) : nil,
      total_original_price: combo.total_original_price.to_f,
      savings: combo.savings.to_f,
      savings_percentage: combo.savings_percentage,
      is_available: combo.is_available,
      items: combo.combo_items.map { |ci| combo_item_json(ci) },
      created_at: combo.created_at.iso8601,
      updated_at: combo.updated_at.iso8601
    }
  end
  
  def combo_item_json(combo_item)
    {
      id: combo_item.id,
      item_id: combo_item.item_id,
      item_name: combo_item.item.name,
      quantity: combo_item.quantity,
      item_price: combo_item.item.price.to_f
    }
  end
end

