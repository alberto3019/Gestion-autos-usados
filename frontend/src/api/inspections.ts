import apiClient from './client'
import { VehicleInspection, PaginatedResponse } from '../types'

export const inspectionsApi = {
  createInspection: async (data: any): Promise<VehicleInspection> => {
    const response = await apiClient.post('/vehicle-inspections', data)
    return response.data
  },

  getInspections: async (params?: {
    vehicleId?: string
  }): Promise<VehicleInspection[]> => {
    const response = await apiClient.get('/vehicle-inspections', { params })
    return response.data
  },

  getInspection: async (id: string): Promise<VehicleInspection> => {
    const response = await apiClient.get(`/vehicle-inspections/${id}`)
    return response.data
  },

  updateInspection: async (
    id: string,
    data: any
  ): Promise<VehicleInspection> => {
    const response = await apiClient.patch(`/vehicle-inspections/${id}`, data)
    return response.data
  },

  deleteInspection: async (id: string): Promise<void> => {
    await apiClient.delete(`/vehicle-inspections/${id}`)
  },

  generatePdf: async (id: string): Promise<{ pdfUrl: string }> => {
    const response = await apiClient.post(`/vehicle-inspections/${id}/pdf`)
    return response.data
  },
}

