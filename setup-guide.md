# Setup Guide - Menu Management System

> **Note**: For a quick reference, see `quick-start.md`. This guide provides detailed step-by-step instructions.

## 📋 Yêu Cầu Hệ Thống

- **Ruby 3.2+** (kiểm tra: `ruby -v`)
- **Rails 7.1+** (kiểm tra: `rails -v`)
- **PostgreSQL** đã cài đặt và đang chạy
- **Node.js 18+** (kiểm tra: `node -v`)
- **npm** hoặc **yarn** (kiểm tra: `npm -v`)

---

## 🚀 CÁC BƯỚC CHẠY THỦ CÔNG

### BƯỚC 1: Kiểm Tra Prerequisites

```bash
# Kiểm tra Ruby
ruby -v
# Kết quả mong đợi: ruby 3.2.x hoặc cao hơn

# Kiểm tra Rails
rails -v
# Kết quả mong đợi: Rails 7.1.x hoặc cao hơn

# Kiểm tra PostgreSQL
psql --version
# Hoặc kiểm tra service đang chạy

# Kiểm tra Node.js
node -v
# Kết quả mong đợi: v18.x.x hoặc cao hơn

# Kiểm tra npm
npm -v
```

---

### BƯỚC 2: Cài Đặt Backend (Rails API)

#### 2.1. Di chuyển vào thư mục backend
```bash
cd backend
```

#### 2.2. Cài đặt gems
```bash
bundle install
```

**Nếu gặp lỗi:**
- Đảm bảo Ruby version đúng: `ruby -v` phải là 3.2+
- Cài đặt bundler: `gem install bundler`
- Nếu thiếu PostgreSQL: cài đặt PostgreSQL và pg gem

#### 2.3. Tạo và migrate database
```bash
# Tạo database
rails db:create

# Chạy migrations
rails db:migrate

# (Tùy chọn) Chạy ActiveStorage install nếu chưa có
rails active_storage:install
rails db:migrate
```

**Nếu gặp lỗi database:**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra file `config/database.yml`
- Đảm bảo user PostgreSQL có quyền tạo database

#### 2.4. Tạo thư mục storage (cho ActiveStorage)
```bash
# Windows PowerShell
New-Item -ItemType Directory -Force -Path storage
New-Item -ItemType Directory -Force -Path tmp/storage

# Linux/Mac
mkdir -p storage
mkdir -p tmp/storage
```

#### 2.5. Set SECRET_KEY_BASE (nếu cần)
```bash
# Tạo secret key
rails secret

# Copy secret key và set vào environment variable hoặc file .env
# Windows PowerShell
$env:SECRET_KEY_BASE="your_secret_key_here"

# Linux/Mac
export SECRET_KEY_BASE="your_secret_key_here"
```

---

### BƯỚC 3: Chạy Backend Server

#### 3.1. Khởi động Rails server
```bash
# Trong thư mục backend
rails server

# Hoặc
rails s

# Hoặc chỉ định port
rails s -p 3000
```

**Kết quả mong đợi:**
```
=> Booting Puma
=> Rails 7.1.x application starting in development
=> Run `bin/rails server --help` for more startup options
Puma starting in single mode...
* Listening on http://127.0.0.1:3000
* Listening on http://[::1]:3000
```

**Giữ terminal này mở!** Backend đang chạy ở `http://localhost:3000`

---

### BƯỚC 4: Cài Đặt Frontend (React + Vite)

#### 4.1. Mở terminal mới (giữ backend đang chạy)

#### 4.2. Di chuyển vào thư mục frontend
```bash
cd frontend
```

#### 4.3. Cài đặt dependencies
```bash
npm install

# Hoặc nếu dùng yarn
yarn install
```

**Nếu gặp lỗi:**
- Xóa `node_modules` và `package-lock.json`, chạy lại `npm install`
- Kiểm tra Node.js version: `node -v` phải >= 18

---

### BƯỚC 5: Chạy Frontend Server

#### 5.1. Khởi động Vite dev server
```bash
# Trong thư mục frontend
npm run dev

# Hoặc
yarn dev
```

**Kết quả mong đợi:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Giữ terminal này mở!** Frontend đang chạy ở `http://localhost:5173`

---

### BƯỚC 6: Mở Trình Duyệt

#### 6.1. Mở trình duyệt và truy cập
```
http://localhost:5173
```

#### 6.2. Bạn sẽ thấy trang Login
- Nếu chưa có tài khoản, click "Sign up" hoặc truy cập `http://localhost:5173/signup`
- Tạo tài khoản mới với email và password

#### 6.3. Sau khi đăng nhập
- Bạn sẽ được chuyển đến Dashboard
- Tạo restaurant đầu tiên
- Bắt đầu quản lý menu!

---

## 🔧 TROUBLESHOOTING

### Lỗi Backend

#### Lỗi: "Could not find gem"
```bash
bundle install
```

#### Lỗi: "Database does not exist"
```bash
rails db:create
rails db:migrate
```

#### Lỗi: "Connection refused" (PostgreSQL)
- Kiểm tra PostgreSQL service đang chạy
- Windows: Services → PostgreSQL
- Linux: `sudo systemctl status postgresql`
- Mac: `brew services list`

#### Lỗi: "Port 3000 already in use"
```bash
# Tìm process đang dùng port 3000
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Kill process (thay PID bằng process ID)
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### Lỗi Frontend

#### Lỗi: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Lỗi: "Port 5173 already in use"
- Vite sẽ tự động chuyển sang port khác (5174, 5175...)
- Hoặc kill process đang dùng port 5173

#### Lỗi: "Network Error" khi gọi API
- Kiểm tra backend đang chạy ở `http://localhost:3000`
- Kiểm tra CORS settings trong `backend/config/initializers/cors.rb`
- Kiểm tra file `.env` trong frontend có `VITE_API_URL=http://localhost:3000/api`

---

## 📝 CHECKLIST TRƯỚC KHI CHẠY

- [ ] Ruby 3.2+ đã cài đặt
- [ ] Rails 7.1+ đã cài đặt
- [ ] PostgreSQL đã cài đặt và đang chạy
- [ ] Node.js 18+ đã cài đặt
- [ ] Đã chạy `bundle install` trong backend
- [ ] Đã chạy `rails db:create db:migrate`
- [ ] Đã tạo thư mục `storage` và `tmp/storage`
- [ ] Đã chạy `npm install` trong frontend
- [ ] Backend server đang chạy ở port 3000
- [ ] Frontend server đang chạy ở port 5173

---

## 🎯 QUY TRÌNH CHẠY HÀNG NGÀY

1. **Khởi động PostgreSQL** (nếu chưa tự động)
2. **Mở Terminal 1**: `cd backend` → `rails s`
3. **Mở Terminal 2**: `cd frontend` → `npm run dev`
4. **Mở trình duyệt**: `http://localhost:5173`

---

## 🛑 DỪNG SERVERS

- **Backend**: Nhấn `Ctrl + C` trong terminal backend
- **Frontend**: Nhấn `Ctrl + C` trong terminal frontend

---

## 📞 HỖ TRỢ

Nếu gặp vấn đề, kiểm tra:
1. Logs trong terminal backend
2. Logs trong terminal frontend
3. Console trong trình duyệt (F12)
4. Network tab trong DevTools để xem API calls



