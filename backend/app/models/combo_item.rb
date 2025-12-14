class ComboItem < ApplicationRecord
  belongs_to :combo
  belongs_to :item
  
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :item_id, uniqueness: { scope: :combo_id, message: "already exists in this combo" }
end


