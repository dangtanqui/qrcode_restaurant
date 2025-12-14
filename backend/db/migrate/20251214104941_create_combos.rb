class CreateCombos < ActiveRecord::Migration[7.1]
  def change
    create_table :combos do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.boolean :is_available, default: true

      t.timestamps
    end
  end
end
