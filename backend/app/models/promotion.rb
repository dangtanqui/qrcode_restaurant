class Promotion < ApplicationRecord
  belongs_to :restaurant

  validates :name, presence: true
  validates :discount_type, presence: true, inclusion: { in: %w[percentage fixed] }
  validates :discount_value, presence: true, numericality: { greater_than: 0 }
  validates :start_date, presence: true
  validates :end_date, presence: true
  validate :end_date_after_start_date

  scope :active, -> { where(is_active: true) }
  scope :current, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }

  private

  def end_date_after_start_date
    return unless start_date && end_date

    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end
end





