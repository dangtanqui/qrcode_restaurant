class AddCustomizationFieldsToRestaurants < ActiveRecord::Migration[7.1]
  def change
    add_column :restaurants, :button_style, :string
    add_column :restaurants, :font_family, :string
    add_column :restaurants, :theme_color, :string
    add_column :restaurants, :background_color, :string
    add_column :restaurants, :text_color, :string
    add_column :restaurants, :button_text_color, :string
    add_column :restaurants, :header_note, :text
    add_column :restaurants, :footnote, :text
    add_column :restaurants, :grand_opening_date, :date
    add_column :restaurants, :grand_opening_message, :text
    add_column :restaurants, :is_grand_opening, :boolean
    add_column :restaurants, :facebook_url, :string
    add_column :restaurants, :tiktok_url, :string
    add_column :restaurants, :instagram_url, :string
  end
end
