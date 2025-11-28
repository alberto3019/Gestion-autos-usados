import apiClient from './client'
import { Vehicle, PaginatedResponse, SearchFilters } from '../types'

export const vehiclesApi = {
  getMyVehicles: async (params?: any): Promise<PaginatedResponse<Vehicle>> => {
    const response = await apiClient.get('/vehicles/mine', { params })
    return response.data
  },

  createVehicle: async (data: any): Promise<Vehicle> => {
    const response = await apiClient.post('/vehicles', data)
    return response.data
  },

  getVehicleById: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get(`/vehicles/${id}`)
    return response.data
  },

  updateVehicle: async (id: string, data: any): Promise<Vehicle> => {
    const response = await apiClient.patch(`/vehicles/${id}`, data)
    return response.data
  },

  updateVehicleStatus: async (
    id: string,
    status: string
  ): Promise<Vehicle> => {
    const response = await apiClient.patch(`/vehicles/${id}/status`, { status })
    return response.data
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicles/${id}`)
  },

  searchVehicles: async (
    filters: SearchFilters
  ): Promise<PaginatedResponse<Vehicle>> => {
    const response = await apiClient.get('/vehicles/search', { params: filters })
    return response.data
  },

  importVehicles: async (file: File): Promise<{
    success: number
    errors: number
    errorsDetails: Array<{ row: number; error: string }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/vehicles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  exportVehicles: async (): Promise<Blob> => {
    const response = await apiClient.get('/vehicles/export', {
      responseType: 'blob',
    })
    return response.data
  },

  bulkUpdateStatus: async (vehicleIds: string[], status: string): Promise<{
    message: string
    count: number
  }> => {
    const response = await apiClient.patch('/vehicles/bulk/status', {
      vehicleIds,
      status,
    })
    return response.data
  },

  bulkDelete: async (vehicleIds: string[]): Promise<{
    message: string
    count: number
  }> => {
    const response = await apiClient.post('/vehicles/bulk/delete', {
      vehicleIds,
    })
    return response.data
  },
}

