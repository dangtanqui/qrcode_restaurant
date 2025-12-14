import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurants'
import { ordersApi, Order } from '../api/orders'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface OrderColumn {
  id: string
  title: { vi: string; en: string }
  status?: string
  payment_status?: string
  type: 'status' | 'payment'
}

const orderStatusColumns: OrderColumn[] = [
  { id: 'pending', title: { vi: 'Chờ xác nhận', en: 'Pending' }, status: 'pending', type: 'status' },
  { id: 'confirmed', title: { vi: 'Đã xác nhận', en: 'Confirmed' }, status: 'confirmed', type: 'status' },
  { id: 'preparing', title: { vi: 'Đang chế biến', en: 'Preparing' }, status: 'preparing', type: 'status' },
  { id: 'ready', title: { vi: 'Sẵn sàng', en: 'Ready' }, status: 'ready', type: 'status' },
  { id: 'served', title: { vi: 'Đã đem món lên', en: 'Served' }, status: 'served', type: 'status' },
  { id: 'cancelled', title: { vi: 'Đã hủy', en: 'Cancelled' }, status: 'cancelled', type: 'status' },
]

const paymentStatusColumns: OrderColumn[] = [
  { id: 'unpaid', title: { vi: 'Chưa thanh toán', en: 'Unpaid' }, payment_status: 'unpaid', type: 'payment' },
  { id: 'paid_payment', title: { vi: 'Đã thanh toán', en: 'Paid' }, payment_status: 'paid', type: 'payment' },
]

