import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStockSettingsDto } from './dto/update-stock-settings.dto';

export interface VehicleStockStatus {
  vehicleId: string;
  daysInStock: number;
  status: 'green' | 'yellow' | 'red';
}

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) {}

  async getStockSettings(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        stockYellowDays: true,
        stockRedDays: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    return {
      stockYellowDays: agency.stockYellowDays ?? 60,
      stockRedDays: agency.stockRedDays ?? 90,
    };
  }

  async updateStockSettings(
    agencyId: string,
    dto: UpdateStockSettingsDto,
  ) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const updated = await this.prisma.agency.update({
      where: { id: agencyId },
      data: {
        stockYellowDays: dto.stockYellowDays,
        stockRedDays: dto.stockRedDays,
      },
    });

    return {
      stockYellowDays: updated.stockYellowDays ?? 60,
      stockRedDays: updated.stockRedDays ?? 90,
    };
  }

  async getVehiclesWithStockStatus(
    agencyId: string,
    status?: 'green' | 'yellow' | 'red',
  ) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        stockYellowDays: true,
        stockRedDays: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const yellowDays = agency.stockYellowDays ?? 60;
    const redDays = agency.stockRedDays ?? 90;

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        agencyId,
        status: {
          in: ['available', 'paused'],
        },
      },
      include: {
        photos: {
          take: 1,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();
    const vehiclesWithStatus: Array<
      VehicleStockStatus & {
        vehicle: any;
      }
    > = vehicles
      .map((vehicle) => {
        const daysInStock = Math.floor(
          (now.getTime() - vehicle.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        let stockStatus: 'green' | 'yellow' | 'red';
        if (daysInStock >= redDays) {
          stockStatus = 'red';
        } else if (daysInStock >= yellowDays) {
          stockStatus = 'yellow';
        } else {
          stockStatus = 'green';
        }

        return {
          vehicleId: vehicle.id,
          daysInStock,
          status: stockStatus,
          vehicle,
        };
      })
      .filter((item) => !status || item.status === status);

    return vehiclesWithStatus;
  }

  async getStockStatistics(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        stockYellowDays: true,
        stockRedDays: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    const yellowDays = agency.stockYellowDays ?? 60;
    const redDays = agency.stockRedDays ?? 90;

    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        agencyId,
        status: {
          in: ['available', 'paused'],
        },
      },
    });

    const now = new Date();
    let greenCount = 0;
    let yellowCount = 0;
    let redCount = 0;

    vehicles.forEach((vehicle) => {
      const daysInStock = Math.floor(
        (now.getTime() - vehicle.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysInStock >= redDays) {
        redCount++;
      } else if (daysInStock >= yellowDays) {
        yellowCount++;
      } else {
        greenCount++;
      }
    });

    return {
      total: vehicles.length,
      green: greenCount,
      yellow: yellowCount,
      red: redCount,
    };
  }
}

