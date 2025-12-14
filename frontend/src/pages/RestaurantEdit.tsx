import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { restaurantsApi } from '../api/restaurants'
import { useI18n } from '../contexts/I18nContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import CustomSelect from '../components/CustomSelect'
import { ArrowLeft, ChevronDown } from 'lucide-react'

export default function RestaurantEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, language } = useI18n()
  const queryClient = useQueryClient()
  const restaurantId = parseInt(id!)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [logo, setLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<File | null>(null)
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null)
  const [grandOpeningDate, setGrandOpeningDate] = useState('')
  const [grandOpeningMessage, setGrandOpeningMessage] = useState('')
  const [isGrandOpening, setIsGrandOpening] = useState(false)
  const [headerNote, setHeaderNote] = useState('')
  const [footnote, setFootnote] = useState('')
  const [themeColor, setThemeColor] = useState('#4F46E5')
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF')
  const [textColor, setTextColor] = useState('#000000')
  const [buttonTextColor, setButtonTextColor] = useState('#FFFFFF')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [buttonStyle, setButtonStyle] = useState<'rounded-border' | 'rounded-filled' | 'rounded-lg-border' | 'rounded-lg-filled' | 'rounded-full-border' | 'rounded-full-filled'>('rounded-full-border')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', restaurantId],
    queryFn: () => restaurantsApi.getOne(restaurantId),
  })

  useEffect(() => {
    if (restaurant) {
      console.log('Loading restaurant data:', restaurant)
      setName(restaurant.name || '')
      setAddress(restaurant.address || '')
      setPhone(restaurant.phone || '')
      setLogoPreview(restaurant.logo_url)
      // Migrate old button style values to new format
      const oldStyle = restaurant.button_style as string
      let newStyle: 'rounded-border' | 'rounded-filled' | 'rounded-lg-border' | 'rounded-lg-filled' | 'rounded-full-border' | 'rounded-full-filled' = 'rounded-full-border'
      if (oldStyle) {
        // If already in new format, use as is
        if (['rounded-border', 'rounded-filled', 'rounded-lg-border', 'rounded-lg-filled', 'rounded-full-border', 'rounded-full-filled'].includes(oldStyle)) {
          newStyle = oldStyle as any
        } else {
          // Migrate old format: default to border style
          if (oldStyle === 'rounded') newStyle = 'rounded-border'
          else if (oldStyle === 'rounded-lg') newStyle = 'rounded-lg-border'
          else if (oldStyle === 'rounded-full') newStyle = 'rounded-full-border'
        }
      }
      setButtonStyle(newStyle)
      setFontFamily(restaurant.font_family || 'Inter')
      setThemeColor(restaurant.theme_color || '#4F46E5')
      setBackgroundColor(restaurant.background_color || '#FFFFFF')
      setTextColor(restaurant.text_color || '#000000')
      setButtonTextColor(restaurant.button_text_color || '#FFFFFF')
      // Format date properly
      if (restaurant.grand_opening_date) {
        const dateStr = typeof restaurant.grand_opening_date === 'string' 
          ? restaurant.grand_opening_date.split('T')[0]
          : restaurant.grand_opening_date
        setGrandOpeningDate(dateStr || '')
      } else {
        setGrandOpeningDate('')
      }
      setGrandOpeningMessage(restaurant.grand_opening_message || '')
      setIsGrandOpening(restaurant.is_grand_opening || false)
      setHeaderNote(restaurant.header_note || '')
      setFootnote(restaurant.footnote || '')
      setFacebookUrl(restaurant.facebook_url || '')
      setTiktokUrl(restaurant.tiktok_url || '')
      setInstagramUrl(restaurant.instagram_url || '')
      if (restaurant.qr_code_url) {
        setQrCodePreview(restaurant.qr_code_url)
      }
    }
  }, [restaurant])

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Send data as object - restaurantsApi.update will handle JSON and FormData separately
      return restaurantsApi.update(restaurantId, data)
    },
    onSuccess: (data) => {
      console.log('Update successful, response:', data)
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] })
      queryClient.invalidateQueries({ queryKey: ['restaurants'] })
      // Wait a bit before navigating to ensure cache is updated
      setTimeout(() => {
        navigate('/dashboard')
      }, 100)
    },
    onError: (error) => {
      console.error('Update failed:', error)
    },
  })

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

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrCode(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrCodePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      name,
      address,
      phone,
      logo: logo || undefined,
      qr_code: qrCode || undefined,
      button_style: buttonStyle,
      font_family: fontFamily,
      theme_color: themeColor,
      background_color: backgroundColor,
      text_color: textColor,
      button_text_color: buttonTextColor,
      grand_opening_date: grandOpeningDate || undefined,
      grand_opening_message: grandOpeningMessage || undefined,
      is_grand_opening: isGrandOpening,
      header_note: headerNote || undefined,
      footnote: footnote || undefined,
      facebook_url: facebookUrl || undefined,
      tiktok_url: tiktokUrl || undefined,
      instagram_url: instagramUrl || undefined,
    }
    console.log('Submitting data:', submitData)
    mutation.mutate(submitData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
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
                {t('restaurant.edit') || 'Edit Restaurant'}
              </h1>
            </div>
            <LanguageThemeSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'vi' ? 'Thông tin cơ bản' : 'Basic Information'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('restaurant.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('restaurant.address')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Số điện thoại' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('restaurant.logo')}
                  </label>
                  <input
                    type="file"
                    id="logo"
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

                <div>
                  <label htmlFor="qr_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'QR Code thanh toán' : 'Payment QR Code'}
                  </label>
                  <input
                    type="file"
                    id="qr_code"
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                    onChange={handleQrCodeChange}
                  />
                  {qrCodePreview && (
                    <img
                      src={qrCodePreview}
                      alt="QR Code preview"
                      className="mt-4 h-32 w-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Grand Opening */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'vi' ? 'Khai trương' : 'Grand Opening'}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_grand_opening"
                    checked={isGrandOpening}
                    onChange={(e) => setIsGrandOpening(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_grand_opening" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Hiển thị banner khai trương' : 'Show grand opening banner'}
                  </label>
                </div>

                {isGrandOpening && (
                  <>
                    <div>
                      <label htmlFor="grand_opening_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {language === 'vi' ? 'Ngày khai trương' : 'Opening Date'}
                      </label>
                      <input
                        type="date"
                        id="grand_opening_date"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={grandOpeningDate}
                        onChange={(e) => setGrandOpeningDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="grand_opening_message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {language === 'vi' ? 'Thông điệp khai trương' : 'Opening Message'}
                      </label>
                      <textarea
                        id="grand_opening_message"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={grandOpeningMessage}
                        onChange={(e) => setGrandOpeningMessage(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Display Information */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'vi' ? 'Thông tin hiển thị' : 'Display Information'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="header_note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Ghi chú đầu trang' : 'Header Note'}
                  </label>
                  <textarea
                    id="header_note"
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={headerNote}
                    onChange={(e) => setHeaderNote(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="footnote" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Ghi chú cuối trang' : 'Foot Note'}
                  </label>
                  <textarea
                    id="footnote"
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={footnote}
                    onChange={(e) => setFootnote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Brand Customization */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'vi' ? 'Tùy chỉnh thương hiệu' : 'Brand Customization'}
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="theme_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'vi' ? 'Màu chủ đề' : 'Theme Color'}
                    </label>
                    <div className="relative inline-block w-full max-w-[200px]">
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        id="theme_color"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 cursor-pointer border-0 rounded"
                        style={{ backgroundColor: themeColor }}
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="background_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'vi' ? 'Màu nền' : 'Background Color'}
                    </label>
                    <div className="relative inline-block w-full max-w-[200px]">
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#FFFFFF"
                      />
                      <input
                        type="color"
                        id="background_color"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 cursor-pointer border-0 rounded"
                        style={{ backgroundColor: backgroundColor }}
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="text_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'vi' ? 'Màu chữ' : 'Text Color'}
                    </label>
                    <div className="relative inline-block w-full max-w-[200px]">
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        id="text_color"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 cursor-pointer border-0 rounded"
                        style={{ backgroundColor: textColor }}
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="button_text_color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {language === 'vi' ? 'Màu chữ nút' : 'Button Text Color'}
                    </label>
                    <div className="relative inline-block w-full max-w-[200px]">
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 pl-3 pr-12 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={buttonTextColor}
                        onChange={(e) => setButtonTextColor(e.target.value)}
                        placeholder="#FFFFFF"
                      />
                      <input
                        type="color"
                        id="button_text_color"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 cursor-pointer border-0 rounded"
                        style={{ backgroundColor: buttonTextColor }}
                        value={buttonTextColor}
                        onChange={(e) => setButtonTextColor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'vi' ? 'Kiểu nút' : 'Button Style'}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: 'rounded-border', rounded: 'rounded', label: language === 'vi' ? 'Vuông viền' : 'Square Border' },
                      { value: 'rounded-filled', rounded: 'rounded', label: language === 'vi' ? 'Vuông đầy' : 'Square Filled' },
                      { value: 'rounded-lg-border', rounded: 'rounded-lg', label: language === 'vi' ? 'Bo tròn viền' : 'Rounded Border' },
                      { value: 'rounded-lg-filled', rounded: 'rounded-lg', label: language === 'vi' ? 'Bo tròn đầy' : 'Rounded Filled' },
                      { value: 'rounded-full-border', rounded: 'rounded-full', label: language === 'vi' ? 'Full bo tròn viền' : 'Full Rounded Border' },
                      { value: 'rounded-full-filled', rounded: 'rounded-full', label: language === 'vi' ? 'Full bo tròn đầy' : 'Full Rounded Filled' },
                    ] as const).map((style) => (
                      <label key={style.value} className="relative group cursor-pointer">
                        <input
                          type="radio"
                          name="button_style"
                          value={style.value}
                          checked={buttonStyle === style.value}
                          onChange={() => setButtonStyle(style.value)}
                          className="sr-only"
                        />
                        <div 
                          className={`flex flex-col items-center gap-2 px-3 py-3 border-2 ${buttonStyle === style.value ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'} rounded-lg transition-all`}
                        >
                          <button
                            type="button"
                            className={`px-4 py-2 ${style.rounded} pointer-events-none`}
                            style={style.value.includes('border') ? {
                              color: themeColor,
                              borderColor: themeColor,
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              backgroundColor: 'transparent'
                            } : {
                              backgroundColor: themeColor,
                              color: buttonTextColor,
                              borderWidth: '0px'
                            }}
                            disabled
                          >
                            {language === 'vi' ? 'Mẫu' : 'Sample'}
                          </button>
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                            {style.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="font_family" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'vi' ? 'Phông chữ' : 'Font Family'}
                  </label>
                  <CustomSelect
                    id="font_family"
                    value={fontFamily}
                    onChange={setFontFamily}
                    options={[
                      { value: 'Inter', label: 'Inter' },
                      { value: 'Roboto', label: 'Roboto' },
                      { value: 'Open Sans', label: 'Open Sans' },
                      { value: 'Lato', label: 'Lato' },
                      { value: 'Montserrat', label: 'Montserrat' },
                      { value: 'Poppins', label: 'Poppins' },
                      { value: 'Playfair Display', label: 'Playfair Display' },
                      { value: 'Merriweather', label: 'Merriweather' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'vi' ? 'Mạng xã hội' : 'Social Media'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    id="facebook_url"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="tiktok_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    id="tiktok_url"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    id="instagram_url"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {mutation.isError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
                {mutation.error instanceof Error ? mutation.error.message : t('common.error') || 'An error occurred'}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50"
              >
                {mutation.isPending ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') : (language === 'vi' ? 'Lưu' : 'Save')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
