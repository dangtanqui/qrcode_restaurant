import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurants'
import { analyticsApi } from '../api/analytics'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, TrendingUp, DollarSign, ShoppingBag, Clock, Download, BarChart3, PieChart, FileDown, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import * as XLSX from 'xlsx'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Analytics() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const { formatCurrency } = useCurrency()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', restaurantId, startDate, endDate],
    queryFn: () => analyticsApi.getAnalytics(restaurantId, startDate || undefined, endDate || undefined),
    enabled: !!restaurantId,
  })

  const exportToCSV = () => {
    if (!analytics) return

    const csvRows = []
    csvRows.push('Analytics Report')
    csvRows.push(`Restaurant: ${restaurant?.name}`)
    csvRows.push(`Date Range: ${startDate || 'All'} - ${endDate || 'All'}`)
    csvRows.push('')
    csvRows.push('Summary')
    csvRows.push(`Total Orders,${analytics.total_orders}`)
    csvRows.push(`Total Revenue,${analytics.total_revenue}`)
    csvRows.push(`Average Order Value,${analytics.average_order_value}`)
    csvRows.push('')
    csvRows.push('Orders by Status')
    Object.entries(analytics.orders_by_status).forEach(([status, count]) => {
      csvRows.push(`${status},${count}`)
    })
    csvRows.push('')
    csvRows.push('Top Items')
    csvRows.push('Item Name,Quantity Sold,Revenue')
    analytics.top_items.forEach((item) => {
      csvRows.push(`${item.item_name},${item.quantity_sold},${item.revenue}`)
    })
    csvRows.push('')
    csvRows.push('Revenue by Date')
    csvRows.push('Date,Revenue,Orders')
    analytics.revenue_by_date.forEach((day) => {
      csvRows.push(`${day.date},${day.revenue},${day.orders}`)
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${restaurant?.name}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportToExcel = () => {
    if (!analytics) return

    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
      ['Analytics Report'],
      ['Restaurant:', restaurant?.name || ''],
      ['Date Range:', `${startDate || 'All'} - ${endDate || 'All'}`],
      [],
      ['Summary'],
      ['Total Orders', analytics.total_orders.toString()],
      ['Total Revenue', analytics.total_revenue.toString()],
      ['Average Order Value', analytics.average_order_value.toString()],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Orders by Status sheet
    const statusData = [['Status', 'Count']]
    Object.entries(analytics.orders_by_status).forEach(([status, count]) => {
      statusData.push([status, count.toString()])
    })
    const statusSheet = XLSX.utils.aoa_to_sheet(statusData)
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Orders by Status')

    // Top Items sheet
    const itemsData = [['Item Name', 'Quantity Sold', 'Revenue']]
    analytics.top_items.forEach((item) => {
      itemsData.push([item.item_name, item.quantity_sold.toString(), item.revenue.toString()])
    })
    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData)
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Top Items')

    // Revenue by Date sheet
    const revenueData = [['Date', 'Revenue', 'Orders']]
    analytics.revenue_by_date.forEach((day) => {
      revenueData.push([day.date, day.revenue.toString(), day.orders.toString()])
    })
    const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData)
    XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue by Date')

    XLSX.writeFile(workbook, `analytics-${restaurant?.name}-${Date.now()}.xlsx`)
    setShowExportMenu(false)
  }

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  // Prepare data for charts
  const revenueChartData = analytics?.revenue_by_date.map((day) => ({
    date: new Date(day.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
    revenue: day.revenue,
    orders: day.orders,
  })) || []

  const ordersByHourData = analytics?.orders_by_hour.map((hour) => ({
    hour: `${hour.hour}:00`,
    orders: hour.orders,
  })) || []

  const statusChartData = analytics
    ? Object.entries(analytics.orders_by_status).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : []

  const topItemsChartData = analytics?.top_items.slice(0, 10).map((item) => ({
    name: item.item_name.length > 15 ? item.item_name.substring(0, 15) + '...' : item.item_name,
    quantity: item.quantity_sold,
    revenue: item.revenue,
  })) || []

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {restaurant?.name} - {language === 'vi' ? 'Phân tích' : 'Analytics'}
              </h1>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Date Range Filter and Export */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="w-full sm:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'vi' ? 'Từ ngày' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'vi' ? 'Đến ngày' : 'End Date'}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              {analytics && (
                <div className="relative" ref={exportMenuRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center px-4 h-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    {language === 'vi' ? 'Xuất dữ liệu' : 'Export'}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </button>
                  {showExportMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={exportToCSV}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'vi' ? 'Xuất CSV' : 'Export CSV'}
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        {language === 'vi' ? 'Xuất Excel' : 'Export Excel'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <ShoppingBag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'vi' ? 'Tổng đơn hàng' : 'Total Orders'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.total_orders}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'vi' ? 'Tổng doanh thu' : 'Total Revenue'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(analytics.total_revenue)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'vi' ? 'Giá trị đơn trung bình' : 'Average Order Value'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(analytics.average_order_value)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'vi' ? 'Đơn hàng đang chờ' : 'Pending Orders'}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.orders_by_status.pending || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              {revenueChartData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    {language === 'vi' ? 'Doanh thu theo thời gian' : 'Revenue Over Time'}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? formatCurrency(value) : value,
                          name === 'revenue'
                            ? language === 'vi'
                              ? 'Doanh thu'
                              : 'Revenue'
                            : language === 'vi'
                            ? 'Đơn hàng'
                            : 'Orders',
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10B981"
                        strokeWidth={2}
                        name={language === 'vi' ? 'Doanh thu' : 'Revenue'}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        name={language === 'vi' ? 'Đơn hàng' : 'Orders'}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Orders by Hour Chart */}
              {ordersByHourData.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    {language === 'vi' ? 'Đơn hàng theo giờ' : 'Orders by Hour'}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ordersByHourData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="hour" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="orders" fill="#3B82F6" name={language === 'vi' ? 'Đơn hàng' : 'Orders'} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Orders by Status Pie Chart */}
              {statusChartData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      {language === 'vi' ? 'Đơn hàng theo trạng thái' : 'Orders by Status'}
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Items Chart */}
                  {topItemsChartData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        {language === 'vi' ? 'Top 10 món bán chạy' : 'Top 10 Selling Items'}
                      </h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topItemsChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" stroke="#6b7280" />
                          <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => value}
                          />
                          <Bar dataKey="quantity" fill="#8B5CF6" name={language === 'vi' ? 'Số lượng' : 'Quantity'} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Top Items Table */}
              {analytics.top_items && analytics.top_items.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {language === 'vi' ? 'Chi tiết món bán chạy' : 'Top Items Details'}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {language === 'vi' ? 'Món' : 'Item'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {language === 'vi' ? 'Số lượng' : 'Quantity'}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            {language === 'vi' ? 'Doanh thu' : 'Revenue'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {analytics.top_items.map((item, index) => (
                          <tr key={item.item_id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {item.item_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {item.quantity_sold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(item.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'vi' ? 'Không có dữ liệu phân tích' : 'No analytics data available'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
