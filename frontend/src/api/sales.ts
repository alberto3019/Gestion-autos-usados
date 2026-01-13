import apiClient from './client'
import { Sale, PaginatedResponse } from '../types'

export const salesApi = {
  createSale: async (data: any): Promise<Sale> => {
    const response = await apiClient.post('/sales-stats', data)
    return response.data
  },

  getSales: async (params?: {
    sellerId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Sale>> => {
    const response = await apiClient.get('/sales-stats', { params })
    return response.data
  },

  getSalesRanking: async (params?: {
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<any[]> => {
    const response = await apiClient.get('/sales-stats/ranking', { params })
    return response.data
  },

  getSellerStats: async (
    sellerId: string,
    params?: {
      startDate?: string
      endDate?: string
    }
  ): Promise<any> => {
    const response = await apiClient.get(`/sales-stats/seller/${sellerId}`, {
      params,
    })
    return response.data
  },

  getSale: async (id: string): Promise<Sale> => {
    const response = await apiClient.get(`/sales-stats/sale/${id}`)
    return response.data
  },
}

