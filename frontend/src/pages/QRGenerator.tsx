import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/public'
import { restaurantsApi } from '../api/restaurants'
import { useI18n } from '../contexts/I18nContext'
import { useTheme } from '../contexts/ThemeContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, Download, Copy, ExternalLink, Printer } from 'lucide-react'
import { useState, useMemo } from 'react'

export default function QRGenerator() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  const { data: qrData } = useQuery({
    queryKey: ['qrcode', restaurant?.slug],
    queryFn: () => publicApi.getQRCode(restaurant!.slug),
    enabled: !!restaurant?.slug,
  })

  const downloadSVG = () => {
    if (!qrData) return
    const blob = new Blob([qrData.qrcode], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${restaurant?.slug}-qrcode.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadPNG = () => {
    if (!qrData) return
    const svg = qrData.qrcode
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = `${restaurant?.slug}-qrcode.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(pngUrl)
        }
      })
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const copyLink = async () => {
    if (!qrData) return
    try {
      await navigator.clipboard.writeText(qrData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openLink = () => {
    if (!qrData) return
    window.open(qrData.url, '_blank')
  }

  const printQR = () => {
    window.print()
  }

  // Adjust QR code colors based on theme using CSS filter
  // In dark mode, we invert the QR code so it appears white on dark background
  const qrCodeStyle = useMemo(() => {
    return {
      filter: theme === 'dark' ? 'invert(1)' : 'none',
    }
  }, [theme])

  return (
    <>
      {/* Print-only content */}
      <div className="hidden print:block print:fixed print:inset-0 print:flex print:items-center print:justify-center print:bg-white">
        <div className="text-center p-8">
          {restaurant?.logo_url && (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="mx-auto mb-4 max-w-32 max-h-32 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-black mb-2">{restaurant?.name}</h1>
          <p className="text-lg text-black mb-1">{restaurant?.address}</p>
          {restaurant?.phone && (
            <p className="text-lg text-black mb-6">{restaurant.phone}</p>
          )}
          {qrData && (
            <div
              className="flex justify-center mb-4"
              dangerouslySetInnerHTML={{ __html: qrData.qrcode }}
            />
          )}
        </div>
      </div>

      {/* Screen content */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 print:hidden">
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
                  {t('restaurant.qrTitle')}
                </h1>
              </div>
              <LanguageThemeSwitcher />
            </div>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {restaurant?.name} - {t('restaurant.qrTitle')}
              </h2>

              {qrData && (
                <div className="space-y-4">
                  <div
                    className="flex justify-center"
                    style={qrCodeStyle}
                    dangerouslySetInnerHTML={{ __html: qrData.qrcode }}
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('restaurant.scanQR')}
                    </p>
                    <div className="mb-4">
                      <div className="relative inline-block group">
                        <p className="text-xs text-gray-500 dark:text-gray-500 break-all max-w-md cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{qrData.url}</p>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 z-10 whitespace-nowrap">
                          <button
                            onClick={copyLink}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Sao chép' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={openLink}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{language === 'vi' ? 'Mở link' : 'Open'}</span>
                          </button>
                        </div>
                      </div>
                      {copied && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">
                          {language === 'vi' ? 'Đã sao chép!' : 'Copied!'}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-center flex-wrap gap-3">
                      <button
                        onClick={downloadSVG}
                        className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-transparent hover:opacity-80 transition-opacity"
                        style={{
                          borderColor: '#3B82F6',
                          color: '#3B82F6',
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('restaurant.downloadSVG')}
                      </button>
                      <button
                        onClick={downloadPNG}
                        className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-transparent hover:opacity-80 transition-opacity"
                        style={{
                          borderColor: '#10B981',
                          color: '#10B981',
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t('restaurant.downloadPNG')}
                      </button>
                      <button
                        onClick={printQR}
                        className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md bg-transparent hover:opacity-80 transition-opacity"
                        style={{
                          borderColor: '#8B5CF6',
                          color: '#8B5CF6',
                        }}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        {language === 'vi' ? 'In' : 'Print'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}



