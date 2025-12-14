class CreateComboItems < ActiveRecord::Migration[7.1]
  def change
    create_table :combo_items do |t|
      t.references :combo, null: false, foreign_key: true
      t.references :item, null: false, foreign_key: true
      t.integer :quantity, null: false, default: 1

      t.timestamps
    end
    
    add_index :combo_items, [:combo_id, :item_id], unique: true
  end
end
