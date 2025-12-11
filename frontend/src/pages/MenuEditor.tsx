import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi, Category, Item } from '../api/menu'
import { restaurantsApi } from '../api/restaurants'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPriceInput, parsePriceInput } from '../utils/currency'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, Plus, Edit, Trash2, X, Save } from 'lucide-react'

export default function MenuEditor() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t, language } = useI18n()
  const { currency, formatCurrency } = useCurrency()

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  const { data: menu, isLoading, error } = useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => menuApi.getMenu(restaurantId),
    retry: false,
    refetchOnWindowFocus: false,
  })
  
  // Auto-create menu if it doesn't exist (only once)
  const createMenuMutation = useMutation({
    mutationFn: () => menuApi.createMenu(restaurantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
    },
    onError: (err) => {
      console.error('Failed to create menu:', err)
    },
  })
  
  // Create menu if 404 error (only once, prevent infinite loop)
  useEffect(() => {
    const errorStatus = (error as any)?.response?.status
    if (
      errorStatus === 404 && 
      !createMenuMutation.isPending && 
      !createMenuMutation.isSuccess &&
      !createMenuMutation.isError
    ) {
      console.log('Menu not found, creating...')
      createMenuMutation.mutate()
    }
  }, [error]) // Only depend on error, not on mutation state

  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState<number | null>(null)

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => menuApi.createCategory(menu!.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
      setShowCategoryForm(false)
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      menuApi.updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
      setEditingCategory(null)
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: menuApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
    },
  })

  const createItemMutation = useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: number; data: any }) =>
      menuApi.createItem(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
      setShowItemForm(null)
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => menuApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
      setEditingItem(null)
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: menuApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
    },
  })

  const toggleItemAvailability = (item: Item) => {
    updateItemMutation.mutate({
      id: item.id,
      data: { is_available: !item.is_available },
    })
  }

  if (isLoading || createMenuMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">{t('common.loading')}</div>
      </div>
    )
  }

  if (error && !createMenuMutation.isPending && createMenuMutation.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">
          <p>Failed to load menu. Please try again.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  // Show empty state if menu doesn't exist yet
  if (!menu) {
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
                  {restaurant?.name} - {t('restaurant.menu')}
                </h1>
              </div>
              <LanguageThemeSwitcher />
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>{t('common.loading')}</p>
            </div>
          </div>
        </main>
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
                {restaurant?.name} - {t('restaurant.menu')}
              </h1>
            </div>
            <LanguageThemeSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('menu.categories')}</h2>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('menu.addCategory')}
            </button>
          </div>

          {showCategoryForm && (
            <CategoryForm
              onSubmit={(name) => createCategoryMutation.mutate(name)}
              onCancel={() => setShowCategoryForm(false)}
            />
          )}

          <div className="space-y-6">
            {menu && menu.categories && menu.categories.length > 0 ? (
              menu.categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                editingCategory={editingCategory}
                setEditingCategory={setEditingCategory}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                showItemForm={showItemForm}
                setShowItemForm={setShowItemForm}
                onUpdateCategory={(name) =>
                  updateCategoryMutation.mutate({ id: category.id, name })
                }
                onDeleteCategory={() => {
                  if (confirm(t('menu.deleteCategory'))) {
                    deleteCategoryMutation.mutate(category.id)
                  }
                }}
                onCreateItem={(data) =>
                  createItemMutation.mutate({ categoryId: category.id, data })
                }
                onUpdateItem={(id, data) => updateItemMutation.mutate({ id, data })}
                onDeleteItem={(id) => {
                  if (confirm(t('menu.deleteItem'))) {
                    deleteItemMutation.mutate(id)
                  }
                }}
                onToggleAvailability={toggleItemAvailability}
              />
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>{t('menu.noCategories')}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function CategoryForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (name: string) => void
  onCancel: () => void
}) {
  const { t } = useI18n()
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name)
      setName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('menu.categoryName')}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        autoFocus
      />
      <div className="mt-2 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {t('common.add')}
        </button>
      </div>
    </form>
  )
}

