import { apiClient } from './client'

export interface Item {
  id: number
  name: string
  price: number
  description: string | null
  is_available: boolean
  position: number
  image_url: string | null
}

export interface Category {
  id: number
  name: string
  position: number
  items: Item[]
}

export interface Menu {
  id: number
  restaurant_id: number
  categories: Category[]
}

export interface CreateCategoryData {
  name: string
  position?: number
}

export interface UpdateCategoryData {
  name?: string
  position?: number
}

export interface CreateItemData {
  name: string
  price: number
  description?: string
  is_available?: boolean
  position?: number
  image?: File
}

export interface UpdateItemData {
  name?: string
  price?: number
  description?: string
  is_available?: boolean
  position?: number
  image?: File
}

export const menuApi = {
  getMenu: async (restaurantId: number): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/restaurants/${restaurantId}/menu`)
    return response.data
  },
  
  createMenu: async (restaurantId: number): Promise<Menu> => {
    const response = await apiClient.post<Menu>(`/restaurants/${restaurantId}/menu`)
    return response.data
  },
  
  createCategory: async (menuId: number, data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post<Category>(`/menus/${menuId}/categories`, data)
    return response.data
  },
  
  updateCategory: async (id: number, data: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.put<Category>(`/categories/${id}`, data)
    return response.data
  },
  
  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
  
  createItem: async (categoryId: number, data: CreateItemData): Promise<Item> => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('price', data.price.toString())
    if (data.description) formData.append('description', data.description)
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString())
    if (data.position !== undefined) formData.append('position', data.position.toString())
    if (data.image) formData.append('image', data.image)
    
    const response = await apiClient.post<Item>(`/categories/${categoryId}/items`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  updateItem: async (id: number, data: UpdateItemData): Promise<Item> => {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.price !== undefined) formData.append('price', data.price.toString())
    if (data.description !== undefined) formData.append('description', data.description)
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString())
    if (data.position !== undefined) formData.append('position', data.position.toString())
    if (data.image) formData.append('image', data.image)
    
    const response = await apiClient.put<Item>(`/items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`)
  },
}



