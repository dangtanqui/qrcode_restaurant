import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurants'
import { promotionsApi, Promotion, CreatePromotionData } from '../api/promotions'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, Plus, Edit, Trash2, X, Save, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function PromotionsManager() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['promotions', restaurantId],
    queryFn: () => promotionsApi.getPromotions(restaurantId),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePromotionData) => promotionsApi.createPromotion(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] })
      setShowForm(false)
      setEditingPromotion(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePromotionData> }) =>
      promotionsApi.updatePromotion(restaurantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] })
      setEditingPromotion(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (promotionId: number) => promotionsApi.deletePromotion(restaurantId, promotionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions', restaurantId] })
    },
  })

  const handleDelete = (promotionId: number) => {
    if (confirm(language === 'vi' ? 'Bạn có chắc muốn xóa khuyến mãi này?' : 'Are you sure you want to delete this promotion?')) {
      deleteMutation.mutate(promotionId)
    }
  }

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
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {restaurant?.name} - {language === 'vi' ? 'Khuyến mãi' : 'Promotions'}
              </h1>
            </div>
            <LanguageThemeSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'vi' ? 'Quản lý khuyến mãi' : 'Promotions Management'}
            </h2>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingPromotion(null)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Thêm khuyến mãi' : 'Add Promotion'}
            </button>
          </div>

          {(showForm || editingPromotion) && (
            <PromotionForm
              promotion={editingPromotion}
              onSave={(data) => {
                if (editingPromotion) {
                  updateMutation.mutate({ id: editingPromotion.id, data })
                } else {
                  createMutation.mutate(data)
                }
              }}
              onCancel={() => {
                setShowForm(false)
                setEditingPromotion(null)
              }}
            />
          )}

          {promotions && promotions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'vi' ? 'Chưa có khuyến mãi nào' : 'No promotions yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promotions?.map((promotion) => (
                <div
                  key={promotion.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {promotion.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {promotion.description}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => setEditingPromotion(promotion)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'vi' ? 'Giảm giá' : 'Discount'}
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {promotion.discount_type === 'percentage'
                          ? `${promotion.discount_value}%`
                          : formatCurrency(promotion.discount_value)}
                      </span>
                    </div>

                    {promotion.min_order_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'vi' ? 'Đơn tối thiểu' : 'Min Order'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(promotion.min_order_amount)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(promotion.start_date).toLocaleDateString()} - {new Date(promotion.end_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        promotion.is_active
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {promotion.is_active
                          ? (language === 'vi' ? 'Đang hoạt động' : 'Active')
                          : (language === 'vi' ? 'Không hoạt động' : 'Inactive')}
                      </span>
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

function PromotionForm({
  promotion,
  onSave,
  onCancel,
}: {
  promotion: Promotion | null
  onSave: (data: CreatePromotionData) => void
  onCancel: () => void
}) {
  const { language } = useI18n()
  const { formatCurrency } = useCurrency()
  const [name, setName] = useState(promotion?.name || '')
  const [description, setDescription] = useState(promotion?.description || '')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(promotion?.discount_type || 'percentage')
  const [discountValue, setDiscountValue] = useState(promotion?.discount_value.toString() || '')
  const [minOrderAmount, setMinOrderAmount] = useState(promotion?.min_order_amount?.toString() || '')
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(promotion?.max_discount_amount?.toString() || '')
  const [startDate, setStartDate] = useState(promotion?.start_date.split('T')[0] || '')
  const [endDate, setEndDate] = useState(promotion?.end_date.split('T')[0] || '')
  const [isActive, setIsActive] = useState(promotion?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
      max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
      start_date: startDate,
      end_date: endDate,
      is_active: isActive,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {promotion ? (language === 'vi' ? 'Chỉnh sửa khuyến mãi' : 'Edit Promotion') : (language === 'vi' ? 'Thêm khuyến mãi' : 'Add Promotion')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Tên khuyến mãi' : 'Promotion Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Mô tả' : 'Description'} <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'vi' ? 'Loại giảm giá' : 'Discount Type'}
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
            >
              <option value="percentage">{language === 'vi' ? 'Phần trăm' : 'Percentage'}</option>
              <option value="fixed">{language === 'vi' ? 'Số tiền cố định' : 'Fixed Amount'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'vi' ? 'Giá trị giảm giá' : 'Discount Value'} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step={discountType === 'percentage' ? '1' : '0.01'}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'vi' ? 'Đơn tối thiểu (tùy chọn)' : 'Min Order Amount (optional)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
            />
          </div>

          {discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === 'vi' ? 'Giảm tối đa (tùy chọn)' : 'Max Discount (optional)'}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'vi' ? 'Ngày bắt đầu' : 'Start Date'} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'vi' ? 'Ngày kết thúc' : 'End Date'} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Đang hoạt động' : 'Active'}
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {language === 'vi' ? 'Lưu' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
}

