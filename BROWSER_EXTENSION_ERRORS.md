# Browser Extension Errors - URL.parse Issue

## Vấn Đề

Bạn có thể thấy lỗi trong console:
```
Uncaught (in promise) TypeError: URL.parse is not a function
at bt (content.bundle.js:2:37318)
```

## Nguyên Nhân

Lỗi này **KHÔNG phải từ code của bạn**. Nó đến từ **browser extension** (như Wappalyzer, React DevTools, hoặc các extension khác) đang cố phân tích trang web của bạn.

## Giải Pháp

### Cách 1: Tắt Extension (Khuyên dùng để test)

1. **Chrome/Edge:**
   - Mở `chrome://extensions/` hoặc `edge://extensions/`
   - Tắt tất cả extensions
   - Refresh trang

2. **Firefox:**
   - Mở `about:addons`
   - Tắt extensions
   - Refresh trang

### Cách 2: Sử dụng Incognito/Private Mode

- Mở cửa sổ Incognito/Private
- Extensions thường bị tắt trong chế độ này
- Truy cập `http://localhost:5173`

### Cách 3: Filter Console Errors

Code đã được cập nhật để tự động filter các lỗi từ extensions. Bạn có thể bỏ qua các lỗi này vì chúng không ảnh hưởng đến ứng dụng.

## Xác Nhận

Nếu ứng dụng vẫn hoạt động bình thường (login, navigation, v.v.) thì lỗi này **KHÔNG ảnh hưởng** và bạn có thể bỏ qua.

## Test

1. Tắt tất cả extensions
2. Refresh trang
3. Kiểm tra console - lỗi sẽ biến mất
4. Ứng dụng vẫn hoạt động bình thường

