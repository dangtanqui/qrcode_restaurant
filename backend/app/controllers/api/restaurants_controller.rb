class Api::RestaurantsController < ApplicationController
  before_action :set_restaurant, only: [:show, :update, :destroy, :update_files]
  
  def index
    @restaurants = current_user.restaurants
    render json: @restaurants.map { |r| restaurant_json(r) }
  end
  
  def create
    create_params = restaurant_params.except(:logo, :qr_code)
    
    # Convert string 'true'/'false' to boolean for is_grand_opening
    if create_params[:is_grand_opening].present?
      create_params[:is_grand_opening] = create_params[:is_grand_opening] == 'true' || create_params[:is_grand_opening] == true
    end
    
    # Convert empty strings to nil for optional fields (except required fields)
    create_params.each do |key, value|
      if key != :name && key != :address && value.is_a?(String) && value.empty?
        create_params[key] = nil
      end
    end
    
    @restaurant = current_user.restaurants.build(create_params)
    
    if @restaurant.save
      if params[:logo].present?
        @restaurant.logo.attach(params[:logo])
      end
      if params[:qr_code].present?
        @restaurant.qr_code.attach(params[:qr_code])
      end
      render json: restaurant_json(@restaurant), status: :created
    else
      render json: { errors: @restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def show
    render json: restaurant_json(@restaurant)
  end
  
  def update
    Rails.logger.info "=== UPDATE REQUEST (JSON) ==="
    Rails.logger.info "Params received: #{params.except(:controller, :action, :id).inspect}"
    
    # Get permitted params (text fields only, no files)
    update_params = restaurant_params.except(:logo, :qr_code)
    Rails.logger.info "Permitted params: #{update_params.inspect}"
    Rails.logger.info "Phone value: #{update_params[:phone].inspect}"
    
    # Handle is_grand_opening (can be boolean or string 'true'/'false')
    if update_params[:is_grand_opening].present?
      if update_params[:is_grand_opening].is_a?(String)
        update_params[:is_grand_opening] = (update_params[:is_grand_opening] == 'true')
      end
      # If it's already a boolean, leave it as is
    end
    
    # Convert empty strings to nil for optional fields (except required fields and phone)
    # Keep phone even if empty, or convert to nil if you want to allow clearing it
    update_params.each do |key, value|
      if key != :name && key != :address && key != :phone && value.is_a?(String) && value.empty?
        update_params[key] = nil
      end
      # For phone, convert empty string to nil (to clear it) or keep it if you want to preserve empty strings
      if key == :phone && value.is_a?(String) && value.empty?
        update_params[key] = nil
      end
    end
    
    Rails.logger.info "Final update_params: #{update_params.inspect}"
    Rails.logger.info "Restaurant before update - phone: #{@restaurant.phone.inspect}"
    
    if @restaurant.update(update_params)
      @restaurant.reload
      Rails.logger.info "Restaurant after update - phone: #{@restaurant.phone.inspect}"
      render json: restaurant_json(@restaurant)
    else
      Rails.logger.error "Failed to update: #{@restaurant.errors.full_messages.inspect}"
      render json: { errors: @restaurant.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def update_files
    # Handle file uploads only
    # Note: params[:logo] and params[:qr_code] are handled directly by Rails when multipart/form-data is parsed
    if params[:logo].present?
      @restaurant.logo.purge if @restaurant.logo.attached?
      @restaurant.logo.attach(params[:logo])
    end
    if params[:qr_code].present?
      @restaurant.qr_code.purge if @restaurant.qr_code.attached?
      @restaurant.qr_code.attach(params[:qr_code])
    end
    render json: restaurant_json(@restaurant)
  end
  
  def destroy
    @restaurant.destroy
    head :no_content
  end
  
  private
  
  def set_restaurant
    @restaurant = current_user.restaurants.find(params[:id])
  end
  
  def restaurant_params
    params.permit(
      :name, :address, :phone, :currency, :exchange_rate,
      :button_style, :font_family, :theme_color, :background_color,
      :text_color, :button_text_color, :header_note, :footnote,
      :grand_opening_date, :grand_opening_message, :is_grand_opening,
      :facebook_url, :tiktok_url, :instagram_url
    )
  end
  
  def restaurant_json(restaurant)
    {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      slug: restaurant.slug,
      currency: restaurant.currency || 'VND',
      exchange_rate: restaurant.exchange_rate&.to_f || 25000.0,
      logo_url: restaurant.logo.attached? ? url_for(restaurant.logo) : nil,
      qr_code_url: restaurant.qr_code.attached? ? url_for(restaurant.qr_code) : nil,
      button_style: restaurant.button_style || 'rounded-full',
      font_family: restaurant.font_family,
      theme_color: restaurant.theme_color,
      background_color: restaurant.background_color,
      text_color: restaurant.text_color,
      button_text_color: restaurant.button_text_color,
      header_note: restaurant.header_note,
      footnote: restaurant.footnote,
      grand_opening_date: restaurant.grand_opening_date&.to_s,
      grand_opening_message: restaurant.grand_opening_message,
      is_grand_opening: restaurant.is_grand_opening,
      facebook_url: restaurant.facebook_url,
      tiktok_url: restaurant.tiktok_url,
      instagram_url: restaurant.instagram_url,
      created_at: restaurant.created_at,
      updated_at: restaurant.updated_at
    }
  end
end

