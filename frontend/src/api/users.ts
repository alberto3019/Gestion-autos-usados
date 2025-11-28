import apiClient from './client'

export interface AgencyUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'agency_admin' | 'agency_user'
  isActive: boolean
  createdAt: string
}

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'agency_admin' | 'agency_user'
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  role?: 'agency_admin' | 'agency_user'
  isActive?: boolean
}

export const usersApi = {
  getAgencyUsers: async (): Promise<AgencyUser[]> => {
    const response = await apiClient.get('/users/agency')
    return response.data
  },

  createUser: async (data: CreateUserData): Promise<AgencyUser> => {
    const response = await apiClient.post('/users', data)
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<AgencyUser> => {
    const response = await apiClient.patch(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}

