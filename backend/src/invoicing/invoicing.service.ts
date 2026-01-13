import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class InvoicingService {
  constructor(private prisma: PrismaService) {}

  async getAgencyAfipSettings(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
      select: {
        afipCuit: true,
        afipPointOfSale: true,
        afipCertificate: true,
        afipPrivateKey: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    return {
      afipCuit: agency.afipCuit,
      afipPointOfSale: agency.afipPointOfSale,
      hasCertificate: !!agency.afipCertificate,
      hasPrivateKey: !!agency.afipPrivateKey,
    };
  }

  async updateAgencyAfipSettings(
    agencyId: string,
    data: {
      afipCuit?: string;
      afipPointOfSale?: number;
      afipCertificate?: string;
      afipPrivateKey?: string;
    },
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
        afipCuit: data.afipCuit,
        afipPointOfSale: data.afipPointOfSale,
        afipCertificate: data.afipCertificate,
        afipPrivateKey: data.afipPrivateKey,
      },
    });

    return {
      afipCuit: updated.afipCuit,
      afipPointOfSale: updated.afipPointOfSale,
      hasCertificate: !!updated.afipCertificate,
      hasPrivateKey: !!updated.afipPrivateKey,
    };
  }

  async createInvoice(agencyId: string, dto: CreateInvoiceDto, vehicleId?: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundException('Agencia no encontrada');
    }

    if (!agency.afipCuit || !agency.afipPointOfSale) {
      throw new BadRequestException(
        'La agencia debe configurar sus credenciales AFIP primero',
      );
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    dto.items.forEach((item) => {
      subtotal = subtotal.plus(
        new Decimal(item.unitPrice).times(item.quantity),
      );
    });

    // Calculate taxes (21% IVA in Argentina)
    const taxes = subtotal.times(0.21);
    const total = subtotal.plus(taxes);

    // Get next invoice number
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: {
        agencyId,
        type: dto.type,
        pointOfSale: dto.pointOfSale,
      },
      orderBy: { invoiceNumber: 'desc' },
    });

    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1;

    // TODO: Integrate with AFIP API here
    // For now, we'll create the invoice in draft status
    // In production, you would:
    // 1. Connect to AFIP API using afip.js or similar library
    // 2. Generate CAE (Código de Autorización Electrónico)
    // 3. Set status to 'sent' if successful

    const invoice = await this.prisma.invoice.create({
      data: {
        agencyId,
        type: dto.type,
        pointOfSale: dto.pointOfSale || agency.afipPointOfSale,
        invoiceNumber,
        clientName: dto.clientName,
        clientTaxId: dto.clientTaxId,
        items: dto.items,
        subtotal,
        taxes,
        total,
        currency: dto.currency || 'ARS',
        status: 'draft',
        vehicleId,
      },
      include: {
        vehicle: {
          include: { photos: { take: 1, orderBy: { order: 'asc' } } },
        },
      },
    });

    return invoice;
  }

  async getInvoices(
    agencyId: string,
    status?: string,
    type?: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { agencyId };

    if (status) where.status = status;
    if (type) where.type = type;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          vehicle: {
            include: { photos: { take: 1, orderBy: { order: 'asc' } } },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      total,
      page,
      limit,
    };
  }

  async getInvoice(id: string, agencyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, agencyId },
      include: {
        vehicle: {
          include: { photos: true },
        },
        agency: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    return invoice;
  }

  async deleteInvoice(id: string, agencyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, agencyId },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    if (invoice.status === 'sent') {
      throw new BadRequestException(
        'No se puede eliminar una factura ya enviada',
      );
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Factura eliminada exitosamente' };
  }
}

