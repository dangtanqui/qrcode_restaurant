import { apiClient } from './client'

export interface Promotion {
  id: number
  restaurant_id: number
  name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreatePromotionData {
  name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  start_date: string
  end_date: string
  is_active?: boolean
}

export const promotionsApi = {
  getPromotions: async (restaurantId: number): Promise<Promotion[]> => {
    const response = await apiClient.get<Promotion[]>(`/restaurants/${restaurantId}/promotions`)
    return response.data
  },

  createPromotion: async (restaurantId: number, data: CreatePromotionData): Promise<Promotion> => {
    const response = await apiClient.post<Promotion>(`/restaurants/${restaurantId}/promotions`, data)
    return response.data
  },

  updatePromotion: async (restaurantId: number, promotionId: number, data: Partial<CreatePromotionData>): Promise<Promotion> => {
    const response = await apiClient.put<Promotion>(`/restaurants/${restaurantId}/promotions/${promotionId}`, data)
    return response.data
  },

  deletePromotion: async (restaurantId: number, promotionId: number): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/promotions/${promotionId}`)
  },
}

