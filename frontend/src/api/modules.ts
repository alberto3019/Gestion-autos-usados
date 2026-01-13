import apiClient from './client'
import { AgencyModule, ManagementModule } from '../types'

export const modulesApi = {
  getAgencyModules: async (agencyId: string): Promise<{
    subscription: any
    modules: AgencyModule[]
  }> => {
    const response = await apiClient.get(`/admin/agencies/${agencyId}/modules`)
    return response.data
  },

  enableModule: async (
    agencyId: string,
    module: ManagementModule
  ): Promise<AgencyModule> => {
    const response = await apiClient.post(
      `/admin/agencies/${agencyId}/modules/${module}/enable`
    )
    return response.data
  },

  disableModule: async (
    agencyId: string,
    module: ManagementModule
  ): Promise<AgencyModule> => {
    const response = await apiClient.post(
      `/admin/agencies/${agencyId}/modules/${module}/disable`
    )
    return response.data
  },
}

