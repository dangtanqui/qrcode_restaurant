require "test_helper"

class Api::Public::OrdersControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get api_public_orders_create_url
    assert_response :success
  end
end
