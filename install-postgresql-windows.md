# Hướng Dẫn Cài Đặt PostgreSQL trên Windows

## 🎯 Phương Pháp 1: Tải từ Website Chính Thức (Khuyên dùng)

### Bước 1: Tải PostgreSQL
1. Truy cập: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Hoặc truy cập trực tiếp: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
4. Tải phiên bản **PostgreSQL 15** hoặc **PostgreSQL 16** (khuyến nghị)
   - File sẽ có tên: `postgresql-15.x-x64.exe` (hoặc phiên bản mới nhất)

### Bước 2: Cài đặt
1. Chạy file `.exe` vừa tải
2. Click "Next" qua các bước
3. **Chọn thư mục cài đặt** (mặc định: `C:\Program Files\PostgreSQL\15`)
4. **Chọn components** (giữ nguyên mặc định):
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI tool - tùy chọn nhưng khuyên dùng)
   - ✅ Stack Builder (tùy chọn)
   - ✅ Command Line Tools
5. **Chọn thư mục data** (mặc định: `C:\Program Files\PostgreSQL\15\data`)
6. **Đặt mật khẩu cho superuser (postgres)**:
   - **Quan trọng**: Nhớ mật khẩu này! Bạn sẽ cần dùng sau
   - Khuyến nghị: Đặt mật khẩu mạnh và lưu lại
7. **Chọn port** (mặc định: 5432 - giữ nguyên)
8. **Chọn locale** (mặc định: [Default locale])
9. Click "Next" và "Install"
10. Đợi quá trình cài đặt hoàn tất

### Bước 3: Kiểm tra cài đặt
**Mở PowerShell MỚI** (quan trọng: phải mở mới để load PATH):
```powershell
psql --version
# Kết quả mong đợi: psql (PostgreSQL) 15.x hoặc 16.x
```

### Bước 4: Kiểm tra PostgreSQL Service
```powershell
# Kiểm tra service đang chạy
Get-Service -Name postgresql*

# Hoặc kiểm tra trong Services
# Windows + R → services.msc → Tìm "postgresql"
```

---

## 🎯 Phương Pháp 2: Sử dụng Chocolatey (Nếu đã có Chocolatey)

### Bước 1: Cài đặt PostgreSQL
```powershell
# Mở PowerShell với quyền Administrator
choco install postgresql -y
```

### Bước 2: Kiểm tra
```powershell
psql --version
```

---

## 🎯 Phương Pháp 3: Sử dụng winget (Windows 11)

```powershell
winget install PostgreSQL.PostgreSQL
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi: "psql is not recognized"
**Giải pháp:**
1. Đảm bảo đã chọn "Command Line Tools" khi cài đặt
2. **Mở lại PowerShell/Terminal MỚI** (quan trọng!)
3. Kiểm tra PATH:
   ```powershell
   $env:PATH -split ';' | Select-String postgres
   ```
4. Nếu không thấy, thêm thủ công:
   ```powershell
   # Thay đường dẫn bằng đường dẫn thực tế của bạn
   $env:PATH += ";C:\Program Files\PostgreSQL\15\bin"
   ```
5. Hoặc thêm vào System PATH vĩnh viễn:
   - Windows + R → `sysdm.cpl` → Advanced → Environment Variables
   - Thêm `C:\Program Files\PostgreSQL\15\bin` vào PATH

### Lỗi: "Connection refused" hoặc "Service not running"
**Giải pháp:**
1. Kiểm tra PostgreSQL service:
   ```powershell
   Get-Service -Name postgresql*
   ```
2. Nếu service chưa chạy, khởi động:
   ```powershell
   Start-Service postgresql-x64-15
   # Thay "15" bằng version của bạn
   ```
3. Hoặc khởi động từ Services:
   - Windows + R → `services.msc`
   - Tìm "postgresql" → Right click → Start

### Lỗi: "password authentication failed"
**Giải pháp:**
- Sử dụng mật khẩu đã đặt khi cài đặt
- Hoặc reset password:
  ```powershell
  # Tìm file pg_hba.conf trong thư mục data
  # Tạm thời đổi authentication từ "md5" sang "trust"
  # Sau đó đổi lại password
  ```

---

## ✅ Checklist Sau Khi Cài Đặt

- [ ] `psql --version` → Hiển thị PostgreSQL version
- [ ] PostgreSQL service đang chạy
- [ ] Có thể kết nối database:
  ```powershell
  psql -U postgres
  # Nhập password khi được hỏi
  ```

---

## 🧪 Test Kết Nối Database

### Cách 1: Sử dụng psql
```powershell
psql -U postgres
# Nhập password
# Sau đó gõ: \q để thoát
```

### Cách 2: Sử dụng pgAdmin 4
1. Mở pgAdmin 4 (đã cài cùng PostgreSQL)
2. Kết nối với:
   - Host: localhost
   - Port: 5432
   - Username: postgres
   - Password: (mật khẩu bạn đã đặt)

---

## 📝 Cấu Hình Database cho Project

Sau khi cài PostgreSQL, bạn cần cấu hình trong `backend/config/database.yml`:

```yaml
development:
  adapter: postgresql
  encoding: unicode
  database: menu_api_development
  username: postgres
  password: your_password_here  # Mật khẩu bạn đã đặt khi cài
  host: localhost
  port: 5432
```

Hoặc sử dụng environment variable:
```powershell
$env:DATABASE_URL="postgresql://postgres:your_password@localhost:5432/menu_api_development"
```

---

## 🚀 Sau Khi Cài PostgreSQL Xong

Tiếp tục setup backend:
```powershell
cd backend
rails db:create
rails db:migrate
rails server
```

---

## 🔗 Link Tải

- **PostgreSQL Official**: https://www.postgresql.org/download/windows/
- **EnterpriseDB Installer**: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

---

## 💡 Lưu Ý Quan Trọng

1. **Nhớ mật khẩu postgres user** - bạn sẽ cần dùng để tạo database
2. **PostgreSQL service phải đang chạy** trước khi chạy `rails db:create`
3. **Port 5432** là port mặc định - nếu đã có PostgreSQL khác, chọn port khác
4. **pgAdmin 4** là công cụ GUI hữu ích để quản lý database (tùy chọn)

