import { apiClient } from './client'

export interface Restaurant {
  id: number
  name: string
  address: string
  slug: string
  currency?: string
  exchange_rate?: number
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface CreateRestaurantData {
  name: string
  address: string
  logo?: File
}

export const restaurantsApi = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await apiClient.get<Restaurant[]>('/restaurants')
    return response.data
  },
  
  getOne: async (id: number): Promise<Restaurant> => {
    const response = await apiClient.get<Restaurant>(`/restaurants/${id}`)
    return response.data
  },
  
  create: async (data: CreateRestaurantData): Promise<Restaurant> => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('address', data.address)
    if (data.logo) {
      formData.append('logo', data.logo)
    }
    const response = await apiClient.post<Restaurant>('/restaurants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  update: async (id: number, data: Partial<CreateRestaurantData>): Promise<Restaurant> => {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.address) formData.append('address', data.address)
    if (data.logo) formData.append('logo', data.logo)
    const response = await apiClient.put<Restaurant>(`/restaurants/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurants/${id}`)
  },
}



