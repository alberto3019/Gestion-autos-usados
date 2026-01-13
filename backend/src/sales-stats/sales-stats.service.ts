import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { BalanceHelperService } from '../balances/balance-helper.service';

@Injectable()
export class SalesStatsService {
  constructor(
    private prisma: PrismaService,
    private balanceHelper: BalanceHelperService,
  ) {}

  async createSale(agencyId: string, dto: CreateSaleDto) {
    const seller = await this.prisma.user.findFirst({
      where: {
        id: dto.sellerId,
        agencyId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Vendedor no encontrado');
    }

    const salePrice = new Decimal(dto.salePrice);
    let commission: Decimal | null = null;

    if (seller.commissionPercentage) {
      commission = salePrice.times(seller.commissionPercentage).dividedBy(100);
    }

    const sale = await this.prisma.sale.create({
      data: {
        agencyId,
        vehicleId: dto.vehicleId,
        sellerId: dto.sellerId,
        clientId: dto.clientId,
        salePrice,
        commission,
        saleDate: new Date(dto.saleDate),
        notes: dto.notes,
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
        seller: true,
        client: true,
      },
    });

    // Update vehicle status to sold
    await this.prisma.vehicle.update({
      where: { id: dto.vehicleId },
      data: { status: 'sold' },
    });

    // Actualizar balance automáticamente con el precio de venta
    try {
      await this.balanceHelper.updateBalanceFromSale(dto.vehicleId, salePrice);
    } catch (error) {
      // Log error but don't fail the sale creation
      console.error('Error updating balance from sale:', error);
    }

    return sale;
  }

  async getSales(
    agencyId: string,
    sellerId?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { agencyId };

    if (sellerId) where.sellerId = sellerId;

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          vehicle: {
            include: { photos: { take: 1, orderBy: { order: 'asc' } } },
          },
          seller: true,
          client: true,
        },
        skip,
        take: limit,
        orderBy: { saleDate: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data: sales,
      total,
      page,
      limit,
    };
  }

  async getSellerStats(
    agencyId: string,
    sellerId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {
      agencyId,
      sellerId,
    };

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        vehicle: true,
      },
    });

    const totalSales = sales.length;
    let totalRevenue = new Decimal(0);
    let totalCommission = new Decimal(0);

    sales.forEach((sale) => {
      totalRevenue = totalRevenue.plus(sale.salePrice);
      if (sale.commission) {
        totalCommission = totalCommission.plus(sale.commission);
      }
    });

    return {
      sellerId,
      period: { startDate, endDate },
      totalSales,
      totalRevenue: totalRevenue.toNumber(),
      totalCommission: totalCommission.toNumber(),
      averageSalePrice:
        totalSales > 0 ? totalRevenue.dividedBy(totalSales).toNumber() : 0,
    };
  }

  async getSalesRanking(
    agencyId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 10,
  ) {
    const where: any = { agencyId };

    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        seller: true,
      },
    });

    const sellerStats = sales.reduce((acc, sale) => {
      const sellerId = sale.sellerId;
      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: sale.seller,
          sales: 0,
          revenue: new Decimal(0),
          commission: new Decimal(0),
        };
      }
      acc[sellerId].sales++;
      acc[sellerId].revenue = acc[sellerId].revenue.plus(sale.salePrice);
      if (sale.commission) {
        acc[sellerId].commission = acc[sellerId].commission.plus(
          sale.commission,
        );
      }
      return acc;
    }, {} as Record<string, any>);

    const ranking = Object.values(sellerStats)
      .map((stat: any) => ({
        seller: stat.seller,
        sales: stat.sales,
        revenue: stat.revenue.toNumber(),
        commission: stat.commission.toNumber(),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    return ranking;
  }

  async getSale(id: string, agencyId: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, agencyId },
      include: {
        vehicle: {
          include: { photos: true },
        },
        seller: true,
        client: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    return sale;
  }
}

