class Api::AuthController < ApplicationController
  skip_before_action :authenticate_request, only: [:signup, :login]
  
  def signup
    user = User.new(user_params)
    
    if user.save
      token = generate_token(user.id)
      render json: {
        user: {
          id: user.id,
          email: user.email
        },
        token: token
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  def login
    email = params[:email] || params.dig(:auth, :email)
    password = params[:password] || params.dig(:auth, :password)
    
    user = User.find_by(email: email)
    
    if user && user.authenticate(password)
      token = generate_token(user.id)
      response_data = {
        user: {
          id: user.id,
          email: user.email
        },
        token: token
      }
      render json: response_data, status: :ok
    else
      render json: { error: 'Invalid credentials' }, status: :unauthorized
    end
  end
  
  private
  
  def user_params
    params.permit(:email, :password, :password_confirmation)
  end
  
  def generate_token(user_id)
    secret_key = Rails.application.credentials.secret_key_base || ENV['SECRET_KEY_BASE'] || 'fallback_secret_key_change_in_production'
    JWT.encode({ user_id: user_id }, secret_key, 'HS256')
  end
end

