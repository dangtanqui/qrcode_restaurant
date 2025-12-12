import { apiClient } from './client'

export interface SignupData {
  email: string
  password: string
  password_confirmation: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  user: {
    id: number
    email: string
  }
  token: string
}

export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/signup', data)
    return response.data
  },
  
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/login', data)
    return response.data
  },
}



