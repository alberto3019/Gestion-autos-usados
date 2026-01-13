import apiClient from './client'
import { CashflowTransaction, PaginatedResponse } from '../types'

export const cashflowApi = {
  createTransaction: async (data: any): Promise<CashflowTransaction> => {
    const response = await apiClient.post('/cashflow', data)
    return response.data
  },

  getTransactions: async (params?: {
    type?: 'income' | 'expense'
    category?: string
    startDate?: string
    endDate?: string
    vehicleId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<CashflowTransaction>> => {
    const response = await apiClient.get('/cashflow', { params })
    return response.data
  },

  getCashflowReport: async (params: {
    startDate: string
    endDate: string
  }): Promise<any> => {
    const response = await apiClient.get('/cashflow/report', { params })
    return response.data
  },

  getTransaction: async (id: string): Promise<CashflowTransaction> => {
    const response = await apiClient.get(`/cashflow/${id}`)
    return response.data
  },

  updateTransaction: async (
    id: string,
    data: any
  ): Promise<CashflowTransaction> => {
    const response = await apiClient.patch(`/cashflow/${id}`, data)
    return response.data
  },

  deleteTransaction: async (id: string): Promise<void> => {
    await apiClient.delete(`/cashflow/${id}`)
  },
}

