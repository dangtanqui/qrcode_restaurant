class Api::PromotionsController < ApplicationController
  before_action :set_restaurant
  before_action :set_promotion, only: [:show, :update, :destroy]
  
  def index
    @promotions = @restaurant.promotions.order(created_at: :desc)
    render json: @promotions.map { |promotion| promotion_json(promotion) }
  end
  
  def show
    render json: promotion_json(@promotion)
  end
  
  def create
    promotion_params = permit_promotion_params
    
    @promotion = @restaurant.promotions.build(promotion_params)
    
    if @promotion.save
      render json: promotion_json(@promotion), status: :created
    else
      render json: { errors: @promotion.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update
    promotion_params = permit_promotion_params
    
    if @promotion.update(promotion_params)
      render json: promotion_json(@promotion)
    else
      render json: { errors: @promotion.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @promotion.destroy
    head :no_content
  end
  
  private
  
  def set_restaurant
    @restaurant = current_user.restaurants.find(params[:restaurant_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Restaurant not found' }, status: :not_found
  end
  
  def set_promotion
    @promotion = @restaurant.promotions.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Promotion not found' }, status: :not_found
  end
  
  def permit_promotion_params
    params.permit(:name, :description, :discount_type, :discount_value, :min_order_amount, :max_discount_amount, :start_date, :end_date, :is_active)
          .tap do |permitted|
            # Convert is_active string to boolean if present
            if permitted[:is_active].present?
              permitted[:is_active] = permitted[:is_active] == 'true' || permitted[:is_active] == true
            end
            # Convert discount_value to decimal
            if permitted[:discount_value].present?
              permitted[:discount_value] = permitted[:discount_value].to_d
            end
            # Convert min_order_amount to decimal if present
            if permitted[:min_order_amount].present?
              permitted[:min_order_amount] = permitted[:min_order_amount].to_d
            end
            # Convert max_discount_amount to decimal if present
            if permitted[:max_discount_amount].present?
              permitted[:max_discount_amount] = permitted[:max_discount_amount].to_d
            end
          end
  end
  
  def promotion_json(promotion)
    {
      id: promotion.id,
      restaurant_id: promotion.restaurant_id,
      name: promotion.name,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value.to_f,
      min_order_amount: promotion.min_order_amount&.to_f,
      max_discount_amount: promotion.max_discount_amount&.to_f,
      start_date: promotion.start_date&.iso8601,
      end_date: promotion.end_date&.iso8601,
      is_active: promotion.is_active,
      created_at: promotion.created_at.iso8601,
      updated_at: promotion.updated_at.iso8601
    }
  end
end

