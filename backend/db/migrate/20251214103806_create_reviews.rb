class CreateReviews < ActiveRecord::Migration[7.1]
  def change
    create_table :reviews do |t|
      t.references :restaurant, null: false, foreign_key: true
      t.integer :rating, null: false
      t.text :comment
      t.string :customer_name

      t.timestamps
    end
    
    add_index :reviews, :created_at
  end
end
