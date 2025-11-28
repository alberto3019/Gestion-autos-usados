import apiClient from './client'

export const whatsappApi = {
  logClick: async (vehicleId: string): Promise<void> => {
    await apiClient.post('/whatsapp-logs', { vehicleId })
  },
}

