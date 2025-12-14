import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { publicApi } from '../api/public'
import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { useTheme } from '../contexts/ThemeContext'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { Plus, Minus, CreditCard, QrCode, Star, LayoutGrid, List, Square, Search, MapPin, Heart, Facebook, Instagram } from 'lucide-react'

interface CartItem {
  item_id: number
  name: string
  price: number
  quantity: number
  image_url?: string | null
}

// CommentItem component moved outside to prevent re-creation on every render
interface CommentItemProps {
  comment: any
  depth?: number
  language: string
  themeColor: string
  likedReviews: Map<number, number>
  toggleLike: (id: number) => void
  setReplyingTo: (value: { id: number; name: string; isReply?: boolean } | null) => void
  setReplyText: (value: string) => void
  setReplyAuthorName: (value: string) => void
  replyingTo: { id: number; name: string; isReply?: boolean } | null
  replyText: string
  replyAuthorName: string
  createReplyMutation: any
  getButtonClassName: (classes: string) => string
  getThemeButtonStyle: () => React.CSSProperties
  highlightTaggedNames: (text: string) => React.ReactNode
  boldTaggedNamesInInput: (text: string) => React.ReactNode
}

const CommentItem = ({ 
  comment, 
  depth = 0,
  language,
  themeColor,
  likedReviews,
  toggleLike,
  setReplyingTo,
  setReplyText,
  setReplyAuthorName,
  replyingTo,
  replyText,
  replyAuthorName,
  createReplyMutation,
  getButtonClassName,
  getThemeButtonStyle,
  highlightTaggedNames,
  boldTaggedNamesInInput,
}: CommentItemProps) => {
  const isReply = depth > 0
  const hasReplies = comment.replies && comment.replies.length > 0
  const isReplying = replyingTo?.id === comment.id

  return (
    <div className={`${!isReply ? 'border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0' : ''}`}>
      <div className={`${isReply ? 'ml-4 mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className={`${isReply ? 'text-sm' : ''} font-semibold text-gray-900 dark:text-white`}>
              {comment.customer_name || (language === 'vi' ? 'Ẩn danh' : 'Anonymous')}
            </h4>
            {!isReply && comment.rating && (
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= comment.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <span className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
            {new Date(comment.created_at).toLocaleDateString(
              language === 'vi' ? 'vi-VN' : 'en-US'
            )}
          </span>
        </div>
        {comment.comment && (
          <p className={`${isReply ? 'text-sm' : ''} text-gray-700 dark:text-gray-300 mt-2`}>
            {highlightTaggedNames(comment.comment)}
          </p>
        )}
        
        {/* Like and Reply buttons - always below comment */}
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => toggleLike(comment.id)}
            className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity"
            style={{ color: (likedReviews.get(comment.id) || 0) > 0 ? '#ef4444' : themeColor }}
          >
            <Heart 
              className={`w-4 h-4 ${(likedReviews.get(comment.id) || 0) > 0 ? 'fill-current' : ''}`}
            />
            <span>
              {language === 'vi' ? 'Thích' : 'Like'}
              {(likedReviews.get(comment.id) || 0) > 0 && (
                <span className="ml-1">({likedReviews.get(comment.id)})</span>
              )}
            </span>
          </button>
          <button
            onClick={() => {
              setReplyingTo({ id: comment.id, name: comment.customer_name, isReply: isReply })
              setReplyText(`@${comment.customer_name} `)
              setReplyAuthorName('')
            }}
            className="text-sm hover:opacity-80"
            style={{ color: themeColor }}
          >
            {language === 'vi' ? 'Trả lời' : 'Reply'}
          </button>
        </div>
        
        {/* Reply form */}
        {isReplying && (
          <div className="mt-3 ml-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'vi' ? 'Tên của bạn' : 'Your Name'} ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
                </label>
                <input
                  key={`reply-author-${comment.id}`}
                  type="text"
                  value={replyAuthorName}
                  onChange={(e) => setReplyAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder={language === 'vi' ? 'Nhập tên của bạn (để trống nếu ẩn danh)' : 'Enter your name (leave blank for anonymous)'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'vi' ? 'Trả lời' : 'Reply'} *
                </label>
                <div className="relative">
                  {/* Bold overlay for tags */}
                  <div 
                    className="absolute pointer-events-none whitespace-pre-wrap break-words text-sm rounded-lg border border-transparent"
                    style={{ 
                      top: '1px',
                      left: '1px',
                      right: '1px',
                      bottom: '1px',
                      padding: '0.5rem 0.75rem',
                      lineHeight: '1.5rem',
                      color: 'transparent',
                      zIndex: 1,
                      fontFamily: 'inherit',
                      fontSize: '0.875rem',
                    }}
                  >
                    {boldTaggedNamesInInput(replyText)}
                  </div>
                  <textarea
                    key={`reply-text-${comment.id}`}
                    value={replyText}
                    onChange={(e) => {
                      const text = e.target.value
                      setReplyText(text)
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm relative z-10 resize-none"
                    placeholder={language === 'vi' ? 'Viết trả lời...' : 'Write a reply...'}
                    style={{ 
                      caretColor: 'currentColor',
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!replyText.trim() || replyText.trim() === `@${comment.customer_name}` || replyText.trim() === `@${comment.customer_name} `) {
                      alert(language === 'vi' ? 'Vui lòng nhập nội dung trả lời' : 'Please enter reply content')
                      return
                    }
                    createReplyMutation.mutate({
                      parent_id: comment.id,
                      comment: replyText.trim(),
                      customer_name: replyAuthorName.trim() || undefined,
                    })
                  }}
                  disabled={createReplyMutation.isPending}
                  className={getButtonClassName("px-3 py-1.5 hover:opacity-80 disabled:opacity-50 text-sm")}
                  style={getThemeButtonStyle()}
                >
                  {createReplyMutation.isPending
                    ? (language === 'vi' ? 'Đang gửi...' : 'Sending...')
                    : (language === 'vi' ? 'Gửi' : 'Send')}
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText('')
                    setReplyAuthorName('')
                  }}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Nested replies */}
        {hasReplies && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply: any) => (
              <CommentItem 
                key={reply.id} 
                comment={reply} 
                depth={depth + 1}
                language={language}
                themeColor={themeColor}
                likedReviews={likedReviews}
                toggleLike={toggleLike}
                setReplyingTo={setReplyingTo}
                setReplyText={setReplyText}
                setReplyAuthorName={setReplyAuthorName}
                replyingTo={replyingTo}
                replyText={replyText}
                replyAuthorName={replyAuthorName}
                createReplyMutation={createReplyMutation}
                getButtonClassName={getButtonClassName}
                getThemeButtonStyle={getThemeButtonStyle}
                highlightTaggedNames={highlightTaggedNames}
                boldTaggedNamesInInput={boldTaggedNamesInInput}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerMenu() {
  const { slug } = useParams<{ slug: string }>()
  const { t, language } = useI18n()
  const { formatCurrency, convertToUSD, formatUSD } = useCurrency()
  const { theme } = useTheme()
  const [cart, setCart] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentQRCode, setPaymentQRCode] = useState<string | null>(null)
  const [menuLayout, setMenuLayout] = useState<'card' | 'grid' | 'list'>('card')
  const [searchQuery, setSearchQuery] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewCustomerName, setReviewCustomerName] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string; isReply?: boolean } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyAuthorName, setReplyAuthorName] = useState('')
  const [reviewsToShowCount, setReviewsToShowCount] = useState(5)
  const [likedReviews, setLikedReviews] = useState<Map<number, number>>(new Map()) // Map<reviewId, likeCount>
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const isManualScrollRef = useRef(false)
  const [googleMapsError, setGoogleMapsError] = useState(false)
  
  // Check if Google Maps API key is valid - hide map if invalid or missing
  const googleMapsApiKey = (import.meta.env as any).VITE_GOOGLE_MAPS_API_KEY
  const hasValidGoogleMapsKey = googleMapsApiKey && 
                                 googleMapsApiKey !== 'YOUR_API_KEY' && 
                                 googleMapsApiKey.trim() !== '' &&
                                 !googleMapsError

  // Listen for Google Maps API errors
  useEffect(() => {
    if (!googleMapsApiKey || googleMapsApiKey === 'YOUR_API_KEY') return

    const handleMessage = (event: MessageEvent) => {
      // Google Maps may send error messages via postMessage
      if (event.data && typeof event.data === 'string') {
        const errorMessages = [
          'Google Maps Platform rejected',
          'invalid API key',
          'This API key is not authorized',
          'RefererNotAllowedMapError'
        ]
        if (errorMessages.some(msg => event.data.includes(msg))) {
          setGoogleMapsError(true)
        }
      }
    }

    // Also check console errors (if possible)
    const originalError = console.error
    console.error = (...args) => {
      const errorStr = args.join(' ')
      if (errorStr.includes('Google Maps') || errorStr.includes('maps.googleapis.com')) {
        setGoogleMapsError(true)
      }
      originalError.apply(console, args)
    }

    window.addEventListener('message', handleMessage)
    
    return () => {
      window.removeEventListener('message', handleMessage)
      console.error = originalError
    }
  }, [googleMapsApiKey])

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['public-menu', slug],
    queryFn: () => publicApi.getMenu(slug!),
    enabled: !!slug,
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => publicApi.getReviews(slug!),
    enabled: !!slug, // Auto-fetch reviews
  })

  // Load liked reviews from localStorage on mount
  useEffect(() => {
    if (slug) {
      const stored = localStorage.getItem(`liked_reviews_${slug}`)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          // Check if data is array of [key, value] pairs (Map format)
          if (Array.isArray(data) && data.length > 0) {
            // Check if first element is an array (Map entries format: [[key, value], ...])
            if (Array.isArray(data[0]) && data[0].length === 2) {
              // New format: Map entries
              setLikedReviews(new Map(data))
            } else {
              // Old format: Set (array of numbers)
              const newMap = new Map<number, number>()
              data.forEach((id: number) => {
                if (typeof id === 'number') {
                  newMap.set(id, 1)
                }
              })
              setLikedReviews(newMap)
              // Update localStorage to new format
              localStorage.setItem(`liked_reviews_${slug}`, JSON.stringify(Array.from(newMap.entries())))
            }
          } else {
            // Empty array or invalid format, initialize empty Map
            setLikedReviews(new Map())
          }
        } catch (e) {
          console.error('Error loading liked reviews:', e)
          // On error, initialize empty Map
          setLikedReviews(new Map())
        }
      }
    }
  }, [slug])

  // Auto-select category on scroll
  useEffect(() => {
    if (!menuData?.categories || menuData.categories.length === 0) return

    const categoryElements = filterCategories(menuData.categories).map(cat => ({
      id: cat.id,
      element: document.getElementById(`category-container-${cat.id}`)
    })).filter(item => item.element !== null)

    if (categoryElements.length === 0) return

    let scrollTimeout: number | undefined
    let updateTimeout: number | undefined

    const findActiveCategory = () => {
      if (isManualScrollRef.current) return

      // Find the category that is closest to the top of the viewport (after header offset)
      let activeCategory: { id: number; distance: number } | null = null
      const headerOffset = 160 // Header height + search bar height + category nav height
      const viewportTop = window.scrollY + headerOffset

      categoryElements.forEach(({ id, element }) => {
        if (!element) return
        
        const rect = element.getBoundingClientRect()
        const elementTop = window.scrollY + rect.top
        const elementBottom = window.scrollY + rect.bottom
        
        // Check if category is in viewport
        if (elementBottom > viewportTop && elementTop < window.scrollY + window.innerHeight) {
          // Calculate distance from viewport top (after header offset)
          const distance = Math.abs(elementTop - viewportTop)
          
          // Prefer category that is at or above the viewport top
          // If category is above viewport top, use negative distance
          const adjustedDistance = elementTop <= viewportTop ? -distance : distance
          
          if (!activeCategory || adjustedDistance < activeCategory.distance) {
            activeCategory = { id, distance: adjustedDistance }
          }
        }
      })

      if (activeCategory) {
        setActiveCategoryId(prevId => {
          if (prevId !== activeCategory!.id) {
            return activeCategory!.id
          }
          return prevId
        })
      }
    }

    // Debounced scroll handler
    const handleScroll = () => {
      if (isManualScrollRef.current) {
        if (scrollTimeout !== undefined) {
          window.clearTimeout(scrollTimeout)
        }
        scrollTimeout = window.setTimeout(() => {
          isManualScrollRef.current = false
        }, 1000) // Reset after 1 second of no scrolling
        return
      }

      // Debounce the category update to avoid too frequent updates
      if (updateTimeout !== undefined) {
        window.clearTimeout(updateTimeout)
      }
      updateTimeout = window.setTimeout(() => {
        findActiveCategory()
      }, 100) // Update after 100ms of no scrolling
    }

    // Initial check
    findActiveCategory()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout !== undefined) {
        window.clearTimeout(scrollTimeout)
      }
      if (updateTimeout !== undefined) {
        window.clearTimeout(updateTimeout)
      }
    }
  }, [menuData?.categories, searchQuery])

  // Add like for a review (allow multiple likes)
  const toggleLike = (reviewId: number) => {
    setLikedReviews(prev => {
      const newMap = new Map(prev)
      const currentCount = newMap.get(reviewId) || 0
      newMap.set(reviewId, currentCount + 1)
      // Save to localStorage
      if (slug) {
        localStorage.setItem(`liked_reviews_${slug}`, JSON.stringify(Array.from(newMap.entries())))
      }
      return newMap
    })
  }

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string; customer_name: string }) => {
      return publicApi.createReview(slug!, data)
    },
    onSuccess: () => {
      refetchReviews()
      setReviewRating(0)
      setReviewComment('')
      setReviewCustomerName('')
    },
  })

  const createReplyMutation = useMutation({
    mutationFn: async (data: { parent_id: number; comment: string; customer_name?: string }) => {
      return publicApi.createReply(slug!, {
        ...data,
        customer_name: data.customer_name || (language === 'vi' ? 'Ẩn danh' : 'Anonymous')
      })
    },
    onSuccess: () => {
      refetchReviews()
      setReplyingTo(null)
      setReplyText('')
      setReplyAuthorName('')
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: async (data: { table_number: string; items: any[] }) => {
      return publicApi.createOrder(slug!, data)
    },
    onSuccess: (data) => {
      setOrderData(data)
      // Generate payment QR code (simple example - in production, use actual payment gateway)
      generatePaymentQRCode(data)
      setShowCheckout(true)
    },
  })

  const generatePaymentQRCode = (order: any) => {
    // Generate QR code for payment (example: contains order ID and total)
    const paymentData = JSON.stringify({
      order_id: order.id,
      total: order.total,
      restaurant_id: order.restaurant_id,
      table_number: order.table_number
    })
    // In production, use a QR code library or payment gateway API
    // For now, we'll create a simple text representation
    setPaymentQRCode(paymentData)
  }


  const updateItemQuantity = (item: any, delta: number) => {
    if (item.is_visible === false) return
    if (item.status === 'out_of_stock' || item.status === 'coming_soon') return
    
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item_id === item.id)
      if (existing) {
        const newQuantity = existing.quantity + delta
        if (newQuantity <= 0) {
          return prev.filter((ci) => ci.item_id !== item.id)
        }
        return prev.map((ci) =>
          ci.item_id === item.id ? { ...ci, quantity: newQuantity } : ci
        )
      } else {
        if (delta > 0) {
          return [...prev, { item_id: item.id, name: item.name, price: item.price, quantity: 1, image_url: item.image_url }]
        }
        return prev
      }
    })
  }

  const getItemQuantity = (itemId: number) => {
    const cartItem = cart.find((ci) => ci.item_id === itemId)
    return cartItem?.quantity || 0
  }

  // Filter items based on search query
  const filterItems = (items: any[]) => {
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    )
  }

  // Filter categories that have matching items
  const filterCategories = (categories: any[]) => {
    if (!searchQuery.trim()) return categories
    return categories.map(cat => ({
      ...cat,
      items: filterItems(cat.items)
    })).filter(cat => cat.items.length > 0)
  }

  // Function to bold tagged names in reply input (for overlay)
  const boldTaggedNamesInInput = (text: string): React.ReactNode => {
    if (!text) return text
    
    // Collect all names from comments and replies
    const names = new Set<string>()
    const collectNames = (comments: any[]) => {
      comments.forEach(comment => {
        if (comment.customer_name) {
          names.add(comment.customer_name)
        }
        if (comment.replies && comment.replies.length > 0) {
          collectNames(comment.replies)
        }
      })
    }
    if (reviewsData?.reviews) {
      collectNames(reviewsData.reviews)
    }
    
    // Create regex pattern to match @name (including names with spaces)
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    const regex = /@(\S+)/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      const beforeMatch = text.substring(lastIndex, match.index)
      if (beforeMatch) {
        parts.push(<span key={`text-${lastIndex}`}>{beforeMatch}</span>)
      }
      
      const taggedName = match[1]
      // Check if this name exists in our names set (including partial matches for names with spaces)
      let foundName = null
      for (const name of names) {
        if (name.startsWith(taggedName) || taggedName.startsWith(name.split(' ')[0])) {
          // Check if the full name matches (including spaces)
          const fullNamePattern = new RegExp(`^@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`)
          const fullMatch = text.substring(match.index).match(fullNamePattern)
          if (fullMatch) {
            foundName = name
            // Update regex lastIndex to skip the full name
            regex.lastIndex = match.index + fullMatch[0].length
            break
          }
        }
      }
      
      if (foundName) {
        // Bold the full name (no background color)
        const fullNameMatch = text.substring(match.index).match(new RegExp(`^@${foundName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`))
        if (fullNameMatch) {
          parts.push(
            <span key={`tag-${match.index}`} className="font-bold">
              {fullNameMatch[0]}
            </span>
          )
          lastIndex = match.index + fullNameMatch[0].length
          continue
        }
      }
      
      // If no match found, just bold the @tag as is
      parts.push(
        <span key={`tag-${match.index}`} className="font-bold">
          {match[0]}
        </span>
      )
      lastIndex = regex.lastIndex
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>)
    }
    
    return parts.length > 0 ? <>{parts}</> : text
  }

  // Function to highlight tagged names in comment text
  const highlightTaggedNames = (text: string): React.ReactNode => {
    if (!text) return text
    
    // Collect all names from comments and replies
    const names = new Set<string>()
    const collectNames = (comments: any[]) => {
      comments.forEach(comment => {
        if (comment.customer_name) {
          names.add(comment.customer_name)
        }
        if (comment.replies && comment.replies.length > 0) {
          collectNames(comment.replies)
        }
      })
    }
    if (reviewsData?.reviews) {
      collectNames(reviewsData.reviews)
    }
    
    // Create regex pattern to match @name (including names with spaces)
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    const regex = /@(\S+)/g
    let match
    
    while ((match = regex.exec(text)) !== null) {
      const beforeMatch = text.substring(lastIndex, match.index)
      if (beforeMatch) {
        parts.push(beforeMatch)
      }
      
      const taggedName = match[1]
      // Check if this name exists in our names set (including partial matches for names with spaces)
      let foundName = null
      for (const name of names) {
        if (name.startsWith(taggedName) || taggedName.startsWith(name.split(' ')[0])) {
          // Check if the full name matches (including spaces)
          const fullNamePattern = new RegExp(`^@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`)
          const fullMatch = text.substring(match.index).match(fullNamePattern)
          if (fullMatch) {
            foundName = name
            // Update regex lastIndex to skip the full name
            regex.lastIndex = match.index + fullMatch[0].length
            break
          }
        }
      }
      
      if (foundName) {
        // Highlight the full name
        const fullNameMatch = text.substring(match.index).match(new RegExp(`^@${foundName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`))
        if (fullNameMatch) {
          parts.push(
            <span key={match.index} className="font-semibold" style={{ color: themeColor }}>
              {fullNameMatch[0]}
            </span>
          )
          lastIndex = match.index + fullNameMatch[0].length
          continue
        }
      }
      
      // If no match found, just add the @tag as is
      parts.push(match[0])
      lastIndex = regex.lastIndex
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? <>{parts}</> : text
  }

  const handleSubmitReview = () => {
    if (!reviewRating) {
      alert(language === 'vi' ? 'Vui lòng chọn số sao' : 'Please select a rating')
      return
    }
    createReviewMutation.mutate({
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
      customer_name: reviewCustomerName.trim() || (language === 'vi' ? 'Ẩn danh' : 'Anonymous')
    })
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const restaurantCurrency = menuData?.restaurant.currency || 'VND'
  const exchangeRate = menuData?.restaurant.exchange_rate || 25000

  // Helper function to convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return [h * 360, s * 100, l * 100]
  }

  // Helper function to convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360
    s /= 100
    l /= 100
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  // Helper function to parse color string (hex or rgb) to RGB values
  const parseColor = (color: string): [number, number, number] => {
    // Handle hex color
    if (color.startsWith('#')) {
      let hex = color.replace('#', '')
      // Handle 3-character hex (e.g., #f00 -> #ff0000)
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('')
      }
      const num = parseInt(hex, 16)
      const r = (num >> 16) & 255
      const g = (num >> 8) & 255
      const b = num & 255
      return [r, g, b]
    }
    // Handle rgb() color
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
    }
    // Default fallback
    return [79, 70, 229] // Default indigo color
  }

  // Helper function to format RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  // Helper function to get adaptive theme color based on light/dark mode
  const getAdaptiveThemeColor = (baseColor: string): string => {
    const [r, g, b] = parseColor(baseColor)
    const [h, s, l] = rgbToHsl(r, g, b)
    
    if (theme === 'dark') {
      // In dark mode: if color is too dark (lightness < 50%), make it lighter for better visibility
      if (l < 50) {
        // Calculate how much to lighten: more dark = more lightening needed
        // Target lightness: at least 60% for good visibility on dark background
        const targetL = Math.max(60, 50 + (50 - l) * 0.5)
        const newL = Math.min(75, targetL) // Cap at 75% to avoid too bright
        const [newR, newG, newB] = hslToRgb(h, s, newL)
        return rgbToHex(newR, newG, newB)
      }
      // If color is already bright enough, use as is
      return baseColor
    } else {
      // In light mode: if color is too light (lightness > 55%), make it darker for better contrast
      if (l > 55) {
        // Calculate how much to darken: more light = more darkening needed
        // Target lightness: around 40-45% for good contrast on light background
        const targetL = Math.min(45, 55 - (l - 55) * 0.5)
        const newL = Math.max(25, targetL) // Floor at 25% to avoid too dark
        const [newR, newG, newB] = hslToRgb(h, s, newL)
        return rgbToHex(newR, newG, newB)
      }
      // If color is already dark enough, use as is
      return baseColor
    }
  }

  // Helper function to adjust color brightness for gradient
  const adjustColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, Math.max(0, (num >> 16) + amt))
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt))
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt))
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
  }

  // Get brand colors and fonts
  const buttonStyle = menuData?.restaurant.button_style || 'rounded-full-border'
  const baseThemeColor = menuData?.restaurant.theme_color || '#4F46E5'
  // Get adaptive theme color that adjusts based on light/dark mode
  const themeColor = getAdaptiveThemeColor(baseThemeColor)

  // Parse button style to get rounded class and fill type
  const parseButtonStyle = (style: string) => {
    // Handle old format for backward compatibility
    if (style === 'rounded' || style === 'rounded-lg' || style === 'rounded-full' || style === 'rounded-md') {
      return { rounded: style, isFilled: false }
    }
    // New format: rounded-border, rounded-filled, etc.
    const isFilled = style.includes('filled')
    const rounded = style.includes('rounded-full') ? 'rounded-full'
      : style.includes('rounded-lg') ? 'rounded-lg'
      : style.includes('rounded-md') ? 'rounded-md'
      : 'rounded'
    return { rounded, isFilled }
  }

  const { rounded: roundedClass, isFilled } = parseButtonStyle(buttonStyle)

  // Helper function to get button className based on restaurant button_style
  const getButtonClassName = (baseClasses: string) => {
    return `${baseClasses} ${roundedClass}`
  }

  // Helper function to get theme button style - border or filled based on button_style
  const getThemeButtonStyle = () => {
    // Use adaptive theme color that already adjusts based on light/dark mode
    if (isFilled) {
      return {
        backgroundColor: themeColor,
        color: menuData?.restaurant.button_text_color || '#FFFFFF',
        borderWidth: '0px',
      } as React.CSSProperties
    } else {
      return {
        borderColor: themeColor,
        color: themeColor,
        backgroundColor: 'transparent',
        borderWidth: '2px',
        borderStyle: 'solid',
      } as React.CSSProperties
    }
  }

  const handleCheckout = () => {
    if (!tableNumber.trim()) {
      alert(language === 'vi' ? 'Vui lòng nhập số bàn' : 'Please enter table number')
      return
    }
    if (cart.length === 0) {
      alert(language === 'vi' ? 'Vui lòng chọn món' : 'Please select items')
      return
    }
    
    createOrderMutation.mutate({
      table_number: tableNumber,
      items: cart.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
      })),
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

  if (showCheckout && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Bill */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {menuData.restaurant.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {menuData.restaurant.address}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'vi' ? 'Mã đơn hàng' : 'Order ID'}: <span className="font-bold">#{orderData.id}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'vi' ? 'Bàn' : 'Table'}: <span className="font-bold">{orderData.table_number}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                {language === 'vi' ? 'Chi tiết đơn hàng' : 'Order Details'}
              </h3>
              <div className="space-y-2">
                {orderData.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.item_name} × {item.quantity}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'vi' ? 'Tổng cộng' : 'Total'}
                </span>
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: themeColor }}>
                    {formatCurrency(orderData.total)}
                  </p>
                  {restaurantCurrency === 'VND' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ≈ {formatUSD(convertToUSD(orderData.total, exchangeRate))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {language === 'vi' ? 'Quét mã QR để thanh toán' : 'Scan QR Code to Pay'}
            </h3>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              {paymentQRCode ? (
                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'vi' ? 'QR Code thanh toán' : 'Payment QR Code'}
                  </p>
                </div>
              ) : (
                <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      {language === 'vi' ? 'Đang tạo mã QR...' : 'Generating QR code...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {language === 'vi' 
                ? 'Hoặc thanh toán tại quầy thu ngân'
                : 'Or pay at the cashier counter'}
            </p>
            <button
              onClick={() => {
                setShowCheckout(false)
                setOrderData(null)
                setCart([])
                setTableNumber('')
                setPaymentQRCode(null)
              }}
              className={getButtonClassName("w-full px-4 py-2 hover:opacity-80")}
              style={getThemeButtonStyle()}
            >
              {language === 'vi' ? 'Đặt món tiếp' : 'Order More'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-0">
      {/* Header Note - On top */}
      {menuData?.restaurant.header_note && (
        <div 
          className="text-center py-3 px-4"
          style={{
            backgroundColor: menuData?.restaurant.theme_color || '#4F46E5',
            color: menuData?.restaurant.button_text_color || '#FFFFFF',
          } as React.CSSProperties}
        >
          <p className="text-sm font-medium">{menuData.restaurant.header_note}</p>
        </div>
      )}

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
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {menuData.restaurant.phone && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {menuData.restaurant.phone}
                    </span>
                  )}
                  {menuData.restaurant.grand_opening_date && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {language === 'vi' ? 'Khai trương' : 'Grand Opening'}: {new Date(menuData.restaurant.grand_opening_date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Grand Opening Banner */}
      {menuData?.restaurant.is_grand_opening && menuData?.restaurant.grand_opening_message && (
        <div 
          className="text-center py-4 px-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 25%, #FFA500 50%, #FFD700 75%, #FF6B9D 100%)',
            color: '#FFFFFF',
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 fill-current" />
            <p className="text-lg font-bold">{language === 'vi' ? '🎉 KHAI TRƯƠNG 🎉' : '🎉 GRAND OPENING 🎉'}</p>
            <Star className="w-5 h-5 fill-current" />
          </div>
          <p className="text-sm">{menuData.restaurant.grand_opening_message}</p>
        </div>
      )}

      {/* Search Bar and Layout Switcher */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[96px] z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'vi' ? 'Tìm kiếm món ăn...' : 'Search for items...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': themeColor } as React.CSSProperties & { '--tw-ring-color': string }}
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setMenuLayout('card')}
              className={`p-2 rounded ${menuLayout === 'card' ? 'dark:bg-opacity-20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              style={menuLayout === 'card' ? { backgroundColor: themeColor + '20', color: themeColor } : {}}
              title={language === 'vi' ? 'Chế độ thẻ' : 'Card View'}
            >
              <Square className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuLayout('grid')}
              className={`p-2 rounded ${menuLayout === 'grid' ? 'dark:bg-opacity-20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              style={menuLayout === 'grid' ? { backgroundColor: themeColor + '20', color: themeColor } : {}}
              title={language === 'vi' ? 'Chế độ lưới' : 'Grid View'}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuLayout('list')}
              className={`p-2 rounded ${menuLayout === 'list' ? 'dark:bg-opacity-20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              style={menuLayout === 'list' ? { backgroundColor: themeColor + '20', color: themeColor } : {}}
                title={language === 'vi' ? 'Chế độ danh sách' : 'List View'}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Menu */}
      {menuData.categories && menuData.categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-[160px] z-30 shadow-sm">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex space-x-1 overflow-x-auto py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {filterCategories(menuData.categories).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    const categoryElement = document.getElementById(`category-container-${category.id}`)
                    if (categoryElement) {
                      isManualScrollRef.current = true
                      setActiveCategoryId(category.id)
                      const headerOffset = 160 // Header height + search bar height + category nav height
                      const elementPosition = categoryElement.getBoundingClientRect().top
                      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      })
                      // Reset manual scroll flag after scroll completes
                      setTimeout(() => {
                        isManualScrollRef.current = false
                      }, 1000)
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategoryId === category.id
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={activeCategoryId === category.id ? { backgroundColor: themeColor } : {}}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          <style>{`
            .overflow-x-auto::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}

      {/* Menu Content - Same layout for mobile and desktop */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filterCategories(menuData.categories).map((category) => (
          <div key={category.id} id={`category-container-${category.id}`} className="mb-8 scroll-mt-32">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}
            </h2>
            <div className={
              menuLayout === 'list' 
                ? 'space-y-3' 
                : menuLayout === 'grid'
                ? 'grid grid-cols-2 gap-2 sm:grid-cols-4'
                : 'grid grid-cols-1 gap-4 sm:grid-cols-2'
            }>
              {filterItems(category.items).map((item) => {
                const quantity = getItemQuantity(item.id)
                const isUnavailable = item.is_visible === false
                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden relative flex flex-col h-full ${
                      isUnavailable ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    {isUnavailable && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div 
                          className="bg-red-500 text-white px-8 py-2 transform -rotate-45 shadow-lg"
                          style={{ transform: 'rotate(-45deg)' }}
                        >
                          <span className="text-sm font-bold whitespace-nowrap">
                            {language === 'vi' ? 'Món không có sẵn' : 'Item Unavailable'}
                          </span>
                        </div>
                      </div>
                    )}
                    {menuLayout === 'list' ? (
                      // List View Layout
                      <div className="flex items-start gap-4 p-4">
                        {item.image_url && (
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded"
                            />
                            {item.status === 'new_item' && (
                              <div className="absolute -top-1 -right-1 z-30">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 rotating-star sparkle-star" />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={`text-lg font-semibold text-gray-900 dark:text-white flex-1 ${
                              isUnavailable ? 'line-through' : ''
                            }`}>
                              {item.name}
                            </h3>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {item.status !== 'coming_soon' && item.status !== 'out_of_stock' && item.quantity !== undefined && item.quantity !== null && (
                              <span>
                                {language === 'vi' ? 'Số lượng' : 'Quantity'}: {item.quantity}
                              </span>
                            )}
                            {item.status && (
                              <span>
                                {language === 'vi' ? 'Trạng thái' : 'Status'}: {
                                  item.status === 'in_stock' ? (language === 'vi' ? 'Còn hàng' : 'In Stock') :
                                  item.status === 'out_of_stock' ? (language === 'vi' ? 'Hết hàng' : 'Out of Stock') :
                                  item.status === 'new' ? (language === 'vi' ? 'Mới' : 'New') :
                                  item.status === 'coming_soon' ? (language === 'vi' ? 'Sắp có' : 'Coming Soon') : item.status
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-lg font-bold whitespace-nowrap" style={{ color: themeColor }}>
                            {formatCurrency(item.price)}
                          </span>
                          {item.status === 'out_of_stock' ? (
                            <span className={getButtonClassName("inline-block px-4 py-2 bg-red-500 text-white whitespace-nowrap")}>
                              {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                            </span>
                          ) : item.status === 'coming_soon' ? (
                            <span className={getButtonClassName("inline-block px-4 py-2 bg-yellow-500 text-white whitespace-nowrap")}>
                              {language === 'vi' ? 'Sắp có' : 'Coming Soon'}
                            </span>
                          ) : (
                            quantity === 0 ? (
                              <button
                                onClick={() => updateItemQuantity(item, 1)}
                                className={getButtonClassName("px-4 py-2 hover:opacity-80 whitespace-nowrap")}
                                style={getThemeButtonStyle()}
                              >
                                {language === 'vi' ? 'Thêm vào giỏ' : 'Add to Cart'}
                              </button>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateItemQuantity(item, -1)}
                                  className="p-2 rounded-full hover:opacity-80"
                                  style={{ backgroundColor: themeColor + '20', color: themeColor }}
                                >
                                  <Minus className="w-5 h-5" />
                                </button>
                                <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-white">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateItemQuantity(item, 1)}
                                  className="p-2 rounded-full hover:opacity-80"
                                  style={{ backgroundColor: themeColor + '20', color: themeColor }}
                                >
                                  <Plus className="w-5 h-5" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      // Card/Grid View Layout
                      <>
                        {item.image_url && (
                          <div className="relative">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className={`w-full ${menuLayout === 'grid' ? 'h-24' : 'h-48'} object-cover`}
                            />
                            {item.status === 'new_item' && (
                              <div className="absolute top-2 right-2 z-30">
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 rotating-star sparkle-star" />
                                <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-xs font-bold text-white">
                                  {language === 'vi' ? 'Mới' : 'New'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-4 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-lg font-semibold text-gray-900 dark:text-white flex-1 ${
                              isUnavailable ? 'line-through' : ''
                            }`}>
                              {item.name}
                            </h3>
                            <span className="text-lg font-bold ml-2" style={{ color: themeColor }}>
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-auto">
                            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                              {item.status !== 'coming_soon' && item.status !== 'out_of_stock' && item.quantity !== undefined && item.quantity !== null && (
                                <span>
                                  {language === 'vi' ? 'Số lượng' : 'Quantity'}: {item.quantity}
                                </span>
                              )}
                              {item.status && (
                                <span>
                                  {language === 'vi' ? 'Trạng thái' : 'Status'}: {
                                    item.status === 'in_stock' ? (language === 'vi' ? 'Còn hàng' : 'In Stock') :
                                    item.status === 'out_of_stock' ? (language === 'vi' ? 'Hết hàng' : 'Out of Stock') :
                                    item.status === 'new' ? (language === 'vi' ? 'Mới' : 'New') :
                                    item.status === 'coming_soon' ? (language === 'vi' ? 'Sắp có' : 'Coming Soon') : item.status
                                  }
                                </span>
                              )}
                            </div>
                            {item.status === 'out_of_stock' ? (
                              <span className={getButtonClassName("inline-block w-full text-center px-4 py-2 bg-red-500 text-white")}>
                                {language === 'vi' ? 'Hết hàng' : 'Out of Stock'}
                              </span>
                            ) : item.status === 'coming_soon' ? (
                              <span className={getButtonClassName("inline-block w-full text-center px-4 py-2 bg-yellow-500 text-white")}>
                                {language === 'vi' ? 'Sắp có' : 'Coming Soon'}
                              </span>
                            ) : (
                              <div className="flex items-center justify-center">
                                {quantity === 0 ? (
                                  <button
                                    onClick={() => updateItemQuantity(item, 1)}
                                    className={getButtonClassName("w-full px-4 py-2 hover:opacity-80")}
                                    style={getThemeButtonStyle()}
                                  >
                                    {language === 'vi' ? 'Thêm' : 'Add'}
                                  </button>
                                ) : (
                                  <div className="flex items-center space-x-4">
                                    <button
                                      onClick={() => updateItemQuantity(item, -1)}
                                      className="p-2 rounded-full hover:opacity-80"
                                  style={{ backgroundColor: themeColor + '20', color: themeColor }}
                                    >
                                      <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-white">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={() => updateItemQuantity(item, 1)}
                                      className="p-2 rounded-full hover:opacity-80"
                                  style={{ backgroundColor: themeColor + '20', color: themeColor }}
                                    >
                                      <Plus className="w-5 h-5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Map Section */}
      {menuData?.restaurant.address && hasValidGoogleMapsKey && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MapPin className="w-6 h-6" style={{ color: themeColor }} />
                {language === 'vi' ? 'Vị trí nhà hàng' : 'Restaurant Location'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {menuData.restaurant.address}
              </p>
            </div>
            <div className="h-96 w-full">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(menuData.restaurant.address)}`}
              />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(menuData.restaurant.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 text-sm font-medium inline-flex items-center gap-1"
                style={{ color: themeColor }}
              >
                {language === 'vi' ? 'Mở trong Google Maps' : 'Open in Google Maps'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Rating and Reviews Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {menuData.restaurant.average_rating && menuData.restaurant.average_rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(menuData.restaurant.average_rating!)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {menuData.restaurant.average_rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({menuData.restaurant.total_reviews || 0} {language === 'vi' ? 'đánh giá' : 'reviews'})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
                (() => {
                  const reviewsToShow = reviewsData.reviews.slice(0, reviewsToShowCount)
                  const hasMoreReviews = reviewsData.reviews.length > reviewsToShowCount
                  const loadMoreCount = 5
                  
                  return (
                    <>
                      {reviewsToShow.map((review: any) => (
                        <CommentItem 
                          key={review.id} 
                          comment={review} 
                          depth={0}
                          language={language}
                          themeColor={themeColor}
                          likedReviews={likedReviews}
                          toggleLike={toggleLike}
                          setReplyingTo={setReplyingTo}
                          setReplyText={setReplyText}
                          setReplyAuthorName={setReplyAuthorName}
                          replyingTo={replyingTo}
                          replyText={replyText}
                          replyAuthorName={replyAuthorName}
                          createReplyMutation={createReplyMutation}
                          getButtonClassName={getButtonClassName}
                          getThemeButtonStyle={getThemeButtonStyle}
                          highlightTaggedNames={highlightTaggedNames}
                          boldTaggedNamesInInput={boldTaggedNamesInInput}
                        />
                      ))}
                      {hasMoreReviews && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => {
                              setReviewsToShowCount(Math.min(
                                reviewsToShowCount + loadMoreCount,
                                reviewsData.reviews.length
                              ))
                            }}
                            className={getButtonClassName("px-4 py-2 text-sm hover:opacity-80 transition-opacity")}
                            style={getThemeButtonStyle()}
                          >
                            {language === 'vi' 
                              ? `Xem thêm ${Math.min(loadMoreCount, reviewsData.reviews.length - reviewsToShowCount)} đánh giá nữa` 
                              : `Show ${Math.min(loadMoreCount, reviewsData.reviews.length - reviewsToShowCount)} more reviews`}
                          </button>
                        </div>
                      )}
                      {reviewsToShowCount >= reviewsData.reviews.length && reviewsData.reviews.length > 5 && (
                        <div className="text-center pt-2">
                          <button
                            onClick={() => {
                              setReviewsToShowCount(5)
                            }}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:opacity-80"
                          >
                            {language === 'vi' ? 'Ẩn bớt' : 'Show less'}
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {language === 'vi' ? 'Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!' : 'No reviews yet. Be the first to review!'}
                </div>
              )}
            </div>

            {/* Add Review Input - Always at bottom */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {language === 'vi' ? 'Tên của bạn' : 'Your Name'} ({language === 'vi' ? 'Tùy chọn' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={reviewCustomerName}
                    onChange={(e) => setReviewCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'vi' ? 'Nhập tên của bạn (để trống nếu muốn ẩn danh)' : 'Enter your name (leave blank for anonymous)'}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'vi' ? 'Đánh giá' : 'Rating'}:
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            star <= reviewRating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && reviewRating > 0) {
                        e.preventDefault()
                        handleSubmitReview()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={language === 'vi' ? 'Viết đánh giá của bạn...' : 'Write your review...'}
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={createReviewMutation.isPending || reviewRating === 0}
                    className={getButtonClassName("px-4 py-2 hover:opacity-80 disabled:opacity-50 flex items-center gap-2")}
                    style={getThemeButtonStyle()}
                  >
                    {createReviewMutation.isPending ? (
                      language === 'vi' ? 'Đang gửi...' : 'Sending...'
                    ) : (
                      <>
                        <span>{language === 'vi' ? 'Gửi' : 'Send'}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Social Media Links */}
          {(menuData?.restaurant.facebook_url || menuData?.restaurant.instagram_url || menuData?.restaurant.tiktok_url) && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center">
                {language === 'vi' ? 'Theo dõi chúng tôi' : 'Follow Us'}
              </h3>
              <div className="flex items-center justify-center gap-4">
                {menuData?.restaurant.facebook_url && (
                  <a
                    href={menuData.restaurant.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: themeColor + '20', color: themeColor }}
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
                {menuData?.restaurant.instagram_url && (
                  <a
                    href={menuData.restaurant.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: themeColor + '20', color: themeColor }}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {menuData?.restaurant.tiktok_url && (
                  <a
                    href={menuData.restaurant.tiktok_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: themeColor + '20', color: themeColor }}
                    aria-label="TikTok"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
          
          {/* Footer Note */}
          {menuData?.restaurant.footnote && (
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {menuData.restaurant.footnote}
              </p>
            </div>
          )}
        </div>
      </footer>
    </div>
  )
}
