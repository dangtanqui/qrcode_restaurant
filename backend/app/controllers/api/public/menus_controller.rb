class Api::Public::MenusController < ApplicationController
  skip_before_action :authenticate_request
  
  def show
    restaurant = Restaurant.friendly.find(params[:slug])
    menu = restaurant.menu
    
    if menu
      reviews = restaurant.reviews
      average_rating = reviews.average(:rating)&.to_f || 0
      total_reviews = reviews.count
      
      render json: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          currency: restaurant.currency || 'VND',
          exchange_rate: restaurant.exchange_rate&.to_f || 25000.0,
          logo_url: restaurant.logo.attached? ? url_for(restaurant.logo) : nil,
          button_style: restaurant.button_style || 'rounded-full',
          theme_color: restaurant.theme_color,
          background_color: restaurant.background_color,
          text_color: restaurant.text_color,
          button_text_color: restaurant.button_text_color,
          header_note: restaurant.header_note,
          footnote: restaurant.footnote,
          grand_opening_date: restaurant.grand_opening_date&.iso8601,
          grand_opening_message: restaurant.grand_opening_message,
          is_grand_opening: restaurant.is_grand_opening || false,
          facebook_url: restaurant.facebook_url,
          tiktok_url: restaurant.tiktok_url,
          instagram_url: restaurant.instagram_url,
          average_rating: average_rating,
          total_reviews: total_reviews
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
      image_url: item.image.attached? ? url_for(item.image) : nil,
      quantity: item.quantity || 0,
      status: item.status || 'in_stock',
      is_visible: item.is_visible.nil? ? true : item.is_visible
    }
  end
end



