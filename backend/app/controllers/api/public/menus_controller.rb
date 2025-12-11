class Api::Public::MenusController < ApplicationController
  skip_before_action :authenticate_request
  
  def show
    restaurant = Restaurant.friendly.find(params[:slug])
    menu = restaurant.menu
    
    if menu
      render json: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          currency: restaurant.currency || 'VND',
          exchange_rate: restaurant.exchange_rate&.to_f || 25000.0,
          logo_url: restaurant.logo.attached? ? url_for(restaurant.logo) : nil
        },
        categories: menu.categories.order(:position).map { |cat| category_json(cat) }
      }
    else
      render json: { error: 'Menu not found' }, status: :not_found
    end
  end
  
  def qrcode
    restaurant = Restaurant.friendly.find(params[:slug])
    
    # Get frontend URL from header, environment variable, or default to localhost:5173
    frontend_url = request.headers['X-Frontend-URL'] || 
                   ENV['FRONTEND_URL'] || 
                   'http://localhost:5173'
    
    menu_url = "#{frontend_url}/m/#{restaurant.slug}"
    
    qr = RQRCode::QRCode.new(menu_url)
    svg = qr.as_svg(
      offset: 0,
      color: '000',
      shape_rendering: 'crispEdges',
      module_size: 6,
      standalone: true
    )
    
    render json: { 
      qrcode: svg,
      url: menu_url
    }
  end
  
  private
  
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



