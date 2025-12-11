import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurants'
import { ordersApi, Order } from '../api/orders'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, CheckCircle, XCircle, Clock, ChefHat, DollarSign } from 'lucide-react'

export default function OrderManagement() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', restaurantId],
    queryFn: () => ordersApi.getOrders(restaurantId),
  })

  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status, payment_status }: { orderId: number; status?: string; payment_status?: string }) =>
      ordersApi.updateOrder(restaurantId, orderId, { status, payment_status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] })
    },
  })

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus })
  }

  const handlePaymentStatusChange = (orderId: number, newPaymentStatus: string) => {
    updateOrderMutation.mutate({ orderId, payment_status: newPaymentStatus })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'preparing':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
      case 'ready':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'paid':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'preparing':
        return <ChefHat className="w-4 h-4" />
      case 'ready':
        return <CheckCircle className="w-4 h-4" />
      case 'paid':
        return <DollarSign className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { vi: string; en: string }> = {
      pending: { vi: 'Chờ xác nhận', en: 'Pending' },
      confirmed: { vi: 'Đã xác nhận', en: 'Confirmed' },
      preparing: { vi: 'Đang chế biến', en: 'Preparing' },
      ready: { vi: 'Sẵn sàng', en: 'Ready' },
      paid: { vi: 'Đã thanh toán', en: 'Paid' },
      cancelled: { vi: 'Đã hủy', en: 'Cancelled' },
    }
    return labels[status]?.[language] || status
  }

  const getPaymentStatusLabel = (paymentStatus: string) => {
    const labels: Record<string, { vi: string; en: string }> = {
      unpaid: { vi: 'Chưa thanh toán', en: 'Unpaid' },
      paid: { vi: 'Đã thanh toán', en: 'Paid' },
    }
    return labels[paymentStatus]?.[language] || paymentStatus
  }

  const statusOptions = [
    { value: 'pending', label: { vi: 'Chờ xác nhận', en: 'Pending' } },
    { value: 'confirmed', label: { vi: 'Đã xác nhận', en: 'Confirmed' } },
    { value: 'preparing', label: { vi: 'Đang chế biến', en: 'Preparing' } },
    { value: 'ready', label: { vi: 'Sẵn sàng', en: 'Ready' } },
    { value: 'paid', label: { vi: 'Đã thanh toán', en: 'Paid' } },
    { value: 'cancelled', label: { vi: 'Đã hủy', en: 'Cancelled' } },
  ]

  const paymentStatusOptions = [
    { value: 'unpaid', label: { vi: 'Chưa thanh toán', en: 'Unpaid' } },
    { value: 'paid', label: { vi: 'Đã thanh toán', en: 'Paid' } },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {restaurant?.name} - {language === 'vi' ? 'Quản lý đơn hàng' : 'Order Management'}
              </h1>
            </div>
            <LanguageThemeSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {orders && orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'vi' ? 'Chưa có đơn hàng nào' : 'No orders yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {language === 'vi' ? 'Bàn' : 'Table'} {order.table_number}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{getStatusLabel(order.status)}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'vi' ? 'Đơn hàng' : 'Order'} #{order.id} • {new Date(order.created_at).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Status and Payment Status Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'vi' ? 'Trạng thái đơn hàng' : 'Order Status'}
                      </label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updateOrderMutation.isPending}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label[language]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'vi' ? 'Trạng thái thanh toán' : 'Payment Status'}
                      </label>
                      <select
                        value={order.payment_status || 'unpaid'}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        disabled={updateOrderMutation.isPending}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {paymentStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label[language]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {language === 'vi' ? 'Chi tiết đơn hàng' : 'Order Details'}
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm"
                        >
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
