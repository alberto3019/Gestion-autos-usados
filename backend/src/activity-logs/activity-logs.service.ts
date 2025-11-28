import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    agencyId?: string;
    type: ActivityType;
    action: string;
    description: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.activityLog.create({
      data,
    });
  }

  async getAll(page: number = 1, limit: number = 50, filters?: any) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.agencyId) {
      where.agencyId = filters.agencyId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getActivityStats() {
    const [
      totalActivities,
      todayActivities,
      weekActivities,
      activitiesByType,
      recentActivities,
    ] = await Promise.all([
      this.prisma.activityLog.count(),
      this.prisma.activityLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      this.prisma.activityLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      this.prisma.activityLog.groupBy({
        by: ['type'],
        _count: true,
        orderBy: {
          _count: {
            type: 'desc',
          },
        },
      }),
      this.prisma.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalActivities,
      todayActivities,
      weekActivities,
      activitiesByType,
      recentActivities,
    };
  }

  async getActivityTimeline(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const activities = await this.prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        type: true,
      },
    });

    // Group by date
    const timeline: Record<string, any> = {};
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      if (!timeline[date]) {
        timeline[date] = {
          date,
          total: 0,
          byType: {},
        };
      }
      timeline[date].total++;
      timeline[date].byType[activity.type] =
        (timeline[date].byType[activity.type] || 0) + 1;
    });

    return Object.values(timeline).sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }
}

