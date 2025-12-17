import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi, Category, Item } from '../api/menu'
import { restaurantsApi } from '../api/restaurants'
import { combosApi } from '../api/combos'
import { useI18n } from '../contexts/I18nContext'
import { useCurrency } from '../contexts/CurrencyContext'
import { formatPriceInput, parsePriceInput } from '../utils/currency'
import LanguageThemeSwitcher from '../components/LanguageThemeSwitcher'
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown, Star, LayoutGrid, List, Square } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

  const { data: combos } = useQuery({
    queryKey: ['combos', restaurantId],
    queryFn: () => combosApi.getCombos(restaurantId),
    enabled: !!restaurantId,
  })

  const deleteComboMutation = useMutation({
    mutationFn: (comboId: number) => combosApi.deleteCombo(restaurantId, comboId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['combos', restaurantId] })
    },
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
  const [activeItemId, setActiveItemId] = useState<number | null>(null)
  const [overCategoryId, setOverCategoryId] = useState<number | null>(null)
  const [insertionIndex, setInsertionIndex] = useState<number | null>(null)
  const [categoryHeights, setCategoryHeights] = useState<Record<number, number>>({})
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [menuLayout, setMenuLayout] = useState<'card' | 'grid' | 'list'>('card')
  const isManualScrollRef = useRef(false)
  const lastScrollYRef = useRef(window.scrollY)
  const lastUpdateTimeRef = useRef(Date.now())

  // Auto-select category on scroll
  useEffect(() => {
    if (!menu || !menu.categories || menu.categories.length === 0) return
    if (activeItemId || overCategoryId) return // Don't update when dragging

    const categoryElements = menu.categories.map(cat => ({
      id: cat.id,
      element: document.getElementById(`category-container-${cat.id}`)
    })).filter(item => item.element !== null)

    if (categoryElements.length === 0) return

    let scrollTimeout: number | undefined
    let updateTimeout: number | undefined

    const findActiveCategory = () => {
      if (isManualScrollRef.current) return
      if (activeItemId || overCategoryId) return

      // Find the category that is closest to the top of the viewport (after header offset)
      let activeCategory: { id: number; distance: number } | null = null
      const headerOffset = 80 // Header height + category nav height
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

      const currentScrollY = window.scrollY
      const scrollDelta = Math.abs(currentScrollY - lastScrollYRef.current)
      const timeSinceLastUpdate = Date.now() - lastUpdateTimeRef.current

      // Chỉ auto-select khi:
      // 1. Scroll delta đáng kể (ít nhất 100px) HOẶC
      // 2. Đã qua ít nhất 300ms kể từ lần update cuối (để tránh update khi click)
      if (scrollDelta < 100 && timeSinceLastUpdate < 300) {
        return // Không update nếu scroll quá nhỏ và quá nhanh (có thể do click/focus)
      }
      
      lastScrollYRef.current = currentScrollY
      lastUpdateTimeRef.current = Date.now()

      // Debounce the category update to avoid too frequent updates
      if (updateTimeout !== undefined) {
        window.clearTimeout(updateTimeout)
      }
      updateTimeout = window.setTimeout(() => {
        findActiveCategory()
      }, 150) // Update after 150ms of no scrolling
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
  }, [menu, activeItemId, overCategoryId])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => menuApi.createCategory(menu!.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] })
      setShowCategoryForm(false)
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name, position }: { id: number; name?: string; position?: number }) =>
      menuApi.updateCategory(id, { name, position }),
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
    const newIsAvailable = !item.is_available
    updateItemMutation.mutate({
      id: item.id,
      data: { 
        is_available: newIsAvailable,
        // Khi bỏ chọn Available, tự động chuyển status về Out of Stock
        ...(newIsAvailable === false ? { 
          status: 'out_of_stock',
          quantity: 0 
        } : {})
      },
    })
  }

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Reset states
    setActiveItemId(null)
    setCategoryHeights({})
    
    if (!over) {
      setOverCategoryId(null)
      setInsertionIndex(null)
      return
    }

    const itemId = active.id as number
    let targetCategoryId: number | null = null
    let targetItemId: number | null = null

    // Kiểm tra xem over có phải là category container không
    const overElement = document.getElementById(`category-${over.id}`)
    if (overElement) {
      targetCategoryId = over.id as number
    } else {
      // Nếu over là một item, lấy category và item đó
      const itemElement = document.querySelector(`[data-item-id="${over.id}"]`)
      if (itemElement) {
        const categoryElement = itemElement.closest('[id^="category-"]')
        if (categoryElement) {
          targetCategoryId = parseInt(categoryElement.id.replace('category-', ''))
          targetItemId = over.id as number
        }
      }
    }

    if (!targetCategoryId) {
      setOverCategoryId(null)
      setInsertionIndex(null)
      return
    }

    // Tìm item và category hiện tại
    const item = menu?.categories
      .flatMap(cat => cat.items)
      .find(i => i.id === itemId)
    
    if (!item) {
      setOverCategoryId(null)
      setInsertionIndex(null)
      return
    }

    const currentCategory = menu?.categories.find(cat => 
      cat.items.some(i => i.id === itemId)
    )

    if (!currentCategory) {
      setOverCategoryId(null)
      setInsertionIndex(null)
      return
    }

    // Tính toán currentItemIndex để sử dụng trong cả hai nhánh if-else
    const sortedAllItems = [...currentCategory.items].sort((a, b) => a.position - b.position)
    const currentItemIndex = sortedAllItems.findIndex(i => i.id === itemId)

    // Nếu cùng category và over là một item, swap positions
    if (currentCategory.id === targetCategoryId && targetItemId && targetItemId !== itemId) {
      const targetItem = currentCategory.items.find(i => i.id === targetItemId)
      if (targetItem) {
        // Sort tất cả items theo position để tìm index chính xác
        const targetItemIndex = sortedAllItems.findIndex(i => i.id === targetItemId)
        
        // Nếu vị trí không thay đổi (kéo và thả vào chính vị trí cũ), không làm gì
        // Kiểm tra cả insertionIndex từ dragOver event
        if (insertionIndex !== null) {
          // Nếu insertionIndex bằng vị trí hiện tại của item, không swap
          if (insertionIndex === currentItemIndex) {
            setOverCategoryId(null)
            setInsertionIndex(null)
            return
          }
        }
        
        // Swap positions: item được kéo lấy position của target item, target item lấy position của item được kéo
        // Điều này làm target item di chuyển đến vị trí của item được kéo
        const tempPosition = item.position
        updateItemMutation.mutate({
          id: itemId,
          data: { position: targetItem.position },
        })
        updateItemMutation.mutate({
          id: targetItemId,
          data: { position: tempPosition },
        })
      }
    } else if (currentCategory.id === targetCategoryId) {
      // Cùng category nhưng không có target item (thả vào category container), sử dụng insertionIndex
      if (insertionIndex === null) {
        setOverCategoryId(null)
        setInsertionIndex(null)
        return
      }

      // Nếu vị trí không thay đổi (thả vào chính vị trí cũ), không cần update
      if (insertionIndex === currentItemIndex || insertionIndex === currentItemIndex + 1) {
        setOverCategoryId(null)
        setInsertionIndex(null)
        return
      }

      // Tính toán position mới dựa trên insertionIndex
      const sortedItems = [...currentCategory.items]
        .filter(i => i.id !== itemId)
        .sort((a, b) => a.position - b.position)

      let newPosition: number
      if (insertionIndex === 0) {
        newPosition = sortedItems.length > 0 ? sortedItems[0].position - 1 : 0
      } else if (insertionIndex >= sortedItems.length) {
        newPosition = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].position + 1 : 0
      } else {
        const prevItem = sortedItems[insertionIndex - 1]
        const nextItem = sortedItems[insertionIndex]
        newPosition = Math.floor((prevItem.position + nextItem.position) / 2)
        if (newPosition === prevItem.position || newPosition === nextItem.position) {
          newPosition = prevItem.position + 1
        }
      }

      updateItemMutation.mutate({
        id: itemId,
        data: { position: newPosition },
      })
    } else {
      // Khác category, cập nhật category_id và position
      const targetCategory = menu?.categories.find(cat => cat.id === targetCategoryId)
      if (!targetCategory) {
        setOverCategoryId(null)
        setInsertionIndex(null)
        return
      }

      // Tính toán position mới trong category mới
      const sortedItems = targetCategory.items.sort((a, b) => a.position - b.position)
      let newPosition: number
      if (insertionIndex === null || insertionIndex === 0) {
        newPosition = sortedItems.length > 0 ? sortedItems[0].position - 1 : 0
      } else if (insertionIndex >= sortedItems.length) {
        newPosition = sortedItems.length > 0 ? sortedItems[sortedItems.length - 1].position + 1 : 0
      } else {
        const prevItem = sortedItems[insertionIndex - 1]
        const nextItem = sortedItems[insertionIndex]
        newPosition = Math.floor((prevItem.position + nextItem.position) / 2)
        if (newPosition === prevItem.position || newPosition === nextItem.position) {
          newPosition = prevItem.position + 1
        }
      }

      // Cập nhật category_id và position
      updateItemMutation.mutate({
        id: itemId,
        data: { 
          category_id: targetCategoryId,
          position: newPosition,
        },
      })
    }

    setOverCategoryId(null)
    setInsertionIndex(null)
  }

  const handleItemDragStart = (event: DragStartEvent) => {
    const itemId = event.active.id as number
    
    // Lưu lại chiều cao của các category trước khi drag
    if (menu) {
      const heights: Record<number, number> = {}
      menu.categories.forEach(cat => {
        const categoryElement = document.getElementById(`category-${cat.id}`)
        if (categoryElement) {
          heights[cat.id] = categoryElement.offsetHeight
        }
      })
      setCategoryHeights(heights)
    }
    
    setActiveItemId(itemId)
  }

  const handleItemDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      setOverCategoryId(null)
      setInsertionIndex(null)
      return
    }

    // Nếu over là item đang được kéo (active), không thay đổi gì
    if (over.id === active.id) {
      // Giữ nguyên vị trí hiện tại của item đang được kéo
      const activeItem = menu?.categories
        .flatMap(cat => cat.items)
        .find(i => i.id === active.id)
      
      if (activeItem) {
        const currentCategory = menu?.categories.find(cat => 
          cat.items.some(i => i.id === active.id)
        )
        if (currentCategory) {
          const sortedItems = [...currentCategory.items].sort((a, b) => a.position - b.position)
          const itemIndex = sortedItems.findIndex(i => i.id === active.id)
          setOverCategoryId(currentCategory.id)
          setInsertionIndex(itemIndex)
        }
      }
      return
    }

    const mouseEvent = event.activatorEvent as MouseEvent | undefined
    const mouseY = mouseEvent?.clientY || 0

    let targetCategoryId: number | null = null
    let categoryElement: HTMLElement | null = null
    let targetItemId: number | null = null

    // Kiểm tra xem over có phải là category container không
    const overElement = document.getElementById(`category-${over.id}`)
    if (overElement) {
      targetCategoryId = over.id as number
      categoryElement = overElement
    } else {
      // Nếu over là một item, lấy category của item đó
      const itemElement = document.querySelector(`[data-item-id="${over.id}"]`)
      if (itemElement) {
        targetItemId = over.id as number
        const parentCategoryElement = itemElement.closest('[id^="category-"]') as HTMLElement
        if (parentCategoryElement) {
          targetCategoryId = parseInt(parentCategoryElement.id.replace('category-', ''))
          categoryElement = parentCategoryElement
        }
      }
    }

    if (!targetCategoryId || !categoryElement) {
      setOverCategoryId(null)
      setInsertionIndex(null)
      return
    }

    // Không cập nhật activeCategoryId khi drag over để tránh menu category tự động chuyển
    // Chỉ sử dụng overCategoryId để hiển thị visual feedback khi drag
    // setActiveCategoryId(targetCategoryId)

    // Tìm category hiện tại của item đang được kéo
    const currentCategory = menu?.categories.find(cat => 
      cat.items.some(i => i.id === active.id)
    )

    // Nếu cùng category và over là một item khác, swap positions
    // Item được kéo sẽ thay thế vị trí của target item
    // Target item sẽ di chuyển đến vị trí của item được kéo
    if (currentCategory && currentCategory.id === targetCategoryId && targetItemId && targetItemId !== active.id) {
      // Sort tất cả items theo position (bao gồm cả item đang được kéo)
      const sortedAllItems = [...currentCategory.items].sort((a, b) => a.position - b.position)
      const activeItemIndex = sortedAllItems.findIndex(i => i.id === active.id)
      const targetItemIndex = sortedAllItems.findIndex(i => i.id === targetItemId)
      
      // Nếu target item ở ngay vị trí hiện tại hoặc trước đó một vị trí, không cần swap
      if (targetItemIndex === activeItemIndex - 1 || targetItemIndex === activeItemIndex) {
        setOverCategoryId(targetCategoryId)
        setInsertionIndex(activeItemIndex)
        return
      }
      
      // Khi kéo active item qua target item:
      // - Active item sẽ lấy position của target item (di chuyển đến vị trí của target)
      // - Target item sẽ lấy position của active item (di chuyển đến vị trí của active)
      // Với @dnd-kit, ta set insertionIndex ở vị trí của target item
      // Active item sẽ được chèn vào vị trí đó, và @dnd-kit sẽ tự động transform target item đến vị trí của active
      setOverCategoryId(targetCategoryId)
      setInsertionIndex(targetItemIndex) // Vị trí của target item (active sẽ chèn vào đây, target sẽ di chuyển đến vị trí của active)
      return
    }

    setOverCategoryId(targetCategoryId)

    // Tính toán vị trí insertion dựa trên vị trí chuột
    const items = Array.from(categoryElement.querySelectorAll('[data-item-id]'))
      .filter(item => {
        const itemId = parseInt(item.getAttribute('data-item-id') || '0')
        return itemId !== active.id // Loại bỏ item đang được kéo
      })
    
    let insertionPos = items.length // Mặc định là cuối danh sách

    // Tìm vị trí insertion dựa trên vị trí chuột
    items.forEach((item, i) => {
      const itemRect = item.getBoundingClientRect()
      // Nếu chuột nằm ở nửa trên của item, chèn trước item đó
      if (mouseY < itemRect.top + itemRect.height / 2) {
        insertionPos = i
        return
      }
      // Nếu chuột nằm ở nửa dưới của item, chèn sau item đó
      if (mouseY >= itemRect.top + itemRect.height / 2 && mouseY <= itemRect.bottom) {
        insertionPos = i + 1
        return
      }
    })

    setInsertionIndex(insertionPos)
  }

  const moveCategory = (categoryId: number, direction: 'up' | 'down') => {
    if (!menu) return
    
    const sortedCategories = [...menu.categories].sort((a, b) => a.position - b.position)
    const currentIndex = sortedCategories.findIndex(cat => cat.id === categoryId)
    
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex < 0 || newIndex >= sortedCategories.length) return
    
    const currentCategory = sortedCategories[currentIndex]
    const targetCategory = sortedCategories[newIndex]
    
    // Swap positions
    updateCategoryMutation.mutate({ id: currentCategory.id, position: targetCategory.position })
    updateCategoryMutation.mutate({ id: targetCategory.id, position: currentCategory.position })
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
                {restaurant?.name} - {t('restaurant.menu')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border-r border-gray-300 dark:border-gray-600 pr-3 mr-3">
                <button
                  onClick={() => setMenuLayout('card')}
                  className={`p-2 rounded transition-colors ${
                    menuLayout === 'card'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={language === 'vi' ? 'Chế độ thẻ' : 'Card View'}
                >
                  <Square className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMenuLayout('grid')}
                  className={`p-2 rounded transition-colors ${
                    menuLayout === 'grid'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={language === 'vi' ? 'Chế độ lưới' : 'Grid View'}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setMenuLayout('list')}
                  className={`p-2 rounded transition-colors ${
                    menuLayout === 'list'
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={language === 'vi' ? 'Chế độ danh sách' : 'List View'}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <LanguageThemeSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Category Navigation Menu */}
      {menu && menu.categories && menu.categories.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[...menu.categories].sort((a, b) => a.position - b.position).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    const categoryElement = document.getElementById(`category-container-${category.id}`)
                    if (categoryElement) {
                      isManualScrollRef.current = true
                      setActiveCategoryId(category.id)
                      const headerOffset = 80 // Header height + category nav height
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
                      ? 'bg-yellow-600 text-white dark:bg-yellow-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleItemDragStart}
            onDragOver={handleItemDragOver}
            onDragEnd={handleItemDragEnd}
          >
            <div className="space-y-6">
              {menu && menu.categories && menu.categories.length > 0 ? (
                [...menu.categories].sort((a, b) => a.position - b.position).map((category, index) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  categoryIndex={index}
                  totalCategories={menu.categories.length}
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
                onMoveCategory={(direction) => moveCategory(category.id, direction)}
                activeItemId={activeItemId}
                overCategoryId={overCategoryId}
                insertionIndex={insertionIndex}
                categoryHeights={categoryHeights}
                menuLayout={menuLayout}
                />
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>{t('menu.noCategories')}</p>
                </div>
              )}
            </div>
            <DragOverlay>
              {activeItemId ? (() => {
                const activeItem = menu?.categories
                  .flatMap(cat => cat.items)
                  .find(i => i.id === activeItemId)
                if (!activeItem) return null
                const editing = editingItem === activeItem.id
                return (
                  <div className="opacity-95 rotate-3 shadow-2xl" style={{ width: '100%', maxWidth: '500px' }}>
                    <ItemCard
                      item={activeItem}
                      editing={editing}
                      onEdit={() => {}}
                      onCancel={() => {}}
                      onUpdate={() => {}}
                      onDelete={() => {}}
                      onToggleAvailability={() => {}}
                    />
                  </div>
                )
              })() : null}
            </DragOverlay>
          </DndContext>

          {/* Combos Section */}
          {combos && combos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {language === 'vi' ? 'Combo' : 'Combos'}
              </h2>
              <div className="space-y-6">
                {combos.map((combo) => (
                  <div key={combo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{combo.name}</h3>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                          {formatCurrency(combo.price)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/restaurant/${restaurantId}/combos`)}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(language === 'vi' ? 'Xóa combo này?' : 'Delete this combo?')) {
                              deleteComboMutation.mutate(combo.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {combo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{combo.description}</p>
                    )}
                    {combo.items && combo.items.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'vi' ? 'Bao gồm:' : 'Includes:'}
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                          {combo.items.map((comboItem, idx) => (
                            <li key={idx}>
                              {comboItem.item_name} x{comboItem.quantity}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => navigate(`/restaurant/${restaurantId}/combos`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {language === 'vi' ? 'Thêm Combo' : 'Add Combo'}
                </button>
              </div>
            </div>
          )}
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
      <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('menu.categoryName')} <span className="text-red-500">*</span>
      </label>
      <input
        id="category-name"
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
  categoryIndex,
  totalCategories,
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
  onMoveCategory,
  activeItemId,
  overCategoryId,
  insertionIndex,
  categoryHeights,
  menuLayout,
}: {
  category: Category
  categoryIndex: number
  totalCategories: number
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
  onMoveCategory: (direction: 'up' | 'down') => void
  activeItemId: number | null
  overCategoryId: number | null
  insertionIndex: number | null
  categoryHeights: Record<number, number>
  menuLayout: 'card' | 'grid' | 'list'
}) {
  const { t } = useI18n()
  const [categoryName, setCategoryName] = useState(category.name)
  const isOver = overCategoryId === category.id
  // Kiểm tra xem có item nào đang được kéo từ category này không
  const hasItemBeingDragged = activeItemId !== null && category.items.some(item => item.id === activeItemId)
  // Lấy chiều cao đã lưu cho category này
  const savedHeight = categoryHeights[category.id]

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
    <div 
      id={`category-container-${category.id}`}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all scroll-mt-24 ${
        isOver ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => onMoveCategory('up')}
              disabled={categoryIndex === 0}
              className={`p-1 rounded ${categoryIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Move up"
            >
              <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onMoveCategory('down')}
              disabled={categoryIndex === totalCategories - 1}
              className={`p-1 rounded ${categoryIndex === totalCategories - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Move down"
            >
              <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <button
            onClick={() => setEditingCategory(category.id)}
            className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
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

      <div
        id={`category-${category.id}`}
        className={`${
          menuLayout === 'list' 
            ? 'space-y-3 p-4' 
            : menuLayout === 'grid'
            ? 'grid grid-cols-2 gap-2 sm:grid-cols-4 p-4'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 p-4'
        } min-h-[100px] border-2 border-dashed rounded-lg transition-colors items-stretch ${
          isOver 
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' 
            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        style={hasItemBeingDragged ? {
          // Giữ nguyên chiều cao khi item đang được kéo ra khỏi category
          // Tính toán dựa trên số items và chiều cao mỗi item (khoảng 300-400px mỗi item với image)
          minHeight: `${Math.max(100, category.items.length * 350)}px`
        } : undefined}
      >
        <SortableContext items={category.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {category.items
            .sort((a, b) => a.position - b.position)
            .map((item, index) => (
            <div key={item.id} className="relative h-full">
              {isOver && insertionIndex === index && activeItemId !== item.id && (
                <div className="absolute -top-2 left-0 right-0 h-1 bg-indigo-500 rounded-full z-10" />
              )}
              <div data-item-id={item.id} className="h-full">
                <SortableItemCard
                  item={item}
                  editing={editingItem === item.id}
                  onEdit={() => setEditingItem(item.id)}
                  onCancel={() => setEditingItem(null)}
                  onUpdate={(data) => onUpdateItem(item.id, data)}
                  onDelete={() => onDeleteItem(item.id)}
                  onToggleAvailability={() => onToggleAvailability(item)}
                  isDragging={activeItemId === item.id}
                  menuLayout={menuLayout}
                />
              </div>
            </div>
          ))}
          {isOver && insertionIndex === category.items.length && (
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-indigo-500 rounded-full z-10" />
          )}
        </SortableContext>

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

function SortableItemCard({
  item,
  editing,
  onEdit,
  onCancel,
  onUpdate,
  onDelete,
  onToggleAvailability,
  isDragging,
  menuLayout,
}: {
  item: Item
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
  onToggleAvailability: () => void
  isDragging: boolean
  menuLayout: 'card' | 'grid' | 'list'
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="h-full">
      <ItemCard
        item={item}
        editing={editing}
        onEdit={onEdit}
        onCancel={onCancel}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleAvailability={onToggleAvailability}
        dragHandleProps={listeners}
        menuLayout={menuLayout}
      />
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
  dragHandleProps,
  menuLayout = 'card',
}: {
  item: Item
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
  onToggleAvailability: () => void
  dragHandleProps?: any
  menuLayout?: 'card' | 'grid' | 'list'
}) {
  const { t, language } = useI18n()
  const { currency, formatCurrency } = useCurrency()
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(formatPriceInput(item.price, currency))
  const [description, setDescription] = useState(item.description || '')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item.image_url || null)
  const [quantity, setQuantity] = useState(item.quantity?.toString() || '0')
  const [status, setStatus] = useState<'in_stock' | 'out_of_stock' | 'new' | 'coming_soon'>(item.status || 'in_stock')
  const [isVisible, setIsVisible] = useState(item.is_visible !== undefined ? item.is_visible : true)
  
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('menu.itemName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('menu.itemName')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('menu.price')} ({currency}) <span className="text-red-500">*</span>
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
              {language === 'vi' ? 'Trạng thái' : 'Status'}
            </label>
            <select
              value={status}
              onChange={(e) => {
                const newStatus = e.target.value as any
                setStatus(newStatus)
                // Nếu chọn Coming Soon, không cần quantity
                // Nếu chọn Out of Stock, set quantity = 0
                if (newStatus === 'out_of_stock') {
                  setQuantity('0')
                } else if (newStatus === 'coming_soon') {
                  // Coming Soon không có quantity
                } else if (newStatus === 'in_stock' || newStatus === 'new') {
                  // Nếu quantity = 0, set thành 1
                  if (parseInt(quantity) === 0) {
                    setQuantity('1')
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="in_stock">{language === 'vi' ? 'Còn hàng' : 'In Stock'}</option>
              <option value="out_of_stock">{language === 'vi' ? 'Hết hàng' : 'Out of Stock'}</option>
              <option value="coming_soon">{language === 'vi' ? 'Sắp có' : 'Coming Soon'}</option>
              <option value="new">{language === 'vi' ? 'Mới' : 'New'}</option>
            </select>
          </div>
          {status !== 'coming_soon' && status !== 'out_of_stock' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {language === 'vi' ? 'Số lượng' : 'Quantity'}
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newQuantity = e.target.value
                  setQuantity(newQuantity)
                  const qty = parseInt(newQuantity) || 0
                  // Tự động cập nhật status dựa trên quantity
                  if (qty === 0) {
                    setStatus('out_of_stock')
                  }
                }}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
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
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {language === 'vi' ? 'Hiển thị' : 'Visible'}
              </span>
            </label>
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
                // Nếu status là coming_soon, không gửi quantity
                // Nếu quantity = 0, đảm bảo status là out_of_stock
                const finalQuantity = status === 'coming_soon' ? null : (parseInt(quantity) || 0)
                const finalStatus = (finalQuantity === 0 && status !== 'coming_soon') ? 'out_of_stock' : status
                // Tự động cập nhật is_available dựa trên status
                const finalIsAvailable = (finalStatus === 'in_stock' || finalStatus === 'new') ? true : false
                onUpdate({
                  name,
                  price: numPrice,
                  description,
                  image,
                  quantity: finalQuantity,
                  status: finalStatus,
                  is_available: finalIsAvailable,
                  is_visible: isVisible,
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

  if (menuLayout === 'list') {
    // List View Layout
    return (
      <div
        className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800 flex items-start gap-4 p-4"
      >
        {item.image_url && (
          <div 
            className="relative flex-shrink-0"
            {...(dragHandleProps || {})}
            style={dragHandleProps ? { cursor: 'grab' } : {}}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-20 h-20 object-cover rounded"
            />
            {item.status === 'new' && (
              <div className="absolute -top-1 -right-1 z-30">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 rotating-star sparkle-star" />
              </div>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white flex-1">{item.name}</h4>
            <div className="flex items-center space-x-2 ml-2">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrency(item.price)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
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
      </div>
    )
  }

  // Card/Grid View Layout
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden bg-white dark:bg-gray-800 h-full flex flex-col"
    >
      <div 
        className={`relative ${menuLayout === 'grid' ? 'h-24' : 'h-48'} flex-shrink-0 bg-gray-100 dark:bg-gray-700 ${dragHandleProps ? 'cursor-grab active:cursor-grabbing' : ''}`}
        {...(dragHandleProps || {})}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-sm">
              {language === 'vi' ? 'Không có hình ảnh' : 'No image'}
            </span>
          </div>
        )}
        {item.status === 'new' && (
          <div className="absolute top-2 right-2 z-30">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 rotating-star sparkle-star" />
            <span className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-xs font-bold text-white">
              {language === 'vi' ? 'Mới' : 'New'}
            </span>
          </div>
        )}
      </div>
      <div 
        className="p-4 flex-1 flex flex-col"
        onPointerDown={(e) => {
          // Prevent drag when clicking on content area (not image)
          e.stopPropagation()
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white flex-1">{item.name}</h4>
          <div className="flex items-center space-x-2 ml-2">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(item.price)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-1">{item.description}</p>
        )}
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-auto">
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
  const { t, language } = useI18n()
  const { currency } = useCurrency()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [quantity, setQuantity] = useState('0')
  const [status, setStatus] = useState<'in_stock' | 'out_of_stock' | 'new' | 'coming_soon'>('in_stock')
  const [isVisible, setIsVisible] = useState(true)
  
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
        // Nếu status là coming_soon, không gửi quantity
        // Nếu quantity = 0, đảm bảo status là out_of_stock
        const finalQuantity = status === 'coming_soon' ? null : (parseInt(quantity) || 0)
        const finalStatus = (finalQuantity === 0 && status !== 'coming_soon') ? 'out_of_stock' : status
        // Tự động cập nhật is_available dựa trên status
        const finalIsAvailable = (finalStatus === 'in_stock' || finalStatus === 'new') ? true : false
        onSubmit({
          name,
          price: numPrice,
          description: description || undefined,
          image: image || undefined,
          quantity: finalQuantity,
          status: finalStatus,
          is_available: finalIsAvailable,
          is_visible: isVisible,
        })
        setName('')
        setPrice('')
        setDescription('')
        setImage(null)
        setImagePreview(null)
        setQuantity('0')
        setStatus('in_stock')
        setIsVisible(true)
      }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-white dark:bg-gray-800">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('menu.itemName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('menu.itemName')}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('menu.price')} ({currency}) <span className="text-red-500">*</span>
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
          {language === 'vi' ? 'Trạng thái' : 'Status'}
        </label>
        <select
          value={status}
          onChange={(e) => {
            const newStatus = e.target.value as any
            setStatus(newStatus)
            // Nếu chọn Coming Soon, không cần quantity
            // Nếu chọn Out of Stock, set quantity = 0
            if (newStatus === 'out_of_stock') {
              setQuantity('0')
            } else if (newStatus === 'coming_soon') {
              // Coming Soon không có quantity
            } else if (newStatus === 'in_stock' || newStatus === 'new') {
              // Nếu quantity = 0, set thành 1
              if (parseInt(quantity) === 0) {
                setQuantity('1')
              }
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="in_stock">{language === 'vi' ? 'Còn hàng' : 'In Stock'}</option>
          <option value="out_of_stock">{language === 'vi' ? 'Hết hàng' : 'Out of Stock'}</option>
          <option value="coming_soon">{language === 'vi' ? 'Sắp có' : 'Coming Soon'}</option>
          <option value="new">{language === 'vi' ? 'Mới' : 'New'}</option>
        </select>
      </div>
      {status !== 'coming_soon' && status !== 'out_of_stock' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {language === 'vi' ? 'Số lượng' : 'Quantity'}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const newQuantity = e.target.value
              setQuantity(newQuantity)
              const qty = parseInt(newQuantity) || 0
              // Tự động cập nhật status dựa trên quantity
              if (qty === 0) {
                setStatus('out_of_stock')
              }
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}
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
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {language === 'vi' ? 'Hiển thị' : 'Visible'}
          </span>
        </label>
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



