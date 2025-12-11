import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { publicApi } from '../api/public'
import { useState, useEffect } from 'react'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ChevronDown, ChevronUp, Plus, Minus, CreditCard, QrCode } from 'lucide-react'

interface CartItem {
  item_id: number
  name: string
  price: number
  quantity: number
  image_url?: string | null
}

export default function CustomerMenu() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language } = useI18n()
  const { formatCurrency, convertToUSD, formatUSD } = useCurrency()
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set())
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null)

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['public-menu', slug],
    queryFn: () => publicApi.getMenu(slug!),
    enabled: !!slug,
  })

  const createOrderMutation = useMutation({
    mutationFn: async (data: { table_number: string; items: any[] }) => {
      return publicApi.createOrder(slug!, data)
    },
    onSuccess: (data) => {
      setOrderData(data)
      // Generate payment QR code (simple example - in production, use actual payment gateway)
      generatePaymentQRCode(data)
      setShowCheckout(true)
    },
  })

  const generatePaymentQRCode = (order: any) => {
    // Generate QR code for payment (example: contains order ID and total)
    const paymentData = JSON.stringify({
      order_id: order.id,
      total: order.total,
      restaurant_id: order.restaurant_id,
      table_number: order.table_number
    })
    // In production, use a QR code library or payment gateway API
    // For now, we'll create a simple text representation
    setPaymentQRCode(paymentData)
  }

  // Auto-open first category on mobile
  useEffect(() => {
    if (menuData?.categories && menuData.categories.length > 0) {
      setOpenCategories(new Set([menuData.categories[0].id]))
    }
  }, [menuData])

  const toggleCategory = (categoryId: number) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const updateItemQuantity = (item: any, delta: number) => {
    if (!item.is_available) return
    
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item_id === item.id)
      if (existing) {
        const newQuantity = existing.quantity + delta
        if (newQuantity <= 0) {
          return prev.filter((ci) => ci.item_id !== item.id)
        }
        return prev.map((ci) =>
          ci.item_id === item.id ? { ...ci, quantity: newQuantity } : ci
        )
      } else {
        if (delta > 0) {
          return [...prev, { item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }]
        }
        return prev
      }
    })
  }

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find((ci) => ci.item_id === itemId)
    return cartItem?.quantity || 0
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const restaurantCurrency = menuData?.restaurant.currency || 'VND'
  const exchangeRate = menuData?.restaurant.exchange_rate || 25000

  const handleCheckout = () => {
    if (!tableNumber.trim()) {
      alert(language === 'vi' ? 'Vui lòng nhập số bàn' : 'Please enter table number')
      return
    }
    if (cart.length === 0) {
      alert(language === 'vi' ? 'Vui lòng chọn món' : 'Please select items')
      return
    }
    
    createOrderMutation.mutate({
      table_number: tableNumber,
      items: cart.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
      })),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (!menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Menu not found</div>
      </div>
    )
  }

  if (showCheckout && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Bill */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {menuData.restaurant.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {menuData.restaurant.address}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'vi' ? 'Mã đơn hàng' : 'Order ID'}: <span className="font-bold">#{orderData.id}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'vi' ? 'Bàn' : 'Table'}: <span className="font-bold">{orderData.table_number}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'vi' ? 'Chi tiết đơn hàng' : 'Order Details'}
              </h3>
              <div className="space-y-2">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.item_name} × {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'vi' ? 'Tổng cộng' : 'Total'}
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(orderData.total)}
                  </p>
                  {restaurantCurrency === 'VND' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ≈ {formatUSD(convertToUSD(orderData.total, exchangeRate))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'vi' ? 'Quét mã QR để thanh toán' : 'Scan QR Code to Pay'}
            </h3>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              {paymentQRCode ? (
                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'vi' ? 'QR Code thanh toán' : 'Payment QR Code'}
                  </p>
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      {language === 'vi' ? 'Đang tạo mã QR...' : 'Generating QR code...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'vi' 
                ? 'Hoặc thanh toán tại quầy thu ngân'
                : 'Or pay at the cashier counter'}
            </p>
            <button
              onClick={() => {
                setShowCheckout(false)
                setOrderData(null)
                setCart([])
                setTableNumber('')
                setPaymentQRCode(null)
              }}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {language === 'vi' ? 'Đặt món tiếp' : 'Order More'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {menuData.restaurant.logo_url && (
                <img
                  src={menuData.restaurant.logo_url}
                  alt={menuData.restaurant.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {menuData.restaurant.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {menuData.restaurant.address}
                </p>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Category Navigation - Accordion */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          {menuData.categories.map((category) => (
            <div key={category.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                {openCategories.has(category.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              
              {openCategories.has(category.id) && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-900">
                  <div className="space-y-3">
                    {category.items.map((item) => {
                      const quantity = getItemQuantity(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                            !item.is_available ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex">
                            {item.image_url && (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-24 h-24 object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 p-3">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
                                  {item.name}
                                </h3>
                                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 ml-2">
                                  {formatCurrency(item.price)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {item.description}
                                </p>
                              )}
                              {item.is_available ? (
                                <div className="flex items-center justify-between">
                                  {quantity === 0 ? (
                                    <button
                                      onClick={() => updateItemQuantity(item, 1)}
                                      className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                    >
                                      {language === 'vi' ? 'Thêm' : 'Add'}
                                    </button>
                                  ) : (
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => updateItemQuantity(item, -1)}
                                        className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={() => updateItemQuantity(item, 1)}
                                        className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-block px-3 py-1.5 bg-red-500 text-white text-sm rounded">
                                  {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Menu Content */}
      <main className="hidden lg:block max-w-4xl mx-auto px-4 py-6">
        {menuData.categories.map((category) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {category.items.map((item) => {
                const quantity = getItemQuantity(item.id)
                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                      !item.is_available ? 'opacity-60' : ''
                    }`}
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                          {item.name}
                        </h3>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 ml-2">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {item.description}
                        </p>
                      )}
                      {item.is_available ? (
                        <div className="flex items-center justify-center">
                          {quantity === 0 ? (
                            <button
                              onClick={() => updateItemQuantity(item, 1)}
                              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                              {language === 'vi' ? 'Thêm' : 'Add'}
                            </button>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => updateItemQuantity(item, -1)}
                                className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-white">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateItemQuantity(item, 1)}
                                className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-block w-full text-center px-4 py-2 bg-red-500 text-white rounded">
                          {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Checkout Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {language === 'vi' ? 'Tổng cộng' : 'Total'}
                    </p>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(total)}
                    </p>
                    {restaurantCurrency === 'VND' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ≈ {formatUSD(convertToUSD(total, exchangeRate))}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 max-w-xs">
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder={language === 'vi' ? 'Số bàn' : 'Table Number'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={createOrderMutation.isPending || !tableNumber.trim()}
                className="ml-4 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 flex items-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {createOrderMutation.isPending
                    ? (language === 'vi' ? 'Đang xử lý...' : 'Processing...')
                    : (language === 'vi' ? 'Thanh toán' : 'Checkout')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
