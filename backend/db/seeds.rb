# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Default password for all seed users
DEFAULT_PASSWORD = 'test123456'

puts "Creating seed users..."

# Admin user
admin = User.find_or_initialize_by(email: 'admin@example.com')
if admin.new_record?
  admin.password = DEFAULT_PASSWORD
  admin.password_confirmation = DEFAULT_PASSWORD
  admin.role = 'admin'
  admin.save!
  puts "✓ Created admin user: admin@example.com"
else
  puts "✓ Admin user already exists: admin@example.com"
end

# Regular user 1
user1 = User.find_or_initialize_by(email: 'user1@example.com')
if user1.new_record?
  user1.password = DEFAULT_PASSWORD
  user1.password_confirmation = DEFAULT_PASSWORD
  user1.role = 'user'
  user1.save!
  puts "✓ Created user: user1@example.com"
else
  puts "✓ User already exists: user1@example.com"
end

# Regular user 2
user2 = User.find_or_initialize_by(email: 'user2@example.com')
if user2.new_record?
  user2.password = DEFAULT_PASSWORD
  user2.password_confirmation = DEFAULT_PASSWORD
  user2.role = 'user'
  user2.save!
  puts "✓ Created user: user2@example.com"
else
  puts "✓ User already exists: user2@example.com"
end

# Demo user with restaurant
demo_user = User.find_or_initialize_by(email: 'demo@example.com')
if demo_user.new_record?
  demo_user.password = DEFAULT_PASSWORD
  demo_user.password_confirmation = DEFAULT_PASSWORD
  demo_user.role = 'user'
  demo_user.save!
  
  # Create a sample restaurant for demo user
  restaurant = demo_user.restaurants.find_or_initialize_by(name: 'Demo Restaurant')
  if restaurant.new_record?
    restaurant.address = '123 Demo Street, Demo City'
    restaurant.save!
    
    # Create menu
    menu = restaurant.create_menu
    
    # Create categories
    category1 = menu.categories.create!(name: 'Appetizers', position: 1)
    category2 = menu.categories.create!(name: 'Main Courses', position: 2)
    category3 = menu.categories.create!(name: 'Desserts', position: 3)
    
    # Create items
    category1.items.create!(
      name: 'Spring Rolls',
      price: 5.99,
      description: 'Fresh vegetable spring rolls with dipping sauce',
      is_available: true,
      position: 1
    )
    
    category1.items.create!(
      name: 'Chicken Wings',
      price: 8.99,
      description: 'Spicy buffalo wings with blue cheese',
      is_available: true,
      position: 2
    )
    
    category2.items.create!(
      name: 'Grilled Salmon',
      price: 18.99,
      description: 'Fresh salmon with lemon butter sauce',
      is_available: true,
      position: 1
    )
    
    category2.items.create!(
      name: 'Beef Steak',
      price: 24.99,
      description: 'Premium ribeye steak with vegetables',
      is_available: true,
      position: 2
    )
    
    category3.items.create!(
      name: 'Chocolate Cake',
      price: 6.99,
      description: 'Rich chocolate cake with vanilla ice cream',
      is_available: true,
      position: 1
    )
    
    puts "✓ Created demo user with restaurant: demo@example.com"
  else
    puts "✓ Demo user already exists: demo@example.com"
  end
else
  puts "✓ Demo user already exists: demo@example.com"
end

puts "\n=== Seed Users Summary ==="
puts "All passwords: #{DEFAULT_PASSWORD}"
puts "\nAdmin:"
puts "  Email: admin@example.com"
puts "  Password: #{DEFAULT_PASSWORD}"
puts "\nUsers:"
puts "  Email: user1@example.com"
puts "  Email: user2@example.com"
puts "  Email: demo@example.com (with sample restaurant)"
puts "\nAll passwords: #{DEFAULT_PASSWORD}"