function CategorySection({
  category,
  editingCategory,
  setEditingCategory,
  editingItem,
  setEditingItem,
  showItemForm,
  setShowItemForm,
  onUpdateCategory,
  onDeleteCategory,
  onCreateItem,
  onUpdateItem,
  onDeleteItem,
  onToggleAvailability,
}: {
  category: Category
  editingCategory: number | null
  setEditingCategory: (id: number | null) => void
  editingItem: number | null
  setEditingItem: (id: number | null) => void
  showItemForm: number | null
  setShowItemForm: (id: number | null) => void
  onUpdateCategory: (name: string) => void
  onDeleteCategory: () => void
  onCreateItem: (data: any) => void
  onUpdateItem: (id: number, data: any) => void
  onDeleteItem: (id: number) => void
  onToggleAvailability: (item: Item) => void
}) {
  const { t } = useI18n()
  const [categoryName, setCategoryName] = useState(category.name)

  if (editingCategory === category.id) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 mb-4"
          autoFocus
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              setEditingCategory(null)
              setCategoryName(category.name)
            }}
            className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => {
              onUpdateCategory(categoryName)
            }}
            className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingCategory(category.id)}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDeleteCategory}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {category.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            editing={editingItem === item.id}
            onEdit={() => setEditingItem(item.id)}
            onCancel={() => setEditingItem(null)}
            onUpdate={(data) => onUpdateItem(item.id, data)}
            onDelete={() => onDeleteItem(item.id)}
            onToggleAvailability={() => onToggleAvailability(item)}
          />
        ))}

        {showItemForm === category.id ? (
          <ItemForm
            onSubmit={onCreateItem}
            onCancel={() => setShowItemForm(null)}
          />
        ) : (
          <button
            onClick={() => setShowItemForm(category.id)}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('menu.addItem')}
          </button>
        )}
      </div>
    </div>
  )
}

function ItemCard({
  item,
  editing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  onToggleAvailability,
}: {
  item: Item
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
  onToggleAvailability: () => void
}) {
  const { t, language } = useI18n()
  const { currency, formatCurrency } = useCurrency()
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(formatPriceInput(item.price, currency))
  const [description, setDescription] = useState(item.description || '')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item.image_url || null)
  
  const handlePriceChange = (value: string) => {
    // Remove all non-numeric characters except dots/commas
    const cleaned = value.replace(/[^\d.,]/g, '')
    
    if (currency === 'VND') {
      // For VND: remove dots, parse number, then format with dots
      const numValue = cleaned.replace(/\./g, '')
      if (numValue === '') {
        setPrice('')
        return
      }
      const num = parseInt(numValue) || 0
      // Format with dots as thousand separators
      const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      setPrice(formatted)
    } else {
      // For USD: allow decimal point
      setPrice(cleaned)
    }
  }
  
  const handleImageChange = (file: File | null) => {
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(item.image_url || null)
    }
  }

  if (editing) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('menu.itemName')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('menu.price')} ({currency})
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder={currency === 'VND' ? '100.000' : '10.50'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('menu.description')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('menu.image') || 'Image'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-700 dark:text-gray-300 mb-2"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                const numPrice = parsePriceInput(price, currency)
                onUpdate({
                  name,
                  price: numPrice,
                  description,
                  image,
                })
                onCancel()
              }}
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border rounded-lg p-4 ${
        item.is_available
          ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 opacity-60'
      }`}
    >
      <div className="flex space-x-4">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-24 h-24 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(item.price)}
              </p>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={item.is_available}
                onChange={onToggleAvailability}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('menu.available')}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function ItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: any) => void
  onCancel: () => void
}) {
  const { t } = useI18n()
  const { currency } = useCurrency()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const handlePriceChange = (value: string) => {
    // Remove all non-numeric characters except dots/commas
    const cleaned = value.replace(/[^\d.,]/g, '')
    
    if (currency === 'VND') {
      // For VND: remove dots, parse number, then format with dots
      const numValue = cleaned.replace(/\./g, '')
      if (numValue === '') {
        setPrice('')
        return
      }
      const num = parseInt(numValue) || 0
      // Format with dots as thousand separators
      const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      setPrice(formatted)
    } else {
      // For USD: allow decimal point
      setPrice(cleaned)
    }
  }
  
  const handleImageChange = (file: File | null) => {
    setImage(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && price) {
      const numPrice = parsePriceInput(price, currency)
      onSubmit({
        name,
        price: numPrice,
        description: description || undefined,
        image: image || undefined,
      })
      setName('')
      setPrice('')
      setDescription('')
      setImage(null)
      setImagePreview(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('menu.itemName')}
        required
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('menu.price')} ({currency})
        </label>
        <input
          type="text"
          value={price}
          onChange={(e) => handlePriceChange(e.target.value)}
          placeholder={currency === 'VND' ? '100.000' : '10.50'}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={t('menu.description')}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        rows={3}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('menu.image') || 'Image'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-700 dark:text-gray-300 mb-2"
        />
        {imagePreview && (
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
            />
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {t('common.add')}
        </button>
      </div>
    </form>
  )
}



