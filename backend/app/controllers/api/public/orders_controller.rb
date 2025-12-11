class Api::Public::OrdersController < ApplicationController
  skip_before_action :authenticate_request

  def create
    restaurant = Restaurant.friendly.find(params[:slug])
    
    order = restaurant.orders.build(
      table_number: params[:table_number] || '1',
      status: 'pending',
      payment_status: 'unpaid',
      total: 0
    )

    if order.save
      # Create order items
      params[:items].each do |item_params|
        item = Item.find(item_params[:item_id])
        order.order_items.create!(
          item: item,
          quantity: item_params[:quantity],
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
    else
      render json: { errors: order.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Restaurant not found' }, status: :not_found
  end
end
