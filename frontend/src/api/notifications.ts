import apiClient from './client'

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  readAt?: string
  createdAt: string
}

export const notificationsApi = {
  getNotifications: async (): Promise<{
    notifications: Notification[]
    unreadCount: number
  }> => {
    const response = await apiClient.get('/notifications')
    return response.data
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get('/notifications/unread-count')
    return response.data
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/notifications/read-all')
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`)
  },
}

