import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { restaurantsApi } from '../api/restaurants'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../contexts/I18nContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { Plus, LogOut, Edit, Trash2, QrCode, Menu, X, ShoppingBag } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { t, language } = useI18n()
  const queryClient = useQueryClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: restaurantsApi.getAll,
  })

  const deleteMutation = useMutation({
    mutationFn: restaurantsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; address: string; logo?: File }> }) =>
      restaurantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
    },
  })

  const [editingRestaurant, setEditingRestaurant] = useState<number | null>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsMobileMenuOpen(false)
  }

  const handleDelete = (id: number) => {
    if (confirm(t('dashboard.deleteConfirm'))) {
      deleteMutation.mutate(id)
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
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('dashboard.title')}
              </h1>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageThemeSwitcher />
              <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('auth.logout')}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              {/* Menu Panel */}
              <div className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="py-4 space-y-3 px-4">
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                    <LanguageThemeSwitcher />
                  </div>
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{user?.email}</span>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('auth.logout')}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.myRestaurants')}
            </h2>
            <button
              onClick={() => navigate('/restaurant/setup')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.newRestaurant')}
            </button>
          </div>

          {restaurants && restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('dashboard.noRestaurants')}
              </p>
              <button
                onClick={() => navigate('/restaurant/setup')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('restaurant.create')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants?.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  editing={editingRestaurant === restaurant.id}
                  onEdit={() => setEditingRestaurant(restaurant.id)}
                  onCancel={() => setEditingRestaurant(null)}
                  onUpdate={(data) => {
                    updateMutation.mutate({ id: restaurant.id, data })
                    setEditingRestaurant(null)
                  }}
                  onDelete={() => handleDelete(restaurant.id)}
                  onNavigateMenu={() => navigate(`/restaurant/${restaurant.id}/menu`)}
                  onNavigateOrders={() => navigate(`/restaurant/${restaurant.id}/orders`)}
                  onNavigateQR={() => navigate(`/restaurant/${restaurant.id}/qr`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function RestaurantCard({
  restaurant,
  editing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  onNavigateMenu,
  onNavigateOrders,
  onNavigateQR,
}: {
  restaurant: { id: number; name: string; address: string; logo_url: string | null }
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (data: { name: string; address: string; logo?: File }) => void
  onDelete: () => void
  onNavigateMenu: () => void
  onNavigateOrders: () => void
  onNavigateQR: () => void
}) {
  const { t } = useI18n()
  const [name, setName] = useState(restaurant.name)
  const [address, setAddress] = useState(restaurant.address)
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(restaurant.logo_url)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ name, address, logo: logo || undefined })
  }

  const handleCancel = () => {
    setName(restaurant.name)
    setAddress(restaurant.address)
    setLogo(null)
    setLogoPreview(restaurant.logo_url)
    onCancel()
  }

  if (editing) {
    return (
      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor={`name-${restaurant.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('restaurant.name')}
            </label>
            <input
              type="text"
              id={`name-${restaurant.id}`}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={`address-${restaurant.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('restaurant.address')}
            </label>
            <input
              type="text"
              id={`address-${restaurant.id}`}
              required
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={`logo-${restaurant.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('restaurant.logo')}
            </label>
            <input
              type="file"
              id={`logo-${restaurant.id}`}
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
              onChange={handleLogoChange}
            />
            {logoPreview && (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="mt-4 h-32 w-32 object-cover rounded"
              />
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      {restaurant.logo_url && (
        <img
          src={restaurant.logo_url}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {restaurant.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {restaurant.address}
            </p>
          </div>
          <button
            onClick={onEdit}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 ml-2"
            title={t('common.edit') || 'Edit'}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onNavigateMenu}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            {t('dashboard.editMenu')}
          </button>
          <button
            onClick={onNavigateOrders}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('dashboard.orders')}
          </button>
          <button
            onClick={onNavigateQR}
            className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
