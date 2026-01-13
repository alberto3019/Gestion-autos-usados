import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  async getVehicleBalance(vehicleId: string, agencyId: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, agencyId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    let balance = await this.prisma.vehicleBalance.findUnique({
      where: { vehicleId },
    });

    if (!balance) {
      // Create default balance if it doesn't exist
      balance = await this.prisma.vehicleBalance.create({
        data: {
          vehicleId,
          purchasePrice: new Decimal(0),
          investment: new Decimal(0),
        },
      });
    }

    // Calculate profit if sale price exists
    if (balance.salePrice) {
      const profit = balance.salePrice
        .minus(balance.purchasePrice)
        .minus(balance.investment);
      const profitMargin =
        balance.purchasePrice.toNumber() > 0
          ? profit
              .dividedBy(balance.purchasePrice.plus(balance.investment))
              .times(100)
          : new Decimal(0);

      balance = await this.prisma.vehicleBalance.update({
        where: { vehicleId },
        data: {
          profit,
          profitMargin,
        },
      });
    }

    return balance;
  }

  async updateVehicleBalance(
    vehicleId: string,
    agencyId: string,
    data: {
      purchasePrice?: string;
      investment?: string;
      salePrice?: string;
    },
  ) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, agencyId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    const balance = await this.prisma.vehicleBalance.upsert({
      where: { vehicleId },
      create: {
        vehicleId,
        purchasePrice: data.purchasePrice
          ? new Decimal(data.purchasePrice)
          : new Decimal(0),
        investment: data.investment
          ? new Decimal(data.investment)
          : new Decimal(0),
        salePrice: data.salePrice ? new Decimal(data.salePrice) : null,
      },
      update: {
        purchasePrice: data.purchasePrice
          ? new Decimal(data.purchasePrice)
          : undefined,
        investment: data.investment ? new Decimal(data.investment) : undefined,
        salePrice: data.salePrice
          ? new Decimal(data.salePrice)
          : data.salePrice === null
            ? null
            : undefined,
      },
    });

    // Recalculate profit
    if (balance.salePrice) {
      const profit = balance.salePrice
        .minus(balance.purchasePrice)
        .minus(balance.investment);
      const profitMargin =
        balance.purchasePrice.toNumber() > 0
          ? profit
              .dividedBy(balance.purchasePrice.plus(balance.investment))
              .times(100)
          : new Decimal(0);

      return this.prisma.vehicleBalance.update({
        where: { vehicleId },
        data: {
          profit,
          profitMargin,
        },
      });
    }

    return balance;
  }

  async getBalancesReport(agencyId: string) {
    const balances = await this.prisma.vehicleBalance.findMany({
      where: {
        vehicle: {
          agencyId,
        },
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    let totalPurchasePrice = new Decimal(0);
    let totalInvestment = new Decimal(0);
    let totalSalePrice = new Decimal(0);
    let totalProfit = new Decimal(0);
    let soldCount = 0;

    balances.forEach((balance) => {
      totalPurchasePrice = totalPurchasePrice.plus(balance.purchasePrice);
      totalInvestment = totalInvestment.plus(balance.investment);
      if (balance.salePrice) {
        totalSalePrice = totalSalePrice.plus(balance.salePrice);
        if (balance.profit) {
          totalProfit = totalProfit.plus(balance.profit);
        }
        soldCount++;
      }
    });

    const totalCost = totalPurchasePrice.plus(totalInvestment);
    const averageProfitMargin =
      balances.length > 0
        ? balances
            .filter((b) => b.profitMargin)
            .reduce((sum, b) => sum.plus(b.profitMargin || 0), new Decimal(0))
            .dividedBy(soldCount || 1)
        : new Decimal(0);

    return {
      summary: {
        totalVehicles: balances.length,
        soldVehicles: soldCount,
        totalPurchasePrice: totalPurchasePrice.toNumber(),
        totalInvestment: totalInvestment.toNumber(),
        totalCost: totalCost.toNumber(),
        totalSalePrice: totalSalePrice.toNumber(),
        totalProfit: totalProfit.toNumber(),
        averageProfitMargin: averageProfitMargin.toNumber(),
      },
      balances: balances.map((b) => ({
        ...b,
        purchasePrice: b.purchasePrice.toNumber(),
        investment: b.investment.toNumber(),
        salePrice: b.salePrice?.toNumber(),
        profit: b.profit?.toNumber(),
        profitMargin: b.profitMargin?.toNumber(),
      })),
    };
  }

  async getBalances(agencyId: string, vehicleId?: string) {
    const where: any = {
      vehicle: {
        agencyId,
      },
    };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const balances = await this.prisma.vehicleBalance.findMany({
      where,
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return balances.map((b) => ({
      ...b,
      purchasePrice: b.purchasePrice.toNumber(),
      investment: b.investment.toNumber(),
      salePrice: b.salePrice?.toNumber(),
      profit: b.profit?.toNumber(),
      profitMargin: b.profitMargin?.toNumber(),
    }));
  }
}

