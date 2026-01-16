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
    try {
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
    } catch (error) {
      console.error('Error en updateAgencySubscription:', error);
      throw error;
    }
  }

  async enableModule(
    agencyId: string,
    module: ManagementModule,
    enabledBy: string,
  ) {
    try {
      const agency = await this.prisma.agency.findUnique({
        where: { id: agencyId },
        include: {
          subscription: true,
        },
      });

      if (!agency) {
        throw new NotFoundException('Agencia no encontrada');
      }

      // Si no hay suscripción, crear una básica
      let subscription = agency.subscription;
      if (!subscription) {
        subscription = await this.subscriptionsService.createOrUpdateSubscription(
          agencyId,
          'basic',
          enabledBy,
        );
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
          subscriptionId: subscription.id,
        },
        update: {
          isEnabled: true,
          enabledBy,
          enabledAt: new Date(),
          subscriptionId: subscription.id,
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
    } catch (error) {
      console.error('Error en enableModule:', error);
      throw error;
    }
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
    try {
      const agency = await this.prisma.agency.findUnique({
        where: { id: agencyId },
      });

      if (!agency) {
        throw new NotFoundException('Agencia no encontrada');
      }

      // Get subscription and modules separately to avoid relation errors
      const subscription = await this.prisma.subscription.findUnique({
        where: { agencyId },
      });

      const modules = await this.prisma.agencyModule.findMany({
        where: { agencyId },
      });

      return {
        subscription: subscription || null,
        modules: modules || [],
      };
    } catch (error) {
      console.error('Error en getAgencyModules:', error);
      throw error;
    }
  }

  // Payment Management Methods

  async getAgenciesWithPayments(page: number = 1, limit: number = 20, filters?: {
    month?: number;
    year?: number;
    isPaid?: boolean;
    paymentMethod?: string;
    search?: string;
  }) {
    try {
      const where: any = {
        status: 'active',
        subscription: {
          isActive: true,
        },
      };

      if (filters?.search) {
        where.OR = [
          { commercialName: { contains: filters.search, mode: 'insensitive' } },
          { businessName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Primero obtener todas las agencias sin paginación para filtrar correctamente
      // Usar try-catch para la relación paymentRecords en caso de que la tabla no exista aún
      let allAgencies;
      try {
        allAgencies = await this.prisma.agency.findMany({
          where,
          include: {
            subscription: {
              include: {
                paymentRecords: {
                  // Incluir todos los registros, luego filtraremos en la respuesta
                  orderBy: [
                    { year: 'desc' },
                    { month: 'desc' },
                    { createdAt: 'desc' },
                  ],
                  take: 10, // Tomar más registros para tener el del mes/año si existe
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (relationError: any) {
        // Si hay error con paymentRecords (tabla no existe), incluir agencias sin paymentRecords
        console.warn('Error al cargar paymentRecords, continuando sin ellos:', relationError.message);
        allAgencies = await this.prisma.agency.findMany({
          where,
          include: {
            subscription: true,
          },
          orderBy: { createdAt: 'desc' },
        });
        // Agregar paymentRecords vacío a cada agencia
        allAgencies = allAgencies.map((agency) => ({
          ...agency,
          subscription: agency.subscription
            ? {
                ...agency.subscription,
                paymentRecords: [],
              }
            : null,
        }));
      }

      // Seleccionar el registro de pago del mes/año especificado o el más reciente
      const agenciesWithSelectedPayment = allAgencies.map((agency) => {
        if (!agency.subscription?.paymentRecords || agency.subscription.paymentRecords.length === 0) {
          return agency;
        }

        // Si hay filtro de mes/año, buscar ese registro específico
        if (filters?.month && filters?.year) {
          const selectedPayment = agency.subscription.paymentRecords.find(
            (pr) => pr.month === filters.month && pr.year === filters.year
          );
          // Si existe, reemplazar el array con solo ese registro
          if (selectedPayment) {
            return {
              ...agency,
              subscription: {
                ...agency.subscription,
                paymentRecords: [selectedPayment],
              },
            };
          }
        }

        // Si no hay filtro o no existe registro para ese mes/año, usar el más reciente
        return {
          ...agency,
          subscription: {
            ...agency.subscription,
            paymentRecords: agency.subscription.paymentRecords.slice(0, 1),
          },
        };
      });

      // Filtrar por estado de pago y método de pago si es necesario
      let filteredAgencies = agenciesWithSelectedPayment;
      if (filters?.isPaid !== undefined) {
        filteredAgencies = filteredAgencies.filter((agency) => {
          const lastPayment = agency.subscription?.paymentRecords?.[0];
          // Si no tiene registro de pago y el filtro es "pagado", no incluirlo
          if (!lastPayment) return filters.isPaid === false;
          return lastPayment.isPaid === filters.isPaid;
        });
      }

      if (filters?.paymentMethod) {
        filteredAgencies = filteredAgencies.filter((agency) => {
          const lastPayment = agency.subscription?.paymentRecords?.[0];
          const paymentMethod = lastPayment?.paymentMethod || agency.subscription?.paymentMethod;
          return paymentMethod && paymentMethod.toLowerCase().includes(filters.paymentMethod.toLowerCase());
        });
      }

      // Aplicar paginación después de filtrar
      const total = filteredAgencies.length;
      const skip = (page - 1) * limit;
      const paginatedAgencies = filteredAgencies.slice(skip, skip + limit);

      console.log(`[getAgenciesWithPayments] Total agencies found: ${allAgencies.length}, Filtered: ${filteredAgencies.length}, Paginated: ${paginatedAgencies.length}`);

      return {
        data: paginatedAgencies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error en getAgenciesWithPayments:', error);
      throw error;
    }
  }

  async getAgencyPaymentDetails(agencyId: string) {
    try {
      const agency = await this.prisma.agency.findUnique({
        where: { id: agencyId },
        include: {
          subscription: {
            include: {
              paymentRecords: {
                orderBy: [{ year: 'desc' }, { month: 'desc' }],
              },
            },
          },
        },
      });

      if (!agency) {
        throw new NotFoundException('Agencia no encontrada');
      }

      return agency;
    } catch (error) {
      console.error('Error en getAgencyPaymentDetails:', error);
      throw error;
    }
  }

  async getPaymentRecords(filters?: {
    agencyId?: string;
    month?: number;
    year?: number;
    isPaid?: boolean;
  }) {
    try {
      const where: any = {};

      if (filters?.agencyId) {
        where.agencyId = filters.agencyId;
      }

      if (filters?.month) {
        where.month = filters.month;
      }

      if (filters?.year) {
        where.year = filters.year;
      }

      if (filters?.isPaid !== undefined) {
        where.isPaid = filters.isPaid;
      }

      const records = await this.prisma.paymentRecord.findMany({
        where,
        include: {
          agency: true,
          subscription: true,
        },
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      });

      return records;
    } catch (error) {
      console.error('Error en getPaymentRecords:', error);
      throw error;
    }
  }

  async createOrUpdatePaymentRecord(dto: any, userId: string) {
    try {
      const agency = await this.prisma.agency.findUnique({
        where: { id: dto.agencyId },
        include: { subscription: true },
      });

      if (!agency || agency.status !== 'active') {
        throw new NotFoundException('Agencia no encontrada o inactiva');
      }

      if (!agency.subscription) {
        throw new NotFoundException('La agencia no tiene suscripción activa');
      }

      // Calcular monto base según el plan
      const planAmounts = {
        basic: 30,
        premium: 70,
        enterprise: 100,
      };
      const baseAmount = planAmounts[agency.subscription.plan] || 0;
      const extraAmount = dto.extraAmount || 0;
      const totalAmount = baseAmount + extraAmount;

      // Calcular fecha de vencimiento
      let dueDate: Date;
      if (dto.dueDate) {
        dueDate = new Date(dto.dueDate);
      } else {
        const billingDay = agency.subscription.billingDay || 1;
        dueDate = new Date(dto.year, dto.month - 1, billingDay);
        // Si el día de facturación es mayor al último día del mes, usar el último día
        const lastDayOfMonth = new Date(dto.year, dto.month, 0).getDate();
        if (billingDay > lastDayOfMonth) {
          dueDate = new Date(dto.year, dto.month - 1, lastDayOfMonth);
        }
      }

      const paymentRecord = await this.prisma.paymentRecord.upsert({
        where: {
          agencyId_year_month: {
            agencyId: dto.agencyId,
            year: dto.year,
            month: dto.month,
          },
        },
        create: {
          agencyId: dto.agencyId,
          subscriptionId: agency.subscription.id,
          year: dto.year,
          month: dto.month,
          dueDate,
          amount: baseAmount,
          extraAmount,
          totalAmount,
          paymentMethod: dto.paymentMethod || agency.subscription.paymentMethod,
          isPaid: dto.isPaid || false,
          paidAt: dto.isPaid ? (dto.paidAt ? new Date(dto.paidAt) : new Date()) : null,
          paidBy: dto.isPaid ? userId : null,
          notes: dto.notes,
        },
        update: {
          extraAmount,
          totalAmount,
          paymentMethod: dto.paymentMethod || agency.subscription.paymentMethod,
          isPaid: dto.isPaid !== undefined ? dto.isPaid : undefined,
          paidAt: dto.isPaid
            ? dto.paidAt
              ? new Date(dto.paidAt)
              : new Date()
            : dto.isPaid === false
            ? null
            : undefined,
          paidBy: dto.isPaid ? userId : dto.isPaid === false ? null : undefined,
          notes: dto.notes !== undefined ? dto.notes : undefined,
          updatedAt: new Date(),
        },
        include: {
          agency: true,
          subscription: true,
        },
      });

      // Si se marca como pagado, crear registro en PaymentHistory
      if (paymentRecord.isPaid && !dto.skipHistory) {
        await this.prisma.paymentHistory.create({
          data: {
            agencyId: dto.agencyId,
            paymentRecordId: paymentRecord.id,
            amount: paymentRecord.totalAmount,
            paymentMethod: paymentRecord.paymentMethod || 'No especificado',
            paymentDate: paymentRecord.paidAt || new Date(),
            notes: paymentRecord.notes,
            createdBy: userId,
          },
        });
      }

      return paymentRecord;
    } catch (error) {
      console.error('Error en createOrUpdatePaymentRecord:', error);
      throw error;
    }
  }

  async updatePaymentRecord(id: string, dto: any, userId: string) {
    try {
      const existingRecord = await this.prisma.paymentRecord.findUnique({
        where: { id },
        include: { agency: { include: { subscription: true } } },
      });

      if (!existingRecord) {
        throw new NotFoundException('Registro de pago no encontrado');
      }

      const baseAmount = existingRecord.amount;
      const extraAmount = dto.extraAmount !== undefined ? dto.extraAmount : existingRecord.extraAmount || 0;
      const totalAmount = baseAmount + extraAmount;

      const wasPaidBefore = existingRecord.isPaid;
      const isPaidNow = dto.isPaid !== undefined ? dto.isPaid : existingRecord.isPaid;

      const paymentRecord = await this.prisma.paymentRecord.update({
        where: { id },
        data: {
          extraAmount,
          totalAmount,
          paymentMethod: dto.paymentMethod !== undefined ? dto.paymentMethod : existingRecord.paymentMethod,
          isPaid: isPaidNow,
          paidAt: isPaidNow
            ? dto.paidAt
              ? new Date(dto.paidAt)
              : existingRecord.paidAt || new Date()
            : null,
          paidBy: isPaidNow ? userId : null,
          notes: dto.notes !== undefined ? dto.notes : existingRecord.notes,
          updatedAt: new Date(),
        },
        include: {
          agency: true,
          subscription: true,
        },
      });

      // Si se marca como pagado por primera vez, crear registro en PaymentHistory
      if (isPaidNow && !wasPaidBefore) {
        await this.prisma.paymentHistory.create({
          data: {
            agencyId: existingRecord.agencyId,
            paymentRecordId: paymentRecord.id,
            amount: paymentRecord.totalAmount,
            paymentMethod: paymentRecord.paymentMethod || 'No especificado',
            paymentDate: paymentRecord.paidAt || new Date(),
            notes: paymentRecord.notes,
            createdBy: userId,
          },
        });
      }

      return paymentRecord;
    } catch (error) {
      console.error('Error en updatePaymentRecord:', error);
      throw error;
    }
  }

  async generatePaymentRecordsForMonth(month: number, year: number, userId: string) {
    try {
      const activeAgencies = await this.prisma.agency.findMany({
        where: {
          status: 'active',
          subscription: {
            isActive: true,
          },
        },
        include: {
          subscription: true,
        },
      });

      const planAmounts = {
        basic: 30,
        premium: 70,
        enterprise: 100,
      };

      const createdRecords = [];

      for (const agency of activeAgencies) {
        if (!agency.subscription) continue;

        // Verificar si ya existe un registro para este mes/año
        const existingRecord = await this.prisma.paymentRecord.findUnique({
          where: {
            agencyId_year_month: {
              agencyId: agency.id,
              year,
              month,
            },
          },
        });

        if (existingRecord) {
          continue; // Skip si ya existe
        }

        const baseAmount = planAmounts[agency.subscription.plan] || 0;
        const billingDay = agency.subscription.billingDay || 1;
        let dueDate = new Date(year, month - 1, billingDay);
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        if (billingDay > lastDayOfMonth) {
          dueDate = new Date(year, month - 1, lastDayOfMonth);
        }

        const record = await this.prisma.paymentRecord.create({
          data: {
            agencyId: agency.id,
            subscriptionId: agency.subscription.id,
            year,
            month,
            dueDate,
            amount: baseAmount,
            extraAmount: 0,
            totalAmount: baseAmount,
            paymentMethod: agency.subscription.paymentMethod,
            isPaid: false,
          },
          include: {
            agency: true,
            subscription: true,
          },
        });

        createdRecords.push(record);
      }

      return {
        created: createdRecords.length,
        records: createdRecords,
      };
    } catch (error) {
      console.error('Error en generatePaymentRecordsForMonth:', error);
      throw error;
    }
  }

  async getPaymentAlerts() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const fiveDaysFromNow = new Date(today);
      fiveDaysFromNow.setDate(today.getDate() + 5);

      // Pagos próximos a vencer (5 días antes) sin pagar
      const upcomingAlerts = await this.prisma.paymentRecord.findMany({
        where: {
          isPaid: false,
          dueDate: {
            gte: today,
            lte: fiveDaysFromNow,
          },
        },
        include: {
          agency: true,
          subscription: true,
        },
        orderBy: { dueDate: 'asc' },
      });

      // Pagos vencidos sin pagar
      const overdueAlerts = await this.prisma.paymentRecord.findMany({
        where: {
          isPaid: false,
          dueDate: {
            lt: today,
          },
        },
        include: {
          agency: true,
          subscription: true,
        },
        orderBy: { dueDate: 'asc' },
      });

      return {
        upcoming: upcomingAlerts.map((record) => {
          const daysUntilDue = Math.ceil(
            (record.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            paymentRecord: record,
            daysUntilDue,
            isOverdue: false,
          };
        }),
        overdue: overdueAlerts.map((record) => {
          const daysOverdue = Math.ceil(
            (today.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return {
            paymentRecord: record,
            daysOverdue,
            isOverdue: true,
          };
        }),
      };
    } catch (error) {
      console.error('Error en getPaymentAlerts:', error);
      throw error;
    }
  }
}

