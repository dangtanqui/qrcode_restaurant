import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { restaurantsApi } from '../api/restaurants'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../contexts/I18nContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { Plus, LogOut, Edit, Trash2, QrCode, Menu, X, ShoppingBag, TrendingUp, Gift, Ticket, Package } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { t } = useI18n()
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
      <nav className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
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
                  onDelete={() => handleDelete(restaurant.id)}
                  onNavigateMenu={() => navigate(`/restaurant/${restaurant.id}/menu`)}
                  onNavigateOrders={() => navigate(`/restaurant/${restaurant.id}/orders`)}
                  onNavigateQR={() => navigate(`/restaurant/${restaurant.id}/qr`)}
                  onNavigateEdit={() => navigate(`/restaurant/${restaurant.id}/edit`)}
                  onNavigateAnalytics={() => navigate(`/restaurant/${restaurant.id}/analytics`)}
                  onNavigatePromotions={() => navigate(`/restaurant/${restaurant.id}/promotions`)}
                  onNavigateVouchers={() => navigate(`/restaurant/${restaurant.id}/vouchers`)}
                  onNavigateCombos={() => navigate(`/restaurant/${restaurant.id}/combos`)}
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
  onDelete,
  onNavigateMenu,
  onNavigateOrders,
  onNavigateQR,
  onNavigateEdit,
  onNavigateAnalytics,
  onNavigatePromotions,
  onNavigateVouchers,
  onNavigateCombos,
}: {
  restaurant: { id: number; name: string; address: string; logo_url: string | null; qr_code_url?: string | null }
  onDelete: () => void
  onNavigateMenu: () => void
  onNavigateOrders: () => void
  onNavigateQR: () => void
  onNavigateEdit: () => void
  onNavigateAnalytics: () => void
  onNavigatePromotions: () => void
  onNavigateVouchers: () => void
  onNavigateCombos: () => void
}) {
  const { t, language } = useI18n()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg flex flex-col h-full">
      {restaurant.logo_url ? (
        <img
          src={restaurant.logo_url}
          alt={restaurant.name}
          className="w-full h-48 object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-full h-48 bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center flex-shrink-0">
          <span className="text-4xl font-bold text-white">
            {getInitials(restaurant.name)}
          </span>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1 min-h-0">
        <div className="flex justify-between items-start mb-2 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {restaurant.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {restaurant.address}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-shrink-0">
            <button
              onClick={onNavigateEdit}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
              title={language === 'vi' ? 'Sửa nhà hàng' : 'Edit Restaurant'}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              title={t('common.delete') || 'Delete'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="mt-auto space-y-2 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
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
              title={language === 'vi' ? 'QR Code Menu' : 'Menu QR Code'}
            >
              <QrCode className="w-4 h-4 mr-2" />
              <span>{language === 'vi' ? 'QR Menu' : 'QR Menu'}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onNavigateAnalytics}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 dark:border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title={language === 'vi' ? 'Phân tích' : 'Analytics'}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Phân tích' : 'Analytics'}
            </button>
            <button
              onClick={onNavigatePromotions}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-purple-300 dark:border-purple-600 shadow-sm text-sm font-medium rounded-md text-purple-700 dark:text-purple-400 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              title={language === 'vi' ? 'Khuyến mãi' : 'Promotions'}
            >
              <Gift className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Khuyến mãi' : 'Promotions'}
            </button>
            <button
              onClick={onNavigateVouchers}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-orange-300 dark:border-orange-600 shadow-sm text-sm font-medium rounded-md text-orange-700 dark:text-orange-400 bg-white dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              title={language === 'vi' ? 'Voucher' : 'Vouchers'}
            >
              <Ticket className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Voucher' : 'Vouchers'}
            </button>
            <button
              onClick={onNavigateCombos}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-pink-300 dark:border-pink-600 shadow-sm text-sm font-medium rounded-md text-pink-700 dark:text-pink-400 bg-white dark:bg-gray-700 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              title={language === 'vi' ? 'Combo' : 'Combos'}
            >
              <Package className="w-4 h-4 mr-2" />
              {language === 'vi' ? 'Combo' : 'Combos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
