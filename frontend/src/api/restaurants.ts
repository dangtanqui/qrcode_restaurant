import { apiClient } from './client'

export interface Restaurant {
  id: number
  name: string
  address: string
  phone?: string
  slug: string
  currency?: string
  exchange_rate?: number
  logo_url: string | null
  qr_code_url?: string | null
  button_style?: string
  font_family?: string
  theme_color?: string
  background_color?: string
  text_color?: string
  button_text_color?: string
  header_note?: string
  footnote?: string
  grand_opening_date?: string
  grand_opening_message?: string
  is_grand_opening?: boolean
  facebook_url?: string
  tiktok_url?: string
  instagram_url?: string
  created_at: string
  updated_at: string
}

export interface CreateRestaurantData {
  name: string
  address: string
  phone?: string
  logo?: File
  qr_code?: File
  button_style?: string
  font_family?: string
  theme_color?: string
  background_color?: string
  text_color?: string
  button_text_color?: string
  header_note?: string
  footnote?: string
  grand_opening_date?: string
  grand_opening_message?: string
  is_grand_opening?: boolean
  facebook_url?: string
  tiktok_url?: string
  instagram_url?: string
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
    formData.append('name', data.name || '')
    formData.append('address', data.address || '')
    formData.append('phone', data.phone || '')
    if (data.logo instanceof File) formData.append('logo', data.logo)
    if (data.qr_code instanceof File) formData.append('qr_code', data.qr_code)
    formData.append('button_style', data.button_style || 'rounded-full')
    formData.append('font_family', data.font_family || 'Inter')
    formData.append('theme_color', data.theme_color || '')
    formData.append('background_color', data.background_color || '')
    formData.append('text_color', data.text_color || '')
    formData.append('button_text_color', data.button_text_color || '')
    formData.append('header_note', data.header_note || '')
    formData.append('footnote', data.footnote || '')
    formData.append('grand_opening_date', data.grand_opening_date || '')
    formData.append('grand_opening_message', data.grand_opening_message || '')
    formData.append('is_grand_opening', data.is_grand_opening ? 'true' : 'false')
    formData.append('facebook_url', data.facebook_url || '')
    formData.append('tiktok_url', data.tiktok_url || '')
    formData.append('instagram_url', data.instagram_url || '')
    const response = await apiClient.post<Restaurant>('/restaurants', formData)
    return response.data
  },
  
  update: async (id: number, data: any): Promise<Restaurant> => {
    // First, update text fields using JSON (Rails API mode handles JSON well)
    const textData: any = {
      name: data.name,
      address: data.address,
      phone: data.phone || '',
      button_style: data.button_style || 'rounded-full',
      font_family: data.font_family || 'Inter',
      theme_color: data.theme_color || '',
      background_color: data.background_color || '',
      text_color: data.text_color || '',
      button_text_color: data.button_text_color || '',
      header_note: data.header_note || '',
      footnote: data.footnote || '',
      grand_opening_date: data.grand_opening_date || '',
      grand_opening_message: data.grand_opening_message || '',
      is_grand_opening: data.is_grand_opening || false,
      facebook_url: data.facebook_url || '',
      tiktok_url: data.tiktok_url || '',
      instagram_url: data.instagram_url || '',
    }
    
    // Remove undefined values
    Object.keys(textData).forEach(key => {
      if (textData[key] === undefined) delete textData[key]
    })
    
    const response = await apiClient.patch<Restaurant>(`/restaurants/${id}`, textData)
    
    // Then, update files separately if they exist
    if (data.logo instanceof File || data.qr_code instanceof File) {
      const formData = new FormData()
      if (data.logo instanceof File) formData.append('logo', data.logo)
      if (data.qr_code instanceof File) formData.append('qr_code', data.qr_code)
      await apiClient.post(`/restaurants/${id}/update_files`, formData)
    }
    
    return response.data
  },
  
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/restaurants/${id}`)
  },
}



