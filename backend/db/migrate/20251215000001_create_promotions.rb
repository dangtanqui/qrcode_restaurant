class CreatePromotions < ActiveRecord::Migration[7.1]
  def change
    unless table_exists?(:promotions)
      create_table :promotions do |t|
        t.references :restaurant, null: false, foreign_key: true
        t.string :name, null: false
        t.text :description
        t.string :discount_type, null: false # 'percentage' or 'fixed'
        t.decimal :discount_value, precision: 10, scale: 2, null: false
        t.decimal :min_order_amount, precision: 10, scale: 2
        t.decimal :max_discount_amount, precision: 10, scale: 2
        t.date :start_date, null: false
        t.date :end_date, null: false
        t.boolean :is_active, default: true

        t.timestamps
      end

      add_index :promotions, :restaurant_id unless index_exists?(:promotions, :restaurant_id)
      add_index :promotions, :is_active unless index_exists?(:promotions, :is_active)
    end
  end
end


