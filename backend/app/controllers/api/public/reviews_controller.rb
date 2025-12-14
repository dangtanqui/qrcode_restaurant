class Api::Public::ReviewsController < ApplicationController
  skip_before_action :authenticate_request
  
  def index
    restaurant = Restaurant.friendly.find(params[:slug])
    reviews = restaurant.reviews.main_reviews.order(created_at: :desc)
    
    render json: {
      reviews: reviews.map { |review| review_json(review) },
      average_rating: restaurant.reviews.main_reviews.average(:rating)&.to_f || 0,
      total_reviews: restaurant.reviews.main_reviews.count
    }
  end
  
  def create
    restaurant = Restaurant.friendly.find(params[:slug])
    
    review_params = params.permit(:rating, :comment, :customer_name, :parent_id)
    
    # If parent_id is present, it's a reply (no rating required)
    if review_params[:parent_id].present?
      review_params.delete(:rating) # Remove rating for replies
    end
    
    review = restaurant.reviews.build(review_params)
    
    if review.save
      render json: review_json(review), status: :created
    else
      render json: { errors: review.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Restaurant not found' }, status: :not_found
  end
  
  private
  
  def review_json(review)
    {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      customer_name: review.customer_name,
      created_at: review.created_at.iso8601,
      parent_id: review.parent_id,
      replies: review.replies.order(created_at: :asc).map { |reply| reply_json(reply) }
    }
  end
  
  def reply_json(reply)
    {
      id: reply.id,
      comment: reply.comment,
      customer_name: reply.customer_name,
      created_at: reply.created_at.iso8601,
      parent_id: reply.parent_id,
      replies: reply.replies.order(created_at: :asc).map { |nested_reply| reply_json(nested_reply) }
    }
  end
end

