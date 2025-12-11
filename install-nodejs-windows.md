# Hướng Dẫn Cài Đặt Node.js trên Windows

## 🎯 Phương Pháp 1: Tải từ Website Chính Thức (Khuyên dùng)

### Bước 1: Tải Node.js
1. Truy cập: https://nodejs.org/
2. Tải phiên bản **LTS (Long Term Support)** - khuyến nghị
   - File sẽ có tên: `node-v20.x.x-x64.msi` (hoặc phiên bản mới nhất)
   - **Yêu cầu tối thiểu**: Node.js 18+

### Bước 2: Cài đặt
1. Chạy file `.msi` vừa tải
2. Click "Next" qua các bước
3. **Quan trọng**: ✅ Đảm bảo tích chọn "Add to PATH" (thường được chọn mặc định)
4. Click "Install"
5. Đợi quá trình cài đặt hoàn tất

### Bước 3: Kiểm tra cài đặt
**Mở PowerShell MỚI** (quan trọng: phải mở mới để load PATH):
```powershell
node -v
# Kết quả mong đợi: v20.x.x hoặc v18.x.x

npm -v
# Kết quả mong đợi: 10.x.x hoặc cao hơn
```

---

## 🎯 Phương Pháp 2: Sử dụng Chocolatey (Nếu đã có Chocolatey)

### Bước 1: Cài đặt Node.js
```powershell
# Mở PowerShell với quyền Administrator
choco install nodejs -y
```

### Bước 2: Kiểm tra
```powershell
node -v
npm -v
```

---

## 🎯 Phương Pháp 3: Sử dụng winget (Windows 11)

```powershell
winget install OpenJS.NodeJS.LTS
```

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi: "node is not recognized"
**Giải pháp:**
1. Đảm bảo đã tích chọn "Add to PATH" khi cài đặt
2. **Mở lại PowerShell/Terminal MỚI** (quan trọng!)
3. Kiểm tra PATH:
   ```powershell
   $env:PATH -split ';' | Select-String node
   ```
4. Nếu không thấy, thêm thủ công:
   ```powershell
   # Thay đường dẫn bằng đường dẫn thực tế của bạn
   $env:PATH += ";C:\Program Files\nodejs"
   ```

### Lỗi: "npm is not recognized"
- npm thường được cài cùng Node.js
- Nếu không có, cài đặt lại Node.js và đảm bảo chọn "npm package manager"

### Lỗi: "Permission denied" khi cài packages
**Giải pháp:**
```powershell
# Chạy PowerShell với quyền Administrator
# Hoặc cấu hình npm để không cần quyền admin
npm config set prefix "$env:APPDATA\npm"
```

---

## ✅ Checklist Sau Khi Cài Đặt

- [ ] `node -v` → Hiển thị version 18.x.x hoặc cao hơn
- [ ] `npm -v` → Hiển thị npm version
- [ ] Có thể chạy `npm install` trong thư mục frontend

---

## 📝 Lưu Ý Quan Trọng

1. **Luôn mở PowerShell/Terminal MỚI** sau khi cài đặt Node.js để PATH được cập nhật
2. **Chọn phiên bản LTS** (Long Term Support) để ổn định nhất
3. Node.js tự động cài **npm** (Node Package Manager) cùng lúc
4. Nếu đã có Node.js cũ, có thể cần gỡ cài đặt trước khi cài phiên bản mới

---

## 🔗 Link Tải

- **Node.js Official**: https://nodejs.org/
- **Node.js Downloads**: https://nodejs.org/en/download/
- **Node.js Documentation**: https://nodejs.org/en/docs/

---

## 🚀 Sau Khi Cài Node.js Xong

Tiếp tục setup frontend:
```powershell
cd frontend
npm install
npm run dev
```

