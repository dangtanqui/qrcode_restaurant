class AddItemFieldsToItems < ActiveRecord::Migration[7.1]
  def change
    add_column :items, :quantity, :integer
    add_column :items, :status, :string
    add_column :items, :is_visible, :boolean
  end
end
