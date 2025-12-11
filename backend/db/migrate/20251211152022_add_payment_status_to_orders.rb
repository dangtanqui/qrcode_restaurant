class AddPaymentStatusToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :payment_status, :string, default: 'unpaid'
    add_index :orders, :payment_status
  end
end
