import { apiClient } from './client'

export interface Order {
  id: number
  restaurant_id: number
  table_number: string
  status: string
  payment_status?: string
  total: number
  created_at: string
  updated_at: string
  items: Array<{
    id: number
    item_id: number
    item_name: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export interface UpdateOrderData {
  status?: string
  payment_status?: string
  table_number?: string
}

export const ordersApi = {
  getOrders: async (restaurantId: number): Promise<Order[]> => {
    const response = await apiClient.get<Order[]>(`/restaurants/${restaurantId}/orders`)
    return response.data
  },
  
  getOrder: async (restaurantId: number, orderId: number): Promise<Order> => {
    const response = await apiClient.get<Order>(`/restaurants/${restaurantId}/orders/${orderId}`)
    return response.data
  },
  
  updateOrder: async (restaurantId: number, orderId: number, data: UpdateOrderData): Promise<Order> => {
    const response = await apiClient.put<Order>(`/restaurants/${restaurantId}/orders/${orderId}`, data)
    return response.data
  },
}

