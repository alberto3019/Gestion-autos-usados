import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { PdfGenerationService } from './pdf-generation.service';

@Injectable()
export class VehicleInspectionsService {
  constructor(
    private prisma: PrismaService,
    private pdfGenerationService: PdfGenerationService,
  ) {}

  async createInspection(agencyId: string, dto: CreateInspectionDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });

    if (!vehicle || vehicle.agencyId !== agencyId) {
      throw new NotFoundException('Vehículo no encontrado');
    }

    const inspection = await this.prisma.vehicleInspection.create({
      data: {
        vehicleId: dto.vehicleId,
        agencyId,
        inspectorName: dto.inspectorName,
        inspectionDate: new Date(dto.inspectionDate),
        observations: dto.observations,
        status: dto.status,
        data: dto.data || dto.dataRaw || {},
      },
      include: {
        vehicle: {
          include: {
            photos: { take: 1, orderBy: { order: 'asc' } },
            agency: true,
          },
        },
      },
    });

    return inspection;
  }

  async getInspections(agencyId: string, vehicleId?: string) {
    const where: any = { agencyId };
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    const inspections = await this.prisma.vehicleInspection.findMany({
      where,
      include: {
        vehicle: {
          include: {
            photos: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
      orderBy: { inspectionDate: 'desc' },
    });

    return inspections;
  }

  async getInspection(id: string, agencyId: string) {
    const inspection = await this.prisma.vehicleInspection.findFirst({
      where: {
        id,
        agencyId,
      },
      include: {
        vehicle: {
          include: {
            photos: true,
            agency: true,
          },
        },
        agency: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Peritaje no encontrado');
    }

    return inspection;
  }

  async updateInspection(
    id: string,
    agencyId: string,
    data: Partial<CreateInspectionDto>,
  ) {
    const inspection = await this.prisma.vehicleInspection.findFirst({
      where: { id, agencyId },
    });

    if (!inspection) {
      throw new NotFoundException('Peritaje no encontrado');
    }

    const updated = await this.prisma.vehicleInspection.update({
      where: { id },
      data: {
        inspectorName: data.inspectorName,
        inspectionDate: data.inspectionDate
          ? new Date(data.inspectionDate)
          : undefined,
        observations: data.observations,
        status: data.status,
        data: data.data || data.dataRaw,
      },
      include: {
        vehicle: {
          include: {
            photos: true,
            agency: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteInspection(id: string, agencyId: string) {
    const inspection = await this.prisma.vehicleInspection.findFirst({
      where: { id, agencyId },
    });

    if (!inspection) {
      throw new NotFoundException('Peritaje no encontrado');
    }

    await this.prisma.vehicleInspection.delete({
      where: { id },
    });

    return { message: 'Peritaje eliminado exitosamente' };
  }

  async generatePdf(id: string, agencyId: string) {
    const inspection = await this.prisma.vehicleInspection.findFirst({
      where: { id, agencyId },
      include: {
        vehicle: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Peritaje no encontrado');
    }

    // Generate PDF
    const pdfUrl = await this.pdfGenerationService.generateAndSavePdf(
      inspection.data as any,
      {
        brand: inspection.vehicle.brand,
        model: inspection.vehicle.model,
        year: inspection.vehicle.year,
        color: inspection.vehicle.color || undefined,
        licensePlate: inspection.vehicle.licensePlate || undefined,
        kilometers: inspection.vehicle.kilometers,
      },
      {
        inspectorName: inspection.inspectorName,
        inspectionDate: inspection.inspectionDate.toISOString().split('T')[0],
        observations: inspection.observations || undefined,
      },
    );

    // Update inspection with PDF URL
    const updated = await this.prisma.vehicleInspection.update({
      where: { id },
      data: { pdfUrl },
    });

    return { pdfUrl: updated.pdfUrl };
  }
}

