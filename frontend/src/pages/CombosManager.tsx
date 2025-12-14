import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurants'
import { combosApi, Combo, CreateComboData } from '../api/combos'
import { menuApi, Item } from '../api/menu'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

export default function CombosManager() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const { formatCurrency } = useCurrency()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  const { data: combos, isLoading } = useQuery({
    queryKey: ['combos', restaurantId],
    queryFn: () => combosApi.getCombos(restaurantId),
  })

  const { data: menu } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => menuApi.getMenu(restaurantId),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateComboData) => combosApi.createCombo(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos', restaurantId] })
      setShowForm(false)
      setEditingCombo(null)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateComboData> }) =>
      combosApi.updateCombo(restaurantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos', restaurantId] })
      setEditingCombo(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (comboId: number) => combosApi.deleteCombo(restaurantId, comboId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos', restaurantId] })
    },
  })

  const handleDelete = (comboId: number) => {
    if (confirm(language === 'vi' ? 'Bạn có chắc muốn xóa combo này?' : 'Are you sure you want to delete this combo?')) {
      deleteMutation.mutate(comboId)
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
                {restaurant?.name} - {language === 'vi' ? 'Combo' : 'Combos'}
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
              {language === 'vi' ? 'Quản lý Combo' : 'Combos Management'}
            </h2>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingCombo(null)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Thêm Combo' : 'Add Combo'}
            </button>
          </div>

          {(showForm || editingCombo) && (
            <ComboForm
              combo={editingCombo}
              menu={menu}
              onSave={(data) => {
                if (editingCombo) {
                  updateMutation.mutate({ id: editingCombo.id, data })
                } else {
                  createMutation.mutate(data)
                }
              }}
              onCancel={() => {
                setShowForm(false)
                setEditingCombo(null)
              }}
            />
          )}

          {combos && combos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {language === 'vi' ? 'Chưa có combo nào' : 'No combos yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combos?.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                >
                  {combo.image_url && (
                    <img
                      src={combo.image_url}
                      alt={combo.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {combo.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {combo.description}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => setEditingCombo(combo)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(combo.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'vi' ? 'Giá combo' : 'Combo Price'}
                        </span>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(combo.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'vi' ? 'Giá gốc' : 'Original Price'}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          {formatCurrency(combo.total_original_price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {language === 'vi' ? 'Tiết kiệm' : 'Savings'}
                        </span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(combo.savings)} ({combo.savings_percentage}%)
                        </span>
                      </div>

                      {combo.items && combo.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {language === 'vi' ? 'Bao gồm:' : 'Includes:'}
                          </p>
                          <ul className="space-y-1">
                            {combo.items.map((item) => (
                              <li key={item.id} className="text-xs text-gray-600 dark:text-gray-400">
                                • {item.item_name} × {item.quantity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          combo.is_available
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {combo.is_available
                            ? (language === 'vi' ? 'Có sẵn' : 'Available')
                            : (language === 'vi' ? 'Không có sẵn' : 'Unavailable')}
                        </span>
                      </div>
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

function ComboForm({
  combo,
  menu,
  onSave,
  onCancel,
}: {
  combo: Combo | null
  menu: any
  onSave: (data: CreateComboData) => void
  onCancel: () => void
}) {
  const { language } = useI18n()
  const { formatCurrency } = useCurrency()
  const [name, setName] = useState(combo?.name || '')
  const [description, setDescription] = useState(combo?.description || '')
  const [price, setPrice] = useState(combo?.price.toString() || '')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(combo?.image_url || null)
  const [selectedItems, setSelectedItems] = useState<Array<{ item_id: number; quantity: number }>>(
    combo?.items.map(item => ({ item_id: item.item_id, quantity: item.quantity })) || []
  )
  const [isAvailable, setIsAvailable] = useState(combo?.is_available ?? true)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = () => {
    setSelectedItems([...selectedItems, { item_id: 0, quantity: 1 }])
  }

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: 'item_id' | 'quantity', value: number) => {
    const updated = [...selectedItems]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedItems(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItems.length === 0) {
      alert(language === 'vi' ? 'Vui lòng thêm ít nhất một món vào combo' : 'Please add at least one item to the combo')
      return
    }
    onSave({
      name,
      description,
      price: parseFloat(price),
      image: image || undefined,
      items: selectedItems.filter(item => item.item_id > 0),
      is_available: isAvailable,
    })
  }

  const allItems = menu?.categories?.flatMap((cat: any) => cat.items) || []

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {combo ? (language === 'vi' ? 'Chỉnh sửa Combo' : 'Edit Combo') : (language === 'vi' ? 'Thêm Combo' : 'Add Combo')}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Tên Combo' : 'Combo Name'} <span className="text-red-500">*</span>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Giá Combo' : 'Combo Price'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Hình ảnh' : 'Image'}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-4 h-32 w-32 object-cover rounded"
            />
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'vi' ? 'Món trong Combo' : 'Combo Items'}
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              {language === 'vi' ? 'Thêm món' : 'Add Item'}
            </button>
          </div>
          <div className="space-y-2">
            {selectedItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  required
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={item.item_id}
                  onChange={(e) => handleItemChange(index, 'item_id', parseInt(e.target.value))}
                >
                  <option value="0">{language === 'vi' ? 'Chọn món' : 'Select Item'}</option>
                  {allItems.map((menuItem: Item) => (
                    <option key={menuItem.id} value={menuItem.id}>
                      {menuItem.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-20 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_available"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Có sẵn' : 'Available'}
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

