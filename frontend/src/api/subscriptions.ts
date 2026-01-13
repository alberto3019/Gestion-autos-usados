import apiClient from './client'
import { Subscription, ManagementModule } from '../types'

export const subscriptionsApi = {
  getMySubscription: async (): Promise<Subscription> => {
    const response = await apiClient.get('/subscriptions/me')
    return response.data
  },

  getMyEnabledModules: async (): Promise<{ modules: ManagementModule[] }> => {
    const response = await apiClient.get('/subscriptions/me/modules')
    return response.data
  },
}

