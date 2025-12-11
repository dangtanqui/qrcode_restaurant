class Order < ApplicationRecord
  belongs_to :restaurant
  has_many :order_items, dependent: :destroy
  has_many :items, through: :order_items

  enum status: {
    pending: 'pending',
    confirmed: 'confirmed',
    preparing: 'preparing',
    ready: 'ready',
    paid: 'paid',
    cancelled: 'cancelled'
  }

  enum payment_status: {
    unpaid: 'unpaid',
    paid: 'paid'
  }

  validates :table_number, presence: true
  validates :total, presence: true, numericality: { greater_than_or_equal_to: 0 }

  before_save :calculate_total

  def calculate_total
    self.total = order_items.sum { |oi| oi.price * oi.quantity }
  end
end
