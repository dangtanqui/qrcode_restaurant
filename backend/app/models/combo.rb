class Combo < ApplicationRecord
  belongs_to :restaurant
  has_many :combo_items, dependent: :destroy
  has_many :items, through: :combo_items
  has_one_attached :image
  
  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  def total_original_price
    combo_items.sum { |ci| ci.item.price * ci.quantity }
  end
  
  def savings
    total_original_price - price
  end
  
  def savings_percentage
    return 0 if total_original_price.zero?
    ((savings / total_original_price) * 100).round(2)
  end
end


