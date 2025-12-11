# Hướng dẫn Push Code lên GitHub

## Bước 1: Thiết lập Git (Nếu chưa có)

Nếu bạn chưa cấu hình Git, chạy các lệnh sau (thay thế thông tin của bạn):

```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

## Bước 2: Kiểm tra trạng thái Git

```bash
git status
```

## Bước 3: Thêm tất cả các file vào Git

```bash
git add .
```

## Bước 4: Commit code

```bash
git commit -m "Initial commit: AI Website project"
```

## Bước 5: Tạo repository trên GitHub

1. Đăng nhập vào GitHub: https://github.com
2. Click vào dấu **+** ở góc trên bên phải
3. Chọn **New repository**
4. Đặt tên repository (ví dụ: `ai-website`)
5. **KHÔNG** tích vào "Initialize this repository with a README" (vì bạn đã có code)
6. Click **Create repository**

## Bước 6: Kết nối với GitHub và Push code

Sau khi tạo repository, GitHub sẽ hiển thị các lệnh. Chạy các lệnh sau (thay `YOUR_USERNAME` và `YOUR_REPO_NAME`):

```bash
# Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Đổi tên branch chính thành main (nếu cần)
git branch -M main

# Push code lên GitHub
git push -u origin main
```

## Bước 7: Xác thực (Nếu được yêu cầu)

- Nếu GitHub yêu cầu xác thực, bạn có thể:
  - Sử dụng **Personal Access Token** (khuyến nghị)
  - Hoặc sử dụng **GitHub CLI**

### Tạo Personal Access Token:
1. Vào GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Chọn quyền `repo` (full control)
4. Copy token và sử dụng làm password khi push

## Lệnh nhanh (Tất cả trong một)

```bash
# 1. Thiết lập Git (chỉ cần làm 1 lần)
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"

# 2. Khởi tạo và commit
git add .
git commit -m "Initial commit: AI Website project"

# 3. Kết nối với GitHub (thay YOUR_USERNAME và YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Lưu ý quan trọng

- File `.gitignore` đã được cấu hình để bỏ qua:
  - `node_modules/`
  - `backend/storage/*`
  - `backend/log/*`
  - `backend/tmp/*`
  - `.env` files
  - Các file tạm và cache

- **KHÔNG** commit các file nhạy cảm:
  - `backend/config/master.key`
  - `.env` files
  - Database files

## Troubleshooting

### Nếu gặp lỗi "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Nếu gặp lỗi authentication:
- Sử dụng Personal Access Token thay vì password
- Hoặc cài đặt GitHub CLI: `gh auth login`

### Nếu muốn đổi tên branch:
```bash
git branch -M main
```

