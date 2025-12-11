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
    try {
      const response = await apiClient.post<AuthResponse>('/login', data)
      console.log('Login response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Login API error:', error)
      throw error
    }
  },
}



