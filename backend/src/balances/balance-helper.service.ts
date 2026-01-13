import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionCategory } from '@prisma/client';

@Injectable()
export class BalanceHelperService {
  constructor(private prisma: PrismaService) {}

  /**
   * Actualiza el balance de un vehículo automáticamente basado en transacciones de cashflow
   */
  async updateBalanceFromCashflow(
    vehicleId: string,
    category: TransactionCategory,
    amount: Decimal,
  ) {
    // Obtener o crear el balance
    let balance = await this.prisma.vehicleBalance.findUnique({
      where: { vehicleId },
    });

    if (!balance) {
      balance = await this.prisma.vehicleBalance.create({
        data: {
          vehicleId,
          purchasePrice: new Decimal(0),
          investment: new Decimal(0),
        },
      });
    }

    // Si es compra de vehículo, actualizar purchasePrice
    if (category === 'vehicle_purchase') {
      await this.prisma.vehicleBalance.update({
        where: { vehicleId },
        data: {
          purchasePrice: amount,
        },
      });
    }
    // Si es un gasto relacionado al vehículo (servicio, mantenimiento, etc.), sumar a investment
    else if (
      category === 'service' ||
      category === 'maintenance' ||
      category === 'other'
    ) {
      const newInvestment = balance.investment.plus(amount);
      await this.prisma.vehicleBalance.update({
        where: { vehicleId },
        data: {
          investment: newInvestment,
        },
      });
    }

    // Recalcular profit si hay salePrice
    return this.recalculateProfit(vehicleId);
  }

  /**
   * Actualiza el salePrice del balance cuando se crea una venta
   */
  async updateBalanceFromSale(vehicleId: string, salePrice: Decimal) {
    // Obtener o crear el balance
    let balance = await this.prisma.vehicleBalance.findUnique({
      where: { vehicleId },
    });

    if (!balance) {
      balance = await this.prisma.vehicleBalance.create({
        data: {
          vehicleId,
          purchasePrice: new Decimal(0),
          investment: new Decimal(0),
        },
      });
    }

    // Actualizar salePrice solo si no está ya establecido (para no sobrescribir manualmente)
    if (!balance.salePrice) {
      await this.prisma.vehicleBalance.update({
        where: { vehicleId },
        data: {
          salePrice,
        },
      });
    }

    // Recalcular profit
    return this.recalculateProfit(vehicleId);
  }

  /**
   * Actualiza el salePrice del balance cuando se crea una factura (si aplica)
   */
  async updateBalanceFromInvoice(vehicleId: string, total: Decimal) {
    // Obtener o crear el balance
    let balance = await this.prisma.vehicleBalance.findUnique({
      where: { vehicleId },
    });

    if (!balance) {
      balance = await this.prisma.vehicleBalance.create({
        data: {
          vehicleId,
          purchasePrice: new Decimal(0),
          investment: new Decimal(0),
        },
      });
    }

    // Actualizar salePrice solo si no está ya establecido
    if (!balance.salePrice) {
      await this.prisma.vehicleBalance.update({
        where: { vehicleId },
        data: {
          salePrice: total,
        },
      });
    }

    // Recalcular profit
    return this.recalculateProfit(vehicleId);
  }

  /**
   * Recalcula el profit y profitMargin basado en purchasePrice, investment y salePrice
   */
  private async recalculateProfit(vehicleId: string) {
    const balance = await this.prisma.vehicleBalance.findUnique({
      where: { vehicleId },
    });

    if (!balance || !balance.salePrice) {
      return balance;
    }

    const profit = balance.salePrice
      .minus(balance.purchasePrice)
      .minus(balance.investment);

    const totalCost = balance.purchasePrice.plus(balance.investment);
    const profitMargin =
      totalCost.toNumber() > 0
        ? profit.dividedBy(totalCost).times(100)
        : new Decimal(0);

    return this.prisma.vehicleBalance.update({
      where: { vehicleId },
      data: {
        profit,
        profitMargin,
      },
    });
  }
}

