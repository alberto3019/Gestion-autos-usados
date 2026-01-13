import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(
    agencyId: string,
    startDate?: string,
    endDate?: string,
    vehicleId?: string,
    sellerId?: string,
  ) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Vehicle metrics
    const vehiclesWhere: any = { agencyId };
    if (vehicleId) vehiclesWhere.id = vehicleId;
    if (startDate || endDate) vehiclesWhere.createdAt = dateFilter;

    const totalVehicles = await this.prisma.vehicle.count({
      where: vehiclesWhere,
    });

    const vehiclesByStatus = await this.prisma.vehicle.groupBy({
      by: ['status'],
      where: vehiclesWhere,
      _count: true,
    });

    // Sales metrics
    const salesWhere: any = { agencyId };
    if (sellerId) salesWhere.sellerId = sellerId;
    if (vehicleId) salesWhere.vehicleId = vehicleId;
    if (startDate || endDate) salesWhere.saleDate = dateFilter;

    const sales = await this.prisma.sale.findMany({
      where: salesWhere,
    });

    let totalSales = sales.length;
    let totalRevenue = new Decimal(0);
    let totalCommission = new Decimal(0);

    sales.forEach((sale) => {
      totalRevenue = totalRevenue.plus(sale.salePrice);
      if (sale.commission) {
        totalCommission = totalCommission.plus(sale.commission);
      }
    });

    // Cashflow metrics
    const cashflowWhere: any = { agencyId };
    if (startDate || endDate) cashflowWhere.date = dateFilter;

    const cashflowTransactions = await this.prisma.cashflowTransaction.findMany(
      {
        where: cashflowWhere,
      },
    );

    let totalIncome = new Decimal(0);
    let totalExpenses = new Decimal(0);

    cashflowTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome = totalIncome.plus(t.amount);
      } else {
        totalExpenses = totalExpenses.plus(t.amount);
      }
    });

    // Clients metrics
    const clientsWhere: any = { agencyId };
    if (vehicleId) {
      clientsWhere.OR = [
        { currentVehicleId: vehicleId },
        { desiredVehicleId: vehicleId },
      ];
    }

    const totalClients = await this.prisma.client.count({
      where: clientsWhere,
    });

    const clientsWithAlerts = await this.prisma.client.count({
      where: {
        ...clientsWhere,
        alertEnabled: true,
      },
    });

    // Financing metrics
    const financingWhere: any = { agencyId };
    if (vehicleId) financingWhere.vehicleId = vehicleId;

    const financings = await this.prisma.financing.findMany({
      where: financingWhere,
    });

    const financingByStatus = financings.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Balance metrics
    const balances = await this.prisma.vehicleBalance.findMany({
      where: {
        vehicle: {
          agencyId,
          ...(vehicleId ? { id: vehicleId } : {}),
        },
      },
    });

    let totalPurchasePrice = new Decimal(0);
    let totalInvestment = new Decimal(0);
    let totalSalePrice = new Decimal(0);
    let totalProfit = new Decimal(0);

    balances.forEach((b) => {
      totalPurchasePrice = totalPurchasePrice.plus(b.purchasePrice);
      totalInvestment = totalInvestment.plus(b.investment);
      if (b.salePrice) {
        totalSalePrice = totalSalePrice.plus(b.salePrice);
        if (b.profit) {
          totalProfit = totalProfit.plus(b.profit);
        }
      }
    });

    return {
      period: { startDate, endDate },
      filters: { vehicleId, sellerId },
      vehicles: {
        total: totalVehicles,
        byStatus: vehiclesByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      },
      sales: {
        total: totalSales,
        revenue: totalRevenue.toNumber(),
        commission: totalCommission.toNumber(),
        averageSalePrice:
          totalSales > 0 ? totalRevenue.dividedBy(totalSales).toNumber() : 0,
      },
      cashflow: {
        income: totalIncome.toNumber(),
        expenses: totalExpenses.toNumber(),
        net: totalIncome.minus(totalExpenses).toNumber(),
      },
      clients: {
        total: totalClients,
        withAlerts: clientsWithAlerts,
      },
      financing: {
        total: financings.length,
        byStatus: financingByStatus,
      },
      balances: {
        totalPurchasePrice: totalPurchasePrice.toNumber(),
        totalInvestment: totalInvestment.toNumber(),
        totalSalePrice: totalSalePrice.toNumber(),
        totalProfit: totalProfit.toNumber(),
        totalCost: totalPurchasePrice.plus(totalInvestment).toNumber(),
      },
    };
  }
}

