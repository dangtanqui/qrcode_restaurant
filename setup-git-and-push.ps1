# Script hướng dẫn Push Code lên GitHub
# Chạy script này trong PowerShell

Write-Host "=== HƯỚNG DẪN PUSH CODE LÊN GITHUB ===" -ForegroundColor Green
Write-Host ""

# Bước 1: Thiết lập Git (nếu chưa có)
Write-Host "BƯỚC 1: Thiết lập Git" -ForegroundColor Yellow
$userName = Read-Host "Nhập tên của bạn (hoặc Enter để bỏ qua nếu đã có)"
$userEmail = Read-Host "Nhập email của bạn (hoặc Enter để bỏ qua nếu đã có)"

if ($userName -and $userEmail) {
    git config --global user.name "$userName"
    git config --global user.email "$userEmail"
    Write-Host "✓ Đã thiết lập Git config" -ForegroundColor Green
} else {
    Write-Host "→ Bỏ qua thiết lập Git config" -ForegroundColor Gray
}

Write-Host ""

# Bước 2: Kiểm tra trạng thái
Write-Host "BƯỚC 2: Kiểm tra trạng thái Git" -ForegroundColor Yellow
git status
Write-Host ""

# Bước 3: Add và Commit
Write-Host "BƯỚC 3: Add và Commit code" -ForegroundColor Yellow
Write-Host "Đang add tất cả các file..."
git add .

$commitMessage = Read-Host "Nhập message cho commit (hoặc Enter để dùng message mặc định)"
if (-not $commitMessage) {
    $commitMessage = "Initial commit: AI Website project"
}

git commit -m "$commitMessage"
Write-Host "✓ Đã commit code" -ForegroundColor Green
Write-Host ""

# Bước 4: Hướng dẫn tạo repository trên GitHub
Write-Host "BƯỚC 4: Tạo repository trên GitHub" -ForegroundColor Yellow
Write-Host "1. Đăng nhập vào GitHub: https://github.com" -ForegroundColor Cyan
Write-Host "2. Click vào dấu + ở góc trên bên phải" -ForegroundColor Cyan
Write-Host "3. Chọn 'New repository'" -ForegroundColor Cyan
Write-Host "4. Đặt tên repository (ví dụ: ai-website)" -ForegroundColor Cyan
Write-Host "5. KHÔNG tích vào 'Initialize this repository with a README'" -ForegroundColor Cyan
Write-Host "6. Click 'Create repository'" -ForegroundColor Cyan
Write-Host ""

# Bước 5: Kết nối và Push
Write-Host "BƯỚC 5: Kết nối với GitHub và Push code" -ForegroundColor Yellow
$repoUrl = Read-Host "Nhập URL repository GitHub của bạn (ví dụ: https://github.com/username/repo-name.git)"

if ($repoUrl) {
    # Kiểm tra xem remote đã tồn tại chưa
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "Remote 'origin' đã tồn tại. Bạn có muốn thay thế? (y/n)" -ForegroundColor Yellow
        $replace = Read-Host
        if ($replace -eq "y" -or $replace -eq "Y") {
            git remote remove origin
        } else {
            Write-Host "→ Giữ nguyên remote hiện tại" -ForegroundColor Gray
            $repoUrl = $null
        }
    }
    
    if ($repoUrl) {
        git remote add origin $repoUrl
        Write-Host "✓ Đã thêm remote repository" -ForegroundColor Green
        
        # Đổi tên branch thành main
        git branch -M main
        
        Write-Host ""
        Write-Host "Đang push code lên GitHub..." -ForegroundColor Yellow
        Write-Host "Lưu ý: Bạn có thể cần nhập username và Personal Access Token" -ForegroundColor Cyan
        git push -u origin main
        
        Write-Host ""
        Write-Host "✓ HOÀN TẤT! Code đã được push lên GitHub" -ForegroundColor Green
    }
} else {
    Write-Host "→ Bạn có thể chạy các lệnh sau sau khi tạo repository:" -ForegroundColor Gray
    Write-Host "  git remote add origin <URL_REPOSITORY>" -ForegroundColor Cyan
    Write-Host "  git branch -M main" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== XEM FILE GITHUB_SETUP.md ĐỂ BIẾT THÊM CHI TIẾT ===" -ForegroundColor Green

