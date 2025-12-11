class Item < ApplicationRecord
  belongs_to :category
  has_many :order_items, dependent: :destroy
  has_one_attached :image
  
  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :position, presence: true
  
  scope :ordered, -> { order(:position) }
  scope :available, -> { where(is_available: true) }
end



