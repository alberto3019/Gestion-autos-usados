import apiClient from './client'
import { Metrics } from '../types'

export const metricsApi = {
  getMetrics: async (params?: {
    startDate?: string
    endDate?: string
    vehicleId?: string
    sellerId?: string
  }): Promise<Metrics> => {
    const response = await apiClient.get('/metrics', { params })
    return response.data
  },
}

