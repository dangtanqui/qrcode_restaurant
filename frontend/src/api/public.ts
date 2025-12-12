import axios from 'axios'
import { getApiBaseUrl } from './config'

const API_BASE_URL = getApiBaseUrl()

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface PublicMenu {
  restaurant: {
    id: number
    name: string
    address: string
    currency?: string
    exchange_rate?: number
    logo_url: string | null
  }
  categories: Array<{
    id: number
    name: string
    position: number
    items: Array<{
      id: number
      name: string
      price: number
      description: string | null
      is_available: boolean
      position: number
      image_url: string | null
    }>
  }>
}

export interface QRCodeResponse {
  qrcode: string
  url: string
}

export interface CreateOrderData {
  table_number: string
  items: Array<{
    item_id: number
    quantity: number
  }>
}

export interface OrderResponse {
  id: number
  restaurant_id: number
  table_number: string
  status: string
  payment_status?: string
  total: number
  items: Array<{
    id: number
    item_id: number
    item_name: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export const publicApi = {
  getMenu: async (slug: string): Promise<PublicMenu> => {
    const response = await publicClient.get<PublicMenu>(`/public/${slug}/menu`)
    return response.data
  },
  
  getQRCode: async (slug: string): Promise<QRCodeResponse> => {
    // Send frontend URL in header so backend can generate correct QR code URL
    const frontendUrl = window.location.origin
    const response = await publicClient.get<QRCodeResponse>(`/public/${slug}/qrcode`, {
      headers: {
        'X-Frontend-URL': frontendUrl
      }
    })
    return response.data
  },
  
  createOrder: async (slug: string, data: CreateOrderData): Promise<OrderResponse> => {
    const response = await publicClient.post<OrderResponse>(`/public/${slug}/orders`, data)
    return response.data
  },
}



