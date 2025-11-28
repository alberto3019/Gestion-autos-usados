import apiClient from './client';

export const activityLogsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    userId?: string;
    agencyId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const { data } = await apiClient.get('/activity-logs', { params });
    return data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/activity-logs/stats');
    return data;
  },

  getTimeline: async (days: number = 30) => {
    const { data } = await apiClient.get('/activity-logs/timeline', {
      params: { days },
    });
    return data;
  },
};

