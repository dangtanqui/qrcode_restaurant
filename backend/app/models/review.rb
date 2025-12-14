class Review < ApplicationRecord
  belongs_to :restaurant
  belongs_to :parent, class_name: 'Review', optional: true
  has_many :replies, class_name: 'Review', foreign_key: 'parent_id', dependent: :destroy
  
  validates :rating, presence: true, inclusion: { in: 1..5 }, if: -> { parent_id.nil? }
  validates :customer_name, presence: true, length: { maximum: 100 }
  validates :comment, length: { maximum: 1000 }, allow_blank: true
  
  scope :main_reviews, -> { where(parent_id: nil) }
  scope :replies_only, -> { where.not(parent_id: nil) }
  
  def reply?
    parent_id.present?
  end
end

