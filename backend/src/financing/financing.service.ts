import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinancingDto } from './dto/create-financing.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class FinancingService {
  constructor(private prisma: PrismaService) {}

  async createFinancing(agencyId: string, dto: CreateFinancingDto) {
    const financing = await this.prisma.financing.create({
      data: {
        agencyId,
        vehicleId: dto.vehicleId,
        clientId: dto.clientId,
        financier: dto.financier,
        amount: new Decimal(dto.amount),
        installments: dto.installments,
        interestRate: dto.interestRate
          ? new Decimal(dto.interestRate)
          : null,
        status: dto.status,
        applicationDate: new Date(dto.applicationDate),
        approvalDate: dto.approvalDate ? new Date(dto.approvalDate) : null,
        notes: dto.notes,
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
        client: true,
      },
    });

    return financing;
  }

  async getFinancings(
    agencyId: string,
    status?: string,
    vehicleId?: string,
    clientId?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { agencyId };

    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (clientId) where.clientId = clientId;

    const [financings, total] = await Promise.all([
      this.prisma.financing.findMany({
        where,
        include: {
          vehicle: {
            include: { photos: { take: 1, orderBy: { order: 'asc' } } },
          },
          client: true,
        },
        skip,
        take: limit,
        orderBy: { applicationDate: 'desc' },
      }),
      this.prisma.financing.count({ where }),
    ]);

    return {
      data: financings,
      total,
      page,
      limit,
    };
  }

  async getFinancing(id: string, agencyId: string) {
    const financing = await this.prisma.financing.findFirst({
      where: { id, agencyId },
      include: {
        vehicle: {
          include: { photos: true },
        },
        client: true,
      },
    });

    if (!financing) {
      throw new NotFoundException('Financiamiento no encontrado');
    }

    return financing;
  }

  async updateFinancing(
    id: string,
    agencyId: string,
    dto: Partial<CreateFinancingDto>,
  ) {
    const financing = await this.prisma.financing.findFirst({
      where: { id, agencyId },
    });

    if (!financing) {
      throw new NotFoundException('Financiamiento no encontrado');
    }

    const updated = await this.prisma.financing.update({
      where: { id },
      data: {
        financier: dto.financier,
        amount: dto.amount ? new Decimal(dto.amount) : undefined,
        installments: dto.installments,
        interestRate: dto.interestRate
          ? new Decimal(dto.interestRate)
          : undefined,
        status: dto.status,
        applicationDate: dto.applicationDate
          ? new Date(dto.applicationDate)
          : undefined,
        approvalDate: dto.approvalDate ? new Date(dto.approvalDate) : undefined,
        notes: dto.notes,
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
        client: true,
      },
    });

    return updated;
  }

  async deleteFinancing(id: string, agencyId: string) {
    const financing = await this.prisma.financing.findFirst({
      where: { id, agencyId },
    });

    if (!financing) {
      throw new NotFoundException('Financiamiento no encontrado');
    }

    await this.prisma.financing.delete({
      where: { id },
    });

    return { message: 'Financiamiento eliminado exitosamente' };
  }
}

