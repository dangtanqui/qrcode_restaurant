class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :item

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }

  before_validation :set_price_from_item

  private

  def set_price_from_item
    self.price = item.price if item && price.nil?
  end
end
