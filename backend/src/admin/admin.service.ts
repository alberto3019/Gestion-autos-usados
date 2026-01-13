import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { EmailService } from '../email/email.service';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionPlan, ManagementModule } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private activityLogsService: ActivityLogsService,
    private emailService: EmailService,
    private exchangeRateService: ExchangeRateService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async getAgencies(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [agencies, total] = await Promise.all([
      this.prisma.agency.findMany({
        where,
        include: {
          _count: {
            select: {
              vehicles: true,
              users: true,
            },
          },
          subscription: {
            select: {
              plan: true,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.agency.count({ where }),
    ]);

    const data = agencies.map((agency) => ({
      id: agency.id,
      businessName: agency.businessName,
      commercialName: agency.commercialName,
      taxId: agency.taxId,
      email: agency.email,
      whatsapp: agency.whatsapp,
      addressCity: agency.addressCity,
      addressState: agency.addressState,
      status: agency.status,
      vehicleCount: agency._count.vehicles,
      userCount: agency._count.users,
      subscriptionPlan: agency.subscription?.plan || null,
      subscriptionActive: agency.subscription?.isActive || false,
      createdAt: agency.createdAt,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async approveAgency(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const updated = await this.prisma.agency.update({
      where: { id: agencyId },
      data: { status: 'active' },
    });

    // Log activity
    await this.activityLogsService.log({
      agencyId: updated.id,
      type: 'agency_approved',
      action: 'Aprobación de Agencia',
      description: `Agencia aprobada: ${updated.commercialName}`,
      metadata: {
        agencyId: updated.id,
        agencyName: updated.commercialName,
        previousStatus: agency.status,
      },
    });

    // Enviar email de aprobación
    try {
      await this.emailService.sendAgencyApprovalEmail(
        updated.email,
        updated.commercialName,
      );
    } catch (error) {
      console.error('Error sending approval email:', error);
      // No fallar la aprobación si falla el email
    }

    return {
      message: 'Agencia aprobada exitosamente',
      agency: updated,
    };
  }

  async blockAgency(agencyId: string, reason?: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const updated = await this.prisma.agency.update({
      where: { id: agencyId },
      data: { status: 'blocked' },
    });

    // Log activity
    await this.activityLogsService.log({
      agencyId: updated.id,
      type: 'agency_blocked',
      action: 'Bloqueo de Agencia',
      description: `Agencia bloqueada: ${updated.commercialName}${reason ? ` - Razón: ${reason}` : ''}`,
      metadata: {
        agencyId: updated.id,
        agencyName: updated.commercialName,
        previousStatus: agency.status,
        reason,
      },
    });

    return {
      message: 'Agencia bloqueada exitosamente',
      reason,
      agency: updated,
    };
  }

  async resetAgencyPassword(agencyId: string, newPassword: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        users: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña de todos los usuarios de la agencia
    await this.prisma.user.updateMany({
      where: { agencyId },
      data: { passwordHash },
    });

    // Log activity para cada usuario
    for (const user of agency.users) {
      await this.activityLogsService.log({
        userId: user.id,
        agencyId: agency.id,
        type: 'user_updated',
        action: 'Cambio de Contraseña Forzado',
        description: `Super Admin cambió la contraseña del usuario ${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          changedBy: 'super_admin',
        },
      });
    }

    return {
      message: 'Contraseña actualizada exitosamente para todos los usuarios de la agencia',
      usersUpdated: agency.users.length,
    };
  }

  async getStats() {
    const [
      totalAgencies,
      activeAgencies,
      pendingAgencies,
      blockedAgencies,
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      soldVehicles,
      totalWhatsappClicks,
    ] = await Promise.all([
      this.prisma.agency.count(),
      this.prisma.agency.count({ where: { status: 'active' } }),
      this.prisma.agency.count({ where: { status: 'pending' } }),
      this.prisma.agency.count({ where: { status: 'blocked' } }),
      // Solo contar vehículos de agencias activas
      this.prisma.vehicle.count({
        where: { agency: { status: 'active' } },
      }),
      this.prisma.vehicle.count({
        where: { status: 'available', agency: { status: 'active' } },
      }),
      this.prisma.vehicle.count({
        where: { status: 'reserved', agency: { status: 'active' } },
      }),
      this.prisma.vehicle.count({
        where: { status: 'sold', agency: { status: 'active' } },
      }),
      this.prisma.whatsappClickLog.count(),
    ]);

    // WhatsApp clicks del último mes
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthClicks = await this.prisma.whatsappClickLog.count({
      where: {
        clickedAt: {
          gte: oneMonthAgo,
        },
      },
    });

    return {
      agencies: {
        total: totalAgencies,
        active: activeAgencies,
        pending: pendingAgencies,
        blocked: blockedAgencies,
      },
      vehicles: {
        total: totalVehicles,
        available: availableVehicles,
        reserved: reservedVehicles,
        sold: soldVehicles,
      },
      whatsappClicks: {
        total: totalWhatsappClicks,
        lastMonth: lastMonthClicks,
      },
    };
  }

  async getAdvancedStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Obtener tasa de cambio
    const usdRate = await this.exchangeRateService.getUsdRate();
    const eurRate = usdRate * 1.1; // EUR aproximado

    // Estadísticas Overview - Solo agencias activas
    const [
      totalAgencies,
      activeAgencies,
      totalVehicles,
      availableVehicles,
      totalUsers,
      totalFavorites,
      totalVehiclePhotos,
      totalWhatsappClicks,
      availableVehiclesData,
    ] = await Promise.all([
      this.prisma.agency.count(),
      this.prisma.agency.count({ where: { status: 'active' } }),
      // Solo vehículos de agencias activas
      this.prisma.vehicle.count({
        where: { agency: { status: 'active' } },
      }),
      this.prisma.vehicle.count({
        where: { status: 'available', agency: { status: 'active' } },
      }),
      this.prisma.user.count(),
      this.prisma.favorite.count(),
      this.prisma.vehiclePhoto.count(),
      this.prisma.whatsappClickLog.count(),
      this.prisma.vehicle.findMany({
        where: { status: 'available', agency: { status: 'active' } },
        select: { price: true, currency: true },
      }),
    ]);

    // Calcular valor total del inventario convirtiendo todas las monedas a ARS
    const totalInventoryValue = availableVehiclesData.reduce((sum, vehicle) => {
      const price = Number(vehicle.price);
      if (vehicle.currency === 'ARS') {
        return sum + price;
      } else if (vehicle.currency === 'USD') {
        return sum + (price * usdRate);
      } else if (vehicle.currency === 'EUR') {
        return sum + (price * eurRate);
      }
      return sum;
    }, 0);

    // Top agencias por vehículos
    const topAgenciesByVehicles = await this.prisma.agency.findMany({
      where: { status: 'active' },
      take: 10,
      include: {
        _count: {
          select: { vehicles: true },
        },
      },
      orderBy: {
        vehicles: {
          _count: 'desc',
        },
      },
    });

    // Top vehículos más favoriteados - Solo de agencias activas
    const topVehiclesByFavorites = await this.prisma.vehicle.findMany({
      where: { agency: { status: 'active' } },
      take: 10,
      include: {
        _count: {
          select: { favorites: true },
        },
        agency: {
          select: {
            commercialName: true,
          },
        },
      },
      orderBy: {
        favorites: {
          _count: 'desc',
        },
      },
    });

    // Top vehículos más contactados - Solo de agencias activas
    const topVehiclesByContacts = await this.prisma.vehicle.findMany({
      where: { agency: { status: 'active' } },
      take: 10,
      include: {
        _count: {
          select: { whatsappClickLogs: true },
        },
        agency: {
          select: {
            commercialName: true,
          },
        },
      },
      orderBy: {
        whatsappClickLogs: {
          _count: 'desc',
        },
      },
    });

    // Obtener IDs de agencias activas
    const activeAgencyIds = (
      await this.prisma.agency.findMany({
        where: { status: 'active' },
        select: { id: true },
      })
    ).map((a) => a.id);

    // Vehículos por marca - Solo agencias activas
    const vehiclesByBrand = await this.prisma.vehicle.groupBy({
      by: ['brand'],
      where: { agencyId: { in: activeAgencyIds } },
      _count: true,
      orderBy: {
        _count: {
          brand: 'desc',
        },
      },
      take: 10,
    });

    // Vehículos por estado - Solo agencias activas
    const vehiclesByStatus = await this.prisma.vehicle.groupBy({
      by: ['status'],
      where: { agencyId: { in: activeAgencyIds } },
      _count: true,
    });

    // Vehículos por combustible - Solo agencias activas
    const vehiclesByFuelType = await this.prisma.vehicle.groupBy({
      by: ['fuelType'],
      where: { agencyId: { in: activeAgencyIds } },
      _count: true,
      orderBy: {
        _count: {
          fuelType: 'desc',
        },
      },
    });

    // Vehículos por provincia - Solo agencias activas
    const vehiclesByState = await this.prisma.vehicle.groupBy({
      by: ['locationState'],
      where: { agencyId: { in: activeAgencyIds } },
      _count: true,
      orderBy: {
        _count: {
          locationState: 'desc',
        },
      },
      take: 10,
    });

    // Crecimiento de agencias últimos 30 días
    const agencyGrowth = await this.prisma.agency.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Crecimiento de vehículos últimos 30 días - Solo agencias activas
    const vehicleGrowth = await this.prisma.vehicle.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        agencyId: { in: activeAgencyIds },
      },
      select: {
        createdAt: true,
      },
    });

    // Agrupar datos de crecimiento por día
    const agencyGrowthByDay = this.groupByDay(agencyGrowth.map(a => a.createdAt));
    const vehicleGrowthByDay = this.groupByDay(vehicleGrowth.map(v => v.createdAt));

    return {
      overview: {
        totalAgencies,
        activeAgencies,
        totalVehicles,
        availableVehicles,
        totalUsers,
        totalFavorites,
        totalPhotos: totalVehiclePhotos,
        totalWhatsappClicks,
        totalInventoryValue: totalInventoryValue,
      },
      distribution: {
        vehiclesByBrand: vehiclesByBrand.map((v) => ({
          name: v.brand,
          value: v._count,
        })),
        vehiclesByStatus: vehiclesByStatus.map((v) => ({
          name: this.translateStatus(v.status),
          value: v._count,
        })),
        vehiclesByFuelType: vehiclesByFuelType.map((v) => ({
          name: this.translateFuelType(v.fuelType),
          value: v._count,
        })),
        vehiclesByProvince: vehiclesByState.map((v) => ({
          name: v.locationState || 'Sin especificar',
          value: v._count,
        })),
      },
      rankings: {
        topAgenciesByVehicles: topAgenciesByVehicles.map((a) => ({
          name: a.commercialName,
          value: a._count.vehicles,
        })),
        topFavoritedVehicles: topVehiclesByFavorites.map((v) => ({
          brand: v.brand,
          model: v.model,
          year: v.year,
          favorites: v._count.favorites,
        })),
        topContactedVehicles: topVehiclesByContacts.map((v) => ({
          brand: v.brand,
          model: v.model,
          year: v.year,
          contacts: v._count.whatsappClickLogs,
        })),
      },
      growth: {
        agencyGrowth: agencyGrowthByDay,
        vehicleGrowth: vehicleGrowthByDay,
      },
    };
  }

  // Helper method to translate vehicle status to Spanish
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      available: 'Disponible',
      reserved: 'Reservado',
      sold: 'Vendido',
      paused: 'Pausado',
    };
    return translations[status] || status;
  }

  // Helper method to translate fuel type to Spanish
  private translateFuelType(fuelType: string): string {
    const translations: Record<string, string> = {
      gasoline: 'Nafta',
      diesel: 'Diésel',
      hybrid: 'Híbrido',
      electric: 'Eléctrico',
      cng: 'GNC',
      lpg: 'GLP',
    };
    return translations[fuelType] || fuelType;
  }

  // Helper method to group data by day
  private groupByDay(dates: Date[]): { date: string; count: number }[] {
    const grouped = dates.reduce((acc, date) => {
      const day = date.toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get last 30 days
    const result: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: grouped[dateStr] || 0,
      });
    }
    return result;
  }

  async getUsersWithLastLogin() {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          not: 'super_admin',
        },
      },
      include: {
        agency: {
          select: {
            id: true,
            commercialName: true,
            status: true,
          },
        },
      },
      orderBy: {
        lastLogin: {
          sort: 'desc',
          nulls: 'last',
        },
      },
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      agency: user.agency
        ? {
            id: user.agency.id,
            commercialName: user.agency.commercialName,
            status: user.agency.status,
          }
        : null,
    }));
  }

  async updateAgencySubscription(
    agencyId: string,
    plan: SubscriptionPlan,
    enabledBy: string,
  ) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const subscription = await this.subscriptionsService.createOrUpdateSubscription(
      agencyId,
      plan,
      enabledBy,
    );

    await this.activityLogsService.log({
      agencyId,
      type: 'agency_updated',
      action: 'Actualización de Suscripción',
      description: `Plan actualizado a ${plan} para ${agency.commercialName}`,
      metadata: {
        agencyId,
        plan,
        enabledBy,
      },
    });

    return subscription;
  }

  async enableModule(
    agencyId: string,
    module: ManagementModule,
    enabledBy: string,
  ) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const agencyModule = await this.prisma.agencyModule.upsert({
      where: {
        agencyId_module: {
          agencyId,
          module,
        },
      },
      create: {
        agencyId,
        module,
        isEnabled: true,
        enabledBy,
        enabledAt: new Date(),
      },
      update: {
        isEnabled: true,
        enabledBy,
        enabledAt: new Date(),
      },
    });

    await this.activityLogsService.log({
      agencyId,
      type: 'agency_updated',
      action: 'Módulo Habilitado',
      description: `Módulo ${module} habilitado para ${agency.commercialName}`,
      metadata: {
        agencyId,
        module,
        enabledBy,
      },
    });

    return agencyModule;
  }

  async disableModule(
    agencyId: string,
    module: ManagementModule,
    enabledBy: string,
  ) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const agencyModule = await this.prisma.agencyModule.update({
      where: {
        agencyId_module: {
          agencyId,
          module,
        },
      },
      data: {
        isEnabled: false,
        enabledBy,
        enabledAt: new Date(),
      },
    });

    await this.activityLogsService.log({
      agencyId,
      type: 'agency_updated',
      action: 'Módulo Deshabilitado',
      description: `Módulo ${module} deshabilitado para ${agency.commercialName}`,
      metadata: {
        agencyId,
        module,
        enabledBy,
      },
    });

    return agencyModule;
  }

  async getAgencyModules(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      include: {
        enabledModules: true,
        subscription: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    return {
      subscription: agency.subscription,
      modules: agency.enabledModules,
    };
  }
}

