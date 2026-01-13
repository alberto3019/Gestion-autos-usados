import apiClient from './client'
import { Client, PaginatedResponse } from '../types'

export const clientsApi = {
  createClient: async (data: any): Promise<Client> => {
    const response = await apiClient.post('/clients', data)
    return response.data
  },

  getClients: async (params?: {
    search?: string
    vehicleId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get('/clients', { params })
    return response.data
  },

  getClientsWithAlerts: async (): Promise<Client[]> => {
    const response = await apiClient.get('/clients/alerts')
    return response.data
  },

  getClient: async (id: string): Promise<Client> => {
    const response = await apiClient.get(`/clients/${id}`)
    return response.data
  },

  updateClient: async (id: string, data: any): Promise<Client> => {
    const response = await apiClient.patch(`/clients/${id}`, data)
    return response.data
  },

  deleteClient: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`)
  },
}

