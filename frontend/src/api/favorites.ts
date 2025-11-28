import apiClient from './client'
import { Favorite } from '../types'

export const favoritesApi = {
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await apiClient.get('/favorites')
    return response.data
  },

  addFavorite: async (vehicleId: string): Promise<Favorite> => {
    const response = await apiClient.post('/favorites', { vehicleId })
    return response.data
  },

  removeFavorite: async (favoriteId: string): Promise<void> => {
    await apiClient.delete(`/favorites/${favoriteId}`)
  },
}

