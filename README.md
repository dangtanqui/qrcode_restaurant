# Menu Management System

A full-stack menu management application built with Ruby on Rails API backend and React + TypeScript frontend.

## 📁 Project Structure

```
.
├── backend/          # Rails API (Ruby on Rails 7+)
└── frontend/         # React + Vite + TypeScript + Tailwind
```

## 🚀 Quick Start

### Prerequisites

- **Ruby 3.2+** and **Rails 7.1+**
- **PostgreSQL** (installed and running)
- **Node.js 18+** and **npm/yarn**
- **ImageMagick** (for ActiveStorage image processing)

### Backend Setup (Rails API)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Set up database:**
   ```bash
   # Create database
   rails db:create
   
   # Run migrations
   rails db:migrate
   ```

4. **Set up ActiveStorage:**
   ```bash
   # Install ActiveStorage
   rails active_storage:install
   rails db:migrate
   
   # Create storage directory
   mkdir -p storage
   ```

5. **Set environment variables:**
   Create a `.env` file in the `backend` directory (optional, or set in `config/secrets.yml`):
   ```bash
   SECRET_KEY_BASE=your_secret_key_here
   ```

   Or generate a secret key:
   ```bash
   rails secret
   ```

6. **Start the Rails server:**
   ```bash
   rails server
   ```
   
   The API will be available at `http://localhost:3000`

### Frontend Setup (React + Vite)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set environment variables (optional):**
   Create a `.env` file in the `frontend` directory:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## 📚 Features

### Backend (Rails API)

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Restaurants**: CRUD operations for restaurants with logo upload
- **Menus**: Menu management with categories and items
- **Items**: Full item management with images, pricing, and availability
- **Public API**: Public endpoints for viewing menus and generating QR codes
- **ActiveStorage**: Image uploads for restaurant logos and item images
- **FriendlyId**: SEO-friendly slugs for restaurants
- **QR Codes**: SVG QR code generation using rqrcode

### Frontend (React + TypeScript)

- **Authentication**: Login and signup pages
- **Dashboard**: Restaurant management dashboard
- **Menu Editor**: Full-featured menu editor with:
  - Category management
  - Item management with image uploads
  - Drag & drop sorting (via position updates)
  - Availability toggles
- **QR Generator**: Generate and download QR codes for restaurant menus
- **Public Menu**: Mobile-first public menu view with:
  - Sticky category navigation
  - Smooth scrolling to categories
  - Out-of-stock item indicators
  - Responsive design

## 🔌 API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - Login and get JWT token

### Restaurants (Protected)
- `GET /api/restaurants` - List all restaurants for current user
- `POST /api/restaurants` - Create new restaurant
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Menu Management (Protected)
- `GET /api/restaurants/:restaurant_id/menu` - Get menu
- `POST /api/restaurants/:restaurant_id/menu` - Create menu
- `POST /api/menus/:menu_id/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `POST /api/categories/:category_id/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Public Endpoints
- `GET /api/public/:slug/menu` - Get public menu by restaurant slug
- `GET /api/public/:slug/qrcode` - Get QR code for restaurant menu

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is automatically stored in localStorage after login/signup and included in all API requests.

## 📦 Database Schema

### Users
- `email` (string, unique)
- `password_digest` (string)

### Restaurants
- `user_id` (foreign key)
- `name` (string)
- `address` (string)
- `slug` (string, unique, auto-generated)

### Menus
- `restaurant_id` (foreign key, one-to-one)

### Categories
- `menu_id` (foreign key)
- `name` (string)
- `position` (integer)

### Items
- `category_id` (foreign key)
- `name` (string)
- `price` (decimal)
- `description` (text)
- `is_available` (boolean, default: true)
- `position` (integer)

## 🖼️ Image Uploads

### ActiveStorage Setup

ActiveStorage is configured to use local disk storage in development. Images are stored in:
- `backend/storage/` (development)
- `backend/tmp/storage/` (test)

### Uploading Images

**Restaurant Logo:**
```javascript
const formData = new FormData()
formData.append('name', 'Restaurant Name')
formData.append('address', 'Address')
formData.append('logo', fileInput.files[0])
```

**Item Image:**
```javascript
const formData = new FormData()
formData.append('name', 'Item Name')
formData.append('price', '10.99')
formData.append('image', fileInput.files[0])
```

## 🎨 Frontend Routes

- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Restaurant dashboard (protected)
- `/restaurant/setup` - Create new restaurant (protected)
- `/restaurant/:id/menu` - Menu editor (protected)
- `/restaurant/:id/qr` - QR code generator (protected)
- `/m/:slug` - Public menu view (public)

## 🛠️ Development

### Running Tests

**Backend:**
```bash
cd backend
rails test
```

**Frontend:**
```bash
cd frontend
npm run test
```

### Building for Production

**Backend:**
```bash
cd backend
RAILS_ENV=production rails assets:precompile
```

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`.

## 📝 Environment Variables

### Backend
- `SECRET_KEY_BASE` - Rails secret key (required for JWT)
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `RAILS_ENV` - Environment (development, test, production)

### Frontend
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

## 🐛 Troubleshooting

### ActiveStorage Issues

If image uploads fail:
1. Ensure ImageMagick is installed: `brew install imagemagick` (macOS) or `apt-get install imagemagick` (Linux)
2. Check storage directory permissions
3. Verify ActiveStorage migrations are run

### Database Issues

If migrations fail:
```bash
rails db:drop db:create db:migrate
```

### CORS Issues

CORS is configured to allow all origins in development. For production, update `config/initializers/cors.rb`.

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

