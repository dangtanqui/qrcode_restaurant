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

### Installation

#### Install Prerequisites (if needed)

**Ruby on Windows:**
1. Download Ruby+Devkit 3.2.x from [rubyinstaller.org](https://rubyinstaller.org/downloads/)
2. Install with "Add Ruby executables to your PATH" checked
3. Open a new PowerShell and run:
   ```powershell
   ruby -v
   gem install rails
   rails -v
   ```

**Node.js on Windows:**
1. Download Node.js LTS from [nodejs.org](https://nodejs.org/)
2. Install with "Add to PATH" checked
3. Open a new PowerShell and run:
   ```powershell
   node -v
   npm -v
   ```

**PostgreSQL on Windows:**
1. Download PostgreSQL 15 or 16 from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with "Command Line Tools" selected
3. Set password for postgres user
4. Open a new PowerShell and run:
   ```powershell
   psql --version
   Get-Service -Name postgresql*
   ```

### Backend Setup

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
   rails db:create
   rails db:migrate
   ```

4. **Set up ActiveStorage:**
   ```bash
   rails active_storage:install
   rails db:migrate
   mkdir -p storage
   ```

5. **Start the Rails server:**
   ```bash
   rails server
   ```
   
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   Create a `.env` file in the `frontend` directory:
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

### Daily Workflow

1. Start PostgreSQL service (if not running automatically)
2. Open Terminal 1: `cd backend` → `rails s`
3. Open Terminal 2: `cd frontend` → `npm run dev`
4. Open browser: `http://localhost:5173`

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
- **Menu Editor**: Full-featured menu editor with category and item management
- **QR Generator**: Generate and download QR codes for restaurant menus
- **Public Menu**: Mobile-first public menu view with sticky navigation

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

## 🎨 Frontend Routes

- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Restaurant dashboard (protected)
- `/restaurant/setup` - Create new restaurant (protected)
- `/restaurant/:id/menu` - Menu editor (protected)
- `/restaurant/:id/qr` - QR code generator (protected)
- `/m/:slug` - Public menu view (public)

## 📝 Environment Variables

### Backend
- `SECRET_KEY_BASE` - Rails secret key (required for JWT)
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `RAILS_ENV` - Environment (development, test, production)

### Frontend
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

## 🐛 Troubleshooting

### Backend Issues

**"Could not find gem" error:**
```bash
bundle install
```

**"Database does not exist" error:**
```bash
rails db:create
rails db:migrate
```

**"Connection refused" (PostgreSQL):**
- Check PostgreSQL service is running
- Windows: Services → PostgreSQL
- Linux: `sudo systemctl status postgresql`
- Mac: `brew services list`

**"Port 3000 already in use":**
```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill process (replace PID with process ID)
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### Frontend Issues

**"Cannot find module" error:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**"Port 5173 already in use":**
- Vite will automatically use another port (5174, 5175...)
- Or kill the process using port 5173

**"Network Error" when calling API:**
- Check backend is running at `http://localhost:3000`
- Check CORS settings in `backend/config/initializers/cors.rb`
- Check `.env` file in frontend has `VITE_API_URL=http://localhost:3000/api`

### ActiveStorage Issues
- Ensure ImageMagick is installed
- Check storage directory permissions
- Verify ActiveStorage migrations are run

### Browser Extension Errors

If you see errors like `URL.parse is not a function` in the console, these are **NOT from your code**. They come from browser extensions (like Wappalyzer, React DevTools, etc.) trying to analyze your page.

**Solutions:**
1. Disable extensions temporarily for testing
2. Use Incognito/Private mode (extensions are usually disabled)
3. Ignore these errors - they don't affect the application

### Database Reset

If you need to reset the database:
```bash
rails db:drop db:create db:migrate
```

## 🔧 Git & GitHub Setup

### Initial Git Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Push to GitHub

1. **Check status and commit:**
   ```bash
   git status
   git add .
   git commit -m "Initial commit"
   ```

2. **Create repository on GitHub:**
   - Go to [GitHub](https://github.com)
   - Click **+** → **New repository**
   - Enter repository name
   - **DO NOT** check "Initialize this repository with a README"
   - Click **Create repository**

3. **Connect and push:**
   ```bash
   # Add remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   
   # Rename branch to main (if needed)
   git branch -M main
   
   # Push code
   git push -u origin main
   ```

### Authentication

If authentication is required, use a **Personal Access Token**:
1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` permission
3. Use token as password when pushing

### Troubleshooting Git

**Remote origin already exists:**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**Authentication error:**
- Use Personal Access Token instead of password
- Or install GitHub CLI: `gh auth login`

### Important Notes

The `.gitignore` file is configured to ignore:
- `node_modules/`
- `backend/storage/*`, `backend/log/*`, `backend/tmp/*`
- `.env` files
- Temporary and cache files

**DO NOT** commit sensitive files:
- `backend/config/master.key`
- `.env` files
- Database files

## 📄 License

This project is open source and available under the MIT License.
