import apiClient from './client'
import { StockSettings, VehicleStockStatus } from '../types'

export const stockApi = {
  getStockSettings: async (): Promise<StockSettings> => {
    const response = await apiClient.get('/stock/settings')
    return response.data
  },

  updateStockSettings: async (
    data: StockSettings
  ): Promise<StockSettings> => {
    const response = await apiClient.patch('/stock/settings', data)
    return response.data
  },

  getVehiclesWithStockStatus: async (params?: {
    status?: 'green' | 'yellow' | 'red'
  }): Promise<VehicleStockStatus[]> => {
    const response = await apiClient.get('/stock/vehicles', { params })
    return response.data
  },

  getStockStatistics: async (): Promise<{
    total: number
    green: number
    yellow: number
    red: number
  }> => {
    const response = await apiClient.get('/stock/statistics')
    return response.data
  },
}

