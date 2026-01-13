import apiClient from './client'
import { Invoice, PaginatedResponse } from '../types'

export const invoicingApi = {
  getAfipSettings: async (): Promise<any> => {
    const response = await apiClient.get('/invoicing/afip-settings')
    return response.data
  },

  updateAfipSettings: async (data: {
    afipCuit?: string
    afipPointOfSale?: number
    afipCertificate?: string
    afipPrivateKey?: string
  }): Promise<any> => {
    const response = await apiClient.patch('/invoicing/afip-settings', data)
    return response.data
  },

  createInvoice: async (
    data: any,
    vehicleId?: string
  ): Promise<Invoice> => {
    const response = await apiClient.post('/invoicing', data, {
      params: vehicleId ? { vehicleId } : {},
    })
    return response.data
  },

  getInvoices: async (params?: {
    status?: string
    type?: 'A' | 'B' | 'C'
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Invoice>> => {
    const response = await apiClient.get('/invoicing', { params })
    return response.data
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/invoicing/${id}`)
    return response.data
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoicing/${id}`)
  },
}

