import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicApi } from '../api/public'
import { restaurantsApi } from '../api/restaurants'
import { useI18n } from '../contexts/I18nContext'
import { ArrowLeft, Download } from 'lucide-react'

export default function QRGenerator() {
  const { id } = useParams<{ id: string }>()
  const restaurantId = parseInt(id!)
  const navigate = useNavigate()
  const { t } = useI18n()

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
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
                  dangerouslySetInnerHTML={{ __html: qrData.qrcode }}
                />
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('restaurant.scanQR')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 break-all">{qrData.url}</p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={downloadSVG}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('restaurant.downloadSVG')}
                    </button>
                    <button
                      onClick={downloadPNG}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('restaurant.downloadPNG')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}



