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
- **MySQL 5.7.41** (installed and running, or use Podman)
- **Node.js 18+** and **npm/yarn** (⚠️ **Required**: Node.js 18+ is mandatory for Vite 4.5+)
- **ImageMagick** (for ActiveStorage image processing)
- **Podman** (optional, for running MySQL in a container)

### Installation

#### Install Prerequisites (if needed)

**Ruby:**

*Windows:*
1. Download Ruby+Devkit 3.2.x from [rubyinstaller.org](https://rubyinstaller.org/downloads/)
2. Install with "Add Ruby executables to your PATH" checked
3. Open a new PowerShell and run:
   ```powershell
   ruby -v
   gem install rails
   rails -v
   ```

*Ubuntu:*
```bash
sudo apt update
sudo apt install ruby-full build-essential -y
ruby -v
gem install rails
rails -v
```

**Node.js:**

*Windows:*
1. Download Node.js LTS from [nodejs.org](https://nodejs.org/)
2. Install with "Add to PATH" checked
3. Open a new PowerShell and run:
   ```powershell
   node -v
   npm -v
   ```

*Ubuntu:*
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

**MySQL:**

> **Recommended:** Use MySQL 5.7.41 for best compatibility. You can install it directly or use Podman.

*Option 1: Using Podman (Recommended)*

Run MySQL 5.7.41 in a Podman container:
```bash
podman run -d --name=menu_api_development -p 3308:3306 -e MYSQL_ALLOW_EMPTY_PASSWORD=yes docker.io/library/mysql:5.7.41 --sql-mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION
```

This will:
- Create a MySQL 5.7.41 container named `menu_api_development`
- Map container port 3306 to host port 3308
- Allow empty password (no password required for root user)

To stop the container:
```bash
podman stop menu_api_development
```

To start it again:
```bash
podman start menu_api_development
```

*Option 2: Direct Installation*

*Windows:*
1. Download MySQL 5.7.41 from [MySQL Archives](https://downloads.mysql.com/archives/installer/)
2. Install MySQL Server 5.7.41
3. Set root password to `123456` during installation
4. Configure to use port 3306 (or 3308 if you prefer)
5. Open a new PowerShell and run:
   ```powershell
   mysql --version
   Get-Service -Name MySQL*
   ```

*Ubuntu:*
```bash
# Download MySQL 5.7 repository
wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.22-1_all.deb
# Select MySQL 5.7 during configuration (recommended: 5.7.41)

# Install MySQL
sudo apt update
sudo apt install mysql-server -y

# Set root password
sudo mysql_secure_installation
# Enter password: 123456

# Check MySQL version
mysql --version

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

**ImageMagick:**

*Windows:*
1. Download ImageMagick from [imagemagick.org](https://imagemagick.org/script/download.php#windows)
2. Install with "Add to PATH" option checked
3. Verify installation:
   ```powershell
   magick -version
   ```

*Ubuntu:*
```bash
sudo apt update
sudo apt install imagemagick -y
magick -version
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

3. **Set up environment variables (optional):**
   Create a `.env.local` file in the `backend` directory if you need to use a different MySQL port or password:
   ```bash
   DATABASE_PORT=3308
   # DATABASE_PASSWORD=123456  # Only set if your MySQL has a password (Podman container uses empty password by default)
   ```
   Note: 
   - Default MySQL port is 3306. Use `.env.local` to override with 3308 if needed.
   - If using Podman with `MYSQL_ALLOW_EMPTY_PASSWORD=yes`, leave `DATABASE_PASSWORD` unset (empty password).
   - If your MySQL has a password, set `DATABASE_PASSWORD` in `.env.local`.
   
   **Important:** The `dotenv-rails` gem is already included in the Gemfile to automatically load `.env.local` files. After creating or modifying `.env.local`, restart your Rails server for changes to take effect.

4. **Set up database:**
   ```bash
   rails db:create
   rails db:migrate
   rails db:seed
   ```
   
   The seed file creates test users:
   - `admin@example.com` (password: `test123456`)
   - `user1@example.com` (password: `test123456`)
   - `user2@example.com` (password: `test123456`)
   - `demo@example.com` (password: `test123456`, includes sample restaurant with menu)

5. **Set up ActiveStorage:**
   ```bash
   rails active_storage:install
   rails db:migrate
   ```
   
   **Create storage directory:**
   - *Windows (PowerShell):*
     ```powershell
     New-Item -ItemType Directory -Force -Path storage
     ```
   - *Linux/Mac:*
     ```bash
     mkdir -p storage
     ```

6. **Start the Rails server:**
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
   Create a `.env` file in the `frontend` directory. You can configure the backend API URL in multiple ways:
   
   **Option 1: Full URL (recommended)**
   ```bash
   VITE_API_URL=http://localhost:3000/api
   ```
   
   **Option 2: Separate host and port (flexible)**
   ```bash
   VITE_API_HOST=localhost
   VITE_API_PORT=3001
   # Optional: VITE_API_PROTOCOL=http (default)
   ```
   
   This allows you to easily change the backend port. For example, if you run `rails s -p 3001`, just set `VITE_API_PORT=3001` in your `.env` file.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

### Daily Workflow

1. **Start MySQL:**
   - *If using Podman:*
     ```bash
     podman start menu_api_development
     ```
   - *If using direct installation:*
     - **Windows:** Services → MySQL (or it may start automatically)
     - **Ubuntu:** `sudo systemctl start mysql`

2. **Start Backend:**
   - Open Terminal 1: `cd backend` → `rails s`

3. **Start Frontend:**
   - Open Terminal 2: `cd frontend` → `npm run dev`

4. **Open browser:** `http://localhost:5173`

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
- `DATABASE_URL` - MySQL connection string (optional)
- `DATABASE_PORT` - MySQL port (default: 3306, can be set to 3308 in .env.local)
- `DATABASE_PASSWORD` - MySQL password (optional, empty by default for Podman container with MYSQL_ALLOW_EMPTY_PASSWORD)
- `RAILS_ENV` - Environment (development, test, production)

### Frontend
- `VITE_API_URL` - Full backend API URL (e.g., `http://localhost:3000/api`)
- `VITE_API_HOST` - Backend host (default: `localhost`)
- `VITE_API_PORT` - Backend port (default: `3000`)
- `VITE_API_PROTOCOL` - Protocol (default: `http`)

**Note:** If `VITE_API_URL` is set, it takes priority. Otherwise, the URL is built from `VITE_API_HOST`, `VITE_API_PORT`, and `VITE_API_PROTOCOL`. This allows you to easily change the backend port by just updating `VITE_API_PORT` in your `.env` file.

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

**"Connection refused" (MySQL):**

*If using Podman:*
```bash
# Check if container is running
podman ps -a | grep menu_api_development

# Start container if stopped
podman start menu_api_development

# Check container logs
podman logs menu_api_development
```

*If using direct installation:*
- **Windows:** Check Services → MySQL, or run:
  ```powershell
  Get-Service -Name MySQL*
  Start-Service MySQL*
  ```
- **Ubuntu:** Check and start MySQL service:
  ```bash
  sudo systemctl status mysql
  sudo systemctl start mysql
  sudo systemctl enable mysql
  ```

**"Port 3000 already in use":**

*Windows:*
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace <PID> with process ID from above)
taskkill /PID <PID> /F
```

*Ubuntu:*
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process (replace <PID> with process ID from above)
sudo kill -9 <PID>
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

**"crypto$2.getRandomValues is not a function" or "Unsupported engine" errors:**
- This error occurs when using Node.js 16 with Vite 5.0+
- **Solution 1 (Recommended):** Upgrade Node.js to 18+:
  - **Ubuntu:** Use `nvm` to install Node.js 18:
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    nvm install 18
    nvm use 18
    ```
  - **Windows:** Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)
- **Solution 2:** The project has been configured to use Vite 4.5.0 which is compatible with Node.js 16, but upgrading to Node.js 18+ is still recommended for best compatibility.

**"Network Error" when calling API:**
- Check backend is running (default: `http://localhost:3000`)
- Verify the port matches your backend port (if using `rails s -p 3001`, set `VITE_API_PORT=3001` in frontend `.env`)
- Check CORS settings in `backend/config/initializers/cors.rb`
- Verify frontend `.env` file:
  - Option 1: `VITE_API_URL=http://localhost:3000/api` (or your custom port)
  - Option 2: `VITE_API_HOST=localhost` and `VITE_API_PORT=3000` (or your custom port)

### ActiveStorage Issues

*ImageMagick not found:*
- **Windows:** Reinstall ImageMagick and ensure "Add to PATH" is checked
- **Ubuntu:** `sudo apt install imagemagick -y`

*Storage directory permissions:*
- **Windows:** Ensure you have write permissions in `backend/storage/`
- **Ubuntu:** 
  ```bash
  sudo chmod -R 755 backend/storage
  sudo chown -R $USER:$USER backend/storage
  ```

*Verify ActiveStorage migrations:*
```bash
cd backend
rails active_storage:install
rails db:migrate
```

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
