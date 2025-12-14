# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_12_14_123921) do
  create_table "active_storage_attachments", charset: "utf8mb4", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", charset: "utf8mb4", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "menu_id", null: false
    t.string "name", null: false
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["menu_id"], name: "index_categories_on_menu_id"
  end

  create_table "combo_items", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "combo_id", null: false
    t.bigint "item_id", null: false
    t.integer "quantity", default: 1, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["combo_id", "item_id"], name: "index_combo_items_on_combo_id_and_item_id", unique: true
    t.index ["combo_id"], name: "index_combo_items_on_combo_id"
    t.index ["item_id"], name: "index_combo_items_on_item_id"
  end

  create_table "combos", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "restaurant_id", null: false
    t.string "name", null: false
    t.text "description"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.boolean "is_available", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id"], name: "index_combos_on_restaurant_id"
  end

  create_table "items", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "category_id", null: false
    t.string "name", null: false
    t.decimal "price", precision: 10, scale: 2, null: false
    t.text "description"
    t.boolean "is_available", default: true
    t.integer "position", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "quantity"
    t.string "status"
    t.boolean "is_visible"
    t.index ["category_id"], name: "index_items_on_category_id"
  end

  create_table "menus", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "restaurant_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["restaurant_id"], name: "index_menus_on_restaurant_id"
  end

  create_table "order_items", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.bigint "item_id", null: false
    t.integer "quantity", default: 1
    t.decimal "price", precision: 10, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["item_id"], name: "index_order_items_on_item_id"
    t.index ["order_id"], name: "index_order_items_on_order_id"
  end

  create_table "orders", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "restaurant_id", null: false
    t.string "table_number"
    t.string "status", default: "pending"
    t.decimal "total", precision: 10, scale: 2, default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "payment_status", default: "unpaid"
    t.index ["payment_status"], name: "index_orders_on_payment_status"
    t.index ["restaurant_id"], name: "index_orders_on_restaurant_id"
    t.index ["status"], name: "index_orders_on_status"
  end

  create_table "restaurants", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.string "address", null: false
    t.string "slug"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "currency", default: "VND"
    t.decimal "exchange_rate", precision: 10, scale: 2, default: "25000.0"
    t.string "phone"
    t.string "button_style"
    t.string "font_family"
    t.string "theme_color"
    t.string "background_color"
    t.string "text_color"
    t.string "button_text_color"
    t.text "header_note"
    t.text "footnote"
    t.date "grand_opening_date"
    t.text "grand_opening_message"
    t.boolean "is_grand_opening"
    t.string "facebook_url"
    t.string "tiktok_url"
    t.string "instagram_url"
    t.index ["slug"], name: "index_restaurants_on_slug", unique: true
    t.index ["user_id"], name: "index_restaurants_on_user_id"
  end

  create_table "reviews", charset: "utf8mb4", force: :cascade do |t|
    t.bigint "restaurant_id", null: false
    t.integer "rating"
    t.text "comment"
    t.string "customer_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "parent_id"
    t.index ["created_at"], name: "index_reviews_on_created_at"
    t.index ["parent_id"], name: "index_reviews_on_parent_id"
    t.index ["restaurant_id"], name: "index_reviews_on_restaurant_id"
  end

  create_table "users", charset: "utf8mb4", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "user"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "categories", "menus"
  add_foreign_key "combo_items", "combos"
  add_foreign_key "combo_items", "items"
  add_foreign_key "combos", "restaurants"
  add_foreign_key "items", "categories"
  add_foreign_key "menus", "restaurants"
  add_foreign_key "order_items", "items"
  add_foreign_key "order_items", "orders"
  add_foreign_key "orders", "restaurants"
  add_foreign_key "restaurants", "users"
  add_foreign_key "reviews", "restaurants"
  add_foreign_key "reviews", "reviews", column: "parent_id"
end
