class Api::AnalyticsController < ApplicationController
  before_action :set_restaurant
  
  def show
    start_date = params[:start_date].present? ? Date.parse(params[:start_date]) : 30.days.ago
    end_date = params[:end_date].present? ? Date.parse(params[:end_date]) : Date.today
    
    orders = @restaurant.orders.where(created_at: start_date.beginning_of_day..end_date.end_of_day)
    
    total_orders = orders.count
    total_revenue = orders.sum(:total).to_f
    average_order_value = total_orders > 0 ? (total_revenue / total_orders) : 0
    
    # Orders by status
    orders_by_status = orders.group(:status).count
    
    # Revenue by date
    revenue_by_date = orders.group_by { |o| o.created_at.to_date }.map do |date, date_orders|
      {
        date: date.iso8601,
        revenue: date_orders.sum(&:total).to_f,
        orders: date_orders.count
      }
    end.sort_by { |d| d[:date] }
    
    # Top items
    top_items = OrderItem
      .joins(:order, :item)
      .where(orders: { restaurant_id: @restaurant.id, created_at: start_date.beginning_of_day..end_date.end_of_day })
      .group('items.id', 'items.name')
      .select('items.id as item_id, items.name as item_name, SUM(order_items.quantity) as quantity_sold, SUM(order_items.price * order_items.quantity) as revenue')
      .order('quantity_sold DESC')
      .limit(10)
      .map do |result|
        {
          item_id: result.item_id,
          item_name: result.item_name,
          quantity_sold: result.quantity_sold.to_i,
          revenue: result.revenue.to_f
        }
      end
    
    # Orders by hour
    orders_by_hour = (0..23).map do |hour|
      hour_orders = orders.select { |o| o.created_at.hour == hour }
      {
        hour: hour,
        orders: hour_orders.count
      }
    end
    
    render json: {
      total_orders: total_orders,
      total_revenue: total_revenue,
      average_order_value: average_order_value,
      orders_by_status: orders_by_status,
      revenue_by_date: revenue_by_date,
      top_items: top_items,
      orders_by_hour: orders_by_hour
    }
  end
  
  private
  
  def set_restaurant
    @restaurant = current_user.restaurants.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Restaurant not found' }, status: :not_found
  end
end

