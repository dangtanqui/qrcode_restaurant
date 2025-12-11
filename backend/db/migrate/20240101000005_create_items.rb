class CreateItems < ActiveRecord::Migration[7.1]
  def change
    create_table :items do |t|
      t.references :category, null: false, foreign_key: true
      t.string :name, null: false
      t.decimal :price, null: false, precision: 10, scale: 2
      t.text :description
      t.boolean :is_available, default: true
      t.integer :position, default: 0

      t.timestamps
    end
  end
end



