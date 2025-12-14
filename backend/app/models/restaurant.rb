class Restaurant < ApplicationRecord
  extend FriendlyId
  friendly_id :name, use: :slugged
  
  belongs_to :user
  has_one :menu, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :combos, dependent: :destroy
  has_many :promotions, dependent: :destroy
  has_one_attached :logo
  has_one_attached :qr_code
  
  validates :name, presence: true
  validates :address, presence: true
  validates :currency, inclusion: { in: %w[VND USD] }, allow_nil: true
  
  # Automatically create a menu when a restaurant is created
  after_create :create_default_menu
  
  def should_generate_new_friendly_id?
    name_changed? || super
  end
  
  private
  
  def create_default_menu
    create_menu unless menu
  end
end



