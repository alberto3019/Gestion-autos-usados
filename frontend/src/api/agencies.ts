import apiClient from './client'
import { Agency } from '../types'

export const agenciesApi = {
  getMyAgency: async (): Promise<Agency> => {
    const response = await apiClient.get('/agencies/me')
    return response.data
  },

  updateMyAgency: async (data: any): Promise<Agency> => {
    const response = await apiClient.patch('/agencies/me', data)
    return response.data
  },
}

