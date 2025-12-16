import apiClient from './client'
import { Agency, PaginatedResponse, AdminStats } from '../types'

export const adminApi = {
  getAgencies: async (params?: any): Promise<PaginatedResponse<Agency>> => {
    const response = await apiClient.get('/admin/agencies', { params })
    return response.data
  },

  approveAgency: async (id: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/agencies/${id}/approve`)
    return response.data
  },

  blockAgency: async (id: string, reason?: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/agencies/${id}/block`, {
      reason,
    })
    return response.data
  },

  resetAgencyPassword: async (id: string, newPassword: string): Promise<any> => {
    const response = await apiClient.patch(`/admin/agencies/${id}/reset-password`, {
      newPassword,
    })
    return response.data
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/admin/stats')
    return response.data
  },

  getAdvancedStats: async (): Promise<any> => {
    const response = await apiClient.get('/admin/stats/advanced')
    return response.data
  },

  getUsersWithLastLogin: async (): Promise<any> => {
    const response = await apiClient.get('/admin/users/last-login')
    return response.data
  },
}

