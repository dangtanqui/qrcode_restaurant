import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'vi' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Common
    'common.loading': 'Đang tải...',
    'common.save': 'Lưu',
    'common.cancel': 'Hủy',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.add': 'Thêm',
    'common.back': 'Quay lại',
    'common.confirm': 'Xác nhận',
    'common.yes': 'Có',
    'common.no': 'Không',
    'common.retry': 'Thử lại',
    'common.error': 'Đã xảy ra lỗi',
    
    // Auth
    'auth.login': 'Đăng nhập',
    'auth.signup': 'Đăng ký',
    'auth.logout': 'Đăng xuất',
    'auth.email': 'Email',
    'auth.password': 'Mật khẩu',
    'auth.passwordConfirmation': 'Xác nhận mật khẩu',
    'auth.or': 'Hoặc',
    'auth.createAccount': 'tạo tài khoản mới',
    'auth.signInExisting': 'đăng nhập tài khoản hiện có',
    'auth.signingIn': 'Đang đăng nhập...',
    'auth.creatingAccount': 'Đang tạo tài khoản...',
    'auth.invalidResponse': 'Phản hồi không hợp lệ từ server',
    'auth.loginFailed': 'Đăng nhập thất bại',
    'auth.signupFailed': 'Đăng ký thất bại',
    'auth.passwordsNotMatch': 'Mật khẩu không khớp',
    
    // Restaurant
    'restaurant.name': 'Tên nhà hàng',
    'restaurant.address': 'Địa chỉ',
    'restaurant.setup': 'Thiết lập nhà hàng',
    'restaurant.menu': 'Thực đơn',
    'restaurant.qr': 'Mã QR',
    'restaurant.create': 'Tạo nhà hàng',
    'restaurant.logo': 'Logo',
    'restaurant.creating': 'Đang tạo...',
    'restaurant.qrTitle': 'Mã QR',
    'restaurant.scanQR': 'Quét mã QR này để xem thực đơn',
    'restaurant.downloadSVG': 'Tải SVG',
    'restaurant.downloadPNG': 'Tải PNG',
    
    // Menu
    'menu.categories': 'Danh mục',
    'menu.addCategory': 'Thêm danh mục',
    'menu.categoryName': 'Tên danh mục',
    'menu.items': 'Món ăn',
    'menu.addItem': 'Thêm món',
    'menu.itemName': 'Tên món',
    'menu.price': 'Giá',
    'menu.description': 'Mô tả',
    'menu.image': 'Hình ảnh',
    'menu.available': 'Có sẵn',
    'menu.notAvailable': 'Không có sẵn',
    'menu.deleteCategory': 'Xóa danh mục này và tất cả món ăn?',
    'menu.deleteItem': 'Xóa món này?',
    'menu.noCategories': 'Chưa có danh mục nào. Thêm danh mục đầu tiên để bắt đầu!',
    
    // Dashboard
    'dashboard.title': 'Bảng điều khiển',
    'dashboard.createRestaurant': 'Tạo nhà hàng mới',
    'dashboard.myRestaurants': 'Nhà hàng của tôi',
    'dashboard.noRestaurants': 'Chưa có nhà hàng nào. Tạo nhà hàng đầu tiên!',
    'dashboard.newRestaurant': 'Nhà hàng mới',
    'dashboard.editMenu': 'Sửa thực đơn',
    'dashboard.orders': 'Đơn hàng',
    'dashboard.deleteConfirm': 'Bạn có chắc muốn xóa nhà hàng này?',
    
    // Settings
    'settings.language': 'Ngôn ngữ',
    'settings.theme': 'Giao diện',
    'settings.light': 'Sáng',
    'settings.dark': 'Tối',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.back': 'Back',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.retry': 'Retry',
    'common.error': 'An error occurred',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.passwordConfirmation': 'Confirm Password',
    'auth.or': 'Or',
    'auth.createAccount': 'create a new account',
    'auth.signInExisting': 'sign in to existing account',
    'auth.signingIn': 'Signing in...',
    'auth.creatingAccount': 'Creating account...',
    'auth.invalidResponse': 'Invalid response from server',
    'auth.loginFailed': 'Login failed',
    'auth.signupFailed': 'Signup failed',
    'auth.passwordsNotMatch': 'Passwords do not match',
    
    // Restaurant
    'restaurant.name': 'Restaurant Name',
    'restaurant.address': 'Address',
    'restaurant.setup': 'Restaurant Setup',
    'restaurant.menu': 'Menu',
    'restaurant.qr': 'QR Code',
    'restaurant.create': 'Create Restaurant',
    'restaurant.logo': 'Logo',
    'restaurant.creating': 'Creating...',
    'restaurant.qrTitle': 'QR Code',
    'restaurant.scanQR': 'Scan this QR code to view the menu',
    'restaurant.downloadSVG': 'Download SVG',
    'restaurant.downloadPNG': 'Download PNG',
    
    // Menu
    'menu.categories': 'Categories',
    'menu.addCategory': 'Add Category',
    'menu.categoryName': 'Category Name',
    'menu.items': 'Items',
    'menu.addItem': 'Add Item',
    'menu.itemName': 'Item Name',
    'menu.price': 'Price',
    'menu.description': 'Description',
    'menu.image': 'Image',
    'menu.available': 'Available',
    'menu.notAvailable': 'Not Available',
    'menu.deleteCategory': 'Delete this category and all its items?',
    'menu.deleteItem': 'Delete this item?',
    'menu.noCategories': 'No categories yet. Add your first category to get started!',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.createRestaurant': 'Create New Restaurant',
    'dashboard.myRestaurants': 'My Restaurants',
    'dashboard.noRestaurants': 'No restaurants yet. Create your first one!',
    'dashboard.newRestaurant': 'New Restaurant',
    'dashboard.editMenu': 'Edit Menu',
    'dashboard.orders': 'Orders',
    'dashboard.deleteConfirm': 'Are you sure you want to delete this restaurant?',
    
    // Settings
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language
    return saved && (saved === 'vi' || saved === 'en') ? saved : 'vi'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

