class AddPhoneToRestaurants < ActiveRecord::Migration[7.1]
  def change
    add_column :restaurants, :phone, :string
  end
end
