import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan, ManagementModule } from '@prisma/client';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getAgencySubscription(agencyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { agencyId },
      include: {
        enabledModules: {
          where: { isEnabled: true },
        },
      },
    });

    if (!subscription) {
      return null;
    }

    return subscription;
  }

  async createOrUpdateSubscription(
    agencyId: string,
    plan: SubscriptionPlan,
    enabledBy?: string,
  ) {
    const subscription = await this.prisma.subscription.upsert({
      where: { agencyId },
      create: {
        agencyId,
        plan,
        isActive: true,
        startDate: new Date(),
      },
      update: {
        plan,
        updatedAt: new Date(),
      },
    });

    // Enable default modules for the plan (pass subscriptionId directly)
    await this.enableDefaultModulesForPlan(agencyId, plan, subscription.id, enabledBy);

    return subscription;
  }

  async updateSubscription(
    agencyId: string,
    dto: UpdateSubscriptionDto,
    enabledBy?: string,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { agencyId },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    const updated = await this.prisma.subscription.update({
      where: { agencyId },
      data: {
        plan: dto.plan,
        isActive: dto.isActive,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        updatedAt: new Date(),
      },
    });

    // If plan changed, update default modules
    if (dto.plan && dto.plan !== subscription.plan) {
      await this.enableDefaultModulesForPlan(agencyId, dto.plan, updated.id, enabledBy);
    }

    return updated;
  }

  async enableDefaultModulesForPlan(
    agencyId: string,
    plan: SubscriptionPlan,
    subscriptionId: string,
    enabledBy?: string,
  ) {
    const defaultModules = this.getDefaultModulesForPlan(plan);

    for (const module of defaultModules) {
      await this.prisma.agencyModule.upsert({
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
          subscriptionId: subscriptionId,
        },
        update: {
          isEnabled: true,
          enabledBy,
          enabledAt: new Date(),
          subscriptionId: subscriptionId,
        },
      });
    }
  }

  private getDefaultModulesForPlan(plan: SubscriptionPlan): ManagementModule[] {
    switch (plan) {
      case SubscriptionPlan.basic:
        return [
          ManagementModule.stock,
          ManagementModule.clients,
          ManagementModule.statistics,
        ];
      case SubscriptionPlan.premium:
        return [
          ManagementModule.stock,
          ManagementModule.vehicle_inspection,
          ManagementModule.clients,
          ManagementModule.cashflow,
          ManagementModule.statistics,
          ManagementModule.balances,
          ManagementModule.metrics,
        ];
      case SubscriptionPlan.enterprise:
        return [
          ManagementModule.stock,
          ManagementModule.vehicle_inspection,
          ManagementModule.clients,
          ManagementModule.cashflow,
          ManagementModule.statistics,
          ManagementModule.financing_tracking,
          ManagementModule.balances,
          ManagementModule.invoicing_afip,
          ManagementModule.metrics,
          ManagementModule.sales_platforms,
        ];
      default:
        return [];
    }
  }

  async getEnabledModules(agencyId: string) {
    const modules = await this.prisma.agencyModule.findMany({
      where: {
        agencyId,
        isEnabled: true,
      },
    });

    return modules.map((m) => m.module);
  }
}

