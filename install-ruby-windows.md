# Hướng Dẫn Cài Đặt Ruby trên Windows

## 🎯 Phương Pháp 1: Sử dụng RubyInstaller (Khuyên dùng)

### Bước 1: Tải RubyInstaller
1. Truy cập: https://rubyinstaller.org/downloads/
2. Tải **Ruby+Devkit 3.2.x** (x64 hoặc x86 tùy hệ thống)
   - Khuyến nghị: **Ruby+Devkit 3.2.0 (x64)** hoặc phiên bản mới nhất
   - File sẽ có tên: `rubyinstaller-devkit-3.2.x-x64.exe`

### Bước 2: Cài đặt
1. Chạy file `.exe` vừa tải
2. **Quan trọng**: ✅ Tích chọn "Add Ruby executables to your PATH"
3. Chọn thư mục cài đặt (mặc định: `C:\Ruby32-x64`)
4. Click "Install"
5. Sau khi cài xong, sẽ có cửa sổ MSYS2 hiện lên → chọn option **3** (Install MSYS2 and MINGW development toolchain)

### Bước 3: Kiểm tra cài đặt
Mở **PowerShell mới** (quan trọng: phải mở mới để load PATH):
```powershell
ruby -v
# Kết quả mong đợi: ruby 3.2.x

gem -v
# Kiểm tra gem (package manager của Ruby)
```

### Bước 4: Cài đặt Rails
```powershell
gem install rails
```

### Bước 5: Kiểm tra Rails
```powershell
rails -v
# Kết quả mong đợi: Rails 7.1.x hoặc cao hơn
```

---

## 🎯 Phương Pháp 2: Sử dụng Chocolatey (Nếu đã có Chocolatey)

### Bước 1: Cài đặt Ruby
```powershell
# Mở PowerShell với quyền Administrator
choco install ruby -y
```

### Bước 2: Cài đặt DevKit (cần cho một số gems)
```powershell
choco install ruby2.devkit -y
```

### Bước 3: Kiểm tra
```powershell
ruby -v
gem -v
```

---

## 🎯 Phương Pháp 3: Sử dụng WSL (Windows Subsystem for Linux)

Nếu bạn muốn dùng môi trường Linux trên Windows:

### Bước 1: Cài đặt WSL
```powershell
# Mở PowerShell với quyền Administrator
wsl --install
```

### Bước 2: Sau khi cài WSL, mở Ubuntu terminal và cài Ruby
```bash
# Cập nhật package list
sudo apt update

# Cài đặt Ruby và dependencies
sudo apt install ruby-full build-essential -y

# Kiểm tra
ruby -v
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi: "ruby is not recognized"
**Giải pháp:**
1. Đảm bảo đã tích chọn "Add Ruby executables to your PATH" khi cài đặt
2. **Mở lại PowerShell/Terminal mới** (quan trọng!)
3. Kiểm tra PATH:
   ```powershell
   $env:PATH -split ';' | Select-String ruby
   ```
4. Nếu không thấy, thêm thủ công:
   ```powershell
   # Thay đường dẫn bằng đường dẫn thực tế của bạn
   $env:PATH += ";C:\Ruby32-x64\bin"
   ```

### Lỗi: "Unable to download data from https://rubygems.org"
**Giải pháp:**
```powershell
# Đổi source gem
gem sources --remove https://rubygems.org/
gem sources --add https://rubygems.org/
gem sources -l
```

### Lỗi khi cài đặt gems cần compile (như pg, bcrypt)
**Giải pháp:**
1. Đảm bảo đã cài DevKit
2. Chạy lại MSYS2 installer:
   ```powershell
   ridk install
   ```
   Chọn option **3** (Install MSYS2 and MINGW development toolchain)

---

## ✅ Checklist Sau Khi Cài Đặt

- [ ] `ruby -v` → Hiển thị version 3.2.x
- [ ] `gem -v` → Hiển thị gem version
- [ ] `rails -v` → Hiển thị Rails 7.1.x hoặc cao hơn
- [ ] Có thể chạy `bundle install` trong thư mục backend

---

## 📝 Lưu Ý Quan Trọng

1. **Luôn mở PowerShell/Terminal MỚI** sau khi cài đặt Ruby để PATH được cập nhật
2. **DevKit là bắt buộc** cho một số gems như `pg` (PostgreSQL), `bcrypt`
3. Nếu dùng RubyInstaller, chọn **Ruby+Devkit** thay vì chỉ Ruby
4. Trên Windows, khuyến nghị dùng **RubyInstaller** vì dễ cài và ổn định nhất

---

## 🔗 Link Tải

- **RubyInstaller**: https://rubyinstaller.org/downloads/
- **Ruby Documentation**: https://www.ruby-lang.org/en/documentation/
- **Rails Guides**: https://guides.rubyonrails.org/

