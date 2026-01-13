import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionType, TransactionCategory, Currency } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BalanceHelperService } from '../balances/balance-helper.service';
import { SalesStatsService } from '../sales-stats/sales-stats.service';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { translateCategory } from './utils/category-translations';

@Injectable()
export class CashflowService {
  constructor(
    private prisma: PrismaService,
    private balanceHelper: BalanceHelperService,
    private salesStatsService: SalesStatsService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  async createTransaction(agencyId: string, dto: CreateTransactionDto) {
    const transaction = await this.prisma.cashflowTransaction.create({
      data: {
        agencyId,
        type: dto.type,
        category: dto.category,
        amount: new Decimal(dto.amount),
        currency: dto.currency || 'ARS',
        description: dto.description,
        date: new Date(dto.date),
        vehicleId: dto.vehicleId,
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    // Actualizar balance automáticamente si hay vehicleId
    if (dto.vehicleId && dto.category) {
      try {
        await this.balanceHelper.updateBalanceFromCashflow(
          dto.vehicleId,
          dto.category,
          new Decimal(dto.amount),
          dto.currency || 'ARS',
        );
      } catch (error) {
        // Log error but don't fail the transaction creation
        console.error('Error updating balance from cashflow:', error);
      }
    }

    // Si es una venta de vehículo y tiene vendedor, crear Sale automáticamente
    if (
      dto.category === TransactionCategory.vehicle_sale &&
      dto.vehicleId &&
      dto.sellerId
    ) {
      try {
        await this.salesStatsService.createSale(agencyId, {
          vehicleId: dto.vehicleId,
          sellerId: dto.sellerId,
          salePrice: dto.amount,
          currency: dto.currency || 'ARS',
          saleDate: dto.date,
          notes: dto.description,
        });
      } catch (error) {
        // Log error but don't fail the transaction creation
        console.error('Error creating sale from cashflow:', error);
      }
    }

    return transaction;
  }

  async getTransactions(
    agencyId: string,
    type?: TransactionType,
    category?: TransactionCategory,
    startDate?: string,
    endDate?: string,
    vehicleId?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { agencyId };

    if (type) where.type = type;
    if (category) where.category = category;
    if (vehicleId) where.vehicleId = vehicleId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.cashflowTransaction.findMany({
        where,
        include: {
          vehicle: {
            include: { photos: { take: 1, orderBy: { order: 'asc' } } },
          },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.cashflowTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      total,
      page,
      limit,
    };
  }

  async getTransaction(id: string, agencyId: string) {
    const transaction = await this.prisma.cashflowTransaction.findFirst({
      where: { id, agencyId },
      include: {
        vehicle: {
          include: { photos: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }

  async updateTransaction(
    id: string,
    agencyId: string,
    dto: Partial<CreateTransactionDto>,
  ) {
    const transaction = await this.prisma.cashflowTransaction.findFirst({
      where: { id, agencyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    const updated = await this.prisma.cashflowTransaction.update({
      where: { id },
      data: {
        type: dto.type,
        category: dto.category,
        amount: dto.amount ? new Decimal(dto.amount) : undefined,
        currency: dto.currency,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        vehicleId: dto.vehicleId,
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    return updated;
  }

  async deleteTransaction(id: string, agencyId: string) {
    const transaction = await this.prisma.cashflowTransaction.findFirst({
      where: { id, agencyId },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    await this.prisma.cashflowTransaction.delete({
      where: { id },
    });

    return { message: 'Transacción eliminada exitosamente' };
  }

  async getCashflowReport(
    agencyId: string,
    startDate: string,
    endDate: string,
  ) {
    const transactions = await this.prisma.cashflowTransaction.findMany({
      where: {
        agencyId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Obtener tipo de cambio actual
    const usdRate = await this.exchangeRateService.getUsdRate();

    // Función para convertir a ARS
    const convertToArs = (amount: Decimal, currency: Currency): Decimal => {
      if (currency === Currency.ARS) {
        return amount;
      }
      if (currency === Currency.USD) {
        return amount.times(usdRate);
      }
      // EUR aproximado
      if (currency === Currency.EUR) {
        return amount.times(usdRate).times(1.1);
      }
      return amount;
    };

    let totalIncome = new Decimal(0);
    let totalExpenses = new Decimal(0);

    transactions.forEach((t) => {
      const amountInArs = convertToArs(t.amount, t.currency);
      if (t.type === 'income') {
        totalIncome = totalIncome.plus(amountInArs);
      } else {
        totalExpenses = totalExpenses.plus(amountInArs);
      }
    });

    const netCashflow = totalIncome.minus(totalExpenses);

    const byCategory = transactions.reduce((acc, t) => {
      const key = t.category;
      if (!acc[key]) {
        acc[key] = { income: new Decimal(0), expense: new Decimal(0) };
      }
      const amountInArs = convertToArs(t.amount, t.currency);
      if (t.type === 'income') {
        acc[key].income = acc[key].income.plus(amountInArs);
      } else {
        acc[key].expense = acc[key].expense.plus(amountInArs);
      }
      return acc;
    }, {} as Record<string, { income: Decimal; expense: Decimal }>);

    return {
      period: { startDate, endDate },
      exchangeRate: {
        usdToArs: usdRate,
        lastUpdated: await this.exchangeRateService.getLastUpdated(),
      },
      summary: {
        totalIncome: totalIncome.toNumber(),
        totalExpenses: totalExpenses.toNumber(),
        netCashflow: netCashflow.toNumber(),
        transactionCount: transactions.length,
      },
      byCategory: Object.entries(byCategory).map(([category, values]) => ({
        category,
        categoryLabel: translateCategory(category as TransactionCategory),
        income: values.income.toNumber(),
        expense: values.expense.toNumber(),
        net: values.income.minus(values.expense).toNumber(),
      })),
    };
  }
}

