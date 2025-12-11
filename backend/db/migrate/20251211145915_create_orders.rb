class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.references :restaurant, null: false, foreign_key: true, index: true
      t.string :table_number
      t.string :status, default: 'pending'
      t.decimal :total, precision: 10, scale: 2, default: 0.0

      t.timestamps
    end
    
    add_index :orders, :status
  end
end
