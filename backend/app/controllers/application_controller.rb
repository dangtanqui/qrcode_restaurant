class ApplicationController < ActionController::API
  before_action :authenticate_request, except: [:signup, :login]
  
  private
  
  def authenticate_request
    header = request.headers['Authorization']
    token = header&.split(' ')&.last
    
    if token
      begin
        secret_key = Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE'] || 'fallback_secret_key_change_in_production'
        decoded = JWT.decode(token, secret_key, true, { algorithm: 'HS256' })
        @current_user = User.find(decoded[0]['user_id'])
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: { error: 'Unauthorized' }, status: :unauthorized
      end
    else
      render json: { error: 'Missing token' }, status: :unauthorized
    end
  end
  
  def current_user
    @current_user
  end
end

