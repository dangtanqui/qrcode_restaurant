import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/public'
import { useState, useEffect } from 'react'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function PublicMenu() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language } = useI18n()
  const { formatCurrency, convertToUSD, formatUSD } = useCurrency()
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['public-menu', slug],
    queryFn: () => publicApi.getMenu(slug!),
    enabled: !!slug,
  })

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

  const restaurantCurrency = menuData.restaurant.currency || 'VND'
  const exchangeRate = menuData.restaurant.exchange_rate || 25000

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                          !item.is_available ? 'opacity-60' : ''
                        }`}
                      >
                        {item.image_url && (
                          <div className="relative">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className={`w-full h-32 object-cover ${
                                !item.is_available ? 'blur-sm' : ''
                              }`}
                            />
                            {!item.is_available && (
                              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white flex-1">
                              {item.name}
                            </h3>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                              {restaurantCurrency === 'VND' 
                                ? formatCurrency(item.price)
                                : formatCurrency(item.price)}
                            </span>
                            {restaurantCurrency === 'VND' && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ≈ {formatUSD(convertToUSD(item.price, exchangeRate))}
                                <span className="ml-1 text-xs">
                                  ({language === 'vi' ? 'tỷ giá' : 'exchange rate'}: 1 USD = {exchangeRate.toLocaleString()} VND)
                                </span>
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                          {!item.is_available && !item.image_url && (
                            <span className="inline-block mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Category Navigation - Horizontal Tabs */}
      <nav className="hidden lg:block bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[88px] z-40 overflow-x-auto">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-1">
            {menuData.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  const element = document.getElementById(`category-${category.id}`)
                  if (element) {
                    const offset = 200
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - offset
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    })
                  }
                }}
                className="px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Desktop Menu Content */}
      <main className="hidden lg:block max-w-4xl mx-auto px-4 py-6">
        {menuData.categories.map((category) => (
          <div
            key={category.id}
            id={`category-${category.id}`}
            className="mb-8 scroll-mt-32"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                    !item.is_available ? 'opacity-60' : ''
                  }`}
                >
                  {item.image_url && (
                    <div className="relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className={`w-full h-48 object-cover ${
                          !item.is_available ? 'blur-sm' : ''
                        }`}
                      />
                      {!item.is_available && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {restaurantCurrency === 'VND' 
                          ? formatCurrency(item.price)
                          : formatCurrency(item.price)}
                      </span>
                      {restaurantCurrency === 'VND' && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ≈ {formatUSD(convertToUSD(item.price, exchangeRate))}
                          <span className="ml-1 text-xs">
                            ({language === 'vi' ? 'tỷ giá' : 'exchange rate'}: 1 USD = {exchangeRate.toLocaleString()} VND)
                          </span>
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}
                    {!item.is_available && !item.image_url && (
                      <span className="inline-block mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
