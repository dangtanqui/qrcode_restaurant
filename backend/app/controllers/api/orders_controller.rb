class Api::OrdersController < ApplicationController
  before_action :set_restaurant
  before_action :set_order, only: [:show, :update]

  def index
    @orders = @restaurant.orders.order(created_at: :desc)
    render json: @orders.map { |order| order_json(order) }
  end

  def show
    render json: order_json(@order)
  end

  def update
    if @order.update(order_params)
      render json: order_json(@order)
    else
      render json: { errors: @order.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_restaurant
    @restaurant = current_user.restaurants.find(params[:restaurant_id])
  end

  def set_order
    @order = @restaurant.orders.find(params[:id])
  end

  def order_params
    params.permit(:status, :payment_status, :table_number)
  end

  def order_json(order)
    {
      id: order.id,
      restaurant_id: order.restaurant_id,
      table_number: order.table_number,
      status: order.status,
      payment_status: order.payment_status,
      total: order.total.to_f,
      created_at: order.created_at,
      updated_at: order.updated_at,
      items: order.order_items.map { |oi| order_item_json(oi) }
    }
  end

  def order_item_json(order_item)
    {
      id: order_item.id,
      item_id: order_item.item_id,
      item_name: order_item.item.name,
      quantity: order_item.quantity,
      price: order_item.price.to_f,
      subtotal: (order_item.price * order_item.quantity).to_f
    }
  end
end
