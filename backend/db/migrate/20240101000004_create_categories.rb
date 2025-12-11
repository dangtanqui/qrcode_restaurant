class CreateCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :categories do |t|
      t.references :menu, null: false, foreign_key: true
      t.string :name, null: false
      t.integer :position, default: 0

      t.timestamps
    end
  end
end



