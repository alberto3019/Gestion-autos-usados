import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async createClient(agencyId: string, dto: CreateClientDto) {
    const client = await this.prisma.client.create({
      data: {
        agencyId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        address: dto.address,
        notes: dto.notes,
        currentVehicleId: dto.currentVehicleId,
        desiredVehicleId: dto.desiredVehicleId,
        alertEnabled: dto.alertEnabled ?? false,
        alertDays: dto.alertDays,
      },
      include: {
        currentVehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
        desiredVehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    return client;
  }

  async getClients(
    agencyId: string,
    search?: string,
    vehicleId?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { agencyId };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (vehicleId) {
      where.OR = [
        { currentVehicleId: vehicleId },
        { desiredVehicleId: vehicleId },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          currentVehicle: {
            include: { photos: { take: 1, orderBy: { order: 'asc' } } },
          },
          desiredVehicle: {
            include: { photos: { take: 1, orderBy: { order: 'asc' } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      total,
      page,
      limit,
    };
  }

  async getClient(id: string, agencyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, agencyId },
      include: {
        currentVehicle: {
          include: { photos: true, agency: true },
        },
        desiredVehicle: {
          include: { photos: true, agency: true },
        },
        sales: true,
        financings: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async updateClient(
    id: string,
    agencyId: string,
    dto: Partial<CreateClientDto>,
  ) {
    const client = await this.prisma.client.findFirst({
      where: { id, agencyId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const updated = await this.prisma.client.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        address: dto.address,
        notes: dto.notes,
        currentVehicleId: dto.currentVehicleId,
        desiredVehicleId: dto.desiredVehicleId,
        alertEnabled: dto.alertEnabled,
        alertDays: dto.alertDays,
      },
      include: {
        currentVehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
        desiredVehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    return updated;
  }

  async deleteClient(id: string, agencyId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, agencyId },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    await this.prisma.client.delete({
      where: { id },
    });

    return { message: 'Cliente eliminado exitosamente' };
  }

  async getClientsWithAlerts(agencyId: string) {
    const clients = await this.prisma.client.findMany({
      where: {
        agencyId,
        alertEnabled: true,
      },
      include: {
        currentVehicle: true,
        desiredVehicle: true,
      },
    });

    const now = new Date();
    const clientsWithAlerts = clients.filter((client) => {
      if (!client.alertDays) return false;

      const daysSinceLastUpdate = Math.floor(
        (now.getTime() - client.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      return daysSinceLastUpdate >= client.alertDays;
    });

    return clientsWithAlerts;
  }
}

