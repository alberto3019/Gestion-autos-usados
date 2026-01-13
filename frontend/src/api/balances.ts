import apiClient from './client'
import { VehicleBalance } from '../types'

export const balancesApi = {
  getBalances: async (params?: {
    vehicleId?: string
  }): Promise<VehicleBalance[]> => {
    const response = await apiClient.get('/balances', { params })
    return response.data
  },

  getBalancesReport: async (): Promise<any> => {
    const response = await apiClient.get('/balances/report')
    return response.data
  },

  getVehicleBalance: async (vehicleId: string): Promise<VehicleBalance> => {
    const response = await apiClient.get(`/balances/vehicle/${vehicleId}`)
    return response.data
  },

  updateVehicleBalance: async (
    vehicleId: string,
    data: {
      purchasePrice?: string
      investment?: string
      salePrice?: string
    }
  ): Promise<VehicleBalance> => {
    const response = await apiClient.patch(
      `/balances/vehicle/${vehicleId}`,
      data
    )
    return response.data
  },
}

