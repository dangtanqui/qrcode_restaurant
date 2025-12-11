class Api::Public::OrdersController < ApplicationController
  skip_before_action :authenticate_request

  def create
    restaurant = Restaurant.friendly.find(params[:slug])
    
    # Permit and validate parameters
    order_params = params.permit(:table_number, items: [:item_id, :quantity])
    
    # Validate items parameter
    unless order_params[:items].is_a?(Array) && order_params[:items].any?
      render json: { error: 'Items array is required and cannot be empty' }, status: :unprocessable_entity
      return
    end
    
    order = restaurant.orders.build(
      table_number: order_params[:table_number] || '1',
      status: 'pending',
      payment_status: 'unpaid',
      total: 0
    )

    if order.save
      # Create order items
      begin
        order_params[:items].each do |item_params|
          item_id = item_params[:item_id] || item_params['item_id']
          quantity = (item_params[:quantity] || item_params['quantity'] || 1).to_i
          
          item = Item.find(item_id)
          
          order.order_items.create!(
            item: item,
            quantity: quantity,
            price: item.price
          )
        end

        # Recalculate total
        order.calculate_total
        order.save

        render json: {
          id: order.id,
          restaurant_id: order.restaurant_id,
          table_number: order.table_number,
          status: order.status,
          payment_status: order.payment_status,
          total: order.total.to_f,
          items: order.order_items.map { |oi| {
            id: oi.id,
            item_id: oi.item_id,
            item_name: oi.item.name,
            quantity: oi.quantity,
            price: oi.price.to_f,
            subtotal: (oi.price * oi.quantity).to_f
          }}
        }, status: :created
      rescue ActiveRecord::RecordNotFound => e
        order.destroy
        render json: { error: "Item not found: #{e.message}" }, status: :not_found
      rescue => e
        order.destroy
        Rails.logger.error "Order creation error: #{e.class} - #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: { error: e.message }, status: :unprocessable_entity
      end
    else
      render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound => e
    render json: { error: 'Restaurant not found' }, status: :not_found
  rescue => e
    Rails.logger.error "Order creation error: #{e.class} - #{e.message}"
    Rails.logger.error e.backtrace.join("\n")
    render json: { error: e.message }, status: :internal_server_error
  end
end
