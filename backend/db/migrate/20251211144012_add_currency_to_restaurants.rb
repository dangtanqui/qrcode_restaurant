class AddCurrencyToRestaurants < ActiveRecord::Migration[7.1]
  def change
    add_column :restaurants, :currency, :string, default: 'VND'
    add_column :restaurants, :exchange_rate, :decimal, precision: 10, scale: 2, default: 25000.0
  end
end
