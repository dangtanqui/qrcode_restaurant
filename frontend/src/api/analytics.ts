import { apiClient } from './client'

export interface AnalyticsData {
  total_orders: number
  total_revenue: number
  average_order_value: number
  orders_by_status: Record<string, number>
  revenue_by_date: Array<{
    date: string
    revenue: number
    orders: number
  }>
  top_items: Array<{
    item_id: number
    item_name: string
    quantity_sold: number
    revenue: number
  }>
  orders_by_hour: Array<{
    hour: number
    orders: number
  }>
}

export const analyticsApi = {
  getAnalytics: async (restaurantId: number, startDate?: string, endDate?: string): Promise<AnalyticsData> => {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)
    const response = await apiClient.get<AnalyticsData>(`/restaurants/${restaurantId}/analytics?${params.toString()}`)
    return response.data
  },
}

