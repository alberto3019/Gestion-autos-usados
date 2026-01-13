import apiClient from './client'
import { UserModulePermission, ManagementModule } from '../types'

export const permissionsApi = {
  getMyPermissions: async (): Promise<UserModulePermission[]> => {
    const response = await apiClient.get('/user-permissions/me')
    return response.data
  },

  getUserPermissions: async (
    userId: string
  ): Promise<UserModulePermission[]> => {
    const response = await apiClient.get(`/user-permissions/user/${userId}`)
    return response.data
  },

  createPermission: async (
    userId: string,
    data: {
      module: ManagementModule
      canView?: boolean
      canEdit?: boolean
      canDelete?: boolean
    }
  ): Promise<UserModulePermission> => {
    const response = await apiClient.post(`/user-permissions/user/${userId}`, data)
    return response.data
  },

  updatePermission: async (
    userId: string,
    module: ManagementModule,
    data: {
      canView?: boolean
      canEdit?: boolean
      canDelete?: boolean
    }
  ): Promise<UserModulePermission> => {
    const response = await apiClient.patch(
      `/user-permissions/user/${userId}/module/${module}`,
      data
    )
    return response.data
  },

  deletePermission: async (
    userId: string,
    module: ManagementModule
  ): Promise<void> => {
    await apiClient.delete(`/user-permissions/user/${userId}/module/${module}`)
  },
}

