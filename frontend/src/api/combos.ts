import { apiClient } from './client'

export interface ComboItem {
  id: number
  item_id: number
  item_name: string
  quantity: number
  item_price: number
}

export interface Combo {
  id: number
  restaurant_id: number
  name: string
  description: string
  price: number
  image_url?: string | null
  total_original_price: number
  savings: number
  savings_percentage: number
  is_available: boolean
  items: ComboItem[]
  created_at: string
  updated_at: string
}

export interface CreateComboData {
  name: string
  description: string
  price: number
  image?: File
  items: Array<{
    item_id: number
    quantity: number
  }>
  is_available?: boolean
}

export const combosApi = {
  getCombos: async (restaurantId: number): Promise<Combo[]> => {
    const response = await apiClient.get<Combo[]>(`/restaurants/${restaurantId}/combos`)
    return response.data
  },

  createCombo: async (restaurantId: number, data: CreateComboData): Promise<Combo> => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    if (data.image) formData.append('image', data.image)
    formData.append('items', JSON.stringify(data.items))
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString())

    const response = await apiClient.post<Combo>(`/restaurants/${restaurantId}/combos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  updateCombo: async (restaurantId: number, comboId: number, data: Partial<CreateComboData>): Promise<Combo> => {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.price !== undefined) formData.append('price', data.price.toString())
    if (data.image) formData.append('image', data.image)
    if (data.items) formData.append('items', JSON.stringify(data.items))
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString())

    const response = await apiClient.put<Combo>(`/restaurants/${restaurantId}/combos/${comboId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  deleteCombo: async (restaurantId: number, comboId: number): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/combos/${comboId}`)
  },
}

