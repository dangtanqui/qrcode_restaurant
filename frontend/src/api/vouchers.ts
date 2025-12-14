import { apiClient } from './client'

export interface Voucher {
  id: number
  restaurant_id: number
  code: string
  name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  used_count: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateVoucherData {
  code: string
  name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number
  usage_limit?: number
  start_date: string
  end_date: string
  is_active?: boolean
}

export const vouchersApi = {
  getVouchers: async (restaurantId: number): Promise<Voucher[]> => {
    const response = await apiClient.get<Voucher[]>(`/restaurants/${restaurantId}/vouchers`)
    return response.data
  },

  createVoucher: async (restaurantId: number, data: CreateVoucherData): Promise<Voucher> => {
    const response = await apiClient.post<Voucher>(`/restaurants/${restaurantId}/vouchers`, data)
    return response.data
  },

  updateVoucher: async (restaurantId: number, voucherId: number, data: Partial<CreateVoucherData>): Promise<Voucher> => {
    const response = await apiClient.put<Voucher>(`/restaurants/${restaurantId}/vouchers/${voucherId}`, data)
    return response.data
  },

  deleteVoucher: async (restaurantId: number, voucherId: number): Promise<void> => {
    await apiClient.delete(`/restaurants/${restaurantId}/vouchers/${voucherId}`)
  },
}

