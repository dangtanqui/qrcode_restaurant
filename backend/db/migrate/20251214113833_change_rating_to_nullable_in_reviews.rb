class ChangeRatingToNullableInReviews < ActiveRecord::Migration[7.1]
  def change
    change_column_null :reviews, :rating, true
  end
end
