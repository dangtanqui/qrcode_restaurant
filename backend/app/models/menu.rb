class Menu < ApplicationRecord
  belongs_to :restaurant
  has_many :categories, dependent: :destroy
end



