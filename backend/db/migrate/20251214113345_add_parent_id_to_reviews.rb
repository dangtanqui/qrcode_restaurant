class AddParentIdToReviews < ActiveRecord::Migration[7.1]
  def change
    add_column :reviews, :parent_id, :bigint
    add_index :reviews, :parent_id
    add_foreign_key :reviews, :reviews, column: :parent_id
  end
end