function OrderCard({ order, language, formatCurrency, onStatusChange, onPaymentStatusChange, getStatusColor }: { order: Order; language: string; formatCurrency: (amount: number) => string; onStatusChange: (orderId: number, status: string) => void; onPaymentStatusChange: (orderId: number, paymentStatus: string) => void; getStatusColor: (status: string) => string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `order-${order.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
  }


  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow border-2 cursor-grab active:cursor-grabbing ${getStatusColor(order.status)}`}
      onMouseDown={(e) => {
        // Prevent drag if clicking on select elements
        const target = e.target as HTMLElement
        if (target.tagName === 'SELECT' || target.closest('select')) {
          e.stopPropagation()
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {language === 'vi' ? 'Bàn' : 'Table'} {order.table_number}
          </span>
        </div>
      </div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'vi' ? 'Trạng thái đơn' : 'Order Status'}
        </label>
        <select
          value={order.status}
          onChange={(e) => {
            e.stopPropagation()
            onStatusChange(order.id, e.target.value)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          onClick={(e) => e.stopPropagation()}
        >
          {orderStatusColumns.filter(col => col.type === 'status').map((col) => (
            <option key={col.id} value={col.status}>
              {language === 'vi' ? col.title.vi : col.title.en}
            </option>
          ))}
        </select>
      </div>
      
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        {language === 'vi' ? 'Đơn hàng' : 'Order'} #{order.id}
      </p>
      
      <div className="mb-2">
        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
          {formatCurrency(order.total)}
        </span>
      </div>
      
      <div className="mb-2">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {language === 'vi' ? 'Trạng thái thanh toán' : 'Payment Status'}
        </label>
        <select
          value={order.payment_status || 'unpaid'}
          onChange={(e) => {
            e.stopPropagation()
            onPaymentStatusChange(order.id, e.target.value)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          onClick={(e) => e.stopPropagation()}
        >
          {paymentStatusColumns.map((col) => {
            const getPaymentOptionColor = (paymentStatus: string) => {
              switch (paymentStatus) {
                case 'paid':
                  return 'bg-green-50 text-green-900'
                case 'unpaid':
                  return 'bg-red-50 text-red-900'
                default:
                  return ''
              }
            }
            return (
              <option key={col.id} value={col.payment_status} className={getPaymentOptionColor(col.payment_status!)}>
                {language === 'vi' ? col.title.vi : col.title.en}
              </option>
            )
          })}
        </select>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        <div className="space-y-1">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                {item.item_name} × {item.quantity}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              +{order.items.length - 3} {language === 'vi' ? 'món khác' : 'more items'}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {new Date(order.created_at).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  )
}

function Column({ column, orders, language, formatCurrency, onStatusChange, onPaymentStatusChange, getStatusColor, overId }: { column: OrderColumn; orders: Order[]; language: string; formatCurrency: (amount: number) => string; onStatusChange: (orderId: number, status: string) => void; onPaymentStatusChange: (orderId: number, paymentStatus: string) => void; getStatusColor: (status: string) => string; overId: string | null }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const columnOrders = orders.filter((order) => {
    if (column.type === 'status') {
      return order.status === column.status
    } else {
      return (order.payment_status || 'unpaid') === column.payment_status
    }
  })

  const orderIds = columnOrders.map((order) => `order-${order.id}`)

  const title = language === 'vi' ? column.title.vi : column.title.en

  const getColumnColor = () => {
    if (column.type === 'status' && column.status) {
      switch (column.status) {
        case 'pending':
          return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
        case 'confirmed':
          return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
        case 'preparing':
          return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700'
        case 'ready':
          return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
        case 'served':
          return 'bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700'
        case 'paid':
          return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700'
        case 'cancelled':
          return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
        default:
          return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
      }
    } else if (column.type === 'payment' && column.payment_status) {
      switch (column.payment_status) {
        case 'paid':
          return 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
        case 'unpaid':
          return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
        default:
          return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
      }
    }
    return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
  }

  const getColumnContentColor = () => {
    if (column.type === 'status' && column.status) {
      switch (column.status) {
        case 'pending':
          return 'bg-yellow-50 dark:bg-yellow-900/10'
        case 'confirmed':
          return 'bg-blue-50 dark:bg-blue-900/10'
        case 'preparing':
          return 'bg-orange-50 dark:bg-orange-900/10'
        case 'ready':
          return 'bg-green-50 dark:bg-green-900/10'
        case 'served':
          return 'bg-teal-50 dark:bg-teal-900/10'
        case 'paid':
          return 'bg-purple-50 dark:bg-purple-900/10'
        case 'cancelled':
          return 'bg-red-50 dark:bg-red-900/10'
        default:
          return 'bg-gray-50 dark:bg-gray-800'
      }
    } else if (column.type === 'payment' && column.payment_status) {
      switch (column.payment_status) {
        case 'paid':
          return 'bg-green-50 dark:bg-green-900/10'
        case 'unpaid':
          return 'bg-red-50 dark:bg-red-900/10'
        default:
          return 'bg-gray-50 dark:bg-gray-800'
      }
    }
    return 'bg-gray-50 dark:bg-gray-800'
  }

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className={`rounded-t-lg p-3 mb-2 border-2 ${getColumnColor()}`}>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {columnOrders.length} {language === 'vi' ? 'đơn' : 'orders'}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-b-lg p-3 overflow-y-auto min-h-[400px] ${getColumnContentColor()} ${overId === column.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
      >
        <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
          {columnOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
              {language === 'vi' ? 'Không có đơn hàng' : 'No orders'}
            </div>
          ) : (
            columnOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                language={language}
                formatCurrency={formatCurrency}
                onStatusChange={onStatusChange}
                onPaymentStatusChange={onPaymentStatusChange}
                getStatusColor={getStatusColor}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default function OrderManagement() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'status' | 'payment'>('status')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? (over.id as string) : null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const orderId = parseInt((active.id as string).replace('order-', ''))
    const targetColumnId = over.id as string

    // Find target column
    const allColumns = [...orderStatusColumns, ...paymentStatusColumns]
    const targetColumn = allColumns.find((col) => col.id === targetColumnId)

    if (!targetColumn) return

    // Find the order
    const order = orders?.find((o) => o.id === orderId)
    if (!order) return

    // Update order based on column type
    // Only status changes move columns
    if (targetColumn.type === 'status' && targetColumn.status) {
      if (order.status !== targetColumn.status) {
        updateOrderMutation.mutate({ orderId, status: targetColumn.status })
      }
    } else if (targetColumn.type === 'payment' && targetColumn.payment_status) {
      // If dragging to Paid column, set status to 'served' and payment_status to 'paid'
      if (targetColumn.payment_status === 'paid') {
        updateOrderMutation.mutate({ 
          orderId, 
          status: 'served',
          payment_status: 'paid' 
        })
      } else if ((order.payment_status || 'unpaid') !== targetColumn.payment_status) {
        // Otherwise, just update payment status without moving
        updateOrderMutation.mutate({ orderId, payment_status: targetColumn.payment_status })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return order.table_number.toLowerCase().includes(query)
  }) || []
  
  const handleStatusChange = (orderId: number, status: string) => {
    const order = orders?.find((o) => o.id === orderId)
    if (!order || order.status === status) return
    
    updateOrderMutation.mutate({ orderId, status })
  }
  
  const handlePaymentStatusChange = (orderId: number, paymentStatus: string) => {
    const order = orders?.find((o) => o.id === orderId)
    if (!order || (order.payment_status || 'unpaid') === paymentStatus) return
    
    // Only move to Paid column if order status is 'served' and payment status is 'paid'
    if (order.status === 'served' && paymentStatus === 'paid') {
      updateOrderMutation.mutate({ orderId, payment_status: paymentStatus })
    } else {
      // Just update payment status without moving column
      updateOrderMutation.mutate({ orderId, payment_status: paymentStatus })
    }
  }

  const activeOrder = activeId ? filteredOrders.find((order) => `order-${order.id}` === activeId) : null
  const columns = viewMode === 'status' ? orderStatusColumns : paymentStatusColumns

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'confirmed':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'preparing':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'ready':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'served':
        return 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
      case 'paid':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
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

      {/* Search Bar and View Mode Toggle */}
      <div className="sticky top-16 z-40 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="text"
              placeholder={language === 'vi' ? 'Tìm kiếm theo số bàn...' : 'Search by table number...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 sm:hidden">
                {language === 'vi' ? 'Chế độ xem:' : 'View Mode:'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('status')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'status'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {language === 'vi' ? 'Trạng thái đơn' : 'Order Status'}
                </button>
                <button
                  onClick={() => setViewMode('payment')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    viewMode === 'payment'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {language === 'vi' ? 'Trạng thái thanh toán' : 'Payment Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'vi' ? 'Chưa có đơn hàng nào' : 'No orders yet'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    orders={filteredOrders}
                    language={language}
                    formatCurrency={formatCurrency}
                    onStatusChange={handleStatusChange}
                    onPaymentStatusChange={handlePaymentStatusChange}
                    getStatusColor={getStatusColor}
                    overId={overId}
                  />
                ))}
              </div>
              <DragOverlay>
                {activeOrder ? (
                  <div className={`rounded-lg shadow-lg p-4 border-2 ${getStatusColor(activeOrder.status)}`} style={{ opacity: 0.9, transform: 'rotate(3deg)', width: '16rem' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {language === 'vi' ? 'Bàn' : 'Table'} {activeOrder.table_number}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {language === 'vi' ? 'Đơn hàng' : 'Order'} #{activeOrder.id}
                    </p>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(activeOrder.total)}
                    </span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>
    </div>
  )
}
