import apiClient from './client'
import { Financing, PaginatedResponse } from '../types'

export const financingApi = {
  createFinancing: async (data: any): Promise<Financing> => {
    const response = await apiClient.post('/financing', data)
    return response.data
  },

  getFinancings: async (params?: {
    status?: string
    vehicleId?: string
    clientId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Financing>> => {
    const response = await apiClient.get('/financing', { params })
    return response.data
  },

  getFinancing: async (id: string): Promise<Financing> => {
    const response = await apiClient.get(`/financing/${id}`)
    return response.data
  },

  updateFinancing: async (id: string, data: any): Promise<Financing> => {
    const response = await apiClient.patch(`/financing/${id}`, data)
    return response.data
  },

  deleteFinancing: async (id: string): Promise<void> => {
    await apiClient.delete(`/financing/${id}`)
  },
}

