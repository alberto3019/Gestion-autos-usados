import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { TransactionCategory, Currency } from '@prisma/client';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class BalanceHelperService {
  constructor(
    private prisma: PrismaService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * Convierte un monto a ARS usando el tipo de cambio del día
   */
  private async convertToArs(amount: Decimal, currency: Currency): Promise<Decimal> {
    if (currency === 'ARS') {
      return amount;
    }
    
    const usdRate = await this.exchangeRateService.getUsdRate();
    
    if (currency === 'USD') {
      return amount.times(usdRate);
    }
    
    // EUR aproximado
    if (currency === 'EUR') {
      return amount.times(usdRate).times(1.1);
    }
    
    return amount;
  }

  /**
   * Actualiza el balance de un vehículo automáticamente basado en transacciones de cashflow
   */
  async updateBalanceFromCashflow(
    vehicleId: string,
    category: TransactionCategory,
    amount: Decimal,
    currency: Currency = 'ARS',
  ) {
    // Convertir a ARS antes de guardar
    const amountInArs = await this.convertToArs(amount, currency);
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
          purchasePrice: amountInArs,
        },
      });
    }
    // Si es un gasto relacionado al vehículo (servicio, mantenimiento, etc.), sumar a investment
    else if (
      category === 'service' ||
      category === 'maintenance' ||
      category === 'other'
    ) {
      const newInvestment = balance.investment.plus(amountInArs);
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
  async updateBalanceFromSale(vehicleId: string, salePrice: Decimal, currency: Currency = 'ARS') {
    // Convertir a ARS antes de guardar
    const salePriceInArs = await this.convertToArs(salePrice, currency);
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
          salePrice: salePriceInArs,
        },
      });
    }

    // Recalcular profit
    return this.recalculateProfit(vehicleId);
  }

  /**
   * Actualiza el salePrice del balance cuando se crea una factura (si aplica)
   */
  async updateBalanceFromInvoice(vehicleId: string, total: Decimal, currency: Currency = 'ARS') {
    // Convertir a ARS antes de guardar
    const totalInArs = await this.convertToArs(total, currency);
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
          salePrice: totalInArs,
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

