class CreateRestaurants < ActiveRecord::Migration[7.1]
  def change
    create_table :restaurants do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.string :address, null: false
      t.string :slug

      t.timestamps
    end
    
    add_index :restaurants, :slug, unique: true
  end
end



